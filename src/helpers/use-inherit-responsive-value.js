const useInheritResponsiveValue = (value) => {
    const { useDeviceType, useDeviceList } = window.blockish.helpers;

    const deviceType = useDeviceType();
    const deviceList = useDeviceList();

    if (typeof value === 'object') {
        if (value[deviceType]) {
            return value[deviceType];
        }

        // Find the index of the current device in the device list
        const currentIndex = deviceList.findIndex(device => device.slug === deviceType);

        // Start from the current device and go up to inherit values
        for (let i = currentIndex; i >= 0; i--) {
            if (value[deviceList[i].slug]) {
                return value[deviceList[i].slug];
            }
        }
    }

    return undefined;
};

export default useInheritResponsiveValue;
