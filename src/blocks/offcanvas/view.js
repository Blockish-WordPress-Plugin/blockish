import { acquireFixedEscape } from '../navmenu-item/fixed-escape';

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Closed accordion branches must not be tabbable while the panel is open.
 *
 * @param {HTMLElement} root Offcanvas root or nav subtree.
 */
const syncOffcanvasAccordionInert = ( root ) => {
	root
		?.querySelectorAll?.(
			'.blockish-block-navmenu-item > .blockish-navmenu-item-children'
		)
		?.forEach( ( children ) => {
			const item = children.parentElement;
			const isOpen = item?.classList.contains( 'is-submenu-open' );
			if ( isOpen ) {
				children.removeAttribute( 'inert' );
			} else {
				children.setAttribute( 'inert', '' );
			}
		} );
};

const CLOSE_MS = 420;

const clearPanelCloseStyles = ( offcanvas ) => {
	[ '.blockish-offcanvas-panel', '.blockish-offcanvas-overlay' ].forEach(
		( selector ) => {
			const el = offcanvas.querySelector( selector );
			if ( ! el ) {
				return;
			}
			el.style.removeProperty( 'visibility' );
			el.style.removeProperty( 'opacity' );
			el.style.removeProperty( 'transition' );
			el.style.removeProperty( 'animation' );
			el.style.removeProperty( 'transform' );
		}
	);
};

const hardHidePanel = ( offcanvas ) => {
	const panel = offcanvas.querySelector( '.blockish-offcanvas-panel' );
	const overlay = offcanvas.querySelector( '.blockish-offcanvas-overlay' );
	[ panel, overlay ].forEach( ( el ) => {
		if ( ! el ) {
			return;
		}
		el.style.setProperty( 'transition', 'none', 'important' );
		el.style.setProperty( 'animation', 'none', 'important' );
		el.style.setProperty( 'visibility', 'hidden', 'important' );
		el.style.setProperty( 'opacity', '0', 'important' );
	} );
	if ( panel ) {
		panel.style.setProperty( 'transform', 'none', 'important' );
	}
};

const clearCloseTimer = ( offcanvas ) => {
	if ( offcanvas._blockishCloseTimer ) {
		window.clearTimeout( offcanvas._blockishCloseTimer );
		offcanvas._blockishCloseTimer = null;
	}
	if ( typeof offcanvas._blockishCloseEnd === 'function' ) {
		const panel = offcanvas.querySelector( '.blockish-offcanvas-panel' );
		panel?.removeEventListener( 'animationend', offcanvas._blockishCloseEnd );
		panel?.removeEventListener( 'transitionend', offcanvas._blockishCloseEnd );
		offcanvas._blockishCloseEnd = null;
	}
};

const finishCloseOffcanvas = ( offcanvas ) => {
	if ( ! offcanvas._blockishClosing ) {
		return;
	}

	clearCloseTimer( offcanvas );

	// Hide before tearing down classes / escape — otherwise slide-out fill is
	// dropped (panel snaps on-screen) while header containing-block returns,
	// flashing a clipped strip of the panel.
	hardHidePanel( offcanvas );

	offcanvas._blockishClosing = false;
	offcanvas.classList.remove( 'is-open', 'is-closing' );
	document.body.classList.remove( 'blockish-offcanvas-open' );

	if ( typeof offcanvas._blockishFixedEscape === 'function' ) {
		offcanvas._blockishFixedEscape();
		offcanvas._blockishFixedEscape = null;
	}

	window.requestAnimationFrame( () => {
		if ( ! offcanvas.classList.contains( 'is-open' ) ) {
			clearPanelCloseStyles( offcanvas );
		}
	} );

	if ( offcanvas.offcanvasReturnFocus instanceof HTMLElement ) {
		offcanvas.offcanvasReturnFocus.focus();
		offcanvas.offcanvasReturnFocus = null;
	}
};

