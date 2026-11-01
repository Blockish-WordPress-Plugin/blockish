/**
 * Shared “Show on” helpers for Theme Builder parts.
 */
import { __, sprintf } from '@wordpress/i18n';

export const SHOW_ON_OPTIONS = [
	{ label: __( 'Entire site', 'blockish' ), value: 'entire_site' },
	{ label: __( 'Front page only', 'blockish' ), value: 'front_page' },
	{ label: __( 'All single posts & pages', 'blockish' ), value: 'singular' },
	{ label: __( 'Blog posts only', 'blockish' ), value: 'post_type:post' },
	{ label: __( 'Pages only', 'blockish' ), value: 'post_type:page' },
	{ label: __( 'All archive pages', 'blockish' ), value: 'archive' },
	{ label: __( 'Search results', 'blockish' ), value: 'search' },
	{ label: __( '404 page', 'blockish' ), value: '404' },
];

export function conditionsFromShowOn( showOn ) {
	if ( showOn && showOn.startsWith( 'post_type:' ) ) {
		return [
			{
				type: 'include',
				rule: 'post_type',
				value: showOn.slice( 'post_type:'.length ) || 'post',
			},
		];
	}
	return [ { type: 'include', rule: showOn || 'entire_site' } ];
}

export function showOnFromConditions( conditions ) {
	const first = Array.isArray( conditions ) ? conditions[ 0 ] : null;
	if ( ! first || first.type === 'exclude' ) {
		return 'entire_site';
	}
	if ( first.rule === 'post_type' ) {
		const value = first.value || 'post';
		if ( value === 'post' || value === 'page' ) {
			return `post_type:${ value }`;
		}
		return 'entire_site';
	}
	const known = SHOW_ON_OPTIONS.map( ( o ) => o.value );
	return known.includes( first.rule ) ? first.rule : 'entire_site';
}

export function showOnLabel( showOn ) {
	const row = SHOW_ON_OPTIONS.find( ( o ) => o.value === showOn );
	return row?.label || showOn || __( 'Entire site', 'blockish' );
}

export function getMeta( item, key ) {
	return item?.meta?.[ key ] ?? item?.[ key ] ?? '';
}

/**
 * Stable key for area + display rule collisions.
 *
 * @param {string} area
 * @param {string} showOn
 */
export function partPlacementKey( area, showOn ) {
	return `${ ( area || '' ).toLowerCase() }|${ showOn || 'entire_site' }`;
}

/**
 * Map existing part records → placement occupancy.
 *
 * @param {Array} records
 * @param {number} [excludeId]
 * @return {Map<string, { id:number, title:string, area:string, showOn:string }>}
 */
export function getPartPlacementMap( records, excludeId = 0 ) {
	const map = new Map();
	( records || [] ).forEach( ( item ) => {
		if ( ! item?.id || ( excludeId && item.id === excludeId ) ) {
			return;
		}
		if ( getMeta( item, 'blockish_tb_kind' ) !== 'part' ) {
			return;
		}
		const partSlug = ( getMeta( item, 'blockish_tb_slug' ) || '' ).toLowerCase();
		// Only header/footer use Area + Show on placement.
		if ( partSlug !== 'header' && partSlug !== 'footer' ) {
			return;
		}
		const area = (
			getMeta( item, 'blockish_tb_area' ) ||
			getMeta( item, 'blockish_tb_slug' ) ||
			''
		).toLowerCase();
		if ( ! area ) {
			return;
		}
		const conditions = getMeta( item, 'blockish_tb_conditions' );
		const showOn = showOnFromConditions(
			Array.isArray( conditions ) ? conditions : []
		);
		const key = partPlacementKey( area, showOn );
		if ( ! map.has( key ) ) {
			const title =
				typeof item.title === 'string'
					? item.title
					: item.title?.raw || item.title?.rendered || '';
			map.set( key, {
				id: item.id,
				title: title || __( '(Untitled)', 'blockish' ),
				area,
				showOn,
			} );
		}
	} );
	return map;
}

/**
 * Whether another part already owns this area + Show on.
 *
 * @param {string} area
 * @param {string} showOn
 * @param {Map} placementMap
 */
export function isShowOnTaken( area, showOn, placementMap ) {
	return placementMap.has( partPlacementKey( area, showOn ) );
}

/**
 * Build Show-on select options.
 * Taken placements are omitted (SelectControl often ignores option.disabled).
 * Pass currentShowOn so the editor keeps the part’s own value visible.
 *
 * @param {string} area
 * @param {Map} placementMap
 * @param {string} [currentShowOn]
 */
export function getShowOnSelectOptions( area, placementMap, currentShowOn = '' ) {
	return SHOW_ON_OPTIONS.filter( ( opt ) => {
		const taken = placementMap.get( partPlacementKey( area, opt.value ) );
		if ( ! taken ) {
			return true;
		}
		// Keep this part’s current value in the list so the control stays valid.
		return currentShowOn && opt.value === currentShowOn;
	} ).map( ( opt ) => {
		const taken = placementMap.get( partPlacementKey( area, opt.value ) );
		const isCurrent = currentShowOn && opt.value === currentShowOn;
		if ( taken && isCurrent ) {
			return {
				...opt,
				label: sprintf(
					/* translators: %s: show-on label */
					__( '%s (current)', 'blockish' ),
					opt.label
				),
			};
		}
		return { ...opt };
	} );
}

/**
 * Short summary of locations already used for an area (for help text).
 *
 * @param {string} area
 * @param {Map} placementMap
 * @param {string} [excludeShowOn]
 */
export function takenShowOnSummary( area, placementMap, excludeShowOn = '' ) {
	const bits = [];
	SHOW_ON_OPTIONS.forEach( ( opt ) => {
		if ( excludeShowOn && opt.value === excludeShowOn ) {
			return;
		}
		const taken = placementMap.get( partPlacementKey( area, opt.value ) );
		if ( taken ) {
			bits.push(
				sprintf(
					/* translators: 1: show-on label, 2: part title */
					__( '%1$s → “%2$s”', 'blockish' ),
					opt.label,
					taken.title
				)
			);
		}
	} );
	return bits;
}

/**
 * First free Show-on value for an area (prefers entire_site).
 *
 * @param {string} area
 * @param {Map} placementMap
 * @return {string|null} null if every location is taken
 */
export function firstAvailableShowOn( area, placementMap ) {
	for ( const opt of SHOW_ON_OPTIONS ) {
		if ( ! placementMap.has( partPlacementKey( area, opt.value ) ) ) {
			return opt.value;
		}
	}
	return null;
}

export function suggestPartName( areaLabel, showOn ) {
	const where = showOnLabel( showOn );
	if ( ! areaLabel ) {
		return where;
	}
	return `${ areaLabel } — ${ where }`;
}

/**
 * WooCommerce / slug-based parts — loaded by catalog slug, not Show on rules.
 *
 * @param {string} slug
 * @param {Array<{slug:string,group?:string}>} [catalog]
 * @return {boolean}
 */
export function isSlugBasedPartSlug( slug, catalog ) {
	const key = ( slug || '' ).toLowerCase();
	return ( catalog || [] ).some(
		( row ) => row.group === 'woocommerce' && row.slug === key
	);
}
