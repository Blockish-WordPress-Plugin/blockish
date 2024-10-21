import { dispatch } from '@wordpress/data';

export const setDeviceType = (value) => {
    dispatch('core/editor').setDeviceType(value);
};