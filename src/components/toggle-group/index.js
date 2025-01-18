import {
    __experimentalToggleGroupControl as ToggleGroupControl,
    __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';

const BlockishToggleGroup = ({ label = '', value, onChange, options = [], itemProps = {}, isDeselectable = true, ...props }) => {
    return (
        <div className="blockish-toggle-group blockish-control">
            <ToggleGroupControl
                label={label}
                value={value}
                isBlock
                __nextHasNoMarginBottom={true}
                onChange={onChange}
                isDeselectable={isDeselectable}
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

export default BlockishToggleGroup;