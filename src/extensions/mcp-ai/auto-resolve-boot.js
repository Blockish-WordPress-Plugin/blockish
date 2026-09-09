import { resolveAllPendingPreviews } from './resolve-pending';

/**
 * On any editor load: write children for unresolved ai-preview queue items.
 */
const bootAiPreviewAutoResolve = () => {
	window.setTimeout( () => {
		resolveAllPendingPreviews().catch( ( e ) => {
			console.error( 'Blockish AI: auto-resolve failed', e );
		} );
	}, 800 );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', bootAiPreviewAutoResolve );
} else {
	bootAiPreviewAutoResolve();
}
