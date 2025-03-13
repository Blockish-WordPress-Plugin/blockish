import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

export const fetchFonts = async (args = {}) => {
    try {
        const url = addQueryArgs('/blockish/v1/fonts', args);
        const response = await apiFetch({
            path: url,
        });
        return response;
    } catch (error) {
        console.error('Error fetching fonts:', error);
        return [];
    }
};

export const getFontByID = async (id) => {
    if (!id) return null;

    try {
        const response = await apiFetch({ path: `/blockish/v1/fonts/${id}` });

        if (!response || typeof response !== 'object') {
            throw new Error('Invalid API response');
        }

        return response;
    } catch (error) {
        console.error('Error fetching font:', error);
        return null;
    }
};
