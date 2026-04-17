import { TabPanel } from '@wordpress/components';
import clsx from 'clsx';
import { select } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';
import BeforeTabContent from './before-tab-content';
import AfterTabContent from './after-tab-content';
import { useMemo } from '@wordpress/element';
import BeforeTab from './before-tab';

/**
 * BlockishTab Component
 * 
 * Renders a tab panel that conditionally displays additional content 
 * based on the selected block and tab type. It integrates `BeforeTabContent` 
 * and `AfterTabContent` when the tab type is 'top-level'.
 * 
 * @param {Array} tabs - Array of tabs to be displayed in the panel.
 * @param {string} tabType - Tab type (default: 'normal'). Can trigger different content behavior.
 * @param {Function} children - Render prop function to display tab content.
 * @param {Object} props - Additional props for the TabPanel component.
 */
const BlockishTab = ({ tabs = [], tabType = 'normal', children, ...props }) => {
    const { getSelectedBlock } = select(blockEditorStore);

    // Get the selected block's details (name, clientId)
    const selectedBlock = getSelectedBlock();
    const blockName = selectedBlock?.name;
    const clientId = selectedBlock?.clientId;

    const classifiedTabs = useMemo(() => {
        return tabs.map((tab) => {
            return {
                ...tab,
                className: `blockish-tab-${tab?.name}-button blockish-tab-button`,
            };
        })
    }, [tabs]);

    return (
        <>
            {tabType === 'top-level' && (
                <BeforeTab blockName={blockName} clientId={clientId} />
            )}
            <TabPanel
                className={clsx('blockish-tab', { [`blockish-tab-${tabType}`]: tabType })}
                activeClass="blockish-tab-active"
                tabs={classifiedTabs}
                {...props}
            >
                {({ name: tabName }) => (
                    <>
                        {/* Render content before tab when type is 'top-level' */}
                        {tabType === 'top-level' && (
                            <BeforeTabContent blockName={blockName} clientId={clientId} tabName={tabName} />
                        )}

                        {/* Render children (tab content) */}
                        {children({ name: tabName })}

                        {/* Render content after tab when type is 'top-level' */}
                        {tabType === 'top-level' && (
                            <AfterTabContent blockName={blockName} clientId={clientId} tabName={tabName} />
                        )}
                    </>
                )}
            </TabPanel>
        </>
    );
};

export default BlockishTab;
