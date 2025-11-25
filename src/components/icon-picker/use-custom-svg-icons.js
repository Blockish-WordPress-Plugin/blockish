import { useState, useCallback, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

const NAMESPACE = 'blockish/v1';
const BASE_ROUTE = 'custom-svg-icons';

export function useCustomSVGIcons() {
    const [icons, setIcons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch All Icons
     */
    const fetchIcons = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch({
                path: addQueryArgs(`${NAMESPACE}/${BASE_ROUTE}`, {})
            });

            const icons = [];

            for (const key in response) {
                const icon = response[key];
                icons.push({
                    slug: key,
                    ...icon
                });
            }

            setIcons(icons);
            
        } catch (err) {
            console.error('Fetch Icons Error:', err);
            setError(err.message);
        }

        setLoading(false);
    }, []);

    /**
     * Create a new SVG icon
     */
    const createIcon = useCallback(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await apiFetch({
                path: `${NAMESPACE}/${BASE_ROUTE}`,
                method: 'POST',
                body: formData,
            });

            await fetchIcons(); // Refresh list

            return response;
        } catch (err) {
            console.error('Create Icon Error:', err);
            setError(err.message);
            throw err;
        }
    }, [fetchIcons]);

    /**
     * Update icon
     * Accepts:
     * - slug
     * - data: { file?, label?, category?, terms? }
     */
    const updateIcon = useCallback(async (slug, data) => {
        const formData = new FormData();

        if (data.file) formData.append('file', data.file);
        if (data.label) formData.append('label', data.label);
        if (data.category) formData.append('category', data.category);
        if (data.terms) {
            data.terms.forEach((t) => formData.append('terms[]', t));
        }

        try {
            const response = await apiFetch({
                path: `${NAMESPACE}/${BASE_ROUTE}/${slug}`,
                method: 'POST', // using POST override
                body: formData
            });

            await fetchIcons();

            return response;
        } catch (err) {
            console.error('Update Icon Error:', err);
            setError(err.message);
            throw err;
        }
    }, [fetchIcons]);

    /**
     * Delete Icon
     */
    const deleteIcon = useCallback(async (slug) => {
        try {
            const response = await apiFetch({
                path: `${NAMESPACE}/${BASE_ROUTE}/${slug}`,
                method: 'DELETE'
            });

            await fetchIcons();

            return response;
        } catch (err) {
            console.error('Delete Icon Error:', err);
            setError(err.message);
            throw err;
        }
    }, [fetchIcons]);

    /**
     * Auto-load icons initially
     */
    useEffect(() => {
        fetchIcons();
    }, [fetchIcons]);

    return {
        icons,
        loading,
        error,
        fetchIcons,
        createIcon,
        updateIcon,
        deleteIcon,
    };
}
