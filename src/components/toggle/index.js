import { ToggleControl } from '@wordpress/components';

const BlockishToggle = ({
    label = '',
    value = false,
    onChange,
    ...props
}) => {
    return (
        <div className="blockish-toggle blockish-control">
            <ToggleControl
                label={label}
                checked={value}
                onChange={onChange}
                __nextHasNoMarginBottom={true}
                {...props}
            />
        </div>
    );
}

export default BlockishToggle;