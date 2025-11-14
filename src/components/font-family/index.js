import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { safeDecodeURI } from '@wordpress/url';
import { useMemo, memo } from '@wordpress/element';
import fontWeights from './default-font-weights';
import defaultFonts from './fonts/default-fonts.json';

const BlockishFontFamily = (props) => {
    const { BlockishSelect } = window.blockish.components;
	const use_only_global_styles_fonts = true;

	const { fontFamilies: { theme = [], custom = [] }, isBlockBasedTheme } = useSelect((select) => {
		const { getSettings } = select('core/block-editor');
		const { __experimentalFeatures: { typography }, __unstableIsBlockBasedTheme } = getSettings();

		return {
			fontFamilies: typography?.fontFamilies || {},
			isBlockBasedTheme: __unstableIsBlockBasedTheme || false
		};
	});

	const shouldUseGlobalStyles = use_only_global_styles_fonts && isBlockBasedTheme;

	let globalFonts = useMemo(() => {
		return [...theme, ...custom];
	}, [theme, custom, props?.value?.value]);

	const invalidVariants = ['italic', 'oblique', 'initial', 'inherit', 'unset', 'normal', 'regular'];

	// ✅ Ensure currently selected font family is always available
	if (props?.value?.value) {
		const filterableList = shouldUseGlobalStyles ? globalFonts : defaultFonts;
		const isAlreadeyExist = filterableList.find((item) => {
			const value = item?.name || item?.label;
			return props?.value?.value?.toLowerCase().includes(value?.toLowerCase());
		});

		const usableVariants = props?.value?.variants?.filter((item) => !invalidVariants.includes(item?.value));
		const usableExistingFamily = {
			value: props?.value?.value,
			label: props?.value?.label,
			variants: usableVariants
		};

		if (!isAlreadeyExist) {
			shouldUseGlobalStyles ? globalFonts.push(usableExistingFamily) : defaultFonts.push(usableExistingFamily);
		} else {
			if (shouldUseGlobalStyles) {
				globalFonts[
					globalFonts.findIndex((item) =>
						item.name?.toLowerCase()?.includes(usableExistingFamily?.label?.toLowerCase())
					)
				] = usableExistingFamily;
			} else {
				defaultFonts[
					defaultFonts.findIndex((item) =>
						item?.label?.toLowerCase()?.includes(usableExistingFamily?.label?.toLowerCase())
					)
				] = usableExistingFamily;
			}
		}
	}

	const API_KEY = 'AIzaSyAdhJh9b4BpR0cQqIt1uBBeaq2f58Ztd7E';
	const API_URL = safeDecodeURI(`https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`);

	// ✅ Helper to transform fonts
	const loadFonts = async (fontsCollection = [], familyLabelKey = 'name', familyValueKey = 'family') => {
		return new Promise((resolve) => {
			setTimeout(() => {
				const fonts =
					fontsCollection &&
					fontsCollection.map((item) => {
						let variants = new Set();

						if (item?.fontFace) {
							for (const key of item?.fontFace) {
								let split = key?.fontWeight.split(' ');
								if (split.length) {
									split.forEach((weight) => variants.add(weight));
								}
							}
						}

						if (item?.variants) {
							item?.variants.forEach((variant) => {
								if (typeof variant === 'string' && invalidVariants.includes(variant)) {
									variants.add('400');
									return;
								}
								if (typeof variant === 'object' && invalidVariants.includes(variant?.value)) {
									variants.add('400');
									return;
								}
								variants.add(typeof variant === 'string' ? variant : variant?.value);
							});
						}

						const finalVariants = Array.from(variants).map((v) => ({ label: v, value: v })) || fontWeights;

						return {
							label: item[familyLabelKey] || item['label'],
							value: item[familyValueKey] || item['value'],
							variants: [
								{ label: __('Default', 'gutenkit-blocks-addon'), value: 'normal' },
								...finalVariants,
								{ label: __('Initial', 'gutenkit-blocks-addon'), value: 'initial' },
								{ label: __('Inherit', 'gutenkit-blocks-addon'), value: 'inherit' },
							],
						};
					});
				resolve(fonts || []);
			}, 1000);
		});
	};

	// ✅ Async loader for react-select
	const loadOptions = async (inputValue) => {
		if (shouldUseGlobalStyles) {
			try {
				const filtered = inputValue
					? globalFonts.filter((item) =>
							item.value.toLowerCase().includes(inputValue.toLowerCase())
					  )
					: globalFonts;
				return await loadFonts(filtered, 'name', 'fontFamily');
			} catch (error) {
				return [];
			}
		} else {
			try {
				if (inputValue) {
					const response = await fetch(API_URL);
					const data = await response.json();
					const googleFonts = data?.items?.filter((item) =>
						item?.family.toLowerCase().includes(inputValue.toLowerCase())
					);
					return await loadFonts(googleFonts, 'family', 'family');
				}
				return await loadFonts(defaultFonts, 'label', 'value');
			} catch (error) {
				return [];
			}
		}
	};

	return (
		<div className="blockish-font-family">
			<BlockishSelect.Async
				label={props.label || __('Font Family', 'blockish')}
				value={props.value}
				onChange={props.onChange}
				loadOptions={loadOptions}
				cacheOptions
				defaultOptions
				isClearable
				isSearchable
			/>
		</div>
	);
};

export default memo(BlockishFontFamily);
