import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import BlockishCodeEditor from '../../../components/code-editor';
import {
	Button,
	Flex,
	Modal,
	TextControl,
	TextareaControl,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';

function normalizeClassItem(item = {}) {
	const titleRaw = item?.title;
	const contentRaw = item?.content;
	const title =
		typeof titleRaw === 'string'
			? titleRaw
			: titleRaw?.raw || titleRaw?.rendered || '';
	const content =
		typeof contentRaw === 'string'
			? contentRaw
			: contentRaw?.raw || contentRaw?.rendered || '';
	let attributes = {};

	try {
		const parsed = JSON.parse(content || '{}');
		if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
			attributes = parsed;
		}
	} catch (error) {
		attributes = {
			customCss: content || '',
		};
	}

	return {
		id: item.id,
		title,
		slug: item.slug || normalizeClassSlug(title),
		content,
		attributes,
		customCss: attributes?.customCss || '',
	};
}

function normalizeClassSlug(value) {
	const slug = String(value || '')
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9_-]/g, '');

	return /^[a-z_][a-z0-9_-]*$/.test(slug) ? slug : '';
}

export default function ClassManagerSettings({ isOpen, onRequestClose }) {
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState('');
	const [search, setSearch] = useState('');
	const [items, setItems] = useState([]);
	const [editingId, setEditingId] = useState(null);
	const [draft, setDraft] = useState({
		title: '',
		attributes: '{}',
		customCss: '',
	});

	const loadData = async () => {
		setIsLoading(true);
		setError('');
		try {
			const response = await apiFetch({
				path: '/wp/v2/blockish-classes?per_page=100&context=edit',
				method: 'GET',
			});
			const next = (Array.isArray(response) ? response : []).map(normalizeClassItem);
			setItems(next);
		} catch (err) {
			setError(err?.message || __('Failed to load class manager data', 'blockish'));
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (isOpen) {
			loadData();
		}
	}, [isOpen]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return items;
		return items.filter((item) => `${item.title} ${item.slug}`.toLowerCase().includes(q));
	}, [items, search]);

	const normalizedNewClass = useMemo(() => {
		const raw = (search || '').trim();
		if (!raw) return '';
		return raw.startsWith('.') ? raw.slice(1) : raw;
	}, [search]);

	const isProperClassName = useMemo(
		() => /^[A-Za-z_][A-Za-z0-9_-]*$/.test(normalizedNewClass),
		[normalizedNewClass]
	);

	const hasDuplicateClassName = useMemo(() => {
		const target = normalizedNewClass.toLowerCase();
		if (!target) return false;
		return items.some(
			(item) =>
				(item?.slug || '').toLowerCase() === target || (item?.title || '').toLowerCase() === target
		);
	}, [items, normalizedNewClass]);

	const canCreateNewClass =
		!editingId &&
		!isLoading &&
		!isSaving &&
		!isCreating &&
		Boolean(normalizedNewClass) &&
		isProperClassName &&
		!hasDuplicateClassName;

	const beginEdit = (item) => {
		setEditingId(item.id);
		const attributes = item?.attributes && typeof item.attributes === 'object' ? item.attributes : {};
		const attributesJson = JSON.stringify(attributes, null, 2);
		setDraft({
			title: item.title || '',
			attributes: attributesJson,
			customCss: attributes?.customCss || '',
		});
	};

	const cancelEdit = () => {
		setEditingId(null);
		setDraft({ title: '', attributes: '{}', customCss: '' });
	};

	const updateCustomCss = (nextCss) => {
		const safeCss = nextCss || '';
		setDraft((prev) => {
			let nextAttributes = {};
			try {
				const parsed = JSON.parse(prev.attributes || '{}');
				if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
					nextAttributes = parsed;
				}
			} catch (error) {
				nextAttributes = {};
			}

			nextAttributes.customCss = safeCss;
			return {
				...prev,
				customCss: safeCss,
				attributes: JSON.stringify(nextAttributes, null, 2),
			};
		});
	};

	const updateAttributes = (nextAttributes) => {
		const nextText = nextAttributes || '';
		setDraft((prev) => {
			let nextCustomCss = prev.customCss || '';
			try {
				const parsed = JSON.parse(nextText || '{}');
				if (
					parsed &&
					typeof parsed === 'object' &&
					!Array.isArray(parsed) &&
					typeof parsed.customCss === 'string'
				) {
					nextCustomCss = parsed.customCss;
				}
			} catch (error) {
				// Keep previous CSS value until JSON is valid again.
			}

			return {
				...prev,
				attributes: nextText,
				customCss: nextCustomCss,
			};
		});
	};

	const saveClass = async (id) => {
		setIsSaving(true);
		setError('');
		try {
			let parsedAttributes = {};
			try {
				parsedAttributes = JSON.parse(draft.attributes || '{}');
			} catch (jsonError) {
				setError(__('Attributes must be valid JSON before saving.', 'blockish'));
				setIsSaving(false);
				return;
			}

			if (!parsedAttributes || typeof parsedAttributes !== 'object' || Array.isArray(parsedAttributes)) {
				setError(__('Attributes must be a JSON object.', 'blockish'));
				setIsSaving(false);
				return;
			}

			parsedAttributes.customCss = draft.customCss || '';

			const updated = await apiFetch({
				path: `/wp/v2/blockish-classes/${id}`,
				method: 'POST',
				data: {
					title: draft.title || '',
					content: JSON.stringify(parsedAttributes),
				},
			});
			const normalized = normalizeClassItem(updated);
			setItems((prev) => prev.map((item) => (item.id === id ? normalized : item)));
			cancelEdit();
		} catch (err) {
			setError(err?.message || __('Failed to update class', 'blockish'));
		} finally {
			setIsSaving(false);
		}
	};

	const deleteClass = async (id) => {
		setIsSaving(true);
		setError('');
		try {
			await apiFetch({ path: `/wp/v2/blockish-classes/${id}?force=true`, method: 'DELETE' });
			setItems((prev) => prev.filter((item) => item.id !== id));
			if (editingId === id) {
				cancelEdit();
			}
		} catch (err) {
			setError(err?.message || __('Failed to delete class', 'blockish'));
		} finally {
			setIsSaving(false);
		}
	};

	const createClass = async () => {
		if (!canCreateNewClass) {
			return;
		}

		setIsCreating(true);
		setError('');

		try {
			const created = await apiFetch({
				path: '/wp/v2/blockish-classes',
				method: 'POST',
				data: {
					title: normalizedNewClass,
					content: '',
					status: 'publish',
				},
			});

			setItems((prev) => [normalizeClassItem(created), ...prev]);
			setSearch('');
		} catch (err) {
			setError(err?.message || __('Failed to create class', 'blockish'));
		} finally {
			setIsCreating(false);
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		<Modal
			title={
				<div className="blockish-class-manager-title-wrap">
					<span>{__('CSS Class Manager', 'blockish')}</span>
					<Text className="blockish-class-manager-count-pill">
						{sprintf(
							Number(items.length) === 1 ? __('%d class', 'blockish') : __('%d classes', 'blockish'),
							Number(items.length)
						)}
					</Text>
				</div>
			}
			className="blockish-configure-modal blockish-class-manager-modal"
			onRequestClose={onRequestClose}
		>
			<VStack className="blockish-modal-controls blockish-class-manager-content" spacing={4}>
				{!editingId && (
					<Flex className="blockish-class-manager-toolbar" justify="space-between" align="center">
						<div className="blockish-schemas-modal-search blockish-class-manager-search">
							<span className="blockish-schemas-modal-search-icon" aria-hidden="true">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<circle cx="11" cy="11" r="7" />
									<path d="M20 20l-3.5-3.5" />
								</svg>
							</span>
							<input
								className="blockish-schemas-modal-search-input"
								type="search"
								placeholder={__('Search classes...', 'blockish')}
								value={search}
								onChange={(event) => setSearch(event.target.value)}
							/>
						</div>
						<Button
							className="blockish-class-manager-new-btn"
							variant="primary"
							icon="plus"
							disabled={!canCreateNewClass}
							onClick={createClass}
						>
							{__('New Class', 'blockish')}
						</Button>
					</Flex>
				)}
				{!editingId && Boolean(normalizedNewClass) && !isProperClassName && (
					<Text className="blockish-text-muted">
						{__('Use letters, numbers, underscore, hyphen; and start with a letter or underscore.', 'blockish')}
					</Text>
				)}
				{!editingId && Boolean(normalizedNewClass) && isProperClassName && hasDuplicateClassName && (
					<Text className="blockish-text-muted">{__('Class already exists.', 'blockish')}</Text>
				)}
				{error && <Text className="blockish-error">{error}</Text>}

				<div className="blockish-settings-list blockish-class-manager-list">
					{filtered.map((item) => {
						const isEditing = editingId === item.id;

						if (isEditing) {
							return (
								<VStack key={item.id} className="blockish-settings-row has-divider" spacing={3}>
									<TextControl
										label={__('Class name', 'blockish')}
										value={draft.title}
										onChange={(next) => setDraft((prev) => ({ ...prev, title: next }))}
									/>
									<BlockishCodeEditor
										label={__('Custom CSS', 'blockish')}
										help={__('Use {{SELECTOR}} to target this class selector.', 'blockish')}
										value={draft.customCss}
										onChange={updateCustomCss}
										settings={{ mode: 'css', lineWrapping: true }}
										rows={10}
										placeholder={'{{SELECTOR}} {\n\n}'}
									/>
									<TextareaControl
										className="blockish-class-manager-css-field"
										label={__('Attributes', 'blockish')}
										help={__('JSON attributes for this class. Editing here can override Custom CSS mapping.', 'blockish')}
										value={draft.attributes}
										onChange={updateAttributes}
										rows={8}
									/>
									<Text className="blockish-text-muted">
										{__('Warning: Edit Attributes carefully. Invalid JSON will block saving.', 'blockish')}
									</Text>
									<Flex className="blockish-class-manager-edit-actions" justify="flex-end">
										<Button
											className="blockish-class-manager-cancel-btn"
											variant="secondary"
											disabled={isSaving}
											onClick={cancelEdit}
										>
											{__('Cancel', 'blockish')}
										</Button>
										<Button
											className="blockish-class-manager-save-btn"
											variant="primary"
											icon="saved"
											disabled={isSaving}
											onClick={() => saveClass(item.id)}
										>
											{__('Save Class', 'blockish')}
										</Button>
									</Flex>
								</VStack>
							);
						}

						return (
							<Flex
								key={item.id}
								className="blockish-settings-row blockish-class-manager-row"
								justify="space-between"
								align="center"
							>
								<div className="blockish-settings-row-content">
									<Heading className="blockish-heading-tertiary blockish-settings-row-title" level={3}>
										{item.title || __('Untitled class', 'blockish')}
									</Heading>
								</div>
								<Flex className="blockish-class-manager-row-actions" justify="flex-end" align="center" expanded={false}>
									<Button
										className="blockish-class-manager-icon-btn"
										variant="secondary"
										icon="edit"
										label={__('Edit class', 'blockish')}
										disabled={isSaving}
										onClick={() => beginEdit(item)}
									/>
									<Button
										className="blockish-class-manager-icon-btn"
										variant="secondary"
										icon="trash"
										label={__('Delete class', 'blockish')}
										disabled={isSaving}
										onClick={() => deleteClass(item.id)}
									/>
								</Flex>
							</Flex>
						);
					})}

					{!isLoading && filtered.length === 0 && (
						<Text className="blockish-text-muted">{__('No classes found.', 'blockish')}</Text>
					)}
				</div>
			</VStack>
		</Modal>
	);
}
