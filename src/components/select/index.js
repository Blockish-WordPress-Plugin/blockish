import Select from "react-select";
import AsyncSelect from "react-select/async";
import { BaseControl } from "@wordpress/components";

const BlockishSelect = ({ label = 'Select', value, onChange, options = [], ...props }) => {
	return (
		<div className="blockish-control blockish-select-control">
			<BaseControl.VisualLabel as="legend" children={label} __nextHasNoMarginBottom={true} />
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
				{...props}
			/>
		</div>
	);
};

// ✅ Async version
const BlockishAsyncSelect = ({ label = 'Select', value, onChange, loadOptions, ...props }) => {
	return (
		<div className="blockish-control blockish-select-control">
			<BaseControl.VisualLabel as="legend" children={label} __nextHasNoMarginBottom={true} />
			<AsyncSelect
				className="blockish-select"
				classNamePrefix="blockish-select"
				value={value}
				onChange={onChange}
				loadOptions={loadOptions}
				defaultOptions
				cacheOptions
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
				{...props}
			/>
		</div>
	);
};

// Attach Async as a static property
BlockishSelect.Async = BlockishAsyncSelect;

export default BlockishSelect;
