import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import {
	Button,
	CheckboxControl,
	SearchControl,
	Spinner,
	__experimentalText as Text,
} from '@wordpress/components';
import { BlockPreview } from '@wordpress/block-editor';
import { createBlock, serialize } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';
import './pending-list.scss';

const PAGE_SIZE = 8;

const PREVIEW_STYLES = [
	{
		css: 'body{height:auto;overflow:hidden;border:none;padding:0;}',
	},
];

const schemaToBlocks = (nodes) => {
	if (!Array.isArray(nodes)) {
		return [];
	}
	return nodes
		.map((node) => {
			if (!node?.name) {
				return null;
			}
			try {
				const inner = Array.isArray(node.innerBlocks)
					? schemaToBlocks(node.innerBlocks)
					: [];
				return createBlock(node.name, node.attributes || {}, inner);
			} catch (e) {
				return null;
			}
		})
		.filter(Boolean);
};

const schemaToContent = (nodes) => serialize(schemaToBlocks(nodes));

const collectNestedEntityIds = (nodes, ids = new Set()) => {
	if (!Array.isArray(nodes)) {
		return ids;
	}
	nodes.forEach((node) => {
		if (!node || typeof node !== 'object') {
			return;
		}
		if (node.name === 'core/block' && node.attributes?.ref) {
			ids.add(absint(node.attributes.ref));
		}
		if (node.name === 'blockish-forms/form' && node.attributes?.formId) {
			ids.add(absint(node.attributes.formId));
		}
		if (Array.isArray(node.innerBlocks)) {
			collectNestedEntityIds(node.innerBlocks, ids);
		}
	});
	return ids;
};

const absint = (value) => {
	const id = parseInt(value, 10);
	return Number.isFinite(id) && id > 0 ? id : 0;
};

const fetchQueueItem = async (id) => {
	try {
		return await apiFetch({ path: `/blockish/v1/ai-preview-queue/${id}` });
	} catch (e) {
		return null;
	}
};

const prepareAcceptContents = async (rootIds) => {
	const contents = {};
	const orderedIds = [];
	const seen = new Set();

	const prepare = async (id) => {
		if (!id || seen.has(id)) {
			return;
		}
		seen.add(id);
		const item = await fetchQueueItem(id);
		if (!item) {
			return;
		}
		const schema = item.pendingSchema || [];
		const nested = [...collectNestedEntityIds(schema)].filter((nestedId) => nestedId !== id);
		for (const nestedId of nested) {
			await prepare(nestedId);
		}
		contents[id] = schemaToContent(schema);
		orderedIds.push(id);
	};

	for (const id of rootIds) {
		await prepare(id);
	}

	return { ids: orderedIds, contents };
};

function PendingPreview({ itemId }) {
	const [schema, setSchema] = useState(null);
	const [error, setError] = useState('');

	useEffect(() => {
		let cancelled = false;
		setSchema(null);
		setError('');
		apiFetch({ path: `/blockish/v1/ai-preview-queue/${itemId}` })
			.then((response) => {
				if (!cancelled) {
					setSchema(response?.pendingSchema || []);
				}
			})
			.catch((err) => {
				if (!cancelled) {
					setError(err?.message || __('Preview unavailable.', 'blockish'));
				}
			});
		return () => {
			cancelled = true;
		};
	}, [itemId]);

	const blocks = useMemo(() => schemaToBlocks(schema || []), [schema]);

	if (error) {
		return (
			<div className="blockish-ai-preview-pending__preview-empty">{error}</div>
		);
	}

	if (schema === null) {
		return (
			<div className="blockish-ai-preview-pending__preview-empty">
				<Spinner />
			</div>
		);
	}

	if (!blocks.length) {
		return (
			<div className="blockish-ai-preview-pending__preview-empty">
				{__('Empty preview', 'blockish')}
			</div>
		);
	}

	const preview = (
		<BlockPreview
			blocks={blocks}
			viewportWidth={800}
			additionalStyles={PREVIEW_STYLES}
		/>
	);

	if (BlockPreview.Async) {
		return <BlockPreview.Async>{preview}</BlockPreview.Async>;
	}

	return preview;
}

