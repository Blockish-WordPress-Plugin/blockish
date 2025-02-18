const createValue = (original, value) => {
    let newValue = {};

    if (typeof original === 'object' && original !== null) {
        newValue = { ...original };
    } else if (typeof original === 'string') {
        try {
            newValue = JSON.parse(original) || {};
        } catch {
            newValue = {};
        }
    }

    if (typeof value === 'string' && value.includes('=')) {
        try {
            const newOriginal = (typeof original === 'string' ? original : '') + value;
            newValue = { ...JSON.parse(newOriginal) };
        } catch {
            newValue = {};
        }
    } else if (typeof value === 'object' && value !== null) {
        newValue = { ...newValue, ...value };
    }

    return JSON.stringify(newValue);
}

export default createValue;
