const useStyle = (attributes = {}) => {
    const { useGenerateStyles, getSpacingValue } = window.boilerplateBlocks.helpers;
    const wrapper = `.${attributes?.blockClass}`;
    return useGenerateStyles(wrapper, () => {
        return {
            '--padding-top': getSpacingValue(attributes?.padding?.top),
            '--padding-right': getSpacingValue(attributes?.padding?.right),
            '--padding-bottom': getSpacingValue(attributes?.padding?.bottom),
            '--padding-left': getSpacingValue(attributes?.padding?.left),
            '--margin-top': getSpacingValue(attributes?.margin?.top),
            '--margin-right': getSpacingValue(attributes?.margin?.right),
            '--margin-bottom': getSpacingValue(attributes?.margin?.bottom),
            '--margin-left': getSpacingValue(attributes?.margin?.left),
        };
    });
}

export default useStyle;
