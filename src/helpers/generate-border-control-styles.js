const generateBorderControlStyles = (border, deviceSlug) => {
    let styles = '';

    if (border) {
        let borderObject = {};

        // Parse the border object (if it's a string)
        try {
            borderObject = typeof border === 'string' ? JSON.parse(border) : border;
        } catch {
            borderObject = {};
        }

        // Loop through the border properties to generate CSS
        for (const key in borderObject) {
            const value = borderObject[key];
            
            // Handle linked borders
            if (key === 'width' && value?.[deviceSlug]) {
                const style = borderObject.style || 'solid';
                const color = borderObject.color || '#000';
                
                styles += `border: ${value?.[deviceSlug]} ${style} ${color};`;
            }

            // Handle unlinked borders (left, right, top, bottom)
            if (['left', 'right', 'top', 'bottom'].includes(key) && value?.width?.[deviceSlug]) {
                const style = value.style || 'solid';
                const color = value.color || '#000';
                styles += `border-${key}: ${value.width[deviceSlug]} ${style} ${color};`;
            }
        }
    }

    return styles;
};

export default generateBorderControlStyles;
