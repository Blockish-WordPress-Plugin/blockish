<?php
/**
 * Post Content — server render.
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$blockish_content_post_id = isset( $block->context['postId'] )
	? (int) $block->context['postId']
	: get_the_ID();

if (
	! $blockish_content_post_id ||
	isset( $GLOBALS['blockish_post_content_rendering'][ $blockish_content_post_id ] )
) {
	return;
}

$blockish_content_post = get_post( $blockish_content_post_id );

if ( ! $blockish_content_post ) {
	return;
}

$GLOBALS['blockish_post_content_rendering'][ $blockish_content_post_id ] = true;

try {
	$blockish_post_content = apply_filters(
		'the_content',
		str_replace( ']]>', ']]&gt;', $blockish_content_post->post_content )
	);
} finally {
	unset( $GLOBALS['blockish_post_content_rendering'][ $blockish_content_post_id ] );

	if ( empty( $GLOBALS['blockish_post_content_rendering'] ) ) {
		unset( $GLOBALS['blockish_post_content_rendering'] );
	}
}

if ( '' === trim( $blockish_post_content ) ) {
	return;
}

$blockish_content_allowed_tags = array( 'div', 'section', 'article', 'main' );
$blockish_content_tag          = isset( $attributes['tag']['value'] )
	? $attributes['tag']['value']
	: 'div';

if ( ! in_array( $blockish_content_tag, $blockish_content_allowed_tags, true ) ) {
	$blockish_content_tag = 'div';
}

printf(
	'<%1$s %2$s>%3$s</%1$s>',
	tag_escape( $blockish_content_tag ),
	get_block_wrapper_attributes( array( 'class' => 'blockish-post-content entry-content' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$blockish_post_content // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
);
