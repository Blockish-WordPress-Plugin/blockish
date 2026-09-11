import { DEFAULT_PRESET_OPTIONS, isBlankCustomJs } from './constants';
import { cssOptsToTween, getMotionTweens, tweenToCssOpts } from './motion';

const resolvePresetMotion = (action) => {
	const presetOptions = {
		...DEFAULT_PRESET_OPTIONS,
		...(action.presetOptions || {}),
	};
	if (action.type !== 'preset') {
		return {
			presetOptions,
			motion: action.motion,
		};
	}
	const tweens = getMotionTweens({ action });
	if (tweens.length) {
		const flat = tweenToCssOpts(tweens[0], presetOptions);
		return {
			presetOptions: { ...presetOptions, ...flat },
			motion: action.motion,
		};
	}
	return {
		presetOptions,
		motion: { tweens: [cssOptsToTween(presetOptions)] },
	};
};

/**
 * Normalize legacy { event, selector, callbacks } into the structured shape.
 */
export function normalizeInteraction(raw, scope = 'block') {
	if (!raw || typeof raw !== 'object') {
		return null;
	}

	const hasStructured = raw.when || raw.action;

	if (hasStructured) {
		const when = {
			source: raw.when?.source || (raw.event === 'listen' ? 'listen' : 'dom'),
			event: raw.when?.event || raw.event || 'ready',
			selector: raw.when?.selector ?? raw.selector ?? '',
			eventName: raw.when?.eventName || raw.listenEventName || '',
			phase: raw.when?.phase || raw.listenPhase || 'start',
			scrollY:
				raw.when?.scrollY !== undefined
					? Number(raw.when.scrollY)
					: raw.scrollY !== undefined
						? Number(raw.scrollY)
						: 80,
			parallax:
				raw.when?.parallax !== undefined
					? Number(raw.when.parallax)
					: raw.parallax !== undefined
						? Number(raw.parallax)
						: 0,
		};

		const action = {
			type: raw.action?.type || raw.actionType || (raw.callbacks?.length ? 'custom' : 'preset'),
			preset: raw.action?.preset || raw.preset || 'fadeUp',
			presetOptions: {
				...DEFAULT_PRESET_OPTIONS,
				...(raw.action?.presetOptions || raw.presetOptions || {}),
			},
			eventName: raw.action?.eventName || raw.emitEventName || '',
			phase: raw.action?.phase || raw.emitPhase || 'end',
			applyTo: raw.action?.applyTo ?? raw.applyTo ?? '',
			className: raw.action?.className ?? raw.className ?? '',
			callbacks: Array.isArray(raw.action?.callbacks)
				? raw.action.callbacks
				: Array.isArray(raw.callbacks)
					? raw.callbacks
					: [''],
			...(raw.action?.motion ? { motion: raw.action.motion } : {}),
		};

		return {
			id: raw.id || `ix_${Date.now()}`,
			title: raw.title || '',
			scope: raw.scope || scope,
			when,
			action,
		};
	}

	// Legacy AI shape
	return {
		id: raw.id || `ix_${Date.now()}`,
		title: raw.title || '',
		scope: raw.scope || scope,
		when: {
			source: 'dom',
			event: raw.event || 'ready',
			selector: raw.selector || '',
			eventName: '',
			phase: 'start',
			scrollY: 80,
			parallax: 0,
		},
		action: {
			type: 'custom',
			preset: 'fadeUp',
			presetOptions: { ...DEFAULT_PRESET_OPTIONS },
			eventName: '',
			phase: 'end',
			applyTo: '',
			className: '',
			callbacks: Array.isArray(raw.callbacks) ? raw.callbacks : [''],
		},
	};
}

/**
 * Compile structured interaction into a runtime-ready payload
 * (keeps structured fields + flat runtime fields for view.js + AI compatibility).
 */
export function compileInteraction(interaction) {
	const normalized = normalizeInteraction(interaction, interaction?.scope || 'block');
	if (!normalized) return null;

	const { when, action } = normalized;
	const { presetOptions, motion } = resolvePresetMotion(action);
	const isListen = when.source === 'listen';

	let event = when.event || 'ready';
	if (isListen) {
		event = 'listen';
	}

	const customCallbacks =
		action.type === 'custom'
			? (action.callbacks || []).filter(
					(c) => typeof c === 'string' && ! isBlankCustomJs(c)
			  )
			: [];

	const compiled = {
		id: normalized.id,
		title: normalized.title || '',
		scope: normalized.scope || 'block',
		when: { ...when },
		action: {
			...action,
			presetOptions,
			className: action.className || '',
			callbacks: customCallbacks,
			...(motion ? { motion } : {}),
		},
		// Flat runtime fields
		event,
		selector: when.selector || '',
		actionType: action.type || 'custom',
		preset: action.preset || 'fadeUp',
		presetOptions,
		...(motion ? { motion } : {}),
		className: action.className || '',
		listenEventName: isListen ? when.eventName || '' : '',
		listenPhase: isListen ? when.phase || 'start' : 'start',
		emitEventName: action.eventName || '',
		emitPhase:
			action.phase || (action.type === 'emit' ? 'start' : 'end'),
		applyTo: action.applyTo || '',
		scrollY: Number(when.scrollY) >= 0 ? Number(when.scrollY) : 80,
		parallax: Number(when.parallax) || 0,
		callbacks: customCallbacks,
	};

	return compiled;
}

export function compileList(list, scope) {
	if (!Array.isArray(list)) return [];
	return list
		.map((item) => compileInteraction({ ...item, scope: item.scope || scope }))
		.filter(Boolean);
}
