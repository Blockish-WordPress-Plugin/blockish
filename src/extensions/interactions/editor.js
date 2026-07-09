import { createHigherOrderComponent } from '@wordpress/compose';
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { Button, Icon } from '@wordpress/components';
import { trash } from '@wordpress/icons';

const InteractionsPanel = ({ clientId }) => {
    const { useExtensionsAttributes } = window?.blockish?.helpers || {};
    const BlockishControl = window?.blockish?.controls?.BlockishControl;

    if (!BlockishControl || !useExtensionsAttributes) return null;

    const { attributes, setAttributes } = useExtensionsAttributes(clientId);
    const interactions = attributes?.interactionData || [];

    const handleDelete = (idToDelete) => {
        setAttributes({
            interactionData: interactions.filter(interaction => interaction.id !== idToDelete)
        });
    };

    return (
        <BlockishControl 
            type="BlockishPanelBody" 
            title={__('Interactions', 'blockish')} 
            initialOpen={false}
        >
            <div className="blockish-interactions-panel">
                <p style={{ fontSize: '12px', marginBottom: '15px' }}>
                    {__('Interactions (animations and event listeners) are generated and managed by the AI. You can view and delete them here, but not edit them directly. To add an interaction, ask the AI!', 'blockish')}
                </p>

                {interactions.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: '#757575', fontSize: '12px' }}>
                        {__('No interactions set for this block.', 'blockish')}
                    </p>
                ) : (
                    <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                        {interactions.map((interaction, index) => (
                            <li key={interaction.id || index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0f0f0', padding: '8px', marginBottom: '8px', borderRadius: '4px' }}>
                                <div>
                                    <strong style={{ fontSize: '12px', display: 'block' }}>{interaction.event || 'Event'}</strong>
                                    {interaction.selector && (
                                        <span style={{ fontSize: '10px', color: '#555' }}>Target: {interaction.selector}</span>
                                    )}
                                </div>
                                <Button 
                                    icon={<Icon icon={trash} />} 
                                    isDestructive 
                                    size="small" 
                                    onClick={() => handleDelete(interaction.id)}
                                    title={__('Delete Interaction', 'blockish')}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </BlockishControl>
    );
};

const Inspector = createHigherOrderComponent((WrappedComponent) => {
    return (props) => {
        const { tabName, blockName, clientId } = props;
        
        // Only run on the Advanced tab and only for blockish blocks
        if (tabName !== 'advanced' || !blockName || !blockName.startsWith('blockish')) {
            return <WrappedComponent {...props} />;
        }

        return (
            <>
                <WrappedComponent {...props} />
                <InteractionsPanel clientId={clientId} />
            </>
        );
    };
}, 'withInteractionsInspector');

addFilter(
    'blockish.tabs.after-tab-content',
    'blockish/interactions-inspector',
    Inspector,
    20 // Run after other plugins
);
