import { Button } from '@wordpress/components';
import { close, group } from '@wordpress/icons';
import {
    __experimentalBlockVariationPicker as BlockVariationPicker,
} from '@wordpress/block-editor';
import variations from './variations';
import { __ } from '@wordpress/i18n';

const Placeholder = (props) => {
    return (
        <div className="blockish-container-placeholder">
            <Button 
                icon={close} 
                className="blockish-container-placeholder-close"
                onClick={() => props.onSelect({
                    name: '100',
                    title: 'Skip',
                    innerBlocks: [
                        ['blockish/container', { isVariationsPicked: true }]
                    ],
                    scope: ['block'],
                })}
            />
            <BlockVariationPicker
                icon={group}
                label={__("Choose Container Layout", "gutenkit-blocks-addon")}
                instructions={__("Select a container layout to start with.", "gutenkit-blocks-addon")}
                onSelect={(nextVariation) => {
                    props.onSelect(nextVariation);
                }}
                variations={variations}
            />
        </div>

    )
}


export default Placeholder;