import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import ClassManagerPanelApp from './components/panel-app';

addFilter(
	'blockish.editorSettingsTabs',
	'blockish/class-manager',
	(tabs) => {
		tabs.push({
			name: 'class-manager',
			title: __('Class Manager', 'blockish'),
			description: __('Manage global classes and styles.', 'blockish'),
			render: ClassManagerPanelApp,
		});
		return tabs;
	}
);
