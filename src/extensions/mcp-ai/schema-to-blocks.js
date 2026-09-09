import { createBlock } from '@wordpress/blocks';

/**
 * Parse pendingSchema / previousSchema attribute (JSON string or array).
 *
 * @param {unknown} value
 * @return {Object[]}
 */
export const parseSchemaAttr = ( value ) => {
	if ( ! value ) {
		return [];
	}
	if ( Array.isArray( value ) ) {
		return value;
	}
	try {
		const parsed = typeof value === 'string' ? JSON.parse( value ) : value;
		if ( Array.isArray( parsed ) ) {
			return parsed;
		}
		if ( parsed && typeof parsed === 'object' && parsed.name ) {
			return [ parsed ];
		}
	} catch ( e ) {
		console.error( 'Blockish AI: failed to parse schema attribute', e );
	}
	return [];
};

/**
 * Schema node → block instance.
 *
 * @param {Object} node
 * @return {Object|null}
 */
export const schemaNodeToBlock = ( node ) => {
	if ( ! node || typeof node !== 'object' || ! node.name ) {
		return null;
	}
	try {
		const innerBlocks = Array.isArray( node.innerBlocks )
			? node.innerBlocks.map( schemaNodeToBlock ).filter( Boolean )
			: [];
		return createBlock( node.name, node.attributes || {}, innerBlocks );
	} catch ( e ) {
		console.error(
			'Blockish AI: failed to create block from schema node',
			node?.name,
			e
		);
		return null;
	}
};

/**
 * Schema nodes → InnerBlocks template tuples.
 *
 * @param {Object} node
 * @return {Array|null}
 */
export const schemaNodeToTemplate = ( node ) => {
	if ( ! node || typeof node !== 'object' || ! node.name ) {
		return null;
	}
	const attrs = node.attributes || {};
	const children = Array.isArray( node.innerBlocks )
		? node.innerBlocks.map( schemaNodeToTemplate ).filter( Boolean )
		: [];
	return children.length ? [ node.name, attrs, children ] : [ node.name, attrs ];
};

/**
 * @param {Object[]} nodes
 * @return {Object[]}
 */
export const schemaToBlocks = ( nodes ) =>
	( Array.isArray( nodes ) ? nodes : [] )
		.map( schemaNodeToBlock )
		.filter( Boolean );
