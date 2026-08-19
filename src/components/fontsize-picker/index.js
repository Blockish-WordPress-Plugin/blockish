import { FontSizePicker } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const BlockishFontSizePicker = ({ value, onChange, label, showReset = true, ...props }) => {
    return (
        <div className="blockish-fontsize-picker-control blockish-control">
            <FontSizePicker
                value={value}
                onChange={onChange}
                label={label || __('Font Size', 'blockish')}
                withSlider
                units={['px', 'em', 'rem']}
                {...props}
                withReset={showReset}
            />
        </div>
    );
};

export default BlockishFontSizePicker;