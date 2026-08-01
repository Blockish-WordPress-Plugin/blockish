import { __ } from '@wordpress/i18n';

export const PRESETS = [
	{ id: 'fadeIn', label: __('Fade in', 'blockish'), hint: __('Gently appears', 'blockish') },
	{ id: 'fadeUp', label: __('Rise up', 'blockish'), hint: __('Fades in from below', 'blockish') },
	{ id: 'fadeDown', label: __('Drop in', 'blockish'), hint: __('Fades in from above', 'blockish') },
	{ id: 'fadeLeft', label: __('Slide from right', 'blockish'), hint: __('Moves in from the right', 'blockish') },
	{ id: 'fadeRight', label: __('Slide from left', 'blockish'), hint: __('Moves in from the left', 'blockish') },
	{ id: 'zoomIn', label: __('Zoom in', 'blockish'), hint: __('Scales up into place', 'blockish') },
];

export const DOM_EVENTS = [
	{ label: __('When the page loads', 'blockish'), value: 'ready' },
	{ label: __('When clicked', 'blockish'), value: 'click' },
	{ label: __('When hovered', 'blockish'), value: 'mouseenter' },
	{ label: __('When focused', 'blockish'), value: 'focus' },
	{ label: __('When it scrolls into view', 'blockish'), value: 'inView' },
];

export const SOURCE_OPTIONS = [
	{
		value: 'dom',
		label: __('A page action', 'blockish'),
		description: __('Load, click, hover, or scroll into view', 'blockish'),
	},
	{
		value: 'listen',
		label: __('A signal from another block', 'blockish'),
		description: __('Starts when something else sends a named signal', 'blockish'),
	},
];

export const ACTION_TYPES = [
	{
		value: 'preset',
		label: __('Play an animation', 'blockish'),
		description: __('Fade, slide, or zoom in', 'blockish'),
	},
	{
		value: 'emit',
		label: __('Send a signal', 'blockish'),
		description: __('Tell other blocks to react', 'blockish'),
	},
	{
		value: 'custom',
		label: __('Custom code', 'blockish'),
		description: __('For advanced JavaScript', 'blockish'),
	},
];

export const PHASE_OPTIONS = [
	{ label: __('When it starts', 'blockish'), value: 'start' },
	{ label: __('When it finishes', 'blockish'), value: 'end' },
];

export const LISTEN_PHASE_OPTIONS = [
	{ label: __('When it starts', 'blockish'), value: 'start' },
	{ label: __('When it finishes', 'blockish'), value: 'end' },
	{ label: __('Either', 'blockish'), value: 'any' },
];

export const DEFAULT_PRESET_OPTIONS = {
	duration: 600,
	delay: 0,
	once: true,
};

export const createEmptyInteraction = (scope = 'block') => ({
	id: `ix_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
	title: '',
	scope,
	when: {
		source: 'dom',
		event: 'ready',
		selector: '',
		eventName: '',
		phase: 'start',
	},
	action: {
		type: 'preset',
		preset: 'fadeUp',
		presetOptions: { ...DEFAULT_PRESET_OPTIONS },
		eventName: '',
		phase: 'start',
		callbacks: [''],
	},
});
