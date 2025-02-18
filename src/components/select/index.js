import Select from "react-select";
import { BaseControl } from '@wordpress/components';

const BlockishSelect = ({ label = 'Select', value, onChange, options=[], ...props }) => {

    return (
        <div className="blockish-control blockish-select-control">
			<BaseControl.VisualLabel as="legend" children={label} __nextHasNoMarginBottom={true}/>
			<Select
				className="blockish-select"
				classNamePrefix="blockish-select"
				value={value}
				onChange={onChange}
				options={options}
				isSearchable
				isClearable
				theme={(theme) => ({
					...theme,
					colors: {
						...theme.colors,
						primary25: '#F2F4F7',
						primary: '#3BAAFE10',
					},
				})}
				{
					...props
				}
			/>
        </div>
    );
}

export default BlockishSelect;