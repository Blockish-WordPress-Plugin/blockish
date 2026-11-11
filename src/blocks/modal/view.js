import { acquireFixedEscape } from '../navmenu-item/fixed-escape';

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const CLOSE_TIMEOUT_MS = 300;

const finishClose = ( modal ) => {
	const backdrop = modal.querySelector( '.blockish-modal-backdrop' );
	if ( modal._blockishModalTimer ) {
		window.clearTimeout( modal._blockishModalTimer );
		modal._blockishModalTimer = null;
	}
	modal.classList.remove( 'is-open' );
	if ( backdrop ) {
		backdrop.hidden = true;
	}
	if ( ! document.querySelector( '.blockish-modal.is-open[data-lock-scroll="true"]' ) ) {
		document.body.classList.remove( 'blockish-modal-scroll-locked' );
	}
	if ( typeof modal._blockishFixedEscape === 'function' ) {
		modal._blockishFixedEscape();
		modal._blockishFixedEscape = null;
	}
	if ( modal._returnFocus instanceof HTMLElement ) {
		modal._returnFocus.focus();
		modal._returnFocus = null;
	}
};

const closeModal = ( modal ) => {
	if ( ! modal || ! modal.classList.contains( 'is-open' ) ) {
		return;
	}

	modal.querySelector( '.blockish-modal-trigger' )?.setAttribute( 'aria-expanded', 'false' );

	const backdrop = modal.querySelector( '.blockish-modal-backdrop' );
	if ( ! backdrop ) {
		finishClose( modal );
		return;
	}

	const prefersReduced = window.matchMedia?.( '(prefers-reduced-motion: reduce)' )?.matches;
	if ( prefersReduced ) {
		finishClose( modal );
		return;
	}

	modal.classList.remove( 'is-open' );

	const onEnd = ( event ) => {
		if ( event.target !== backdrop ) {
			return;
		}
		backdrop.removeEventListener( 'transitionend', onEnd );
		if ( ! modal.classList.contains( 'is-open' ) ) {
			finishClose( modal );
		}
	};

	backdrop.addEventListener( 'transitionend', onEnd );
	modal._blockishModalTimer = window.setTimeout( () => {
		backdrop.removeEventListener( 'transitionend', onEnd );
		if ( ! modal.classList.contains( 'is-open' ) ) {
			finishClose( modal );
		}
	}, CLOSE_TIMEOUT_MS );
};

const openModal = ( modal, triggerEl = null ) => {
	const backdrop = modal.querySelector( '.blockish-modal-backdrop' );
	const dialog = modal.querySelector( '.blockish-modal-dialog' );
	if ( ! backdrop || ! dialog ) {
		return;
	}

	document.querySelectorAll( '.blockish-modal.is-open' ).forEach( ( other ) => {
		if ( other !== modal ) {
			closeModal( other );
		}
	} );

	if ( modal._blockishModalTimer ) {
		window.clearTimeout( modal._blockishModalTimer );
		modal._blockishModalTimer = null;
	}

	if ( typeof modal._blockishFixedEscape === 'function' ) {
		modal._blockishFixedEscape();
	}
	modal._blockishFixedEscape = acquireFixedEscape( modal, {
		overflow: true,
		containingBlock: true,
	} );

	modal._returnFocus = triggerEl || document.activeElement;
	backdrop.hidden = false;

	window.requestAnimationFrame( () => {
		modal.classList.add( 'is-open' );
		modal.querySelector( '.blockish-modal-trigger' )?.setAttribute( 'aria-expanded', 'true' );
		if ( modal.dataset.lockScroll !== 'false' ) {
			document.body.classList.add( 'blockish-modal-scroll-locked' );
		}
		const firstTarget = dialog.querySelector( FOCUSABLE_SELECTOR ) || dialog;
		firstTarget?.focus();
	} );
};

const mountModal = ( modal ) => {
	if ( modal._blockishModalMounted ) {
		return;
	}
	modal._blockishModalMounted = true;

	const trigger = modal.querySelector( '.blockish-modal-trigger' );
	const overlay = modal.querySelector( '.blockish-modal-overlay' );
	const closeBtn = modal.querySelector( '.blockish-modal-close' );

	trigger?.addEventListener( 'click', () => {
		if ( modal.classList.contains( 'is-open' ) ) {
			closeModal( modal );
		} else {
			openModal( modal, trigger );
		}
	} );

	overlay?.addEventListener( 'click', () => {
		if ( modal.dataset.closeOnOverlay !== 'false' ) {
			closeModal( modal );
		}
	} );

	closeBtn?.addEventListener( 'click', () => closeModal( modal ) );

	const extSelector = ( modal.dataset.triggerSelector || '' ).trim();
	if ( extSelector ) {
		try {
			document.querySelectorAll( extSelector ).forEach( ( el ) => {
				el.addEventListener( 'click', ( event ) => {
					if ( el.tagName === 'A' && el.getAttribute( 'href' ) === '#' ) {
						event.preventDefault();
					}
					openModal( modal, el );
				} );
			} );
		} catch {
			// Ignore malformed custom CSS selector.
		}
	}
};

document.addEventListener( 'keydown', ( event ) => {
	const open = document.querySelector( '.blockish-modal.is-open' );
	if ( ! open ) {
		return;
	}

	if ( event.key === 'Escape' && open.dataset.closeOnEsc !== 'false' ) {
		event.preventDefault();
		closeModal( open );
		return;
	}

	if ( event.key !== 'Tab' ) {
		return;
	}

	const dialog = open.querySelector( '.blockish-modal-dialog' );
	if ( ! dialog ) {
		return;
	}

	const focusables = Array.from( dialog.querySelectorAll( FOCUSABLE_SELECTOR ) ).filter(
		( el ) => el.offsetParent !== null
	);
	if ( focusables.length === 0 ) {
		event.preventDefault();
		dialog.focus();
		return;
	}

	const first = focusables[ 0 ];
	const last = focusables[ focusables.length - 1 ];

	if ( event.shiftKey && document.activeElement === first ) {
		event.preventDefault();
		last.focus();
	} else if ( ! event.shiftKey && document.activeElement === last ) {
		event.preventDefault();
		first.focus();
	}
} );

const initModals = () => {
	document.querySelectorAll( '.blockish-modal' ).forEach( mountModal );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initModals );
} else {
	initModals();
}

