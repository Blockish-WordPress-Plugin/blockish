<?php
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound

/**
 * Post Featured Image — server render.
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$blockish_featured_post_id = isset( $block->context['postId'] )
	? (int) $block->context['postId']
	: get_the_ID();

if ( ! $blockish_featured_post_id || ! has_post_thumbnail( $blockish_featured_post_id ) ) {
	return;
}

$blockish_featured_size = isset( $attributes['imageSize']['value'] )
	? sanitize_key( $attributes['imageSize']['value'] )
	: 'full';
$blockish_featured_image = get_the_post_thumbnail(
	$blockish_featured_post_id,
	$blockish_featured_size,
	array( 'class' => 'blockish-post-featured-image__image' )
);

if ( ! $blockish_featured_image ) {
	return;
}

if ( ! empty( $attributes['linkToPost'] ) ) {
	$blockish_featured_target = ! empty( $attributes['openInNewTab'] )
		? ' target="_blank" rel="noopener noreferrer"'
		: '';
	$blockish_featured_image  = sprintf(
		'<a href="%1$s"%2$s>%3$s</a>',
		esc_url( get_permalink( $blockish_featured_post_id ) ),
		$blockish_featured_target, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		$blockish_featured_image // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	);
}

printf(
	'<figure %1$s>%2$s</figure>',
	get_block_wrapper_attributes( array( 'class' => 'blockish-post-featured-image' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$blockish_featured_image // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
);
