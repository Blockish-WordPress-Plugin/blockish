import { Placeholder } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { image } from '@wordpress/icons';
const instructionsDefault = __('Drag and drop an image, upload, or choose from your library.');
const BlockishImagePlaceholder = ({ label = __('Image'), instructions = instructionsDefault, icon = image, withIllustration = true, content }) => {
    return (
        <Placeholder
            className='block-editor-media-placeholder'
            icon={icon}
            withIllustration={withIllustration}
            label={label}
            instructions={instructions}
        >
            {content}
        </Placeholder>
    );
};

export default BlockishImagePlaceholder;
