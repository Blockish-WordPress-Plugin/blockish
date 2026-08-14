import { registerPlugin } from '@wordpress/plugins';
import { useSelect, useDispatch, select } from '@wordpress/data';
import { useEffect, useRef, useMemo, useState } from '@wordpress/element';
import generateClassManagerStyles from './style';
import { getEntityTitle } from './utils';
import { CLASS_CSS_REGEN_EVENT } from './wrap-ai-preview';

const POST_TYPE = 'blockish-classes';
const META_KEY = 'blockishClassManagerStyles';
const STYLE_TYPE = 'blockish-classes-styles';

const getStyleValue = (content) => {
	if (!content) {
		return null;
	}
	if (typeof content === 'string') {
		return content;
	}
	if (typeof content === 'object') {
		if (typeof content.raw === 'string') {
			try {
				return JSON.parse(content.raw);
			} catch (error) {
				return content.raw;
			}
		}
		return content;
	}
	return null;
};

const RenderClassManagerStyles = () => {
	const { updateEditorSettings } = useDispatch('core/editor');
	const { editEntityRecord, saveEntityRecord } = useDispatch('core');
	const { useDeviceList } = window.blockish.helpers;
	const breakpoints = useDeviceList();

	const editorSettings = useSelect((select) => {
		const { getEditorSettings } = select('core/editor');
		return getEditorSettings();
	}, []);

	const classStylesCacheRef = useRef({ key: '[]', value: [] });
	const classStyles = useSelect((select) => {
		const { getEntityRecords, getEditedEntityRecord } = select('core');
		const classes = getEntityRecords('postType', POST_TYPE, { per_page: -1 }) || [];
		let nextValue = [];

		if (classes.length > 0) {
			const editedClasses = classes.map((item) =>
				getEditedEntityRecord('postType', POST_TYPE, item?.id)
			);
			nextValue = editedClasses
				.map((item) => {
					const parent = getEditedEntityRecord('postType', POST_TYPE, item?.parent);
					return {
						id: item?.id,
						title: getEntityTitle(item?.title),
						style: getStyleValue(item?.content),
						parent: getEntityTitle(parent?.title),
						metaCss: item?.meta?.[META_KEY] || '',
					};
				})
				.filter((item) => item?.id);
		}

		const nextKey = JSON.stringify(nextValue);
		if (classStylesCacheRef.current.key === nextKey) {
			return classStylesCacheRef.current.value;
		}

		classStylesCacheRef.current = {
			key: nextKey,
			value: nextValue,
		};
		return nextValue;
	}, []);

	const editedClassIds = useSelect(
		(select) => {
			const { hasEditsForEntityRecord } = select('core');
			return classStyles
				.map((item) => item?.id)
				.filter((id) => id && hasEditsForEntityRecord('postType', POST_TYPE, id));
		},
		[classStyles]
	);

	const cssByClassId = useMemo(() => {
		const byId = {};
		classStyles.forEach((item) => {
			let css = '';

			breakpoints.forEach((device) => {
				const value = device?.value;
				const slug = device?.slug || 'Desktop';
				const deviceCss = generateClassManagerStyles([item], slug)?.[slug] || '';
				if (!deviceCss) return;

				if (value === 'base') {
					css += deviceCss;
				} else {
					css += `@media (max-width: ${value}) { ${deviceCss} }`;
				}
			});

			// Freshly imported classes may already have compiled meta CSS before
			// the content→CSS path has a chance to re-run.
			byId[item.id] = css || item.metaCss || '';
		});

		return byId;
	}, [breakpoints, classStyles]);

	const generateStyles = useMemo(() => {
		let styles = '';
		Object.values(cssByClassId).forEach((css) => {
			styles += css || '';
		});

		return styles;
	}, [cssByClassId]);

	const persistMetaCss = async (nextCssByClassId, idsToUpdate = [], { quiet = false } = {}) => {
		const idsSet = new Set(idsToUpdate);
		for (const item of classStyles) {
			if (!item?.id || !idsSet.has(item.id)) continue;
			const css = nextCssByClassId?.[item.id] || '';
			const existing = select('core').getEditedEntityRecord('postType', POST_TYPE, item.id);
			const payload = {
				meta: {
					...(existing?.meta || {}),
					[META_KEY]: css,
				},
			};

			if (quiet) {
				await saveEntityRecord('postType', POST_TYPE, {
					id: item.id,
					...payload,
				});
			} else {
				await editEntityRecord('postType', POST_TYPE, item.id, payload);
			}
		}
	};

	const idsWhereGeneratedDiffersFromMeta = (idsToCheck = null) => {
		const limit = idsToCheck instanceof Set && idsToCheck.size > 0 ? idsToCheck : null;
		return classStyles
			.filter((item) => {
				if (limit && !limit.has(item.id)) return false;
				const newCss = cssByClassId[item.id] || '';
				return item.style && item.metaCss !== newCss;
			})
			.map((item) => item.id);
	};

	const classStylesRef = useRef({});
	const hasClassStylesInitialized = useRef(false);
	const lastRegenTickRef = useRef(0);
	const [regenRequest, setRegenRequest] = useState(null);
	const editorStyles = editorSettings?.styles;

	useEffect(() => {
		const onRegen = (event) => {
			const ids = event?.detail?.classIds;
			setRegenRequest({
				tick: Date.now(),
				classIds: Array.isArray(ids) ? ids : [],
				quiet: !!event?.detail?.quiet,
			});
		};
		window.addEventListener(CLASS_CSS_REGEN_EVENT, onRegen);
		return () => window.removeEventListener(CLASS_CSS_REGEN_EVENT, onRegen);
	}, []);

	useEffect(() => {
		if (!regenRequest || lastRegenTickRef.current === regenRequest.tick) {
			return;
		}
		lastRegenTickRef.current = regenRequest.tick;

		const limit = new Set(
			(regenRequest.classIds || [])
				.map((id) => parseInt(id, 10))
				.filter((id) => Number.isFinite(id) && id > 0)
		);
		const idsMissingCss = idsWhereGeneratedDiffersFromMeta(limit.size > 0 ? limit : null);
		if (idsMissingCss.length > 0) {
			persistMetaCss(cssByClassId, idsMissingCss, { quiet: regenRequest.quiet });
		}
		classStylesRef.current = cssByClassId;
	}, [regenRequest, classStyles, cssByClassId]);

	useEffect(() => {
		if (!editorStyles) return;

		const styleIndex = editorStyles.findIndex(
			(style) => style?.__unstableType === STYLE_TYPE
		);

		// The site editor and the global styles renderer rebuild settings.styles
		// from scratch, dropping this entry — so re-add it whenever it is missing
		// rather than trusting a one-time injection. Never flag it as
		// isGlobalStyles: both rebuilds strip those entries by design.
		if (styleIndex === -1) {
			updateEditorSettings({
				styles: [
					...editorStyles,
					{
						__unstableType: STYLE_TYPE,
						css: generateStyles,
					},
				],
			});
		} else if (editorStyles[styleIndex]?.css !== generateStyles) {
			updateEditorSettings({
				styles: editorStyles.map((style, index) =>
					index === styleIndex ? { ...style, css: generateStyles } : style
				),
			});
		}

		const nextMap = JSON.stringify(cssByClassId);
		const prevMap = JSON.stringify(classStylesRef.current);

		if (!hasClassStylesInitialized.current) {
			const idsMissingCss = idsWhereGeneratedDiffersFromMeta();

			if (idsMissingCss.length > 0) {
				persistMetaCss(cssByClassId, idsMissingCss, { quiet: true });
			}

			classStylesRef.current = cssByClassId;
			hasClassStylesInitialized.current = true;
			return;
		}

		if (nextMap !== prevMap && editedClassIds.length > 0) {
			persistMetaCss(cssByClassId, editedClassIds);
			classStylesRef.current = cssByClassId;
		}
	}, [generateStyles, cssByClassId, classStyles, editedClassIds, editorStyles]);

	return <></>;
};

registerPlugin('blockish-class-manager', {
	render: RenderClassManagerStyles,
});
