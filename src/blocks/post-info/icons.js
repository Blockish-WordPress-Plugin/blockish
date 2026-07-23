/**
 * Default meta icons as BlockishIconPicker-compatible objects.
 */
export const DEFAULT_ICONS = {
	author: {
		viewBox: [ 0, 0, 24, 24 ],
		path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
	},
	date: {
		viewBox: [ 0, 0, 24, 24 ],
		path: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z',
	},
	modified: {
		viewBox: [ 0, 0, 24, 24 ],
		path: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
	},
	time: {
		viewBox: [ 0, 0, 24, 24 ],
		path: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
	},
	comments: {
		viewBox: [ 0, 0, 24, 24 ],
		path: 'M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z',
	},
	terms: {
		viewBox: [ 0, 0, 24, 24 ],
		path: 'M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z',
	},
	'reading-time': {
		viewBox: [ 0, 0, 24, 24 ],
		path: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm0 16V14.5l5.5-3.5L17 14.5V20H6z',
	},
	'word-count': {
		viewBox: [ 0, 0, 24, 24 ],
		path: 'M2.5 4v3h5v12h3V7h5V4H2.5zM21.5 9h-9v3h3v7h3v-7h3V9z',
	},
};

export const TYPE_OPTIONS = [
	{ value: 'author', label: 'Author' },
	{ value: 'date', label: 'Date' },
	{ value: 'modified', label: 'Modified' },
	{ value: 'time', label: 'Time' },
	{ value: 'comments', label: 'Comments' },
	{ value: 'terms', label: 'Terms' },
	{ value: 'reading-time', label: 'Reading Time' },
	{ value: 'word-count', label: 'Word Count' },
];

export const ICON_STYLE_OPTIONS = [
	{ value: 'none', label: 'None' },
	{ value: 'default', label: 'Default' },
	{ value: 'custom', label: 'Custom' },
];

export const DATE_FORMAT_OPTIONS = [
	{ value: 'default', label: 'Default' },
	{ value: 'F j, Y', label: 'F j, Y' },
	{ value: 'Y-m-d', label: 'Y-m-d' },
	{ value: 'm/d/Y', label: 'm/d/Y' },
	{ value: 'd/m/Y', label: 'd/m/Y' },
	{ value: 'M j, Y', label: 'M j, Y' },
];

export const TIME_FORMAT_OPTIONS = [
	{ value: 'default', label: 'Default' },
	{ value: 'g:i a', label: 'g:i a' },
	{ value: 'g:i A', label: 'g:i A' },
	{ value: 'H:i', label: 'H:i' },
];

export const TAXONOMY_OPTIONS = [
	{ value: 'category', label: 'Categories' },
	{ value: 'post_tag', label: 'Tags' },
];

export function getItemType( item ) {
	return item?.type?.value || item?.type || 'date';
}

export function getIconStyle( item ) {
	return item?.icon?.value || item?.icon || 'default';
}

export function createDefaultItem( type = 'author' ) {
	const typeOption =
		TYPE_OPTIONS.find( ( option ) => option.value === type ) ||
		TYPE_OPTIONS[ 0 ];

	return {
		type: typeOption,
		beforeText: '',
		link: true,
		icon: ICON_STYLE_OPTIONS[ 1 ],
		showAvatar: false,
		avatarSize: 16,
		dateFormat: DATE_FORMAT_OPTIONS[ 0 ],
		timeFormat: TIME_FORMAT_OPTIONS[ 0 ],
		taxonomy: TAXONOMY_OPTIONS[ 0 ],
		termsCount: 3,
		termsSeparator: ', ',
		wordsPerMinute: 200,
	};
}
