import { __ } from '@wordpress/i18n';
import { PRESET_ANIMATE } from './animate-defaults';
import { cssOptsToTween } from './motion';

export { PRESET_ANIMATE };

export const PRESETS = [
	{ id: 'fadeIn', label: __('Fade in', 'blockish'), hint: __('Gently appears', 'blockish') },
	{ id: 'fadeUp', label: __('Rise up', 'blockish'), hint: __('Fades in from below', 'blockish') },
	{ id: 'fadeDown', label: __('Drop in', 'blockish'), hint: __('Fades in from above', 'blockish') },
	{ id: 'fadeLeft', label: __('Slide from right', 'blockish'), hint: __('Moves in from the right', 'blockish') },
	{ id: 'fadeRight', label: __('Slide from left', 'blockish'), hint: __('Moves in from the left', 'blockish') },
	{ id: 'zoomIn', label: __('Zoom in', 'blockish'), hint: __('Scales up into place', 'blockish') },
	{ id: 'custom', label: __('Custom', 'blockish'), hint: __('Add only the properties you need', 'blockish') },
];

export const EASING_OPTIONS = [
	{ label: __('Smooth', 'blockish'), value: 'power1.inOut' },
	{ label: __('Ease out', 'blockish'), value: 'power2.out' },
	{ label: __('Ease in', 'blockish'), value: 'power2.in' },
	{ label: __('Ease in-out', 'blockish'), value: 'power2.inOut' },
	{ label: __('Linear', 'blockish'), value: 'none' },
	{ label: __('Snap', 'blockish'), value: 'expo.out' },
];

export const getPresetAnimate = (presetId) => ({
	...(PRESET_ANIMATE[presetId] || PRESET_ANIMATE.custom),
});

export const DOM_EVENTS = [
	{ label: __('Load', 'blockish'), hint: __('When the page loads', 'blockish'), value: 'ready' },
	{ label: __('Click', 'blockish'), hint: __('When clicked', 'blockish'), value: 'click' },
	{ label: __('Hover', 'blockish'), hint: __('When hovered', 'blockish'), value: 'mouseenter' },
	{ label: __('Focus', 'blockish'), hint: __('When focused', 'blockish'), value: 'focus' },
	{ label: __('In view', 'blockish'), hint: __('When it scrolls into view', 'blockish'), value: 'inView' },
	{ label: __('Page scroll', 'blockish'), hint: __('After the page scrolls past a distance', 'blockish'), value: 'scroll' },
	{ label: __('While scroll', 'blockish'), hint: __('While this block moves through the viewport', 'blockish'), value: 'scrollProgress' },
];

export const SOURCE_OPTIONS = [
	{
		value: 'dom',
		label: __('Start here', 'blockish'),
		description: __('Click, hover, load, or scroll on this block', 'blockish'),
	},
	{
		value: 'listen',
		label: __('Wait for a name', 'blockish'),
		description: __('Run when another interaction broadcasts that name', 'blockish'),
	},
];

export const DEFAULT_PRESET_OPTIONS = {
	duration: 0.6,
	delay: 0,
	once: true,
	stagger: 0,
};

export const ACTION_TYPES = [
	{
		value: 'preset',
		label: __('Play an animation', 'blockish'),
		description: __('Move, fade, scale, rotate — fully customizable', 'blockish'),
	},
	{
		value: 'visibility',
		label: __('Show or hide', 'blockish'),
		description: __('Reveal, hide, or toggle visibility', 'blockish'),
	},
	{
		value: 'toggleClass',
		label: __('Toggle a class', 'blockish'),
		description: __('Add or remove a CSS class', 'blockish'),
	},
	{
		value: 'emit',
		label: __('Name only', 'blockish'),
		description: __('No animation — just broadcast a name others can wait for', 'blockish'),
	},
	{
		value: 'custom',
		label: __('Custom code', 'blockish'),
		description: __('For advanced JavaScript', 'blockish'),
	},
];

export const VISIBILITY_MODES = [
	{ value: 'show', label: __('Show', 'blockish') },
	{ value: 'hide', label: __('Hide', 'blockish') },
	{ value: 'toggle', label: __('Toggle', 'blockish') },
];

export const PHASE_OPTIONS = [
	{ label: __('When it finishes', 'blockish'), value: 'end' },
	{ label: __('When it starts', 'blockish'), value: 'start' },
];

export const LISTEN_PHASE_OPTIONS = [
	{ label: __('When that name finishes', 'blockish'), value: 'end' },
	{ label: __('When that name starts', 'blockish'), value: 'start' },
	{ label: __('Either', 'blockish'), value: 'any' },
];

export const CUSTOM_JS_PLACEHOLDER = `// event — the trigger (click, hover, in-view, …)
// blockElement — current target:
//   Inner target empty  → this block
//   Inner target filled → that child (e.g. .hero-image)
//
// blockElement.classList.add('is-active');
`;

export const isBlankCustomJs = (code) => {
	const text = typeof code === 'string' ? code.trim() : '';
	return ! text || text === CUSTOM_JS_PLACEHOLDER.trim();
};

export const createEmptyInteraction = (scope = 'block') => {
	const fadeUp = { ...DEFAULT_PRESET_OPTIONS, ...PRESET_ANIMATE.fadeUp };
	return {
		id: `ix_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
		title: '',
		scope,
		when: {
			source: 'dom',
			event: 'ready',
			selector: '',
			eventName: '',
			phase: 'start',
			scrollY: 80,
			parallax: 0,
		},
		action: {
			type: 'preset',
			preset: 'fadeUp',
			presetOptions: fadeUp,
			motion: { tweens: [cssOptsToTween(fadeUp)] },
			eventName: '',
			phase: 'end',
			applyTo: '',
			className: '',
			callbacks: [''],
		},
	};
};
