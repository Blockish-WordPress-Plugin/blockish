<?php
defined( 'ABSPATH' ) || exit;

/**
 * Pick a Desktop-first CSS length from a Blockish responsive attribute.
 *
 * @param mixed $value Attribute value.
 * @return string Serialized length for data-* attrs (e.g. "12px").
 */
$blockish_submenu_attr = static function ( $value ): string {
	if ( null === $value || false === $value || '' === $value ) {
		return '';
	}
	if ( is_string( $value ) || is_numeric( $value ) ) {
		return (string) $value;
	}
	if ( ! is_array( $value ) ) {
		return '';
	}

	if ( array_key_exists( 'value', $value ) ) {
		if ( '' === $value['value'] || null === $value['value'] ) {
			return '';
		}
		$unit = isset( $value['unit'] ) ? (string) $value['unit'] : '';
		return (string) $value['value'] . $unit;
	}

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

$position_align = isset( $attributes['positionAlign'] ) ? (string) $attributes['positionAlign'] : 'left';
if ( ! in_array( $position_align, array( 'left', 'center', 'right' ), true ) ) {
	$position_align = 'left';
}
$offset_y = $blockish_submenu_attr( $attributes['offsetY'] ?? '' );
$offset_x = $blockish_submenu_attr( $attributes['offsetX'] ?? '' );

$wrapper_attrs = get_block_wrapper_attributes(
	array(
		'class'               => 'blockish-navmenu-submenu',
		'data-position-align' => $position_align,
		'data-offset-y'       => $offset_y,
		'data-offset-x'       => $offset_x,
	)
);

$content = sprintf(
	'<ul %1$s>%2$s</ul>',
	$wrapper_attrs,
	$content ?? ''
);

echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Wrapper + inner blocks.
