import { addQueryArgs, getQueryArgs, removeQueryArgs } from '@wordpress/url';
import { plugins } from '@wordpress/icons';
import {
	blocks as blocksIcon,
	keyIcon,
	layoutDashboard,
	packageIcon,
	plugIcon,
	settingsIcon,
} from '../../components/icons/block-icons';

export const SIDEBAR_MENUS = [
	{ key: 'dashboard', label: 'Dashboard', icon: layoutDashboard },
	{ key: 'blocks', label: 'Blocks', icon: blocksIcon },
	{ key: 'extensions', label: 'Extensions', icon: plugIcon },
	// { key: 'settings', label: 'Settings', icon: settingsIcon },
	// { key: 'integrations', label: 'Integrations', icon: plugIcon },
	// { key: 'addons', label: 'Addons', icon: packageIcon },
	// { key: 'license', label: 'License', icon: keyIcon },
];

export const BLOCK_FILTERS = [
	{ key: 'all', label: 'All' },
	{ key: 'layout', label: 'Layout' },
	{ key: 'content', label: 'Content' },
	{ key: 'media', label: 'Media' },
	{ key: 'interactive', label: 'Interactive' },
];

export const EXTENSION_FILTERS = [
	{ key: 'all', label: 'All' },
	{ key: 'general', label: 'General' },
	{ key: 'animation', label: 'Animation' },
];

export const EXTENSION_CONTROL_MAP = {
	interactions: {
		title: 'Interactions Controls',
		controls: [
			{ key: 'enableViewportAnimation', type: 'toggle', label: 'Enable viewport animation' },
			{ key: 'defaultDelay', type: 'text', label: 'Default animation delay (ms)' },
		],
	},
	'wrapper-link': {
		title: 'Wrapper Link Controls',
		controls: [
			{ key: 'openInNewTabByDefault', type: 'toggle', label: 'Open links in new tab by default' },
			{ key: 'relAttributes', type: 'text', label: 'Default rel attributes' },
		],
	},
};

export function isValidMenu(menuKey) {
	return SIDEBAR_MENUS.some((menu) => menu.key === menuKey);
}

export function getBlockCategoryKey(item = {}, slug = '') {
	const provided = item?.category;
	if (provided && BLOCK_FILTERS.some((filter) => filter.key === provided)) {
		return provided;
	}

	const text = `${slug} ${item?.name || ''}`.toLowerCase();

	if (/(image|video|gallery|media|map)/.test(text)) {
		return 'media';
	}

	if (/(accordion|tab|toggle|slider|modal|tooltip)/.test(text)) {
		return 'interactive';
	}

	if (/(container|section|row|column|grid|layout|timeline)/.test(text)) {
		return 'layout';
	}

	return 'content';
}

export function isChildBlock(item = {}) {
	return Boolean(item?.parent);
}

export function getExtensionCategoryKey(item = {}, slug = '') {
	const provided = (item?.category || '').toLowerCase();
	if (provided && EXTENSION_FILTERS.some((filter) => filter.key === provided)) {
		return provided;
	}

	const text = `${slug} ${item?.name || ''} ${item?.description || ''}`.toLowerCase();
	if (/(animation|animate|interaction|motion|transition|viewport)/.test(text)) {
		return 'animation';
	}

	return 'general';
}

export function buildStats(items = {}, options = {}) {
	const { ignoreChildBlocks = false } = options;
	const values = Object.values(items || {});
	let active = 0;
	let inactive = 0;

	values.forEach((item) => {
		if (ignoreChildBlocks && isChildBlock(item)) {
			return;
		}

		if ((item?.status || 'active') === 'inactive') {
			inactive++;
			return;
		}
		active++;
	});

	return {
		total: values.length,
		active,
		inactive,
	};
}

export function getLocationWithParams(location) {
	const searchParams = new URLSearchParams(location.search || '');
	return {
		...location,
		params: Object.fromEntries(searchParams.entries()),
	};
}

export function buildHistoryUrl(params = {}) {
	const currentArgs = getQueryArgs(window.location.href);
	const nextArgs = {
		...currentArgs,
		...params,
	};

	const currentUrlWithoutArgs = removeQueryArgs(window.location.href, ...Object.keys(currentArgs));
	return addQueryArgs(currentUrlWithoutArgs, nextArgs);
}
