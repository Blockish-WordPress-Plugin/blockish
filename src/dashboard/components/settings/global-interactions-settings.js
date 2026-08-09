import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';
import {
	Button,
	Card,
	CardBody,
	Flex,
	Modal,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { settingsIcon } from '../../../components/icons/block-icons';

export default function GlobalInteractionsSettings({
	interactions,
	isLoading,
	isSaving,
	onDeleteInteraction,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');

	const filteredInteractions = useMemo(() => {
		const q = searchQuery.trim().toLowerCase();
		if (!q) return interactions?.items || [];
		return (interactions?.items || []).filter((item) =>
			`${item?.event || ''} ${item?.selector || ''}`.toLowerCase().includes(q)
		);
	}, [searchQuery, interactions]);

	return (
		<>
			<Card className="blockish-block-card" size="small">
				<CardBody>
					<VStack spacing={4}>
						<Flex justify="space-between" align="flex-start">
							<div>
								<Heading className="blockish-block-card-title blockish-heading-tertiary" level={3}>
									{__('Global Interactions', 'blockish')}
								</Heading>
								<Text className="blockish-block-card-description blockish-text-muted">
									{sprintf(__('Total active global interactions: %d', 'blockish'), interactions?.count || 0)}
								</Text>
							</div>
							<Button
								className="blockish-configure-icon-button"
								variant="tertiary"
								icon={settingsIcon}
								label={__('Manage interactions', 'blockish')}
								showTooltip
								disabled={isLoading}
								onClick={() => setIsModalOpen(true)}
							/>
						</Flex>
					</VStack>
				</CardBody>
			</Card>

			{isModalOpen && (
				<Modal
					title={__('Global Interactions', 'blockish')}
					className="blockish-configure-modal blockish-schemas-modal"
					onRequestClose={() => setIsModalOpen(false)}
				>
					<VStack className="blockish-modal-controls blockish-schemas-modal-content" spacing={4}>
						<Text className="blockish-schemas-modal-description">
							{__(
								'Review and delete site-wide interactions. Create and edit them from Blockish editor Settings → Interactions.',
								'blockish'
							)}
						</Text>
						<Flex className="blockish-schemas-modal-toolbar" justify="space-between" align="center">
							<div className="blockish-schemas-modal-search">
								<span className="blockish-schemas-modal-search-icon" aria-hidden="true">
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<circle cx="11" cy="11" r="7" />
										<path d="M20 20l-3.5-3.5" />
									</svg>
								</span>
								<input
									className="blockish-schemas-modal-search-input"
									type="search"
									placeholder={__('Search by event or selector...', 'blockish')}
									value={searchQuery}
									onChange={(event) => setSearchQuery(event.target.value)}
								/>
							</div>
						</Flex>
						<div className="blockish-settings-list blockish-schemas-modal-list">
							{filteredInteractions.map((item) => (
								<Flex
									key={item.id}
									className="blockish-settings-row blockish-schemas-modal-row"
									justify="space-between"
									align="center"
								>
									<div className="blockish-settings-row-content blockish-schemas-modal-row-content">
										<Heading className="blockish-heading-tertiary blockish-settings-row-title" level={3}>
											{item?.event || 'Event'}
										</Heading>
										<Text className="blockish-text-muted" style={{ fontSize: '12px' }}>
											{item?.selector ? `Selector: ${item.selector}` : 'No specific selector'}
										</Text>
									</div>
									<Flex className="blockish-schemas-modal-row-actions" align="center">
										<Button
											className="blockish-schemas-modal-row-clean"
											variant="secondary"
											isDestructive
											disabled={isSaving || isLoading}
											onClick={() => onDeleteInteraction(item.id)}
										>
											{__('Delete', 'blockish')}
										</Button>
									</Flex>
								</Flex>
							))}
							{!isLoading && filteredInteractions.length === 0 && (
								<Text className="blockish-schemas-modal-empty">
									{searchQuery.trim()
										? __('No interactions found matching your search', 'blockish')
										: __('No active global interactions', 'blockish')}
								</Text>
							)}
						</div>
					</VStack>
				</Modal>
			)}
		</>
	);
}
