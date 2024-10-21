const generateStyles = (wrapper, styles) => {
    let styleString = '';
    let hasValidStyles = false; // Track if there are valid styles
    
    for (let key in styles) {
        const value = styles[key];

        // Validate the value (ensure it's not undefined, null, NaN, or an empty string)
        if (value !== undefined && value !== null && value !== '') {
            styleString += `${key}: ${value}; `;
            hasValidStyles = true; // Mark that we have at least one valid style
        }
    }
    
    // Return an empty string if no valid styles were found
    if (!hasValidStyles) {
        return '';
    }

    // Return the final CSS rule with the wrapper
    return `${wrapper} { ${styleString} }`;
}

export default generateStyles;