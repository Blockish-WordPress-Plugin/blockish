import generateBackgroundControlStyles from '../../helpers/generate-background-control-styles';
import generateBorderControlStyles from '../../helpers/generate-border-control-styles';
import generateShadowControlStyles from '../../helpers/generate-box-shadow-control-styles';
import generateTextStrokeControlStyles from '../../helpers/generate-text-stroke-control-styles';
import generateCSSFilters from '../../helpers/generate-css-filters';

const DEVICES = ['Desktop', 'Tablet', 'Mobile'];
const DEVICE_QUERY = {
    Tablet: '@media screen and (max-width: 1024px)',
    Mobile: '@media screen and (max-width: 767px)',
};

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const getResponsiveValue = (value, device = 'Desktop') => {
    if (value === undefined || value === null) {
        return '';
    }

    if (!isObject(value)) {
        return value;
    }

    if (Object.prototype.hasOwnProperty.call(value, device)) {
        return value[device];
    }

    return value;
};

const normalizeColorValue = (value) => {
    if (!value || typeof value !== 'string') {
        return '';
    }

    if (value.includes('|')) {
        const [cssVar, fallback] = value.split('|');
        if (cssVar && fallback) {
            return `var(${cssVar}, ${fallback})`;
        }
    }

    return value;
};

const appendRule = (rules, property, value) => {
    if (value === undefined || value === null || value === '') {
        return;
    }

    rules.push(`${property}: ${value};`);
};

const stringifyLengthValue = (value) => {
    if (value === undefined || value === null || value === '') {
        return '';
    }

    if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
    }

    if (isObject(value) && value.value !== undefined && value.value !== null) {
        return `${value.value}${value.unit || ''}`;
    }

    return '';
};

const buildTransform = (styles, device) => {
    const transforms = [];

    const tx = stringifyLengthValue(getResponsiveValue(styles?.translateX, device));
    const ty = stringifyLengthValue(getResponsiveValue(styles?.translateY, device));
    const tz = stringifyLengthValue(getResponsiveValue(styles?.translateZ, device));
    const rotate = getResponsiveValue(styles?.rotate, device);
    const rotateX = getResponsiveValue(styles?.rotateX, device);
    const rotateY = getResponsiveValue(styles?.rotateY, device);
    const rotateZ = getResponsiveValue(styles?.rotateZ, device);
    const scale = getResponsiveValue(styles?.scale, device);
    const scaleX3d = getResponsiveValue(styles?.scale3DX, device);
    const scaleY3d = getResponsiveValue(styles?.scale3DY, device);
    const scaleZ3d = getResponsiveValue(styles?.scale3DZ, device);
    const skewX = getResponsiveValue(styles?.skewX, device);
    const skewY = getResponsiveValue(styles?.skewY, device);

    if (tx) transforms.push(`translateX(${tx})`);
    if (ty) transforms.push(`translateY(${ty})`);
    if (tz) transforms.push(`translateZ(${tz})`);
    if (rotate !== '' && rotate !== undefined && rotate !== null) transforms.push(`rotate(${rotate}deg)`);
    if (rotateX !== '' && rotateX !== undefined && rotateX !== null) transforms.push(`rotateX(${rotateX}deg)`);
    if (rotateY !== '' && rotateY !== undefined && rotateY !== null) transforms.push(`rotateY(${rotateY}deg)`);
    if (rotateZ !== '' && rotateZ !== undefined && rotateZ !== null) transforms.push(`rotateZ(${rotateZ}deg)`);
    if (scale !== '' && scale !== undefined && scale !== null) transforms.push(`scale(${scale})`);

    if (
        (scaleX3d !== '' && scaleX3d !== undefined && scaleX3d !== null) ||
        (scaleY3d !== '' && scaleY3d !== undefined && scaleY3d !== null) ||
        (scaleZ3d !== '' && scaleZ3d !== undefined && scaleZ3d !== null)
    ) {
        transforms.push(`scale3d(${scaleX3d || 1}, ${scaleY3d || 1}, ${scaleZ3d || 1})`);
    }

    if (skewX !== '' && skewX !== undefined && skewX !== null) transforms.push(`skewX(${skewX}deg)`);
    if (skewY !== '' && skewY !== undefined && skewY !== null) transforms.push(`skewY(${skewY}deg)`);

    return transforms.join(' ');
};

const buildTransformOrigin = (styles, device) => {
    const origin = getResponsiveValue(styles?.transformOrigin, device);
    if (!origin) {
        return '';
    }

    if (origin !== 'custom') {
        return origin;
    }

    const originX = stringifyLengthValue(getResponsiveValue(styles?.transformOriginX, device));
    const originY = stringifyLengthValue(getResponsiveValue(styles?.transformOriginY, device));

    if (!originX && !originY) {
        return '';
    }

    return `${originX || 'center'} ${originY || 'center'}`;
};

