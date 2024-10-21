import { TabPanel } from '@wordpress/components';
import clsx from 'clsx';
import { select } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import BeforeTabContent from './before-tab-content';
import AfterTabContent from './after-tab-content';

/**
 * BoilerplateTab Component
 * 
 * Renders a tab panel that conditionally displays additional content 
 * based on the selected block and tab type. It integrates `BeforeTabContent` 
 * and `AfterTabContent` when the tab type is 'top-level'.
 * 
 * @param {Array} tabs - Array of tabs to be displayed in the panel.
 * @param {string} type - Tab type (default: 'normal'). Can trigger different content behavior.
 * @param {Function} children - Render prop function to display tab content.
 * @param {Object} props - Additional props for the TabPanel component.
 */
const BoilerplateTab = ({ tabs = [], type = 'normal', children, ...props }) => {
    const { getSelectedBlock } = select(blockEditorStore);

    // Get the selected block's details (name, clientId)
    const selectedBlock = getSelectedBlock();
    const blockName = selectedBlock?.name;
    const clientId = selectedBlock?.clientId;

    return (
        <TabPanel
            className={clsx('boilerplate-tab', { [`boilerplate-tab-${type}`]: type })}
            activeClass="boilerplate-tab-active"
            tabs={tabs}
            {...props}
        >
            {({ name: tabName }) => (
                <>
                    {/* Render content before tab when type is 'top-level' */}
                    {type === 'top-level' && (
                        <BeforeTabContent blockName={blockName} clientId={clientId} tabName={tabName} />
                    )}

                    {/* Render children (tab content) */}
                    {children({ name: tabName })}

                    {/* Render content after tab when type is 'top-level' */}
                    {type === 'top-level' && (
                        <AfterTabContent blockName={blockName} clientId={clientId} tabName={tabName} />
                    )}
                </>
            )}
        </TabPanel>
    );
};

export default BoilerplateTab;
