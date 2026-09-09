<?php
defined( 'ABSPATH' ) || exit;

$megamenu_id = isset( $attributes['megamenuId'] ) ? absint( $attributes['megamenuId'] ) : 0;
if ( ! $megamenu_id ) {
	return;
}

$post = get_post( $megamenu_id );
if (
	! $post
	|| 'blockish_megamenu' !== $post->post_type
	|| 'publish' !== $post->post_status
	|| post_password_required( $post )
) {
	return;
}

/**
 * Pick a Desktop-first CSS length from a Blockish responsive attribute.
 *
 * Handles: "40px", 40, { value, unit }, { Desktop: { value, unit } }.
 *
 * @param mixed $value Attribute value.
 * @return string Serialized length for data-* attrs (e.g. "400px").
 */
$blockish_megamenu_attr = static function ( $value ): string {
	if ( null === $value || false === $value || '' === $value ) {
		return '';
	}
	if ( is_string( $value ) || is_numeric( $value ) ) {
		return (string) $value;
	}
	if ( ! is_array( $value ) ) {
		return '';
	}

	// Flat RangeUnit bag: { value, unit }.
	if ( array_key_exists( 'value', $value ) ) {
		if ( '' === $value['value'] || null === $value['value'] ) {
			return '';
		}
		$unit = isset( $value['unit'] ) ? (string) $value['unit'] : '';
		return (string) $value['value'] . $unit;
	}

	// Responsive bag: prefer Desktop.
	$device = null;
	if ( isset( $value['Desktop'] ) && '' !== $value['Desktop'] && null !== $value['Desktop'] ) {
		$device = $value['Desktop'];
	} elseif ( isset( $value['desktop'] ) && '' !== $value['desktop'] && null !== $value['desktop'] ) {
		$device = $value['desktop'];
	} else {
		$device = reset( $value );
	}

	if ( null === $device || false === $device || '' === $device ) {
		return '';
	}
	if ( is_string( $device ) || is_numeric( $device ) ) {
		return (string) $device;
	}
	if ( is_array( $device ) && array_key_exists( 'value', $device ) ) {
		if ( '' === $device['value'] || null === $device['value'] ) {
			return '';
		}
		$unit = isset( $device['unit'] ) ? (string) $device['unit'] : '';
		return (string) $device['value'] . $unit;
	}

	return '';
};

$width_mode = isset( $attributes['widthMode'] ) ? (string) $attributes['widthMode'] : 'navigation';
if ( ! in_array( $width_mode, array( 'navigation', 'full', 'custom' ), true ) ) {
	$width_mode = 'navigation';
}

$position_align    = isset( $attributes['positionAlign'] ) ? (string) $attributes['positionAlign'] : 'left';
$align_relative_to = isset( $attributes['alignRelativeTo'] ) ? (string) $attributes['alignRelativeTo'] : 'navigation';
$custom_width      = $blockish_megamenu_attr( $attributes['customWidth'] ?? '' );
$offset_y          = $blockish_megamenu_attr( $attributes['offsetY'] ?? '' );
$offset_x          = $blockish_megamenu_attr( $attributes['offsetX'] ?? '' );

$wrapper = get_block_wrapper_attributes(
	array(
		'class'                  => 'blockish-navmenu-megamenu is-width-' . sanitize_html_class( $width_mode ),
		'data-width-mode'        => $width_mode,
		'data-position-align'    => $position_align,
		'data-align-relative-to' => $align_relative_to,
		'data-custom-width'      => $custom_width,
		'data-offset-y'          => $offset_y,
		'data-offset-x'          => $offset_x,
	)
);

printf(
	'<div %1$s>%2$s</div>',
	$wrapper, // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	do_blocks( $post->post_content ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
);
