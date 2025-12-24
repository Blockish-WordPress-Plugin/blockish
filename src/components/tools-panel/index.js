import {
    __experimentalToolsPanel as ToolsPanel,
    __experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { memo } from '@wordpress/element';

const BlockishToolsPanel = ({
    label,
    items = [],
    resetAll,
    ...props
}) => {
    return (
        <ToolsPanel label={label} resetAll={resetAll} {...props}>
            {items.map((item, index) => (
                <ToolsPanelItem
                    key={item?.slug || index}
                    label={item?.label}
                    hasValue={item?.hasValue}
                    onDeselect={item?.onDeselect}
                    isShownByDefault={item?.isShownByDefault}
                    panelId={item?.panelId}
                    {...item?.props}
                >
                    {item?.children}
                </ToolsPanelItem>
            ))}
        </ToolsPanel>
    );
};

export default memo(BlockishToolsPanel);