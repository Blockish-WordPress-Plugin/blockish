import { useEntityProp } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useCallback } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';

const META_KEY = '_blockish_block_schema';

const schemaNodeToBlock = (node) => {
    if (!node || typeof node !== 'object' || !node.name) {
        return null;
    }

    const innerBlocks = Array.isArray(node.innerBlocks)
        ? node.innerBlocks.map(schemaNodeToBlock).filter(Boolean)
        : [];

    return createBlock(node.name, node.attributes || {}, innerBlocks);
};

// Recursive function to find a block by metadata name
const findTargetBlock = (blocks, targetName) => {
    if (!targetName || !blocks || !blocks.length) return null;
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        if (block.attributes?.metadata?.name === targetName) {
            return block;
        }
        if (block.innerBlocks && block.innerBlocks.length > 0) {
            const found = findTargetBlock(block.innerBlocks, targetName);
            if (found) return found;
        }
    }
    return null;
};

const ApplyPendingSchema = () => {
    const { postType, slug, isTemplateOrPart } = useSelect((select) => {
        // Post/Page Editor
        const editor = select('core/editor');
        const currentPost = editor ? editor.getCurrentPost() : null;
        let type = editor ? editor.getCurrentPostType() : null;
        let currentSlug = currentPost?.slug || currentPost?.post_name;

        // Site Editor (FSE)
        const siteEditor = select('core/edit-site');
        if (!type && siteEditor) {
            type = siteEditor.getEditedPostType();
            currentSlug = siteEditor.getEditedPostId();
            // getEditedPostId usually returns something like "twentytwentyfour//header"
            // We need to extract just the slug part (e.g. "header")
            if (currentSlug && currentSlug.includes('//')) {
                currentSlug = currentSlug.split('//')[1];
            }
        }

        return {
            postType: type,
            slug: currentSlug,
            isTemplateOrPart: type === 'wp_template' || type === 'wp_template_part'
        };
    }, []);

    const [meta, setMeta] = useEntityProp('postType', postType, 'meta');
    const [stagedTemplate, setStagedTemplate] = useEntityProp('root', 'site', 'blockish_mcp_staged_template');
    const [stagedTemplatePart, setStagedTemplatePart] = useEntityProp('root', 'site', 'blockish_mcp_staged_template_part');

    const { insertBlocks } = useDispatch('core/block-editor');

    const { getBlocks, getBlockIndex, getBlockRootClientId, getBlockOrder } = useSelect((select) => {
        const editor = select('core/block-editor');
        return {
            getBlocks: editor.getBlocks,
            getBlockIndex: editor.getBlockIndex,
            getBlockRootClientId: editor.getBlockRootClientId,
            getBlockOrder: editor.getBlockOrder,
        };
    }, []);

    let pendingSchema = null;
    if (isTemplateOrPart) {
        if (postType === 'wp_template') {
            pendingSchema = stagedTemplate?.[slug];
        } else {
            pendingSchema = stagedTemplatePart?.[slug];
        }
    } else {
        pendingSchema = meta && meta[META_KEY] ? meta[META_KEY] : null;
    }

    const clearPendingSchema = useCallback(() => {
        if (postType === 'wp_template') {
            const newData = { ...stagedTemplate };
            delete newData[slug];
            setStagedTemplate(newData);
        } else if (postType === 'wp_template_part') {
            const newData = { ...stagedTemplatePart };
            delete newData[slug];
            setStagedTemplatePart(newData);
        } else {
            setMeta({ ...meta, [META_KEY]: '' });
        }
    }, [postType, slug, stagedTemplate, stagedTemplatePart, meta, setStagedTemplate, setStagedTemplatePart, setMeta]);

    const getParsedBlocks = useCallback(() => {
        if (!pendingSchema) return [];
        try {
            const schema = typeof pendingSchema === 'string' ? JSON.parse(pendingSchema) : pendingSchema;
            const schemaArray = Array.isArray(schema) ? schema : [schema];
            return schemaArray.map(schemaNodeToBlock).filter(Boolean);
        } catch (e) {
            console.error('Schema parse error:', e);
            return [];
        }
    }, [pendingSchema]);

    useEffect(() => {
        if (!pendingSchema) {
            return;
        }

        const aiBlocks = getParsedBlocks();
        if (!aiBlocks.length) return;

        let hasInjected = false;
        let targetName = aiBlocks[0]?.attributes?.metadata?.name;

        const tryInject = (force = false) => {
            if (hasInjected) return;

            const allEditorBlocks = getBlocks();
            let targetBlock = null;

            if (targetName) {
                targetBlock = findTargetBlock(allEditorBlocks, targetName);
            }

            // If we are not forcing, and we have a targetName but it's not loaded in the editor yet, wait!
            // This perfectly avoids the race condition where Gutenberg hasn't finished fetching the template.
            if (!force && targetName && !targetBlock) {
                return;
            }

            // Ensure the DOM canvas is ready to receive inserts
            const canvas = document.querySelector('.block-editor-block-list__layout');
            const iframe = document.querySelector('iframe[name="editor-canvas"]');
            let isDomReady = false;
            if (iframe) {
                isDomReady = !!iframe.contentDocument?.querySelector('.block-editor-block-list__layout');
            } else if (canvas) {
                isDomReady = true;
            }

            if (!isDomReady) {
                return; // Wait for canvas to mount
            }

            hasInjected = true;
            
            const wrapperBlock = createBlock('blockish/ai-preview', {
                targetClientId: targetBlock ? targetBlock.clientId : ''
            }, aiBlocks);

            if (targetBlock) {
                const targetRoot = getBlockRootClientId(targetBlock.clientId);
                const targetIndex = getBlockIndex(targetBlock.clientId);
                insertBlocks([wrapperBlock], targetIndex + 1, targetRoot);
            } else {
                const topLevelCount = getBlockOrder().length;
                insertBlocks([wrapperBlock], topLevelCount, undefined);
            }
            
            clearPendingSchema();
        };

        const { subscribe } = window.wp.data;
        const unsubscribe = subscribe(() => {
            tryInject(false);
        });

        // Fallback timer: If after 2 seconds the target block still hasn't appeared 
        // (e.g. it was deleted, hallucinated, or it's a completely blank new post), force inject.
        const fallbackTimer = setTimeout(() => {
            tryInject(true);
        }, 2000);

        return () => {
            unsubscribe();
            clearTimeout(fallbackTimer);
        };
    }, [pendingSchema, getParsedBlocks, getBlocks, getBlockIndex, getBlockRootClientId, getBlockOrder, insertBlocks, clearPendingSchema]);

    // The component itself renders nothing to the DOM now. 
    // The UI is entirely handled by the blockish/ai-preview block.
    return null;
};

export default ApplyPendingSchema;