const openOffcanvas = ( offcanvas ) => {
	if ( offcanvas._blockishClosing ) {
		finishCloseOffcanvas( offcanvas );
	}

	clearPanelCloseStyles( offcanvas );

	// Escape header overflow/transform/backdrop so the fixed panel is viewport-
	// sized — same trap that clips desktop nav dropdowns.
	if ( typeof offcanvas._blockishFixedEscape === 'function' ) {
		offcanvas._blockishFixedEscape();
	}
	offcanvas._blockishFixedEscape = acquireFixedEscape( offcanvas, {
		overflow: true,
		containingBlock: true,
	} );

	offcanvas.classList.remove( 'is-closing' );
	offcanvas.classList.add( 'is-open' );
	offcanvas
		.querySelector( '.blockish-offcanvas-hamburger' )
		?.setAttribute( 'aria-expanded', 'true' );
	document.body.classList.add( 'blockish-offcanvas-open' );
	syncOffcanvasAccordionInert( offcanvas );

	// Remember focus so closing can restore it, then move focus into the panel.
	offcanvas.offcanvasReturnFocus = document.activeElement;
	offcanvas.querySelector( '.blockish-offcanvas-close' )?.focus();
};

const closeOffcanvas = ( offcanvas ) => {
	if ( offcanvas._blockishClosing || ! offcanvas.classList.contains( 'is-open' ) ) {
		return;
	}

	offcanvas._blockishClosing = true;
	offcanvas.classList.add( 'is-closing' );
	offcanvas
		.querySelector( '.blockish-offcanvas-hamburger' )
		?.setAttribute( 'aria-expanded', 'false' );

	const panel = offcanvas.querySelector( '.blockish-offcanvas-panel' );
	const usesSlide = offcanvas.classList.contains( 'offcanvas-animation-slide' ) ||
		offcanvas.classList.contains( 'offcanvas-animation-slideFade' );

	const onEnd = ( event ) => {
		if ( event.target !== panel ) {
			return;
		}
		if ( event.type === 'animationend' ) {
			if ( ! String( event.animationName || '' ).includes( 'SlideOut' ) ) {
				return;
			}
		} else if ( event.type === 'transitionend' ) {
			// Fade/scale exit uses opacity; ignore unrelated property ends.
			if ( usesSlide || event.propertyName !== 'opacity' ) {
				return;
			}
		}
		finishCloseOffcanvas( offcanvas );
	};

	clearCloseTimer( offcanvas );
	offcanvas._blockishCloseEnd = onEnd;
	panel?.addEventListener( 'animationend', onEnd );
	panel?.addEventListener( 'transitionend', onEnd );
	offcanvas._blockishCloseTimer = window.setTimeout( () => {
		finishCloseOffcanvas( offcanvas );
	}, CLOSE_MS );
};

const mountOffcanvas = ( offcanvas ) => {
	const hamburger = offcanvas.querySelector( '.blockish-offcanvas-hamburger' );
	const overlay = offcanvas.querySelector( '.blockish-offcanvas-overlay' );
	const closeBtn = offcanvas.querySelector( '.blockish-offcanvas-close' );

	syncOffcanvasAccordionInert( offcanvas );

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
		? Array.from( panel.querySelectorAll( FOCUSABLE_SELECTOR ) ).filter(
				( el ) => ! el.closest( '[inert]' )
		  )
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

/**
 * Accordion toggles live in navmenu-item/view.js; also keep inert in sync when
 * that script toggles `.is-submenu-open` inside an open offcanvas.
 */
const observeOffcanvasAccordion = () => {
	if ( window._blockishOffcanvasInertBound === '1' ) {
		return;
	}
	window._blockishOffcanvasInertBound = '1';

	document.addEventListener(
		'click',
		( event ) => {
			const toggle = event.target.closest?.(
				'.blockish-offcanvas .blockish-navmenu-submenu-toggle'
			);
			if ( ! toggle ) {
				return;
			}
			const offcanvas = toggle.closest( '.blockish-offcanvas' );
			// After the toggle handler flips the class, sync on next frame.
			window.requestAnimationFrame( () => {
				if ( offcanvas ) {
					syncOffcanvasAccordionInert( offcanvas );
				}
			} );
		},
		true
	);
};

const init = () => {
	document.querySelectorAll( '.blockish-offcanvas' ).forEach( mountOffcanvas );
	observeOffcanvasAccordion();
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
