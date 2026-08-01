const generateBackgroundOverlayStyles = (overlay) => {
    const { generateCSSFilters } = window.blockish.helpers;
    if (!overlay || (typeof overlay !== 'string' && typeof overlay !== 'object')) return '';

    const jsonOverlay = typeof overlay === 'string' ? JSON.parse(overlay) : overlay;
    let styles = '';
    
    switch (jsonOverlay.type || 'color') {
        case 'color':
            let color = jsonOverlay?.color?.includes('|') ? jsonOverlay?.color?.split('|') : jsonOverlay?.color;
            if (!color) break;
            styles += `background-color: ${typeof color === 'string' ? color : `var(${color[0]}, ${color[1]})`};`;
            break;
        case 'gradient':
            if (!jsonOverlay?.gradient) break;
            styles += `background-image: ${jsonOverlay?.gradient};`;
            break;
    }

    if (jsonOverlay?.opacity) {
        styles += `opacity: calc(${jsonOverlay?.opacity} / 100);`;
    }

    if (jsonOverlay?.filters) {
        styles += generateCSSFilters(jsonOverlay?.filters);
    }

    if (jsonOverlay?.blendMode) {
        styles += `mix-blend-mode: ${jsonOverlay?.blendMode?.value};`;
    }

    return styles;
}
export default generateBackgroundOverlayStyles;