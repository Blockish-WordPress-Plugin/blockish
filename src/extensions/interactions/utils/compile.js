import { DEFAULT_PRESET_OPTIONS } from './constants';

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
		};

		const action = {
			type: raw.action?.type || raw.actionType || (raw.callbacks?.length ? 'custom' : 'preset'),
			preset: raw.action?.preset || raw.preset || 'fadeUp',
			presetOptions: {
				...DEFAULT_PRESET_OPTIONS,
				...(raw.action?.presetOptions || raw.presetOptions || {}),
			},
			eventName: raw.action?.eventName || raw.emitEventName || '',
			phase: raw.action?.phase || raw.emitPhase || 'start',
			callbacks: Array.isArray(raw.action?.callbacks)
				? raw.action.callbacks
				: Array.isArray(raw.callbacks)
					? raw.callbacks
					: [''],
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
		},
		action: {
			type: 'custom',
			preset: 'fadeUp',
			presetOptions: { ...DEFAULT_PRESET_OPTIONS },
			eventName: '',
			phase: 'start',
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
	const isListen = when.source === 'listen';

	let event = when.event || 'ready';
	if (isListen) {
		event = 'listen';
	}

	const compiled = {
		id: normalized.id,
		title: normalized.title || '',
		scope: normalized.scope || 'block',
		when: { ...when },
		action: {
			...action,
			presetOptions: { ...DEFAULT_PRESET_OPTIONS, ...(action.presetOptions || {}) },
			callbacks: Array.isArray(action.callbacks) ? action.callbacks : [''],
		},
		// Flat runtime fields
		event,
		selector: when.selector || '',
		actionType: action.type || 'custom',
		preset: action.preset || 'fadeUp',
		presetOptions: { ...DEFAULT_PRESET_OPTIONS, ...(action.presetOptions || {}) },
		listenEventName: isListen ? when.eventName || '' : '',
		listenPhase: isListen ? when.phase || 'start' : 'start',
		emitEventName: action.type === 'emit' ? action.eventName || '' : '',
		emitPhase: action.type === 'emit' ? action.phase || 'start' : 'start',
		callbacks: [],
	};

	if (action.type === 'custom') {
		compiled.callbacks = (action.callbacks || []).filter(
			(c) => typeof c === 'string' && c.trim() !== ''
		);
	}

	return compiled;
}

export function compileList(list, scope) {
	if (!Array.isArray(list)) return [];
	return list
		.map((item) => compileInteraction({ ...item, scope: item.scope || scope }))
		.filter(Boolean);
}
