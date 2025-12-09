/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { memo, useMemo } from '@wordpress/element';
import { 
	Button, 
	BaseControl, 
	__experimentalHStack as HStack, 	
	__experimentalVStack as VStack
 } from '@wordpress/components';
import { 
	LineHeightControl,
	__experimentalUnitControl as UnitControl
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import fontWeights from './font-weights';

const UNITS = {
	fontSize: {
		px: { min: 0, max: 100, step: 1 },
		em: { min: 0, max: 10, step: 0.1 },
		rem: { min: 0, max: 10, step: 0.1 }
	},
}

const BlockishTypography = ({
	label = __('Typography', 'blockish'),
	value,
	onChange,
	excludeControls = [],
	units: userUnits,
}) => {
	const {
		BlockishFontFamily,
		BlockishRangeUnit,
		BlockishSelect,
		BlockishDropdown,
		BlockishToggleGroup,
		BlockishResponsive
	} = window.blockish.components;

	const { useDeviceType } = window.blockish.helpers;
	const device = useDeviceType();

	const excludeControlsSet = new Set(excludeControls);
	const units = useMemo(() => {
		let usableUnits = UNITS;

		if (userUnits) {
			usableUnits = {
				...UNITS,
				...userUnits
			}
		}

		return usableUnits;
	}, [userUnits]);

	// Update handler
	const handleChange = (key, newValue) => {
		const updatedValue = {
			...value,
			[key]: newValue,
		};
		onChange(updatedValue);
	};

	const previewStyle = {
		fontFamily: value?.fontFamily?.value,
		fontSize: value?.fontSize,
		lineHeight: value?.lineHeight,
		fontWeight: value?.fontWeight,
		fontStyle: value?.fontStyle,
		textTransform: value?.textTransform,
		textDecoration: value?.textDecoration,
		letterSpacing: value?.letterSpacing,
	};

	return (
		<div className="blockish-group-control blockish-control blockish-typography-control">
			<BlockishDropdown
				label={label}
				renderToggle={({ isOpen, onToggle }) => {
					return (
						<div className="blockish-typography-toggle" aria-expanded={isOpen} onClick={onToggle}>
							<BaseControl label={label}>
								<Button
									className="blockish-typography-toggle-button"
									variant="secondary"
									onClick={onToggle}
									aria-expanded={isOpen}
								>
									<div className="blockish-typography-preview" style={previewStyle}>
										{__('Aa', 'blockish')}
									</div>
								</Button>
							</BaseControl>
						</div>
					)
				}}
			>
				<div className="blockish-typography-popover-content">
					<VStack spacing={3}>
						<div className="blockish__font-family-and-weight">
							{!excludeControlsSet.has('fontFamily') && (
								<div className="blockish__typography-font-family">
									<BlockishFontFamily
										label={__('Font Family', 'blockish')}
										value={value?.fontFamily}
										onChange={(newValue) => handleChange('fontFamily', newValue)}
									/>
								</div>
							)}
							{!excludeControlsSet.has('fontWeight') && (
								<div className="blockish__typography-font-weight">
									{value?.fontFamily?.variants && value?.fontFamily?.variants?.length > 0 ? (
										<BlockishSelect
											label={__('Font Weight', 'blockish')}
											value={value?.fontFamily?.variants.find(
												(item) => item.value === value?.fontWeight
											)}
											onChange={(newValue) => handleChange('fontWeight', newValue?.value)}
											options={value.fontFamily.variants}
											isClearable={false}
										/>
									) : (
										<BlockishSelect
											label={__('Font Weight', 'blockish')}
											value={fontWeights?.find((item) => item.value === value?.fontWeight)}
											onChange={(newValue) => handleChange('fontWeight', newValue?.value)}
											options={fontWeights}
											isClearable={false}
										/>
									)}
								</div>
							)}
						</div>

						{!excludeControlsSet.has('fontSize') && (
							<div className="blockish-typography-font-size">
								<BlockishResponsive left='46px'>
									<BlockishRangeUnit
										label={__('Font Size', 'blockish')}
										value={value?.fontSize}
										onChange={(value) => handleChange('fontSize', {
											...value?.fontSize,
											[device]: value
										})}
										units={units?.fontSize}
									/>
								</BlockishResponsive>
							</div>
						)}

						<HStack>
							{!excludeControlsSet.has('lineHeight') && (
								<div className="blockish-typography-line-height">
									<BlockishResponsive left='46px'>
										<LineHeightControl
											__next40pxDefaultSize
											__unstableInputWidth="100%"
											value={value?.lineHeight}
											onChange={(value) => handleChange('lineHeight', value)}
											units={units?.lineHeight}
										/>
									</BlockishResponsive>
								</div>
							)}

							{!excludeControlsSet.has('letterSpacing') && (
								<div className="blockish-typography-letter-spacing">
									<BlockishResponsive left='46px'>
										<UnitControl
											label={__('Letter Spacing', 'blockish')}
											value={value?.letterSpacing}
											onChange={(value) => handleChange('letterSpacing', value)}
											units={[
												{
													value: 'px',
													label: 'px',
												},
												{
													value: 'em',
													label: 'em',
												},
												{
													value: 'rem',
													label: 'rem',
												}
											]}
										/>
									</BlockishResponsive>	
								</div>
							)}
						</HStack>

						{!excludeControlsSet.has('textTransform') && (
							<div className="blockish-typography-text-transform">
								<BlockishToggleGroup
									label={__('Transform', 'blockish')}
									value={value?.textTransform}
									onChange={(value) => handleChange('textTransform', value)}	
									options={[
										{
											label: '—',
											value: 'none'
										},
										{
											label: 'Ab',
											value: 'capitalize'
										},
										{
											label: 'AB',
											value: 'uppercase'
										},
										{
											label: 'ab',
											value: 'lowercase'
										},
									]}
								/>
							</div>
						)}

						<HStack>
							{!excludeControlsSet.has('fontStyle') && (
								<div className="blockish-typography-font-style">
									<BlockishToggleGroup
										label={__('Style', 'blockish')}
										value={value?.fontStyle}
										onChange={(value) => handleChange('fontStyle', value)}
										options={[
											{
												label: '—',
												value: 'normal'
											},
											{
												label: '/',
												value: 'italic'
											},
											{
												label: '< >',
												value: 'oblique'
											},
										]}
									/>
								</div>
							)}

							{!excludeControlsSet.has('textDecoration') && (
								<div className="blockish-typography-text-decoration">
									<BlockishToggleGroup
										label={__('Decoration', 'blockish')}
										value={value?.textDecoration}
										onChange={(value) => handleChange('textDecoration', value)}
										options={[
											{
												label: '—',
												value: 'none'
											},
											{
												label: 'U',
												value: 'underline'
											},
											{
												label: 'S',
												value: 'line-through'
											},
										]}
									/>
								</div>
							)}
						</HStack>
					</VStack>
				</div>
			</BlockishDropdown>
		</div>
	);
};

/**
 * Static method to generate CSS from typography values
 * Used by the style generation system for frontend rendering
 * @param {Object} typography - Typography object with properties
 * @param {string} selector - CSS selector (optional, defaults to empty for inline styles)
 * @returns {string} CSS string
 */
BlockishTypography.generateCSS = (typography, selector = '') => {
	if (!typography || typeof typography !== 'object') return '';

	const styles = [];

	// Font Family - handle both string and object formats
	if (typography.fontFamily) {
		if (typeof typography.fontFamily === 'object' && typography.fontFamily.value) {
			styles.push(`font-family: ${typography.fontFamily.value};`);
		} else if (typeof typography.fontFamily === 'string') {
			styles.push(`font-family: ${typography.fontFamily};`);
		}
	}

	// Font Size
	if (typography?.fontSize) {
		styles.push(`font-size: ${typography?.fontSize};`);
	}

	// Font Weight
	if (typography?.fontWeight && typography?.fontWeight !== 'normal') {
		styles.push(`font-weight: ${typography?.fontWeight};`);
	}

	// Font Style
	if (typography?.fontStyle && typography?.fontStyle !== 'normal') {
		styles.push(`font-style: ${typography?.fontStyle};`);
	}

	// Line Height
	if (typography?.lineHeight) {
		styles.push(`line-height: ${typography?.lineHeight};`);
	}

	// Letter Spacing
	if (typography?.letterSpacing) {
		styles.push(`letter-spacing: ${typography?.letterSpacing};`);
	}

	// Text Transform
	if (typography?.textTransform && typography?.textTransform !== 'none') {
		styles.push(`text-transform: ${typography
			?.textTransform};`);
	}

	// Text Decoration
	if (typography?.textDecoration && typography?.textDecoration !== 'none') {
		styles.push(`text-decoration: ${typography?.textDecoration};`);
	}

	if (styles.length === 0) return '';

	// If selector is provided, wrap in selector block
	if (selector) {
		return `${selector} { ${styles.join(' ')} }`;
	}

	// Otherwise return just the properties
	return styles.join(' ');
};

export default memo(BlockishTypography);
