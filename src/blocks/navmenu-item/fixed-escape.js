/**
 * Temporarily neutralize ancestors that clip or contain `position: fixed`
 * (overflow, transform, filter, backdrop-filter, …).
 *
 * Header/containers often use overflow:hidden + glass blur. That is fine for
 * chrome, but it traps nav dropdowns and the offcanvas panel. Callers acquire
 * while open and release on close — no manual overflow:visible on the header.
 *
 * @param {HTMLElement} from Start walking from this node's parents.
 * @param {{ overflow?: boolean, containingBlock?: boolean }} [opts]
 * @return {() => void} Release function (refcount-safe for shared ancestors).
 */
export function acquireFixedEscape( from, opts = {} ) {
	const overflow = opts.overflow !== false;
	const containingBlock = opts.containingBlock === true;

	if ( ! from?.parentElement ) {
		return () => {};
	}

	const doc = from.ownerDocument;
	const win = doc.defaultView || window;
	const touched = [];
	let node = from.parentElement;

	while ( node && node !== doc.documentElement && node !== doc.body ) {
		const computed = win.getComputedStyle( node );
		const needOverflow = overflow && isClippingOverflow( computed );
		const needContaining =
			containingBlock && isFixedContainingBlock( computed );

		if ( needOverflow || needContaining ) {
			let entry = locks.get( node );
			if ( ! entry ) {
				entry = {
					count: 0,
					style: {
						overflow: node.style.overflow,
						overflowX: node.style.overflowX,
						overflowY: node.style.overflowY,
						transform: node.style.transform,
						filter: node.style.filter,
						backdropFilter: node.style.backdropFilter,
						webkitBackdropFilter: node.style.webkitBackdropFilter,
					},
					flags: {
						overflow: false,
						containingBlock: false,
					},
				};
				locks.set( node, entry );
				node.dataset.blockishFixedEscape = '1';
			}

			if ( needOverflow && ! entry.flags.overflow ) {
				node.style.overflow = 'visible';
				node.style.overflowX = 'visible';
				node.style.overflowY = 'visible';
				entry.flags.overflow = true;
			}

			if ( needContaining && ! entry.flags.containingBlock ) {
				node.style.transform = 'none';
				node.style.filter = 'none';
				node.style.backdropFilter = 'none';
				node.style.webkitBackdropFilter = 'none';
				entry.flags.containingBlock = true;
			}

			entry.count += 1;
			touched.push( node );
		}

		node = node.parentElement;
	}

	return () => {
		touched.forEach( ( el ) => {
			const entry = locks.get( el );
			if ( ! entry ) {
				return;
			}
			entry.count -= 1;
			if ( entry.count > 0 ) {
				return;
			}
			const saved = entry.style;
			el.style.overflow = saved.overflow;
			el.style.overflowX = saved.overflowX;
			el.style.overflowY = saved.overflowY;
			el.style.transform = saved.transform;
			el.style.filter = saved.filter;
			el.style.backdropFilter = saved.backdropFilter;
			el.style.webkitBackdropFilter = saved.webkitBackdropFilter;
			delete el.dataset.blockishFixedEscape;
			locks.delete( el );
		} );
	};
}

const CLIP_OVERFLOW = /^(auto|scroll|hidden|clip)$/i;

/** @type {WeakMap<Element, { count: number, style: Object, flags: Object }>} */
const locks = new WeakMap();

/**
 * @param {CSSStyleDeclaration} style
 * @return {boolean} Whether overflow clips descendants.
 */
function isClippingOverflow( style ) {
	return (
		CLIP_OVERFLOW.test( style.overflow ) ||
		CLIP_OVERFLOW.test( style.overflowX ) ||
		CLIP_OVERFLOW.test( style.overflowY )
	);
}

/**
 * @param {CSSStyleDeclaration} style
 * @return {boolean} Whether this node is a containing block for position:fixed.
 */
function isFixedContainingBlock( style ) {
	const transform = style.transform;
	const filter = style.filter;
	const perspective = style.perspective;
	const contain = style.contain || '';
	const willChange = style.willChange || '';
	const backdrop =
		style.backdropFilter || style.webkitBackdropFilter || 'none';

	return (
		( transform && transform !== 'none' ) ||
		( filter && filter !== 'none' ) ||
		( perspective && perspective !== 'none' ) ||
		contain.split( ' ' ).includes( 'paint' ) ||
		willChange.includes( 'transform' ) ||
		( backdrop && backdrop !== 'none' )
	);
}
