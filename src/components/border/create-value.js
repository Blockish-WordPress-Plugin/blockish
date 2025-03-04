const createValue = (original, nextValue, device) => {
    let value = { ...nextValue };

    // Helper function to merge width values without replacing the object
    const mergeWidth = (currentWidth, newWidth, device) => {
        let widthObj = typeof currentWidth === "object" ? { ...currentWidth } : {};
        widthObj[device] = newWidth; // Add or update the specific device width
        return widthObj;
    };

    // If `original` exists, parse it (since it's stored as a JSON string)
    let parsedOriginal = {};
    try {
        parsedOriginal = typeof original === "string" ? JSON.parse(original) : original;
    } catch {
        parsedOriginal = {};
    }

    // Process linked border (`width` at the root level)
    if (value.width) {
        value.width = mergeWidth(parsedOriginal?.width, value.width, device);
    }

    // Process unlinked borders (`left`, `right`, etc.)
    ["left", "right", "top", "bottom"].forEach((side) => {
        if (value[side] && typeof value[side] === "object") {
            value[side] = {
                ...value[side],
                width: mergeWidth(parsedOriginal?.[side]?.width, value[side].width, device),
            };
        }
    });

    return JSON.stringify(value);
};

export default createValue;
