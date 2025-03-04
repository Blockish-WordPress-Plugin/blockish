const getValue = (originalValue, device) => {
    let modifiedValue = {};

    // Parse JSON if originalValue is a string
    if (typeof originalValue === 'string') {
        try {
            modifiedValue = JSON.parse(originalValue);
        } catch {
            modifiedValue = {};
        }
    } else {
        modifiedValue = { ...originalValue };
    }

    // Extract width for the specific device
    if (modifiedValue.width && typeof modifiedValue.width === 'object') {
        modifiedValue.width = modifiedValue.width[device] || null; // Get width for the current device
    }

    // Handle unlinked borders (left, right, top, bottom)
    ["left", "right", "top", "bottom"].forEach((side) => {
        if (modifiedValue[side] && typeof modifiedValue[side] === "object") {
            modifiedValue[side] = {
                ...modifiedValue[side],
                width: modifiedValue[side].width?.[device] || null, // Extract width for the current device
            };
        }
    });

    return modifiedValue;
};

export default getValue;
