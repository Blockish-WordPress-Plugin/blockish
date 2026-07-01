import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

registerBlockType('blockish/ai-preview', {
    title: __('AI Preview Wrapper', 'blockish'),
    category: 'design',
    icon: 'admin-appearance',
    supports: {
        inserter: false, // Hide from the block inserter
        html: false,     // Disable HTML editing
        reusable: false,
    },
    attributes: {
        targetClientId: {
            type: 'string',
            default: ''
        }
    },
    edit: (props) => {
        const { clientId, attributes: { targetClientId } } = props;
        
        const { removeBlocks, replaceBlocks } = useDispatch('core/block-editor');
        const { getBlock } = useSelect((select) => select('core/block-editor'), []);

        const blockProps = useBlockProps({
            className: 'blockish-ai-preview-wrapper',
        });

        const handleApprove = () => {
            const block = getBlock(clientId);
            if (block && block.innerBlocks) {
                if (targetClientId) {
                    removeBlocks([targetClientId]);
                }
                // Unwrap the block, leaving the AI blocks behind
                replaceBlocks(clientId, block.innerBlocks);
            }
        };

        const handleReject = () => {
            // Remove the block and its contents
            removeBlocks([clientId]);
        };

        return (
            <div { ...blockProps }>
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
                <InnerBlocks />
            </div>
        );
    },
    save: () => {
        // Just render the inner blocks if accidentally saved
        return <InnerBlocks.Content />;
    },
});
