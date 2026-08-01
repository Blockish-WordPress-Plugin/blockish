import { BlockControls } from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton, Modal, Button, __experimentalVStack as VStack, __experimentalHeading as Heading, __experimentalText as Text, Flex, Icon } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { getBlockType } from '@wordpress/blocks';

const databaseIcon = (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6C4 7.65685 7.58172 9 12 9C16.4183 9 20 7.65685 20 6C20 4.34315 16.4183 3 12 3C7.58172 3 4 4.34315 4 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 6V12C4 13.6569 7.58172 15 12 15C16.4183 15 20 13.6569 20 12V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 12V18C4 19.6569 7.58172 21 12 21C16.4183 21 20 19.6569 20 18V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
);

const SUPPORTED_BLOCKS = [
    'blockish/heading',
    'blockish/paragraph',
    'blockish/button',
    'blockish/image',
    'blockish/video'
];

export default function DynamicityMarketing({ name }) {
    // Only show for supported blocks
    if (!SUPPORTED_BLOCKS.includes(name)) {
        return null;
    }

    // Reliably check if Dynamicity is active by checking if one of its core blocks is registered
    if (getBlockType('blockish-dynamicity/query-builder')) {
        return null;
    }

    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Use the exact same icon from the blockish global icons (fallback to custom SVG if missing)
    const { database } = window?.blockish?.components?.blockIcons || {};
    const iconToUse = database || databaseIcon;

    return (
        <>
            <BlockControls group="block">
                <ToolbarGroup>
                    <ToolbarButton
                        icon={iconToUse}
                        title={__('Dynamic Data (Pro)', 'blockish')}
                        onClick={() => setIsModalOpen(true)}
                        className="blockish-dynamicity-marketing-button"
                    />
                </ToolbarGroup>
            </BlockControls>
            
            {isModalOpen && (
                <Modal
                    title={false}
                    onRequestClose={() => setIsModalOpen(false)}
                    style={{ maxWidth: '420px', padding: 0 }}
                    className="blockish-locked-feature-modal"
                >
                    <VStack spacing={5} style={{ padding: '0 24px 32px', textAlign: 'center' }}>
                        <Flex justify="center" style={{ marginBottom: '8px' }}>
                            <div style={{ 
                                background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', 
                                color: '#fff', 
                                padding: '16px', 
                                borderRadius: '50%',
                                display: 'inline-flex',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                            }}>
                                <Icon icon={iconToUse} size={36} />
                            </div>
                        </Flex>
                        
                        <Heading level={2} style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
                            {__('Unlock Dynamic Data', 'blockish')}
                        </Heading>
                        
                        <Text variant="muted" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                            {__('The ', 'blockish')}
                            <strong style={{ color: 'var(--color-blue-600)' }}>{__('Dynamic Data', 'blockish')}</strong>
                            {__(' feature is available exclusively in the ', 'blockish')}
                            <strong>{__('Blockish Dynamicity', 'blockish')}</strong>
                            {__(' addon. Upgrade now to connect your blocks to dynamic WordPress content and custom fields!', 'blockish')}
                        </Text>
                        
                        <Flex justify="center" gap={3} style={{ marginTop: '16px' }}>
                            <Button 
                                variant="secondary" 
                                onClick={() => setIsModalOpen(false)}
                                style={{ padding: '8px 16px' }}
                            >
                                {__('Maybe Later', 'blockish')}
                            </Button>
                            <Button
                                variant="primary"
                                style={{ padding: '8px 24px' }}
                                onClick={() => {
                                    setIsModalOpen(false);
                                    const addonsUrl = window.blockishGlobalData?.addonsUrl
                                        || (window.blockishGlobalData?.dashboardUrl
                                            ? `${window.blockishGlobalData.dashboardUrl}&route=addons`
                                            : null);
                                    if (addonsUrl) {
                                        window.open(addonsUrl, '_blank');
                                    }
                                }}
                            >
                                {__('Get Dynamicity', 'blockish')}
                            </Button>
                        </Flex>
                    </VStack>
                </Modal>
            )}
        </>
    );
}
