const getValue = (fullValue, key) => {
    if (!fullValue) return undefined; // Directly return if fullValue is falsy

    if (typeof fullValue === 'object') {
        return fullValue[key] || undefined;
    }

    if (typeof fullValue === 'string') {
        try {
            const convertedValue = JSON.parse(fullValue);
            return convertedValue?.[key] || undefined;
        } catch (error) {
            console.error("Invalid JSON string:", fullValue);
        }
    }

    return undefined;
}

export default getValue;