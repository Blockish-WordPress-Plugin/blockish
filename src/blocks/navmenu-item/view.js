// Active items + submenu interaction (offcanvas accordion, desktop hover/click, keyboard accessibility).
import {
	clearNavmenuSubmenuPosition,
	closeSiblingNavmenuSubmenus,
	getNavmenuItemSiblings,
	positionNavmenuSubmenu,
	scheduleNavmenuSubmenuPosition,
} from './position-submenu';

const CLOSE_DELAY_MS = 600;
const INTENT_DELAY_MS = 150;

/** TEMP debug — remove after megamenu width debugging. */
const DEBUG_FORCE_MEGAMENU_OPEN = false;

const itemHasMegamenu = ( item ) =>
	Boolean(
		item?.querySelector(
			':scope > .blockish-navmenu-item-children > .blockish-navmenu-megamenu'
		)
	);

const forceOpenAllMegamenus = () => {
	document
		.querySelectorAll( '.blockish-block-navmenu-item.has-submenu' )
		.forEach( ( item ) => {
			if ( ! itemHasMegamenu( item ) ) {
				return;
			}
			item.classList.add( 'is-submenu-open' );
			const button = item.querySelector(
				':scope > .blockish-navmenu-submenu-toggle'
			);
			if ( button ) {
				button.setAttribute( 'aria-expanded', 'true' );
			}
			positionNavmenuSubmenu( item );
		} );
};

const getCurrentEntityId = () => {
	for ( const className of document.body.classList ) {
		if ( className.startsWith( 'page-id-' ) ) {
			return className.replace( 'page-id-', '' );
		}

		if ( className.startsWith( 'postid-' ) ) {
			return className.replace( 'postid-', '' );
		}
	}

	return '';
};

const markActiveItems = () => {
	const currentEntityId = getCurrentEntityId();
	const currentUrl = window.location.href.replace( /\/$/, '' );

	document
		.querySelectorAll( '.blockish-block-navmenu-item' )
		.forEach( ( item ) => {
			const link = item.querySelector(
				':scope > .blockish-navmenu-item-link'
			);
			const isActive =
				currentEntityId && item.dataset.id
					? item.dataset.id === currentEntityId
					: link?.href?.replace( /\/$/, '' ) === currentUrl;

			if ( isActive ) {
				item.classList.add( 'is-active' );
			}
		} );
};

const clearCloseTimer = ( item ) => {
	const timerId = item._blockishCloseTimer;
	if ( timerId ) {
		clearTimeout( timerId );
		item._blockishCloseTimer = null;
	}
};

const clearIntentTimer = ( item ) => {
	const timerId = item._blockishIntentTimer;
	if ( timerId ) {
		clearTimeout( timerId );
		item._blockishIntentTimer = null;
	}
};

const forceCloseItem = ( item ) => {
	// TEMP: keep megamenus pinned open for frontend width debugging.
	if ( DEBUG_FORCE_MEGAMENU_OPEN && itemHasMegamenu( item ) ) {
		positionNavmenuSubmenu( item );
		return;
	}
	item.classList.remove( 'is-submenu-open' );
	clearCloseTimer( item );
	clearIntentTimer( item );
	clearNavmenuSubmenuPosition( item );
	const button = item.querySelector(
		':scope > .blockish-navmenu-submenu-toggle'
	);
	if ( button ) {
		button.setAttribute( 'aria-expanded', 'false' );
	}
};

/**
 * Close every open submenu nested under this item (not the item itself).
 *
 * @param {HTMLElement} item
 */
const closeNestedSubmenus = ( item ) => {
	item.querySelectorAll(
		':scope .blockish-block-navmenu-item.is-submenu-open'
	).forEach( ( nested ) => forceCloseItem( nested ) );
};

