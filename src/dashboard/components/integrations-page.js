import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';
import {
	Button,
	Flex,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';

const INTEGRATION_FILTERS = [
	{ key: 'all', label: __('All', 'blockish') },
	{ key: 'marketing', label: __('Marketing', 'blockish') },
	{ key: 'analytics', label: __('Analytics', 'blockish') },
	{ key: 'automation', label: __('Automation', 'blockish') },
	{ key: 'communication', label: __('Communication', 'blockish') },
	{ key: 'payments', label: __('Payments', 'blockish') },
	{ key: 'crm', label: __('CRM', 'blockish') },
	{ key: 'productivity', label: __('Productivity', 'blockish') },
	{ key: 'developer', label: __('Developer', 'blockish') },
];

const INTEGRATIONS = [
	{
		key: 'mailchimp',
		name: 'Mailchimp',
		icon: '📧',
		category: 'marketing',
		description: __('Sync form submissions to your Mailchimp audience', 'blockish'),
		status: 'connected',
	},
	{
		key: 'google-analytics',
		name: 'Google Analytics',
		icon: '📊',
		category: 'analytics',
		description: __('Track block interactions and user engagement', 'blockish'),
		status: 'connected',
	},
	{
		key: 'zapier',
		name: 'Zapier',
		icon: '⚡',
		category: 'automation',
		description: __('Connect to 5000+ apps with automated workflows', 'blockish'),
		status: 'available',
		premium: true,
	},
	{
		key: 'slack',
		name: 'Slack',
		icon: '💬',
		category: 'communication',
		description: __('Get notifications for form submissions and events', 'blockish'),
		status: 'available',
	},
	{
		key: 'stripe',
		name: 'Stripe',
		icon: '💳',
		category: 'payments',
		description: __('Accept payments directly through your blocks', 'blockish'),
		status: 'available',
		premium: true,
	},
	{
		key: 'hubspot',
		name: 'HubSpot',
		icon: '🎯',
		category: 'crm',
		description: __('Capture leads and sync with your CRM', 'blockish'),
		status: 'available',
		premium: true,
	},
	{
		key: 'convertkit',
		name: 'ConvertKit',
		icon: '✉️',
		category: 'marketing',
		description: __('Add subscribers to your email sequences', 'blockish'),
		status: 'available',
	},
	{
		key: 'google-sheets',
		name: 'Google Sheets',
		icon: '📄',
		category: 'productivity',
		description: __('Export form data to Google Sheets automatically', 'blockish'),
		status: 'connected',
	},
	{
		key: 'webhooks',
		name: 'Webhooks',
		icon: '🔗',
		category: 'developer',
		description: __('Send data to custom endpoints', 'blockish'),
		status: 'available',
	},
];

export default function IntegrationsPage() {
	const [activeFilter, setActiveFilter] = useState('all');

	const filteredItems = useMemo(() => {
		if (activeFilter === 'all') {
			return INTEGRATIONS;
		}

		return INTEGRATIONS.filter((item) => item.category === activeFilter);
	}, [activeFilter]);

	const connectedCount = useMemo(
		() => INTEGRATIONS.filter((item) => item.status === 'connected').length,
		[]
	);

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

			<section className="blockish-panel blockish-integrations-filter-wrap">
				<HStack className="blockish-integrations-filters" justify="flex-start">
					{INTEGRATION_FILTERS.map((filter) => (
						<Button
							key={filter.key}
							className={`blockish-filter-button blockish-button-base ${activeFilter === filter.key ? 'is-active' : ''}`}
							variant="tertiary"
							onClick={() => setActiveFilter(filter.key)}
						>
							{filter.label}
						</Button>
					))}
				</HStack>
			</section>

			<div className="blockish-integrations-grid">
				{filteredItems.map((item) => {
					const isConnected = item.status === 'connected';
					return (
						<section
							key={item.key}
							className={`blockish-integration-card ${isConnected ? 'is-connected' : ''}`}
						>
							<Flex justify="space-between" align="flex-start" className="blockish-integration-head">
								<Flex gap={3} justify="flex-start" align="center">
									<span className="blockish-integration-icon" aria-hidden="true">
										{item.icon}
									</span>
									<div>
										<Heading className="blockish-heading-secondary blockish-integration-title" level={3}>
											{item.name}
										</Heading>
										<Text className="blockish-text-muted blockish-integration-category">
											{INTEGRATION_FILTERS.find((filter) => filter.key === item.category)?.label}
										</Text>
									</div>
								</Flex>
								{isConnected && <span className="blockish-integration-badge">{__('Connected', 'blockish')}</span>}
							</Flex>

							<Text className="blockish-text-muted blockish-integration-description">
								{item.description}
							</Text>

							<div className="blockish-integration-actions">
								{item.premium && <span className="blockish-integration-premium">{__('Premium', 'blockish')}</span>}
								<Flex justify="space-between" align="center" className="blockish-integration-actions-row">
									<Button
										className={`blockish-action-button blockish-button-base ${
											isConnected ? 'is-secondary blockish-button-secondary' : 'is-primary blockish-button-primary'
										}`}
										variant={isConnected ? 'secondary' : 'primary'}
									>
										{isConnected ? __('Configure', 'blockish') : __('Connect', 'blockish')}
									</Button>
									{isConnected && (
										<button type="button" className="blockish-integration-disconnect" aria-label={__('Disconnect', 'blockish')}>
											×
										</button>
									)}
								</Flex>
							</div>
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
		</VStack>
	);
}
