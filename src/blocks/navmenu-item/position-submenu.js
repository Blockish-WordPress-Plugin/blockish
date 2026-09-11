import { acquireFixedEscape } from './fixed-escape';

const BRIDGE = 8;
const MARGIN = 8;

const ITEM_SELECTOR =
	':scope > .blockish-block-navmenu-item, :scope > .wp-block-blockish-navmenu-item';

/**
 * Same-level navmenu item siblings (editor + frontend list markup).
 *
 * @param {HTMLElement} item
 * @return {HTMLElement[]} List of sibling items.
 */
export function getNavmenuItemSiblings( item ) {
	const list = item?.parentElement;
	if ( ! list ) {
		return [];
	}
	return Array.from( list.querySelectorAll( ITEM_SELECTOR ) );
}

/**
 * Mark which item is open in this list (editor React sync via data attr).
 *
 * @param {HTMLElement} item
 * @param {string}      id   clientId
 */
export function setListOpenSubmenuId( item, id ) {
	const list = item?.parentElement;
	if ( ! list || ! id ) {
		return;
	}
	list.dataset.blockishOpenSubmenu = id;
}

/**
 * Clear list open id only if this item still owns it.
 *
 * @param {HTMLElement} item
 * @param {string}      id   clientId
 */
export function clearListOpenSubmenuId( item, id ) {
	const list = item?.parentElement;
	if ( ! list || ! id ) {
		return;
	}
	if ( list.dataset.blockishOpenSubmenu === id ) {
		delete list.dataset.blockishOpenSubmenu;
	}
}

/**
 * Close other open submenus at the same level via class / callback.
 *
 * @param {HTMLElement}               item
 * @param {(el: HTMLElement) => void} closeFn
 */
export function closeSiblingNavmenuSubmenus( item, closeFn ) {
	if ( ! closeFn ) {
		return;
	}
	getNavmenuItemSiblings( item ).forEach( ( sibling ) => {
		if ( sibling === item ) {
			return;
		}
		if (
			sibling.classList.contains( 'has-submenu' ) &&
			sibling.classList.contains( 'is-submenu-open' )
		) {
			closeFn( sibling );
		}
	} );
}

/**
 * Find nearest ancestor that forms a containing block for position:fixed.
 *
 * @param {HTMLElement|null} el
 * @return {HTMLElement|null} Containing block element or null.
 */
function getFixedContainingBlock( el ) {
	const win = el?.ownerDocument?.defaultView || window;
	let node = el?.parentElement || null;

	while ( node && node !== el.ownerDocument.documentElement ) {
		const style = win.getComputedStyle( node );
		const transform = style.transform;
		const filter = style.filter;
		const perspective = style.perspective;
		const contain = style.contain || '';
		const willChange = style.willChange || '';
		const backdrop =
			style.backdropFilter || style.webkitBackdropFilter || 'none';

		if (
			( transform && transform !== 'none' ) ||
			( filter && filter !== 'none' ) ||
			( perspective && perspective !== 'none' ) ||
			contain.split( ' ' ).includes( 'paint' ) ||
			willChange.includes( 'transform' ) ||
			( backdrop && backdrop !== 'none' )
		) {
			return node;
		}

		node = node.parentElement;
	}

	return null;
}

/**
 * @param {HTMLElement} el
 * @param {number}      top
 * @param {number}      left
 * @return {{ top: number, left: number }} Adjusted coordinates.
 */
function toContainingBlockCoords( el, top, left ) {
	const cb = getFixedContainingBlock( el );
	if ( ! cb ) {
		return { top, left };
	}
	const rect = cb.getBoundingClientRect();
	return {
		top: top - rect.top,
		left: left - rect.left,
	};
}

/**
 * Read a CSS length from data attrs (string or responsive Desktop value).
 *
 * @param {string|undefined} raw
 * @param {number}           refPx Reference for % values.
 * @return {number} Pixel length.
 */
function parseLengthPx( raw, refPx = 0 ) {
	if ( raw == null || raw === '' ) {
		return 0;
	}
	const str = String( raw ).trim();
	if ( ! str ) {
		return 0;
	}
	const n = parseFloat( str );
	if ( Number.isNaN( n ) ) {
		return 0;
	}
	if ( str.endsWith( '%' ) ) {
		return ( refPx * n ) / 100;
	}
	return n;
}

/**
 * Nesting depth for z-index — walk parents instead of scanning the whole subtree.
 *
 * @param {HTMLElement} item
 * @return {number} Depth count.
 */
