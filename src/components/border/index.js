import { __experimentalBorderBoxControl as BorderBoxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import createValue from './create-value';
import getValue from './get-value';
import BlockishControlLabel from '../reset-button/control-label';

const hasBorderValue = (value) => {
    if (!value) {
        return false;
    }

    try {
        const parsed = typeof value === 'string' ? JSON.parse(value) : value;
        if (!parsed || typeof parsed !== 'object') {
            return false;
        }

        return Object.keys(parsed).length > 0;
    } catch {
        return false;
    }
};

const BlockishBorder = ({ label = __('Borders', 'blockish'), value, onChange, showReset = true, ...props }) => {
    const { BlockishResponsive } = window.blockish.components;
    const { useDeviceType } = window.blockish.helpers;
    const device = useDeviceType();
    
    return (
        <div className="blockish-border-control blockish-control blockish-group-control">
            <BlockishResponsive left='46px'>
                <BlockishControlLabel
                    label={label}
                    showReset={showReset}
                    hasValue={hasBorderValue(value)}
                    onReset={() => onChange('')}
                    resetLabel={__('Reset border', 'blockish')}
                />
                <BorderBoxControl
                    value={getValue(value, device)}
                    onChange={(nextValue) => {
                        onChange(createValue(value, nextValue, device));
                    }}
                    {...props}
                />
            </BlockishResponsive>
        </div>
    )
}
export default BlockishBorder;
