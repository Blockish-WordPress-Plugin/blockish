const setOffcanvasOpen = ( nav, isOpen ) => {
	const hamburger = nav.querySelector( '.blockish-navmenu-hamburger' );

	nav.classList.toggle( 'is-offcanvas-open', isOpen );
	hamburger?.setAttribute( 'aria-expanded', String( isOpen ) );

	if ( nav.dataset.scrollLockOffcanvas === 'true' ) {
		document.body.classList.toggle( 'blockish-navmenu-lock-scroll', isOpen );
	}
};

const closeAllSubmenus = ( nav, exceptItem ) => {
	nav.querySelectorAll( '.is-submenu-open' ).forEach( ( item ) => {
		if ( item !== exceptItem ) {
			item.classList.remove( 'is-submenu-open' );
			item
				.querySelector( ':scope > a' )
				?.setAttribute( 'aria-expanded', 'false' );
		}
	} );
};

const watchCustomBreakpoint = ( nav ) => {
	const breakpoint = parseInt( nav.dataset.customBreakpoint, 10 );

	if ( ! breakpoint ) {
		return;
	}

	const mediaQuery = window.matchMedia( `(max-width: ${ breakpoint }px)` );
	const sync = () => nav.classList.toggle( 'is-custom-collapsed', mediaQuery.matches );

	sync();
	mediaQuery.addEventListener( 'change', sync );
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
	const hamburger = nav.querySelector( '.blockish-navmenu-hamburger' );
	const closeBtn = nav.querySelector( '.blockish-navmenu-close' );
	const overlay = nav.querySelector( '.blockish-navmenu-overlay' );

	watchCustomBreakpoint( nav );
	markActiveItems( nav );

	hamburger?.addEventListener( 'click', () => {
		setOffcanvasOpen( nav, ! nav.classList.contains( 'is-offcanvas-open' ) );
	} );

	closeBtn?.addEventListener( 'click', () => setOffcanvasOpen( nav, false ) );
	overlay?.addEventListener( 'click', () => setOffcanvasOpen( nav, false ) );

	document.addEventListener( 'keydown', ( event ) => {
		if ( event.key !== 'Escape' ) {
			return;
		}

		setOffcanvasOpen( nav, false );
		closeAllSubmenus( nav, null );
	} );

	nav.querySelectorAll( '.blockish-block-navmenu-item' ).forEach( ( item ) => {
		const trigger = item.querySelector( ':scope > a' );
		const hasSubmenu = !! item.querySelector(
			':scope > .blockish-navmenu-submenu'
		);

		if ( ! hasSubmenu || ! trigger ) {
			return;
		}

		const indicator = item.querySelector(
			':scope > a > .blockish-navmenu-submenu-arrow'
		);

		const toggle = ( event ) => {
			event.preventDefault();
			event.stopPropagation();

			const willOpen = ! item.classList.contains( 'is-submenu-open' );

			closeAllSubmenus( item.closest( '.blockish-navmenu-nav' ), item );
			item.classList.toggle( 'is-submenu-open', willOpen );
			trigger.setAttribute( 'aria-expanded', String( willOpen ) );
		};

		indicator?.addEventListener( 'click', toggle );
	} );

	document.addEventListener( 'click', ( event ) => {
		if ( nav.contains( event.target ) ) {
			return;
		}

		closeAllSubmenus( nav, null );
	} );
};

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