const setSubmenuOpen = ( item, isOpen ) => {
	clearIntentTimer( item );
	if ( isOpen ) {
		closeSiblingNavmenuSubmenus( item, ( sibling ) => {
			if ( sibling.classList.contains( 'is-submenu-open' ) ) {
				forceCloseItem( sibling );
				closeNestedSubmenus( sibling );
			}
		} );
		// Parent just opened — nested must start closed (no cascade open).
		closeNestedSubmenus( item );
		item.classList.add( 'is-submenu-open' );
		positionNavmenuSubmenu( item );
	} else {
		forceCloseItem( item );
		closeNestedSubmenus( item );
	}

	const button = item.querySelector(
		':scope > .blockish-navmenu-submenu-toggle'
	);
	if ( button ) {
		button.setAttribute( 'aria-expanded', isOpen ? 'true' : 'false' );
	}

	if ( isOpen ) {
		scheduleNavmenuSubmenuPosition( item );
	}
};

const scheduleClose = ( item ) => {
	clearCloseTimer( item );
	item._blockishCloseTimer = window.setTimeout( () => {
		setSubmenuOpen( item, false );
		item._blockishCloseTimer = null;
	}, CLOSE_DELAY_MS );
};

const bindOffcanvasSubmenuToggles = () => {
	document
		.querySelectorAll(
			'.blockish-offcanvas .blockish-navmenu-submenu-toggle'
		)
		.forEach( ( button ) => {
			if ( button.dataset.blockishBound === '1' ) {
				return;
			}
			button.dataset.blockishBound = '1';

			button.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				event.stopPropagation();

				const item = button.closest( '.blockish-block-navmenu-item' );
				if ( ! item ) {
					return;
				}

				const isOpen = item.classList.toggle( 'is-submenu-open' );
				button.setAttribute(
					'aria-expanded',
					isOpen ? 'true' : 'false'
				);
			} );
		} );
};

const repositionOpenSubmenus = () => {
	document
		.querySelectorAll(
			'.blockish-navmenu .blockish-block-navmenu-item.has-submenu.is-submenu-open'
		)
		.forEach( ( item ) => positionNavmenuSubmenu( item ) );
};

const bindDesktopSubmenus = () => {
	document
		.querySelectorAll( '.blockish-navmenu .blockish-block-navmenu-item' )
		.forEach( ( item ) => {
			if ( item.dataset.blockishDesktopBound === '1' ) {
				return;
			}
			item.dataset.blockishDesktopBound = '1';

			const hasSubmenu = item.classList.contains( 'has-submenu' );
			const navmenu = item.closest( '.blockish-navmenu' );
			const isClick = navmenu
				? navmenu.classList.contains( 'is-submenu-trigger-click' )
				: item.classList.contains( 'is-submenu-trigger-click' );
			const trigger = isClick ? 'click' : 'hover';
			const button = item.querySelector(
				':scope > .blockish-navmenu-submenu-toggle'
			);
			const childrenContainer = item.querySelector(
				':scope > .blockish-navmenu-item-children'
			);

			item.addEventListener( 'mouseenter', ( event ) => {
				// Only this item — ignore if a nested item is the real target.
				const nearest = event.target.closest?.(
					'.blockish-block-navmenu-item'
				);
				if ( nearest && nearest !== item ) {
					return;
				}

				clearCloseTimer( item );
				clearIntentTimer( item );

				if ( trigger === 'hover' ) {
					// Check if a sibling already has an open submenu (diagonal hover path protection).
					const siblings = getNavmenuItemSiblings( item );
					const hasOpenSibling = siblings.some(
						( sibling ) =>
							sibling !== item &&
							sibling.classList.contains( 'is-submenu-open' )
					);

					if ( hasOpenSibling ) {
						// Delay switching to give the user time to cross diagonally into the open sibling's submenu.
						item._blockishIntentTimer = window.setTimeout( () => {
							if ( hasSubmenu ) {
								setSubmenuOpen( item, true );
							} else {
								closeSiblingNavmenuSubmenus(
									item,
									( sibling ) => {
										forceCloseItem( sibling );
									}
								);
							}
							item._blockishIntentTimer = null;
						}, INTENT_DELAY_MS );
					} else if ( hasSubmenu ) {
						setSubmenuOpen( item, true );
					}
				} else if ( item.classList.contains( 'is-submenu-open' ) ) {
					scheduleNavmenuSubmenuPosition( item );
				}
			} );

			item.addEventListener( 'mouseleave', () => {
				clearIntentTimer( item );
				if (
					hasSubmenu &&
					( trigger === 'hover' ||
						item.classList.contains( 'is-submenu-open' ) )
				) {
					scheduleClose( item );
				}
			} );

			// Entering the children container protects this branch and cancels any pending sibling intent timers.
			if ( childrenContainer ) {
				childrenContainer.addEventListener( 'mouseenter', () => {
					clearCloseTimer( item );
					const siblings = getNavmenuItemSiblings( item );
					siblings.forEach( ( sibling ) =>
						clearIntentTimer( sibling )
					);
				} );
			}

			if ( trigger === 'click' && button ) {
				button.addEventListener( 'click', ( event ) => {
					event.preventDefault();
					event.stopPropagation();
					clearCloseTimer( item );
					clearIntentTimer( item );
					setSubmenuOpen(
						item,
						! item.classList.contains( 'is-submenu-open' )
					);
				} );
			}
		} );
};

