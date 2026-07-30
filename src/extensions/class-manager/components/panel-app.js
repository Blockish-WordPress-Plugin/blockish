import { __, sprintf } from '@wordpress/i18n';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Modal,
	Spinner,
	TextControl,
	TextareaControl,
} from '@wordpress/components';
import clsx from 'clsx';

const PANEL_BASE = '/blockish/v1/dashboard-tools/class-manager/panel';

/**
 * Normalize to a CSS class slug (mirrors ClassStyleConverter::normalize_slug).
 *
 * @param {string} value
 * @return {string}
 */
function normalizeClassSlug(value) {
	const slug = String(value || '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9_-]/g, '');

	return /^[a-z_][a-z0-9_-]*$/.test(slug) ? slug : '';
}

/**
 * Live sanitize while typing: lowercase, spaces→hyphen, strip junk.
 *
 * @param {string} value
 * @return {string}
 */
function sanitizeClassNameInput(value) {
	return String(value || '')
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9_-]/g, '');
}

function validateClassName(value, existingClasses = [], excludeId = null) {
	const raw = String(value || '').trim();
	if (!raw) {
		return { ok: false, slug: '', message: __('Class name is required.', 'blockish') };
	}

	if (/[^a-z0-9_-]/.test(raw) || /[A-Z]/.test(String(value || ''))) {
		return {
			ok: false,
			slug: '',
			message: __(
				'Use only lowercase letters, numbers, hyphens, and underscores (e.g. hero-card).',
				'blockish'
			),
		};
	}

	if (/^[0-9]/.test(raw)) {
		return {
			ok: false,
			slug: '',
			message: __('Class name must start with a letter or underscore.', 'blockish'),
		};
	}

	const slug = normalizeClassSlug(raw);
	if (!slug) {
		return {
			ok: false,
			slug: '',
			message: __(
				'Invalid class name. Use lowercase letters, numbers, hyphens, and underscores.',
				'blockish'
			),
		};
	}

	const duplicate = existingClasses.some(
		(item) =>
			item.post_id !== excludeId &&
			(normalizeClassSlug(item.name) === slug || normalizeClassSlug(item.css_selector?.replace(/^\./, '')) === slug)
	);
	if (duplicate) {
		return { ok: false, slug, message: __('Class already exists.', 'blockish') };
	}

	return { ok: true, slug, message: '' };
}

async function fetchPanel() {
	const response = await apiFetch({ path: PANEL_BASE });
	if (response?.status !== 'success' || !response?.panel) {
		throw new Error(response?.message || __('Failed to load Class Manager panel.', 'blockish'));
	}
	return response.panel;
}

function postTypeLabel(postType) {
	const labels = {
		post: __('Post', 'blockish'),
		page: __('Page', 'blockish'),
		wp_block: __('Pattern', 'blockish'),
		wp_template: __('Template', 'blockish'),
		wp_template_part: __('Template Part', 'blockish'),
		blockish_form: __('Form', 'blockish'),
	};
	return labels[postType] || postType;
}

