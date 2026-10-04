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
import { closeSmall } from '@wordpress/icons';
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
import {
	cssEaseToGsap,
	cssOptsToTween,
	patchMotionFirstTween,
	toSeconds,
	tweenToCssOpts,
} from '../utils/motion';
import MotionProperties from './motion-properties';

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

/**
 * Optional field: label row with a hide (×) icon while the field is still empty.
 */
function OptionalField({ id, label, onHide, children }) {
	return (
		<div className="blockish-ix-optional-field">
			<div className="blockish-ix-optional-field__head">
				<label className="components-base-control__label" htmlFor={id}>
					{label}
				</label>
				{onHide ? (
					<Button
						icon={closeSmall}
						size="small"
						label={__('Hide', 'blockish')}
						onClick={onHide}
					/>
				) : null}
			</div>
			{children}
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
}) {
	const { BlockishCodeEditor, BlockishSelect } =
		window?.blockish?.components || {};
	const [showAdvanced, setShowAdvanced] = useState(
		!!(draft?.when?.selector || '').trim()
	);
	const [showApplyTo, setShowApplyTo] = useState(
		!!(draft?.action?.applyTo || '').trim()
	);
	const [showEditor, setShowEditor] = useState(draft?.action?.preset === 'custom');
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
	// Editing the animation by hand makes it a custom one, not the suggested preset.
	const updateCustomAction = (patch) =>
		updateAction({ ...patch, preset: 'custom' });
	const updateCustomPresetOptions = (patch) => {
		const next = { ...presetOptions, ...patch };
		updateCustomAction({
			presetOptions: next,
			motion: patchMotionFirstTween(action.motion, next),
		});
	};
	const replaceCustomPresetOptions = (next) =>
		updateCustomAction({
			presetOptions: next,
			motion: patchMotionFirstTween(action.motion, next),
		});

	const durationSec = Math.round(toSeconds(presetOptions.duration, 0.6) * 100) / 100;
	const delaySec = Math.round(toSeconds(presetOptions.delay, 0) * 100) / 100;
	const staggerSec = Math.round(toSeconds(presetOptions.stagger, 0) * 100) / 100;
	const visibilityTypes = { show: true, hide: true, toggle: true };
	const actionGroup = visibilityTypes[action.type] ? 'visibility' : action.type || 'preset';
	const isScrollScrub = when.event === 'scrollProgress';

	const eventNameSuggestions = knownEventNames.map((name) => ({
		label: name,
		value: name,
	}));
	const signalSelectOptions = [
		{ label: __('Choose an event…', 'blockish'), value: '' },
		...eventNameSuggestions,
		{ label: __('Type custom event name…', 'blockish'), value: '__custom__' },
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

	// Pro (or any addon) can append presets; items with a `group` render as their own row.
	const presetItems = applyFilters('blockish.interactions.presets', PRESETS);
	const presetGroups = presetItems.reduce((groups, item) => {
		const key = item.group || '';
		(groups[key] = groups[key] || []).push(item);
		return groups;
	}, {});

	// Scroll/pin settings describe *when* it runs, so they survive a preset change.
	const keepScrollMotion = (motion = {}) => {
		const kept = {};
		[
			'pin',
			'pinStart',
			'pinEnd',
			'scrub',
			'toggleActions',
			'scrollStart',
			'scrollEnd',
			'markers',
		].forEach((key) => {
			if (motion[key] !== undefined) kept[key] = motion[key];
		});
		return kept;
	};

	const selectPreset = (preset) => {
		// Custom opens the editor starting from the current animation.
		if (preset === 'custom') {
			updateAction({ preset });
			setShowEditor(true);
			return;
		}
		const timing = {
			duration: presetOptions.duration,
			delay: presetOptions.delay,
			once: presetOptions.once,
			stagger: presetOptions.stagger,
		};
		const item = presetItems.find((p) => p.id === preset);
		if (item?.apply) {
			const motion = item.apply();
			updateAction({
				preset,
				presetOptions: {
					...timing,
					...tweenToCssOpts(motion.tweens[0], presetOptions),
				},
				motion: { ...keepScrollMotion(action.motion), ...motion },
			});
			return;
		}
		const next = { ...timing, ...getPresetAnimate(preset) };
		updateAction({
			preset,
			presetOptions: next,
			motion: {
				...keepScrollMotion(action.motion),
				tweens: [cssOptsToTween(next)],
			},
		});
	};

	const namePlaceholder =
		scope === 'block'
			? __('Untitled interaction (optional name)', 'blockish')
			: __('Name this interaction…', 'blockish');
	const nameHelp =
		scope === 'block'
			? __('A short label so you recognize this later.', 'blockish')
			: __('Give it a clear name so you can reuse it.', 'blockish');

	return (
		<div className="blockish-interaction-form">
			<div className="blockish-ix-name-bar">
				<input
					type="text"
					className="blockish-ix-name-bar__input"
					aria-label={__('Interaction name', 'blockish')}
					title={nameHelp}
					placeholder={namePlaceholder}
					value={draft.title || ''}
					onChange={(e) => onChange({ ...draft, title: e.target.value })}
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
							{__(
								'Choose what starts this interaction — a direct action (click, hover, scroll) or a custom event from another block.',
								'blockish'
							)}
						</p>
					</div>
				</header>

				<p className="blockish-ix-field-label">{__('Trigger type', 'blockish')}</p>
				<ChipGrid
					name={__('Trigger type', 'blockish')}
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
									label={__('Select event', 'blockish')}
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
									label={__('Select event', 'blockish')}
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
								label={__('Event name', 'blockish')}
								help={__(
									'Must match the event name broadcast by the other block (e.g. open-menu).',
									'blockish'
								)}
								placeholder={__('e.g. open-menu', 'blockish')}
								value={when.eventName || ''}
								onChange={(eventName) => updateWhen({ eventName })}
							/>
						)}
						{BlockishSelect ? (
							<BlockishSelect
								label={__('Trigger timing', 'blockish')}
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
								label={__('Trigger timing', 'blockish')}
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
								{__('+ Use custom selector…', 'blockish')}
							</button>
						) : (
							<OptionalField
								id="blockish-ix-when-selector"
								label={__('Custom selector (optional)', 'blockish')}
								onHide={
									(when.selector || '').trim()
										? null
										: () => setShowAdvanced(false)
								}
							>
								<TextControl
									id="blockish-ix-when-selector"
									help={__(
										'Leave empty to trigger on this block wrapper. Enter any CSS selector (e.g. .btn, img, .card-title) to trigger only on that element.',
										'blockish'
									)}
									placeholder={__('e.g. .btn, img, .card-title', 'blockish')}
									value={when.selector || ''}
									onChange={(selector) => updateWhen({ selector })}
								/>
							</OptionalField>
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
							items={presetGroups[''] || []}
							value={action.preset || 'fadeUp'}
							onChange={selectPreset}
						/>
						{Object.keys(presetGroups)
							.filter((group) => group !== '')
							.map((group) => (
								<div key={group}>
									<p className="blockish-ix-field-label">{group}</p>
									<ChipGrid
										name={group}
										items={presetGroups[group]}
										value={action.preset}
										onChange={selectPreset}
									/>
								</div>
							))}
						<button
							type="button"
							className="blockish-ix-link-btn"
							onClick={() => setShowEditor(!showEditor)}
						>
							{showEditor
								? __('Hide editor', 'blockish')
								: __('+ Edit animation…', 'blockish')}
						</button>
						{showEditor &&
							applyFilters(
							'blockish.interactions.motionFields',
							<div className="blockish-ix-motion-panel">
								<div className="blockish-ix-motion-split">
									<MotionProperties
										presetOptions={presetOptions}
										updatePresetOptions={updateCustomPresetOptions}
										replacePresetOptions={replaceCustomPresetOptions}
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
															updateCustomPresetOptions({
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
															updateCustomPresetOptions({
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
														updateCustomPresetOptions({ easing })
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
								updateAction: updateCustomAction,
								updatePresetOptions: updateCustomPresetOptions,
								replacePresetOptions: replaceCustomPresetOptions,
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

				{action.type === 'scrollTo' && (
					<div className="blockish-ix-card__fields">
						<TextControl
							label={__('Scroll target', 'blockish')}
							help={__(
								'CSS selector of the section, e.g. #pricing. Leave empty to scroll to the top.',
								'blockish'
							)}
							placeholder={__('e.g. #pricing', 'blockish')}
							value={action.scrollTarget || ''}
							onChange={(scrollTarget) => updateAction({ scrollTarget })}
						/>
						<TextControl
							label={__('Offset (px)', 'blockish')}
							help={__('Stop this many pixels above the target, e.g. for a sticky header.', 'blockish')}
							type="number"
							value={action.scrollOffset ?? 0}
							onChange={(value) => updateAction({ scrollOffset: Number(value) || 0 })}
						/>
						<TextControl
							label={__('Duration (s)', 'blockish')}
							type="number"
							step={0.1}
							min={0.1}
							value={action.scrollDuration ?? 1.2}
							onChange={(value) =>
								updateAction({ scrollDuration: Math.max(0.1, Number(value) || 1.2) })
							}
						/>
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
								'Broadcast a custom event for other blocks to listen to without animating this block. To animate first and then trigger another block, select "Play an animation" and open “Trigger another event on completion” below.',
								'blockish'
							)}
						</p>
						<TextControl
							label={__('Event name to broadcast', 'blockish')}
							help={__(
								'Other blocks can listen for this exact event name in: Trigger type → Listen event.',
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
						{(showApplyTo || showNotify) && (
							<div className="blockish-ix-optional-row">
								{showApplyTo && (
									<OptionalField
										id="blockish-ix-apply-to"
										label={__('Play this on a different block', 'blockish')}
										onHide={
											(action.applyTo || '').trim()
												? null
												: () => setShowApplyTo(false)
										}
									>
										<TextControl
											id="blockish-ix-apply-to"
											help={__(
												'Empty = this block. Class Manager class on the other block, e.g. .hero-card',
												'blockish'
											)}
											placeholder={__('e.g. .hero-card', 'blockish')}
											value={action.applyTo || ''}
											onChange={(applyTo) => updateAction({ applyTo })}
										/>
									</OptionalField>
								)}
								{showNotify && (
									<OptionalField
										id="blockish-ix-notify"
										label={__('Trigger another event', 'blockish')}
										onHide={
											(action.eventName || '').trim()
												? null
												: () => setShowNotify(false)
										}
									>
										<TextControl
											id="blockish-ix-notify"
											help={__(
												'Broadcast this event name when this interaction runs so other blocks can react.',
												'blockish'
											)}
											placeholder={__('e.g. hero-moved', 'blockish')}
											value={action.eventName || ''}
											onChange={(eventName) => updateAction({ eventName })}
										/>
										{!!(action.eventName || '').trim() && (
											<SelectControl
												label={__('When to trigger', 'blockish')}
												value={action.phase || 'end'}
												options={PHASE_OPTIONS}
												onChange={(phase) => updateAction({ phase })}
											/>
										)}
									</OptionalField>
								)}
							</div>
						)}
						{!showApplyTo && (
							<button
								type="button"
								className="blockish-ix-link-btn"
								onClick={() => setShowApplyTo(true)}
							>
								{__('Play this on a different block…', 'blockish')}
							</button>
						)}
						{!showNotify && (
							<button
								type="button"
								className="blockish-ix-link-btn"
								onClick={() => setShowNotify(true)}
							>
								{__('+ Trigger another event on completion…', 'blockish')}
							</button>
						)}
					</div>
				)}
			</section>

			{!window?.blockishAnimation && (
				<p className="blockish-ix-pro-note">
					{__(
						'Need advanced multi-step GSAP timelines? Upgrade to Blockish Pro.',
						'blockish'
					)}
				</p>
			)}
		</div>
	);
}
