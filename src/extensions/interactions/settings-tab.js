import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { group as groupIcon } from '@wordpress/icons';
import InteractionsBuilder from './components/InteractionsBuilder';

function InteractionsSettingsWrapper({ onClose }) {
    return (
        <InteractionsBuilder
            isOpen={true}
            onClose={onClose}
            isEmbedded={true}
        />
    );
}

addFilter(
	'blockish.editorSettingsTabs',
	'blockish/interactions',
	(tabs) => {
		tabs.push({
			name: 'interactions',
			title: __('Interactions', 'blockish'),
			description: __('Configure interactive elements globally.', 'blockish'),
			render: InteractionsSettingsWrapper,
		});
		return tabs;
	}
);
