import { __ } from '@wordpress/i18n';

const parseValue = (value) => {
	if (!value) {
		return {};
	}

	if (typeof value === 'object') {
		return value;
	}

	try {
		return JSON.parse(value) || {};
	} catch {
		return {};
	}
};

const createValue = (original, nextValue) => {
	return JSON.stringify({
		...parseValue(original),
		...nextValue,
	});
};

const BlockishBackgroundOverlay = ({
	value,
	onChange,
	label = __('Background Overlay', 'blockish'),
	noLabel = false,
	excludes = []
}) => {
	const { BlockishToggle, BlockishColor, BlockishRangeControl, BlockishToggleGroup, BlockishCSSFilters, BlockishSelect } = window.blockish.components;
	const overlay = {
		enabled: false,
		type: 'color',
		...parseValue(value)
	};
	const isEnabled = !!overlay?.enabled;
	const excludedOptions = new Set(excludes);

	return (
		<div className="blockish-control blockish-group-control blockish-background-overlay-control">
			<BlockishToggle
				label={label}
				value={isEnabled}
				onChange={(nextValue) => onChange(createValue(value, { enabled: nextValue }))}
			/>
			{isEnabled && (
				<>
					<BlockishToggleGroup
						label={!noLabel && label ? label : ''}
						value={overlay?.type}
						onChange={(nextValue) => onChange(createValue(value, { type: nextValue }))}
						options={[
							{ label: 'Color', value: 'color' },
							{ label: 'Gradient', value: 'gradient' }
						]}
					/>
					{
						overlay?.type === 'color' && (
							<BlockishColor
								label={__('Color', 'blockish')}
								value={overlay?.color}
								onChange={(nextValue) => onChange(createValue(value, { color: nextValue }))}
							/>
						)
					}
					{
						overlay?.type === 'gradient' && (
							<BlockishColor
								label={__('Gradient', 'blockish')}
								value={overlay?.gradient}
								onChange={(nextValue) => onChange(createValue(value, { gradient: nextValue }))}
								isGradient={true}
							/>
						)
					}
					{
						!excludedOptions.has('opacity') && (
							<BlockishRangeControl
								label={__('Opacity', 'blockish')}
								value={overlay?.opacity}
								onChange={(nextValue) => onChange(createValue(value, { opacity: nextValue }))}
								min={0}
								max={100}
								step={1}
							/>
						)
					}
					{
						!excludedOptions.has('filters') && (
							<BlockishCSSFilters
								value={overlay?.filters}
								onChange={(nextValue) => onChange(createValue(value, { filters: nextValue }))}
								excludes={['grayscale', 'invert', 'sepia']}
							/>
						)
					}
					{
						!excludedOptions.has('blendMode') && (
							<BlockishSelect
								label={__('Blend Mode', 'blockish')}
								value={overlay?.blendMode}
								onChange={(nextValue) => onChange(createValue(value, { blendMode: nextValue }))}
								options={[
									{ label: 'Normal', value: 'normal' },
									{ label: 'Multiply', value: 'multiply' },
									{ label: 'Screen', value: 'screen' },
									{ label: 'Overlay', value: 'overlay' },
									{ label: 'Darken', value: 'darken' },
									{ label: 'Lighten', value: 'lighten' },
									{ label: 'Color Dodge', value: 'color-dodge' },
									{ label: 'Color Burn', value: 'color-burn' },
									{ label: 'Hard Light', value: 'hard-light' },
									{ label: 'Soft Light', value: 'soft-light' },
									{ label: 'Difference', value: 'difference' },
									{ label: 'Exclusion', value: 'exclusion' },
									{ label: 'Hue', value: 'hue' },
									{ label: 'Saturation', value: 'saturation' },
									{ label: 'Color', value: 'color' },
									{ label: 'Luminosity', value: 'luminosity' }
								]}
							/>
						)
					}
							
				</>
			)}
		</div>
	);
};

export default BlockishBackgroundOverlay;
