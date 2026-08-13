import { createBlock } from '@wordpress/blocks';
import { dispatch, select } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

const CLASS_POST_TYPE = 'blockish-classes';

export const blocksToSchema = ( blocks = [] ) => {
	return ( Array.isArray( blocks ) ? blocks : [] )
		.filter( ( block ) => block?.name )
		.map( ( block ) => ( {
			name: block.name,
			attributes: block.attributes || {},
			innerBlocks: blocksToSchema( block.innerBlocks || [] ),
		} ) );
};

export const collectClassIdsFromBlocks = ( blocks = [] ) => {
	const ids = new Set();
	const walk = ( list ) => {
		( Array.isArray( list ) ? list : [] ).forEach( ( block ) => {
			( block?.attributes?.classManager || [] ).forEach( ( item ) => {
				if ( item?.id ) {
					ids.add( item.id );
				}
			} );
			( block?.attributes?.classManagerSubselector || [] ).forEach( ( item ) => {
				if ( item?.id ) {
					ids.add( item.id );
				}
				if ( item?.parent ) {
					ids.add( item.parent );
				}
			} );
			walk( block?.innerBlocks || [] );
		} );
	};
	walk( blocks );
	return [ ...ids ];
};

export const editorHasAiPreview = () => {
	const blocks = select( 'core/block-editor' )?.getBlocks?.() || [];
	return blocks.some( ( block ) => block?.name === 'blockish/ai-preview' );
};

export const wrapEditorInAiPreview = ( {
	previousSchema,
	pendingSchema,
} = {} ) => {
	if ( ! window.wp?.blocks?.getBlockType?.( 'blockish/ai-preview' ) ) {
		return false;
	}
	if ( editorHasAiPreview() ) {
		return false;
	}

	const blocks = select( 'core/block-editor' )?.getBlocks?.() || [];
	if ( ! blocks.length ) {
		return false;
	}

	const previous = previousSchema || blocksToSchema( blocks );
	const pending = pendingSchema || blocksToSchema( blocks );

	const preview = createBlock(
		'blockish/ai-preview',
		{
			previousSchema: JSON.stringify( previous ),
			pendingSchema: JSON.stringify( pending ),
		},
		blocks
	);

	const editorDispatch = dispatch( 'core/editor' );
	if ( typeof editorDispatch?.resetEditorBlocks === 'function' ) {
		editorDispatch.resetEditorBlocks( [ preview ] );
		return true;
	}

	const blockDispatch = dispatch( 'core/block-editor' );
	if ( typeof blockDispatch?.resetBlocks === 'function' ) {
		blockDispatch.resetBlocks( [ preview ] );
		return true;
	}

	return false;
};

export const resolveClassPrevious = async ( action ) => {
	try {
		return await apiFetch( {
			path: '/blockish/v1/class-previous-content',
			method: 'POST',
			data: { action },
		} );
	} catch ( e ) {
		console.error( `Blockish Class Manager: failed to ${ action } previousContent`, e );
		return null;
	}
};

const STYLE_TYPE = 'blockish-classes-styles';
const CSS_META_KEY = 'blockishClassManagerStyles';

const applyClassStylesToEditor = ( records = [] ) => {
	const editorDispatch = dispatch( 'core/editor' );
	if ( typeof editorDispatch?.updateEditorSettings !== 'function' ) {
		return;
	}

	const css = ( Array.isArray( records ) ? records : [] )
		.map( ( record ) => record?.meta?.[ CSS_META_KEY ] || record?.css || '' )
		.join( '' );

	const settings = select( 'core/editor' )?.getEditorSettings?.() || {};
	const styles = Array.isArray( settings.styles ) ? [ ...settings.styles ] : [];
	const index = styles.findIndex( ( style ) => style?.__unstableType === STYLE_TYPE );
	const entry = { __unstableType: STYLE_TYPE, css };

	if ( index === -1 ) {
		styles.push( entry );
	} else {
		styles[ index ] = { ...styles[ index ], css };
	}

	editorDispatch.updateEditorSettings( { styles } );
};

export const refreshClassEntities = async ( extraIds = [] ) => {
	const coreDispatch = dispatch( 'core' );
	const coreSelect = select( 'core' );
	if ( ! coreDispatch || ! coreSelect ) {
		return;
	}

	const cached = coreSelect.getEntityRecords?.( 'postType', CLASS_POST_TYPE, { per_page: -1 } ) || [];
	const ids = new Set( [
		...cached.map( ( record ) => record?.id ).filter( Boolean ),
		...extraIds,
	] );

	ids.forEach( ( id ) => {
		if ( typeof coreDispatch.clearEntityRecordEdits === 'function' ) {
			coreDispatch.clearEntityRecordEdits( 'postType', CLASS_POST_TYPE, id );
		}
		coreDispatch.invalidateResolution?.( 'getEntityRecord', [ 'postType', CLASS_POST_TYPE, id ] );
	} );

	let fresh = [];
	try {
		fresh = await apiFetch( {
			path: '/wp/v2/blockish-classes?per_page=-1&context=edit',
		} );
	} catch ( e ) {
		console.error( 'Blockish Class Manager: failed to reload classes after preview', e );
	}

	if ( Array.isArray( fresh ) && typeof coreDispatch.receiveEntityRecords === 'function' ) {
		coreDispatch.receiveEntityRecords(
			'postType',
			CLASS_POST_TYPE,
			fresh,
			{ per_page: -1, context: 'edit' },
			true
		);
		coreDispatch.receiveEntityRecords(
			'postType',
			CLASS_POST_TYPE,
			fresh,
			{ per_page: -1 },
			true
		);
	}

	coreDispatch.invalidateResolution?.( 'getEntityRecords', [ 'postType', CLASS_POST_TYPE ] );
	coreDispatch.invalidateResolution?.( 'getEntityRecords', [ 'postType', CLASS_POST_TYPE, { per_page: -1 } ] );
	coreDispatch.invalidateResolution?.( 'getEntityRecords', [ 'postType', CLASS_POST_TYPE, { per_page: -1, parent: 0 } ] );

	applyClassStylesToEditor( Array.isArray( fresh ) ? fresh : [] );
};

export const maybeWrapPendingClasses = async () => {
	if ( editorHasAiPreview() ) {
		return false;
	}

	let pending = [];
	try {
		const response = await apiFetch( { path: '/blockish/v1/class-previous-content' } );
		pending = Array.isArray( response?.pending ) ? response.pending : [];
	} catch ( e ) {
		return false;
	}

	if ( ! pending.length ) {
		return false;
	}

	const pendingIds = new Set( pending.map( ( item ) => item?.id ).filter( Boolean ) );
	const usedIds = collectClassIdsFromBlocks( select( 'core/block-editor' )?.getBlocks?.() || [] );
	const usedPending = usedIds.some( ( id ) => pendingIds.has( id ) );

	if ( ! usedPending ) {
		return false;
	}

	return wrapEditorInAiPreview();
};
