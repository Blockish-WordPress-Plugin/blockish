import { useEntityProp } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useCallback } from '@wordpress/element';
import { createBlock, getBlockType, serialize } from '@wordpress/blocks';

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

/**
 * Serialize a block tree to a lightweight JSON-serializable snapshot.
 * We store name, attributes, and innerBlocks (recursively).
 */
const blockToSnapshot = (block) => {
    return {
        name: block.name,
        attributes: block.attributes,
        innerBlocks: (block.innerBlocks || []).map(blockToSnapshot),
    };
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

    const { insertBlocks, removeBlocks } = useDispatch('core/block-editor');

    const { getBlocks, getBlockOrder } = useSelect((select) => {
        const editor = select('core/block-editor');
        return {
            getBlocks: editor.getBlocks,
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

        const tryInject = (force = false) => {
            if (hasInjected) return;

            // Ensure the DOM canvas is ready to receive inserts
            const canvas = document.querySelector('.block-editor-block-list__layout');
            const iframe = document.querySelector('iframe[name="editor-canvas"]');
            let isDomReady = false;
            if (iframe) {
                isDomReady = !!iframe.contentDocument?.querySelector('.block-editor-block-list__layout');
            } else if (canvas) {
                isDomReady = true;
            }

            if (!isDomReady && !force) {
                return;
            }

            const allEditorBlocks = getBlocks();

            // If editor blocks haven't loaded yet and we're not forcing, wait.
            if (!force && allEditorBlocks.length === 0) {
                return;
            }

            hasInjected = true;

            // 1. Snapshot the current editor content into a serializable array
            const previousBlocksSnapshot = allEditorBlocks.map(blockToSnapshot);

            // 2. Create the AI preview wrapper, carrying the snapshot as an attribute
            const wrapperBlock = createBlock(
                'blockish/ai-preview',
                {
                    previousBlocks: JSON.stringify(previousBlocksSnapshot),
                },
                aiBlocks
            );

            // 3. Remove all existing top-level blocks
            const allClientIds = allEditorBlocks.map(b => b.clientId);
            if (allClientIds.length > 0) {
                removeBlocks(allClientIds);
            }

            // 4. Insert the AI preview block
            insertBlocks([wrapperBlock], 0, undefined);

            clearPendingSchema();
        };

        const { subscribe } = window.wp.data;
        const unsubscribe = subscribe(() => {
            tryInject(false);
        });

        // Fallback timer: force inject after 2 seconds if the editor still appears empty.
        const fallbackTimer = setTimeout(() => {
            tryInject(true);
        }, 2000);

        return () => {
            unsubscribe();
            clearTimeout(fallbackTimer);
        };
    }, [pendingSchema, getParsedBlocks, getBlocks, getBlockOrder, insertBlocks, removeBlocks, clearPendingSchema]);

    // This component renders nothing — UI is handled by blockish/ai-preview block.
    return null;
};

export default ApplyPendingSchema;
