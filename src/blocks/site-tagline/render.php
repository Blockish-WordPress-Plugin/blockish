<?php
/**
 * Site Tagline — server render.
 *
 * @var array $attributes Block attributes.
 */

defined( 'ABSPATH' ) || exit;

$blockish_site_tagline = get_bloginfo( 'description' );

if ( '' === trim( (string) $blockish_site_tagline ) ) {
	return;
}

$blockish_site_tagline_allowed_tags = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span' );
$blockish_site_tagline_tag          = isset( $attributes['tag']['value'] )
	? $attributes['tag']['value']
	: 'p';

if ( ! in_array( $blockish_site_tagline_tag, $blockish_site_tagline_allowed_tags, true ) ) {
	$blockish_site_tagline_tag = 'p';
}

printf(
	'<%1$s %2$s>%3$s</%1$s>',
	tag_escape( $blockish_site_tagline_tag ),
	get_block_wrapper_attributes( array( 'class' => 'blockish-site-tagline' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	esc_html( $blockish_site_tagline )
);
