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

    const controlValue = userDefinedValue || value;

    const controlOnChange = userDefinedOnChange || onChange;

    const handleChange = (value) => {
        controlOnChange({ [slug]: value });
    }

    return (
        <Component
            label={label || "Write your label here"}
            value={controlValue}
            onChange={handleChange}
            {...props}
        />
    );
};
export default memo(BlockishControl);