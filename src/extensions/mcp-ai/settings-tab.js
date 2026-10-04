import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import AiPreviewPendingList from './pending-list';

function AiPreviewSettingsTab() {
	return <AiPreviewPendingList />;
}

addFilter(
	'blockish.editorSettingsTabs',
	'blockish/ai-preview',
	(tabs) => {
		tabs.unshift({
			name: 'ai-preview',
			title: __('AI Preview', 'blockish'),
			description: __('AI layouts are live on your site once the editor opens. Accept to finalize, or Discard to restore the previous version.', 'blockish'),
			render: AiPreviewSettingsTab,
		});
		return tabs;
	},
	5
);
