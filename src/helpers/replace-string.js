const replaceString = (str, inputString, outputString) => {
    // Basic validation with warnings instead of throwing errors
    if (typeof str !== 'string') {
        console.warn('First argument must be a string. Returning original input.');
        return str; // Return the original value if it's not a string
    }
    
    if (typeof inputString !== 'string' || !inputString) {
        console.warn('Second argument (inputString) must be a non-empty string. Returning original input.');
        return str; // Return original string if inputString is invalid
    }
    
    if (typeof outputString !== 'string') {
        console.warn('Third argument (outputString) must be a string. Using an empty string as default.');
        outputString = ''; // Default to an empty string if outputString is invalid
    }

    // Replace all occurrences of inputString, escape special regex characters
    const regex = new RegExp(inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    return str.replace(regex, outputString);
};

export default replaceString;