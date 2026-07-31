<?php
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound

/**
 * Post Title — server render.
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Saved block content.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$blockish_post_title_post_id = isset( $block->context['postId'] )
	? (int) $block->context['postId']
	: get_the_ID();

if ( ! $blockish_post_title_post_id ) {
	return;
}

$blockish_post_title = get_the_title( $blockish_post_title_post_id );

if ( '' === $blockish_post_title ) {
	return;
}

$blockish_post_title_allowed_tags = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div' );
$blockish_post_title_tag          = isset( $attributes['tag']['value'] )
	? $attributes['tag']['value']
	: 'h2';

if ( ! in_array( $blockish_post_title_tag, $blockish_post_title_allowed_tags, true ) ) {
	$blockish_post_title_tag = 'h2';
}

if ( ! empty( $attributes['linkToPost'] ) ) {
	$blockish_post_title_target = ! empty( $attributes['openInNewTab'] ) ? ' target="_blank" rel="noopener noreferrer"' : '';
	$blockish_post_title        = sprintf(
		'<a href="%1$s"%2$s>%3$s</a>',
		esc_url( get_permalink( $blockish_post_title_post_id ) ),
		$blockish_post_title_target, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		wp_kses_post( $blockish_post_title )
	);
}

$blockish_post_title_wrapper_attributes = get_block_wrapper_attributes(
	array( 'class' => 'blockish-post-title' )
);

printf(
	'<%1$s %2$s>%3$s</%1$s>',
	tag_escape( $blockish_post_title_tag ),
	$blockish_post_title_wrapper_attributes, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	wp_kses_post( $blockish_post_title )
);
