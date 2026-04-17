const isResponsiveValueShape = (value) => {
    if (!value || typeof value !== 'object') return false;
    const deviceKeys = ['Desktop', 'Tablet', 'Mobile'];
    return Object.keys(value).some((key) => deviceKeys.includes(key) && value[key] !== undefined);
};

const generateCSS = ({ attributes, key, device = 'Desktop', getValue = (value) => value }) => {
    const value = attributes?.[key];
    const normalizeResolvedValue = (resolvedValue) => {
        if (
            resolvedValue &&
            typeof resolvedValue === 'object' &&
            !Array.isArray(resolvedValue) &&
            Object.prototype.hasOwnProperty.call(resolvedValue, 'value') &&
            !Object.prototype.hasOwnProperty.call(resolvedValue, 'unit')
        ) {
            return resolvedValue.value;
        }

        return resolvedValue;
    };
    const hasUsableInnerValue = (innerValue) =>
        innerValue !== undefined && innerValue !== null && innerValue !== '';

    const canUseObjectValue = (obj) => {
        if (!obj || typeof obj !== 'object') {
            return false;
        }

        if (Object.prototype.hasOwnProperty.call(obj, 'value')) {
            return hasUsableInnerValue(obj.value);
        }

        return Object.keys(obj).length > 0;
    };

    if (value !== undefined && value !== null && typeof value !== 'object') {
        return getValue(value);
    }

    if (isResponsiveValueShape(value)) {
        const responsiveValue = normalizeResolvedValue(value[device]);
        if (responsiveValue !== undefined && responsiveValue !== null) {
            return getValue(responsiveValue);
        }
    }

    if (
        value !== undefined &&
        value !== null &&
        typeof value === 'object' &&
        !isResponsiveValueShape(value) &&
        canUseObjectValue(value)
    ) {
        return getValue(normalizeResolvedValue(value));
    }

    return '';
};

export default generateCSS;
