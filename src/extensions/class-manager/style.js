import { generateClassSelector } from './utils';

const toStyleObject = (value) => {
    if (!value) return {};
    if (typeof value === 'object') return value;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (error) {
            return {};
        }
    }
    return {};
};

const buildCustomCss = (customCss, selector) => {
    if (!customCss || typeof customCss !== 'string') return '';

    const trimmedCss = customCss.trim();
    if (!trimmedCss) return '';

    if (!selector) return trimmedCss;

    return trimmedCss
        .replace(/\{\{\s*SELECTOR\s*\}\}/g, selector)
        .replace(/\bSELECTOR\b/g, selector);
};

const normalizeColor = (value) => {
    if (!value || typeof value !== 'string') return '';
    if (!value.includes('|')) return value;
    const [cssVar, fallback] = value.split('|');
    if (!cssVar || !fallback) return value;
    return `var(${cssVar}, ${fallback})`;
};

const toLength = (value) => {
    if (value === undefined || value === null || value === '') return '';
    if (typeof value === 'string' || typeof value === 'number') {
        const raw = String(value);
        if (raw.includes('var:preset|spacing')) {
            return `var(${raw.replace(/var:|[|]/g, (m) => (m === 'var:' ? '--wp--' : '--'))})`;
        }
        return raw;
    }
    if (typeof value === 'object' && value.value !== undefined && value.value !== null) {
        return `${value.value}${value.unit || ''}`;
    }
    return '';
};

const toSpacingShorthand = (value) => {
    if (value === undefined || value === null || value === '') return '';
    if (typeof value === 'string' || typeof value === 'number') return toLength(value);
    if (typeof value !== 'object' || Array.isArray(value)) return '';

    const top = toLength(value.top ?? value.TOP);
    const right = toLength(value.right ?? value.RIGHT);
    const bottom = toLength(value.bottom ?? value.BOTTOM);
    const left = toLength(value.left ?? value.LEFT);

    if (!top && !right && !bottom && !left) {
        return '';
    }

    return `${top || 0} ${right || 0} ${bottom || 0} ${left || 0}`;
};

const isResponsiveValueShape = (value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const deviceKeys = ['Desktop', 'Tablet', 'Mobile'];
    return Object.keys(value).some((key) => deviceKeys.includes(key) && value[key] !== undefined);
};

const buildTransform = (styles, device, generateCSS) => {
    const transform = [];

    const translateX = generateCSS({ attributes: styles, key: 'translateX', device, getValue: toLength });
    const translateY = generateCSS({ attributes: styles, key: 'translateY', device, getValue: toLength });
    const translateZ = generateCSS({ attributes: styles, key: 'translateZ', device, getValue: toLength });
    const rotate = generateCSS({ attributes: styles, key: 'rotate', device });
    const rotateX = generateCSS({ attributes: styles, key: 'rotateX', device });
    const rotateY = generateCSS({ attributes: styles, key: 'rotateY', device });
    const rotateZ = generateCSS({ attributes: styles, key: 'rotateZ', device });
    const scale = generateCSS({ attributes: styles, key: 'scale', device });
    const scale3DX = generateCSS({ attributes: styles, key: 'scale3DX', device });
    const scale3DY = generateCSS({ attributes: styles, key: 'scale3DY', device });
    const scale3DZ = generateCSS({ attributes: styles, key: 'scale3DZ', device });
    const skewX = generateCSS({ attributes: styles, key: 'skewX', device });
    const skewY = generateCSS({ attributes: styles, key: 'skewY', device });

    if (translateX) transform.push(`translateX(${translateX})`);
    if (translateY) transform.push(`translateY(${translateY})`);
    if (translateZ) transform.push(`translateZ(${translateZ})`);
    if (rotate !== '') transform.push(`rotate(${rotate}deg)`);
    if (rotateX !== '') transform.push(`rotateX(${rotateX}deg)`);
    if (rotateY !== '') transform.push(`rotateY(${rotateY}deg)`);
    if (rotateZ !== '') transform.push(`rotateZ(${rotateZ}deg)`);
    if (scale !== '') transform.push(`scale(${scale})`);

    if (scale3DX !== '' || scale3DY !== '' || scale3DZ !== '') {
        transform.push(`scale3d(${scale3DX || 1}, ${scale3DY || 1}, ${scale3DZ || 1})`);
    }

    if (skewX !== '') transform.push(`skewX(${skewX}deg)`);
    if (skewY !== '') transform.push(`skewY(${skewY}deg)`);

    return transform.join(' ');
};

