const isResponsiveValue = function (value, deviceList) {
    if (typeof value === 'object') {
        for (const key in value) {
            const isKeyResponsive = deviceList.find((device) => device.slug === key);
            if (isKeyResponsive) {
                return true;
            }
        }
    }
    return false;
};

export default isResponsiveValue;