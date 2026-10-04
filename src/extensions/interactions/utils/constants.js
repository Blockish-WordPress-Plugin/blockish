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
	{ label: __('Page load', 'blockish'), hint: __('When the page finishes loading', 'blockish'), value: 'ready' },
	{ label: __('Click', 'blockish'), hint: __('When clicked', 'blockish'), value: 'click' },
	{ label: __('Hover', 'blockish'), hint: __('When hovered with mouse', 'blockish'), value: 'mouseenter' },
	{ label: __('Focus', 'blockish'), hint: __('When focused by click or tab', 'blockish'), value: 'focus' },
	{ label: __('Scroll into view', 'blockish'), hint: __('When it scrolls into view', 'blockish'), value: 'inView' },
	{ label: __('Page scroll', 'blockish'), hint: __('After the page scrolls past a distance', 'blockish'), value: 'scroll' },
	{ label: __('While scrolling', 'blockish'), hint: __('Continuous progress as element scrolls', 'blockish'), value: 'scrollProgress' },
];

export const SOURCE_OPTIONS = [
	{
		value: 'dom',
		label: __('User action', 'blockish'),
		description: __('Click, hover, scroll, or page load on this block', 'blockish'),
	},
	{
		value: 'listen',
		label: __('Listen event', 'blockish'),
		description: __('Listen for an event triggered by another block', 'blockish'),
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
		description: __('Move, fade, scale, rotate, 3D, and effects', 'blockish'),
	},
	{
		value: 'visibility',
		label: __('Show or hide', 'blockish'),
		description: __('Reveal, hide, or toggle element visibility', 'blockish'),
	},
	{
		value: 'toggleClass',
		label: __('Toggle CSS class', 'blockish'),
		description: __('Add or remove a CSS class', 'blockish'),
	},
	{
		value: 'emit',
		label: __('Trigger custom event', 'blockish'),
		description: __('Broadcast an event for other blocks to react to', 'blockish'),
	},
	{
		value: 'custom',
		label: __('Custom JavaScript', 'blockish'),
		description: __('Execute custom JavaScript code', 'blockish'),
	},
];

export const VISIBILITY_MODES = [
	{ value: 'show', label: __('Show', 'blockish') },
	{ value: 'hide', label: __('Hide', 'blockish') },
	{ value: 'toggle', label: __('Toggle', 'blockish') },
];

export const PHASE_OPTIONS = [
	{ label: __('When animation finishes', 'blockish'), value: 'end' },
	{ label: __('When animation starts', 'blockish'), value: 'start' },
];

export const LISTEN_PHASE_OPTIONS = [
	{ label: __('When event finishes', 'blockish'), value: 'end' },
	{ label: __('When event starts', 'blockish'), value: 'start' },
	{ label: __('On start or finish', 'blockish'), value: 'any' },
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
