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
        const editor = select('core/editor');
        const currentPost = editor.getCurrentPost();
        const type = editor.getCurrentPostType();
        return {
            postType: type,
            slug: currentPost?.slug || currentPost?.post_name,
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

        let targetName = aiBlocks[0]?.attributes?.metadata?.name;
        let targetBlock = null;

        if (targetName) {
            const allEditorBlocks = getBlocks();
            targetBlock = findTargetBlock(allEditorBlocks, targetName);
        }

        // Wrap the incoming blocks in our custom preview block instead of core/group
        const wrapperBlock = createBlock('blockish/ai-preview', {
            targetClientId: targetBlock ? targetBlock.clientId : ''
        }, aiBlocks);

        if (targetBlock) {
            const targetRoot = getBlockRootClientId(targetBlock.clientId);
            const targetIndex = getBlockIndex(targetBlock.clientId);
            
            // Insert AFTER the target block to show side-by-side preview
            insertBlocks([wrapperBlock], targetIndex + 1, targetRoot);
        } else {
            // Append to end
            const topLevelCount = getBlockOrder().length;
            insertBlocks([wrapperBlock], topLevelCount, undefined);
        }
        
        // Immediately clear the schema from DB/Meta so we don't re-inject on next load
        clearPendingSchema();

    }, [pendingSchema, getParsedBlocks, getBlocks, getBlockIndex, getBlockRootClientId, getBlockOrder, insertBlocks, clearPendingSchema]);

    // The component itself renders nothing to the DOM now. 
    // The UI is entirely handled by the blockish/ai-preview block.
    return null;
};

export default ApplyPendingSchema;
