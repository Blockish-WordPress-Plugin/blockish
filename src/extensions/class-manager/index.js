import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import {
	PanelBody,
	ComboboxControl,
	Button,
	TextareaControl,
	Notice,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import clsx from 'clsx';
import './editor-styles';
import './editor.scss';

const CLASS_POST_TYPE = 'blockish-class-manager';
const CREATE_PREFIX = '__create__:';

function isBlockishBlock(name) {
	return typeof name === 'string' && name.startsWith('blockish/');
}

function normalizeClassSlug(value = '') {
	return String(value)
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9_-]/g, '');
}

function isValidCssClass(className = '') {
	return /^[a-z_-][a-z0-9_-]*$/.test(className);
}

function getRecordTitle(record = {}) {
	if (typeof record?.title?.raw === 'string') {
		return record.title.raw;
	}
	if (typeof record?.title?.rendered === 'string') {
		return record.title.rendered;
	}
	return '';
}

function getRecordContent(record = {}) {
	if (typeof record?.content?.raw === 'string') {
		return record.content.raw;
	}
	if (typeof record?.content?.rendered === 'string') {
		return record.content.rendered;
	}
	return '';
}

const withWrapperClassManager = (wrapperProps, attributes) => {
	const selected = Array.isArray(attributes?.classManager) ? attributes.classManager : [];
	if (selected.length === 0) {
		return wrapperProps;
	}

	return {
		...wrapperProps,
		className: clsx(wrapperProps?.className, ...selected),
	};
};

