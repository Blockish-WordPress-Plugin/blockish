// Toggles the `is-collapsed` class on the navigation wrapper based on
// viewport width. Mirrors the editor's device-preview logic (navigation/
// edit.js) but driven by matchMedia on the real frontend. tablet/mobile use
// fixed widths; "custom" reads the per-block px value from a data attribute.
const BREAKPOINTS = { tablet: 1024, mobile: 768 };

const initNavigation = ( nav ) => {
	const breakpoint = nav.dataset.menuBreakpoint || 'tablet';
	const maxWidth =
		breakpoint === 'custom'
			? parseInt( nav.dataset.customBreakpoint, 10 ) || 1024
			: BREAKPOINTS[ breakpoint ] || 1024;

	const mediaQuery = window.matchMedia( `(max-width: ${ maxWidth }px)` );
	const sync = () => nav.classList.toggle( 'is-collapsed', mediaQuery.matches );

	sync();
	mediaQuery.addEventListener( 'change', sync );
};

const init = () => {
	document.querySelectorAll( '.blockish-navigation' ).forEach( initNavigation );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
