import { createBlock, serialize } from '@wordpress/blocks';
import { dispatch, select } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';
import { schemaToBlocks } from './schema-to-blocks';

const absint = ( value ) => {
	const id = parseInt( value, 10 );
	return Number.isFinite( id ) && id > 0 ? id : 0;
};

const toSchemaAttr = ( value ) => {
	if ( typeof value === 'string' ) {
		return value;
	}
	return JSON.stringify( Array.isArray( value ) ? value : [] );
};

export const collectNestedEntityIds = ( nodes, ids = new Set() ) => {
	if ( ! Array.isArray( nodes ) ) {
		return ids;
	}
	nodes.forEach( ( node ) => {
		if ( ! node || typeof node !== 'object' ) {
			return;
		}
		if ( node.name === 'core/block' && node.attributes?.ref ) {
			ids.add( absint( node.attributes.ref ) );
		}
		if ( node.name === 'blockish-forms/form' && node.attributes?.formId ) {
			ids.add( absint( node.attributes.formId ) );
		}
		if (
			node.name === 'blockish/navmenu-megamenu' &&
			node.attributes?.megamenuId
		) {
			ids.add( absint( node.attributes.megamenuId ) );
		}
		if ( Array.isArray( node.innerBlocks ) ) {
			collectNestedEntityIds( node.innerBlocks, ids );
		}
	} );
	return ids;
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
 * Same nesting order as Settings Accept all — nested entities first.
 *
 * @param {number[]} rootIds
 * @return {Promise<number[]>}
 */
export const prepareResolveOrder = async ( rootIds ) => {
	const orderedIds = [];
	const seen = new Set();

	const prepare = async ( id ) => {
		if ( ! id || seen.has( id ) ) {
			return;
		}
		seen.add( id );
		const item = await fetchQueueItem( id );
		if ( ! item ) {
			return;
		}
		const schema = item.pendingSchema || [];
		const nested = [ ...collectNestedEntityIds( schema ) ].filter(
			( nestedId ) => nestedId !== id
		);
		for ( const nestedId of nested ) {
			await prepare( nestedId );
		}
		orderedIds.push( id );
	};

	for ( const id of rootIds ) {
		await prepare( id );
	}

	return orderedIds;
};

/**
 * Accept-all conversion, but keep ai-preview wrapper and write children inside it.
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

const isCurrentEditorPost = ( queueItem ) => {
	const currentId = select( 'core/editor' )?.getCurrentPostId?.();
	if ( currentId == null ) {
		return false;
	}
	return (
		currentId === queueItem.id ||
		String( currentId ) === String( queueItem.id ) ||
		String( currentId ) === String( queueItem.rest_id || '' )
	);
};

const syncResolvedChildrenInEditor = ( queueItem ) => {
	if ( ! isCurrentEditorPost( queueItem ) ) {
		return;
	}
	const preview = ( select( 'core/block-editor' ).getBlocks?.() || [] ).find(
		( block ) => block.name === 'blockish/ai-preview'
	);
	if ( ! preview?.clientId ) {
		return;
	}
	const innerBlocks = schemaToBlocks( queueItem.pendingSchema || [] );
	dispatch( 'core/block-editor' ).replaceInnerBlocks(
		preview.clientId,
		innerBlocks,
		false
	);
};

/**
 * Resolve pending previews like Accept all, without unwrap.
 *
 * @param {number[]} ids
 * @return {Promise<{ resolved: number[], skipped: number[] }>}
 */
export const resolvePendingPreviews = async ( ids ) => {
	const nextIds = [ ...new Set( ( ids || [] ).filter( Boolean ) ) ];
	const resolved = [];
	const skipped = [];

	if ( ! nextIds.length ) {
		return { resolved, skipped };
	}

	const orderedIds = await prepareResolveOrder( nextIds );
	const idsToRun = orderedIds.length ? orderedIds : nextIds;

	for ( const id of idsToRun ) {
		const queueItem = await fetchQueueItem( id );
		if ( ! queueItem?.pendingSchema?.length ) {
			skipped.push( id );
			continue;
		}
		const content = buildResolvedPreviewContent( queueItem );
		await savePostContent( queueItem, content );
		syncResolvedChildrenInEditor( queueItem );
		resolved.push( id );
	}

	return { resolved, skipped };
};

/**
 * Resolve every item currently in the AI preview queue.
 *
 * @return {Promise<{ resolved: number[], skipped: number[] }>}
 */
export const resolveAllPendingPreviews = async () => {
	const response = await apiFetch( { path: '/blockish/v1/ai-preview-queue' } );
	const items = Array.isArray( response?.items ) ? response.items : [];
	const ids = items.map( ( item ) => item.id ).filter( Boolean );
	return resolvePendingPreviews( ids );
};
