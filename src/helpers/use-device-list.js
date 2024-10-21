import { desktop, tablet, mobile } from '@wordpress/icons';
const useDeviceList = () => {
    return [
        {
            label: 'Desktop',
            value: 'base',
            slug: 'Desktop',
            icon: desktop
        },
        {
            label: 'Tablet',
            value: '1024px',
            slug: 'Tablet',
            icon: tablet
        },
        {
            label: 'Mobile',
            value: '767px',
            slug: 'Mobile',
            icon: mobile
        }
    ];
}

export default useDeviceList;