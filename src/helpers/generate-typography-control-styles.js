/**
 * Generate CSS styles from typography values
 * This helper delegates to the BlockishTypography component's generateCSS method
 * to avoid code duplication and maintain a single source of truth.
 * 
 * @param {string|object} value - Typography value (can be JSON string or object)
 * @param {string} deviceSlug - Device slug (Desktop, Tablet, Mobile) - currently unused but kept for API consistency
 * @returns {string} CSS string with typography properties
 */
const generateTypographyControlStyles = (value, deviceSlug = 'Desktop') => {
    if (!value) return '';

    let typography;
    
    // Handle both string (JSON) and object values
    if (typeof value === 'string') {
        try {
            typography = JSON.parse(value);
        } catch (error) {
            console.error('Error parsing typography value:', error);
            return '';
        }
    } else if (typeof value === 'object') {
        typography = value;
    } else {
        return '';
    }

    if (!typography || typeof typography !== 'object') return '';

    // Use for CSS generation
    const BlockishTypography = window?.blockish?.components?.BlockishTypography;
    
    if (BlockishTypography?.generateCSS) {
        // Generate CSS without selector (just the properties)
        return BlockishTypography.generateCSS(typography, '').replace(/\n/g, ' ').trim();
    }

    // Fallback implementation if component method is not available
    // This should rarely happen, but provides resilience
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
