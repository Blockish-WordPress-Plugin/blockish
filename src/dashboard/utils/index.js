import { applyFilters } from '@wordpress/hooks';
import { addQueryArgs, getQueryArgs, removeQueryArgs } from '@wordpress/url';
import { layout } from '@wordpress/icons';
import {
	blocks as blocksIcon,
	layoutDashboard,
	packageIcon,
	plugIcon,
	settingsIcon,
	zap,
} from '../../components/icons/block-icons';

export { settingsIcon };

export const THEME_BUILDER_MENU_KEY = 'theme-builder';

export const SIDEBAR_MENUS = [
	{ key: 'dashboard', label: 'Dashboard', icon: layoutDashboard },
	{ key: 'blocks', label: 'Blocks', icon: blocksIcon },
	{ key: 'extensions', label: 'Extensions', icon: plugIcon },
	{ key: 'mcp-config', label: 'MCP Server', icon: zap },
	{ key: 'settings', label: 'Settings', icon: settingsIcon },
	// Pinned just above Forms via orderSidebarMenus.
	{ key: 'integrations', label: 'Integrations', icon: plugIcon },
];

export function isThemeBuilderExtensionActive(extensions = {}) {
	const tb = extensions?.[THEME_BUILDER_MENU_KEY];
	if (!tb || tb.unavailable) {
		return false;
	}
	return tb.status === 'active';
}

/**
 * Inject Theme Builder after Extensions when that extension is enabled.
 *
 * @param {Array}  menus
 * @param {Object} extensions
 * @return {Array}
 */
export function withThemeBuilderMenu(menus = [], extensions = {}) {
	const list = (Array.isArray(menus) ? menus : []).filter(
		(menu) => menu?.key !== THEME_BUILDER_MENU_KEY
	);

	if (!isThemeBuilderExtensionActive(extensions)) {
		return list;
	}

	const item = {
		key: THEME_BUILDER_MENU_KEY,
		label: 'Theme Builder',
		icon: layout,
		callback: () => {
			const url = window.blockishThemeBuilderAdmin?.listUrl;
			if (url) {
				window.location.href = url;
			}
		},
	};

	const extensionsIndex = list.findIndex((menu) => menu?.key === 'extensions');
	if (extensionsIndex >= 0) {
		list.splice(extensionsIndex + 1, 0, item);
	} else {
		list.push(item);
	}

	return list;
}

/**
 * Pin Integrations → Forms at the bottom of the sidebar.
 * Filter-injected menus (e.g. Forms) stay just under Integrations.
 *
 * @param {Array} menus Sidebar menu definitions.
 * @return {Array}
 */
export function orderSidebarMenus(menus = []) {
	const list = Array.isArray(menus) ? [ ...menus ] : [];
	const take = ( key ) => list.find( ( menu ) => menu?.key === key );
	const integrations = take( 'integrations' );
	const forms = take( 'forms' );
	const rest = list.filter(
		( menu ) =>
			! [ 'integrations', 'forms' ].includes( menu?.key )
	);

	return [
		...rest,
		...( integrations ? [ integrations ] : [] ),
		...( forms ? [ forms ] : [] ),
	];
}

export function getSidebarMenus(extensions = {}) {
	return orderSidebarMenus(
		withThemeBuilderMenu(
			applyFilters('blockish.dashboard.sidebarMenus', SIDEBAR_MENUS),
			extensions
		)
	);
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

export function isValidMenu(menuKey, extensions = {}) {
	return getSidebarMenus(extensions).some((menu) => menu.key === menuKey);
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
