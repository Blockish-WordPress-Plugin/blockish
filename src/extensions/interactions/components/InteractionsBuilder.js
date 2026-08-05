import { useState, useMemo, useEffect, useRef, useCallback } from '@wordpress/element';
import { Modal, Button, TabPanel, Spinner } from '@wordpress/components';
import BlockishSelect from '../../../components/select';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';
import InteractionList from './InteractionList';
import InteractionForm from './InteractionForm';
import { createEmptyInteraction } from '../utils/constants';
import { compileInteraction, compileList, normalizeInteraction } from '../utils/compile';
import { collectEventNames } from '../utils/labels';

const PAGE_META_KEY = 'blockish_page_interactions';
const GLOBAL_API = '/blockish/v1/dashboard-tools/global-interactions';

function parsePageMeta(pageRaw) {
	let list = [];
	if (Array.isArray(pageRaw)) {
		list = pageRaw;
	} else if (typeof pageRaw === 'string' && pageRaw.trim()) {
		try {
			const parsed = JSON.parse(pageRaw);
			if (Array.isArray(parsed)) list = parsed;
		} catch (e) {
			list = [];
		}
	}
	return list.map((i) => normalizeInteraction(i, 'page')).filter(Boolean);
}

function ensureId(item) {
	if (item?.id) return item;
	return {
		...item,
		id: `ix_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
	};
}

function upsertInList(list, item) {
	const nextItem = ensureId(item);
	const idx = list.findIndex((i) => i?.id && i.id === nextItem.id);
	if (idx === -1) {
		return [...list, nextItem];
	}
	const next = [...list];
	next[idx] = nextItem;
	return next;
}

function ScopeTab({
	items,
	onEdit,
	onDelete,
	editing,
	draft,
	setDraft,
	knownEventNames,
	description,
	emptyText,
	scope,
}) {
	if (editing && draft) {
		return (
			<InteractionForm
				draft={draft}
				onChange={setDraft}
				knownEventNames={knownEventNames}
				scope={scope}
			/>
		);
	}

	return (
		<div className="blockish-interactions-scope">
			<p className="blockish-interactions-scope__desc">{description}</p>
			<InteractionList
				items={items}
				onEdit={onEdit}
				onDelete={onDelete}
				emptyText={emptyText}
			/>
		</div>
	);
}

export default function InteractionsBuilder({
	isOpen,
	onClose,
	attributes,
	setAttributes,
	isEmbedded,
}) {
	const [blockItems, setBlockItems] = useState(() =>
		(attributes?.interactionData || [])
			.map((i) => normalizeInteraction(i, 'block'))
			.filter(Boolean)
			.map(ensureId)
	);
	const [pageItems, setPageItems] = useState([]);
	const [pageHydrated, setPageHydrated] = useState(false);
	const [editingScope, setEditingScope] = useState(null);
	const [draft, setDraft] = useState(null);
	const [globalItems, setGlobalItems] = useState([]);
	const [globalLoading, setGlobalLoading] = useState(true);
	const [globalSaving, setGlobalSaving] = useState(false);
	const [selectedPageOption, setSelectedPageOption] = useState(null);
	const [pageLoading, setPageLoading] = useState(false);
	const [pageSaving, setPageSaving] = useState(false);

	const blockItemsRef = useRef(blockItems);
	const pageItemsRef = useRef(pageItems);

	useEffect(() => {
		blockItemsRef.current = blockItems;
	}, [blockItems]);

	useEffect(() => {
		pageItemsRef.current = pageItems;
	}, [pageItems]);

	const { postType, postId } = useSelect((select) => {
		const editor = select('core/editor');
		return {
			postType: editor?.getCurrentPostType?.() || 'post',
			postId: editor?.getCurrentPostId?.(),
		};
	}, []);

	const [meta, setMeta] = useEntityProp('postType', postType, 'meta');

	useEffect(() => {
		if (selectedPageOption) {
			let cancelled = false;
			(async () => {
				setPageLoading(true);
				try {
					const response = await apiFetch({ path: `/blockish/v1/dashboard-tools/page-interactions/${selectedPageOption.value}`, method: 'GET' });
					const items = response?.items || [];
					if (!cancelled) {
						const parsed = parsePageMeta(items).map(ensureId);
						setPageItems(parsed);
						pageItemsRef.current = parsed;
					}
				} catch (e) {
					if (!cancelled) {
						setPageItems([]);
						pageItemsRef.current = [];
					}
				} finally {
					if (!cancelled) setPageLoading(false);
				}
			})();
			return () => { cancelled = true; };
		} else {
			if (meta) {
				const parsed = parsePageMeta(meta?.[PAGE_META_KEY]).map(ensureId);
				setPageItems(parsed);
				pageItemsRef.current = parsed;
			}
		}
	}, [meta, selectedPageOption]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setGlobalLoading(true);
			try {
				const response = await apiFetch({ path: GLOBAL_API, method: 'GET' });
				const items = response?.items || response?.globalInteractions?.items || [];
				if (!cancelled) {
					setGlobalItems(
						items
							.map((i) => normalizeInteraction(i, 'global'))
							.filter(Boolean)
							.map(ensureId)
					);
				}
			} catch (e) {
				if (!cancelled) setGlobalItems([]);
			} finally {
				if (!cancelled) setGlobalLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	const knownEventNames = useMemo(
		() => collectEventNames([blockItems, pageItems, globalItems]),
		[blockItems, pageItems, globalItems]
	);

	const cancelDraft = useCallback(() => {
		setEditingScope(null);
		setDraft(null);
	}, []);

	const startAdd = useCallback((scope) => {
		setEditingScope(scope);
		setDraft(createEmptyInteraction(scope));
	}, []);

	const startEdit = useCallback((scope, item) => {
		setEditingScope(scope);
		setDraft(ensureId(normalizeInteraction(item, scope)));
	}, []);

	const persistBlockItems = useCallback(
		(next) => {
			const withIds = next.map(ensureId);
			blockItemsRef.current = withIds;
			setBlockItems(withIds);
			if (setAttributes) {
				setAttributes({
					interactionData: compileList(withIds, 'block'),
				});
			}
		},
		[setAttributes]
	);

	const persistPageItems = useCallback(
		async (next) => {
			const withIds = next.map(ensureId);
			pageItemsRef.current = withIds;
			setPageItems(withIds);
			const compiled = compileList(withIds, 'page');
			
			if (selectedPageOption) {
				setPageSaving(true);
				try {
					const response = await apiFetch({
						path: `/blockish/v1/dashboard-tools/page-interactions/${selectedPageOption.value}`,
						method: 'POST',
						data: { interactions: compiled }
					});
					const items = response?.items || [];
					const parsed = parsePageMeta(items).map(ensureId);
					setPageItems(parsed);
					pageItemsRef.current = parsed;
				} catch(e) {}
				setPageSaving(false);
			} else {
				if (postId && typeof setMeta === 'function') {
					setMeta({
						...(meta || {}),
						[PAGE_META_KEY]: compiled,
					});
				}
			}
		},
		[meta, postId, setMeta, selectedPageOption]
	);

	const saveDraft = useCallback(
		async (incomingDraft) => {
			const currentDraft = incomingDraft || draft;
			if (!currentDraft || !editingScope) return;

			const compiled = compileInteraction({
				...currentDraft,
				scope: editingScope,
			});
			if (!compiled) return;

			const normalized = ensureId(
				normalizeInteraction(compiled, editingScope)
			);

			if (editingScope === 'block') {
				const next = upsertInList(blockItemsRef.current, normalized);
				persistBlockItems(next);
			} else if (editingScope === 'page') {
				const next = upsertInList(pageItemsRef.current, normalized);
				await persistPageItems(next);
			} else if (editingScope === 'global') {
				setGlobalSaving(true);
				try {
					const next = upsertInList(globalItems, normalized);
					const compiledNext = compileList(next, 'global');
					const response = await apiFetch({
						path: GLOBAL_API,
						method: 'POST',
						data: { interactions: compiledNext },
					});
					const items = response?.items || compiledNext;
					setGlobalItems(
						items
							.map((i) => normalizeInteraction(i, 'global'))
							.filter(Boolean)
							.map(ensureId)
					);
				} catch (e) {
					setGlobalSaving(false);
					return;
				}
				setGlobalSaving(false);
			}

			cancelDraft();
		},
		[
			draft,
			editingScope,
			globalItems,
			persistBlockItems,
			persistPageItems,
			cancelDraft,
		]
	);

	const deleteItem = useCallback(
		async (scope, id) => {
			if (!id) return;

			if (scope === 'block') {
				persistBlockItems(
					blockItemsRef.current.filter((i) => i.id !== id)
				);
			} else if (scope === 'page') {
				persistPageItems(
					pageItemsRef.current.filter((i) => i.id !== id)
				);
			} else if (scope === 'global') {
				setGlobalSaving(true);
				try {
					await apiFetch({
						path: `${GLOBAL_API}/${id}`,
						method: 'DELETE',
					});
					setGlobalItems((prev) => prev.filter((i) => i.id !== id));
				} catch (e) {
					/* ignore */
				}
				setGlobalSaving(false);
			}
		},
		[persistBlockItems, persistPageItems]
	);

	const handleApply = useCallback(() => {
		// Block/page already persisted on each save; flush once more for safety.
		persistBlockItems(blockItemsRef.current);
		if (postId) {
			persistPageItems(pageItemsRef.current);
		}
		onClose();
	}, [persistBlockItems, persistPageItems, postId, onClose]);

	const [activeTab, setActiveTab] = useState(isEmbedded ? 'page' : 'block');

	const tabs = [
		...(!isEmbedded ? [{ name: 'block', title: __('This block', 'blockish') }] : []),
		{ name: 'page', title: __('Pages', 'blockish') },
		{ name: 'global', title: __('Whole site', 'blockish') },
	];

	const canAddOnTab =
		!editingScope &&
		(activeTab !== 'page' || !!postId);

	const formSaveDisabled =
		!draft ||
		(draft?.when?.source === 'listen' && !draft?.when?.eventName?.trim()) ||
		(draft?.action?.type === 'emit' && !draft?.action?.eventName?.trim());

	if (!isOpen && !isEmbedded) return null;

	const layoutContent = (
		<div className="blockish-interactions-modal__layout">
			<div className="blockish-cm-panel-header">
				<div className="blockish-cm-panel-brand">
					<div className="blockish-cm-panel-mark">IX</div>
					<div>
						<h2>{__('Interactions', 'blockish')}</h2>
						<p>
							{__(
								'Manage interactions and dynamic events across your site.',
								'blockish'
							)}
						</p>
					</div>
				</div>
				{!editingScope && (
					<div className="blockish-cm-panel-header-actions">
						<Button
							variant="secondary"
							onClick={() => {
								const input = document.createElement('input');
								input.type = 'file';
								input.accept = '.json';
								input.onchange = (e) => {
									const file = e.target.files[0];
									if (file) {
										const reader = new FileReader();
										reader.onload = async (event) => {
											try {
												const data = JSON.parse(event.target.result);
												if (!Array.isArray(data)) throw new Error('Invalid format');

												if (activeTab === 'page') {
													persistPageItems(data);
												} else if (activeTab === 'block') {
													persistBlockItems(data);
												} else if (activeTab === 'global') {
													setGlobalSaving(true);
													try {
														const compiledData = compileList(data, 'global');
														const response = await apiFetch({
															path: GLOBAL_API,
															method: 'POST',
															data: { interactions: compiledData },
														});
														const items = response?.items || compiledData;
														setGlobalItems(
															items
																.map((i) => normalizeInteraction(i, 'global'))
																.filter(Boolean)
																.map(ensureId)
														);
													} catch (err) {
														console.error(err);
													}
													setGlobalSaving(false);
												}
											} catch (err) {
												console.error(err);
												alert(__('Failed to import interactions. Please ensure the file is a valid JSON export.', 'blockish'));
											}
										};
										reader.readAsText(file);
									}
								};
								input.click();
							}}
						>
							{__('Import', 'blockish')}
						</Button>
						<Button
							variant="secondary"
							onClick={() => {
								let dataToExport = [];
								if (activeTab === 'page') dataToExport = pageItems;
								else if (activeTab === 'global') dataToExport = globalItems;
								else dataToExport = blockItems;
								const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport));
								const downloadAnchorNode = document.createElement('a');
								downloadAnchorNode.setAttribute('href', dataStr);
								downloadAnchorNode.setAttribute('download', `blockish-interactions-${activeTab}.json`);
								document.body.appendChild(downloadAnchorNode);
								downloadAnchorNode.click();
								downloadAnchorNode.remove();
							}}
						>
							{__('Export', 'blockish')}
						</Button>
					</div>
				)}
			</div>
				<div className="blockish-interactions-modal__body">
					<TabPanel
						className="blockish-interactions-tabs"
						activeClass="is-active"
						tabs={tabs}
						initialTabName={activeTab}
						onSelect={(name) => {
							if (!editingScope) {
								setActiveTab(name);
							}
						}}
					>
						{({ name }) => {
							if (name === 'block') {
								return (
									<ScopeTab
										scope="block"
										items={blockItems}
										description={__(
											'Only for the block you selected. You can add as many as you need.',
											'blockish'
										)}
										emptyText={__(
											'Add an animation, send a signal to other blocks, or run custom code.',
											'blockish'
										)}
										onEdit={(item) => startEdit('block', item)}
										onDelete={(id) => deleteItem('block', id)}
										editing={editingScope === 'block'}
										draft={draft}
										setDraft={setDraft}
										knownEventNames={knownEventNames}
									/>
								);
							}

							if (name === 'page') {
								if (!postId) {
									return (
										<p>
											{__(
												'Open a post or page to manage page-level interactions.',
												'blockish'
											)}
										</p>
									);
								}
								return (
									<div className="blockish-interactions-page-scope-wrapper">
										{!editingScope && (
											<div style={{ marginBottom: '16px' }}>
												<BlockishSelect.Async
													value={selectedPageOption}
													placeholder={__('Current page', 'blockish')}
													loadOptions={async (inputValue) => {
														try {
															const endpoint = inputValue
																? `/blockish/v1/dashboard-tools/search-posts?search=${inputValue}`
																: `/blockish/v1/dashboard-tools/search-posts`;
															const results = await apiFetch({ path: endpoint });
															return results.map(p => ({
																label: p.title || __('Untitled', 'blockish'),
																value: p.id
															}));
														} catch (e) {
															return [];
														}
													}}
													onChange={(selected) => {
														setSelectedPageOption(selected);
													}}
													menuPortalTarget={document.body}
													styles={{ menuPortal: base => ({ ...base, zIndex: 999999 }) }}
													isClearable
												/>
												<div style={{ fontSize: '12px', color: '#646970', marginTop: '4px' }}>
													{__('Empty means current page', 'blockish')}
												</div>
											</div>
										)}
										<ScopeTab
											scope="page"
											items={pageItems}
											description={__(
												'Reusable on this page. Use signals so several blocks can work together.',
												'blockish'
											)}
											emptyText={__(
												'Create page-wide rules you can reuse while editing this page.',
												'blockish'
											)}
											onEdit={(item) => startEdit('page', item)}
											onDelete={(id) => deleteItem('page', id)}
											editing={editingScope === 'page'}
											draft={draft}
											setDraft={setDraft}
											knownEventNames={knownEventNames}
										/>
									</div>
								);
							}

							return (
								<>
									{(globalLoading || globalSaving) && (
										<div className="blockish-interactions-loading">
											<Spinner />
										</div>
									)}
									<ScopeTab
										scope="global"
										items={globalItems}
										description={__(
											'Reusable everywhere on your site. Handy for shared click or load behavior.',
											'blockish'
										)}
										emptyText={__(
											'Create site-wide rules once, then use them on any page.',
											'blockish'
										)}
										onEdit={(item) => startEdit('global', item)}
										onDelete={(id) => deleteItem('global', id)}
										editing={editingScope === 'global'}
										draft={draft}
										setDraft={setDraft}
										knownEventNames={knownEventNames}
									/>
								</>
							);
						}}
					</TabPanel>
				</div>

				<footer className="blockish-cm-panel-footer" style={{ borderTop: '1px solid #dcdcde', margin: 0, bottom: '90px' }}>
					<div className="blockish-cm-panel-footer-stats"></div>
					<div className="blockish-cm-panel-footer-actions">
					{editingScope ? (
						<>
							<Button variant="secondary" onClick={cancelDraft}>
								{__('Back', 'blockish')}
							</Button>
							<Button
								variant="primary"
								className="is-blockish-primary"
								onClick={() => saveDraft(draft)}
								disabled={formSaveDisabled}
							>
								{__('Save', 'blockish')}
							</Button>
						</>
					) : (
						<>
							<Button
								variant="primary"
								className="is-blockish-primary"
								onClick={() => startAdd(activeTab)}
								disabled={!canAddOnTab}
							>
								{__('Add interaction', 'blockish')}
							</Button>
							{isEmbedded ? null : (
								<Button variant="secondary" onClick={onClose}>
									{__('Close', 'blockish')}
								</Button>
							)}
							<Button
								variant="primary"
								className="is-blockish-primary"
								onClick={handleApply}
							>
								{__('Done', 'blockish')}
							</Button>
						</>
					)}
					</div>
				</footer>
			</div>
	);

	if (isEmbedded) {
		return <div className="blockish-interactions-embedded" style={{height: '100%'}}>{layoutContent}</div>;
	}

	return (
		<Modal
			title={__('Interactions', 'blockish')}
			onRequestClose={() => {
				cancelDraft();
				handleApply();
			}}
			className="blockish-interactions-modal"
			size="large"
		>
			{layoutContent}
		</Modal>
	);
}
