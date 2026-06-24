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
	
	const typographyValue = value && typeof value === 'string' ? JSON.parse(value) : value;
	const handleChange = (key, newValue) => {
		const updatedValue = {
			...typographyValue,
			[key]: newValue,
		};
		onChange(JSON.stringify(updatedValue));
	};

	const previewStyle = {
		fontFamily: typographyValue?.fontFamily?.value,
		fontSize: typographyValue?.fontSize?.[device],
		lineHeight: typographyValue?.lineHeight?.[device],
		fontWeight: typographyValue?.fontWeight?.value,
		fontStyle: typographyValue?.fontStyle,
		textTransform: typographyValue?.textTransform,
		textDecoration: typographyValue?.textDecoration,
		letterSpacing: typographyValue?.letterSpacing?.[device],
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
										value={typographyValue?.fontFamily}
										onChange={(newValue) => handleChange('fontFamily', newValue)}
									/>
								</div>
							)}
							{!excludeControlsSet.has('fontWeight') && (
								<div className="blockish__typography-font-weight">
									{typographyValue?.fontFamily?.variants && typographyValue?.fontFamily?.variants?.length > 0 ? (
										<BlockishSelect
											label={__('Font Weight', 'blockish')}
											value={typographyValue?.fontFamily?.variants.find(
												(item) => item.value === value?.fontWeight
											)}
											onChange={(newValue) => handleChange('fontWeight', newValue?.value)}
											options={typographyValue?.fontFamily.variants}
											isClearable={false}
										/>
									) : (
										<BlockishSelect
											label={__('Font Weight', 'blockish')}
											value={fontWeights?.find((item) => item.value === typographyValue?.fontWeight)}
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
								<BlockishResponsive left='60px'>
									<BlockishRangeUnit
										label={__('Font Size', 'blockish')}
										value={typographyValue?.fontSize?.[device]}
										onChange={(value) => handleChange('fontSize', {
											...typographyValue?.fontSize,
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
									<BlockishResponsive left='70px'>
										<LineHeightControl
											
											__unstableInputWidth="100%"
											value={typographyValue?.lineHeight?.[device]}
											onChange={(value) => handleChange('lineHeight', {
												...typographyValue?.lineHeight,
												[device]: value
											})}
											units={units?.lineHeight}
										/>
									</BlockishResponsive>
								</div>
							)}

							{!excludeControlsSet.has('letterSpacing') && (
								<div className="blockish-typography-letter-spacing">
									<BlockishResponsive left='95px'>
										<UnitControl
											label={__('Letter Spacing', 'blockish')}
											value={typographyValue?.letterSpacing?.[device]}
											onChange={(value) => handleChange('letterSpacing', {
												...typographyValue?.letterSpacing,
												[device]: value
											})}
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
											__next40pxDefaultSize
										/>
									</BlockishResponsive>	
								</div>
							)}
						</HStack>

						{!excludeControlsSet.has('textTransform') && (
							<div className="blockish-typography-text-transform">
								<BlockishToggleGroup
									label={__('Transform', 'blockish')}
									value={typographyValue?.textTransform}
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
										value={typographyValue?.fontStyle}
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
										value={typographyValue?.textDecoration}
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

export default memo(BlockishTypography);
