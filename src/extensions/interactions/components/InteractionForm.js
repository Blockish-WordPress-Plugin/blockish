import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	SelectControl,
	TextControl,
	ToggleControl,
	RangeControl,
} from '@wordpress/components';
import {
	ACTION_TYPES,
	DOM_EVENTS,
	LISTEN_PHASE_OPTIONS,
	PHASE_OPTIONS,
	PRESETS,
	SOURCE_OPTIONS,
	DEFAULT_PRESET_OPTIONS,
} from '../utils/constants';

function ChoiceCards({ options, value, onChange, name }) {
	return (
		<div className="blockish-ix-choice-cards" role="radiogroup" aria-label={name}>
			{options.map((option) => {
				const selected = value === option.value;
				return (
					<button
						key={option.value}
						type="button"
						role="radio"
						aria-checked={selected}
						className={`blockish-ix-choice-card${selected ? ' is-selected' : ''}`}
						onClick={() => onChange(option.value)}
					>
						<span className="blockish-ix-choice-card__label">{option.label}</span>
						{option.description ? (
							<span className="blockish-ix-choice-card__desc">
								{option.description}
							</span>
						) : null}
					</button>
				);
			})}
		</div>
	);
}

function PresetGrid({ value, onChange }) {
	return (
		<div className="blockish-ix-preset-grid">
			{PRESETS.map((preset) => {
				const selected = value === preset.id;
				return (
					<button
						key={preset.id}
						type="button"
						className={`blockish-ix-preset${selected ? ' is-selected' : ''}`}
						onClick={() => onChange(preset.id)}
					>
						<span className="blockish-ix-preset__label">{preset.label}</span>
						<span className="blockish-ix-preset__hint">{preset.hint}</span>
					</button>
				);
			})}
		</div>
	);
}

const selectPortalProps = {
	menuPortalTarget: typeof document !== 'undefined' ? document.body : null,
	styles: { menuPortal: (base) => ({ ...base, zIndex: 9999999 }) },
	menuPosition: 'fixed',
};

const parseSelectValue = (val) =>
	val && typeof val === 'object' && val.value !== undefined ? val.value : val;