const getSiblingLinks = ( item ) => {
	const currentList = item?.parentElement;
	if ( ! currentList ) {
		return [];
	}
	const siblingItems = Array.from(
		currentList.querySelectorAll(
			':scope > .blockish-block-navmenu-item, :scope > .wp-block-blockish-navmenu-item'
		)
	);
	return siblingItems
		.map( ( it ) =>
			it.querySelector( ':scope > .blockish-navmenu-item-link' )
		)
		.filter( Boolean );
};

const bindKeyboardNavigation = () => {
	document.querySelectorAll( '.blockish-navmenu' ).forEach( ( navmenu ) => {
		if ( navmenu.dataset.blockishKeyboardBound === '1' ) {
			return;
		}
		navmenu.dataset.blockishKeyboardBound = '1';

		// Open submenu when focus enters an item with submenu, keep open while inside
		navmenu.addEventListener( 'focusin', ( event ) => {
			const item = event.target.closest( '.blockish-block-navmenu-item' );
			if ( ! item ) {
				return;
			}

			// Clear close and intent timers up the ancestor tree
			let ancestor = item;
			while ( ancestor && ancestor !== navmenu ) {
				if (
					ancestor.classList.contains( 'blockish-block-navmenu-item' )
				) {
					clearCloseTimer( ancestor );
					clearIntentTimer( ancestor );
				}
				ancestor = ancestor.parentElement;
			}
		} );

		// Close submenu when focus leaves the branch or the navmenu
		navmenu.addEventListener( 'focusout', ( event ) => {
			const related = event.relatedTarget;
			if ( ! related || ! navmenu.contains( related ) ) {
				navmenu
					.querySelectorAll(
						'.blockish-block-navmenu-item.is-submenu-open'
					)
					.forEach( ( openItem ) => forceCloseItem( openItem ) );
				return;
			}

			const currentItem = event.target.closest(
				'.blockish-block-navmenu-item'
			);
			if ( currentItem && ! currentItem.contains( related ) ) {
				scheduleClose( currentItem );
			}
		} );

		// Keydown keyboard navigation (Escape, Arrows, Home, End)
		navmenu.addEventListener( 'keydown', ( event ) => {
			const { key, target } = event;
			const item = target.closest( '.blockish-block-navmenu-item' );
			if ( ! item ) {
				return;
			}

			const isLink = target.classList.contains(
				'blockish-navmenu-item-link'
			);
			const isToggle = target.classList.contains(
				'blockish-navmenu-submenu-toggle'
			);
			if ( ! isLink && ! isToggle ) {
				return;
			}

			if ( key === 'Escape' ) {
				const openParent = item.closest(
					'.blockish-block-navmenu-item.is-submenu-open'
				);
				if ( openParent ) {
					event.preventDefault();
					event.stopPropagation();
					const returnTarget =
						openParent.querySelector(
							':scope > .blockish-navmenu-submenu-toggle'
						) ||
						openParent.querySelector(
							':scope > .blockish-navmenu-item-link'
						);
					forceCloseItem( openParent );
					returnTarget?.focus();
				}
				return;
			}

			const isInsideSubmenu = Boolean(
				item.closest( '.blockish-navmenu-submenu' )
			);
			const isVerticalNav = navmenu.classList.contains( 'is-vertical' );

			if (
				key === 'ArrowDown' &&
				! isInsideSubmenu &&
				! isVerticalNav &&
				item.classList.contains( 'has-submenu' )
			) {
				event.preventDefault();
				setSubmenuOpen( item, true );
				const firstSubLink = item.querySelector(
					':scope > .blockish-navmenu-item-children .blockish-navmenu-item-link'
				);
				firstSubLink?.focus();
				return;
			}

			if (
				key === 'ArrowRight' &&
				isInsideSubmenu &&
				item.classList.contains( 'has-submenu' )
			) {
				event.preventDefault();
				setSubmenuOpen( item, true );
				const firstFlyoutLink = item.querySelector(
					':scope > .blockish-navmenu-item-children .blockish-navmenu-item-link'
				);
				firstFlyoutLink?.focus();
				return;
			}

			if ( key === 'ArrowLeft' && isInsideSubmenu ) {
				const parentSubmenu = item.closest(
					'.blockish-navmenu-submenu'
				);
				const parentItem = parentSubmenu?.closest(
					'.blockish-block-navmenu-item'
				);
				if ( parentItem ) {
					event.preventDefault();
					forceCloseItem( parentItem );
					const parentLink = parentItem.querySelector(
						':scope > .blockish-navmenu-item-link'
					);
					parentLink?.focus();
				}
				return;
			}

			const siblingLinks = getSiblingLinks( item );
			if ( siblingLinks.length === 0 ) {
				return;
			}

			const currentLink = item.querySelector(
				':scope > .blockish-navmenu-item-link'
			);
			const currentIndex = siblingLinks.indexOf( currentLink );

			if (
				( isInsideSubmenu || isVerticalNav ) &&
				( key === 'ArrowDown' || key === 'ArrowUp' )
			) {
				event.preventDefault();
				const nextIndex =
					key === 'ArrowDown'
						? ( currentIndex + 1 ) % siblingLinks.length
						: ( currentIndex - 1 + siblingLinks.length ) %
						  siblingLinks.length;
				siblingLinks[ nextIndex ]?.focus();
				return;
			}

			if (
				! isInsideSubmenu &&
				! isVerticalNav &&
				( key === 'ArrowRight' || key === 'ArrowLeft' )
			) {
				event.preventDefault();
				const nextIndex =
					key === 'ArrowRight'
						? ( currentIndex + 1 ) % siblingLinks.length
						: ( currentIndex - 1 + siblingLinks.length ) %
						  siblingLinks.length;
				siblingLinks[ nextIndex ]?.focus();
				return;
			}

			if ( key === 'Home' ) {
				event.preventDefault();
				siblingLinks[ 0 ]?.focus();
			} else if ( key === 'End' ) {
				event.preventDefault();
				siblingLinks[ siblingLinks.length - 1 ]?.focus();
			}
		} );
	} );
};

const bindRepositionListeners = () => {
	if ( window._blockishNavmenuPosBound === '1' ) {
		return;
	}
	window._blockishNavmenuPosBound = '1';

	window.addEventListener( 'resize', repositionOpenSubmenus );
	window.addEventListener( 'scroll', repositionOpenSubmenus, true );
};

const init = () => {
	markActiveItems();
	bindOffcanvasSubmenuToggles();
	bindDesktopSubmenus();
	bindKeyboardNavigation();
	bindRepositionListeners();
	if ( DEBUG_FORCE_MEGAMENU_OPEN ) {
		forceOpenAllMegamenus();
		window.setTimeout( forceOpenAllMegamenus, 100 );
		window.setTimeout( forceOpenAllMegamenus, 400 );
	}
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
