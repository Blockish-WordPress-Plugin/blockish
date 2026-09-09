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
			description: __('Pending layouts: Accept (unwrap) or Discard. Resolve runs automatically when the editor opens.', 'blockish'),
			render: AiPreviewSettingsTab,
		});
		return tabs;
	},
	5
);
