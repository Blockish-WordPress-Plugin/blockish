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

export const fetchClassManagerCssBundle = async ( since = 0 ) => {
	const parsed = parseInt( since, 10 );
	const stamp = Number.isFinite( parsed ) && parsed > 0 ? parsed : 0;
	const path =
		stamp > 0
			? `/blockish/v1/class-manager-css?since=${ stamp }`
			: '/blockish/v1/class-manager-css';
	return apiFetch( { path } );
};

export const applyClassCssToEditor = ( css ) => {
	const editorDispatch = dispatch( 'core/editor' );
	if ( typeof editorDispatch?.updateEditorSettings !== 'function' ) {
		return;
	}

	const settings = select( 'core/editor' )?.getEditorSettings?.() || {};
	const styles = Array.isArray( settings.styles ) ? [ ...settings.styles ] : [];
	const index = styles.findIndex( ( style ) => style?.__unstableType === STYLE_TYPE );
	const entry = { __unstableType: STYLE_TYPE, css: typeof css === 'string' ? css : '' };

	if ( index === -1 ) {
		styles.push( entry );
	} else if ( styles[ index ]?.css === entry.css ) {
		return;
	} else {
		styles[ index ] = { ...styles[ index ], css: entry.css };
	}

	editorDispatch.updateEditorSettings( { styles } );
};

export const refreshClassEntities = async ( extraIds = [] ) => {
	const coreDispatch = dispatch( 'core' );
	if ( ! coreDispatch ) {
		return;
	}

	const ids = [ ...new Set( ( Array.isArray( extraIds ) ? extraIds : [] ).filter( Boolean ) ) ];

	ids.forEach( ( id ) => {
		if ( typeof coreDispatch.clearEntityRecordEdits === 'function' ) {
			coreDispatch.clearEntityRecordEdits( 'postType', CLASS_POST_TYPE, id );
		}
		coreDispatch.invalidateResolution?.( 'getEntityRecord', [ 'postType', CLASS_POST_TYPE, id ] );
	} );

	coreDispatch.invalidateResolution?.( 'getEntityRecords', [ 'postType', CLASS_POST_TYPE ] );
	coreDispatch.invalidateResolution?.( 'getEntityRecords', [ 'postType', CLASS_POST_TYPE, { per_page: -1 } ] );
	coreDispatch.invalidateResolution?.( 'getEntityRecords', [ 'postType', CLASS_POST_TYPE, { per_page: -1, parent: 0 } ] );

	try {
		const bundle = await fetchClassManagerCssBundle( 0 );
		if ( ! bundle?.unchanged ) {
			applyClassCssToEditor( bundle?.css || '' );
		}
	} catch ( e ) {
		console.error( 'Blockish Class Manager: failed to reload class CSS after preview', e );
	}
};
