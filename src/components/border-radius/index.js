import { __experimentalBorderRadiusControl as BorderRadiusControl } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const BlockishBorderRadius = ({ value, onChange, label, ...props }) => {
    return (
        <BorderRadiusControl
            label={label}
            values={value}
            onChange={onChange}
            { ...props }
        />
    );
}

export default BlockishBorderRadius;