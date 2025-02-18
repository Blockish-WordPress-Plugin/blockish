const getValue = (originalValue, device) => {
    if (!originalValue) return undefined; // Directly return if fullValue is falsy

    if (typeof originalValue === 'object') {
        return originalValue;
    }

    if (typeof originalValue === 'string') {
        try {
            const convertedValue = JSON.parse(originalValue);
            return convertedValue || undefined;
        } catch (error) {
            console.error("Invalid JSON string:", originalValue);
        }
    }
}