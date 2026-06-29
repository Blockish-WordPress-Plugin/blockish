import { useEntityProp } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { createPortal } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import { Button, DropdownMenu, MenuGroup, MenuItem } from '@wordpress/components';
import { check, trash } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

const META_KEY = '_blockish_block_schema';

// insertBlocks()/replaceBlocks() expect actual Block objects (clientId +
// normalized attributes + recursively-real innerBlocks), not the plain
// {name, attributes, innerBlocks} JSON we store in meta — createBlock() is
// what produces that real shape.
const schemaNodeToBlock = (node) => {
    if (!node || typeof node !== 'object' || !node.name) {
        return null;
    }

    const innerBlocks = Array.isArray(node.innerBlocks)
        ? node.innerBlocks.map(schemaNodeToBlock).filter(Boolean)
        : [];

    return createBlock(node.name, node.attributes || {}, innerBlocks);
};

// Portals directly into the real header settings row (.editor-header__settings)
// instead of Filling into PinnedItems/core. PinnedItems renders inside its own
// nested .interface-pinned-items wrapper, so a flex `order` on our content would
// only reorder us against the Settings toggle button (its only other child) —
// not against View/Preview/Save, which are siblings of .interface-pinned-items,
// not children of it. Being a direct child of .editor-header__settings lets
// `order: -1` move us before everything else in that row.
const useHeaderSettingsNode = () => {
    const [node, setNode] = useState(null);

    useEffect(() => {
        if (node) {
            return;
        }

        const find = () => document.querySelector('.editor-header__settings');
        const existing = find();
        if (existing) {
            setNode(existing);
            return;
        }

        const interval = setInterval(() => {
            const found = find();
            if (found) {
                setNode(found);
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [node]);

    return node;
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

    // Post meta for normal posts/pages
    const [meta, setMeta] = useEntityProp('postType', postType, 'meta');
    
    // Global settings for templates and template parts
    const [stagedTemplate, setStagedTemplate] = useEntityProp('root', 'site', 'blockish_mcp_staged_template');
    const [stagedTemplatePart, setStagedTemplatePart] = useEntityProp('root', 'site', 'blockish_mcp_staged_template_part');

    const { insertBlocks, replaceBlocks } = useDispatch('core/block-editor');

    const { selectedClientId, rootClientId, selectedIndex, topLevelCount } = useSelect((select) => {
        const blockEditor = select('core/block-editor');
        const clientId = blockEditor.getSelectedBlockClientId();

        return {
            selectedClientId: clientId,
            rootClientId: clientId ? blockEditor.getBlockRootClientId(clientId) || undefined : undefined,
            selectedIndex: clientId ? blockEditor.getBlockIndex(clientId) : -1,
            topLevelCount: blockEditor.getBlockOrder().length,
        };
    }, []);

    const headerSettingsNode = useHeaderSettingsNode();

    // Determine pending schema based on post type
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

    if (!headerSettingsNode || !pendingSchema) {
        return null;
    }

    const clearPendingSchema = () => {
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
    };

    const getBlocks = () => {
        try {
            // Options theke asle data already object hobe, meta theke asle JSON string.
            const schema = typeof pendingSchema === 'string' ? JSON.parse(pendingSchema) : pendingSchema;
            const schemaArray = Array.isArray(schema) ? schema : [schema];
            return schemaArray.map(schemaNodeToBlock).filter(Boolean);
        } catch (e) {
            console.error('Schema parse korte somossa hoyeche:', e);
            return [];
        }
    };

    // A click on any of these is itself the approval — undo is always one
    // Ctrl/Cmd+Z away in the editor, so there's no need for a separate confirm step.
    const runAndClear = (action) => {
        const blocks = getBlocks();
        if (blocks.length) {
            action(blocks);
        }
        clearPendingSchema();
    };

    const appendToEnd = () => runAndClear((blocks) => insertBlocks(blocks, topLevelCount, undefined));
    const insertBefore = () => runAndClear((blocks) => insertBlocks(blocks, selectedIndex, rootClientId));
    const insertAfter = () => runAndClear((blocks) => insertBlocks(blocks, selectedIndex + 1, rootClientId));
    const replaceSelected = () => runAndClear((blocks) => replaceBlocks(selectedClientId, blocks));

    const handleCancel = () => clearPendingSchema();

    return createPortal(
        <div className="blockish-mcp-ai-pending-actions">
            {selectedClientId ? (
                <DropdownMenu
                    className="blockish-mcp-ai-approve"
                    icon={check}
                    label={__('Approve AI Layout', 'blockish')}
                >
                    {({ onClose }) => (
                        <MenuGroup>
                            <MenuItem onClick={() => { insertBefore(); onClose(); }}>
                                {__('Insert before selected block', 'blockish')}
                            </MenuItem>
                            <MenuItem onClick={() => { insertAfter(); onClose(); }}>
                                {__('Insert after selected block', 'blockish')}
                            </MenuItem>
                            <MenuItem onClick={() => { replaceSelected(); onClose(); }}>
                                {__('Replace selected block', 'blockish')}
                            </MenuItem>
                            <MenuItem onClick={() => { appendToEnd(); onClose(); }}>
                                {__('Add to end of content', 'blockish')}
                            </MenuItem>
                        </MenuGroup>
                    )}
                </DropdownMenu>
            ) : (
                <Button
                    className="blockish-mcp-ai-approve"
                    icon={check}
                    label={__('Approve AI Layout', 'blockish')}
                    onClick={appendToEnd}
                />
            )}
            <Button
                className="blockish-mcp-ai-cancel"
                icon={trash}
                label={__('Cancel AI Layout', 'blockish')}
                onClick={handleCancel}
            />
        </div>,
        headerSettingsNode
    );
};

export default ApplyPendingSchema;
