import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';
import {
	Button,
	Flex,
	FlexBlock,
	Modal,
	SearchControl,
	TextControl,
	ToggleControl,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { EXTENSION_CONTROL_MAP, EXTENSION_FILTERS, getExtensionCategoryKey } from '../utils';
import ExtensionCard from './extension-card';

function humanizeSlug(slug) {
	return (slug || '')
		.split('-')
		.map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : ''))
		.join(' ');
}

function getExtensionSettingsInitialState(slug) {
	const schema = EXTENSION_CONTROL_MAP?.[slug]?.controls || [];
	const next = {};

	schema.forEach((control) => {
		next[control.key] = control.type === 'toggle' ? false : '';
	});

	return next;
}

export default function ExtensionsPage({
	extensions = {},
	isSaving,
	onToggleExtension,
	onSetAllExtensionStatus,
	onSaveExtensionSettings,
}) {
	const [searchTerm, setSearchTerm] = useState('');
	const [activeFilter, setActiveFilter] = useState('all');
	const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);
	const [selectedExtensionSlug, setSelectedExtensionSlug] = useState(null);
	const [globalControls, setGlobalControls] = useState({
		enableSafeMode: true,
		autoEnableOnInstall: false,
	});
	const [extensionSettings, setExtensionSettings] = useState({});

	const allExtensions = useMemo(() => {
		return Object.entries(extensions || {}).map(([slug, item]) => {
			const categoryKey = getExtensionCategoryKey(item, slug);
			return {
				slug,
				name: item?.name || humanizeSlug(slug),
				status: item?.status === 'inactive' ? 'inactive' : 'active',
				categoryKey,
				categoryLabel:
					categoryKey === 'animation' ? __('Animation', 'blockish') : __('General', 'blockish'),
				description: item?.description || __('Extension module', 'blockish'),
				hasSpecialControls: Boolean(EXTENSION_CONTROL_MAP[slug]),
			};
		});
	}, [extensions]);

	const filteredExtensions = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();

		return allExtensions.filter((extension) => {
			const matchesFilter = activeFilter === 'all' || extension.categoryKey === activeFilter;
			const matchesSearch =
				!normalizedSearch ||
				extension.name.toLowerCase().includes(normalizedSearch) ||
				extension.slug.toLowerCase().includes(normalizedSearch);

			return matchesFilter && matchesSearch;
		});
	}, [allExtensions, activeFilter, searchTerm]);

	const activeCount = useMemo(
		() => allExtensions.filter((extension) => extension.status === 'active').length,
		[allExtensions]
	);

	const selectedSchema = selectedExtensionSlug ? EXTENSION_CONTROL_MAP[selectedExtensionSlug] : null;
	const selectedExtension = selectedExtensionSlug ? extensions?.[selectedExtensionSlug] : null;
	const savedSettings = selectedExtension?.settings || {};
	const selectedValues =
		(selectedExtensionSlug && extensionSettings[selectedExtensionSlug]) ||
		getExtensionSettingsInitialState(selectedExtensionSlug);

	const updateGlobalControl = (key, value) => {
		setGlobalControls((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const updateExtensionControl = (slug, key, value) => {
		setExtensionSettings((prev) => ({
			...prev,
			[slug]: {
				...getExtensionSettingsInitialState(slug),
				...(prev[slug] || {}),
				[key]: value,
			},
		}));
	};

	const handleSaveSettings = () => {
		if (!selectedExtensionSlug) {
			return;
		}
		const payload = {
			...(savedSettings || {}),
			...(extensionSettings[selectedExtensionSlug] || {}),
		};
		onSaveExtensionSettings?.(selectedExtensionSlug, payload);
		setSelectedExtensionSlug(null);
	};

	return (
		<VStack className="blockish-blocks-page" spacing={5}>
			<VStack spacing={1}>
				<Heading className="blockish-heading-primary" level={1}>
					{__('Extensions', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{sprintf(
						__('Enable or disable extensions. %1$d of %2$d extensions active.', 'blockish'),
						activeCount,
						allExtensions.length
					)}
				</Text>
			</VStack>

			<section className="blockish-panel blockish-block-controls">
				<Flex className="blockish-block-controls-top" justify="space-between" align="center">
					<FlexBlock className="blockish-block-search-wrap">
						<SearchControl
							placeholder={__('Search extensions...', 'blockish')}
							value={searchTerm}
							onChange={setSearchTerm}
						/>
					</FlexBlock>
					<HStack justify="flex-end" className="blockish-block-actions">
						<Button
							className="blockish-action-button is-secondary blockish-button-base blockish-button-secondary"
							variant="secondary"
							disabled={isSaving || allExtensions.length === 0}
							onClick={() => onSetAllExtensionStatus('active')}
						>
							{__('Enable All', 'blockish')}
						</Button>
						<Button
							className="blockish-action-button is-secondary blockish-button-base blockish-button-secondary"
							variant="secondary"
							disabled={isSaving || allExtensions.length === 0}
							onClick={() => onSetAllExtensionStatus('inactive')}
						>
							{__('Disable All', 'blockish')}
						</Button>
					</HStack>
				</Flex>

				{EXTENSION_FILTERS.length > 1 && (
					<HStack className="blockish-category-filter" justify="flex-start">
						{EXTENSION_FILTERS.map((filter) => (
							<Button
								key={filter.key}
								className={`blockish-filter-button blockish-button-base ${activeFilter === filter.key ? 'is-active' : ''}`}
								variant="tertiary"
								onClick={() => setActiveFilter(filter.key)}
							>
								{__(filter.label, 'blockish')}
							</Button>
						))}
					</HStack>
				)}
			</section>

			<div className="blockish-block-grid">
				{filteredExtensions.map((extension) => (
					<ExtensionCard
						key={extension.slug}
						extension={extension}
						isSaving={isSaving}
						onToggle={onToggleExtension}
						onOpenSettings={setSelectedExtensionSlug}
					/>
				))}
			</div>

			{filteredExtensions.length === 0 && (
				<section className="blockish-panel">
					<Text className="blockish-text-muted">{__('No extensions found for this filter.', 'blockish')}</Text>
				</section>
			)}

			{isGlobalModalOpen && (
				<Modal
					title={__('Global Extension Controls', 'blockish')}
					onRequestClose={() => setIsGlobalModalOpen(false)}
				>
					<VStack className="blockish-modal-controls" spacing={4}>
						<ToggleControl
							className="blockish-toggle-control"
							label={__('Enable Safe Mode', 'blockish')}
							checked={Boolean(globalControls.enableSafeMode)}
							onChange={(value) => updateGlobalControl('enableSafeMode', value)}
						/>
						<ToggleControl
							className="blockish-toggle-control"
							label={__('Auto-enable on install', 'blockish')}
							checked={Boolean(globalControls.autoEnableOnInstall)}
							onChange={(value) => updateGlobalControl('autoEnableOnInstall', value)}
						/>
						<Text variant="muted">
							{__('These global controls are prepared for central settings wiring.', 'blockish')}
						</Text>
					</VStack>
				</Modal>
			)}

			{selectedSchema && (
				<Modal
					title={__(selectedSchema.title, 'blockish')}
					className="blockish-configure-modal"
					onRequestClose={() => setSelectedExtensionSlug(null)}
				>
					<VStack className="blockish-modal-controls" spacing={4}>
						{selectedSchema.controls.map((control) => {
							const value = selectedValues[control.key];
							if (control.type === 'toggle') {
								return (
									<ToggleControl
										key={control.key}
										className="blockish-toggle-control"
										label={__(control.label, 'blockish')}
										checked={Boolean(value ?? savedSettings[control.key])}
										onChange={(next) =>
											updateExtensionControl(selectedExtensionSlug, control.key, next)
										}
									/>
								);
							}

							return (
								<TextControl
									key={control.key}
									label={__(control.label, 'blockish')}
									value={(value ?? savedSettings[control.key]) || ''}
									onChange={(next) =>
										updateExtensionControl(selectedExtensionSlug, control.key, next)
									}
								/>
							);
						})}
						<Text variant="muted">
							{__('Special extension controls are ready and can be persisted when API fields are added.', 'blockish')}
						</Text>
						<Button
							className="blockish-action-button is-primary blockish-button-base blockish-button-primary"
							variant="primary"
							onClick={handleSaveSettings}
						>
							{__('Save Settings', 'blockish')}
						</Button>
					</VStack>
				</Modal>
			)}
		</VStack>
	);
}
