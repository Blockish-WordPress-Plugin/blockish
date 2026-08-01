/**
 * Shared defaults for a polished out-of-the-box carousel slide.
 */

export const DEFAULT_SLIDE_BACKGROUND =
	'{"backgroundType":"gradient","gradient":"linear-gradient(145deg, #0f172a 0%, #1e293b 52%, #334155 100%)"}';

export const DEFAULT_SLIDE_BACKGROUNDS = [
	'{"backgroundType":"gradient","gradient":"linear-gradient(145deg, #0f172a 0%, #1e293b 52%, #334155 100%)"}',
	'{"backgroundType":"gradient","gradient":"linear-gradient(145deg, #1c1917 0%, #292524 50%, #44403c 100%)"}',
	'{"backgroundType":"gradient","gradient":"linear-gradient(145deg, #0c4a6e 0%, #155e75 48%, #164e63 100%)"}',
];

export const DEFAULT_SLIDE_PADDING = {
	Desktop: {
		top: '48px',
		right: '40px',
		bottom: '48px',
		left: '40px',
	},
	Tablet: {
		top: '40px',
		right: '28px',
		bottom: '40px',
		left: '28px',
	},
	Mobile: {
		top: '32px',
		right: '20px',
		bottom: '32px',
		left: '20px',
	},
};

export const DEFAULT_SLIDE_ATTRS = {
	minHeight: {
		Desktop: '360px',
		Tablet: '320px',
		Mobile: '280px',
	},
	padding: DEFAULT_SLIDE_PADDING,
	flexDirection: {
		Desktop: { label: 'Column', value: 'column' },
	},
	alignItems: {
		Desktop: { label: 'Center', value: 'center' },
	},
	justifyContent: {
		Desktop: { label: 'Center', value: 'center' },
	},
	gap: {
		Desktop: '16px',
	},
	slideBackground: DEFAULT_SLIDE_BACKGROUND,
};

export function getDefaultSlideAttrs( index = 0 ) {
	return {
		...DEFAULT_SLIDE_ATTRS,
		slideBackground:
			DEFAULT_SLIDE_BACKGROUNDS[ index % DEFAULT_SLIDE_BACKGROUNDS.length ],
	};
}
