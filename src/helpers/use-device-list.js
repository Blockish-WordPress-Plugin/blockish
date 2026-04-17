const useDeviceList = () => {
    const { deviceList } = window?.blockish?.helpers;
    return deviceList;
};

export default useDeviceList;