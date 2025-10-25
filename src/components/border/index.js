import { __experimentalBorderBoxControl as BorderBoxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import createValue from './create-value';
import getValue from './get-value';
const BlockishBorder = ({ label = __('Borders', 'blockish'), value, onChange, ...props }) => {
    const { BlockishResponsive } = window.blockish.components;
    const { useDeviceType } = window.blockish.helpers;
    const device = useDeviceType();
    
    return (
        <div className="blockish-border-control blockish-control blockish-group-control">
            <BlockishResponsive left='46px'>
                <BorderBoxControl
                    label={label}
                    value={getValue(value, device)}
                    onChange={(nextValue) => {
                        onChange(createValue(value, nextValue, device));
                    }}
                    __next40pxDefaultSize={true}
                    {...props}
                />
            </BlockishResponsive>
        </div>
    )
}
export default BlockishBorder;