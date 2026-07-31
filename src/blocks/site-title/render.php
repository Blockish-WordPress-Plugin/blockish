<?php
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound

/**
 * Site Title — server render.
 *
 * @var array $attributes Block attributes.
 */

defined( 'ABSPATH' ) || exit;

$blockish_site_title = get_bloginfo( 'name' );

if ( '' === trim( (string) $blockish_site_title ) ) {
	return;
}

$blockish_site_title_allowed_tags = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div' );
$blockish_site_title_tag          = isset( $attributes['tag']['value'] )
	? $attributes['tag']['value']
	: 'h1';

if ( ! in_array( $blockish_site_title_tag, $blockish_site_title_allowed_tags, true ) ) {
	$blockish_site_title_tag = 'h1';
}

$blockish_site_title_content = esc_html( $blockish_site_title );

if ( ! empty( $attributes['linkToHome'] ) ) {
	$blockish_site_title_target = ! empty( $attributes['openInNewTab'] )
		? ' target="_blank" rel="home noopener noreferrer"'
		: ' rel="home"';
	$blockish_site_title_content = sprintf(
		'<a href="%1$s"%2$s>%3$s</a>',
		esc_url( home_url( '/' ) ),
		$blockish_site_title_target, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		$blockish_site_title_content
	);
}

printf(
	'<%1$s %2$s>%3$s</%1$s>',
	tag_escape( $blockish_site_title_tag ),
	get_block_wrapper_attributes( array( 'class' => 'blockish-site-title' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$blockish_site_title_content // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
);
