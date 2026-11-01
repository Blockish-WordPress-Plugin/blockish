import { applyFilters } from '@wordpress/hooks';
import ClassManagerSettings from './class-manager-settings';
import DefaultExtensionSettings from './default-extension-settings';

/**
 * Custom settings modal for an extension, or null. Add-ons register theirs
 * with the `blockish.dashboard.extensionSettings` filter (slug → component
 * receiving { extension, onRequestClose }).
 */
export function getCustomExtensionSettings(slug) {
	if (slug === 'class-manager') {
		return ClassManagerSettings;
	}

	return applyFilters('blockish.dashboard.extensionSettings', null, slug);
}

export function getExtensionSettingsComponent(slug) {
	return getCustomExtensionSettings(slug) || DefaultExtensionSettings;
}
