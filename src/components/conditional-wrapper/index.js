const BoilerplateConditionalWrapper = ({ condition = true, wrapper, children }) => (condition ? wrapper(children) : children);

export default BoilerplateConditionalWrapper;