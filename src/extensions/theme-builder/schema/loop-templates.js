/**
 * Which Theme Builder template slugs get the post grid loop (post 4288 design).
 */

import { createQueryLoop } from './fragments';

import homeMain from './templates/home.main.json';
import archiveMain from './templates/archive.main.json';
import searchMain from './templates/search.main.json';

/** Blog listing — post-title + core/query loop. */
export const HOME_LOOP_SLUGS = [ 'home', 'index' ];

/** Archive listing — query-title + core/query loop. */
export const ARCHIVE_LOOP_SLUGS = [
	'archive',
	'author',
	'category',
	'date',
	'tag',
];

/** Search results — query-title + search form + core/query loop. */
export const SEARCH_LOOP_SLUGS = [ 'search' ];

/**
 * @param {string} slug
 * @return {boolean}
 */
export function isHomeLoopSlug( slug ) {
	return HOME_LOOP_SLUGS.includes( slug );
}

/**
 * @param {string} slug
 * @return {boolean}
 */
export function isArchiveLoopSlug( slug ) {
	if ( ARCHIVE_LOOP_SLUGS.includes( slug ) ) {
		return true;
	}
	return (
		slug.startsWith( 'archive-' ) ||
		slug.startsWith( 'taxonomy-' ) ||
		slug.startsWith( 'category-' ) ||
		slug.startsWith( 'tag-' )
	);
}

/**
 * @param {string} slug
 * @return {boolean}
 */
export function isSearchLoopSlug( slug ) {
	return SEARCH_LOOP_SLUGS.includes( slug );
}

/**
 * @param {string} slug
 * @return {boolean}
 */
export function isLoopTemplateSlug( slug ) {
	return (
		isHomeLoopSlug( slug ) ||
		isArchiveLoopSlug( slug ) ||
		isSearchLoopSlug( slug )
	);
}

/**
 * Main-inner blocks before the shared query loop for this slug.
 *
 * @param {string} slug
 * @return {Array}
 */
export function getLoopPrefixBlocks( slug ) {
	if ( isHomeLoopSlug( slug ) ) {
		return homeMain;
	}
	if ( isSearchLoopSlug( slug ) ) {
		return searchMain;
	}
	if ( isArchiveLoopSlug( slug ) ) {
		return archiveMain;
	}
	return [];
}

/**
 * Prefix blocks + inherited core/query loop.
 *
 * @param {string} slug
 * @return {Array}
 */
export function getLoopMainBlocks( slug ) {
	return [ ...getLoopPrefixBlocks( slug ), createQueryLoop( { inherit: true } ) ];
}