export default function AiPreviewPendingList() {
	const [items, setItems] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [busyIds, setBusyIds] = useState([]);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [typeFilter, setTypeFilter] = useState('all');
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState([]);

	const loadInventory = useCallback(async (silent = false) => {
		if (!silent) {
			setIsLoading(true);
		}
		setError('');
		try {
			const response = await apiFetch({ path: '/blockish/v1/ai-preview-queue' });
			const next = Array.isArray(response?.items) ? response.items : [];
			setItems(next.filter((item) => item?.edit_url));
		} catch (err) {
			setError(err?.message || __('Failed to load pending AI previews.', 'blockish'));
		} finally {
			if (!silent) {
				setIsLoading(false);
			}
		}
	}, []);

	useEffect(() => {
		loadInventory();
	}, [loadInventory]);

	const typeOptions = useMemo(() => {
		const seen = new Map();
		items.forEach((item) => {
			if (item?.type && !seen.has(item.type)) {
				seen.set(item.type, item.typeLabel || item.type);
			}
		});
		return Array.from(seen.entries()).map(([value, label]) => ({ value, label }));
	}, [items]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return items.filter((item) => {
			if (typeFilter !== 'all' && item.type !== typeFilter) {
				return false;
			}
			if (!q) {
				return true;
			}
			return `${item.title || ''} ${item.typeLabel || ''} ${item.type || ''}`
				.toLowerCase()
				.includes(q);
		});
	}, [items, search, typeFilter]);

	const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, pageCount);
	const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
	const pagedIds = paged.map((item) => item.id);
	const selectedOnPage = pagedIds.filter((id) => selected.includes(id));
	const allOnPageSelected =
		pagedIds.length > 0 && selectedOnPage.length === pagedIds.length;
	const isBusy = busyIds.length > 0;

	useEffect(() => {
		setPage(1);
	}, [search, typeFilter]);

	useEffect(() => {
		const ids = new Set(items.map((item) => item.id));
		setSelected((current) => current.filter((id) => ids.has(id)));
	}, [items]);

	const toggleSelected = (id) => {
		setSelected((current) =>
			current.includes(id)
				? current.filter((value) => value !== id)
				: [...current, id]
		);
	};

	const togglePage = () => {
		if (allOnPageSelected) {
			setSelected((current) => current.filter((id) => !pagedIds.includes(id)));
			return;
		}
		setSelected((current) => [...new Set([...current, ...pagedIds])]);
	};

	const runAction = async (action, ids) => {
		const nextIds = [...new Set(ids.filter(Boolean))];
		if (!nextIds.length) {
			return;
		}
		setBusyIds(nextIds);
		setError('');
		try {
			let payloadIds = nextIds;
			let contents = {};
			if (action === 'accept') {
				const prepared = await prepareAcceptContents(nextIds);
				payloadIds = prepared.ids.length ? prepared.ids : nextIds;
				contents = prepared.contents;
			} else {
				await Promise.all(
					nextIds.map(async (id) => {
						const item = await fetchQueueItem(id);
						contents[id] = schemaToContent(item?.previousSchema || []);
					})
				);
			}
			await apiFetch({
				path: '/blockish/v1/ai-preview-queue',
				method: 'POST',
				data: { action, ids: payloadIds, contents },
			});
			setSelected((current) => current.filter((id) => !nextIds.includes(id)));
			await loadInventory(true);
		} catch (err) {
			setError(
				err?.message ||
					(action === 'discard'
						? __('Failed to discard.', 'blockish')
						: __('Failed to accept.', 'blockish'))
			);
		} finally {
			setBusyIds([]);
		}
	};

	return (
		<div className="blockish-ai-preview-pending">
			<div className="blockish-ai-preview-pending__toolbar">
				<SearchControl
					className="blockish-ai-preview-pending__search"
					label={__('Search pending previews', 'blockish')}
					placeholder={__('Search…', 'blockish')}
					value={search}
					onChange={setSearch}
					__nextHasNoMarginBottom
				/>
				<div className="blockish-ai-preview-pending__filters">
					<Button
						size="compact"
						variant={typeFilter === 'all' ? 'primary' : 'tertiary'}
						onClick={() => setTypeFilter('all')}
					>
						{__('All', 'blockish')}
					</Button>
					{typeOptions.map((option) => (
						<Button
							key={option.value}
							size="compact"
							variant={typeFilter === option.value ? 'primary' : 'tertiary'}
							onClick={() => setTypeFilter(option.value)}
						>
							{option.label}
						</Button>
					))}
				</div>
				<div className="blockish-ai-preview-pending__bulk">
					<Button
						size="compact"
						variant="primary"
						disabled={!selected.length || isBusy}
						onClick={() => runAction('accept', selected)}
					>
						{selected.length
							? sprintf(__('Accept (%d)', 'blockish'), selected.length)
							: __('Accept', 'blockish')}
					</Button>
					<Button
						size="compact"
						variant="secondary"
						isDestructive
						disabled={!selected.length || isBusy}
						onClick={() => runAction('discard', selected)}
					>
						{selected.length
							? sprintf(__('Discard (%d)', 'blockish'), selected.length)
							: __('Discard', 'blockish')}
					</Button>
					<Button
						className="blockish-ai-preview-pending__refresh"
						size="compact"
						variant="secondary"
						onClick={loadInventory}
						disabled={isLoading || isBusy}
					>
						{__('Refresh', 'blockish')}
					</Button>
				</div>
			</div>

			{error ? <Text className="blockish-ai-preview-pending__error">{error}</Text> : null}

			<div className="blockish-ai-preview-pending__body">
				{isLoading && items.length === 0 ? (
					<div className="blockish-ai-preview-pending__loading">
						<Spinner />
					</div>
				) : null}

				{!isLoading && filtered.length === 0 ? (
					<Text className="blockish-ai-preview-pending__empty">
						{items.length === 0
							? __('No AI previews are pending Accept.', 'blockish')
							: __('No pending previews match this search or filter.', 'blockish')}
					</Text>
				) : null}

				<ul className="blockish-ai-preview-pending__grid">
					{paged.map((item) => {
						const checked = selected.includes(item.id);
						const itemBusy = busyIds.includes(item.id);
						return (
							<li
								key={item.id}
								className={`blockish-ai-preview-pending__card${
									checked ? ' is-selected' : ''
								}`}
							>
								<div className="blockish-ai-preview-pending__card-preview-wrap">
									<label className="blockish-ai-preview-pending__check">
										<CheckboxControl
											checked={checked}
											onChange={() => toggleSelected(item.id)}
											disabled={itemBusy}
											label={sprintf(
												__('Select %s', 'blockish'),
												item.title || String(item.id)
											)}
											__nextHasNoMarginBottom
										/>
									</label>
									<a
										className="blockish-ai-preview-pending__card-preview"
										href={item.edit_url}
										target="_blank"
										rel="noopener noreferrer"
									>
										<PendingPreview itemId={item.id} />
									</a>
								</div>
								<div className="blockish-ai-preview-pending__card-footer">
									<a
										className="blockish-ai-preview-pending__card-title"
										href={item.edit_url}
										target="_blank"
										rel="noopener noreferrer"
									>
										{item.title || sprintf(__('#%d', 'blockish'), item.id)}
									</a>
									<span className="blockish-ai-preview-pending__type">
										{item.typeLabel || item.type}
									</span>
								</div>
								<div className="blockish-ai-preview-pending__card-actions">
									<Button
										size="compact"
										variant="primary"
										disabled={itemBusy}
										onClick={() => runAction('accept', [item.id])}
									>
										{__('Accept', 'blockish')}
									</Button>
									<Button
										size="compact"
										variant="secondary"
										isDestructive
										disabled={itemBusy}
										onClick={() => runAction('discard', [item.id])}
									>
										{__('Discard', 'blockish')}
									</Button>
								</div>
							</li>
						);
					})}
				</ul>
			</div>

			<footer className="blockish-ai-preview-pending__footer">
				<CheckboxControl
					className="blockish-ai-preview-pending__select-page"
					checked={allOnPageSelected}
					indeterminate={
						selectedOnPage.length > 0 && selectedOnPage.length < pagedIds.length
					}
					onChange={togglePage}
					disabled={!pagedIds.length || isBusy}
					label={__('This page', 'blockish')}
					__nextHasNoMarginBottom
				/>
				<Button
					size="compact"
					variant="tertiary"
					disabled={safePage <= 1}
					onClick={() => setPage(safePage - 1)}
				>
					{__('Prev', 'blockish')}
				</Button>
				<div className="blockish-ai-preview-pending__pages">
					{Array.from({ length: pageCount }, (_, index) => {
						const pageNumber = index + 1;
						return (
							<Button
								key={pageNumber}
								size="compact"
								variant={pageNumber === safePage ? 'primary' : 'tertiary'}
								aria-current={pageNumber === safePage ? 'page' : undefined}
								onClick={() => setPage(pageNumber)}
							>
								{pageNumber}
							</Button>
						);
					})}
				</div>
				<Button
					size="compact"
					variant="tertiary"
					disabled={safePage >= pageCount}
					onClick={() => setPage(safePage + 1)}
				>
					{__('Next', 'blockish')}
				</Button>
			</footer>
		</div>
	);
}
