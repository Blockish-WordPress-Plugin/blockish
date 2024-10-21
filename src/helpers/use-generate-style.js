import { useMemo } from '@wordpress/element';

const useGenerateStyles = (wrapper, generateStyleObject) => {
    const { generateStyles } = window.boilerplateBlocks.helpers;

    return useMemo(() => {
        // Call the provided callback to get the style object
        const styles = generateStyleObject();
        
        // If no styles are provided, return an empty string
        if (!styles || Object.keys(styles).length === 0) {
            return '';
        }

        // Use the helper function to generate the final styles
        return generateStyles(wrapper, styles);
    }, [generateStyleObject]);
};

export default useGenerateStyles;
