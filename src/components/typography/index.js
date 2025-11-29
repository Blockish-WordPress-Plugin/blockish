/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { memo, useMemo } from '@wordpress/element';
import { Button, BaseControl, __experimentalVStack as VStack } from '@wordpress/components';

/**
 * Internal dependencies
 */
import fontWeights from './font-weights';
import textTransforms from './text-transforms';
import textDecorations from './text-decorations';

const UNITS = {
	fontSize: {
		px: { min: 0, max: 200, step: 1 },
		em: { min: 0, max: 10, step: 0.1 },
		rem: { min: 0, max: 10, step: 0.1 }
	},
	lineHeight: {
		px: { min: 0, max: 200, step: 1 },
		em: { min: 0, max: 10, step: 0.1 },
		rem: { min: 0, max: 10, step: 0.1 }
	},
	letterSpacing: {
		px: { min: -10, max: 10, step: 0.1 },
		em: { min: -1, max: 1, step: 0.01 }
	}
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
		BlockishDropdown
	} = window.blockish.components;

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
		fontFamily: value?.fontFamily,
		fontSize: value?.fontSize,
		lineHeight: value?.lineHeight,
		fontWeight: value?.fontWeight,
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
										{__('Typography Preview', 'blockish')}
									</div>
								</Button>
							</BaseControl>
						</div>
					)
				}}
			>
				<div className="blockish-typography-popover-content">
					<VStack spacing={3}>
						{!excludeControlsSet.has('fontFamily') && (
							<div className="blockish-typography-font-family">
								<BlockishFontFamily
									label={__('Font Family', 'blockish')}
									value={value?.fontFamily}
									onChange={(newValue) => handleChange('fontFamily', newValue)}
								/>
							</div>
						)}

						{!excludeControlsSet.has('fontSize') && (
							<div className="blockish-typography-font-size">
								<BlockishRangeUnit
									label={__('Font Size', 'blockish')}
									value={value?.fontSize}
									onChange={(newValue) => handleChange('fontSize', newValue)}
									units={units?.fontSize}
								/>
							</div>
						)}

						{!excludeControlsSet.has('fontWeight') && (
							<div className="blockish-typography-font-weight">
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

						{!excludeControlsSet.has('lineHeight') && (
							<div className="blockish-typography-line-height">
								<BlockishRangeUnit
									label={__('Line Height', 'blockish')}
									value={value?.lineHeight}
									onChange={(newValue) => handleChange('lineHeight', newValue)}
									units={units?.lineHeight}
								/>
							</div>
						)}

						{!excludeControlsSet.has('letterSpacing') && (
							<div className="blockish-typography-letter-spacing">
								<BlockishRangeUnit
									label={__('Letter Spacing', 'blockish')}
									value={value?.letterSpacing}
									onChange={(newValue) => handleChange('letterSpacing', newValue)}
									units={units?.letterSpacing}
								/>
							</div>
						)}

						{!excludeControlsSet.has('textTransform') && (
							<div className="blockish-typography-text-transform">
								<BlockishSelect
									label={__('Text Transform', 'blockish')}
									value={textTransforms?.find((item) => item.value === value?.textTransform)}
									onChange={(newValue) => handleChange('textTransform', newValue?.value)}
									options={textTransforms}
									isClearable={false}
								/>
							</div>
						)}

						{!excludeControlsSet.has('textDecoration') && (
							<div className="blockish-typography-text-decoration">
								<BlockishSelect
									label={__('Text Decoration', 'blockish')}
									value={textDecorations?.find((item) => item.value === value?.textDecoration)}
									onChange={(newValue) => handleChange('textDecoration', newValue?.value)}
									options={textDecorations}
									isClearable={false}
								/>
							</div>
						)}
					</VStack>
				</div>
			</BlockishDropdown>
		</div>
	);
};

export default memo(BlockishTypography);
