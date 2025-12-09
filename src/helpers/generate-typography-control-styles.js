/**
 * Generate CSS styles from typography values
 * This helper delegates to the BlockishTypography component's generateCSS method
 * to avoid code duplication and maintain a single source of truth.
 * 
 * @param {string|object} value - Typography value (can be JSON string or object)
 * @param {string} deviceSlug - Device slug (Desktop, Tablet, Mobile) - currently unused but kept for API consistency
 * @returns {string} CSS string with typography properties
 */
const generateTypographyControlStyles = (typography, deviceSlug = 'Desktop') => {
    if (!typography || typeof typography !== 'object') return '';

    const styles = [];

    if (typography.fontFamily?.value) {
        styles.push(`font-family: ${typography.fontFamily.value};`);
    }
    if (typography.fontSize) {
        styles.push(`font-size: ${typography.fontSize};`);
    }
    if (typography.fontWeight && typography.fontWeight !== 'normal') {
        styles.push(`font-weight: ${typography.fontWeight};`);
    }
    if (typography.lineHeight) {
        styles.push(`line-height: ${typography.lineHeight};`);
    }
    if (typography.letterSpacing) {
        styles.push(`letter-spacing: ${typography.letterSpacing};`);
    }
    if (typography.textTransform && typography.textTransform !== 'none') {
        styles.push(`text-transform: ${typography.textTransform};`);
    }
    if (typography.textDecoration && typography.textDecoration !== 'none') {
        styles.push(`text-decoration: ${typography.textDecoration};`);
    }
    if (typography.textAlign) {
        styles.push(`text-align: ${typography.textAlign};`);
    }

    return styles.join(' ');
};

export default generateTypographyControlStyles;