function getNavmenuItemDepth( item ) {
	let depth = 0;
	let node = item?.parentElement || null;
	while ( node ) {
		if ( node.classList?.contains( 'blockish-navmenu-item-children' ) ) {
			depth += 1;
		}
		if ( node.classList?.contains( 'blockish-navmenu' ) ) {
			break;
		}
		node = node.parentElement;
	}
	return depth;
}

/**
 * Closest layout box for megamenu width: Navigation block, then navmenu.
 * Never use the page/editor content shell — that is often wider than the nav.
 *
 * @param {HTMLElement} item
 * @return {{ el: HTMLElement|null, rect: { left: number, width: number, right: number, top: number, bottom: number } }}
 */
function getMegamenuLayoutRef( item ) {
	const navigation =
		item.closest( '.blockish-navigation' ) ||
		item.closest( '.blockish-navigation-inner' );
	if ( navigation ) {
		const rect = navigation.getBoundingClientRect();
		return {
			el: navigation,
			rect: {
				left: rect.left,
				width: rect.width,
				right: rect.right,
				top: rect.top,
				bottom: rect.bottom,
			},
		};
	}

	const navmenu = item.closest( '.blockish-navmenu' );
	if ( navmenu ) {
		const rect = navmenu.getBoundingClientRect();
		return {
			el: navmenu,
			rect: {
				left: rect.left,
				width: rect.width,
				right: rect.right,
				top: rect.top,
				bottom: rect.bottom,
			},
		};
	}

	const itemRect = item.getBoundingClientRect();
	return {
		el: null,
		rect: {
			left: itemRect.left,
			width: itemRect.width,
			right: itemRect.right,
			top: itemRect.top,
			bottom: itemRect.bottom,
		},
	};
}

/**
 * Editor canvas clip box (iframe / styles wrapper). Null on frontend.
 *
 * @param {HTMLElement} item
 * @return {{ left: number, right: number, width: number }|null} Clip rect in viewport coords.
 */
function getEditorClipRect( item ) {
	const doc = item?.ownerDocument;
	if ( ! doc ) {
		return null;
	}

	const shell =
		item.closest( '.editor-styles-wrapper' ) ||
		doc.querySelector( '.editor-styles-wrapper' ) ||
		doc.querySelector( '.block-editor-iframe__body .is-root-container' ) ||
		( doc.body?.classList?.contains( 'block-editor-iframe__body' )
			? doc.body
			: null );

	if ( ! shell ) {
		return null;
	}

	const rect = shell.getBoundingClientRect();
	return {
		left: rect.left + MARGIN,
		right: rect.right - MARGIN,
		width: Math.max( rect.width - MARGIN * 2, 100 ),
	};
}

/**
 * Position a mega menu panel: width + left/top from data-* attrs.
 *
 * @param {HTMLElement} item
 * @param {HTMLElement} children
 * @param {HTMLElement} panel   .blockish-navmenu-megamenu
 */
