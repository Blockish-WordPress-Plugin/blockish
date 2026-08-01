import { registerPlugin } from '@wordpress/plugins';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef, useMemo } from '@wordpress/element';
import generateClassManagerStyles from './style';
import { getEntityTitle } from './utils';

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

			byId[item.id] = css;
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
			const payload = {
				meta: {
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

	const classStylesRef = useRef({});
	const hasClassStylesInitialized = useRef(false);
	const editorStyles = editorSettings?.styles;

	useEffect(() => {
		if (!editorStyles) return;
		if (!generateStyles) return;

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
			const idsMissingCss = classStyles
				.filter((item) => {
					const newCss = cssByClassId[item.id] || '';
					return item.style && item.metaCss !== newCss;
				})
				.map((item) => item.id);

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
