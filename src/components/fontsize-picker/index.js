import { FontSizePicker } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const BoilerplateFontSizePicker = ({ value, onChange, label, ...props }) => {
    return (
        <div className="boilerplate-blocks-fontsize-picker-control boilerplate-blocks-control">
            <FontSizePicker
                value={value}
                onChange={onChange}
                label={label || __('Font Size', 'boilerplate-blocks')}
                withSlider
                withReset
                units={['px', 'em', 'rem']}
                {...props}
            />
        </div>
    );
};

export default BoilerplateFontSizePicker;