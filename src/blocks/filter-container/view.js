/**
 * Filter Container front end. Items are the blocks inside with filter terms
 * or search keywords (data attributes added on render). Buttons are built
 * from the terms; the search box matches the declared keywords and terms,
 * and block text only when the container opts in.
 */

const TAGGED = '[data-blockish-filter-terms], [data-blockish-search-keywords]';

const parseTerms = ( value ) => {
	const seen = new Set();
	return String( value || '' )
		.split( ',' )
		.map( ( term ) => term.trim() )
		.filter( ( term ) => {
			const key = term.toLowerCase();
			if ( ! term || seen.has( key ) ) {
				return false;
			}
			seen.add( key );
			return true;
		} );
};

const setup = ( root ) => {
	// Tagged blocks of this container (not of a nested Filter Container).
	const own = ( nodes ) =>
		nodes.filter( ( el ) => el.closest( '.blockish-filter-container' ) === root );
	const isTagged = ( el ) =>
		el.hasAttribute( 'data-blockish-filter-terms' ) || el.hasAttribute( 'data-blockish-search-keywords' );

	// An item is the outermost tagged block, e.g. a card. Terms and keywords
	// on tagged blocks inside it (its heading, an inner container) count for
	// the card, so a card is filtered as a whole, never partly hidden.
	const isOutermost = ( el ) => {
		for ( let node = el.parentElement; node && node !== root; node = node.parentElement ) {
			if ( isTagged( node ) ) {
				return false;
			}
		}
		return true;
	};
	const items = own( Array.from( root.querySelectorAll( TAGGED ) ) )
		.filter( isOutermost )
		.map( ( el ) => {
			const nodes = [ el, ...own( Array.from( el.querySelectorAll( TAGGED ) ) ) ];
			const collect = ( key ) => parseTerms( nodes.map( ( node ) => node.dataset[ key ] ).join( ',' ) );
			const terms = collect( 'blockishFilterTerms' );
			const keys = terms.map( ( term ) => term.toLowerCase() );
			return {
				el,
				terms,
				keys,
				words: [ ...keys, ...collect( 'blockishSearchKeywords' ).map( ( word ) => word.toLowerCase() ) ],
				text: ( el.textContent || '' ).toLowerCase(),
			};
		} );
	if ( ! items.length ) {
		return;
	}

	const controls = root.querySelector( ':scope > .blockish-filter-controls' );
	const search = controls?.querySelector( '.blockish-filter-search' );
	const buttonsBox = controls?.querySelector( '.blockish-filter-buttons' );
	const empty = root.querySelector( ':scope > .blockish-filter-empty' );
	const status = root.querySelector( ':scope > .blockish-filter-status' );
	const multiple = root.dataset.filterMode === 'multiple';
	const searchText = root.dataset.searchText === 'true';
	const active = new Set();
	let query = [];

	// Every typed word must match one of the item's keywords or terms
	// (or its text, when opted in), so "brand studio" needs both.
	const matches = ( item ) =>
		query.every(
			( word ) =>
				item.words.some( ( value ) => value.includes( word ) ) ||
				( searchText && item.text.includes( word ) )
		);

	const apply = () => {
		let shown = 0;
		items.forEach( ( item ) => {
			const byButton = ! active.size || item.keys.some( ( key ) => active.has( key ) );
			const show = byButton && matches( item );
			const wasHidden = item.el.classList.contains( 'blockish-filter-hidden' );
			item.el.classList.toggle( 'blockish-filter-hidden', ! show );
			if ( show && wasHidden ) {
				item.el.classList.remove( 'blockish-filter-in' );
				void item.el.offsetWidth; // restart the entrance animation
				item.el.classList.add( 'blockish-filter-in' );
			}
			shown += show ? 1 : 0;
		} );
		if ( empty ) {
			empty.hidden = shown > 0;
		}
		if ( status ) {
			status.textContent = `${ shown } / ${ items.length }`;
		}
	};

	if ( buttonsBox ) {
		const terms = parseTerms( items.flatMap( ( item ) => item.terms ).join( ',' ) );
		const buttons = [];
		const sync = () =>
			buttons.forEach( ( { button, key } ) => {
				const on = key ? active.has( key ) : ! active.size;
				button.classList.toggle( 'is-active', on );
				button.setAttribute( 'aria-pressed', on ? 'true' : 'false' );
			} );
		const add = ( label, key ) => {
			const button = document.createElement( 'button' );
			button.type = 'button';
			button.className = 'blockish-filter-button';
			button.textContent = label;
			button.addEventListener( 'click', () => {
				if ( ! key ) {
					active.clear();
				} else if ( multiple ) {
					active[ active.has( key ) ? 'delete' : 'add' ]( key );
				} else {
					const wasOn = active.has( key );
					active.clear();
					if ( ! wasOn ) {
						active.add( key );
					}
				}
				sync();
				apply();
			} );
			buttons.push( { button, key } );
			buttonsBox.appendChild( button );
		};
		add( buttonsBox.dataset.allLabel || 'All', null );
		terms.forEach( ( term ) => add( term, term.toLowerCase() ) );
		sync();
	}

	if ( search ) {
		search.addEventListener( 'input', () => {
			query = search.value.trim().toLowerCase().split( /\s+/ ).filter( Boolean );
			apply();
		} );
	}

	apply();
};

const init = () => document.querySelectorAll( '.blockish-filter-container' ).forEach( setup );

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}
