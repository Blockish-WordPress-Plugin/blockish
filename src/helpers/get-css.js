const getSpacingValue = (value) => {
    if (value && value?.startsWith('var:preset|')) {
        // This is a WordPress preset, so we return the original WordPress variable
        return `var(--wp--preset--${value.replace('var:preset|', '').replace('|', '--')})`;
    }

    // Otherwise, return the custom value directly (like '84px')
    return value;
}
export { getSpacingValue };
