import { createRoot } from '@wordpress/element';
import domReady from '@wordpress/dom-ready';
import App from './app';

const LIBRARY_ROOT_CLASS = 'blockish-tb-library-root';
const LIBRARY_APP_CLASS = 'blockish-tb-library-app';

const replaceEditorWithLibrary = () => {
	const current = document.getElementById( 'editor' );
	if ( ! current ) {
		return;
	}

	if (
		current.classList.contains( LIBRARY_ROOT_CLASS ) &&
		current.querySelector( `.${ LIBRARY_APP_CLASS }` )
	) {
		return;
	}

	const next = document.createElement( 'div' );
	next.id = 'editor';
	next.className = `${ LIBRARY_ROOT_CLASS } hide-if-no-js`;
	current.replaceWith( next );
	createRoot( next ).render( <App /> );
};

const mountAfterEditorReady = () => {
	replaceEditorWithLibrary();
	requestAnimationFrame( () => {
		replaceEditorWithLibrary();
		requestAnimationFrame( replaceEditorWithLibrary );
	} );
};

/**
 * Show the Theme Builder library (templates / parts list) instead of the block canvas.
 */
export function mountLibrary() {
	domReady( () => {
		const editorBoot = window._wpLoadBlockEditor;
		if ( editorBoot && typeof editorBoot.then === 'function' ) {
			editorBoot.then( mountAfterEditorReady ).catch( mountAfterEditorReady );
		} else {
			mountAfterEditorReady();
		}

		const host = document.querySelector( '.block-editor' ) || document.body;
		const observer = new MutationObserver( () => {
			const el = document.getElementById( 'editor' );
			if ( el && ! el.classList.contains( LIBRARY_ROOT_CLASS ) ) {
				replaceEditorWithLibrary();
			}
		} );
		observer.observe( host, { childList: true, subtree: true } );
	} );
}
