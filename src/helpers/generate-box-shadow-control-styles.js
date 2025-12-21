const creaeBoxShadow = (shadows, isTextShadow = false) => {
    let result = [];
    for (let i = 0; i < shadows.length; i++) {
        let shadow = shadows[i];
        if(shadow && (shadow.x || shadow.y)) {
            if (isTextShadow) {
                // Text shadow doesn't use spread or inset
                let shadowString = `${shadow.x || 0} ${shadow.y || 0} ${shadow.blur || 0} ${shadow.color || 'rgba(0, 0, 0, 0.5)'}`;
                result.push(shadowString);
            } else {
                // Box shadow includes spread and inset
                let shadowString = `${shadow.x || 0} ${shadow.y || 0} ${shadow.blur || 0} ${shadow.spread || 0} ${shadow.color || 'rgba(0, 0, 0, 0.5)'} ${shadow.inset ? 'inset' : ''}`;
                result.push(shadowString);
            }
        }
    }
    return result.length > 0 ? result.join(', ') : '';
}

const generateBoxShadowControlStyles = (value, deviceSlug, shadowType = 'box') => {
    let styles = '';
    const isTextShadow = shadowType === 'text';
    const cssProperty = isTextShadow ? 'text-shadow' : 'box-shadow';

    if (value && value !== '') {
        try {
            let shadows = JSON.parse(value);
            let shadowString = creaeBoxShadow(shadows, isTextShadow);
            if(shadowString) {
                styles = `${cssProperty}: ${shadowString};`;
            }
        } catch (e) {
            // Invalid JSON, return empty styles
            console.warn(`Invalid ${cssProperty} JSON:`, value);
        }
    }

    return styles;
};

export default generateBoxShadowControlStyles;