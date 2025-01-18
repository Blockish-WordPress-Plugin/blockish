import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback, memo, useMemo } from '@wordpress/element';
import { getBlockType } from '@wordpress/blocks';

const BlockishResponsiveControl = ({ type = "TextControl", slug, label = "", value: userDefinedValue, onChange: userDefinedOnChange, selectors = {}, left, ...props }) => {
    const Component = window?.blockish?.components?.[type];

    const { BlockishResponsive } = window.blockish.components;
    const { useDeviceType } = window.blockish.helpers;

    const { value, clientId, name } = useSelect((select) => {
        const { getSelectedBlock } = select('core/block-editor');
        const selectedBlock = getSelectedBlock();

        return {
            value: selectedBlock?.attributes?.[slug],
            clientId: selectedBlock?.clientId,
            name: selectedBlock?.name
        }
    }, [slug]);

    const { updateBlockAttributes } = useDispatch('core/block-editor');
    const { isTypeValid, attrType } = useMemo(() => {
        const attrs = getBlockType(name)?.attributes?.[slug];
        return {
            isTypeValid: attrs?.type === 'object',
            attrType: attrs?.type
        };
    }, []);
    
    const device = useDeviceType();

    const onChange = useCallback(value => {
        return updateBlockAttributes(clientId, value);
    }, [clientId])

    if (!Component) {
        console.error(`Blockish: Found unknown control type: ${type}`);
        return null;
    }

    if (!isTypeValid) {
        console.error(`Blockish: Responsive control type must be an object type, but ${attrType} given`);
        return null;
    }

    const controlValue = userDefinedValue || value;

    const controlOnChange = userDefinedOnChange || onChange;

    const handleChange = (value) => {
        controlOnChange({
            [slug]: {
                ...controlValue,
                [device]: value
            }
        });
    }

    return (
        <BlockishResponsive left={left}>
            <Component
                label={label || "Write your label here"}
                value={controlValue?.[device]}
                onChange={handleChange}
                {...props}
            />
        </BlockishResponsive>
    );
};
export default memo(BlockishResponsiveControl);