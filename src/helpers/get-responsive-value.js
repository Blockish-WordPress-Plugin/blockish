const getResponsiveValue = (attributes, key, device) => {
    return attributes?.[`${key}${device}`]; 
}

export default getResponsiveValue;