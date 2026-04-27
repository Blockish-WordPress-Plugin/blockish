import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Flex,
	FlexBlock,
	SearchControl,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { EXTENSION_CONTROL_MAP, EXTENSION_FILTERS, getExtensionCategoryKey } from '../utils';
import ExtensionCard from './extension-card';
import { getExtensionSettingsComponent } from './settings';

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
	const [selectedExtensionSlug, setSelectedExtensionSlug] = useState(null);
	const [extensionSettings, setExtensionSettings] = useState({});
	const [configuredProviders, setConfiguredProviders] = useState({ openai: false, gemini: false });
	const integrationsPath = window?.blockishDashboardData?.integrationsApiPath || '/blockish/v1/integrations';

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
				hasSpecialControls: Boolean(EXTENSION_CONTROL_MAP[slug]) || slug === 'class-manager',
				sourceName: item?.addon_name || item?.source_name || 'Blockish',
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
	const filteredExtensionSlugs = useMemo(
		() => filteredExtensions.map((extension) => extension.slug),
		[filteredExtensions]
	);

	const selectedSchema = selectedExtensionSlug ? EXTENSION_CONTROL_MAP[selectedExtensionSlug] : null;
	const selectedExtension = selectedExtensionSlug ? extensions?.[selectedExtensionSlug] : null;
	const selectedDraft =
		(selectedExtensionSlug && extensionSettings[selectedExtensionSlug]) ||
		getExtensionSettingsInitialState(selectedExtensionSlug);
	const SettingsComponent = selectedExtensionSlug
		? getExtensionSettingsComponent(selectedExtensionSlug)
		: null;

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

	useEffect(() => {
		if (selectedExtensionSlug !== 'ai-design-assistant') {
			return;
		}

		const savedProvider = extensions?.[selectedExtensionSlug]?.settings?.provider || '';
		const draftProvider = extensionSettings?.[selectedExtensionSlug]?.provider || '';
		if (savedProvider || draftProvider) {
			return;
		}

		let isMounted = true;

		const resolveDefaultProvider = async () => {
			try {
				const response = await apiFetch({ path: integrationsPath, method: 'GET' });
				const integrations = response?.integrations || {};
				const openAiKey = integrations?.openai?.settings?.apiKey || '';
				const geminiKey = integrations?.gemini?.settings?.apiKey || '';
				setConfiguredProviders({
					openai: Boolean(openAiKey),
					gemini: Boolean(geminiKey),
				});

				const defaultProvider = openAiKey ? 'openai' : geminiKey ? 'gemini' : '';
				if (!isMounted || !defaultProvider) {
					return;
				}

				updateExtensionControl('ai-design-assistant', 'provider', defaultProvider);
			} catch (error) {
				setConfiguredProviders({ openai: false, gemini: false });
				// Keep manual selection flow if integrations API is unavailable.
			}
		};

		resolveDefaultProvider();

		return () => {
			isMounted = false;
		};
	}, [
		selectedExtensionSlug,
		extensions?.['ai-design-assistant']?.settings?.provider,
		extensionSettings?.['ai-design-assistant']?.provider,
		integrationsPath,
	]);

	const handleSaveSettings = () => {
		if (!selectedExtensionSlug) {
			return;
		}
		const payload = {
			...(selectedExtension?.settings || {}),
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
							disabled={isSaving || filteredExtensionSlugs.length === 0}
							onClick={() => onSetAllExtensionStatus('active', filteredExtensionSlugs)}
						>
							{__('Enable All', 'blockish')}
						</Button>
						<Button
							className="blockish-action-button is-secondary blockish-button-base blockish-button-secondary"
							variant="secondary"
							disabled={isSaving || filteredExtensionSlugs.length === 0}
							onClick={() => onSetAllExtensionStatus('inactive', filteredExtensionSlugs)}
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

			{SettingsComponent && selectedExtensionSlug === 'class-manager' && (
				<SettingsComponent isOpen onRequestClose={() => setSelectedExtensionSlug(null)} />
			)}

			{SettingsComponent && selectedExtensionSlug !== 'class-manager' && selectedSchema && (
				<SettingsComponent
					slug={selectedExtensionSlug}
					schema={selectedSchema}
					extension={selectedExtension}
					extensionDraft={selectedDraft}
					configuredProviders={configuredProviders}
					onChange={updateExtensionControl}
					onSave={handleSaveSettings}
					onRequestClose={() => setSelectedExtensionSlug(null)}
				/>
			)}
		</VStack>
	);
}
