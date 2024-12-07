const replaceCssPlaceholders = (value, attribute) => {
    const { reservedPlaceholder } = window.boilerplateBlocks.helpers;
    reservedPlaceholder.forEach(placeholder => {
        if (value.includes(placeholder)) {
            switch (placeholder) {
                case '{{VALUE}}':
                    let attrbuteValue = '';
                    if (attribute && (typeof attribute === 'string' || typeof attribute === 'number')) {
                        attrbuteValue = attribute;
                    }

                    if (attribute && typeof attribute === 'object' && attribute?.value && typeof attribute.value === 'string') {
                        attrbuteValue = attribute.value;
                    }

                    value = value.replace(placeholder, attrbuteValue ?? '');
                    break;
                case '{{TOP}}':
                    let topValue = '0';
                    if (attribute && typeof attribute === 'object' && attribute?.top && (typeof attribute.top === 'string' || typeof attribute.top === 'number')) {
                        topValue = attribute.top;
                    }

                    if (topValue && topValue.includes('var:preset|spacing')) {
                        topValue = `var(${topValue.replace(/var:|[|]/g, m => (m === "var:" ? "--wp--" : "--"))})`;
                    }

                    value = value.replace(placeholder, topValue ?? '');
                    break;
                case '{{BOTTOM}}':
                    let bottomValue = '0';
                    if (attribute && typeof attribute === 'object' && attribute?.bottom && (typeof attribute.bottom === 'string' || typeof attribute.bottom === 'number')) {
                        bottomValue = attribute.bottom;
                    }

                    if (bottomValue && bottomValue.includes('var:preset|spacing')) {
                        bottomValue = `var(${bottomValue.replace(/var:|[|]/g, m => (m === "var:" ? "--wp--" : "--"))})`;
                    }

                    value = value.replace(placeholder, bottomValue ?? '');
                    break;
                case '{{LEFT}}':
                    let leftValue = '0';
                    if (attribute && typeof attribute === 'object' && attribute?.left && (typeof attribute.left === 'string' || typeof attribute.left === 'number')) {
                        leftValue = attribute.left;
                    }

                    if (leftValue && leftValue.includes('var:preset|spacing')) {
                        leftValue = `var(${leftValue.replace(/var:|[|]/g, m => (m === "var:" ? "--wp--" : "--"))})`;
                    }

                    value = value.replace(placeholder, leftValue ?? '');
                    break;
                case '{{RIGHT}}':
                    let rightValue = '0';
                    if (attribute && typeof attribute === 'object' && attribute?.right && (typeof attribute.right === 'string' || typeof attribute.right === 'number')) {
                        rightValue = attribute.right;
                    }

                    if (rightValue && rightValue.includes('var:preset|spacing')) {
                        rightValue = `var(${rightValue.replace(/var:|[|]/g, m => (m === "var:" ? "--wp--" : "--"))})`;
                    }

                    value = value.replace(placeholder, rightValue ?? '');
                    break;
            }
        }
    });

    return value;
};

export default replaceCssPlaceholders;