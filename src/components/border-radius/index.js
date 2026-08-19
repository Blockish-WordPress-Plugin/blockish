import { __experimentalBorderRadiusControl as BorderRadiusControl } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import BlockishResetButton from '../reset-button';

const hasRadiusValue = (value) => {
    if (!value) {
        return false;
    }

    if (typeof value === 'string') {
        return value !== '';
    }

    if (typeof value !== 'object') {
        return false;
    }

    return Object.values(value).some((side) => !!side);
};

const BlockishBorderRadius = ({ value, onChange, label, showReset = true, ...props }) => {
    return (
        <div className="blockish-border-radius-control blockish-control">
            {showReset && (
                <BlockishResetButton
                    className="blockish-border-radius-reset"
                    onClick={() => onChange(undefined)}
                    disabled={!hasRadiusValue(value)}
                    label={__('Reset border radius', 'blockish')}
                />
            )}
            <BorderRadiusControl
                values={value}
                onChange={onChange}
                { ...props }
            />
        </div>
    );
}

export default BlockishBorderRadius;
