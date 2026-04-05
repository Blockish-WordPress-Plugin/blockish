import { useCallback } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';

const EMPTY_ATTRIBUTES = {};

const useExtensionsAttributes = (clientId) => {
    const attributes = useSelect((select) => {
        if (!clientId) {
            return EMPTY_ATTRIBUTES;
        }

        return select('core/block-editor').getBlockAttributes(clientId) || EMPTY_ATTRIBUTES;
    }, [clientId]);

    const { updateBlockAttributes } = useDispatch('core/block-editor');

    const setAttributes = useCallback((nextAttributes) => {
        if (!clientId || !nextAttributes) {
            return;
        }

        updateBlockAttributes(clientId, nextAttributes);
    }, [clientId, updateBlockAttributes]);

    return { attributes, setAttributes };
};

export default useExtensionsAttributes;
