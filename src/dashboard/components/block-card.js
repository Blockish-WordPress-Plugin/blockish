import { __, sprintf } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	Flex,
	FormToggle,
	Button,
	Modal,
	Icon,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { useState } from '@wordpress/element';

import { lock } from '@wordpress/icons';

export default function BlockCard({ block, isSaving, onToggle, onNavigate }) {
	const isActive = block.status === 'active';
	const isLocked = block.status === 'locked';
	const [isModalOpen, setIsModalOpen] = useState(false);

	return (
		<>
			<Card
				className={`blockish-block-card ${!isActive ? 'is-inactive' : ''} ${isLocked ? 'is-locked-card' : ''}`}
				size="small"
				onClick={() => {
					if (isLocked) {
						setIsModalOpen(true);
					}
				}}
				style={{ cursor: isLocked ? 'pointer' : 'default' }}
			>
				{/* Absolute positioned status badge */}
				<div className={`blockish-status-badge ${isLocked ? 'is-locked' : (isActive ? 'is-active' : 'is-inactive')}`}>
					{isLocked ? __('Locked', 'blockish') : (isActive ? __('Active', 'blockish') : __('Inactive', 'blockish'))}
				</div>
				<CardBody>
				<VStack spacing={4}>
					<Flex justify="space-between" align="flex-start">
						<Heading className="blockish-block-card-title blockish-heading-tertiary" level={3}>
							{block.name}
						</Heading>
						{isLocked ? (
							<Button
								className="blockish-lock-icon"
								icon={lock}
								label={__('This block requires a premium addon', 'blockish')}
								onClick={(e) => {
									e.stopPropagation();
									setIsModalOpen(true);
								}}
							/>
						) : (
							<FormToggle
								className="blockish-block-toggle"
								checked={isActive}
								onChange={(event) => onToggle(block.slug, event.target.checked)}
							/>
						)}
					</Flex>
					<Text className="blockish-block-card-description blockish-text-muted">{block.description}</Text>
					<Flex justify="space-between" align="center" style={{ marginTop: 'auto', paddingTop: '16px' }}>
						<Text className="blockish-category-badge">{block.categoryLabel}</Text>
						<Text className="blockish-addon-badge">{block.sourceName || __('Blockish', 'blockish')}</Text>
					</Flex>
				</VStack>
			</CardBody>
		</Card>

		{isModalOpen && (
			<Modal
				title={false}
				onRequestClose={() => setIsModalOpen(false)}
				className="blockish-locked-feature-modal"
				style={{ maxWidth: '420px', padding: 0 }}
			>
				<VStack spacing={5} style={{ padding: '0 24px 32px', textAlign: 'center' }}>
					<Flex justify="center" style={{ marginBottom: '8px' }}>
						<div style={{ 
							background: 'var(--wp-admin-theme-color, #2271b1)', 
							color: '#fff', 
							padding: '16px', 
							borderRadius: '50%',
							display: 'inline-flex',
							boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
						}}>
							<Icon icon={lock} size={36} />
						</div>
					</Flex>
					
					<Heading level={2} style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
						{__('Unlock Premium Feature', 'blockish')}
					</Heading>
					
					<Text variant="muted" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
						{__('The ', 'blockish')}
						<strong style={{ color: 'var(--wp-admin-theme-color, #2271b1)' }}>{block.name}</strong>
						{__(' block is a premium feature available exclusively in the ', 'blockish')}
						<strong>{block.sourceName || __('Blockish', 'blockish')}</strong>
						{__(' addon. Upgrade now to enhance your website building experience!', 'blockish')}
					</Text>
					
					<Flex justify="center" gap={3} style={{ marginTop: '16px' }}>
						<Button 
							variant="secondary" 
							onClick={() => setIsModalOpen(false)}
							style={{ padding: '8px 16px' }}
						>
							{__('Maybe Later', 'blockish')}
						</Button>
						<Button
							variant="primary"
							style={{ padding: '8px 24px' }}
							onClick={() => {
								setIsModalOpen(false);
								if (onNavigate) {
									onNavigate('addons');
								}
							}}
						>
							{sprintf(__('Get %s', 'blockish'), block.sourceName || __('Addon', 'blockish'))}
						</Button>
					</Flex>
				</VStack>
			</Modal>
		)}
		</>
	);
}
