const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const openOffcanvas = ( offcanvas ) => {
	offcanvas.classList.add( 'is-open' );
	offcanvas
		.querySelector( '.blockish-offcanvas-hamburger' )
		?.setAttribute( 'aria-expanded', 'true' );
	document.body.classList.add( 'blockish-offcanvas-open' );

	// Remember focus so closing can restore it, then move focus into the panel.
	offcanvas.offcanvasReturnFocus = document.activeElement;
	offcanvas.querySelector( '.blockish-offcanvas-close' )?.focus();
};

const closeOffcanvas = ( offcanvas ) => {
	offcanvas.classList.remove( 'is-open' );
	offcanvas
		.querySelector( '.blockish-offcanvas-hamburger' )
		?.setAttribute( 'aria-expanded', 'false' );
	document.body.classList.remove( 'blockish-offcanvas-open' );

	if ( offcanvas.offcanvasReturnFocus instanceof HTMLElement ) {
		offcanvas.offcanvasReturnFocus.focus();
		offcanvas.offcanvasReturnFocus = null;
	}
};

const mountOffcanvas = ( offcanvas ) => {
	const hamburger = offcanvas.querySelector( '.blockish-offcanvas-hamburger' );
	const overlay = offcanvas.querySelector( '.blockish-offcanvas-overlay' );
	const closeBtn = offcanvas.querySelector( '.blockish-offcanvas-close' );

	hamburger?.addEventListener( 'click', () => {
		if ( offcanvas.classList.contains( 'is-open' ) ) {
			closeOffcanvas( offcanvas );
		} else {
			openOffcanvas( offcanvas );
		}
	} );

	overlay?.addEventListener( 'click', () => closeOffcanvas( offcanvas ) );
	closeBtn?.addEventListener( 'click', () => closeOffcanvas( offcanvas ) );

	// Clicking a real menu link should close the panel before navigating.
	offcanvas
		.querySelector( '.blockish-offcanvas-nav' )
		?.addEventListener( 'click', ( event ) => {
			if ( event.target.closest( 'a' ) ) {
				closeOffcanvas( offcanvas );
			}
		} );
};

// Escape (close) and the focus trap for the open panel are registered once
// globally rather than per instance — only one offcanvas can be open at a time.
document.addEventListener( 'keydown', ( event ) => {
	const openPanel = document.querySelector( '.blockish-offcanvas.is-open' );

	if ( ! openPanel ) {
		return;
	}

	if ( event.key === 'Escape' ) {
		closeOffcanvas( openPanel );
		return;
	}

	if ( event.key !== 'Tab' ) {
		return;
	}

	const panel = openPanel.querySelector( '.blockish-offcanvas-panel' );
	const focusable = panel
		? Array.from( panel.querySelectorAll( FOCUSABLE_SELECTOR ) )
		: [];

	if ( ! focusable.length ) {
		return;
	}

	const first = focusable[ 0 ];
	const last = focusable[ focusable.length - 1 ];

	if ( event.shiftKey && document.activeElement === first ) {
		event.preventDefault();
		last.focus();
	} else if ( ! event.shiftKey && document.activeElement === last ) {
		event.preventDefault();
		first.focus();
	}
} );

const init = () => {
	document.querySelectorAll( '.blockish-offcanvas' ).forEach( mountOffcanvas );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