const ClassManagerControls = createHigherOrderComponent(
	(BlockEdit) => {
		return (props) => {
			if (!isBlockishBlock(props?.name)) {
				return <BlockEdit {...props} />;
			}

			const selectedSlugs = Array.isArray(props?.attributes?.classManager)
				? props.attributes.classManager
				: [];
			const [filterInput, setFilterInput] = useState('');
			const [activeSlug, setActiveSlug] = useState(selectedSlugs[0] || '');
			const [saveState, setSaveState] = useState(null);

			const records = useSelect((select) => {
				const { getEntityRecords } = select('core');
				return (
					getEntityRecords('postType', CLASS_POST_TYPE, {
						per_page: -1,
						orderby: 'title',
						order: 'asc',
					}) || []
				);
			}, []);

			const { saveEntityRecord, editEntityRecord, saveEditedEntityRecord } = useDispatch('core');

			const normalizedFilter = normalizeClassSlug(filterInput);
			const selectedRecords = useMemo(() => {
				const map = new Map();
				records.forEach((record) => {
					const title = normalizeClassSlug(getRecordTitle(record));
					if (title) {
						map.set(title, record);
					}
				});

				return selectedSlugs
					.map((slug) => ({ slug, record: map.get(normalizeClassSlug(slug)) }))
					.filter((item) => item.record);
			}, [records, selectedSlugs]);

			const options = useMemo(() => {
				const list = records
					.map((record) => normalizeClassSlug(getRecordTitle(record)))
					.filter(Boolean)
					.filter((slug) => slug.includes(normalizedFilter))
					.map((slug) => ({
						label: slug,
						value: slug,
					}));

				if (
					normalizedFilter &&
					isValidCssClass(normalizedFilter) &&
					!list.some((item) => item.value === normalizedFilter)
				) {
					list.unshift({
						label: sprintf(__('Create class: %s', 'blockish'), normalizedFilter),
						value: `${CREATE_PREFIX}${normalizedFilter}`,
					});
				}

				return list;
			}, [records, normalizedFilter]);

			const activeRecord = useMemo(() => {
				const slug = normalizeClassSlug(activeSlug);
				return records.find((record) => normalizeClassSlug(getRecordTitle(record)) === slug);
			}, [records, activeSlug]);

			const setSelected = (next) => {
				props.setAttributes({ classManager: next });
				if (next.length > 0 && !next.includes(activeSlug)) {
					setActiveSlug(next[0]);
				}
				if (next.length === 0) {
					setActiveSlug('');
				}
			};

			const addClassToSelection = (slug) => {
				if (!slug || selectedSlugs.includes(slug)) {
					return;
				}
				setSelected([...selectedSlugs, slug]);
				setActiveSlug(slug);
			};

			const removeClassFromSelection = (slug) => {
				setSelected(selectedSlugs.filter((item) => item !== slug));
			};

			const onSelectClass = async (value) => {
				if (!value) {
					return;
				}

				if (value.startsWith(CREATE_PREFIX)) {
					const slug = value.replace(CREATE_PREFIX, '');
					try {
						await saveEntityRecord('postType', CLASS_POST_TYPE, {
							title: slug,
							status: 'publish',
							content: '',
						});
						addClassToSelection(slug);
						setSaveState({ type: 'success', message: __('Class created.', 'blockish') });
					} catch (error) {
						setSaveState({ type: 'error', message: __('Failed to create class.', 'blockish') });
					}
					return;
				}

				addClassToSelection(value);
			};

			const saveActiveClassStyles = async () => {
				if (!activeRecord) {
					return;
				}
				try {
					await saveEditedEntityRecord('postType', CLASS_POST_TYPE, activeRecord.id);
					setSaveState({ type: 'success', message: __('Class styles saved.', 'blockish') });
				} catch (error) {
					setSaveState({ type: 'error', message: __('Failed to save class styles.', 'blockish') });
				}
			};

			return (
				<>
					<BlockEdit {...props} />
					<InspectorControls>
						<PanelBody title={__('CSS Class Manager', 'blockish')} initialOpen={false}>
							<ComboboxControl
								label={__('Search or create class', 'blockish')}
								value=""
								onChange={onSelectClass}
								onFilterValueChange={setFilterInput}
								options={options}
								help={__('Select an existing class or type to create a new one.', 'blockish')}
							/>

							{selectedRecords.length > 0 && (
								<div className="blockish-class-manager-selected-list">
									{selectedRecords.map((item) => (
										<Button
											key={item.slug}
											variant={item.slug === activeSlug ? 'primary' : 'secondary'}
											onClick={() => setActiveSlug(item.slug)}
										>
											{item.slug}
										</Button>
									))}
								</div>
							)}

							{selectedRecords.length > 0 && (
								<div className="blockish-class-manager-selected-list blockish-class-manager-remove-list">
									{selectedRecords.map((item) => (
										<Button
											key={`${item.slug}-remove`}
											variant="tertiary"
											onClick={() => removeClassFromSelection(item.slug)}
										>
											{sprintf(__('Remove %s', 'blockish'), item.slug)}
										</Button>
									))}
								</div>
							)}

							{activeRecord && (
								<>
									<Text className="blockish-class-manager-style-title">
										{sprintf(__('Styles for .%s', 'blockish'), activeSlug)}
									</Text>
									<TextareaControl
										value={getRecordContent(activeRecord)}
										onChange={(next) => {
											editEntityRecord('postType', CLASS_POST_TYPE, activeRecord.id, {
												content: next,
											});
										}}
										help={__('Write CSS declarations only. Example: color: #222; font-size: 18px;', 'blockish')}
										rows={6}
									/>
									<Button variant="primary" onClick={saveActiveClassStyles}>
										{__('Save Class Styles', 'blockish')}
									</Button>
								</>
							)}

							{saveState && (
								<Notice status={saveState.type} isDismissible={false}>
									{saveState.message}
								</Notice>
							)}
						</PanelBody>
					</InspectorControls>
				</>
			);
		};
	},
	'ClassManagerControls'
);

addFilter('editor.BlockEdit', 'blockish/class-manager/controls', ClassManagerControls);
addFilter('blockish.blockWrapper.attributes', 'blockish/class-manager/wrapper', withWrapperClassManager);