const buildTransition = (styles, device) => {
    const property = getResponsiveValue(styles?.transitionProperty, device) || 'all';
    const duration = getResponsiveValue(styles?.transitionDuration, device);
    const timing = getResponsiveValue(styles?.transitionTimingFunction, device) || 'ease';
    const delay = getResponsiveValue(styles?.transitionDelay, device);

    if ((duration === '' || duration === undefined || duration === null) && (delay === '' || delay === undefined || delay === null)) {
        return '';
    }

    const usableDuration = duration === '' || duration === undefined || duration === null ? 0.2 : duration;
    const usableDelay = delay === '' || delay === undefined || delay === null ? 0 : delay;

    return `${property} ${usableDuration}s ${timing} ${usableDelay}s`;
};

const safeGenerate = (generator, value, device, mutate = null) => {
    try {
        const output = generator(value, device);
        if (!output || typeof output !== 'string') {
            return '';
        }

        if (typeof mutate === 'function') {
            return mutate(output);
        }

        return output;
    } catch (error) {
        return '';
    }
};

const buildRulesForDevice = (styles, device) => {
    if (!styles || typeof styles !== 'object') {
        return '';
    }

    const rules = [];

    appendRule(rules, 'display', getResponsiveValue(styles?.display, device));
    appendRule(rules, 'flex-direction', getResponsiveValue(styles?.flexDirection, device));
    appendRule(rules, 'flex-wrap', getResponsiveValue(styles?.flexWrap, device));
    appendRule(rules, 'justify-content', getResponsiveValue(styles?.justifyContent, device));
    appendRule(rules, 'align-items', getResponsiveValue(styles?.alignItems, device));
    appendRule(rules, 'column-gap', stringifyLengthValue(getResponsiveValue(styles?.columnGap, device)));
    appendRule(rules, 'row-gap', stringifyLengthValue(getResponsiveValue(styles?.rowGap, device)));

    const layoutType = getResponsiveValue(styles?.gridLayoutType, device);
    const gridCols = getResponsiveValue(styles?.gridColumns, device);
    const gridRows = getResponsiveValue(styles?.gridRows, device);
    const autoGridWidth = stringifyLengthValue(getResponsiveValue(styles?.autoGridWidth, device));
    const autoGridHeight = stringifyLengthValue(getResponsiveValue(styles?.autoGridHeight, device));

    if (layoutType === 'fixed') {
        if (gridCols) {
            appendRule(rules, 'grid-template-columns', `repeat(${gridCols}, minmax(0, 1fr))`);
        }
        if (gridRows) {
            appendRule(rules, 'grid-template-rows', `repeat(${gridRows}, minmax(0, 1fr))`);
        }
    }

    if (layoutType === 'auto') {
        if (autoGridWidth) {
            appendRule(rules, 'grid-template-columns', `repeat(auto-fill, minmax(min(${autoGridWidth}, 100%), 1fr))`);
        }
        if (autoGridHeight) {
            appendRule(rules, 'grid-auto-rows', autoGridHeight);
        }
    }

    appendRule(rules, 'padding', stringifyLengthValue(getResponsiveValue(styles?.padding, device)));
    appendRule(rules, 'margin', stringifyLengthValue(getResponsiveValue(styles?.margin, device)));

    appendRule(rules, 'width', stringifyLengthValue(getResponsiveValue(styles?.width, device)));
    appendRule(rules, 'height', stringifyLengthValue(getResponsiveValue(styles?.height, device)));
    appendRule(rules, 'min-width', stringifyLengthValue(getResponsiveValue(styles?.minWidth, device)));
    appendRule(rules, 'min-height', stringifyLengthValue(getResponsiveValue(styles?.minHeight, device)));
    appendRule(rules, 'max-width', stringifyLengthValue(getResponsiveValue(styles?.maxWidth, device)));
    appendRule(rules, 'max-height', stringifyLengthValue(getResponsiveValue(styles?.maxHeight, device)));
    appendRule(rules, 'overflow', getResponsiveValue(styles?.overflow, device));
    appendRule(rules, 'aspect-ratio', getResponsiveValue(styles?.aspectRatio, device));
    appendRule(rules, 'object-fit', getResponsiveValue(styles?.objectFit, device));

    appendRule(rules, 'position', getResponsiveValue(styles?.position, device));
    appendRule(rules, 'top', stringifyLengthValue(getResponsiveValue(styles?.top, device)));
    appendRule(rules, 'right', stringifyLengthValue(getResponsiveValue(styles?.right, device)));
    appendRule(rules, 'bottom', stringifyLengthValue(getResponsiveValue(styles?.bottom, device)));
    appendRule(rules, 'left', stringifyLengthValue(getResponsiveValue(styles?.left, device)));
    appendRule(rules, 'z-index', getResponsiveValue(styles?.zIndex, device));
    appendRule(rules, 'scroll-margin-top', stringifyLengthValue(getResponsiveValue(styles?.anchorOffset, device)));

    const fontFamily = styles?.fontFamily?.value;
    if (fontFamily) {
        appendRule(rules, 'font-family', fontFamily);
    }

    appendRule(rules, 'font-weight', getResponsiveValue(styles?.fontWeight, device));
    appendRule(rules, 'font-size', stringifyLengthValue(getResponsiveValue(styles?.fontSize, device)));
    appendRule(rules, 'text-align', getResponsiveValue(styles?.textAlign, device));
    appendRule(rules, 'line-height', stringifyLengthValue(getResponsiveValue(styles?.lineHeight, device)));
    appendRule(rules, 'letter-spacing', stringifyLengthValue(getResponsiveValue(styles?.letterSpacing, device)));
    appendRule(rules, 'word-spacing', stringifyLengthValue(getResponsiveValue(styles?.wordSpacing, device)));
    appendRule(rules, 'column-count', getResponsiveValue(styles?.columnCount, device));
    appendRule(rules, 'text-decoration', getResponsiveValue(styles?.textDecoration, device));
    appendRule(rules, 'text-transform', getResponsiveValue(styles?.textTransform, device));
    appendRule(rules, 'direction', getResponsiveValue(styles?.direction, device));
    appendRule(rules, 'font-style', getResponsiveValue(styles?.fontStyle, device));
    appendRule(rules, 'text-overflow', getResponsiveValue(styles?.textOverflow, device));

    const color = normalizeColorValue(styles?.color);
    if (color) {
        appendRule(rules, 'color', color);
    }

    const backgroundCss = safeGenerate(generateBackgroundControlStyles, styles?.background, device);
    if (backgroundCss) {
        rules.push(backgroundCss);
    }

    appendRule(rules, 'mix-blend-mode', getResponsiveValue(styles?.blendMode, device));
    appendRule(rules, 'background-clip', getResponsiveValue(styles?.backgroundClip, device));

    const textStrokeCss = safeGenerate(generateTextStrokeControlStyles, styles?.textStroke, device);
    if (textStrokeCss) {
        rules.push(textStrokeCss);
    }

    const borderCss = safeGenerate(generateBorderControlStyles, styles?.border, device);
    if (borderCss) {
        rules.push(borderCss);
    }

    appendRule(rules, 'border-radius', stringifyLengthValue(getResponsiveValue(styles?.borderRadius, device)));

    const boxShadowCss = safeGenerate(generateShadowControlStyles, styles?.boxShadow, 'box');
    if (boxShadowCss) {
        rules.push(boxShadowCss);
    }

    const textShadowCss = safeGenerate(generateShadowControlStyles, styles?.textShadow, 'text');
    if (textShadowCss) {
        rules.push(textShadowCss);
    }

    appendRule(rules, 'opacity', getResponsiveValue(styles?.opacity, device));

    const perspective = stringifyLengthValue(getResponsiveValue(styles?.perspective, device));
    if (perspective) {
        appendRule(rules, 'perspective', perspective);
    }

    const transform = buildTransform(styles, device);
    if (transform) {
        appendRule(rules, 'transform', transform);
    }

    const transformOrigin = buildTransformOrigin(styles, device);
    if (transformOrigin) {
        appendRule(rules, 'transform-origin', transformOrigin);
    }

    const transition = buildTransition(styles, device);
    if (transition) {
        appendRule(rules, 'transition', transition);
    }

    const filtersCss = safeGenerate(generateCSSFilters, styles?.filters);
    if (filtersCss) {
        rules.push(filtersCss);
    }

    const backdropFiltersCss = safeGenerate(generateCSSFilters, styles?.backgroundFilters, null, (css) => css.replace('filter:', 'backdrop-filter:'));
    if (backdropFiltersCss) {
        rules.push(backdropFiltersCss);
    }

    return rules.join(' ');
};

const generateClassManagerStyles = (styles, selector) => {
    if (!styles || typeof styles !== 'object' || !selector) {
        return '';
    }

    const desktopRules = buildRulesForDevice(styles, 'Desktop');
    if (!desktopRules) {
        return '';
    }

    let css = `${selector} { ${desktopRules} }`;

    DEVICES.filter((device) => device !== 'Desktop').forEach((device) => {
        const rules = buildRulesForDevice(styles, device);
        if (!rules || rules === desktopRules) {
            return;
        }

        css += `${DEVICE_QUERY[device]} { ${selector} { ${rules} } }`;
    });

    return css;
};

export default generateClassManagerStyles;
