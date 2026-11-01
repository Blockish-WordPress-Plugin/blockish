import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback, memo } from '@wordpress/element';

const BlockishControl = ({ type = "TextControl", slug, label = "", value: userDefinedValue, onChange: userDefinedOnChange, selectors = {}, ...props }) => {
    const Component = window?.blockish?.components[type];

    const { value, clientId } = useSelect((select) => {
        const { getSelectedBlock } = select('core/block-editor');
        const selectedBlock = getSelectedBlock();

        return {
            value: selectedBlock?.attributes?.[slug],
            clientId: selectedBlock?.clientId,
        }
    }, [slug]);

    const { updateBlockAttributes } = useDispatch('core/block-editor');

    const onChange = useCallback(value => {
        return updateBlockAttributes(clientId, value);
    }, [clientId])

    if (!Component) {
        console.error(`Found unknown control type: ${type}`);
        return null;
    }

    // Keep real falsy values like 0; only empty means "fall back".
    const isEmpty = (v) => v === undefined || v === null || v === '';
    let controlValue = isEmpty(value) ? '' : value;
    if (!isEmpty(userDefinedValue)) {
        controlValue = userDefinedValue;
    }

    const handleChange = (value) => {
        if(userDefinedOnChange) {
            userDefinedOnChange(value);
        } else {
            onChange({ [slug]: value });
        }
    }

    return (
        <Component
            label={label || "Write your label here"}
            checked={controlValue}
            value={controlValue}
            onChange={handleChange}
           
            {...props}
        />
    );
};
export default memo(BlockishControl);