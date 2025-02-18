import { __experimentalBorderBoxControl as BorderBoxControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
const BlockishBorder = ({ label = __('Borders', 'blockish'), value, onChange, ...props }) => {
    return (
        <div className="blockish-border-control blockish-control">
            <BorderBoxControl
                label={label}
                value={value}
                onChange={onChange}
                {...props}
            />
        </div>
    )
}
export default BlockishBorder;