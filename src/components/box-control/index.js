import { __experimentalBoxControl as BoxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
const BlockishBoxControl = ({ label, value, onChange, showReset = true, ...props }) => {
    return (
        <div className="blockish-box-control blockish-control">
            <BoxControl 
                label={label || __('Margin', 'blockish')}
                values={value}
                onChange={onChange}
                {...props}
                allowReset={showReset}
            />
        </div>
    )
};
export default BlockishBoxControl;
