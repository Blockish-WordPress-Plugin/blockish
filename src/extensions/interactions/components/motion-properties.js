import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

export const MOTION_PROPS = [
	{
		id: 'x',
		fromKey: 'fromX',
		toKey: 'toX',
		label: __('X', 'blockish'),
		unit: 'px',
		min: -400,
		max: 400,
		seedFrom: 0,
		seedTo: 40,
	},
	{
		id: 'y',
		fromKey: 'fromY',
		toKey: 'toY',
		label: __('Y', 'blockish'),
		unit: 'px',
		min: -400,
		max: 400,
		seedFrom: 40,
		seedTo: 0,
	},
	{
		id: 'scale',
		fromKey: 'fromScale',
		toKey: 'toScale',
		label: __('Scale', 'blockish'),
		unit: '%',
		min: 0,
		max: 200,
		seedFrom: 85,
		seedTo: 100,
	},
	{
		id: 'rotate',
		fromKey: 'fromRotate',
		toKey: 'toRotate',
		label: __('Rotate', 'blockish'),
		unit: '°',
		min: -180,
		max: 180,
		seedFrom: -15,
		seedTo: 0,
	},
	{
		id: 'opacity',
		fromKey: 'fromOpacity',
		toKey: 'toOpacity',
		label: __('Opacity', 'blockish'),
		unit: '%',
		min: 0,
		max: 100,
		seedFrom: 0,
		seedTo: 100,
	},
];

export const isPropActive = (options, prop) => {
	const from = options?.[prop.fromKey];
	const to = options?.[prop.toKey];
	if (from === undefined && to === undefined) {
		return false;
	}
	const idle = prop.id === 'scale' || prop.id === 'opacity' ? 100 : 0;
	const fromIdle = from === undefined || from === idle;
	const toIdle = to === undefined || to === idle;
	return !(fromIdle && toIdle);
};

function Num({ value, min, max, onChange, label }) {
	return (
		<input
			className="blockish-ix-num"
			type="number"
			aria-label={label}
			value={Number.isFinite(Number(value)) ? value : ''}
			min={min}
			max={max}
			step={1}
			onChange={(event) => {
				const next = event.target.value === '' ? min : Number(event.target.value);
				onChange(Number.isFinite(next) ? next : min);
			}}
		/>
	);
}

export default function MotionProperties({
	presetOptions,
	updatePresetOptions,
	replacePresetOptions,
}) {
	const active = MOTION_PROPS.filter((prop) =>
		isPropActive(presetOptions, prop)
	);
	const available = MOTION_PROPS.filter(
		(prop) => !isPropActive(presetOptions, prop)
	);

	const removeProp = (prop) => {
		const next = { ...presetOptions };
		delete next[prop.fromKey];
		delete next[prop.toKey];
		if (replacePresetOptions) {
			replacePresetOptions(next);
		} else {
			updatePresetOptions(next);
		}
	};

	return (
		<div className="blockish-ix-motion">
			{active.map((prop) => (
				<div key={prop.id} className="blockish-ix-prop-row">
					<span className="blockish-ix-prop-row__name">
						{prop.label}
						<span className="blockish-ix-prop-row__unit">{prop.unit}</span>
					</span>
					<Num
						label={`${prop.label} from`}
						value={presetOptions[prop.fromKey] ?? prop.seedFrom}
						min={prop.min}
						max={prop.max}
						onChange={(value) =>
							updatePresetOptions({ [prop.fromKey]: value })
						}
					/>
					<span className="blockish-ix-prop-row__arrow" aria-hidden>
						→
					</span>
					<Num
						label={`${prop.label} to`}
						value={presetOptions[prop.toKey] ?? prop.seedTo}
						min={prop.min}
						max={prop.max}
						onChange={(value) =>
							updatePresetOptions({ [prop.toKey]: value })
						}
					/>
					<button
						type="button"
						className="blockish-ix-prop-row__remove"
						aria-label={__('Remove', 'blockish')}
						onClick={() => removeProp(prop)}
					>
						×
					</button>
				</div>
			))}
			{available.length > 0 && (
				<div className="blockish-ix-prop-add">
					{available.map((prop) => (
						<Button
							key={prop.id}
							variant="tertiary"
							size="small"
							className="blockish-ix-chip"
							onClick={() =>
								updatePresetOptions({
									[prop.fromKey]: prop.seedFrom,
									[prop.toKey]: prop.seedTo,
								})
							}
						>
							+ {prop.label}
						</Button>
					))}
				</div>
			)}
		</div>
	);
}
