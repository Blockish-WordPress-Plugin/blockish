import { __experimentalSpacingSizesControl as SpacingSizesControl } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
const BlockishSpacingSizes = ({ label, value, onChange, ...props }) => {
    return (
        <div className="blockish-spacing-sizes-control blockish-control">
            <SpacingSizesControl 
                label={label || __('Spacing', 'blockish')}
                values={value}
                onChange={onChange}
                {...props}
            />
        </div>
    )
};
export default BlockishSpacingSizes;