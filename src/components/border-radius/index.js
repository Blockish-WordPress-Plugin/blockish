import { __experimentalBorderRadiusControl as BorderRadiusControl } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

const BlockishBorderRadius = ({ value, onChange }) => {
    return (
        <BorderRadiusControl
            label={__('Border Radius', 'blockish')}
            values={value}
            onChange={onChange}
        />
    );
}

export default BlockishBorderRadius;