import { __ } from '@wordpress/i18n';
import { PRESETS } from './constants';
import { normalizeInteraction } from './compile';

const eventLabels = {
	ready: __('On page load', 'blockish'),
	init: __('On page load', 'blockish'),
	click: __('On click', 'blockish'),
	mouseenter: __('On hover', 'blockish'),
	focus: __('On focus', 'blockish'),
	inView: __('When visible', 'blockish'),
	scroll: __('After scroll', 'blockish'),
	scrollProgress: __('While scrolling', 'blockish'),
	listen: __('Waits for a name', 'blockish'),
};

const phaseLabel = (phase) => {
	if (phase === 'end') return __('finishes', 'blockish');
	if (phase === 'any') return __('starts or finishes', 'blockish');
	return __('starts', 'blockish');
};

export function summarizeInteraction(raw) {
	const item = normalizeInteraction(raw);
	if (!item) return __('Interaction', 'blockish');

	const { when, action } = item;
	let whenLabel = '';

	if (when.source === 'listen') {
		whenLabel = `${__('Waits for', 'blockish')} “${when.eventName || '?'}” (${phaseLabel(when.phase)})`;
	} else {
		whenLabel = eventLabels[when.event] || when.event || __('Trigger', 'blockish');
	}

	let actionLabel = '';
	if (action.type === 'emit') {
		actionLabel = `${__('Sends', 'blockish')} “${action.eventName || '?'}” (${phaseLabel(action.phase)})`;
	} else if (action.type === 'preset') {
		const preset = PRESETS.find((p) => p.id === action.preset);
		actionLabel = preset?.label || __('Animation', 'blockish');
	} else if (action.type === 'toggleClass') {
		const cls = String(action.className || '')
			.replace(/^\./, '')
			.trim();
		actionLabel = cls
			? `${__('Toggle', 'blockish')} .${cls}`
			: __('Toggle a class', 'blockish');
	} else if (action.type === 'show') {
		actionLabel = __('Show', 'blockish');
	} else if (action.type === 'hide') {
		actionLabel = __('Hide', 'blockish');
	} else if (action.type === 'toggle') {
		actionLabel = __('Toggle visibility', 'blockish');
	} else {
		actionLabel = __('Custom code', 'blockish');
	}

	return {
		title: item.title?.trim() || '',
		whenLabel,
		actionLabel,
		line: item.title?.trim()
			? `${item.title.trim()}`
			: `${whenLabel} → ${actionLabel}`,
		detail: `${whenLabel} → ${actionLabel}`,
	};
}

export function collectEventNames(lists = []) {
	const names = new Set();
	lists.flat().forEach((raw) => {
		const item = normalizeInteraction(raw);
		if (!item) return;
		if (item.action.type === 'emit' && item.action.eventName) {
			names.add(item.action.eventName);
		}
		if (item.when.source === 'listen' && item.when.eventName) {
			names.add(item.when.eventName);
		}
		if (raw.emitEventName) names.add(raw.emitEventName);
		if (raw.listenEventName) names.add(raw.listenEventName);
	});
	return Array.from(names).sort();
}
