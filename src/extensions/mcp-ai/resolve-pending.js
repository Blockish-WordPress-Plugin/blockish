import { createBlock, serialize } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';
import { schemaToBlocks } from './schema-to-blocks';

const toSchemaAttr = ( value ) => {
	if ( typeof value === 'string' ) {
		return value;
	}
	return JSON.stringify( Array.isArray( value ) ? value : [] );
};

export const fetchQueueItem = async ( id ) => {
	try {
		return await apiFetch( { path: `/blockish/v1/ai-preview-queue/${ id }` } );
	} catch ( e ) {
		return null;
	}
};

export const savePostContent = async ( item, content ) => {
	const route = item?.rest_route;
	if ( ! route ) {
		throw new Error( `No REST route for preview ${ item?.id || 0 }.` );
	}
	await apiFetch( {
		path: route,
		method: 'POST',
		data: { content },
	} );
};

/**
 * Write pendingSchema as children inside ai-preview (no unwrap).
 *
 * @param {Object} queueItem
 * @return {string}
 */
export const buildResolvedPreviewContent = ( queueItem ) => {
	const pending = queueItem?.pendingSchema || [];
	const previous = queueItem?.previousSchema || [];
	const innerBlocks = schemaToBlocks( pending );
	const preview = createBlock(
		'blockish/ai-preview',
		{
			pendingSchema: toSchemaAttr( pending ),
			previousSchema: toSchemaAttr( previous ),
		},
		innerBlocks
	);
	return serialize( [ preview ] );
};

/**
 * Resolve only the given pending IDs. No nested cascade, no editor canvas sync —
 * REST save only; FE reads saved children. Editor open reloads from content.
 *
 * @param {number[]} ids
 * @param {{ force?: boolean }} [options] force=true rewrites even if already resolved
 * @return {Promise<{ resolved: number[], skipped: number[] }>}
 */
export const resolvePendingPreviews = async ( ids, options = {} ) => {
	const nextIds = [ ...new Set( ( ids || [] ).filter( Boolean ) ) ];
	const resolved = [];
	const skipped = [];
	const force = Boolean( options.force );

	if ( ! nextIds.length ) {
		return { resolved, skipped };
	}

	for ( const id of nextIds ) {
		const queueItem = await fetchQueueItem( id );
		if ( ! queueItem?.pendingSchema?.length ) {
			skipped.push( id );
			continue;
		}
		if ( ! force && queueItem.resolved ) {
			skipped.push( id );
			continue;
		}
		const content = buildResolvedPreviewContent( queueItem );
		await savePostContent( queueItem, content );
		resolved.push( id );
	}

	return { resolved, skipped };
};

/**
 * Resolve every unresolved item in the AI preview queue.
 *
 * @return {Promise<{ resolved: number[], skipped: number[] }>}
 */
export const resolveAllPendingPreviews = async () => {
	const response = await apiFetch( { path: '/blockish/v1/ai-preview-queue' } );
	const items = Array.isArray( response?.items ) ? response.items : [];
	const ids = items
		.filter( ( item ) => item?.id && ! item.resolved )
		.map( ( item ) => item.id );
	return resolvePendingPreviews( ids );
};
