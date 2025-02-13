import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback, memo } from '@wordpress/element';
import groupControlsList from './group-controls-list';
const BlockishGroupControl = ({ type, label, slug, value: userDefinedValue, onChange: userDefinedOnChange, ...props }) => {
    if (!groupControlsList.includes(type)) {
        return null;
    }

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
    const Component = window?.blockish?.components[type];

    if (!Component) {
        console.error(`Found unknown group control type: ${type}`);
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
}
export default memo(BlockishGroupControl);