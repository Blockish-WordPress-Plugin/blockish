const createShadowString = (shadows, type = 'box') => {
    if (!Array.isArray(shadows)) {
        return '';
    }

    const isText = type === 'text';
    const result = [];

    for (let i = 0; i < shadows.length; i++) {
        const shadow = shadows[i];

        if (!shadow || (!shadow.x && !shadow.y)) {
            continue;
        }

        const x = shadow.x ?? 0;
        const y = shadow.y ?? 0;
        const blur = shadow.blur ?? 0;
        const color = shadow.color || 'rgba(0, 0, 0, 0.5)';

        if (isText) {
            // text-shadow: x y blur color
            result.push(`${x} ${y} ${blur} ${color}`);
        } else {
            // box-shadow: x y blur spread color inset
            const spread = shadow.spread ?? 0;
            const inset = shadow.inset ? 'inset' : '';

            result.push(
                `${x} ${y} ${blur} ${spread} ${color} ${inset}`.trim()
            );
        }
    }

    return result.length ? result.join(', ') : '';
};

const generateShadowControlStyles = (value, type = 'box') => {
    if (!value) {
        return '';
    }

    const normalizedType = type === 'text' ? 'text' : 'box';
    const cssProperty = normalizedType === 'text' ? 'text-shadow' : 'box-shadow';

    try {
        const shadows = JSON.parse(value);
        const shadowString = createShadowString(shadows, normalizedType);

        return shadowString ? `${cssProperty}: ${shadowString};` : '';
    } catch (e) {
        console.warn(`Invalid ${cssProperty} JSON:`, value);
        return '';
    }
};

export default generateShadowControlStyles;
