import { RangeControl } from '@wordpress/components';
const BlockishRangeControl = ({ label = 'Range', value, onChange, ...props }) => {
    return (
        <div className="blockish-control blockish-range-control">
            <RangeControl
                __nextHasNoMarginBottom={true}
                label={label}
                value={value}
                onChange={onChange}
                {...props}
            />
        </div>
    )
}

export default BlockishRangeControl;