const creaeBoxShadow = (shadows) => {
    let result = [];
    for (let i = 0; i < shadows.length; i++) {
        let shadow = shadows[i];
        if(shadow && (shadow.x || shadow.y)) {
            let boxShadowString = `${shadow.x || 0} ${shadow.y || 0} ${shadow.blur || 0} ${shadow.spread || 0} ${shadow.color || 'rgba(0, 0, 0, 0.5)'} ${shadow.inset ? 'inset' : ''}`;
            result.push(boxShadowString);
        }
    }
    return result.length > 0 ? result.join(', ') : '';
}

const generateBoxShadowControlStyles = (value, deviceSlug) => {
    let styles = '';

    if (value) {
        let boxshadows = JSON.parse(value);
        let boxShadowString = creaeBoxShadow(boxshadows);
        if(boxShadowString) {
            styles = `box-shadow: ${boxShadowString};`;
        }
    }

    return styles;
};

export default generateBoxShadowControlStyles;