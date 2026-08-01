<?php
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound

/**
 * Query Title — server render.
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$blockish_query_title_type = isset( $attributes['type']['value'] )
	? $attributes['type']['value']
	: 'archive';

$blockish_query_title_is_archive = is_archive();
$blockish_query_title_is_search  = is_search();

if (
	( 'archive' === $blockish_query_title_type && ! $blockish_query_title_is_archive ) ||
	( 'search' === $blockish_query_title_type && ! $blockish_query_title_is_search ) ||
	( 'post-type' === $blockish_query_title_type && ! get_post_type() )
) {
	return;
}

$blockish_query_title = '';

if ( 'archive' === $blockish_query_title_type && $blockish_query_title_is_archive ) {
	$blockish_query_title_show_prefix = ! isset( $attributes['showPrefix'] ) || ! empty( $attributes['showPrefix'] );

	if ( ! $blockish_query_title_show_prefix ) {
		add_filter( 'get_the_archive_title_prefix', '__return_empty_string', 1 );
		$blockish_query_title = get_the_archive_title();
		remove_filter( 'get_the_archive_title_prefix', '__return_empty_string', 1 );
	} else {
		$blockish_query_title = get_the_archive_title();
	}
}

if ( 'search' === $blockish_query_title_type && $blockish_query_title_is_search ) {
	$blockish_query_title = __( 'Search results', 'blockish' );

	if ( ! isset( $attributes['showSearchTerm'] ) || ! empty( $attributes['showSearchTerm'] ) ) {
		$blockish_query_title = sprintf(
			/* translators: %s: search term. */
			__( 'Search results for: “%s”', 'blockish' ),
			get_search_query()
		);
	}
}

if ( 'post-type' === $blockish_query_title_type ) {
	$blockish_query_title_post_type = get_post_type_object( get_post_type() );

	if ( ! $blockish_query_title_post_type ) {
		return;
	}

	$blockish_query_title_name        = $blockish_query_title_post_type->labels->singular_name;
	$blockish_query_title_show_prefix = ! isset( $attributes['showPrefix'] ) || ! empty( $attributes['showPrefix'] );

	if ( $blockish_query_title_show_prefix ) {
		$blockish_query_title = sprintf(
			/* translators: %s: post type singular name. */
			__( 'Post Type: “%s”', 'blockish' ),
			$blockish_query_title_name
		);
	} else {
		$blockish_query_title = $blockish_query_title_name;
	}
}

if ( '' === $blockish_query_title ) {
	return;
}

$blockish_query_title_allowed_tags = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div' );
$blockish_query_title_tag          = isset( $attributes['tag']['value'] )
	? $attributes['tag']['value']
	: 'h1';

if ( ! in_array( $blockish_query_title_tag, $blockish_query_title_allowed_tags, true ) ) {
	$blockish_query_title_tag = 'h1';
}

printf(
	'<%1$s %2$s>%3$s</%1$s>',
	tag_escape( $blockish_query_title_tag ),
	get_block_wrapper_attributes( array( 'class' => 'blockish-query-title' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	wp_kses_post( $blockish_query_title )
);
