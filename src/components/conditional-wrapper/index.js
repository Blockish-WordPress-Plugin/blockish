const BlockishConditionalWrapper = ({ condition = true, wrapper, children }) => (condition ? wrapper(children) : children);

export default BlockishConditionalWrapper;