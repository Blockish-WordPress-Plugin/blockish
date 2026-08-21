import { registerPlugin } from '@wordpress/plugins';
import { useSelect, useDispatch, select } from '@wordpress/data';
import { useEffect, useRef, useMemo, useState } from '@wordpress/element';
import generateClassManagerStyles from './style';
import { getEntityTitle } from './utils';
import {
	CLASS_CSS_REGEN_EVENT,
	applyClassCssToEditor,
	fetchClassManagerCssBundle,
} from './wrap-ai-preview';

const POST_TYPE = 'blockish-classes';
const META_KEY = 'blockishClassManagerStyles';

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

const getDirtyClassIds = (selectStore) => {
	const core = selectStore('core');
	if (!core || typeof core.__experimentalGetDirtyEntityRecords !== 'function') {
		return [];
	}
	const dirty = core.__experimentalGetDirtyEntityRecords();
	if (!Array.isArray(dirty)) {
		return [];
	}
	return dirty
		.filter((record) => record?.kind === 'postType' && record?.name === POST_TYPE)
		.map((record) => record?.key)
		.filter((id) => id);
};

const buildDeviceCss = (item, breakpoints) => {
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
	return css;
};

const RenderClassManagerStyles = () => {
	const { editEntityRecord } = useDispatch('core');
	const { useDeviceList } = window.blockish.helpers;
	const breakpoints = useDeviceList();

	const lastChangedRef = useRef(0);
	const baseCssRef = useRef('');
	const prevDirtyCountRef = useRef(0);
	const [regenTick, setRegenTick] = useState(0);
	const [bundleTick, setBundleTick] = useState(0);

	const styleEntryMissing = useSelect((selectStore) => {
		const styles = selectStore('core/editor').getEditorSettings()?.styles;
		if (!Array.isArray(styles)) {
			return true;
		}
		return !styles.some((style) => style?.__unstableType === 'blockish-classes-styles');
	}, []);

	const dirtyClasses = useSelect((selectStore) => {
		const { getEditedEntityRecord } = selectStore('core');
		const ids = getDirtyClassIds(selectStore);

		return ids
			.map((id) => {
				const item = getEditedEntityRecord('postType', POST_TYPE, id);
				if (!item?.id) {
					return null;
				}
				const parent = item?.parent
					? getEditedEntityRecord('postType', POST_TYPE, item.parent)
					: null;
				return {
					id: item.id,
					title: getEntityTitle(item?.title),
					style: getStyleValue(item?.content),
					parent: getEntityTitle(parent?.title),
					metaCss: item?.meta?.[META_KEY] || '',
				};
			})
			.filter(Boolean);
	}, []);

	const overlayCss = useMemo(() => {
		let css = '';
		dirtyClasses.forEach((item) => {
			css += buildDeviceCss(item, breakpoints) || item.metaCss || '';
		});
		return css;
	}, [breakpoints, dirtyClasses]);

	const loadBundle = async (since = 0, { force = false } = {}) => {
		try {
			const bundle = await fetchClassManagerCssBundle(force ? 0 : since);
			const nextStamp = parseInt(bundle?.last_changed, 10) || 0;

			if (bundle?.unchanged) {
				lastChangedRef.current = nextStamp || lastChangedRef.current;
				return;
			}

			baseCssRef.current = bundle?.css || '';
			lastChangedRef.current = nextStamp;
			setBundleTick((tick) => tick + 1);
		} catch (e) {
			console.error('Blockish Class Manager: failed to load class CSS', e);
		}
	};

	useEffect(() => {
		loadBundle(0);
	}, []);

	useEffect(() => {
		const onRegen = () => {
			setRegenTick((tick) => tick + 1);
			loadBundle(0, { force: true });
		};
		window.addEventListener(CLASS_CSS_REGEN_EVENT, onRegen);
		return () => window.removeEventListener(CLASS_CSS_REGEN_EVENT, onRegen);
	}, []);

	useEffect(() => {
		const dirtyCount = dirtyClasses.length;
		if (prevDirtyCountRef.current > 0 && dirtyCount === 0) {
			loadBundle(lastChangedRef.current);
		}
		prevDirtyCountRef.current = dirtyCount;
	}, [dirtyClasses.length]);

	useEffect(() => {
		applyClassCssToEditor(`${baseCssRef.current}${overlayCss}`);
	}, [overlayCss, bundleTick, regenTick, styleEntryMissing]);

	useEffect(() => {
		if (!dirtyClasses.length) {
			return;
		}

		dirtyClasses.forEach((item) => {
			const css = buildDeviceCss(item, breakpoints) || '';
			if (!item.style || item.metaCss === css) {
				return;
			}

			const existing = select('core').getEditedEntityRecord('postType', POST_TYPE, item.id);
			editEntityRecord('postType', POST_TYPE, item.id, {
				meta: {
					...(existing?.meta || {}),
					[META_KEY]: css,
				},
			});
		});
	}, [dirtyClasses, breakpoints, editEntityRecord]);

	return <></>;
};

registerPlugin('blockish-class-manager', {
	render: RenderClassManagerStyles,
});
