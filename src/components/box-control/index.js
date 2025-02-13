import { __experimentalBoxControl as BoxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
const BlockishBoxControl = ({ label, value, onChange, ...props }) => {
    return (
        <div className="blockish-box-control blockish-control">
            <BoxControl 
                label={label || __('Margin', 'blockish')}
                values={value}
                onChange={onChange}
                {...props}
            />
        </div>
    )
};
export default BlockishBoxControl;