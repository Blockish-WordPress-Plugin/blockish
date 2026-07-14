import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, useInnerBlocksProps } from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { createBlock } from '@wordpress/blocks';

const schemaNodeToBlock = (node) => {
    if (!node || typeof node !== 'object' || !node.name) return null;
    const innerBlocks = Array.isArray(node.innerBlocks)
        ? node.innerBlocks.map(schemaNodeToBlock).filter(Boolean)
        : [];
    return createBlock(node.name, node.attributes || {}, innerBlocks);
};

registerBlockType('blockish/ai-preview', {
    title: __('AI Preview Wrapper', 'blockish'),
    apiVersion: 3,
    category: 'design',
    icon: 'admin-appearance',
    supports: {
        inserter: false,
        html: false,
        reusable: false,
    },
    attributes: {
        /**
         * JSON string — a snapshot of the blocks that existed in the editor
         * BEFORE the AI preview was injected. Used by Discard to restore the
         * previous state.
         */
        previousBlocks: {
            type: 'string',
            default: ''
        }
    },
    edit: (props) => {
        const { clientId, attributes: { previousBlocks } } = props;

        const { removeBlocks, replaceBlocks } = useDispatch('core/block-editor');
        const innerBlockProps = useInnerBlocksProps({
            className: 'blockish-ai-preview-inner-blocks is-root-container is-layout-constrained',
        });

        /**
         * Accept: unwrap the inner blocks (the AI-generated content) in place
         * of this wrapper. The previousBlocks snapshot is simply discarded.
         */
        const handleApprove = useCallback(() => {
            const block = window.wp.data.select('core/block-editor').getBlock(clientId);
            if (block && block.innerBlocks.length > 0) {
                replaceBlocks([clientId], block.innerBlocks);
            } else {
                removeBlocks([clientId]);
            }
        }, [clientId, replaceBlocks, removeBlocks]);

        /**
         * Discard: restore the editor to its state before the AI preview was
         * injected by recreating blocks from the previousBlocks snapshot, then
         * removing this wrapper.
         */
        const handleReject = useCallback(() => {
            if (previousBlocks) {
                try {
                    const snapshot = JSON.parse(previousBlocks);
                    const restoredBlocks = snapshot.map(schemaNodeToBlock).filter(Boolean);
                    if (restoredBlocks.length > 0) {
                        replaceBlocks([clientId], restoredBlocks);
                        return;
                    }
                } catch (e) {
                    console.error('Blockish: failed to parse previousBlocks snapshot', e);
                }
            }
            // If no previous blocks to restore, just remove the preview wrapper
            removeBlocks([clientId]);
        }, [clientId, previousBlocks, replaceBlocks, removeBlocks]);

        return (
            <div className='blockish-ai-preview-wrapper alignfull'>
                <div className="blockish-ai-preview-actions">
                    <div className="blockish-ai-button-group">
                        <Button
                            variant="primary"
                            onClick={handleApprove}
                        >
                            <span>{__('Accept', 'blockish')}</span>
                        </Button>
                        <Button
                            variant="secondary"
                            isDestructive
                            onClick={handleReject}
                        >
                            <span>{__('Discard', 'blockish')}</span>
                        </Button>
                    </div>
                </div>
                <div {...innerBlockProps}></div>
            </div>
        );
    },
    save: () => {
        const innerBlockProps = useInnerBlocksProps.save();
        return <div {...innerBlockProps}></div>;
    },
});
