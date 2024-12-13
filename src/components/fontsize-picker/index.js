import { FontSizePicker } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const BlockishFontSizePicker = ({ value, onChange, label, ...props }) => {
    return (
        <div className="blockish-fontsize-picker-control blockish-control">
            <FontSizePicker
                value={value}
                onChange={onChange}
                label={label || __('Font Size', 'blockish')}
                withSlider
                withReset
                units={['px', 'em', 'rem']}
                {...props}
            />
        </div>
    );
};

export default BlockishFontSizePicker;