const setSubmenuOpen = ( item, isOpen ) => {
	item.classList.toggle( 'is-submenu-open', isOpen );
	item
		.querySelector( ':scope > .blockish-navmenu-submenu-toggle' )
		?.setAttribute( 'aria-expanded', String( isOpen ) );
};

const closeAllSubmenus = ( nav, exceptItem ) => {
	nav.querySelectorAll( '.is-submenu-open' ).forEach( ( item ) => {
		if ( item !== exceptItem ) {
			setSubmenuOpen( item, false );
		}
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

const markActiveItems = ( nav ) => {
	const currentEntityId = getCurrentEntityId();
	const currentUrl = window.location.href.replace( /\/$/, '' );

	nav.querySelectorAll( '.blockish-block-navmenu-item' ).forEach( ( item ) => {
		// Prefer matching the linked post/page's ID against the current
		// entity (works regardless of trailing slashes, query args, or
		// http/https differences). Falls back to a plain URL match for
		// items linking to a custom/external URL with no underlying post.
		const isActive = currentEntityId && item.dataset.id
			? item.dataset.id === currentEntityId
			: item.querySelector( ':scope > a' )?.href?.replace( /\/$/, '' ) === currentUrl;

		if ( isActive ) {
			item.classList.add( 'is-active' );
		}
	} );
};

const mountNavmenu = ( nav ) => {
	markActiveItems( nav );

	nav.querySelectorAll( '.blockish-block-navmenu-item' ).forEach( ( item ) => {
		const toggleButton = item.querySelector(
			':scope > .blockish-navmenu-submenu-toggle'
		);
		const hasSubmenu = !! item.querySelector(
			':scope > .blockish-navmenu-submenu'
		);

		if ( ! hasSubmenu || ! toggleButton ) {
			return;
		}

		toggleButton.addEventListener( 'click', ( event ) => {
			// Stop the document-level "click outside closes submenus"
			// listener below from immediately undoing this toggle.
			event.stopPropagation();

			const willOpen = ! item.classList.contains( 'is-submenu-open' );

			closeAllSubmenus( item.closest( '.blockish-navmenu-nav' ), item );
			setSubmenuOpen( item, willOpen );
		} );
	} );
};

// Escape closes any open submenus, plus outside-click submenu closing, are
// registered once here rather than once per nav instance — with multiple
// menus on a page (e.g. header + footer), per-instance listeners would each
// redundantly re-run the same global checks on every keystroke/click.
document.addEventListener( 'keydown', ( event ) => {
	if ( event.key !== 'Escape' ) {
		return;
	}

	document.querySelectorAll( '.blockish-navmenu' ).forEach( ( nav ) => {
		closeAllSubmenus( nav, null );
	} );
} );

document.addEventListener( 'click', ( event ) => {
	document.querySelectorAll( '.blockish-navmenu' ).forEach( ( nav ) => {
		if ( ! nav.contains( event.target ) ) {
			closeAllSubmenus( nav, null );
		}
	} );
} );

const initNavmenus = () => {
	document
		.querySelectorAll( '.blockish-navmenu' )
		.forEach( ( nav ) => mountNavmenu( nav ) );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initNavmenus );
} else {
	initNavmenus();
}
