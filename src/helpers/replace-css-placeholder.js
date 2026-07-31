const replaceCssPlaceholders = (value, attribute) => {
    // Intercept full spacing shorthands to generate single properties instead of defaulting to 0
    if (value.includes('{{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}}')) {
        let top = attribute?.top || attribute?.TOP;
        let right = attribute?.right || attribute?.RIGHT;
        let bottom = attribute?.bottom || attribute?.BOTTOM;
        let left = attribute?.left || attribute?.LEFT;
        
        if (typeof attribute === 'string' || typeof attribute === 'number') {
            top = right = bottom = left = attribute;
        }

        const resolveSpacing = (val) => {
            if (typeof val === 'string' && val.includes('var:preset|spacing')) {
                return `var(${val.replace(/var:|[|]/g, m => (m === "var:" ? "--wp--" : "--"))})`;
            }
            return val;
        };

        top = resolveSpacing(top);
        right = resolveSpacing(right);
        bottom = resolveSpacing(bottom);
        left = resolveSpacing(left);

        const hasVal = (v) => v !== undefined && v !== null && v !== '';

        if (hasVal(top) && hasVal(right) && hasVal(bottom) && hasVal(left)) {
            value = value.replace(/padding:\s*\{\{TOP\}\}\s*\{\{RIGHT\}\}\s*\{\{BOTTOM\}\}\s*\{\{LEFT\}\};?/g, `padding: ${top} ${right} ${bottom} ${left};`);
            value = value.replace(/margin:\s*\{\{TOP\}\}\s*\{\{RIGHT\}\}\s*\{\{BOTTOM\}\}\s*\{\{LEFT\}\};?/g, `margin: ${top} ${right} ${bottom} ${left};`);
        } else {
            let pCss = '';
            if (hasVal(top)) pCss += `padding-top: ${top}; `;
            if (hasVal(right)) pCss += `padding-right: ${right}; `;
            if (hasVal(bottom)) pCss += `padding-bottom: ${bottom}; `;
            if (hasVal(left)) pCss += `padding-left: ${left}; `;
            value = value.replace(/padding:\s*\{\{TOP\}\}\s*\{\{RIGHT\}\}\s*\{\{BOTTOM\}\}\s*\{\{LEFT\}\};?/g, pCss.trim());

            let mCss = '';
            if (hasVal(top)) mCss += `margin-top: ${top}; `;
            if (hasVal(right)) mCss += `margin-right: ${right}; `;
            if (hasVal(bottom)) mCss += `margin-bottom: ${bottom}; `;
            if (hasVal(left)) mCss += `margin-left: ${left}; `;
            value = value.replace(/margin:\s*\{\{TOP\}\}\s*\{\{RIGHT\}\}\s*\{\{BOTTOM\}\}\s*\{\{LEFT\}\};?/g, mCss.trim());
        }
    }

    // Intercept full border-radius shorthands
    if (value.includes('{{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}}')) {
        let topLeft = attribute?.topLeft;
        let topRight = attribute?.topRight;
        let bottomRight = attribute?.bottomRight;
        let bottomLeft = attribute?.bottomLeft;
        
        if (typeof attribute === 'string' || typeof attribute === 'number') {
            topLeft = topRight = bottomRight = bottomLeft = attribute;
        }

        const hasVal = (v) => v !== undefined && v !== null && v !== '';

        if (hasVal(topLeft) && hasVal(topRight) && hasVal(bottomRight) && hasVal(bottomLeft)) {
            value = value.replace(/border-radius:\s*\{\{TOP_LEFT\}\}\s*\{\{TOP_RIGHT\}\}\s*\{\{BOTTOM_RIGHT\}\}\s*\{\{BOTTOM_LEFT\}\};?/g, `border-radius: ${topLeft} ${topRight} ${bottomRight} ${bottomLeft};`);
        } else {
            let css = '';
            if (hasVal(topLeft)) css += `border-top-left-radius: ${topLeft}; `;
            if (hasVal(topRight)) css += `border-top-right-radius: ${topRight}; `;
            if (hasVal(bottomRight)) css += `border-bottom-right-radius: ${bottomRight}; `;
            if (hasVal(bottomLeft)) css += `border-bottom-left-radius: ${bottomLeft}; `;
            value = value.replace(/border-radius:\s*\{\{TOP_LEFT\}\}\s*\{\{TOP_RIGHT\}\}\s*\{\{BOTTOM_RIGHT\}\}\s*\{\{BOTTOM_LEFT\}\};?/g, css.trim());
        }
    }

    const { reservedPlaceholder } = window.blockish.helpers;
    reservedPlaceholder.forEach(placeholder => {
        if (value.includes(placeholder)) {
            switch (placeholder) {
                case '{{VALUE}}':
                    let attrbuteValue = '';
                    if (attribute && (typeof attribute === 'string' || typeof attribute === 'number')) {
                        if(typeof attribute === 'string' && attribute?.includes('--wp--preset--')) {
                            let value = attribute.split('|');
                            attrbuteValue = value.length > 1 ? `var(${value[0]}, ${value[1]})` : attribute;
                        } else {
                            attrbuteValue = attribute;
                        }
                    }

                    if (attribute && typeof attribute === 'object' && attribute?.value && typeof attribute.value === 'string') {
                        attrbuteValue = attribute.value;
                    }

                    value = value.replaceAll(placeholder, attrbuteValue ?? '');
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
                case '{{TOP_LEFT}}':
                    let topLeftValue = '0';
                    
                    if (attribute && typeof attribute === 'object' && attribute?.topLeft) {
                        topLeftValue = attribute.topLeft;
                    }

                    if (attribute && typeof attribute === 'string') {
                        topLeftValue = attribute;
                    }

                    value = value.replace(placeholder, topLeftValue ?? '');
                    break;
                case '{{TOP_RIGHT}}':
                    let topRightValue = '0';

                    if (attribute && typeof attribute === 'object' && attribute?.topRight ) {
                        topRightValue = attribute.topRight;
                    }

                    if (attribute && typeof attribute === 'string') {
                        topRightValue = attribute;
                    }

                    value = value.replace(placeholder, topRightValue ?? '');
                    break;
                case '{{BOTTOM_LEFT}}':
                    let bottomLeftValue = '0';
                    if (attribute && typeof attribute === 'object' && attribute?.bottomLeft) {
                        bottomLeftValue = attribute.bottomLeft;
                    }

                    if (attribute && typeof attribute === 'string') {
                        bottomLeftValue = attribute;
                    }

                    value = value.replace(placeholder, bottomLeftValue ?? '');
                    break;
                case '{{BOTTOM_RIGHT}}':
                    let bottomRightValue = '0';
                    if (attribute && typeof attribute === 'object' && attribute?.bottomRight) {
                        bottomRightValue = attribute.bottomRight;
                    }

                    if (attribute && typeof attribute === 'string') {
                        bottomRightValue = attribute;
                    }

                    value = value.replace(placeholder, bottomRightValue ?? '');
                    break;
            }
        }
    });

    return value;
};

export default replaceCssPlaceholders;