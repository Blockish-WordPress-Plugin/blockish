import { useSelect } from '@wordpress/data';

const useDeviceType = () => {
  const deviceType = useSelect(
    (select) => {
      const store = wp?.editor?.store;
      return store ? select(store)?.getDeviceType?.() || 'Desktop' : 'Desktop';
    },
    []
  );

  return deviceType;
};

export default useDeviceType;