const buildTransformOrigin = (styles, device, generateCSS) => {
    const origin = generateCSS({ attributes: styles, key: 'transformOrigin', device });
    if (!origin) return '';
    if (origin !== 'custom') return origin;

    const originX = generateCSS({ attributes: styles, key: 'transformOriginX', device, getValue: toLength });
    const originY = generateCSS({ attributes: styles, key: 'transformOriginY', device, getValue: toLength });
    if (!originX && !originY) return '';
    return `${originX || 'center'} ${originY || 'center'}`;
};

const buildTransition = (styles, device, generateCSS) => {
    const property = generateCSS({ attributes: styles, key: 'transitionProperty', device }) || 'all';
    const duration = generateCSS({ attributes: styles, key: 'transitionDuration', device });
    const delay = generateCSS({ attributes: styles, key: 'transitionDelay', device });
    const timing = generateCSS({ attributes: styles, key: 'transitionTimingFunction', device }) || 'ease';

    if (duration === '' && delay === '') return '';
    return `${property} ${duration === '' ? 0.2 : duration}s ${timing} ${delay === '' ? 0 : delay}s`;
};

const generateRuleSet = (styles, device) => {
    const {
        generateBackgroundControlStyles,
        generateBorderControlStyles,
        generateShadowControlStyles,
        generateTextStrokeControlStyles,
        generateCSSFilters,
        generateCSS,
    } = window?.blockish?.helpers || {};

    if (
        typeof generateBackgroundControlStyles !== 'function' ||
        typeof generateBorderControlStyles !== 'function' ||
        typeof generateShadowControlStyles !== 'function' ||
        typeof generateTextStrokeControlStyles !== 'function' ||
        typeof generateCSSFilters !== 'function' ||
        typeof generateCSS !== 'function'
    ) {
        return '';
    }

    const desktopStyles = [];
    const responsiveValue = [];
    const pushRule = (css, responsive = false) => {
        if (!css) return;
        if (responsive) responsiveValue.push(css);
        else desktopStyles.push(css);
    };
    const isResponsiveKey = (key) => {
        if (['background', 'border', 'textStroke'].includes(key)) return true;
        return isResponsiveValueShape(styles?.[key]);
    };
    const addRule = (key, css) => pushRule(css, isResponsiveKey(key));

    const transform = buildTransform(styles, device, generateCSS);
    const transformOrigin = buildTransformOrigin(styles, device, generateCSS);
    const transition = buildTransition(styles, device, generateCSS);
    const background = generateBackgroundControlStyles(styles?.background, device);
    const border = generateBorderControlStyles(styles?.border, device);
    const boxShadow = generateShadowControlStyles(styles?.boxShadow, 'box');
    const textShadow = generateShadowControlStyles(styles?.textShadow, 'text');
    const textStroke = generateTextStrokeControlStyles(styles?.textStroke, device);
    const filters = generateCSSFilters(styles?.filters);
    const backdropFilters = generateCSSFilters(styles?.backgroundFilters)?.replace('filter:', 'backdrop-filter:');
    const color = normalizeColor(styles?.color);

    const layoutType = generateCSS({ attributes: styles, key: 'gridLayoutType', device });
    const gridCols = generateCSS({ attributes: styles, key: 'gridColumns', device });
    const gridRows = generateCSS({ attributes: styles, key: 'gridRows', device });
    const autoGridWidth = generateCSS({ attributes: styles, key: 'autoGridWidth', device, getValue: toLength });
    const autoGridHeight = generateCSS({ attributes: styles, key: 'autoGridHeight', device, getValue: toLength });

    addRule('display', generateCSS({ attributes: styles, key: 'display', device, getValue: (v) => `display: ${v};` }));
    addRule('flexDirection', generateCSS({ attributes: styles, key: 'flexDirection', device, getValue: (v) => `flex-direction: ${v};` }));
    addRule('flexWrap', generateCSS({ attributes: styles, key: 'flexWrap', device, getValue: (v) => `flex-wrap: ${v};` }));
    addRule('justifyContent', generateCSS({ attributes: styles, key: 'justifyContent', device, getValue: (v) => `justify-content: ${v};` }));
    addRule('alignItems', generateCSS({ attributes: styles, key: 'alignItems', device, getValue: (v) => `align-items: ${v};` }));
    addRule('columnGap', generateCSS({ attributes: styles, key: 'columnGap', device, getValue: (v) => `column-gap: ${toLength(v)};` }));
    addRule('rowGap', generateCSS({ attributes: styles, key: 'rowGap', device, getValue: (v) => `row-gap: ${toLength(v)};` }));

    if (layoutType === 'fixed' && gridCols) pushRule(`grid-template-columns: repeat(${gridCols}, minmax(0, 1fr));`, true);
    if (layoutType === 'fixed' && gridRows) pushRule(`grid-template-rows: repeat(${gridRows}, minmax(0, 1fr));`, true);
    if (layoutType === 'auto' && autoGridWidth) {
        pushRule(`grid-template-columns: repeat(auto-fill, minmax(min(${autoGridWidth}, 100%), 1fr));`, true);
    }
    if (layoutType === 'auto' && autoGridHeight) pushRule(`grid-auto-rows: ${autoGridHeight};`, true);

    addRule('padding', generateCSS({ attributes: styles, key: 'padding', device, getValue: (v) => `padding: ${toSpacingShorthand(v)};` }));
    addRule('margin', generateCSS({ attributes: styles, key: 'margin', device, getValue: (v) => `margin: ${toSpacingShorthand(v)};` }));
    addRule('width', generateCSS({ attributes: styles, key: 'width', device, getValue: (v) => `width: ${toLength(v)};` }));
    addRule('height', generateCSS({ attributes: styles, key: 'height', device, getValue: (v) => `height: ${toLength(v)};` }));
    addRule('minWidth', generateCSS({ attributes: styles, key: 'minWidth', device, getValue: (v) => `min-width: ${toLength(v)};` }));
    addRule('minHeight', generateCSS({ attributes: styles, key: 'minHeight', device, getValue: (v) => `min-height: ${toLength(v)};` }));
    addRule('maxWidth', generateCSS({ attributes: styles, key: 'maxWidth', device, getValue: (v) => `max-width: ${toLength(v)};` }));
    addRule('maxHeight', generateCSS({ attributes: styles, key: 'maxHeight', device, getValue: (v) => `max-height: ${toLength(v)};` }));
    addRule('overflow', generateCSS({ attributes: styles, key: 'overflow', device, getValue: (v) => `overflow: ${v};` }));
    addRule('aspectRatio', generateCSS({ attributes: styles, key: 'aspectRatio', device, getValue: (v) => `aspect-ratio: ${v};` }));
    addRule('objectFit', generateCSS({ attributes: styles, key: 'objectFit', device, getValue: (v) => `object-fit: ${v};` }));

    addRule('position', generateCSS({ attributes: styles, key: 'position', device, getValue: (v) => `position: ${v};` }));
    addRule('top', generateCSS({ attributes: styles, key: 'top', device, getValue: (v) => `top: ${toLength(v)};` }));
    addRule('right', generateCSS({ attributes: styles, key: 'right', device, getValue: (v) => `right: ${toLength(v)};` }));
    addRule('bottom', generateCSS({ attributes: styles, key: 'bottom', device, getValue: (v) => `bottom: ${toLength(v)};` }));
    addRule('left', generateCSS({ attributes: styles, key: 'left', device, getValue: (v) => `left: ${toLength(v)};` }));
    addRule('zIndex', generateCSS({ attributes: styles, key: 'zIndex', device, getValue: (v) => `z-index: ${v};` }));
    addRule('anchorOffset', generateCSS({ attributes: styles, key: 'anchorOffset', device, getValue: (v) => `scroll-margin-top: ${toLength(v)};` }));

    pushRule(styles?.fontFamily?.value ? `font-family: ${styles.fontFamily.value};` : '', false);
    addRule('fontWeight', generateCSS({ attributes: styles, key: 'fontWeight', device, getValue: (v) => `font-weight: ${v};` }));
    addRule('fontSize', generateCSS({ attributes: styles, key: 'fontSize', device, getValue: (v) => `font-size: ${toLength(v)};` }));
    addRule('textAlign', generateCSS({ attributes: styles, key: 'textAlign', device, getValue: (v) => `text-align: ${v};` }));
    addRule('lineHeight', generateCSS({ attributes: styles, key: 'lineHeight', device, getValue: (v) => `line-height: ${toLength(v)};` }));
    addRule('letterSpacing', generateCSS({ attributes: styles, key: 'letterSpacing', device, getValue: (v) => `letter-spacing: ${toLength(v)};` }));
    addRule('wordSpacing', generateCSS({ attributes: styles, key: 'wordSpacing', device, getValue: (v) => `word-spacing: ${toLength(v)};` }));
    addRule('columnCount', generateCSS({ attributes: styles, key: 'columnCount', device, getValue: (v) => `column-count: ${v};` }));
    addRule('textDecoration', generateCSS({ attributes: styles, key: 'textDecoration', device, getValue: (v) => `text-decoration: ${v};` }));
    addRule('textTransform', generateCSS({ attributes: styles, key: 'textTransform', device, getValue: (v) => `text-transform: ${v};` }));
    addRule('direction', generateCSS({ attributes: styles, key: 'direction', device, getValue: (v) => `direction: ${v};` }));
    addRule('fontStyle', generateCSS({ attributes: styles, key: 'fontStyle', device, getValue: (v) => `font-style: ${v};` }));
    addRule('textOverflow', generateCSS({ attributes: styles, key: 'textOverflow', device, getValue: (v) => `text-overflow: ${v};` }));
    pushRule(color ? `color: ${color};` : '', false);

    pushRule(background, true);
    addRule('blendMode', generateCSS({ attributes: styles, key: 'blendMode', device, getValue: (v) => `mix-blend-mode: ${v};` }));
    addRule('backgroundClip', generateCSS({ attributes: styles, key: 'backgroundClip', device, getValue: (v) => `background-clip: ${v};` }));
    pushRule(textStroke, true);
    pushRule(border, true);
    addRule('borderRadius', generateCSS({ attributes: styles, key: 'borderRadius', device, getValue: (v) => `border-radius: ${toLength(v)};` }));

    pushRule(boxShadow, false);
    pushRule(textShadow, false);
    addRule('opacity', generateCSS({ attributes: styles, key: 'opacity', device, getValue: (v) => `opacity: ${v};` }));
    addRule('perspective', generateCSS({ attributes: styles, key: 'perspective', device, getValue: (v) => `perspective: ${toLength(v)};` }));
    pushRule(transform ? `transform: ${transform};` : '', true);
    pushRule(transformOrigin ? `transform-origin: ${transformOrigin};` : '', true);
    pushRule(transition ? `transition: ${transition};` : '', true);
    pushRule(filters, false);
    pushRule(backdropFilters || '', false);

    const baseCss = desktopStyles.join(' ').replace(/\s+/g, ' ').trim();
    const responsiveCss = responsiveValue.join(' ').replace(/\s+/g, ' ').trim();

    if (device === 'Desktop') {
        return `${baseCss} ${responsiveCss}`.replace(/\s+/g, ' ').trim();
    }

    return responsiveCss;
};

const generateClassManagerStyles = (styles = [], device = 'Desktop') => {
    if (!Array.isArray(styles) || !styles.length) {
        return { [device]: '' };
    }

    let finalCss = '';
    styles.forEach((item) => {
        const selector = generateClassSelector(item?.id, item?.title, item?.parent);
        if (!selector) return;

        const styleObject = toStyleObject(item?.style);
        const rules = generateRuleSet(styleObject, device);
        const customCss = device === 'Desktop'
            ? buildCustomCss(styleObject?.customCss, selector)
            : '';

        if (rules) {
            finalCss += `${selector} { ${rules} }`;
        }

        if (customCss) {
            finalCss += customCss;
        }
    });

    return { [device]: finalCss };
};

export default generateClassManagerStyles;
