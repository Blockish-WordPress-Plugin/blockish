const generateBackgroundControlStyles = (background, device) => {
    if (!background || typeof background !== 'string') return '';

    const jsonBackground = JSON.parse(background);
    let styles = '';
    let backgroundType = jsonBackground['backgroundType'] || 'classic';

    if (backgroundType === 'classic') {
        let backgroundImage = jsonBackground['backgroundImage']?.[device];
        let resolution = jsonBackground?.backgroundImageResolution?.[device];

        if (resolution) {
            backgroundImage = resolution;
        }

        if (backgroundImage?.url) {
            styles += `background-image: url(${backgroundImage.url});`;
        }

        if (jsonBackground?.backgroundImagePosition?.[device]) {
            styles += `background-position: ${jsonBackground?.backgroundImagePosition?.[device]?.value};`;
        }

        if (jsonBackground?.backgroundImageAttachment && device === 'Desktop') {
            styles += `background-attachment: ${jsonBackground?.backgroundImageAttachment?.value};`;
        }

        if (jsonBackground?.backgroundImageRepeat?.[device]) {
            styles += `background-repeat: ${jsonBackground?.backgroundImageRepeat?.[device]?.value};`;
        }

        if (jsonBackground?.backgroundImageSize?.[device]) {
            styles += `background-size: ${jsonBackground?.backgroundImageSize?.[device]?.value};`;
        }

        if (jsonBackground?.backgroundImageBlendMode && device === 'Desktop') {
            styles += `background-blend-mode: ${jsonBackground?.backgroundImageBlendMode?.value};`;
        }

        if (jsonBackground?.backgroundColor && device === 'Desktop') {
            let color = jsonBackground?.backgroundColor?.includes('|') ? jsonBackground?.backgroundColor?.split('|') : jsonBackground?.backgroundColor;
            styles += `background-color: ${typeof color === 'string' ? color : `var(${color[0]}, ${color[1]})`};`;
        }

    }

    if (backgroundType === 'gradient' && device === 'Desktop') {
        let gradient = jsonBackground?.gradient?.includes('|') ? jsonBackground?.gradient?.split('|') : jsonBackground?.gradient;
        if (gradient) {
            styles += `background: ${typeof gradient === 'string' ? gradient : `var(${gradient[0]}, ${gradient[1]})`};`;
        }
    }
    
    return styles;
}
export default generateBackgroundControlStyles;