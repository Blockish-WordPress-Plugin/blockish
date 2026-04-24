import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';
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
import { BLOCK_FILTERS, getBlockCategoryKey, isChildBlock } from '../utils';
import BlockCard from './block-card';

function humanizeSlug(slug) {
	return (slug || '')
		.split('-')
		.map((part) => (part ? `${part[0].toUpperCase()}${part.slice(1)}` : ''))
		.join(' ');
}

function buildDescription(item, categoryLabel) {
	if (item?.description) {
		return item.description;
	}

	return `${categoryLabel} block`;
}

export default function BlocksPage({ blocks = {}, isSaving, onSave, onToggleBlock, onSetAllBlockStatus }) {
	const [searchTerm, setSearchTerm] = useState('');
	const [activeFilter, setActiveFilter] = useState('all');

	const allBlocks = useMemo(() => {
		return Object.entries(blocks || {})
			.filter(([, item]) => !isChildBlock(item))
			.map(([slug, item]) => {
				const category = getBlockCategoryKey(item, slug);
				const categoryLabel =
					BLOCK_FILTERS.find((filter) => filter.key === category)?.label || 'Content';

				return {
					slug,
					name: item?.name || humanizeSlug(slug),
					status: item?.status === 'inactive' ? 'inactive' : 'active',
					category,
					categoryLabel,
					description: buildDescription(item, categoryLabel),
					sourceName: item?.addon_name || item?.source_name || 'Blockish',
				};
			});
	}, [blocks]);

	const filteredBlocks = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();

		return allBlocks.filter((block) => {
			const matchesFilter = activeFilter === 'all' || block.category === activeFilter;
			const matchesSearch =
				!normalizedSearch ||
				block.name.toLowerCase().includes(normalizedSearch) ||
				block.slug.toLowerCase().includes(normalizedSearch);

			return matchesFilter && matchesSearch;
		});
	}, [allBlocks, activeFilter, searchTerm]);

	const activeCount = useMemo(
		() => allBlocks.filter((block) => block.status === 'active').length,
		[allBlocks]
	);
	const filteredBlockSlugs = useMemo(
		() => filteredBlocks.map((block) => block.slug),
		[filteredBlocks]
	);

	return (
		<VStack className="blockish-blocks-page" spacing={5}>
			<VStack spacing={1}>
				<Heading className="blockish-heading-primary" level={1}>
					{__('Blocks', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">
					{sprintf(
						__('Enable or disable individual blocks. %1$d of %2$d blocks active.', 'blockish'),
						activeCount,
						allBlocks.length
					)}
				</Text>
			</VStack>

			<section className="blockish-panel blockish-block-controls">
				<Flex className="blockish-block-controls-top" justify="space-between" align="center">
					<FlexBlock className="blockish-block-search-wrap">
						<SearchControl
							placeholder={__('Search blocks...', 'blockish')}
							value={searchTerm}
							onChange={setSearchTerm}
						/>
					</FlexBlock>
					<HStack justify="flex-end" className="blockish-block-actions">
						<Button
							className="blockish-action-button is-secondary blockish-button-base blockish-button-secondary"
							variant="secondary"
							disabled={isSaving || filteredBlockSlugs.length === 0}
							onClick={() => onSetAllBlockStatus('active', filteredBlockSlugs)}
						>
							{__('Enable All', 'blockish')}
						</Button>
						<Button
							className="blockish-action-button is-secondary blockish-button-base blockish-button-secondary"
							variant="secondary"
							disabled={isSaving || filteredBlockSlugs.length === 0}
							onClick={() => onSetAllBlockStatus('inactive', filteredBlockSlugs)}
						>
							{__('Disable All', 'blockish')}
						</Button>
					</HStack>
				</Flex>

				<HStack className="blockish-category-filter" justify="flex-start">
					{BLOCK_FILTERS.map((filter) => (
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
			</section>

			<div className="blockish-block-grid">
				{filteredBlocks.map((block) => (
					<BlockCard
						key={block.slug}
						block={block}
						isSaving={isSaving}
						onToggle={onToggleBlock}
					/>
				))}
			</div>

			{filteredBlocks.length === 0 && (
				<section className="blockish-panel">
					<Text className="blockish-text-muted">{__('No blocks found for this filter.', 'blockish')}</Text>
				</section>
			)}
		</VStack>
	);
}
