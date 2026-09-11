import { useState } from '@wordpress/element';
import { applyFilters } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import {
	SelectControl,
	TextControl,
	ToggleControl,
	RangeControl,
	Button,
} from '@wordpress/components';
import {
	ACTION_TYPES,
	DOM_EVENTS,
	LISTEN_PHASE_OPTIONS,
	PHASE_OPTIONS,
	PRESETS,
	SOURCE_OPTIONS,
	DEFAULT_PRESET_OPTIONS,
	CUSTOM_JS_PLACEHOLDER,
	VISIBILITY_MODES,
	EASING_OPTIONS,
	getPresetAnimate,
	isBlankCustomJs,
} from '../utils/constants';
import { cssEaseToGsap, cssOptsToTween, patchMotionFirstTween, toSeconds } from '../utils/motion';
import MotionProperties from './MotionProperties';

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

function ChipGrid({ items, value, onChange, name, columns = 4 }) {
	return (
		<div
			className={`blockish-ix-preset-grid blockish-ix-preset-grid--${columns}`}
			role="radiogroup"
			aria-label={name}
		>
			{items.map((item) => {
				const id = item.id ?? item.value;
				const selected = value === id;
				return (
					<button
						key={id}
						type="button"
						role="radio"
						aria-checked={selected}
						className={`blockish-ix-preset${selected ? ' is-selected' : ''}`}
						title={item.hint || item.description || item.label}
						onClick={() => onChange(id)}
					>
						<span className="blockish-ix-preset__label">{item.label}</span>
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
	clientId,
	onPreview,
}) {
	const { BlockishCodeEditor, BlockishSelect } =
		window?.blockish?.components || {};
	const [showAdvanced, setShowAdvanced] = useState(
		!!(draft?.when?.selector || '').trim()
	);
	const [showApplyTo, setShowApplyTo] = useState(
		!!(draft?.action?.applyTo || '').trim()
	);
	const [showNotify, setShowNotify] = useState(
		!!(draft?.action?.eventName || '').trim() ||
			draft?.action?.type === 'emit'
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
	const updatePresetOptions = (patch) => {
		const next = { ...presetOptions, ...patch };
		updateAction({
			presetOptions: next,
			motion: patchMotionFirstTween(action.motion, next),
		});
	};
	const replacePresetOptions = (next) => {
		updateAction({
			presetOptions: next,
			motion: patchMotionFirstTween(action.motion, next),
		});
	};

	const durationSec = Math.round(toSeconds(presetOptions.duration, 0.6) * 100) / 100;
	const delaySec = Math.round(toSeconds(presetOptions.delay, 0) * 100) / 100;
	const staggerSec = Math.round(toSeconds(presetOptions.stagger, 0) * 100) / 100;
	const visibilityTypes = { show: true, hide: true, toggle: true };
	const actionGroup = visibilityTypes[action.type] ? 'visibility' : action.type || 'preset';
	const canPreview =
		scope === 'block' &&
		!!clientId &&
		typeof onPreview === 'function' &&
		actionGroup !== 'emit' &&
		actionGroup !== 'custom';
	const isScrollScrub = when.event === 'scrollProgress';

	const eventNameSuggestions = knownEventNames.map((name) => ({
		label: name,
		value: name,
	}));
	const signalSelectOptions = [
		{ label: __('Choose a signal…', 'blockish'), value: '' },
		...eventNameSuggestions,
		{ label: __('Type a custom name…', 'blockish'), value: '__custom__' },
	];
	const selectedListenPhase =
		LISTEN_PHASE_OPTIONS.find((o) => o.value === (when.phase || 'start')) || null;
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
							{__('How this interaction starts — on this block, or when another one broadcasts a name.', 'blockish')}
						</p>
					</div>
				</header>

				<p className="blockish-ix-field-label">{__('How it starts', 'blockish')}</p>
				<ChipGrid
					name={__('How it starts', 'blockish')}
					items={SOURCE_OPTIONS}
					value={when.source || 'dom'}
					columns={2}
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
									'Same name as “Tell another interaction” on the other block. For a sequence, choose when that name finishes.',
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
						<p className="blockish-ix-field-label">{__('Trigger', 'blockish')}</p>
						<ChipGrid
							name={__('Trigger', 'blockish')}
							items={DOM_EVENTS}
							value={when.event || 'ready'}
							onChange={(event) => updateWhen({ event })}
						/>

						{when.event === 'scroll' && (
							<RangeControl
								label={__('After scrolling', 'blockish')}
								help={__(
									'Runs once the page has scrolled this far. Scrolls back above it reverses.',
									'blockish'
								)}
								value={Number(when.scrollY) >= 0 ? Number(when.scrollY) : 80}
								onChange={(scrollY) => updateWhen({ scrollY })}
								min={0}
								max={1000}
								step={10}
							/>
						)}

						{!showAdvanced ? (
							<button
								type="button"
								className="blockish-ix-link-btn"
								onClick={() => setShowAdvanced(true)}
							>
								{__('Click a child inside this block…', 'blockish')}
							</button>
						) : (
							<TextControl
								label={__('Click / hover this child (optional)', 'blockish')}
								help={__(
									'Leave empty to use the whole block. Does not change where the animation plays.',
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
							{isScrollScrub
								? __(
										'From → to follows this block through the viewport as you scroll.',
										'blockish'
								  )
								: __('What this block does. Telling another block is optional, underneath.', 'blockish')}
						</p>
					</div>
				</header>

				<ChoiceCards
					name={__('Action', 'blockish')}
					options={ACTION_TYPES}
					value={actionGroup}
					onChange={(group) => {
						if (group === 'visibility') {
							updateAction({
								type: visibilityTypes[action.type]
									? action.type
									: 'toggle',
							});
							return;
						}
						if (group === 'emit') {
							setShowNotify(true);
							updateAction({ type: 'emit', phase: 'start' });
							return;
						}
						updateAction({
							type: group,
							phase: action.phase || 'end',
						});
					}}
				/>

				{action.type === 'preset' && (
					<div className="blockish-ix-card__fields">
						<p className="blockish-ix-field-label">{__('Animation', 'blockish')}</p>
						<ChipGrid
							name={__('Animation', 'blockish')}
							items={PRESETS}
							value={action.preset || 'fadeUp'}
							onChange={(preset) => {
								const next = {
									duration: presetOptions.duration,
									delay: presetOptions.delay,
									once: presetOptions.once,
									stagger: presetOptions.stagger,
									...getPresetAnimate(preset),
								};
								updateAction({
									preset,
									presetOptions: next,
									motion: {
										...(action.motion || {}),
										tweens: [cssOptsToTween(next)],
									},
								});
							}}
						/>
						{applyFilters(
							'blockish.interactions.motionFields',
							<div className="blockish-ix-motion-panel">
								<div className="blockish-ix-motion-split">
									<MotionProperties
										presetOptions={presetOptions}
										updatePresetOptions={updatePresetOptions}
										replacePresetOptions={replacePresetOptions}
									/>
									{!isScrollScrub && (
										<div className="blockish-ix-timing-row">
											<label className="blockish-ix-timing-row__item">
												<span>{__('Time', 'blockish')}</span>
												<span className="blockish-ix-timing-row__field">
													<input
														className="blockish-ix-num"
														type="number"
														min={0.05}
														max={5}
														step={0.05}
														aria-label={__('Duration', 'blockish')}
														value={durationSec}
														onChange={(event) => {
															const next = Number(event.target.value);
															updatePresetOptions({
																duration: Math.max(
																	0.05,
																	Number.isFinite(next) ? next : 0.6
																),
															});
														}}
													/>
													<span className="blockish-ix-prop-row__unit">s</span>
												</span>
											</label>
											<label className="blockish-ix-timing-row__item">
												<span>{__('Delay', 'blockish')}</span>
												<span className="blockish-ix-timing-row__field">
													<input
														className="blockish-ix-num"
														type="number"
														min={0}
														max={5}
														step={0.05}
														aria-label={__('Delay', 'blockish')}
														value={delaySec}
														onChange={(event) => {
															const next = Number(event.target.value);
															updatePresetOptions({
																delay: Math.max(
																	0,
																	Number.isFinite(next) ? next : 0
																),
															});
														}}
													/>
													<span className="blockish-ix-prop-row__unit">s</span>
												</span>
											</label>
											<div className="blockish-ix-timing-row__ease">
												<SelectControl
													label={__('Ease', 'blockish')}
													value={cssEaseToGsap(presetOptions.easing)}
													options={EASING_OPTIONS}
													onChange={(easing) =>
														updatePresetOptions({ easing })
													}
												/>
											</div>
										</div>
									)}
								</div>
							</div>,
							{
								action,
								presetOptions,
								updateAction,
								updatePresetOptions,
								replacePresetOptions,
								when,
							}
						)}
						{(when.event === 'inView' || when.source === 'listen') && (
							<ToggleControl
								label={__('Only run once', 'blockish')}
								checked={!!presetOptions.once}
								onChange={(once) => updatePresetOptions({ once })}
							/>
						)}
						{when.event === 'inView' && (
							<label className="blockish-ix-timing-row__item">
								<span>{__('Stagger', 'blockish')}</span>
								<input
									className="blockish-ix-num"
									type="number"
									min={0}
									max={1}
									step={0.05}
									aria-label={__('Stagger children', 'blockish')}
									value={staggerSec}
									onChange={(event) => {
										const next = Number(event.target.value);
										updatePresetOptions({
											stagger: Math.max(
												0,
												Number.isFinite(next) ? next : 0
											),
										});
									}}
								/>
								<span className="blockish-ix-prop-row__unit">s</span>
							</label>
						)}
					</div>
				)}

				{actionGroup === 'visibility' && (
					<div className="blockish-ix-card__fields">
						<p className="blockish-ix-field-label">
							{__('Visibility', 'blockish')}
						</p>
						<div className="blockish-ix-choice-cards" role="radiogroup">
							{VISIBILITY_MODES.map((mode) => {
								const selected = (action.type || 'toggle') === mode.value;
								return (
									<button
										key={mode.value}
										type="button"
										role="radio"
										aria-checked={selected}
										className={`blockish-ix-choice-card${
											selected ? ' is-selected' : ''
										}`}
										onClick={() => updateAction({ type: mode.value })}
									>
										<span className="blockish-ix-choice-card__label">
											{mode.label}
										</span>
									</button>
								);
							})}
						</div>
						<p className="blockish-interaction-form__hint">
							{__(
								'Click toggles. Hover shows while the pointer is over it.',
								'blockish'
							)}
						</p>
					</div>
				)}

				{action.type === 'toggleClass' && (
					<div className="blockish-ix-card__fields">
						<TextControl
							label={__('Class name', 'blockish')}
							help={__(
								'Without the dot. Hover adds it and removes it on leave; click toggles.',
								'blockish'
							)}
							placeholder={__('e.g. is-active', 'blockish')}
							value={String(action.className || '').replace(/^\./, '')}
							onChange={(className) =>
								updateAction({
									className: String(className || '')
										.replace(/^\./, '')
										.trim(),
								})
							}
						/>
					</div>
				)}

				{action.type === 'emit' && (
					<div className="blockish-ix-card__fields">
						<p className="blockish-interaction-form__hint">
							{__(
								'Use this when this block should do nothing except broadcast a name. For click → animate → then the next block, keep Play an animation and open “Tell another interaction” below.',
								'blockish'
							)}
						</p>
						<TextControl
							label={__('Name to broadcast', 'blockish')}
							help={__(
								'On the other block: How it starts → Wait for a name → this exact name.',
								'blockish'
							)}
							placeholder={__('e.g. open-menu', 'blockish')}
							value={action.eventName || ''}
							onChange={(eventName) => updateAction({ eventName })}
						/>
					</div>
				)}

				{action.type === 'custom' && (
					<div className="blockish-ix-card__fields">
						<p className="blockish-interaction-form__hint">
							{__(
								'Runs as a function (event, blockElement). blockElement is this block, or the Inner target match if you set one in step 1.',
								'blockish'
							)}
						</p>
						<div
							className={`blockish-ix-js-editor${
								isBlankCustomJs(action.callbacks?.[0])
									? ' is-empty'
									: ''
							}`}
						>
							{isBlankCustomJs(action.callbacks?.[0]) && (
								<pre
									className="blockish-ix-js-editor__placeholder"
									aria-hidden="true"
								>
									{CUSTOM_JS_PLACEHOLDER}
								</pre>
							)}
							{BlockishCodeEditor ? (
								<BlockishCodeEditor
									label={__('JavaScript', 'blockish')}
									value={
										isBlankCustomJs(action.callbacks?.[0])
											? ''
											: action.callbacks[0]
									}
									onChange={(code) =>
										updateAction({
											callbacks: [
												isBlankCustomJs(code) ? '' : code,
											],
										})
									}
									help={__(
										'Inner target uses a Class Manager class, e.g. .hero-image — that node is blockElement.',
										'blockish'
									)}
								/>
							) : (
								<textarea
									className="blockish-interaction-form__textarea"
									rows={8}
									placeholder={CUSTOM_JS_PLACEHOLDER}
									value={
										isBlankCustomJs(action.callbacks?.[0])
											? ''
											: action.callbacks[0]
									}
									onChange={(e) =>
										updateAction({
											callbacks: [
												isBlankCustomJs(e.target.value)
													? ''
													: e.target.value,
											],
										})
									}
								/>
							)}
						</div>
					</div>
				)}

				{action.type !== 'emit' && (
					<div className="blockish-ix-card__fields">
						{showApplyTo ? (
							<TextControl
								label={__('Play this on a different block', 'blockish')}
								help={__(
									'Empty = this block. Class Manager class on the other block, e.g. .hero-card',
									'blockish'
								)}
								placeholder={__('e.g. .hero-card', 'blockish')}
								value={action.applyTo || ''}
								onChange={(applyTo) => updateAction({ applyTo })}
							/>
						) : (
							<button
								type="button"
								className="blockish-ix-link-btn"
								onClick={() => setShowApplyTo(true)}
							>
								{__('Play this on a different block…', 'blockish')}
							</button>
						)}
						{showNotify ? (
							<>
								<TextControl
									label={__('Tell another interaction', 'blockish')}
									help={__(
										'Broadcast this name when the action runs. On the other block: How it starts → Wait for a name → same name.',
										'blockish'
									)}
									placeholder={__('e.g. hero-moved', 'blockish')}
									value={action.eventName || ''}
									onChange={(eventName) => updateAction({ eventName })}
								/>
								{!!(action.eventName || '').trim() && (
									<SelectControl
										label={__('Broadcast', 'blockish')}
										value={action.phase || 'end'}
										options={PHASE_OPTIONS}
										onChange={(phase) => updateAction({ phase })}
									/>
								)}
							</>
						) : (
							<button
								type="button"
								className="blockish-ix-link-btn"
								onClick={() => setShowNotify(true)}
							>
								{__('Then tell another interaction to run…', 'blockish')}
							</button>
						)}
					</div>
				)}
			</section>

			{canPreview ? (
				<div className="blockish-ix-preview-row">
					<Button variant="secondary" onClick={onPreview}>
						{__('Preview on this block', 'blockish')}
					</Button>
					<p className="blockish-ix-preview-row__hint">
						{__(
							'This is only a preview on the selected block. Scroll and pin animations are not shown here — view the front end for those.',
							'blockish'
						)}
					</p>
				</div>
			) : null}

			<p className="blockish-ix-pro-note">
				{__(
					'Need timeline animations? A visual Animation Builder addon is coming soon.',
					'blockish'
				)}
			</p>
		</div>
	);
}
