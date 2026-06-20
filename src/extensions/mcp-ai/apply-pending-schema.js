import { useEntityProp } from '@wordpress/core-data';
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { createPortal } from '@wordpress/element';
import { createBlock } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { check, trash } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

const META_KEY = '_blockish_block_schema';

// insertBlocks() expects actual Block objects (clientId + normalized attributes
// + recursively-real innerBlocks), not the plain {name, attributes, innerBlocks}
// JSON we store in meta — createBlock() is what produces that real shape.
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
    const postType = useSelect((select) => select('core/editor').getCurrentPostType(), []);
    const [meta, setMeta] = useEntityProp('postType', postType, 'meta');
    const { insertBlocks } = useDispatch('core/block-editor');

    const headerSettingsNode = useHeaderSettingsNode();
    const pendingSchema = meta && meta[META_KEY] ? meta[META_KEY] : null;

    if (!headerSettingsNode || !pendingSchema) {
        return null;
    }

    const clearPendingSchema = () => setMeta({ ...meta, [META_KEY]: '' });

    const handleApprove = () => {
        try {
            const schema = JSON.parse(pendingSchema);
            const schemaArray = Array.isArray(schema) ? schema : [schema];
            const blocks = schemaArray.map(schemaNodeToBlock).filter(Boolean);

            if (!blocks.length) {
                clearPendingSchema();
                return;
            }

            insertBlocks(blocks);
            clearPendingSchema();
        } catch (e) {
            console.error(e);
        }
    };

    const handleCancel = () => {
        try {
            clearPendingSchema();
        } catch (e) {
            console.error(e);
        }
    };


    return createPortal(
        <div className="blockish-mcp-ai-pending-actions">
            <Button
                className="blockish-mcp-ai-approve"
                icon={check}
                label={__('Approve AI Layout', 'blockish')}
                onClick={handleApprove}
            />
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
