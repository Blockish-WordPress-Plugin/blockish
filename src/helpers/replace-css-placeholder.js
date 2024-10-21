const replaceCssPlaceholders = (value, attribute) => {
    const { reservedPlaceholder } = window.boilerplateBlocks.helpers;
    reservedPlaceholder.forEach(placeholder => {
        if (value.includes(placeholder)) {
            switch (placeholder) {
                case '{{VALUE}}':
                    value = value.replace(placeholder, attribute ?? '');
                    break;
                case '{{TOP}}':
                    value = value.replace(placeholder, attribute?.top ?? '');
                    break;
                case '{{BOTTOM}}':
                    value = value.replace(placeholder, attribute?.bottom ?? '');
                    break;
                case '{{LEFT}}':
                    value = value.replace(placeholder, attribute?.left ?? '');
                    break;
                case '{{RIGHT}}':
                    value = value.replace(placeholder, attribute?.right ?? '');
                    break;
            }
        }
    });

    return value;
};

export default replaceCssPlaceholders;