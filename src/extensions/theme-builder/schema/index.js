/**
 * Starter block_schema catalog for Theme Builder create flow.
 *
 * Loop templates: Blog Home design (post 4288) — see loopTemplates.js.
 */
import { schemaToMarkup } from './schema-to-markup';
import { wrapChrome } from './fragments';
import {
	getLoopMainBlocks,
	isLoopTemplateSlug,
} from './loop-templates';

import pageMain from './templates/page.main.json';
import pageNoTitleMain from './templates/page-no-title.main.json';
import singleMain from './templates/single.main.json';
import notFoundMain from './templates/404.main.json';

import partHeader from './parts/header.json';
import partFooter from './parts/footer.json';
import { isWooCommerceSchemaSlug } from './woocommerce';

const pageSchema = () => wrapChrome( pageMain );
const pageNoTitleSchema = () => wrapChrome( pageNoTitleMain );
const frontPageSchema = () =>
	wrapChrome( pageNoTitleMain, { mainMargin: false } );
const singleSchema = () =>
	wrapChrome( singleMain, { mainMargin: false, innerContentWidth: true } );
const notFoundSchema = () => {
	const chrome = wrapChrome( notFoundMain, {
		mainMargin: false,
		innerContentWidth: true,
	} );
	const main = chrome.find( ( block ) => block.name === 'blockish/container' );
	if ( main?.attributes ) {
		main.attributes.containerMinHeight = { Desktop: '75vh' };
		main.attributes.justifyContent = {
			Desktop: { label: 'Center', value: 'center' },
		};
		main.attributes.alignItems = {
			Desktop: { label: 'Center', value: 'center' },
		};
		main.attributes.padding = {
			Desktop: {
				top: 'var:preset|spacing|60',
				right: 'var:preset|spacing|40',
				bottom: 'var:preset|spacing|60',
				left: 'var:preset|spacing|40',
			},
		};
	}
	return chrome;
};

const loopSchemaForSlug = ( slug ) =>
	wrapChrome( getLoopMainBlocks( slug ), { innerContentWidth: true } );

/** @type {Record<string, () => Array>} */
const TEMPLATE_SCHEMAS = {
	// Singular / pages (no loop)
	'front-page': frontPageSchema,
	page: pageSchema,
	'page-no-title': pageNoTitleSchema,
	single: singleSchema,
	custom: pageNoTitleSchema,

	// Blog home + fallback index
	home: () => loopSchemaForSlug( 'home' ),
	index: () => loopSchemaForSlug( 'index' ),

	// Archives
	archive: () => loopSchemaForSlug( 'archive' ),
	author: () => loopSchemaForSlug( 'author' ),
	category: () => loopSchemaForSlug( 'category' ),
	date: () => loopSchemaForSlug( 'date' ),
	tag: () => loopSchemaForSlug( 'tag' ),

	// Search
	search: () => loopSchemaForSlug( 'search' ),

	// Utility (no loop)
	404: notFoundSchema,
};

/** @type {Record<string, Array>} */
const PART_SCHEMAS = {
	header: partHeader,
	footer: partFooter,
};

/**
 * @param {'template'|'part'} kind
 * @param {string} slug
 * @return {Array}
 */
export function getSchemaForSlug( kind, slug ) {
	const key = ( slug || '' ).toString();

	// WooCommerce templates/parts start empty — user builds with WC blocks in the editor.
	if ( isWooCommerceSchemaSlug( kind, key ) ) {
		return [];
	}

	if ( kind === 'part' ) {
		if ( PART_SCHEMAS[ key ] ) {
			return PART_SCHEMAS[ key ];
		}
		return [];
	}

	if ( TEMPLATE_SCHEMAS[ key ] ) {
		return TEMPLATE_SCHEMAS[ key ]();
	}

	// CPT singles — no loop.
	if ( key.startsWith( 'single-' ) || key.startsWith( 'singular' ) ) {
		return singleSchema();
	}

	// CPT / taxonomy archives — loop + query-title prefix.
	if ( isLoopTemplateSlug( key ) ) {
		return loopSchemaForSlug( key );
	}

	// Fallback: page shell without loop.
	return pageNoTitleSchema();
}

/**
 * Initial post_content markup for a newly created template or part.
 *
 * @param {'template'|'part'} kind
 * @param {string} slug
 * @return {string}
 */
export function getInitialContent( kind, slug ) {
	return schemaToMarkup( getSchemaForSlug( kind, slug ) );
}

export { schemaToMarkup, schemaToBlocks } from './schema-to-markup';
export {
	wrapChrome,
	createQueryLoop,
	LOOP_CARD,
	QUERY_LOOP,
} from './fragments';
export {
	HOME_LOOP_SLUGS,
	ARCHIVE_LOOP_SLUGS,
	SEARCH_LOOP_SLUGS,
	isLoopTemplateSlug,
	getLoopMainBlocks,
} from './loop-templates';
export {
	isWooCommerceSchemaSlug,
	isWooCommerceTemplateSlug,
	isWooCommerceProductTaxonomyTemplateSlug,
	WOOCOMMERCE_TEMPLATE_SLUGS,
	WOOCOMMERCE_PART_SLUGS,
} from './woocommerce';
