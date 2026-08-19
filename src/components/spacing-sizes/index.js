import { __experimentalSpacingSizesControl as SpacingSizesControl } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import BlockishResetButton from '../reset-button';

const hasSpacingValue = (value) => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    return ['top', 'right', 'bottom', 'left'].some((side) => !!value[side]);
};

const BlockishSpacingSizes = ({ label, value, onChange, showReset = true, ...props }) => {
    const controlLabel = label || __('Spacing', 'blockish');

    return (
        <div className="blockish-spacing-sizes-control blockish-control">
            {showReset && (
                <BlockishResetButton
                    className="blockish-spacing-sizes-reset"
                    onClick={() => onChange(undefined)}
                    disabled={!hasSpacingValue(value)}
                    label={__('Reset spacing', 'blockish')}
                />
            )}
            <SpacingSizesControl 
                label={controlLabel}
                values={value}
                onChange={onChange}
                {...props}
            />
        </div>
    )
};
export default BlockishSpacingSizes;
