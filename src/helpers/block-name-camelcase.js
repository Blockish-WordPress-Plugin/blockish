const blockNameCamelcase = (blockName) => {
    // Check if the input is a valid string and contains a '/'
    if (typeof blockName !== 'string' || !blockName.includes('/')) {
        return blockName; // Return as-is if it's not a string or doesn't contain '/'
    }

    // Split the string by '/' and get the part after it
    const parts = blockName.split('/');
    const afterSlash = parts[1] || ''; // Ensure there's something after the slash

    // Convert to camelCase after dash
    return afterSlash.split('-').map((word, index) => {
        if (index === 0) {
            return word.toLowerCase(); // First word stays lowercase
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(); // Capitalize first letter of subsequent words
    }).join('');
};

export default blockNameCamelcase;