function positionNavmenuMegamenu( item, children, panel ) {
	const win = item.ownerDocument.defaultView || window;
	const itemRect = item.getBoundingClientRect();
	const { rect: navigationRect } = getMegamenuLayoutRef( item );
	const navmenu = item.closest( '.blockish-navmenu' );
	const vw = win.innerWidth;
	const vh = win.innerHeight;
	const depth = getNavmenuItemDepth( item );
	const editorClip = getEditorClipRect( item );

	let widthMode = panel.dataset.widthMode || 'navigation';
	// Legacy modes → navigation.
	if ( ! [ 'navigation', 'full', 'custom' ].includes( widthMode ) ) {
		widthMode = 'navigation';
	}
	const positionAlign = panel.dataset.positionAlign || 'left';
	const alignRelativeTo = panel.dataset.alignRelativeTo || 'navigation';
	const customWidthRaw = panel.dataset.customWidth || '';
	const offsetY = parseLengthPx( panel.dataset.offsetY, vh );
	const offsetX = parseLengthPx( panel.dataset.offsetX, vw );

	let refRect = navigationRect;
	if ( alignRelativeTo === 'item' ) {
		refRect = itemRect;
	} else if ( alignRelativeTo === 'viewport' ) {
		refRect = { left: 0, width: vw, right: vw, top: 0, bottom: vh };
	} else if (
		alignRelativeTo === 'navmenu' ||
		alignRelativeTo === 'navigation'
	) {
		refRect = navigationRect;
	}

	children.classList.add( 'is-submenu-positioned' );
	children.style.display = 'block';
	children.style.position = 'fixed';
	children.style.right = 'auto';
	children.style.bottom = 'auto';
	children.style.zIndex = String( 100000 + depth );
	// Reset any previous overflow cap from a prior open.
	children.style.maxHeight = '';
	children.style.overflowY = '';
	panel.style.maxHeight = '';
	panel.style.overflowY = '';

	// Cap to editor canvas or viewport.
	const maxOuter = editorClip ? editorClip.width : vw;
	let widthPx = navigationRect.width;

	if ( widthMode === 'full' ) {
		// Full width ignores align controls — always edge-to-edge.
		widthPx = maxOuter;
		refRect = editorClip
			? {
					left: editorClip.left,
					width: editorClip.width,
					right: editorClip.right,
					top: 0,
					bottom: vh,
			  }
			: { left: 0, width: vw, right: vw, top: 0, bottom: vh };
	} else if ( widthMode === 'custom' && customWidthRaw ) {
		// Custom width — never exceed the screen / editor canvas (auto 100%).
		// Keep refRect from alignRelativeTo above.
		widthPx = Math.min(
			Math.max( parseLengthPx( customWidthRaw, maxOuter ), 1 ),
			maxOuter
		);
	} else {
		// Navigation width — keep refRect from alignRelativeTo (do not overwrite).
		widthPx = navigationRect.width;
	}

	widthPx = Math.min( Math.max( widthPx, 1 ), maxOuter );

	children.style.width = `${ Math.round( widthPx ) }px`;

	// Flush under the menu row (not a tall content shell / logo column).
	const navList = item.closest( '.blockish-navmenu-nav' );
	const topAnchor = navList || navmenu || item;
	const topAnchorRect = topAnchor.getBoundingClientRect();
	const megaGap = 0;
	let top = topAnchorRect.bottom + megaGap + offsetY;
	const placementY = 'below';
	const availableBelow = Math.max( vh - top - MARGIN, 120 );

	// Content-sized height — scroll the wrapper only if content exceeds the viewport.
	// Do not lock the panel to 100%/overflow; that + flex centering creates a fake top gap.
	const naturalH = Math.max(
		panel.scrollHeight || 0,
		panel.offsetHeight || 0,
		1
	);
	if ( naturalH > availableBelow + 1 ) {
		children.style.maxHeight = `${ Math.round( availableBelow ) }px`;
		children.style.overflowY = 'auto';
	}
	if ( top < MARGIN ) {
		top = MARGIN;
	}

	let left = refRect.left + offsetX;
	if ( widthMode === 'full' ) {
		// True edge-to-edge — do not inset with MARGIN or re-fit width.
		left = ( editorClip ? editorClip.left : 0 ) + offsetX;
		widthPx = editorClip ? editorClip.width : vw;
		children.style.width = `${ Math.round( widthPx ) }px`;
	} else {
		if ( positionAlign === 'center' ) {
			left = refRect.left + ( refRect.width - widthPx ) / 2 + offsetX;
		} else if ( positionAlign === 'right' ) {
			left = refRect.left + refRect.width - widthPx + offsetX;
		}

		const clipLeft = editorClip ? editorClip.left : MARGIN;
		const clipRight = editorClip ? editorClip.right : vw - MARGIN;

		if ( left + widthPx > clipRight ) {
			left = Math.max( clipLeft, clipRight - widthPx );
		}
		if ( left < clipLeft ) {
			left = clipLeft;
		}
		// Re-fit width if still overflowing the editor canvas on the right.
		if ( left + widthPx > clipRight ) {
			widthPx = Math.max( 100, clipRight - left );
			children.style.width = `${ Math.round( widthPx ) }px`;
		}
	}

	const coords = toContainingBlockCoords( children, top, left );
	children.style.top = `${ Math.round( coords.top ) }px`;
	children.style.left = `${ Math.round( coords.left ) }px`;

	children.dataset.submenuPlacementX = positionAlign;
	children.dataset.submenuPlacementY = placementY;
	item.classList.remove( 'is-submenu-flyout-start', 'is-submenu-flyout-end' );
	item.classList.toggle( 'is-submenu-drop-above', placementY === 'above' );
	item.classList.toggle( 'is-submenu-drop-below', placementY === 'below' );
	item.classList.add( 'has-megamenu' );
}

/**
 * @param {HTMLElement} item .blockish-block-navmenu-item
 */
