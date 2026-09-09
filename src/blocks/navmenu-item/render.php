<?php
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound

defined( 'ABSPATH' ) || exit;

use Blockish\Core\Utilities;

$label        = $attributes['label'] ?? '';
$url          = $attributes['url'] ?? '#';
$open_new_tab = ! empty( $attributes['openInNewTab'] );
$inner        = $content ?? '';
$has_submenu  = ! empty( trim( $inner ) );
$link_id      = absint( $attributes['linkId'] ?? 0 );

$icon          = $attributes['icon'] ?? array();
$icon_position = $attributes['iconPosition'] ?? 'left';
$icon_svg      = Utilities::render_icon( $icon );
$icon_markup   = $icon_svg
	? '<span class="blockish-navmenu-item-icon" aria-hidden="true">' . $icon_svg . '</span>'
	: '';

$rel_parts = array_filter( array(
	trim( $attributes['rel'] ?? '' ),
	$open_new_tab ? 'noopener noreferrer' : '',
) );
$rel = implode( ' ', $rel_parts );

$link_class = 'blockish-navmenu-item-link';
if ( $icon_markup ) {
	$link_class .= ' has-icon';
	if ( 'right' === $icon_position ) {
		$link_class .= ' icon-position-right';
	}
}

$item_classes = array( 'blockish-block-navmenu-item' );
if ( $has_submenu ) {
	$item_classes[] = 'has-submenu';
}

$wrapper_attrs = get_block_wrapper_attributes( array_merge(
	array( 'class' => implode( ' ', $item_classes ) ),
	$link_id ? array( 'data-id' => $link_id ) : array()
) );

$submenu_arrow = '<svg class="blockish-navmenu-submenu-arrow" width="10" height="10" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M0 9.6c0-0.205 0.078-0.409 0.234-0.566 0.312-0.312 0.819-0.312 1.131 0l13.834 13.834 13.834-13.834c0.312-0.312 0.819-0.312 1.131 0s0.312 0.819 0 1.131l-14.4 14.4c-0.312 0.312-0.819 0.312-1.131 0l-14.4-14.4c-0.156-0.156-0.234-0.361-0.234-0.566z"></path></svg>';

$link_inner  = ( 'right' !== $icon_position ? $icon_markup : '' );
$link_inner .= '<span>' . wp_kses_post( $label ) . '</span>';
$link_inner .= ( 'right' === $icon_position ? $icon_markup : '' );

$link_attrs = sprintf(
	'class="%1$s" href="%2$s"%3$s%4$s',
	esc_attr( $link_class ),
	esc_url( $url ),
	$open_new_tab ? ' target="_blank"' : '',
	$rel ? ' rel="' . esc_attr( $rel ) . '"' : ''
);

$submenu_markup = '';
if ( $has_submenu ) {
	$children_id = 'blockish-navmenu-children-' . wp_unique_id();
	$submenu_markup = sprintf(
		'<button type="button" class="blockish-navmenu-submenu-toggle" aria-expanded="false" aria-controls="%1$s" aria-label="%2$s">%3$s</button><div id="%1$s" class="blockish-navmenu-item-children">%4$s</div>',
		esc_attr( $children_id ),
		esc_attr(
			sprintf(
				/* translators: %s: menu item label */
				__( 'Show submenu for %s', 'blockish' ),
				wp_strip_all_tags( $label )
			)
		),
		$submenu_arrow,
		$inner
	);
}

$content = sprintf(
	'<div %1$s><a %2$s>%3$s</a>%4$s</div>',
	$wrapper_attrs,
	$link_attrs,
	$link_inner,
	$submenu_markup
);

echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Wrapper + sanitized parts + inner blocks.
