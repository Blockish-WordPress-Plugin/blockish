import { __experimentalSpacingSizesControl as SpacingSizesControl } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
const BoilerplateSpacingSizes = ({ label, value, onChange, ...props }) => {
    return (
        <div className="boilerplate-blocks-spacing-sizes-control boilerplate-blocks-control">
            <SpacingSizesControl 
                label={label || __('Spacing', 'boilerplate-blocks')}
                values={value}
                onChange={onChange}
                {...props}
            />
        </div>
    )
};
export default BoilerplateSpacingSizes;