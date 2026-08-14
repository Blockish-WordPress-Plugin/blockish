import { dispatch, select } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

const CLASS_POST_TYPE = 'blockish-classes';
export const CLASS_CSS_REGEN_EVENT = 'blockish-cm-regenerate-css';

/**
 * Re-run render-style.js generated-vs-meta CSS check after Accept/Discard.
 *
 * @param {number[]} classIds
 * @param {{ quiet?: boolean }} options quiet:true = saveEntityRecord (Accept).
 */
export const requestClassCssRegenerate = ( classIds = [], { quiet = false } = {} ) => {
	const fire = () => {
		window.dispatchEvent(
			new CustomEvent( CLASS_CSS_REGEN_EVENT, {
				detail: {
					classIds: Array.isArray( classIds ) ? classIds : [],
					quiet: !! quiet,
				},
			} )
		);
	};
	setTimeout( fire, 50 );
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

export const resolveClassPrevious = async ( action, extra = {} ) => {
	try {
		return await apiFetch( {
			path: '/blockish/v1/class-previous-content',
			method: 'POST',
			data: { action, ...extra },
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
