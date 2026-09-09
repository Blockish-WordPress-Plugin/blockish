<?php
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound

defined( 'ABSPATH' ) || exit;
$attributes      = $attributes ?? array();
$is_vertical     = ! empty( $attributes['isVertical'] );
$submenu_trigger = in_array( $attributes['submenuTrigger'] ?? 'hover', array( 'hover', 'click' ), true )
	? (string) $attributes['submenuTrigger']
	: 'hover';
$reveal          = isset( $attributes['submenuRevealAnimation']['value'] )
	? $attributes['submenuRevealAnimation']['value']
	: ( is_string( $attributes['submenuRevealAnimation'] ?? null ) ? $attributes['submenuRevealAnimation'] : '' );

$classes = array(
	'blockish-navmenu',
	'is-submenu-trigger-' . sanitize_html_class( $submenu_trigger ),
);

if ( $is_vertical ) {
	$classes[] = 'is-vertical';
}

if ( ! empty( $reveal ) ) {
	$classes[] = 'submenu-reveal--' . sanitize_html_class( $reveal );
}

$wrapper_attrs = get_block_wrapper_attributes(
	array(
		'class' => implode( ' ', $classes ),
	)
);

$content = sprintf(
	'<div %1$s><nav class="blockish-navmenu-nav" aria-label="%2$s">%3$s</nav></div>',
	$wrapper_attrs,
	esc_attr__( 'Navigation', 'blockish' ),
	$content ?? ''
);

echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Wrapper + inner blocks.

