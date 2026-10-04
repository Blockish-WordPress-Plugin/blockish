/**
 * Convert Blockish block_schema nodes → Gutenberg blocks → serialized markup.
 *
 * Always use createBlock + serialize (block editor is loaded on the library screen).
 * Never hand-roll <!-- wp: --> comments — that caused block recovery errors.
 */
import { createBlock, serialize } from '@wordpress/blocks';

/**
 * Omit empty attrs that WordPress parses as invalid (e.g. padding:{} → []).
 *
 * @param {Object} attrs
 * @param {string} blockName
 * @return {Object}
 */
function sanitizeAttributes( attrs, blockName ) {
	if ( ! attrs || typeof attrs !== 'object' || Array.isArray( attrs ) ) {
		return {};
	}

	if ( blockName === 'core/query' || blockName === 'core/post-template' ) {
		return attrs;
	}

	const out = {};

	for ( const [ key, value ] of Object.entries( attrs ) ) {
		if ( value === '' || value === null || value === undefined ) {
			continue;
		}

		if ( Array.isArray( value ) && value.length === 0 ) {
			continue;
		}

		if ( typeof value === 'object' && ! Array.isArray( value ) ) {
			if ( Object.keys( value ).length === 0 ) {
				continue;
			}
			const nested = sanitizeAttributes( value, blockName );
			if ( Object.keys( nested ).length > 0 ) {
				out[ key ] = nested;
			}
			continue;
		}

		out[ key ] = value;
	}

	return out;
}

/**
 * @param {Array<{name:string, attributes?:Object, innerBlocks?:Array}>} nodes
 * @return {import('@wordpress/blocks').BlockInstance[]}
 */
export function schemaToBlocks( nodes ) {
	if ( ! Array.isArray( nodes ) ) {
		return [];
	}

	return nodes
		.map( ( node ) => {
			if ( ! node?.name ) {
				return null;
			}
			try {
				const inner = Array.isArray( node.innerBlocks )
					? schemaToBlocks( node.innerBlocks )
					: [];
				return createBlock(
					node.name,
					sanitizeAttributes( node.attributes || {}, node.name ),
					inner
				);
			} catch ( e ) {
				return null;
			}
		} )
		.filter( Boolean );
}

/**
 * @param {Array} nodes block_schema
 * @return {string} Block markup for post_content
 */
export function schemaToMarkup( nodes ) {
	const blocks = schemaToBlocks( nodes );
	if ( ! blocks.length ) {
		return '';
	}
	return serialize( blocks );
}
