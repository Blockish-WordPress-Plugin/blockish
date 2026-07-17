import { useEntityProp } from '@wordpress/core-data';
import { useSelect, useDispatch, resolveSelect, dispatch, subscribe } from '@wordpress/data';
import { useEffect, useCallback } from '@wordpress/element';
import { createBlock, serialize } from '@wordpress/blocks';

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
        let postId = editor ? editor.getCurrentPostId() : null;
        let currentSlug = currentPost?.slug || currentPost?.post_name || postId;

        if (currentSlug && typeof currentSlug === 'string' && currentSlug.includes('//')) {
            currentSlug = currentSlug.split('//')[1];
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

    const { insertBlocks, removeBlocks, replaceBlocks } = useDispatch('core/block-editor');

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

    const resolvePatterns = async (schemaNode) => {
        if (!schemaNode) return;
        
        if (Array.isArray(schemaNode)) {
            await Promise.all(schemaNode.map(resolvePatterns));
            return;
        }

        if (typeof schemaNode === 'object') {
            if (schemaNode.name === 'core/block' && schemaNode.attributes && schemaNode.attributes.ref) {
                const ref = schemaNode.attributes.ref;
                try {
                    // Fetch the wp_block post
                    const record = await resolveSelect('core').getEntityRecord('postType', 'wp_block', ref);
                    
                    if (record && record.meta && record.meta['_blockish_block_schema']) {
                        const pendingJson = record.meta['_blockish_block_schema'];
                        const parsed = typeof pendingJson === 'string' ? JSON.parse(pendingJson) : pendingJson;
                        const parsedArray = Array.isArray(parsed) ? parsed : [parsed];
                        
                        // RECURSIVELY resolve any nested patterns inside this pattern!
                        await Promise.all(parsedArray.map(resolvePatterns));
                        
                        // Convert pending schema to raw blocks
                        const blocks = parsedArray.map(schemaNodeToBlock).filter(Boolean);
                        
                        // Serialize blocks to raw HTML
                        const html = serialize(blocks);
                        
                        // Save it directly via dispatch
                        await dispatch('core').saveEntityRecord('postType', 'wp_block', {
                            id: ref,
                            content: html,
                            meta: {
                                '_blockish_block_schema': '' // clear the pending schema
                            }
                        });
                        console.log(`Blockish AI: Auto-resolved and saved pattern ${ref}`);
                    }
                } catch (e) {
                    console.error('Blockish AI: Failed to resolve pattern', ref, e);
                }
            }

            // Recursively check innerBlocks
            if (schemaNode.innerBlocks && Array.isArray(schemaNode.innerBlocks)) {
                await Promise.all(schemaNode.innerBlocks.map(resolvePatterns));
            }
        }
    };

    useEffect(() => {
        if (!pendingSchema) {
            return;
        }

        let isCancelled = false;
        let aiBlocks = [];
        let hasInjected = false;
        let isProcessing = false;

        const processAndInject = async (force = false) => {
            if (hasInjected || isProcessing) return;

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

            isProcessing = true;

            if (!aiBlocks.length) {
                try {
                    const schema = typeof pendingSchema === 'string' ? JSON.parse(pendingSchema) : pendingSchema;
                    const schemaArray = Array.isArray(schema) ? schema : [schema];
                    
                    // Resolve all patterns asynchronously before building the blocks
                    await resolvePatterns(schemaArray);
                    
                    if (isCancelled) return;
                    
                    aiBlocks = schemaArray.map(schemaNodeToBlock).filter(Boolean);
                } catch (e) {
                    console.error('Blockish AI Schema parse error:', e);
                    isProcessing = false;
                    return;
                }
            }

            if (!aiBlocks.length) {
                isProcessing = false;
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

            // 3. Replace all existing top-level blocks with the wrapper
            // Using replaceBlocks bypasses the core/post-content removal warning
            const allClientIds = allEditorBlocks.map(b => b.clientId);
            if (allClientIds.length > 0) {
                replaceBlocks(allClientIds, [wrapperBlock]);
            } else {
                insertBlocks([wrapperBlock], 0, undefined);
            }

            clearPendingSchema();
        };


        const unsubscribe = subscribe(() => {
            processAndInject(false);
        });

        // Fallback timer: force inject after 2 seconds if the editor still appears empty.
        const fallbackTimer = setTimeout(() => {
            processAndInject(true);
        }, 2000);

        return () => {
            isCancelled = true;
            unsubscribe();
            clearTimeout(fallbackTimer);
        };
    }, [pendingSchema, getBlocks, getBlockOrder, insertBlocks, removeBlocks, clearPendingSchema]);

    // This component renders nothing — UI is handled by blockish/ai-preview block.
    return null;
};

export default ApplyPendingSchema;
