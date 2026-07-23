<?php
/**
 * Post Excerpt — server render.
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$blockish_excerpt_post_id = isset( $block->context['postId'] )
	? (int) $block->context['postId']
	: get_the_ID();

if ( ! $blockish_excerpt_post_id ) {
	return;
}

$blockish_excerpt = get_the_excerpt( $blockish_excerpt_post_id );

if ( '' === $blockish_excerpt ) {
	return;
}

$blockish_excerpt_length = isset( $attributes['excerptLength'] )
	? max( 1, min( 100, (int) $attributes['excerptLength'] ) )
	: 55;
$blockish_excerpt        = wp_trim_words( $blockish_excerpt, $blockish_excerpt_length );
$blockish_more_text      = isset( $attributes['moreText'] )
	? trim( $attributes['moreText'] )
	: '';
$blockish_more_link      = '';

if ( '' !== $blockish_more_text ) {
	$blockish_more_link = sprintf(
		'<a class="blockish-post-excerpt__more-link" href="%1$s">%2$s</a>',
		esc_url( get_permalink( $blockish_excerpt_post_id ) ),
		esc_html( $blockish_more_text )
	);
}

$blockish_excerpt_content = '<p class="blockish-post-excerpt__text">'
	. wp_kses_post( $blockish_excerpt );

if ( $blockish_more_link && empty( $attributes['showMoreOnNewLine'] ) ) {
	$blockish_excerpt_content .= ' ' . $blockish_more_link;
}

$blockish_excerpt_content .= '</p>';

if ( $blockish_more_link && ! empty( $attributes['showMoreOnNewLine'] ) ) {
	$blockish_excerpt_content .= '<p class="blockish-post-excerpt__more-text">'
		. $blockish_more_link
		. '</p>';
}

printf(
	'<div %1$s>%2$s</div>',
	get_block_wrapper_attributes( array( 'class' => 'blockish-post-excerpt' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	wp_kses_post( $blockish_excerpt_content )
);