export function positionNavmenuSubmenu( item ) {
	if ( ! item || ! item.isConnected ) {
		return;
	}

	// Offcanvas is accordion layout — never apply desktop dropdown/flyout geometry.
	if ( item.closest( '.blockish-offcanvas' ) ) {
		clearNavmenuSubmenuPosition( item );
		return;
	}

	const children = item.querySelector(
		':scope > .blockish-navmenu-item-children'
	);
	if ( ! children ) {
		return;
	}

	// Header/containers may use overflow:hidden (and glass blur). Escape those
	// ancestors while open so fixed dropdowns are not clipped — no manual
	// overflow:visible needed on the header.
	if ( ! children._blockishFixedEscape ) {
		children._blockishFixedEscape = acquireFixedEscape( children, {
			overflow: true,
			containingBlock: true,
		} );
	}

	const megamenu = children.querySelector(
		':scope > .blockish-navmenu-megamenu'
	);
	if ( megamenu ) {
		positionNavmenuMegamenu( item, children, megamenu );
		return;
	}

	const win = item.ownerDocument.defaultView || window;
	const isFlyout = Boolean( item.closest( '.blockish-navmenu-submenu' ) );
	const itemRect = item.getBoundingClientRect();
	const vw = win.innerWidth;
	const vh = win.innerHeight;
	const depth = getNavmenuItemDepth( item );

	children.classList.add( 'is-submenu-positioned' );
	children.style.display = 'block';
	children.style.right = 'auto';
	children.style.bottom = 'auto';
	children.style.width = 'max-content';
	children.style.boxSizing = 'border-box';
	children.style.zIndex = String( 100000 + depth );
	children.style.paddingTop = '0';
	children.style.paddingRight = '0';
	children.style.paddingBottom = '0';
	children.style.paddingLeft = '0';

	if ( isFlyout ) {
		children.style.position = 'absolute';
		children.style.top = '0px';
		children.style.left = '100%';

		const parentSubmenu = item.closest( '.blockish-navmenu-submenu' );
		const parentRect = parentSubmenu
			? parentSubmenu.getBoundingClientRect()
			: itemRect;

		const panel =
			children.querySelector( ':scope > .blockish-navmenu-submenu' ) ||
			children;
		const panelRect = panel.getBoundingClientRect();
		const panelW = Math.max( panelRect.width || 0, 1 );
		const panelH = Math.max( panelRect.height || 0, 1 );
		const offsetY = parseLengthPx( panel.dataset?.offsetY, vh );
		const offsetX = parseLengthPx( panel.dataset?.offsetX, vw );

		// Check parent flyout placement if this item is nested inside another flyout.
		const parentFlyoutItem = parentSubmenu
			? parentSubmenu.closest( '.blockish-block-navmenu-item' )
			: null;
		const parentPlacementX = parentFlyoutItem?.querySelector(
			':scope > .blockish-navmenu-item-children'
		)?.dataset?.submenuPlacementX;

		const spaceRight = vw - parentRect.right - MARGIN;
		const spaceLeft = parentRect.left - MARGIN;
		let placementX = 'end';

		if ( parentPlacementX === 'end' ) {
			// If parent flyout opened to the right, continue cascade to the right
			// to avoid reversing back directly on top of parent/grandparent menus.
			placementX = 'end';
		} else if ( parentPlacementX === 'start' ) {
			// If parent flyout opened to the left, continue cascade to the left.
			placementX = 'start';
		} else if ( spaceRight < panelW && spaceLeft > spaceRight ) {
			// First-level flyout: prefer right, flip to left if insufficient room on right.
			placementX = 'start';
		} else {
			placementX = 'end';
		}

		if ( placementX === 'start' ) {
			const offsetRight = itemRect.right - parentRect.left;
			children.style.left = 'auto';
			children.style.right = `${ Math.round( offsetRight - offsetX ) }px`;
			children.style.paddingLeft = '0';
			children.style.paddingRight = `${ BRIDGE }px`;
		} else {
			const offsetLeft = parentRect.right - itemRect.left;
			children.style.left = `${ Math.round( offsetLeft + offsetX ) }px`;
			children.style.right = 'auto';
			children.style.paddingLeft = `${ BRIDGE }px`;
			children.style.paddingRight = '0';
		}

		let topOffset = offsetY;
		if ( itemRect.top + panelH + topOffset > vh - MARGIN ) {
			topOffset = Math.min(
				offsetY,
				vh - MARGIN - panelH - itemRect.top
			);
		}
		if ( itemRect.top + topOffset < MARGIN ) {
			topOffset = MARGIN - itemRect.top;
		}
		children.style.top = `${ Math.round( topOffset ) }px`;

		children.dataset.submenuPlacementX = placementX;
		children.dataset.submenuPlacementY = 'below';
		item.classList.toggle(
			'is-submenu-flyout-start',
			placementX === 'start'
		);
		item.classList.toggle( 'is-submenu-flyout-end', placementX === 'end' );
		item.classList.remove(
			'is-submenu-drop-above',
			'is-submenu-drop-below'
		);
		return;
	}

	children.style.position = 'fixed';
	children.style.top = '0px';
	children.style.left = '0px';

	const panel =
		children.querySelector( ':scope > .blockish-navmenu-submenu' ) ||
		children;
	const panelRect = panel.getBoundingClientRect();
	const panelW = Math.max( panelRect.width || 0, 1 );
	const positionAlign = panel.dataset?.positionAlign || 'left';
	const offsetY = parseLengthPx( panel.dataset?.offsetY, vh );
	const offsetX = parseLengthPx( panel.dataset?.offsetX, vw );

	let left = 0;
	const placementY = 'below';
	const top = itemRect.bottom + offsetY;
	children.style.paddingTop = `${ BRIDGE }px`;

	if ( positionAlign === 'center' ) {
		left = itemRect.left + ( itemRect.width - panelW ) / 2 + offsetX;
	} else if ( positionAlign === 'right' ) {
		left = itemRect.right - panelW + offsetX;
	} else {
		left = itemRect.left + offsetX;
	}

	if ( left + panelW > vw - MARGIN ) {
		left = Math.max( MARGIN, vw - MARGIN - panelW );
	}
	if ( left < MARGIN ) {
		left = MARGIN;
	}

	const wrapW = panelW + BRIDGE;
	if ( left + wrapW > vw - MARGIN ) {
		left = Math.max( MARGIN, vw - MARGIN - wrapW );
	}

	const coords = toContainingBlockCoords( children, top, left );
	children.style.top = `${ Math.round( coords.top ) }px`;
	children.style.left = `${ Math.round( coords.left ) }px`;

	children.dataset.submenuPlacementX = positionAlign;
	children.dataset.submenuPlacementY = placementY;
	item.classList.remove( 'is-submenu-flyout-start', 'is-submenu-flyout-end' );
	item.classList.toggle( 'is-submenu-drop-above', placementY === 'above' );
	item.classList.toggle( 'is-submenu-drop-below', placementY === 'below' );
}

