const cloneItemsToOffcanvas = ( offcanvasNav, desktopNav ) => {
	offcanvasNav.innerHTML = '';
	desktopNav
		.querySelectorAll( '.blockish-block-navmenu-item' )
		.forEach( ( item ) => offcanvasNav.appendChild( item.cloneNode( true ) ) );
};

const openOffcanvas = ( root, offcanvas, overlay, scrollLock ) => {
	offcanvas.classList.add( 'is-open' );
	offcanvas.setAttribute( 'aria-hidden', 'false' );
	overlay.classList.add( 'is-visible' );
	root
		.querySelector( '.blockish-block-navmenu-toggle' )
		?.setAttribute( 'aria-expanded', 'true' );

	if ( scrollLock ) {
		document.body.style.overflow = 'hidden';
	}
};

const closeOffcanvas = ( root, offcanvas, overlay, scrollLock ) => {
	offcanvas.classList.remove( 'is-open' );
	offcanvas.setAttribute( 'aria-hidden', 'true' );
	overlay.classList.remove( 'is-visible' );
	root
		.querySelector( '.blockish-block-navmenu-toggle' )
		?.setAttribute( 'aria-expanded', 'false' );

	if ( scrollLock ) {
		document.body.style.overflow = '';
	}
};

const checkBreakpoint = ( root, breakpointPx ) => {
	root.classList.toggle( 'is-mobile', window.innerWidth <= breakpointPx );
};

const mountNavmenu = ( root ) => {
	const breakpointPx = parseInt( root.dataset.breakpoint || '768', 10 );
	const scrollLock = root.dataset.scrollLock !== 'false';

	const desktopNav = root.querySelector( '.blockish-block-navmenu-nav' );
	const offcanvas = root.querySelector( '.blockish-block-navmenu-offcanvas' );
	const offcanvasNav = root.querySelector( '.blockish-block-navmenu-offcanvas-nav' );
	const toggle = root.querySelector( '.blockish-block-navmenu-toggle' );
	const closeBtn = root.querySelector( '.blockish-block-navmenu-close' );
	const overlay = root.querySelector( '.blockish-block-navmenu-overlay' );

	if ( ! desktopNav || ! offcanvas || ! toggle || ! overlay ) {
		return;
	}

	// Pass animation type to offcanvas element for CSS
	const animation = root.dataset.animation || 'none';
	if ( animation !== 'none' ) {
		offcanvas.dataset.animation = animation;
	}

	if ( offcanvasNav ) {
		cloneItemsToOffcanvas( offcanvasNav, desktopNav );
	}

	checkBreakpoint( root, breakpointPx );

	toggle.addEventListener( 'click', () => {
		if ( offcanvas.classList.contains( 'is-open' ) ) {
			closeOffcanvas( root, offcanvas, overlay, scrollLock );
		} else {
			openOffcanvas( root, offcanvas, overlay, scrollLock );
		}
	} );

	closeBtn?.addEventListener( 'click', () => {
		closeOffcanvas( root, offcanvas, overlay, scrollLock );
	} );

	overlay.addEventListener( 'click', () => {
		closeOffcanvas( root, offcanvas, overlay, scrollLock );
	} );

	window.addEventListener( 'resize', () => {
		checkBreakpoint( root, breakpointPx );
		if ( window.innerWidth > breakpointPx ) {
			closeOffcanvas( root, offcanvas, overlay, scrollLock );
		}
	} );

	document.addEventListener( 'keydown', ( e ) => {
		if (
			e.key === 'Escape' &&
			offcanvas.classList.contains( 'is-open' )
		) {
			closeOffcanvas( root, offcanvas, overlay, scrollLock );
			toggle.focus();
		}
	} );
};

const initNavmenu = () => {
	document
		.querySelectorAll( '.wp-block-blockish-navmenu' )
		.forEach( ( root ) => mountNavmenu( root ) );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initNavmenu );
} else {
	initNavmenu();
}
