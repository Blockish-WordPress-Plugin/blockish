/**
 * RangeUnit / option bags → CSS length string.
 * @param {unknown} raw
 * @returns {string}
 */
const toCssLength = (raw) => {
    if (raw == null || raw === '') {
        return '';
    }
    if (typeof raw === 'string' || typeof raw === 'number') {
        return String(raw);
    }
    if (typeof raw === 'object' && raw.value != null) {
        const unit = raw.unit != null ? String(raw.unit) : '';
        return `${raw.value}${unit}`;
    }
    return '';
};

const generateBackgroundControlStyles = (background, device) => {
    if (!background || (typeof background !== 'string' && typeof background !== 'object')) return '';

    const jsonBackground = typeof background === 'string' ? JSON.parse(background) : background;
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

        const position = jsonBackground?.backgroundImagePosition?.[device];
        if (position?.value === 'custom') {
            const x = toCssLength(jsonBackground?.backgroundImagePositionHorizontal?.[device]);
            const y = toCssLength(jsonBackground?.backgroundImagePositionVertical?.[device]);
            if (x && y) {
                styles += `background-position: ${x} ${y};`;
            }
        } else if (position?.value) {
            styles += `background-position: ${position.value};`;
        }

        if (jsonBackground?.backgroundImageAttachment && device === 'Desktop') {
            styles += `background-attachment: ${jsonBackground?.backgroundImageAttachment?.value};`;
        }

        if (jsonBackground?.backgroundImageRepeat?.[device]) {
            styles += `background-repeat: ${jsonBackground?.backgroundImageRepeat?.[device]?.value};`;
        }

        // Never emit the sentinel "custom" — resolve Width when Size.value is custom.
        const size = jsonBackground?.backgroundImageSize?.[device];
        if (size?.value === 'custom') {
            const width = toCssLength(jsonBackground?.backgroundImageSizeWidth?.[device]);
            if (width) {
                styles += `background-size: ${width};`;
            }
        } else if (size?.value) {
            styles += `background-size: ${size.value};`;
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