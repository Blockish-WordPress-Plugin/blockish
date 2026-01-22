const unitsForValues = {
    blur: 'px',
    brightness: '%',
    contrast: '%',
    saturate: '%',
    'hue-rotate': 'deg',
    invert: '%',
    grayscale: '%',
    sepia: '%',
}
const generateCSSFilters = (value) => {
    if (!value || typeof value != 'string') return '';

    const filters = JSON.parse(value);
    let cssFilter = '';

    for (const filter in filters) {
        cssFilter += `${filter}(${filters[filter]}${unitsForValues[filter]}) `;
    }
    
    return `filter: ${cssFilter};`;
};

export default generateCSSFilters;