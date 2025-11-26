/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { memo } from '@wordpress/element';
import { Button, ButtonGroup, __experimentalVStack as VStack } from '@wordpress/components';

/**
 * Internal dependencies
 */
import fontWeights from './font-weights';
import textTransforms from './text-transforms';
import textDecorations from './text-decorations';

const BlockishTypography = ({
	label = __('Typography', 'blockish'),
	value = {},
	onChange,
	showFontFamily = true,
	showFontSize = true,
	showFontWeight = true,
	showLineHeight = true,
	showLetterSpacing = true,
	showTextTransform = true,
	showTextDecoration = true,
	showTextAlign = true,
	fontSizeUnits = { px: { min: 0, max: 200, step: 1 }, em: { min: 0, max: 10, step: 0.1 }, rem: { min: 0, max: 10, step: 0.1 } },
	lineHeightUnits = { px: { min: 0, max: 200, step: 1 }, em: { min: 0, max: 10, step: 0.1 }, '': { min: 0, max: 10, step: 0.1 } },
	letterSpacingUnits = { px: { min: -10, max: 10, step: 0.1 }, em: { min: -1, max: 1, step: 0.01 } },
	...props
}) => {
	const {
		BlockishFontFamily,
		BlockishRangeUnit,
		BlockishSelect,
		BlockishDropdown
	} = window.blockish.components;

	// Default values
	const defaultValue = {
		fontFamily: value?.fontFamily || null,
		fontSize: value?.fontSize || '',
		fontWeight: value?.fontWeight || 'normal',
		lineHeight: value?.lineHeight || '',
		letterSpacing: value?.letterSpacing || '',
		textTransform: value?.textTransform || 'none',
		textDecoration: value?.textDecoration || 'none',
		textAlign: value?.textAlign || 'left',
	};

	// Update handler
	const handleChange = (key, newValue) => {
		const updatedValue = {
			...defaultValue,
			[key]: newValue,
		};
		onChange(updatedValue);
	};

	// Text alignment options
	const alignmentOptions = [
		{ icon: 'editor-alignleft', value: 'left', label: __('Align Left', 'blockish') },
		{ icon: 'editor-aligncenter', value: 'center', label: __('Align Center', 'blockish') },
		{ icon: 'editor-alignright', value: 'right', label: __('Align Right', 'blockish') },
		{ icon: 'editor-justify', value: 'justify', label: __('Justify', 'blockish') },
	];

	// Generate preview text for the button
	const getPreviewText = () => {
		const parts = [];
		
		if (defaultValue.fontFamily?.label) {
			parts.push(defaultValue.fontFamily.label);
		}
		
		if (defaultValue.fontSize) {
			parts.push(defaultValue.fontSize);
		}
		
		if (defaultValue.fontWeight && defaultValue.fontWeight !== 'normal') {
			const weightLabel = fontWeights.find(w => w.value === defaultValue.fontWeight)?.label || defaultValue.fontWeight;
			parts.push(weightLabel);
		}
		
		return parts.length > 0 ? parts.join(' / ') : __('Default', 'blockish');
	};

	return (
		<div className="blockish-typography-control blockish-control">
			<BlockishDropdown
				label={label}
				renderToggle={({ isOpen, onToggle }) => (
					<Button
						className="blockish-typography-toggle"
						onClick={onToggle}
						aria-expanded={isOpen}
					>
						<span className="blockish-typography-label">{label}</span>
						<span className="blockish-typography-preview">{getPreviewText()}</span>
					</Button>
				)}
				renderContent={() => (
					<div className="blockish-typography-popover-content">
						<VStack spacing={3}>
							{/* Font Family */}
							{showFontFamily && (
								<div className="blockish-typography-font-family">
									<BlockishFontFamily
										label={__('Font Family', 'blockish')}
										value={defaultValue.fontFamily}
										onChange={(newValue) => handleChange('fontFamily', newValue)}
									/>
								</div>
							)}

							{/* Font Size */}
							{showFontSize && (
								<div className="blockish-typography-font-size">
									<BlockishRangeUnit
										label={__('Font Size', 'blockish')}
										value={defaultValue.fontSize}
										onChange={(newValue) => handleChange('fontSize', newValue)}
										units={fontSizeUnits}
									/>
								</div>
							)}

							{/* Font Weight */}
							{showFontWeight && (
								<div className="blockish-typography-font-weight">
									{defaultValue.fontFamily?.variants && defaultValue.fontFamily.variants.length > 0 ? (
										<BlockishSelect
											label={__('Font Weight', 'blockish')}
											value={defaultValue.fontFamily.variants.find(
												(item) => item.value === defaultValue.fontWeight
											)}
											onChange={(newValue) => handleChange('fontWeight', newValue?.value)}
											options={defaultValue.fontFamily.variants}
											isClearable={false}
										/>
									) : (
										<BlockishSelect
											label={__('Font Weight', 'blockish')}
											value={fontWeights.find((item) => item.value === defaultValue.fontWeight)}
											onChange={(newValue) => handleChange('fontWeight', newValue?.value)}
											options={fontWeights}
											isClearable={false}
										/>
									)}
								</div>
							)}

							{/* Line Height */}
							{showLineHeight && (
								<div className="blockish-typography-line-height">
									<BlockishRangeUnit
										label={__('Line Height', 'blockish')}
										value={defaultValue.lineHeight}
										onChange={(newValue) => handleChange('lineHeight', newValue)}
										units={lineHeightUnits}
									/>
								</div>
							)}

							{/* Letter Spacing */}
							{showLetterSpacing && (
								<div className="blockish-typography-letter-spacing">
									<BlockishRangeUnit
										label={__('Letter Spacing', 'blockish')}
										value={defaultValue.letterSpacing}
										onChange={(newValue) => handleChange('letterSpacing', newValue)}
										units={letterSpacingUnits}
									/>
								</div>
							)}

							{/* Text Transform */}
							{showTextTransform && (
								<div className="blockish-typography-text-transform">
									<BlockishSelect
										label={__('Text Transform', 'blockish')}
										value={textTransforms.find((item) => item.value === defaultValue.textTransform)}
										onChange={(newValue) => handleChange('textTransform', newValue?.value)}
										options={textTransforms}
										isClearable={false}
									/>
								</div>
							)}

							{/* Text Decoration */}
							{showTextDecoration && (
								<div className="blockish-typography-text-decoration">
									<BlockishSelect
										label={__('Text Decoration', 'blockish')}
										value={textDecorations.find((item) => item.value === defaultValue.textDecoration)}
										onChange={(newValue) => handleChange('textDecoration', newValue?.value)}
										options={textDecorations}
										isClearable={false}
									/>
								</div>
							)}

							{/* Text Alignment */}
							{showTextAlign && (
								<div className="blockish-typography-text-align">
									<label className="components-base-control__label">
										{__('Text Alignment', 'blockish')}
									</label>
									<ButtonGroup className="blockish-button-group">
										{alignmentOptions.map((option) => (
											<Button
												key={option.value}
												icon={option.icon}
												label={option.label}
												isPressed={defaultValue.textAlign === option.value}
												onClick={() => handleChange('textAlign', option.value)}
											/>
										))}
									</ButtonGroup>
								</div>
							)}
						</VStack>
					</div>
				)}
			/>
		</div>
	);
};

export default memo(BlockishTypography);
