function generateCssString(cssRules, breakpoints) {
    let finalCss = '';

    // Loop over each breakpoint
    for (const breakpoint of breakpoints) {
        let cssString = '';
        const breakpointKey = breakpoint.slug;

        if (cssRules[breakpointKey]) {
            for (const selector in cssRules[breakpointKey]) {
                const rules = cssRules[breakpointKey][selector];
                cssString += `${selector} { ${rules} }`;
            }
        }

        // If it's 'Desktop', we don't need media queries
        if (breakpointKey === 'Desktop') {
            finalCss += cssString;
        } else {
            // Add media query for other breakpoints
            finalCss += `@media screen and (max-width: ${breakpoint.value}) { ${cssString} }`;
        }
    }

    return finalCss;
}

export default generateCssString;
