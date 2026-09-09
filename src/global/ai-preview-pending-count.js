import apiFetch from '@wordpress/api-fetch';

export const AI_PREVIEW_PENDING_COUNT_EVENT =
	'blockish-ai-preview-pending-count';

export function notifyAiPreviewPendingCount( count ) {
	const next = Math.max( 0, Number( count ) || 0 );
	window.dispatchEvent(
		new CustomEvent( AI_PREVIEW_PENDING_COUNT_EVENT, {
			detail: { count: next },
		} )
	);
	return next;
}

export async function fetchAiPreviewPendingCount() {
	try {
		const response = await apiFetch( {
			path: '/blockish/v1/ai-preview-queue/count',
		} );
		return Math.max( 0, Number( response?.count ) || 0 );
	} catch ( error ) {
		return 0;
	}
}

export function formatAiPreviewPendingCount( count ) {
	const next = Math.max( 0, Number( count ) || 0 );
	if ( next > 99 ) {
		return '99+';
	}
	return String( next );
}
