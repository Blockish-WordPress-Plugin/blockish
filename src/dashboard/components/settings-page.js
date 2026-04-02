import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	Flex,
	FormToggle,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';

const SETTINGS_SECTIONS = [
	{
		key: 'general',
		title: __('General', 'blockish'),
		items: [
			{
				key: 'loadBlocksConditionally',
				label: __('Load blocks conditionally', 'blockish'),
				description: __('Only load block assets when used on a page', 'blockish'),
				defaultValue: true,
			},
			{
				key: 'disableFrontendStyles',
				label: __('Disable frontend styles', 'blockish'),
				description: __('Prevent plugin from loading frontend CSS', 'blockish'),
				defaultValue: false,
			},
			{
				key: 'lazyLoadBlockAssets',
				label: __('Lazy load block assets', 'blockish'),
				description: __('Defer loading of non-critical block resources', 'blockish'),
				defaultValue: true,
			},
		],
	},
	{
		key: 'editor',
		title: __('Editor', 'blockish'),
		items: [
			{
				key: 'enableBlockVariations',
				label: __('Enable block variations', 'blockish'),
				description: __('Show style variations for each block', 'blockish'),
				defaultValue: true,
			},
			{
				key: 'editorOnlyStyles',
				label: __('Editor-only styles', 'blockish'),
				description: __('Load additional styles in the block editor', 'blockish'),
				defaultValue: true,
			},
			{
				key: 'previewMode',
				label: __('Preview mode', 'blockish'),
				description: __('Enable live preview for all blocks', 'blockish'),
				defaultValue: false,
			},
		],
	},
];

function getInitialSettings() {
	return SETTINGS_SECTIONS.reduce((next, section) => {
		section.items.forEach((item) => {
			next[item.key] = item.defaultValue;
		});

		return next;
	}, {});
}

export default function SettingsPage() {
	const [settings, setSettings] = useState(getInitialSettings);

	return (
		<VStack className="blockish-settings-page" spacing={6}>
			<header className="blockish-page-header">
				<Heading className="blockish-heading-primary" level={1}>
					{__('Settings', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{__('Configure global plugin options', 'blockish')}
				</Text>
			</header>

			{SETTINGS_SECTIONS.map((section) => (
				<section key={section.key} className="blockish-settings-panel">
					<Heading className="blockish-heading-secondary blockish-settings-panel-title" level={2}>
						{section.title}
					</Heading>

					<div className="blockish-settings-list">
						{section.items.map((item, index) => (
							<Flex
								key={item.key}
								className={`blockish-settings-row ${
									index < section.items.length - 1 ? 'has-divider' : ''
								}`}
								justify="space-between"
								align="center"
							>
								<div className="blockish-settings-row-content">
									<Heading className="blockish-heading-tertiary blockish-settings-row-title" level={3}>
										{item.label}
									</Heading>
									<Text className="blockish-text-muted">{item.description}</Text>
								</div>
								<FormToggle
									className="blockish-block-toggle"
									checked={Boolean(settings[item.key])}
									onChange={(event) =>
										setSettings((prev) => ({
											...prev,
											[item.key]: event.target.checked,
										}))
									}
								/>
							</Flex>
						))}
					</div>
				</section>
			))}
		</VStack>
	);
}
