import { RangeControl } from '@wordpress/components';
const BoilerplateRangeControl = ({ label = 'Range', value, onChange, ...props }) => {
    return (
        <div className="boilerplate-blocks-control boilerplate-blocks-range-control">
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

export default BoilerplateRangeControl;