import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

const BoilerplateToggleGroup = ({ label = '', value, onChange, options = [], itemProps = {}, ...props }) => {
    return (
        <div className="boilerplate-toggle-group">
            <ToggleGroupControl
                label={label}
                value={value}
                isBlock
                __nextHasNoMarginBottom
                onChange={onChange}
                isDeselectable={true}
                {...props}
            >
                {
                    options.map((option) => (
                        <ToggleGroupControlOption
                            key={option.value}
                            value={option.value}
                            label={option.label}
                            {...itemProps}
                        />
                    ))
                }
            </ToggleGroupControl>
        </div>
    );
}

export default BoilerplateToggleGroup;