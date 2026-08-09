import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { Button, TabPanel, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { useEntityProp } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';
import BlockishSelect from '../../../components/select';
import GlobalInteractionsPanel from './GlobalInteractionsPanel';
import PageInteractionsPanel from './PageInteractionsPanel';
import InteractionsFooter from './InteractionsFooter';
import { createEmptyInteraction } from '../utils/constants';
import { compileList, normalizeInteraction } from '../utils/compile';
import { collectEventNames } from '../utils/labels';
import {
	PAGE_META_KEY,
	GLOBAL_API,
	ensureId,
	upsertInList,
	prepareSavedItem,
	normalizeList,
	parsePageMeta,
	exportJson,
	importJsonFile,
} from '../utils/helpers';

export default function GlobalInteractionsBuilder({ onClose }) {
	const tabs = [
		{ name: 'page', title: __('Pages', 'blockish') },
		{ name: 'global', title: __('Whole site', 'blockish') },
	];

	const [activeTab, setActiveTab] = useState('page');
	const [pageItems, setPageItems] = useState([]);
	const [globalItems, setGlobalItems] = useState([]);
	const [globalLoading, setGlobalLoading] = useState(true);
	const [globalSaving, setGlobalSaving] = useState(false);
	const [selectedPageOption, setSelectedPageOption] = useState(null);
	const [pageLoading, setPageLoading] = useState(false);
	const [pageSaving, setPageSaving] = useState(false);
	const [editingScope, setEditingScope] = useState(null);
	const [draft, setDraft] = useState(null);

	const pageItemsRef = useRef(pageItems);
	pageItemsRef.current = pageItems;

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
					const response = await apiFetch({
						path: `/blockish/v1/dashboard-tools/page-interactions/${selectedPageOption.value}`,
						method: 'GET',
					});
					if (!cancelled) {
						const parsed = parsePageMeta(response?.items || []).map(ensureId);
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
			return () => {
				cancelled = true;
			};
		}

		if (meta) {
			const parsed = parsePageMeta(meta?.[PAGE_META_KEY]).map(ensureId);
			setPageItems(parsed);
			pageItemsRef.current = parsed;
		}
	}, [meta, selectedPageOption]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			setGlobalLoading(true);
			try {
				const response = await apiFetch({ path: GLOBAL_API, method: 'GET' });
				const list =
					response?.items || response?.globalInteractions?.items || [];
				if (!cancelled) {
					setGlobalItems(normalizeList(list, 'global'));
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
		() => collectEventNames([pageItems, globalItems]),
		[pageItems, globalItems]
	);

	const cancelDraft = useCallback(() => {
		setEditingScope(null);
		setDraft(null);
	}, []);

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
						data: { interactions: compiled },
					});
					const parsed = parsePageMeta(response?.items || []).map(ensureId);
					setPageItems(parsed);
					pageItemsRef.current = parsed;
				} catch (e) {
					/* ignore */
				}
				setPageSaving(false);
				return;
			}

			if (postId && typeof setMeta === 'function') {
				setMeta({
					...(meta || {}),
					[PAGE_META_KEY]: compiled,
				});
			}
		},
		[meta, postId, setMeta, selectedPageOption]
	);

	const persistGlobalItems = useCallback(async (next) => {
		setGlobalSaving(true);
		try {
			const compiledNext = compileList(next, 'global');
			const response = await apiFetch({
				path: GLOBAL_API,
				method: 'POST',
				data: { interactions: compiledNext },
			});
			setGlobalItems(normalizeList(response?.items || compiledNext, 'global'));
		} catch (e) {
			/* ignore */
		}
		setGlobalSaving(false);
	}, []);

	const saveDraft = useCallback(async () => {
		if (!draft || !editingScope) return;
		const normalized = prepareSavedItem(draft, editingScope);
		if (!normalized) return;

		if (editingScope === 'page') {
			await persistPageItems(upsertInList(pageItemsRef.current, normalized));
		} else {
			await persistGlobalItems(upsertInList(globalItems, normalized));
		}
		cancelDraft();
	}, [
		draft,
		editingScope,
		globalItems,
		persistPageItems,
		persistGlobalItems,
		cancelDraft,
	]);

	const deleteItem = useCallback(
		async (scope, id) => {
			if (!id) return;
			if (scope === 'page') {
				await persistPageItems(
					pageItemsRef.current.filter((i) => i.id !== id)
				);
				return;
			}
			setGlobalSaving(true);
			try {
				await apiFetch({ path: `${GLOBAL_API}/${id}`, method: 'DELETE' });
				setGlobalItems((prev) => prev.filter((i) => i.id !== id));
			} catch (e) {
				/* ignore */
			}
			setGlobalSaving(false);
		},
		[persistPageItems]
	);

	const done = useCallback(() => {
		if (postId) {
			persistPageItems(pageItemsRef.current);
		}
		cancelDraft();
		onClose?.();
	}, [postId, persistPageItems, cancelDraft, onClose]);

	const importCurrentTab = useCallback(async () => {
		try {
			const data = await importJsonFile();
			if (activeTab === 'page') {
				await persistPageItems(normalizeList(data, 'page'));
			} else {
				await persistGlobalItems(normalizeList(data, 'global'));
			}
		} catch (e) {
			/* cancelled / invalid */
		}
	}, [activeTab, persistPageItems, persistGlobalItems]);

	const exportCurrentTab = useCallback(() => {
		const data = activeTab === 'page' ? pageItems : globalItems;
		exportJson(data, `blockish-interactions-${activeTab}.json`);
	}, [activeTab, pageItems, globalItems]);

	const editing = !!editingScope;

	return (
		<div className="blockish-interactions-embedded">
			<div className="blockish-interactions-modal__layout blockish-interactions-modal__layout--global">
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
					{!editing && (
						<div className="blockish-cm-panel-header-actions">
							<Button variant="secondary" onClick={importCurrentTab}>
								{__('Import', 'blockish')}
							</Button>
							<Button variant="secondary" onClick={exportCurrentTab}>
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
							if (name === activeTab) return;
							cancelDraft();
							setActiveTab(name);
						}}
					>
						{({ name }) => {
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
										{!editing && (
											<div className="blockish-interactions-page-picker">
												<BlockishSelect.Async
													value={selectedPageOption}
													placeholder={__('Current page', 'blockish')}
													loadOptions={async (inputValue) => {
														try {
															const endpoint = inputValue
																? `/blockish/v1/dashboard-tools/search-posts?search=${inputValue}`
																: `/blockish/v1/dashboard-tools/search-posts`;
															const results = await apiFetch({
																path: endpoint,
															});
															return results.map((p) => ({
																label:
																	p.title || __('Untitled', 'blockish'),
																value: p.id,
															}));
														} catch (e) {
															return [];
														}
													}}
													onChange={(option) => {
														cancelDraft();
														setSelectedPageOption(option);
													}}
													menuPortalTarget={document.body}
													styles={{
														menuPortal: (base) => ({
															...base,
															zIndex: 999999,
														}),
													}}
													isClearable
												/>
												<div className="blockish-interactions-page-picker__hint">
													{__('Empty means current page', 'blockish')}
												</div>
										</div>
									)}
										{(pageLoading || pageSaving) && (
											<div className="blockish-interactions-loading">
												<Spinner />
											</div>
										)}
										<PageInteractionsPanel
											items={pageItems}
											onEdit={(item) => {
												setEditingScope('page');
												setDraft(
													ensureId(normalizeInteraction(item, 'page'))
												);
											}}
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
								<GlobalInteractionsPanel
									items={globalItems}
									onEdit={(item) => {
										setEditingScope('global');
										setDraft(
											ensureId(normalizeInteraction(item, 'global'))
										);
									}}
									onDelete={(id) => deleteItem('global', id)}
									editing={editingScope === 'global'}
									draft={draft}
									setDraft={setDraft}
									knownEventNames={knownEventNames}
									loading={globalLoading || globalSaving}
								/>
							);
						}}
					</TabPanel>
				</div>

				<InteractionsFooter
					editing={editing}
					draft={draft}
					onBack={cancelDraft}
					onSave={saveDraft}
					onAdd={() => {
						setEditingScope(activeTab);
						setDraft(createEmptyInteraction(activeTab));
					}}
					onDone={done}
					addDisabled={activeTab === 'page' && !postId}
				/>
			</div>
		</div>
	);
}
