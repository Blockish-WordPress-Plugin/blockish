<?php
/**
 * Site Logo — server render.
 *
 * @var array $attributes Block attributes.
 */

defined( 'ABSPATH' ) || exit;

$blockish_site_logo_id = (int) get_theme_mod( 'custom_logo' );

if ( ! $blockish_site_logo_id ) {
	$blockish_site_logo_id = (int) get_option( 'site_logo' );
}

if ( ! $blockish_site_logo_id ) {
	return;
}

$blockish_site_logo_image = wp_get_attachment_image(
	$blockish_site_logo_id,
	'full',
	false,
	array(
		'class' => 'blockish-site-logo__image custom-logo',
		'alt'   => get_bloginfo( 'name' ),
	)
);

if ( ! $blockish_site_logo_image ) {
	return;
}

if ( ! empty( $attributes['linkToHome'] ) ) {
	$blockish_site_logo_target = ! empty( $attributes['openInNewTab'] )
		? ' target="_blank" rel="home noopener noreferrer"'
		: ' rel="home"';
	$blockish_site_logo_image  = sprintf(
		'<a class="custom-logo-link" href="%1$s"%2$s>%3$s</a>',
		esc_url( home_url( '/' ) ),
		$blockish_site_logo_target, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		$blockish_site_logo_image // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	);
}

printf(
	'<figure %1$s>%2$s</figure>',
	get_block_wrapper_attributes( array( 'class' => 'blockish-site-logo' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$blockish_site_logo_image // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
);
