const isResponsiveValueShape = (value) => {
    if (!value || typeof value !== 'object') return false;
    const deviceKeys = ['Desktop', 'Tablet', 'Mobile'];
    return Object.keys(value).some((key) => deviceKeys.includes(key) && value[key] !== undefined);
};

const generateCSS = ({ attributes, key, device = 'Desktop', getValue = (value) => value }) => {
    const value = attributes?.[key];

    if (value !== undefined && value !== null && typeof value !== 'object') {
        return getValue(value);
    }

    if (isResponsiveValueShape(value)) {
        const responsiveValue = value[device];
        if (responsiveValue !== undefined && responsiveValue !== null) {
            return getValue(responsiveValue);
        }
    }

    if (
        value !== undefined &&
        value !== null &&
        typeof value === 'object' &&
        !isResponsiveValueShape(value) &&
        Object.keys(value).length > 0
    ) {
        return getValue(value);
    }

    return '';
};

export const safeParseJSON = (value, fallback = null) => {
    if (!value || typeof value !== 'string') {
        return fallback;
    }

    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
};

export default generateCSS;