export default function InteractionForm({
	draft,
	onChange,
	knownEventNames = [],
	scope,
}) {
	const { BlockishCodeEditor, BlockishSelect } =
		window?.blockish?.components || {};
	const [showAdvanced, setShowAdvanced] = useState(
		!!(draft?.when?.selector || '').trim()
	);

	if (!draft) {
		return null;
	}

	const when = draft.when || {};
	const action = draft.action || {};
	const presetOptions = {
		...DEFAULT_PRESET_OPTIONS,
		...(action.presetOptions || {}),
	};

	const updateWhen = (patch) => onChange({ ...draft, when: { ...when, ...patch } });
	const updateAction = (patch) => onChange({ ...draft, action: { ...action, ...patch } });
	const updatePresetOptions = (patch) =>
		updateAction({ presetOptions: { ...presetOptions, ...patch } });

	const durationSec = (presetOptions.duration / 1000).toFixed(1).replace(/\.0$/, '');
	const delaySec = (presetOptions.delay / 1000).toFixed(1).replace(/\.0$/, '');

	const eventNameSuggestions = knownEventNames.map((name) => ({
		label: name,
		value: name,
	}));
	const signalSelectOptions = [
		{ label: __('Choose a signal…', 'blockish'), value: '' },
		...eventNameSuggestions,
		{ label: __('Type a custom name…', 'blockish'), value: '__custom__' },
	];
	const selectedTrigger = DOM_EVENTS.find((o) => o.value === (when.event || 'ready')) || null;
	const selectedListenPhase =
		LISTEN_PHASE_OPTIONS.find((o) => o.value === (when.phase || 'start')) || null;
	const selectedEmitPhase =
		PHASE_OPTIONS.find((o) => o.value === (action.phase || 'start')) || null;
	const selectedSignal = (() => {
		if (!when.eventName) {
			return signalSelectOptions[0];
		}
		if (knownEventNames.includes(when.eventName)) {
			return { label: when.eventName, value: when.eventName };
		}
		return signalSelectOptions.find((o) => o.value === '__custom__') || null;
	})();

	const nameLabel =
		scope === 'block'
			? __('Name (optional)', 'blockish')
			: __('Name', 'blockish');
	const nameHelp =
		scope === 'block'
			? __('A short label so you recognize this later.', 'blockish')
			: __('Give it a clear name so you can reuse it.', 'blockish');

	return (
		<div className="blockish-interaction-form">
			<div className="blockish-ix-card">
				<TextControl
					label={nameLabel}
					help={nameHelp}
					placeholder={__('e.g. Winter hero reveal', 'blockish')}
					value={draft.title || ''}
					onChange={(title) => onChange({ ...draft, title })}
				/>
			</div>

			<section className="blockish-ix-card">
				<header className="blockish-ix-card__header">
					<span className="blockish-ix-card__step">1</span>
					<div>
						<h3 className="blockish-ix-card__title">
							{__('When should this run?', 'blockish')}
						</h3>
						<p className="blockish-ix-card__subtitle">
							{__('Pick what starts this interaction.', 'blockish')}
						</p>
					</div>
				</header>

				<ChoiceCards
					name={__('Trigger', 'blockish')}
					options={SOURCE_OPTIONS}
					value={when.source || 'dom'}
					onChange={(source) => updateWhen({ source })}
				/>

				{when.source === 'listen' ? (
					<div className="blockish-ix-card__fields">
						{eventNameSuggestions.length > 0 ? (
							BlockishSelect ? (
								<BlockishSelect
									label={__('Which signal?', 'blockish')}
									value={selectedSignal}
									options={signalSelectOptions}
									isClearable={false}
									onChange={(val) => {
										const value = parseSelectValue(val) || '';
										if (value === '__custom__') {
											updateWhen({
												eventName: knownEventNames.includes(
													when.eventName
												)
													? ''
													: when.eventName || '',
											});
										} else {
											updateWhen({ eventName: value });
										}
									}}
									{...selectPortalProps}
								/>
							) : (
								<SelectControl
									label={__('Which signal?', 'blockish')}
									value={selectedSignal?.value || ''}
									options={signalSelectOptions}
									onChange={(value) => {
										if (value === '__custom__') {
											updateWhen({ eventName: '' });
										} else {
											updateWhen({ eventName: value });
										}
									}}
								/>
							)
						) : null}
						{(eventNameSuggestions.length === 0 ||
							!knownEventNames.includes(when.eventName)) && (
							<TextControl
								label={__('Signal name', 'blockish')}
								help={__(
									'Use the same name as the “Send a signal” action on the other block.',
									'blockish'
								)}
								placeholder={__('e.g. open-menu', 'blockish')}
								value={when.eventName || ''}
								onChange={(eventName) => updateWhen({ eventName })}
							/>
						)}
						{BlockishSelect ? (
							<BlockishSelect
								label={__('React when the signal…', 'blockish')}
								value={selectedListenPhase}
								options={LISTEN_PHASE_OPTIONS}
								isClearable={false}
								onChange={(val) =>
									updateWhen({ phase: parseSelectValue(val) || 'start' })
								}
								{...selectPortalProps}
							/>
						) : (
							<SelectControl
								label={__('React when the signal…', 'blockish')}
								value={when.phase || 'start'}
								options={LISTEN_PHASE_OPTIONS}
								onChange={(phase) => updateWhen({ phase })}
							/>
						)}
					</div>
				) : (
					<div className="blockish-ix-card__fields">
						{BlockishSelect ? (
							<BlockishSelect
								label={__('Trigger', 'blockish')}
								value={selectedTrigger}
								options={DOM_EVENTS}
								isClearable={false}
								onChange={(val) =>
									updateWhen({ event: parseSelectValue(val) || 'ready' })
								}
								{...selectPortalProps}
							/>
						) : (
							<SelectControl
								label={__('Trigger', 'blockish')}
								value={when.event || 'ready'}
								options={DOM_EVENTS}
								onChange={(event) => updateWhen({ event })}
							/>
						)}

						{!showAdvanced ? (
							<button
								type="button"
								className="blockish-ix-link-btn"
								onClick={() => setShowAdvanced(true)}
							>
								{__('Target a specific part inside this block…', 'blockish')}
							</button>
						) : (
							<TextControl
								label={__('Inner target (optional)', 'blockish')}
								help={__(
									'Usually leave this blank. Only needed if you want a child element — use a class from Class Manager.',
									'blockish'
								)}
								placeholder={__('e.g. .hero-image', 'blockish')}
								value={when.selector || ''}
								onChange={(selector) => updateWhen({ selector })}
							/>
						)}
					</div>
				)}
			</section>

			<section className="blockish-ix-card">
				<header className="blockish-ix-card__header">
					<span className="blockish-ix-card__step">2</span>
					<div>
						<h3 className="blockish-ix-card__title">
							{__('What should happen?', 'blockish')}
						</h3>
						<p className="blockish-ix-card__subtitle">
							{__('Choose an animation, a signal, or custom code.', 'blockish')}
						</p>
					</div>
				</header>

				<ChoiceCards
					name={__('Action', 'blockish')}
					options={ACTION_TYPES}
					value={action.type || 'preset'}
					onChange={(type) => updateAction({ type })}
				/>

				{action.type === 'preset' && (
					<div className="blockish-ix-card__fields">
						<p className="blockish-ix-field-label">{__('Animation', 'blockish')}</p>
						<PresetGrid
							value={action.preset || 'fadeUp'}
							onChange={(preset) => updateAction({ preset })}
						/>
						<RangeControl
							label={__('How long', 'blockish')}
							help={`${durationSec}s`}
							value={presetOptions.duration}
							onChange={(duration) => updatePresetOptions({ duration })}
							min={100}
							max={3000}
							step={50}
						/>
						<RangeControl
							label={__('Wait before starting', 'blockish')}
							help={presetOptions.delay ? `${delaySec}s` : __('No wait', 'blockish')}
							value={presetOptions.delay}
							onChange={(delay) => updatePresetOptions({ delay })}
							min={0}
							max={3000}
							step={50}
						/>
						{(when.event === 'inView' || when.source === 'listen') && (
							<ToggleControl
								label={__('Only run once', 'blockish')}
								checked={!!presetOptions.once}
								onChange={(once) => updatePresetOptions({ once })}
							/>
						)}
					</div>
				)}

				{action.type === 'emit' && (
					<div className="blockish-ix-card__fields">
						<TextControl
							label={__('Signal name', 'blockish')}
							help={__(
								'Other blocks can wait for this exact name.',
								'blockish'
							)}
							placeholder={__('e.g. open-menu', 'blockish')}
							value={action.eventName || ''}
							onChange={(eventName) => updateAction({ eventName })}
						/>
						{BlockishSelect ? (
							<BlockishSelect
								label={__('This signal means…', 'blockish')}
								value={selectedEmitPhase}
								options={PHASE_OPTIONS}
								isClearable={false}
								onChange={(val) =>
									updateAction({ phase: parseSelectValue(val) || 'start' })
								}
								{...selectPortalProps}
							/>
						) : (
							<SelectControl
								label={__('This signal means…', 'blockish')}
								value={action.phase || 'start'}
								options={PHASE_OPTIONS}
								onChange={(phase) => updateAction({ phase })}
							/>
						)}
					</div>
				)}

				{action.type === 'custom' && (
					<div className="blockish-ix-card__fields">
						<p className="blockish-interaction-form__hint">
							{__(
								'For developers. Your code receives event and blockElement.',
								'blockish'
							)}
						</p>
						{BlockishCodeEditor ? (
							<BlockishCodeEditor
								label={__('JavaScript', 'blockish')}
								value={(action.callbacks && action.callbacks[0]) || ''}
								onChange={(code) => updateAction({ callbacks: [code] })}
							/>
						) : (
							<textarea
								className="blockish-interaction-form__textarea"
								rows={8}
								value={(action.callbacks && action.callbacks[0]) || ''}
								onChange={(e) =>
									updateAction({ callbacks: [e.target.value] })
								}
							/>
						)}
					</div>
				)}
			</section>

			<p className="blockish-ix-pro-note">
				{__(
					'Need timeline animations? A visual Animation Builder addon is coming soon.',
					'blockish'
				)}
			</p>
		</div>
	);
}
