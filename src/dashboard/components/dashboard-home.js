import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import {
	Button,
	Icon,
	__experimentalHeading as Heading,
	__experimentalHStack as HStack,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { info, plugins } from '@wordpress/icons';
import { blocks as blocksIcon, zap } from '../../components/icons/block-icons';
import StatCard from './stat-card';
import OverviewVideoModal, { getOverviewVideoId } from './overview-video-modal';

export default function DashboardHome({ data, onNavigate }) {
	const [isOverviewOpen, setIsOverviewOpen] = useState(false);
	const blockStats = data?.stats?.blocks || {};
	const extensionStats = data?.stats?.extensions || {};
	const activeBlocks = blockStats.active || 0;
	const inactiveBlocks = blockStats.inactive || 0;
	const activeExtensions = extensionStats.active || 0;

	const pluginVersion = data?.plugin?.version || '1.0.0';
	const wpVersion = data?.plugin?.wpVersion || '6.4+';
	const links = data?.plugin?.links || {};
	const hasOverviewVideo = !!getOverviewVideoId();
	const pluginTagline =
		data?.plugin?.tagline || __('Creative Gutenberg blocks for modern websites.', 'blockish');

	const safeLink = (url, fallback) => url || fallback;

	return (
		<VStack className="blockish-dashboard-home" spacing={5}>
			<header className="blockish-page-header">
				<Heading className="blockish-heading-primary" level={1}>
					{__('Welcome to Blockish', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{pluginTagline}{' '}
					{activeBlocks > 0 &&
						`${activeBlocks} ${__('blocks are currently active on your site.', 'blockish')}`}
				</Text>
			</header>

			<section className="blockish-stat-grid">
				<StatCard
					icon={blocksIcon}
					iconClass="is-blue"
					value={activeBlocks}
					label={__('Active Blocks', 'blockish')}
				/>
				<StatCard
					icon={plugins}
					iconClass="is-green"
					value={activeExtensions}
					label={__('Active Extensions', 'blockish')}
				/>
				<StatCard
					icon={zap}
					iconClass="is-purple"
					value={`v${pluginVersion}`}
					label={__('Plugin Version', 'blockish')}
				/>
				<StatCard
					icon={info}
					iconClass="is-gray"
					value={`WP ${wpVersion}`}
					label={__('Current WordPress', 'blockish')}
				/>
			</section>

			<section className="blockish-info-banner">
				<Icon icon={zap} size={20} />
				<VStack spacing={1}>
					<Heading className="blockish-heading-tertiary" level={3}>
						{__('Smart Asset Loading', 'blockish')}
					</Heading>
					<Text className="blockish-text-muted">
						{inactiveBlocks > 0
							? `${inactiveBlocks} ${__(
									'blocks are disabled, so Blockish loads only what your site needs.',
									'blockish'
							  )}`
							: __(
									'All blocks are currently active. Disable unused blocks to improve editor performance. Frontend performance will never be compromised.',
									'blockish'
							  )}
					</Text>
				</VStack>
			</section>

			<section className="blockish-panel blockish-quick-actions">
				<Heading className="blockish-heading-secondary" level={3}>
					{__('Quick Actions', 'blockish')}
				</Heading>
				<HStack className="blockish-quick-actions-buttons" justify="flex-start">
					<Button
						className="blockish-button-base blockish-button-primary"
						variant="primary"
						onClick={() => onNavigate('blocks')}
					>
						{__('Manage Blocks', 'blockish')}
					</Button>
					<Button
						className="blockish-button-base blockish-button-secondary"
						variant="secondary"
						onClick={() => onNavigate('extensions')}
					>
						{__('Manage Extensions', 'blockish')}
					</Button>
					{hasOverviewVideo ? (
						<Button
							className="blockish-button-base blockish-button-secondary"
							variant="secondary"
							onClick={() => setIsOverviewOpen(true)}
						>
							{__('Watch overview', 'blockish')}
						</Button>
					) : null}
				</HStack>
			</section>

			<section className="blockish-bottom-grid">
				<div className="blockish-panel">
					<Heading className="blockish-heading-secondary" level={3}>
						{__('Current Configuration', 'blockish')}
					</Heading>
					<ul>
						<li>
							<Heading className="blockish-heading-tertiary" level={4}>
								{__('Blocks', 'blockish')}
							</Heading>
							<Text className="blockish-text-muted">
								{`${activeBlocks} ${__('active', 'blockish')} • ${inactiveBlocks} ${__(
									'inactive',
									'blockish'
								)}`}
							</Text>
						</li>
						<li>
							<Heading className="blockish-heading-tertiary" level={4}>
								{__('Extensions', 'blockish')}
							</Heading>
							<Text className="blockish-text-muted">
								{`${activeExtensions} ${__('active', 'blockish')} • ${extensionStats.inactive || 0} ${__(
									'inactive',
									'blockish'
								)}`}
							</Text>
						</li>
					</ul>
				</div>
				<div className="blockish-panel">
					<Heading className="blockish-heading-secondary" level={3}>
						{__('Helpful Links', 'blockish')}
					</Heading>
					<ul className="blockish-links-list">
						<li>
							<Text as="a" href={safeLink(links.documentation, 'https://blockish.wowdevs.com/docs/')} target="_blank" rel="noreferrer">
								{__('Documentation', 'blockish')}
							</Text>
						</li>
						<li>
							<Text as="a" href={safeLink(links.roadmap, 'https://blockish.wowdevs.com/roadmap/')} target="_blank" rel="noreferrer">
								{__('Roadmap', 'blockish')}
							</Text>
						</li>
						<li>
							<Text as="a" href={safeLink(links.support, 'https://blockish.wowdevs.com/contact/')} target="_blank" rel="noreferrer">
								{__('Contact', 'blockish')}
							</Text>
						</li>
					</ul>
				</div>
			</section>

			<OverviewVideoModal
				isOpen={isOverviewOpen}
				onClose={() => setIsOverviewOpen(false)}
			/>
		</VStack>
	);
}
