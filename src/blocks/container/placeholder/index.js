import { Button } from '@wordpress/components';
import { close, group } from '@wordpress/icons';
import {
    __experimentalBlockVariationPicker as BlockVariationPicker,
    store as blockEditorStore,
} from '@wordpress/block-editor';
import variations from './variations';
import { __ } from '@wordpress/i18n';
import { useDispatch } from '@wordpress/data';

const Placeholder = (props) => {
    const { clientId } = props;
    const dispatch = useDispatch();
    const { removeBlock } = dispatch(blockEditorStore);
    
    return (
        <div className="blockish-container-placeholder">
            <Button 
                icon={close} 
                className="blockish-container-placeholder-close"
                onClick={() => removeBlock(clientId)}
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