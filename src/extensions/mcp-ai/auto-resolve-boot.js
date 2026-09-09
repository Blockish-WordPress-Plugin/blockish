import {
	resolveAllPendingPreviews,
	resolvePendingPreviews,
} from './resolve-pending';

/**
 * Magic / automation entry: open any editor URL with
 * ?blockish_ai_resolve=1&blockish_ai_resolve_redirect=<frontendUrl>
 * Optional: &blockish_ai_resolve_ids=1,2,3
 *
 * Runs Accept-all-style resolve (no unwrap), then redirects to frontend.
 */
const bootAiPreviewResolveFromUrl = () => {
	const params = new URLSearchParams( window.location.search );
	if ( params.get( 'blockish_ai_resolve' ) !== '1' ) {
		return;
	}

	const redirect = params.get( 'blockish_ai_resolve_redirect' ) || '';
	const idsParam = params.get( 'blockish_ai_resolve_ids' ) || '';
	const ids = idsParam
		.split( ',' )
		.map( ( value ) => parseInt( value, 10 ) )
		.filter( ( id ) => Number.isFinite( id ) && id > 0 );

	const run = async () => {
		try {
			if ( ids.length ) {
				await resolvePendingPreviews( ids );
			} else {
				await resolveAllPendingPreviews();
			}
		} catch ( e ) {
			console.error( 'Blockish AI: queue resolve failed', e );
		}

		if ( redirect ) {
			window.location.href = redirect;
			return;
		}

		params.delete( 'blockish_ai_resolve' );
		params.delete( 'blockish_ai_resolve_redirect' );
		params.delete( 'blockish_ai_resolve_ids' );
		const next = `${ window.location.pathname }${
			params.toString() ? `?${ params.toString() }` : ''
		}${ window.location.hash || '' }`;
		window.history.replaceState( {}, '', next );
	};

	// Let block registration settle (same editor session as Accept all).
	window.setTimeout( run, 800 );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', bootAiPreviewResolveFromUrl );
} else {
	bootAiPreviewResolveFromUrl();
}
