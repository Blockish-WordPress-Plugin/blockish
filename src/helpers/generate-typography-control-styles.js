
const generateTypographyControlStyles = (typography, deviceSlug = 'Desktop') => {
    if (!typography || typeof typography !== 'object') return '';
    
    const styles = [];

    if (typography?.fontFamily?.value) {
        styles.push(`font-family: ${typography?.fontFamily?.value};`);
    }
    if (typography?.fontWeight) {
        styles.push(`font-weight: ${typography?.fontWeight};`);
    }
    if (typography?.fontSize?.[deviceSlug]) {
        styles.push(`font-size: ${typography?.fontSize?.[deviceSlug]};`);
    }
    if (typography?.lineHeight?.[deviceSlug]) {
        styles.push(`line-height: ${typography?.lineHeight?.[deviceSlug]};`);
    }
    if (typography?.letterSpacing?.[deviceSlug]) {
        styles.push(`letter-spacing: ${typography?.letterSpacing?.[deviceSlug]};`);
    }
    if (typography?.textTransform) {
        styles.push(`text-transform: ${typography?.textTransform};`);
    }
    if (typography?.textDecoration) {
        styles.push(`text-decoration: ${typography?.textDecoration};`);
    }
    if (typography?.fontStyle) {
        styles.push(`font-style: ${typography?.fontStyle};`);
    }
    return styles.join(' ');
};

export default generateTypographyControlStyles;
