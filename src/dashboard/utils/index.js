import { applyFilters } from '@wordpress/hooks';
import { addQueryArgs, getQueryArgs, removeQueryArgs } from '@wordpress/url';
import {
	blocks as blocksIcon,
	layoutDashboard,
	packageIcon,
	plugIcon,
	settingsIcon,
	zap,
} from '../../components/icons/block-icons';

export const SIDEBAR_MENUS = [
	{ key: 'dashboard', label: 'Dashboard', icon: layoutDashboard },
	{ key: 'blocks', label: 'Blocks', icon: blocksIcon },
	{ key: 'extensions', label: 'Extensions', icon: plugIcon },
	{ key: 'mcp-config', label: 'MCP Server', icon: zap },
	{ key: 'settings', label: 'Settings', icon: settingsIcon },
	// Always last — buy add-ons + activate licenses live here (not Plugins row).
	{
		key: 'addons',
		label: 'Addons & License',
		hint: 'Buy add-ons · Activate keys',
		icon: packageIcon,
	},
	// { key: 'integrations', label: 'Integrations', icon: plugIcon },
];

/**
 * Keep Addons pinned under every other sidebar item (including filter-injected ones).
 *
 * @param {Array} menus Sidebar menu definitions.
 * @return {Array}
 */
export function orderSidebarMenus(menus = []) {
	const list = Array.isArray(menus) ? [ ...menus ] : [];
	const addons = list.find( ( menu ) => menu?.key === 'addons' );
	const rest = list.filter( ( menu ) => menu?.key !== 'addons' );
	return addons ? [ ...rest, addons ] : rest;
}

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
};

export function isValidMenu(menuKey) {
	const menus = orderSidebarMenus(
		applyFilters('blockish.dashboard.sidebarMenus', SIDEBAR_MENUS)
	);
	return menus.some((menu) => menu.key === menuKey);
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
