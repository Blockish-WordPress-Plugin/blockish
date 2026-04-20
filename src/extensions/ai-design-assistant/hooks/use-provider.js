import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { EXTENSION_SLUG, PROVIDERS } from '../constants';
import { toggleProvider } from '../utils/provider';

export default function useProvider() {
	const [activeProvider, setActiveProvider] = useState('openai');
	const [providerSaving, setProviderSaving] = useState(false);
	const [extensionSnapshot, setExtensionSnapshot] = useState(null);

	useEffect(() => {
		let isMounted = true;
		const extensionsPath =
			window?.blockishDashboardData?.extensionsApiPath || '/blockish/v1/extensions';

		const loadProvider = async () => {
			try {
				const response = await apiFetch({ path: extensionsPath, method: 'GET' });
				const extension = response?.extensions?.[EXTENSION_SLUG] || null;
				const provider = extension?.settings?.provider;

				if (!isMounted) {
					return;
				}

				setExtensionSnapshot(extension);
				if (PROVIDERS.includes(provider)) {
					setActiveProvider(provider);
				}
			} catch (error) {
				// Keep current local default if fetch fails.
			}
		};

		loadProvider();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleProviderChange = async () => {
		if (providerSaving) {
			return;
		}

		const previousProvider = activeProvider;
		const nextProvider = toggleProvider(activeProvider);
		const extensionsPath =
			window?.blockishDashboardData?.extensionsApiPath || '/blockish/v1/extensions';

		setProviderSaving(true);
		setActiveProvider(nextProvider);

		try {
			const response = await apiFetch({
				path: extensionsPath,
				method: 'POST',
				data: {
					extensions: {
						[EXTENSION_SLUG]: {
							status: extensionSnapshot?.status || 'active',
							settings: {
								...(extensionSnapshot?.settings || {}),
								provider: nextProvider,
							},
						},
					},
				},
			});

			const nextSnapshot = response?.extensions?.[EXTENSION_SLUG] || null;
			setExtensionSnapshot(nextSnapshot);
			if (PROVIDERS.includes(nextSnapshot?.settings?.provider)) {
				setActiveProvider(nextSnapshot.settings.provider);
			}
		} catch (error) {
			setActiveProvider(previousProvider);
		} finally {
			setProviderSaving(false);
		}
	};

	return {
		activeProvider,
		providerSaving,
		handleProviderChange,
	};
}