export default function ClassManagerPanelApp({ onClose }) {
	const [panel, setPanel] = useState({ classes: [], unused: [] });
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [selectedId, setSelectedId] = useState(null);
	const [createName, setCreateName] = useState('');
	const [renameName, setRenameName] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [deleteTargets, setDeleteTargets] = useState([]);
	const [checkedIds, setCheckedIds] = useState([]);
	const [isUsageModalOpen, setIsUsageModalOpen] = useState(false);
	const [showCreateError, setShowCreateError] = useState(false);
	const [showRenameError, setShowRenameError] = useState(false);

	useEffect(() => {
		if (!error) {
			return undefined;
		}
		const timer = setTimeout(() => setError(''), 4000);
		return () => clearTimeout(timer);
	}, [error]);

	const loadPanel = useCallback(async () => {
		setIsLoading(true);
		setError('');
		try {
			const data = await fetchPanel();
			setPanel(data);
			setSelectedId((current) => {
				if (current && data.classes.some((item) => item.post_id === current)) {
					return current;
				}
				return data.classes[0]?.post_id ?? null;
			});
		} catch (err) {
			setError(err?.message || __('Failed to load classes.', 'blockish'));
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadPanel();
	}, [loadPanel]);

	const filteredClasses = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) {
			return panel.classes;
		}
		return panel.classes.filter((item) => {
			const name = String(item.name || '').toLowerCase();
			const selector = String(item.css_selector || '').toLowerCase();
			return name.includes(q) || selector.includes(q);
		});
	}, [panel.classes, search]);

	const selectedClass = useMemo(
		() => panel.classes.find((item) => item.post_id === selectedId) || null,
		[panel.classes, selectedId]
	);

	useEffect(() => {
		setRenameName(selectedClass?.name || '');
	}, [selectedClass?.post_id, selectedClass?.name]);

	const checkedSet = useMemo(() => new Set(checkedIds), [checkedIds]);

	const checkedClasses = useMemo(
		() => panel.classes.filter((item) => checkedSet.has(item.post_id)),
		[panel.classes, checkedSet]
	);

	const allVisibleChecked =
		filteredClasses.length > 0 &&
		filteredClasses.every((item) => checkedSet.has(item.post_id));

	const toggleChecked = (postId) => {
		setCheckedIds((current) =>
			current.includes(postId)
				? current.filter((id) => id !== postId)
				: [...current, postId]
		);
	};

	const toggleAllVisible = () => {
		const visibleIds = filteredClasses.map((item) => item.post_id);
		setCheckedIds((current) => {
			if (allVisibleChecked) {
				return current.filter((id) => !visibleIds.includes(id));
			}
			return [...new Set([...current, ...visibleIds])];
		});
	};

	const selectUnused = () => {
		setCheckedIds(
			filteredClasses.filter((item) => !item.usage_count).map((item) => item.post_id)
		);
	};

	const createValidation = useMemo(
		() => validateClassName(createName, panel.classes),
		[createName, panel.classes]
	);

	const renameValidation = useMemo(
		() =>
			selectedClass
				? validateClassName(renameName, panel.classes, selectedClass.post_id)
				: { ok: false, slug: '', message: '' },
		[renameName, panel.classes, selectedClass]
	);

	useEffect(() => {
		if (!createName || createValidation.ok) {
			setShowCreateError(false);
			return undefined;
		}
		setShowCreateError(true);
		const timer = setTimeout(() => setShowCreateError(false), 4000);
		return () => clearTimeout(timer);
	}, [createName, createValidation.ok, createValidation.message]);

	useEffect(() => {
		if (!renameName || renameValidation.ok) {
			setShowRenameError(false);
			return undefined;
		}
		setShowRenameError(true);
		const timer = setTimeout(() => setShowRenameError(false), 4000);
		return () => clearTimeout(timer);
	}, [renameName, renameValidation.ok, renameValidation.message]);

	const handleCreate = async () => {
		const validation = validateClassName(createName, panel.classes);
		if (!validation.ok) {
			setError(validation.message);
			return;
		}
		setIsSaving(true);
		setError('');
		try {
			const response = await apiFetch({
				path: PANEL_BASE,
				method: 'POST',
				data: { title: validation.slug },
			});
			if (response?.status !== 'success') {
				throw new Error(response?.message || __('Failed to create class.', 'blockish'));
			}
			setPanel(response.panel);
			setCreateName('');
			if (response.post_id) {
				setSelectedId(response.post_id);
			}
		} catch (err) {
			setError(err?.message || __('Failed to create class.', 'blockish'));
		} finally {
			setIsSaving(false);
		}
	};

	const handleRename = async () => {
		if (!selectedClass) {
			return;
		}
		const validation = validateClassName(renameName, panel.classes, selectedClass.post_id);
		if (!validation.ok) {
			setError(validation.message);
			return;
		}
		if (validation.slug === normalizeClassSlug(selectedClass.name)) {
			return;
		}
		setIsSaving(true);
		setError('');
		try {
			const response = await apiFetch({
				path: `${PANEL_BASE}/${selectedClass.post_id}`,
				method: 'POST',
				data: { title: validation.slug },
			});
			if (response?.status !== 'success') {
				throw new Error(response?.message || __('Failed to rename class.', 'blockish'));
			}
			setPanel(response.panel);
		} catch (err) {
			setError(err?.message || __('Failed to rename class.', 'blockish'));
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!deleteTargets.length) {
			return;
		}
		setIsSaving(true);
		setError('');
		try {
			const isBulk = deleteTargets.length > 1;
			const response = isBulk
				? await apiFetch({
						path: `${PANEL_BASE}/bulk-delete`,
						method: 'POST',
						data: { post_ids: deleteTargets.map((item) => item.post_id) },
					})
				: await apiFetch({
						path: `${PANEL_BASE}/${deleteTargets[0].post_id}`,
						method: 'DELETE',
					});
			if (response?.status !== 'success') {
				throw new Error(response?.message || __('Failed to delete class.', 'blockish'));
			}
			const removed = new Set(deleteTargets.map((item) => item.post_id));
			setPanel(response.panel);
			setDeleteTargets([]);
			setCheckedIds((current) => current.filter((id) => !removed.has(id)));
			setSelectedId((current) =>
				current && !removed.has(current)
					? current
					: (response.panel.classes[0]?.post_id ?? null)
			);
		} catch (err) {
			setError(err?.message || __('Failed to delete class.', 'blockish'));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="blockish-cm-panel">
			<div className="blockish-cm-panel-header">
				<div className="blockish-cm-panel-brand">
					<span className="blockish-cm-panel-mark">CM</span>
					<div>
						<h2>{__('Class Manager', 'blockish')}</h2>
						<p>
							{__(
								'Inspect global classes and track their usage across the site.',
								'blockish'
							)}
						</p>
					</div>
				</div>
				<div className="blockish-cm-panel-header-actions">
					<div className="blockish-cm-panel-stats">
						<span>
							<strong>{panel.classes.length}</strong>
							{__(' classes', 'blockish')}
						</span>
						<span>
							<strong>{panel.unused.length}</strong>
							{__(' unused', 'blockish')}
						</span>
					</div>
					<Button
						variant="tertiary"
						onClick={onClose}
						className="blockish-cm-panel-close"
						aria-label={__('Close Class Manager', 'blockish')}
					>
						<span aria-hidden="true">×</span>
					</Button>
				</div>
			</div>

			{error ? <p className="blockish-cm-panel-error">{error}</p> : null}

			{isLoading ? (
				<div className="blockish-cm-panel-loading">
					<Spinner />
				</div>
			) : (
				<div className="blockish-cm-panel-layout">
					<aside className="blockish-cm-panel-sidebar">
						<div className="blockish-cm-panel-search">
							<TextControl
								label={__('Search classes', 'blockish')}
								hideLabelFromVision
								value={search}
								onChange={setSearch}
								placeholder={__('Search classes…', 'blockish')}
								__nextHasNoMarginBottom
							/>
						</div>

						<div className="blockish-cm-panel-bulk">
							<label className="blockish-cm-panel-checkbox">
								<input
									type="checkbox"
									checked={allVisibleChecked}
									onChange={toggleAllVisible}
									disabled={filteredClasses.length === 0}
								/>
								<span>{__('Select all', 'blockish')}</span>
							</label>
							<Button
								variant="link"
								onClick={selectUnused}
								disabled={filteredClasses.length === 0}
							>
								{__('Select unused', 'blockish')}
							</Button>
						</div>

						<div className="blockish-cm-panel-list">
							{filteredClasses.length === 0 ? (
								<p className="blockish-cm-panel-empty">
									{__('No classes found.', 'blockish')}
								</p>
							) : (
								filteredClasses.map((item) => (
									<div
										key={item.post_id}
										className={clsx('blockish-cm-panel-list-item', {
											'is-selected': selectedId === item.post_id,
											'is-checked': checkedSet.has(item.post_id),
										})}
									>
										<input
											type="checkbox"
											checked={checkedSet.has(item.post_id)}
											onChange={() => toggleChecked(item.post_id)}
											aria-label={sprintf(
												/* translators: %s: class name */
												__('Select %s', 'blockish'),
												item.name
											)}
										/>
										<button
											type="button"
											className="blockish-cm-panel-list-item-main"
											aria-pressed={selectedId === item.post_id}
											onClick={() => setSelectedId(item.post_id)}
										>
											<span className="blockish-cm-panel-list-item-name">
												{item.name}
											</span>
											<span className="blockish-cm-panel-list-item-meta">
												{item.usage_count > 0 ? (
													<span className="blockish-cm-panel-badge">
														{item.usage_count}
													</span>
												) : (
													<span className="blockish-cm-panel-badge is-unused">
														{__('Unused', 'blockish')}
													</span>
												)}
											</span>
										</button>
									</div>
								))
							)}
						</div>

						<div className="blockish-cm-panel-create">
							<span className="blockish-cm-panel-create-label">
								{__('Create a class', 'blockish')}
							</span>
							<div className="blockish-cm-panel-create-row">
								<TextControl
									label={__('Class name', 'blockish')}
									hideLabelFromVision
									value={createName}
									onChange={(value) => {
										setCreateName(sanitizeClassNameInput(value));
										if (error) {
											setError('');
										}
									}}
									placeholder={__('e.g. hero-card', 'blockish')}
									className={
										showCreateError && createName && !createValidation.ok
											? 'blockish-cm-panel-field-invalid'
											: undefined
									}
									__nextHasNoMarginBottom
								/>
								<Button
									variant="primary"
									onClick={handleCreate}
									disabled={isSaving || !createValidation.ok}
									isBusy={isSaving}
								>
									{__('Create', 'blockish')}
								</Button>
							</div>
							<p
								className={clsx('blockish-cm-panel-create-help', {
									'is-error':
										showCreateError && createName && !createValidation.ok,
								})}
							>
								{showCreateError && createName && !createValidation.ok
									? createValidation.message
									: __(
											'Lowercase letters, numbers, hyphen, underscore. Must start with a letter.',
											'blockish'
										)}
							</p>
						</div>
					</aside>

					<main className="blockish-cm-panel-detail">
						{selectedClass ? (
							<>
								<div className="blockish-cm-panel-detail-header">
									<div>
										<span className="blockish-cm-panel-detail-label">
											{__('Selected class', 'blockish')}
										</span>
										<h3>{selectedClass.name}</h3>
										<code>{selectedClass.css_selector}</code>
									</div>
									<span
										className={clsx('blockish-cm-panel-badge', {
											'is-unused': !selectedClass.usage_count,
										})}
									>
										{selectedClass.usage_count
											? sprintf(
													/* translators: %d: usage count */
													__('%d uses', 'blockish'),
													selectedClass.usage_count
												)
											: __('Unused', 'blockish')}
									</span>
								</div>

								<section className="blockish-cm-panel-section blockish-cm-panel-identity">
									<h4>{__('Identity', 'blockish')}</h4>
									<div className="blockish-cm-panel-rename">
										<TextControl
											label={__('Class name', 'blockish')}
											value={renameName}
											onChange={(value) => {
												setRenameName(sanitizeClassNameInput(value));
												if (error) {
													setError('');
												}
											}}
											help={
												showRenameError && renameName && !renameValidation.ok
													? renameValidation.message
													: undefined
											}
											__nextHasNoMarginBottom
										/>
										<Button
											variant="secondary"
											onClick={handleRename}
											disabled={
												isSaving ||
												!renameValidation.ok ||
												renameValidation.slug ===
													normalizeClassSlug(selectedClass.name)
											}
											isBusy={isSaving}
										>
											{__('Rename', 'blockish')}
										</Button>
									</div>
								</section>

								<section className="blockish-cm-panel-section blockish-cm-panel-css">
									<div className="blockish-cm-panel-section-title">
										<h4>{__('Generated CSS', 'blockish')}</h4>
										<span>{__('Read only', 'blockish')}</span>
									</div>
									{selectedClass.css?.trim() ? (
										<TextareaControl
											value={selectedClass.css}
											readOnly
											rows={12}
											help={__(
												'To change styles, select a block and use its Class Manager controls.',
												'blockish'
											)}
											__nextHasNoMarginBottom
										/>
									) : (
										<div className="blockish-cm-panel-css-empty">
											<strong>{__('No CSS found', 'blockish')}</strong>
											<p>
												{__(
													'This class has no styles yet. Select a block, attach the class, and edit styles from Class Manager controls.',
													'blockish'
												)}
											</p>
										</div>
									)}
								</section>

								<section className="blockish-cm-panel-section blockish-cm-panel-usage">
									<h4>
										{sprintf(
											/* translators: %d: number of posts */
											__('Used in %d places', 'blockish'),
											selectedClass.usage_count || 0
										)}
									</h4>
									{selectedClass.used_in?.length ? (
										<ul className="blockish-cm-panel-usage-list">
											{selectedClass.used_in.slice(0, 3).map((usage) => (
												<li key={`${usage.post_id}-${usage.post_type}`}>
													<div>
														<strong>
															{usage.title ||
																sprintf(
																	/* translators: %d: post ID */
																	__('Untitled #%d', 'blockish'),
																	usage.post_id
																)}
														</strong>
														<span className="blockish-cm-panel-usage-meta">
															{postTypeLabel(usage.post_type)}
															{usage.status ? ` · ${usage.status}` : ''}
														</span>
													</div>
													{usage.edit_url ? (
														<a
															href={usage.edit_url}
															target="_blank"
															rel="noreferrer"
															className="blockish-cm-panel-open-link"
														>
															{__('Open', 'blockish')}
														</a>
													) : null}
												</li>
											))}
										</ul>
									) : (
										<p className="blockish-cm-panel-empty">
											{__('This class is not used anywhere yet.', 'blockish')}
										</p>
									)}
									{selectedClass.used_in?.length > 3 ? (
										<Button
											variant="link"
											onClick={() => setIsUsageModalOpen(true)}
											className="blockish-cm-panel-view-all"
										>
											{sprintf(
												/* translators: %d: remaining usage count */
												__('View all (%d more)', 'blockish'),
												selectedClass.used_in.length - 3
											)}
										</Button>
									) : null}
								</section>

								<div className="blockish-cm-panel-danger">
									<div>
										<strong>{__('Delete class', 'blockish')}</strong>
										<p>
											{__(
												'Permanently remove this class and its child selectors.',
												'blockish'
											)}
										</p>
									</div>
									<Button
										variant="secondary"
										isDestructive
										onClick={() => setDeleteTargets([selectedClass])}
										disabled={isSaving}
									>
										{__('Delete', 'blockish')}
									</Button>
								</div>
							</>
						) : (
							<div className="blockish-cm-panel-blank">
								<h3>{__('No class selected', 'blockish')}</h3>
								<p>{__('Select or create a class to inspect it.', 'blockish')}</p>
							</div>
						)}
					</main>
				</div>
			)}

			<footer className="blockish-cm-panel-footer">
				<div>
					{checkedClasses.length > 0 ? (
						<strong>
							{sprintf(
								/* translators: %d: number of selected classes */
								__('%d selected', 'blockish'),
								checkedClasses.length
							)}
						</strong>
					) : (
						<span>{__('Select classes to perform bulk actions.', 'blockish')}</span>
					)}
				</div>
				<div className="blockish-cm-panel-footer-actions">
					{checkedClasses.length > 0 ? (
						<>
							<Button
								variant="tertiary"
								onClick={() => setCheckedIds([])}
								disabled={isSaving}
							>
								{__('Clear selection', 'blockish')}
							</Button>
							<Button
								variant="secondary"
								isDestructive
								onClick={() => setDeleteTargets(checkedClasses)}
								disabled={isSaving}
							>
								{__('Delete selected', 'blockish')}
							</Button>
						</>
					) : null}
					<Button variant="primary" onClick={onClose}>
						{__('Done', 'blockish')}
					</Button>
				</div>
			</footer>

			{deleteTargets.length ? (
				<Modal
					title={
						deleteTargets.length > 1
							? __('Delete classes?', 'blockish')
							: __('Delete class?', 'blockish')
					}
					onRequestClose={() => !isSaving && setDeleteTargets([])}
					className="blockish-cm-panel-delete-modal"
				>
					<div className="blockish-cm-panel-stack">
						<p>
							{sprintf(
								/* translators: %d: number of classes */
								__(
									'You are about to permanently delete %d class(es) and their child selectors.',
									'blockish'
								),
								deleteTargets.length
							)}
						</p>
						<ul className="blockish-cm-panel-delete-list">
							{deleteTargets.map((item) => (
								<li key={item.post_id}>
									<code>{item.css_selector}</code>
									<span
										className={clsx('blockish-cm-panel-badge', {
											'is-unused': !item.usage_count,
										})}
									>
										{item.usage_count
											? sprintf(
													/* translators: %d: usage count */
													__('%d uses', 'blockish'),
													item.usage_count
												)
											: __('Unused', 'blockish')}
									</span>
								</li>
							))}
						</ul>
						{deleteTargets.some((item) => item.usage_count > 0) ? (
							<p className="blockish-cm-panel-warning">
								{__(
									'Some of these classes are still in use. Blocks using them may lose styles until you re-attach or restyle them.',
									'blockish'
								)}
							</p>
						) : null}
						<div className="blockish-cm-panel-delete-actions">
							<Button
								variant="secondary"
								onClick={() => setDeleteTargets([])}
								disabled={isSaving}
							>
								{__('Cancel', 'blockish')}
							</Button>
							<Button variant="primary" isDestructive onClick={handleDelete} isBusy={isSaving}>
								{__('Delete', 'blockish')}
							</Button>
						</div>
					</div>
				</Modal>
			) : null}

			{isUsageModalOpen && selectedClass ? (
				<Modal
					title={sprintf(
						/* translators: %s: class name */
						__('Where %s is used', 'blockish'),
						selectedClass.css_selector
					)}
					onRequestClose={() => setIsUsageModalOpen(false)}
					className="blockish-cm-panel-usage-modal"
				>
					<ul className="blockish-cm-panel-usage-list">
						{selectedClass.used_in.map((usage) => (
							<li key={`${usage.post_id}-${usage.post_type}`}>
								<div>
									<strong>
										{usage.title ||
											sprintf(
												/* translators: %d: post ID */
												__('Untitled #%d', 'blockish'),
												usage.post_id
											)}
									</strong>
									<span className="blockish-cm-panel-usage-meta">
										{postTypeLabel(usage.post_type)}
										{usage.status ? ` · ${usage.status}` : ''}
									</span>
								</div>
								{usage.edit_url ? (
									<a href={usage.edit_url} target="_blank" rel="noreferrer">
										{__('Open', 'blockish')}
									</a>
								) : null}
							</li>
						))}
					</ul>
				</Modal>
			) : null}
		</div>
	);
}
