import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Flex,
	Modal,
	TextControl,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { settingsIcon } from '../../components/icons/block-icons';
import openaiLogo from '../assets/logos/openai.png';
import geminiLogo from '../assets/logos/gemini.png';

const INTEGRATIONS = [
	{
		key: 'openai',
		name: 'OpenAI',
		logoUrl: openaiLogo,
		logoAlt: 'OpenAI logo',
		description: __('Connect OpenAI to power AI content and assistant features inside Blockish.', 'blockish'),
		status: 'connected',
	},
	{
		key: 'gemini',
		name: 'Gemini',
		logoUrl: geminiLogo,
		logoAlt: 'Gemini logo',
		description: __('Connect Gemini to run Google-powered generation and smart assistance workflows.', 'blockish'),
		status: 'connected',
	},
];

export default function IntegrationsPage() {
	const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState('');
	const [activeIntegrationKey, setActiveIntegrationKey] = useState('');
	const [savedApiKeys, setSavedApiKeys] = useState({});
	const [draftApiKey, setDraftApiKey] = useState('');
	const integrationsPath = window?.blockishDashboardData?.integrationsApiPath || '/blockish/v1/integrations';

	useEffect(() => {
		const loadIntegrations = async () => {
			setError('');
			try {
				const response = await apiFetch({ path: integrationsPath, method: 'GET' });
				const items = response?.integrations || {};
				const mapped = {};

				Object.entries(items).forEach(([slug, config]) => {
					const key = config?.settings?.apiKey || '';
					if (typeof key === 'string') {
						mapped[slug] = key;
					}
				});

				setSavedApiKeys(mapped);
			} catch (err) {
				setError(err?.message || __('Failed to load integrations settings', 'blockish'));
			}
		};

		loadIntegrations();
	}, [integrationsPath]);

	const connectedCount = useMemo(
		() => INTEGRATIONS.filter((item) => item.status === 'connected').length,
		[]
	);

	const activeIntegration = INTEGRATIONS.find((item) => item.key === activeIntegrationKey);

	const handleOpenConfigure = (integrationKey) => {
		setActiveIntegrationKey(integrationKey);
		setDraftApiKey(savedApiKeys[integrationKey] || '');
		setIsConfigureModalOpen(true);
	};

	const handleSaveConfiguration = () => {
		if (!activeIntegrationKey) {
			return;
		}

		const saveIntegration = async () => {
			setIsSaving(true);
			setError('');
			const nextApiKey = draftApiKey.trim();

			try {
				const response = await apiFetch({
					path: integrationsPath,
					method: 'POST',
					data: {
						integrations: {
							[activeIntegrationKey]: {
								settings: {
									apiKey: nextApiKey,
								},
							},
						},
					},
				});

				const saved = response?.integrations?.[activeIntegrationKey]?.settings?.apiKey || '';
				setSavedApiKeys((prev) => ({
					...prev,
					[activeIntegrationKey]: saved,
				}));
				setIsConfigureModalOpen(false);
			} catch (err) {
				setError(err?.message || __('Failed to save integration settings', 'blockish'));
			} finally {
				setIsSaving(false);
			}
		};

		saveIntegration();
	};

	const handleClearIntegration = (integrationKey) => {
		const clearIntegration = async () => {
			setIsSaving(true);
			setError('');
			try {
				const response = await apiFetch({
					path: integrationsPath,
					method: 'POST',
					data: {
						integrations: {
							[integrationKey]: {
								settings: {
									apiKey: '',
								},
							},
						},
					},
				});

				const saved = response?.integrations?.[integrationKey]?.settings?.apiKey || '';
				setSavedApiKeys((prev) => ({
					...prev,
					[integrationKey]: saved,
				}));
			} catch (err) {
				setError(err?.message || __('Failed to clear integration settings', 'blockish'));
			} finally {
				setIsSaving(false);
			}
		};

		clearIntegration();
	};

	return (
		<VStack className="blockish-integrations-page" spacing={5}>
			<header className="blockish-page-header">
				<Heading className="blockish-heading-primary" level={1}>
					{__('Integrations', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{sprintf(
						__('Connect Blockish with your favorite tools and services. %d active connections.', 'blockish'),
						connectedCount
					)}
				</Text>
			</header>
			{error && <Text className="blockish-error">{error}</Text>}

			<div className="blockish-integrations-grid">
				{INTEGRATIONS.map((item) => {
					return (
						<section
							key={item.key}
							className="blockish-integration-card is-connected"
						>
							<Flex justify="space-between" align="center" className="blockish-integration-head">
								<Flex gap={3} justify="flex-start" align="center" className="blockish-integration-title-wrap">
									<div className="blockish-integration-logo-wrap">
										<img className="blockish-integration-logo" src={item.logoUrl} alt={item.logoAlt} />
									</div>
									<Heading className="blockish-heading-secondary blockish-integration-title" level={3}>
										{item.name}
									</Heading>
								</Flex>
								<Flex justify="flex-end" align="center" gap={2}>
									<Button
										className="blockish-configure-icon-button"
										variant="tertiary"
										icon={settingsIcon}
										label={__('Configure integration', 'blockish')}
										showTooltip
										disabled={isSaving}
										onClick={() => handleOpenConfigure(item.key)}
									/>
									{Boolean(savedApiKeys[item.key]) && (
										<Button
											className="blockish-action-button is-secondary blockish-button-base blockish-button-secondary"
											variant="secondary"
											disabled={isSaving}
											onClick={() => handleClearIntegration(item.key)}
										>
											{__('Clear', 'blockish')}
										</Button>
									)}
								</Flex>
							</Flex>

							<Text className="blockish-text-muted blockish-integration-description">
								{item.description}
							</Text>
						</section>
					);
				})}
			</div>

			<section className="blockish-integrations-help">
				<Heading className="blockish-heading-secondary" level={3}>
					{__('Need help with integrations?', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{__('Each integration has detailed setup instructions in our documentation. Our support team can also help you get connected.', 'blockish')}
				</Text>
				<Flex className="blockish-integrations-help-links" gap={2} justify="flex-start">
					<Text as="a" href="#" className="blockish-integrations-help-link">
						{__('View Integration Guides', 'blockish')}
					</Text>
					<Text className="blockish-text-muted">·</Text>
					<Text as="a" href="#" className="blockish-integrations-help-link">
						{__('Contact Support', 'blockish')}
					</Text>
				</Flex>
			</section>

			{isConfigureModalOpen && (
				<Modal
					title={sprintf(__('Configure %s', 'blockish'), activeIntegration?.name || __('Integration', 'blockish'))}
					className="blockish-configure-modal"
					onRequestClose={() => setIsConfigureModalOpen(false)}
				>
					<VStack className="blockish-modal-controls" spacing={4}>
						<TextControl
							label={__('API Key', 'blockish')}
							value={draftApiKey}
							onChange={(value) => setDraftApiKey(value)}
							placeholder={sprintf(__('Enter %s API key', 'blockish'), activeIntegration?.name || __('integration', 'blockish'))}
						/>
						<Flex justify="flex-end" align="center" gap={2}>
							<Button
								className="blockish-action-button is-secondary blockish-button-base blockish-button-secondary"
								variant="secondary"
								disabled={isSaving}
								onClick={() => setIsConfigureModalOpen(false)}
							>
								{__('Cancel', 'blockish')}
							</Button>
							<Button
								className="blockish-action-button is-primary blockish-button-base blockish-button-primary"
								variant="primary"
								disabled={isSaving}
								onClick={handleSaveConfiguration}
							>
								{__('Save', 'blockish')}
							</Button>
						</Flex>
					</VStack>
				</Modal>
			)}
		</VStack>
	);
}
