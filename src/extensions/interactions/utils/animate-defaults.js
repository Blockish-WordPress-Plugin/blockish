/**
 * Motion seeds for preset ids. Only the properties the preset actually uses.
 */

export const PRESET_ANIMATE = {
	fadeIn: { fromOpacity: 0, toOpacity: 100, easing: 'ease' },
	fadeUp: { fromY: 40, toY: 0, fromOpacity: 0, toOpacity: 100, easing: 'ease' },
	fadeDown: { fromY: -40, toY: 0, fromOpacity: 0, toOpacity: 100, easing: 'ease' },
	fadeLeft: { fromX: 40, toX: 0, fromOpacity: 0, toOpacity: 100, easing: 'ease' },
	fadeRight: { fromX: -40, toX: 0, fromOpacity: 0, toOpacity: 100, easing: 'ease' },
	zoomIn: { fromScale: 85, toScale: 100, fromOpacity: 0, toOpacity: 100, easing: 'ease' },
	custom: { easing: 'ease' },
};

export const ALLOWED_EASING = [
	'ease',
	'ease-in',
	'ease-out',
	'ease-in-out',
	'linear',
	'cubic-bezier(0.22, 1, 0.36, 1)',
	'power1.inOut',
	'power2.in',
	'power2.out',
	'power2.inOut',
	'none',
	'expo.out',
];