/**
 * @param {HTMLElement} item
 */
export function clearNavmenuSubmenuPosition( item ) {
	if ( ! item ) {
		return;
	}

	const children = item.querySelector(
		':scope > .blockish-navmenu-item-children'
	);
	if ( children ) {
		if ( typeof children._blockishFixedEscape === 'function' ) {
			children._blockishFixedEscape();
			children._blockishFixedEscape = null;
		}
		children.classList.remove( 'is-submenu-positioned' );
		[
			'display',
			'position',
			'top',
			'left',
			'right',
			'bottom',
			'zIndex',
			'width',
			'minWidth',
			'maxWidth',
			'maxHeight',
			'minHeight',
			'height',
			'boxSizing',
			'overflow',
			'overflowX',
			'overflowY',
			'margin',
			'padding',
			'paddingTop',
			'paddingRight',
			'paddingBottom',
			'paddingLeft',
		].forEach( ( key ) => {
			children.style[ key ] = '';
		} );
		delete children.dataset.submenuPlacementX;
		delete children.dataset.submenuPlacementY;

		const megamenu = children.querySelector(
			':scope > .blockish-navmenu-megamenu'
		);
		if ( megamenu ) {
			[ 'maxHeight', 'overflow', 'overflowY' ].forEach( ( key ) => {
				megamenu.style[ key ] = '';
			} );
		}
	}

	item.classList.remove(
		'is-submenu-flyout-start',
		'is-submenu-flyout-end',
		'is-submenu-drop-above',
		'is-submenu-drop-below',
		'has-megamenu'
	);
}

/**
 * @param {HTMLElement} item
 */
export function scheduleNavmenuSubmenuPosition( item ) {
	if ( ! item ) {
		return;
	}
	positionNavmenuSubmenu( item );
	const win = item?.ownerDocument?.defaultView || window;
	win.requestAnimationFrame( () => {
		positionNavmenuSubmenu( item );
	} );
}
