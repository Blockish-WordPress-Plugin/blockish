<?php
/**
 * Archive Description — server render.
 *
 * @var array $attributes Block attributes.
 */

defined( 'ABSPATH' ) || exit;

$blockish_archive_description = get_the_archive_description();

if ( '' === trim( wp_strip_all_tags( (string) $blockish_archive_description ) ) ) {
	return;
}

$blockish_archive_description_allowed_tags = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span' );
$blockish_archive_description_tag          = isset( $attributes['tag']['value'] )
	? $attributes['tag']['value']
	: 'div';

if ( ! in_array( $blockish_archive_description_tag, $blockish_archive_description_allowed_tags, true ) ) {
	$blockish_archive_description_tag = 'div';
}

printf(
	'<%1$s %2$s>%3$s</%1$s>',
	tag_escape( $blockish_archive_description_tag ),
	get_block_wrapper_attributes( array( 'class' => 'blockish-archive-description' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	wp_kses_post( $blockish_archive_description )
);
