const setResponsiveValue = (setAttributes, key, value, device) => {
    setAttributes({[`${key}${device}`]: value});
}

export default setResponsiveValue;