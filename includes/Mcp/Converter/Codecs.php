<?php

namespace Blockish\Mcp\Converter;

defined( 'ABSPATH' ) || exit;

/**
 * Shared encode/decode helpers for the CSS ⇄ attribute converter.
 */
class Codecs {

	private const OPTION_LABELS = array(
		'flex-direction'  => array(
			'row'            => 'Row',
			'column'         => 'Column',
			'row-reverse'    => 'Row Reverse',
			'column-reverse' => 'Column Reverse',
		),
		'justify-content' => array(
			'flex-start'    => 'Start',
			'flex-end'      => 'End',
			'center'        => 'Center',
			'space-between' => 'Space Between',
			'space-around'  => 'Space Around',
			'space-evenly'  => 'Space Evenly',
		),
		'align-items'     => array(
			'flex-start' => 'Start',
			'flex-end'   => 'End',
			'center'     => 'Center',
			'stretch'    => 'Stretch',
		),
		'overflow'        => array(
			'visible' => 'Visible',
			'hidden'  => 'Hidden',
			'scroll'  => 'Scroll',
			'auto'    => 'Auto',
		),
		'position'        => array(
			'static'   => 'Static',
			'relative' => 'Relative',
			'absolute' => 'Absolute',
			'fixed'    => 'Fixed',
			'sticky'   => 'Sticky',
		),
		'width'           => array(
			'auto'        => 'Auto',
			'100%'        => 'Full',
			'fit-content' => 'Fit Content',
			'max-content' => 'Max Content',
			'min-content' => 'Min Content',
			'custom'      => 'Custom',
		),
		'background-size' => array(
			'auto'    => 'Auto',
			'cover'   => 'Cover',
			'contain' => 'Contain',
			'custom'  => 'Custom',
		),
		'background-position' => array(
			'top left'      => 'Top Left',
			'top center'    => 'Top Center',
			'top right'     => 'Top Right',
			'center left'   => 'Center Left',
			'center center' => 'Center Center',
			'center right'  => 'Center Right',
			'bottom left'   => 'Bottom Left',
			'bottom center' => 'Bottom Center',
			'bottom right'  => 'Bottom Right',
			'custom'        => 'Custom',
		),
		'background-repeat' => array(
			'repeat'    => 'Repeat',
			'repeat-x'  => 'Repeat X',
			'repeat-y'  => 'Repeat Y',
			'no-repeat' => 'No Repeat',
		),
		'background-attachment' => array(
			'scroll' => 'Scroll',
			'fixed'  => 'Fixed',
		),
		'background-blend-mode' => array(
			'normal'      => 'Normal',
			'multiply'    => 'Multiply',
			'screen'      => 'Screen',
			'overlay'     => 'Overlay',
			'darken'      => 'Darken',
			'lighten'     => 'Lighten',
			'color-dodge' => 'Color Dodge',
			'color-burn'  => 'Color Burn',
			'hard-light'  => 'Hard Light',
			'soft-light'  => 'Soft Light',
			'difference'  => 'Difference',
			'exclusion'   => 'Exclusion',
			'hue'         => 'Hue',
			'saturation'  => 'Saturation',
			'color'       => 'Color',
			'luminosity'  => 'Luminosity',
		),
		'object-fit' => array(
			'none'    => 'None',
			'fill'    => 'Fill',
			'cover'   => 'Cover',
			'contain' => 'Contain',
		),
	);

	public static function option( string $property, string $value ): ?array {
		$value = strtolower( trim( $value ) );
		$labels = self::OPTION_LABELS[ $property ] ?? null;
		if ( null === $labels || ! isset( $labels[ $value ] ) ) {
			return null;
		}

		return array(
			'label' => $labels[ $value ],
			'value' => $value,
		);
	}

	public static function option_css( $value ): string {
		if ( is_array( $value ) && isset( $value['value'] ) ) {
			return (string) $value['value'];
		}
		return is_scalar( $value ) ? (string) $value : '';
	}

	/**
	 * @return array{top: string, right: string, bottom: string, left: string}|null
	 */
	public static function spacing( string $value ): ?array {
		$parts = preg_split( '/\s+/', trim( $value ) );
		if ( empty( $parts ) ) {
			return null;
		}

		$count = count( $parts );
		if ( 1 === $count ) {
			return array(
				'top'    => $parts[0],
				'right'  => $parts[0],
				'bottom' => $parts[0],
				'left'   => $parts[0],
			);
		}
		if ( 2 === $count ) {
			return array(
				'top'    => $parts[0],
				'right'  => $parts[1],
				'bottom' => $parts[0],
				'left'   => $parts[1],
			);
		}
		if ( 3 === $count ) {
			return array(
				'top'    => $parts[0],
				'right'  => $parts[1],
				'bottom' => $parts[2],
				'left'   => $parts[1],
			);
		}

		return array(
			'top'    => $parts[0],
			'right'  => $parts[1],
			'bottom' => $parts[2],
			'left'   => $parts[3],
		);
	}

	public static function spacing_css( $value ): string {
		if ( ! is_array( $value ) ) {
			return is_scalar( $value ) ? (string) $value : '';
		}

		$top = $value['top'] ?? '0';
		$right = $value['right'] ?? '0';
		$bottom = $value['bottom'] ?? '0';
		$left = $value['left'] ?? '0';

		return trim( "{$top} {$right} {$bottom} {$left}" );
	}

	/**
	 * @return array{topLeft: string, topRight: string, bottomRight: string, bottomLeft: string}|null
	 */
	public static function radius( string $value ): ?array {
		$parts = preg_split( '/\s+/', trim( $value ) );
		if ( empty( $parts ) ) {
			return null;
		}

		$count = count( $parts );
		if ( 1 === $count ) {
			return array(
				'topLeft'     => $parts[0],
				'topRight'    => $parts[0],
				'bottomRight' => $parts[0],
				'bottomLeft'  => $parts[0],
			);
		}
		if ( 2 === $count ) {
			return array(
				'topLeft'     => $parts[0],
				'topRight'    => $parts[1],
				'bottomRight' => $parts[0],
				'bottomLeft'  => $parts[1],
			);
		}
		if ( 3 === $count ) {
			return array(
				'topLeft'     => $parts[0],
				'topRight'    => $parts[1],
				'bottomRight' => $parts[2],
				'bottomLeft'  => $parts[1],
			);
		}

		return array(
			'topLeft'     => $parts[0],
			'topRight'    => $parts[1],
			'bottomRight' => $parts[2],
			'bottomLeft'  => $parts[3],
		);
	}

	public static function radius_css( $value ): string {
		if ( ! is_array( $value ) ) {
			return is_scalar( $value ) ? (string) $value : '';
		}

		return trim(
			sprintf(
				'%s %s %s %s',
				$value['topLeft'] ?? '0',
				$value['topRight'] ?? '0',
				$value['bottomRight'] ?? '0',
				$value['bottomLeft'] ?? '0'
			)
		);
	}

	/**
	 * A literal *-gradient() function, or a custom property whose name marks it as
	 * one (e.g. var(--wp--preset--gradient--brand)) — the value cannot be resolved
	 * server-side, so the naming convention is the only signal available.
	 */
	private static function is_gradient_value( string $value ): bool {
		if ( preg_match( '/gradient\s*\(/i', $value ) ) {
			return true;
		}

		return (bool) preg_match( '/var\(\s*--[^),]*gradient/i', $value );
	}

	/**
	 * Classic color / gradient / image (+ size/position/repeat/attachment) → Background JSON.
	 *
	 * @param array<string, string> $declarations CSS props for one device
	 * @param string                $device       Desktop|Tablet|Mobile
	 * @param array|null            $existing    Decoded background payload to merge into
	 */
	public static function merge_background( array $declarations, string $device = 'Desktop', ?array $existing = null ): ?array {
		$payload = is_array( $existing ) ? $existing : array();

		$color     = $declarations['background-color'] ?? null;
		$image     = $declarations['background-image'] ?? null;
		$shorthand = $declarations['background'] ?? null;
		$size      = $declarations['background-size'] ?? null;
		$position  = $declarations['background-position'] ?? null;
		$repeat    = $declarations['background-repeat'] ?? null;
		$attachment = $declarations['background-attachment'] ?? null;
		$blend     = $declarations['background-blend-mode'] ?? null;

		if ( $shorthand && self::is_gradient_value( $shorthand ) ) {
			$payload['backgroundType'] = 'gradient';
			$payload['gradient']       = trim( $shorthand );
		} elseif ( $image && self::is_gradient_value( $image ) ) {
			$payload['backgroundType'] = 'gradient';
			$payload['gradient']       = trim( $image );
		} else {
			$url    = null;
			$source = $image ?: $shorthand;
			if ( $source && preg_match( '/url\(\s*[\'"]?([^\'")]+)[\'"]?\s*\)/i', $source, $match ) ) {
				$url = $match[1];
			}

			if ( $url ) {
				$payload['backgroundType'] = 'classic';
				if ( ! isset( $payload['backgroundImage'] ) || ! is_array( $payload['backgroundImage'] ) ) {
					$payload['backgroundImage'] = array();
				}
				$payload['backgroundImage'][ $device ] = array( 'url' => $url );
				if ( $color ) {
					$payload['backgroundColor'] = $color;
				}
			} elseif ( $color ) {
				$payload['backgroundType']  = $payload['backgroundType'] ?? 'classic';
				$payload['backgroundColor'] = $color;
			} elseif ( $shorthand && ! preg_match( '/\b(none|inherit|initial|unset)\b/i', $shorthand ) ) {
				if ( preg_match( '/^(#|rgb|hsl|[a-z]+)/i', $shorthand ) && ! str_contains( $shorthand, 'url(' ) ) {
					$payload['backgroundType']  = 'classic';
					$payload['backgroundColor'] = trim( self::split_tokens( trim( $shorthand ) )[0] ?? $shorthand );
				}
			}
		}

		if ( null !== $size ) {
			self::apply_background_size( $payload, $device, trim( $size ) );
		}
		if ( null !== $position ) {
			self::apply_background_position( $payload, $device, trim( $position ) );
		}
		if ( null !== $repeat ) {
			$opt = self::option( 'background-repeat', strtolower( trim( $repeat ) ) );
			if ( $opt ) {
				if ( ! isset( $payload['backgroundImageRepeat'] ) || ! is_array( $payload['backgroundImageRepeat'] ) ) {
					$payload['backgroundImageRepeat'] = array();
				}
				$payload['backgroundImageRepeat'][ $device ] = $opt;
			}
		}
		if ( null !== $attachment ) {
			$opt = self::option( 'background-attachment', strtolower( trim( $attachment ) ) );
			if ( $opt ) {
				$payload['backgroundImageAttachment'] = $opt;
			}
		}
		if ( null !== $blend ) {
			$opt = self::option( 'background-blend-mode', strtolower( trim( $blend ) ) );
			if ( $opt ) {
				$payload['backgroundImageBlendMode'] = $opt;
			}
		}

		if ( empty( $payload ) ) {
			return null;
		}

		if ( empty( $payload['backgroundType'] ) ) {
			$payload['backgroundType'] = 'classic';
		}

		return $payload;
	}

	/**
	 * @deprecated Use merge_background — kept for callers that pass a flat Desktop bag.
	 */
	public static function background_from_declarations( array $declarations ): ?string {
		$merged = self::merge_background( $declarations, 'Desktop', null );
		return $merged ? (string) wp_json_encode( $merged ) : null;
	}

	private static function apply_background_size( array &$payload, string $device, string $value ): void {
		$lower = strtolower( $value );
		if ( in_array( $lower, array( 'auto', 'cover', 'contain' ), true ) ) {
			$opt = self::option( 'background-size', $lower );
			if ( $opt ) {
				if ( ! isset( $payload['backgroundImageSize'] ) || ! is_array( $payload['backgroundImageSize'] ) ) {
					$payload['backgroundImageSize'] = array();
				}
				$payload['backgroundImageSize'][ $device ] = $opt;
			}
			return;
		}

		// Custom: "200px" or "200px 100px" — store first length as width.
		$tokens = self::split_tokens( $value );
		$width  = $tokens[0] ?? $value;
		if ( ! isset( $payload['backgroundImageSize'] ) || ! is_array( $payload['backgroundImageSize'] ) ) {
			$payload['backgroundImageSize'] = array();
		}
		$payload['backgroundImageSize'][ $device ] = array( 'label' => 'Custom', 'value' => 'custom' );
		if ( ! isset( $payload['backgroundImageSizeWidth'] ) || ! is_array( $payload['backgroundImageSizeWidth'] ) ) {
			$payload['backgroundImageSizeWidth'] = array();
		}
		$payload['backgroundImageSizeWidth'][ $device ] = $width;
	}

	private static function apply_background_position( array &$payload, string $device, string $value ): void {
		$normalized = strtolower( preg_replace( '/\s+/', ' ', trim( $value ) ) );
		if ( 'center' === $normalized ) {
			$normalized = 'center center';
		}

		$opt = self::option( 'background-position', $normalized );
		if ( $opt ) {
			if ( ! isset( $payload['backgroundImagePosition'] ) || ! is_array( $payload['backgroundImagePosition'] ) ) {
				$payload['backgroundImagePosition'] = array();
			}
			$payload['backgroundImagePosition'][ $device ] = $opt;
			return;
		}

		$tokens = self::split_tokens( $value );
		if ( count( $tokens ) >= 2 ) {
			if ( ! isset( $payload['backgroundImagePosition'] ) || ! is_array( $payload['backgroundImagePosition'] ) ) {
				$payload['backgroundImagePosition'] = array();
			}
			$payload['backgroundImagePosition'][ $device ] = array( 'label' => 'Custom', 'value' => 'custom' );
			if ( ! isset( $payload['backgroundImagePositionHorizontal'] ) || ! is_array( $payload['backgroundImagePositionHorizontal'] ) ) {
				$payload['backgroundImagePositionHorizontal'] = array();
			}
			if ( ! isset( $payload['backgroundImagePositionVertical'] ) || ! is_array( $payload['backgroundImagePositionVertical'] ) ) {
				$payload['backgroundImagePositionVertical'] = array();
			}
			$payload['backgroundImagePositionHorizontal'][ $device ] = $tokens[0];
			$payload['backgroundImagePositionVertical'][ $device ]   = $tokens[1];
		}
	}

	public static function background_css( $value ): array {
		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			$value = is_array( $decoded ) ? $decoded : null;
		}
		if ( ! is_array( $value ) ) {
			return array();
		}

		$out = array();
		$type = $value['backgroundType'] ?? 'classic';
		if ( 'gradient' === $type && ! empty( $value['gradient'] ) ) {
			$out['background'] = (string) $value['gradient'];
			return $out;
		}

		if ( ! empty( $value['backgroundColor'] ) ) {
			$out['background-color'] = (string) $value['backgroundColor'];
		}
		$url = $value['backgroundImage']['Desktop']['url'] ?? null;
		if ( $url ) {
			$out['background-image'] = 'url(' . $url . ')';
		}

		$size = $value['backgroundImageSize']['Desktop'] ?? null;
		if ( is_array( $size ) ) {
			$sv = $size['value'] ?? '';
			if ( 'custom' === $sv ) {
				$w = $value['backgroundImageSizeWidth']['Desktop'] ?? null;
				if ( $w ) {
					$out['background-size'] = (string) $w;
				}
			} elseif ( '' !== $sv ) {
				$out['background-size'] = (string) $sv;
			}
		}

		$pos = $value['backgroundImagePosition']['Desktop'] ?? null;
		if ( is_array( $pos ) ) {
			$pv = $pos['value'] ?? '';
			if ( 'custom' === $pv ) {
				$x = $value['backgroundImagePositionHorizontal']['Desktop'] ?? null;
				$y = $value['backgroundImagePositionVertical']['Desktop'] ?? null;
				if ( $x && $y ) {
					$out['background-position'] = $x . ' ' . $y;
				}
			} elseif ( '' !== $pv ) {
				$out['background-position'] = (string) $pv;
			}
		}

		$repeat = $value['backgroundImageRepeat']['Desktop']['value'] ?? null;
		if ( $repeat ) {
			$out['background-repeat'] = (string) $repeat;
		}

		$attachment = $value['backgroundImageAttachment']['value'] ?? null;
		if ( $attachment ) {
			$out['background-attachment'] = (string) $attachment;
		}

		$blend = $value['backgroundImageBlendMode']['value'] ?? null;
		if ( $blend ) {
			$out['background-blend-mode'] = (string) $blend;
		}

		return $out;
	}

	private const BORDER_STYLES = array( 'none', 'hidden', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset' );

	public const BORDER_SIDES = array( 'top', 'right', 'bottom', 'left' );

	/**
	 * Splits a CSS value on whitespace without breaking inside parentheses,
	 * so `1px solid rgba(0, 0, 0, .1)` stays three tokens.
	 *
	 * @return string[]
	 */
	public static function split_tokens( string $value ): array {
		$tokens = array();
		$buffer = '';
		$depth  = 0;
		$length = strlen( $value );

		for ( $i = 0; $i < $length; $i++ ) {
			$char = $value[ $i ];

			if ( '(' === $char ) {
				++$depth;
			} elseif ( ')' === $char ) {
				$depth = max( 0, $depth - 1 );
			}

			if ( 0 === $depth && ctype_space( $char ) ) {
				if ( '' !== $buffer ) {
					$tokens[] = $buffer;
					$buffer   = '';
				}
				continue;
			}

			$buffer .= $char;
		}

		if ( '' !== $buffer ) {
			$tokens[] = $buffer;
		}

		return $tokens;
	}

	private static function is_border_style( string $token ): bool {
		return in_array( strtolower( $token ), self::BORDER_STYLES, true );
	}

	private static function is_border_width( string $token ): bool {
		if ( in_array( strtolower( $token ), array( 'thin', 'medium', 'thick' ), true ) ) {
			return true;
		}
		return (bool) preg_match( '/^-?[\d.]+(px|rem|em|%|vw|vh|pt|ch)?$/i', $token );
	}

	/**
	 * `1px solid #ccc` in any order → the parts it actually declares.
	 *
	 * @return array{width?: string, style?: string, color?: string}|null
	 */
	public static function parse_border_parts( string $value ): ?array {
		$tokens = self::split_tokens( trim( $value ) );
		if ( empty( $tokens ) ) {
			return null;
		}

		$parts = array();
		foreach ( $tokens as $token ) {
			if ( ! isset( $parts['style'] ) && self::is_border_style( $token ) ) {
				$parts['style'] = strtolower( $token );
				continue;
			}
			if ( ! isset( $parts['width'] ) && self::is_border_width( $token ) ) {
				$parts['width'] = $token;
				continue;
			}
			if ( ! isset( $parts['color'] ) ) {
				$parts['color'] = $token;
			}
		}

		return empty( $parts ) ? null : $parts;
	}

	/**
	 * Merges a `border` / `border-<side>` declaration into an existing Border value so
	 * Tablet/Mobile widths accumulate instead of replacing the Desktop one.
	 *
	 * @return array{value: string, overflow: array<string, string>}|null
	 */
	public static function merge_border( $existing, string $device, string $value, ?string $side = null ): ?array {
		$parts = self::parse_border_parts( $value );
		if ( null === $parts ) {
			return null;
		}

		return self::write_border( $existing, $parts, $device, $side );
	}

	/**
	 * Merges a longhand `border-width` / `border-style` / `border-color` (optionally
	 * side-scoped). Multi-value shorthands like `border-width: 1px 2px` are rejected so
	 * they fall through to customCss.
	 *
	 * @return array{value: string, overflow: array<string, string>}|null
	 */
	public static function merge_border_part( $existing, string $device, string $part, string $value, ?string $side = null ): ?array {
		$tokens = self::split_tokens( trim( $value ) );
		if ( 1 !== count( $tokens ) ) {
			return null;
		}

		$token = $tokens[0];
		if ( 'style' === $part && ! self::is_border_style( $token ) ) {
			return null;
		}
		if ( 'width' === $part && ! self::is_border_width( $token ) ) {
			return null;
		}

		$parts = array( $part => 'style' === $part ? strtolower( $token ) : $token );

		return self::write_border( $existing, $parts, $device, $side );
	}

	/**
	 * @param array{width?: string, style?: string, color?: string} $parts
	 * @return array{value: string, overflow: array<string, string>}
	 */
	private static function write_border( $existing, array $parts, string $device, ?string $side ): array {
		$data = self::decode_border( $existing );

		if ( null === $side ) {
			$result = self::apply_border_parts( $data, $parts, $device, null );
			$data   = $result['target'];
		} else {
			$current       = is_array( $data[ $side ] ?? null ) ? $data[ $side ] : array();
			$result        = self::apply_border_parts( $current, $parts, $device, $side );
			$data[ $side ] = $result['target'];
		}

		return array(
			'value'    => (string) wp_json_encode( $data ),
			'overflow' => $result['overflow'],
		);
	}

	/**
	 * Width is responsive in the Border shape; style and color are not. A non-Desktop
	 * rule that changes style/color would silently rewrite Desktop too, so it is handed
	 * back as overflow for the caller to keep in customCss.
	 *
	 * @param array{width?: string, style?: string, color?: string} $parts
	 * @return array{target: array, overflow: array<string, string>}
	 */
	private static function apply_border_parts( array $target, array $parts, string $device, ?string $side ): array {
		$overflow = array();

		if ( isset( $parts['width'] ) ) {
			if ( ! isset( $target['width'] ) || ! is_array( $target['width'] ) ) {
				$target['width'] = array();
			}
			$target['width'][ $device ] = $parts['width'];
		}

		foreach ( array( 'style', 'color' ) as $key ) {
			if ( ! isset( $parts[ $key ] ) ) {
				continue;
			}

			$conflicts = 'Desktop' !== $device
				&& isset( $target[ $key ] )
				&& $target[ $key ] !== $parts[ $key ];

			if ( $conflicts ) {
				$property              = null === $side ? "border-{$key}" : "border-{$side}-{$key}";
				$overflow[ $property ] = $parts[ $key ];
				continue;
			}

			$target[ $key ] = $parts[ $key ];
		}

		return array(
			'target'   => $target,
			'overflow' => $overflow,
		);
	}

	private static function decode_border( $value ): array {
		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			return is_array( $decoded ) ? $decoded : array();
		}

		return is_array( $value ) ? $value : array();
	}

	/**
	 * Border value → CSS grouped by device, so responsive widths land in the right
	 * media query. Per-side data emits `border-top` etc. instead of the shorthand.
	 *
	 * @return array<string, array<string, string>> device => [property => value]
	 */
	public static function border_css_map( $value ): array {
		$data = self::decode_border( $value );
		if ( empty( $data ) ) {
			return array();
		}

		$out      = array();
		$has_side = false;

		foreach ( self::BORDER_SIDES as $side ) {
			if ( ! isset( $data[ $side ] ) || ! is_array( $data[ $side ] ) ) {
				continue;
			}
			$has_side = true;
			foreach ( self::border_side_css( $data[ $side ] ) as $device => $css ) {
				$out[ $device ][ 'border-' . $side ] = $css;
			}
		}

		if ( ! $has_side ) {
			foreach ( self::border_side_css( $data ) as $device => $css ) {
				$out[ $device ]['border'] = $css;
			}
		}

		return $out;
	}

	/**
	 * @return array<string, string> device => "1px solid #ccc"
	 */
	private static function border_side_css( array $data ): array {
		$style = $data['style'] ?? 'solid';
		$color = isset( $data['color'] ) ? (string) $data['color'] : '';
		$width = $data['width'] ?? null;

		if ( is_string( $width ) || is_numeric( $width ) ) {
			$width = array( 'Desktop' => (string) $width );
		}

		if ( ! is_array( $width ) || empty( $width ) ) {
			return 'none' === $style ? array( 'Desktop' => 'none' ) : array();
		}

		$out = array();
		foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
			if ( empty( $width[ $device ] ) ) {
				continue;
			}
			$out[ $device ] = trim( $width[ $device ] . ' ' . $style . ( '' !== $color ? ' ' . $color : '' ) );
		}

		return $out;
	}

	/**
	 * Single box-shadow → Box Shadow stringified JSON array.
	 */
	public static function box_shadow( string $value ): ?string {
		$value = trim( $value );
		if ( '' === $value || 'none' === strtolower( $value ) ) {
			return null;
		}

		$inset = false;
		if ( preg_match( '/\binset\b/i', $value ) ) {
			$inset = true;
			$value = trim( preg_replace( '/\binset\b/i', '', $value ) );
		}

		// Pull trailing color (rgba/hsla/#/named).
		$color = 'rgba(0, 0, 0, 0.2)';
		if ( preg_match( '/^(.*?)((?:rgba?|hsla?)\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/', $value, $match ) ) {
			$color = trim( $match[2] );
			$value = trim( $match[1] );
		}

		$parts = preg_split( '/\s+/', $value );
		if ( count( $parts ) < 2 ) {
			return null;
		}

		$shadow = array(
			'x'     => $parts[0],
			'y'     => $parts[1],
			'blur'  => $parts[2] ?? '0',
			'spread'=> $parts[3] ?? '0',
			'color' => $color,
		);
		if ( $inset ) {
			$shadow['inset'] = true;
		}

		return wp_json_encode( array( $shadow ) );
	}

	public static function box_shadow_css( $value ): string {
		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			$value = is_array( $decoded ) ? $decoded : null;
		}
		if ( ! is_array( $value ) || empty( $value[0] ) ) {
			return '';
		}

		$shadow = $value[0];
		$parts = array(
			$shadow['x'] ?? '0',
			$shadow['y'] ?? '0',
			$shadow['blur'] ?? '0',
			$shadow['spread'] ?? '0',
			$shadow['color'] ?? 'rgba(0,0,0,0.2)',
		);
		$out = implode( ' ', $parts );
		if ( ! empty( $shadow['inset'] ) ) {
			$out .= ' inset';
		}
		return $out;
	}

	public static function set_responsive( array &$attributes, string $key, string $device, $value ): void {
		if ( ! isset( $attributes[ $key ] ) || ! is_array( $attributes[ $key ] ) ) {
			$attributes[ $key ] = array();
		}
		$attributes[ $key ][ $device ] = $value;
	}

	/**
	 * Merges a longhand side (e.g. margin-left) into an existing spacing value so a
	 * preceding shorthand on the same device is not discarded.
	 */
	public static function set_spacing_side( array &$attributes, string $key, string $device, string $side, string $value ): void {
		if ( ! isset( $attributes[ $key ] ) || ! is_array( $attributes[ $key ] ) ) {
			$attributes[ $key ] = array();
		}
		if ( ! isset( $attributes[ $key ][ $device ] ) || ! is_array( $attributes[ $key ][ $device ] ) ) {
			$attributes[ $key ][ $device ] = array(
				'top'    => '0',
				'right'  => '0',
				'bottom' => '0',
				'left'   => '0',
			);
		}
		$attributes[ $key ][ $device ][ $side ] = $value;
	}

	/**
	 * @param 'topLeft'|'topRight'|'bottomRight'|'bottomLeft' $corner
	 */
	public static function set_radius_side( array &$attributes, string $key, string $device, string $corner, string $value ): void {
		if ( ! isset( $attributes[ $key ] ) || ! is_array( $attributes[ $key ] ) ) {
			$attributes[ $key ] = array();
		}
		if ( ! isset( $attributes[ $key ][ $device ] ) || ! is_array( $attributes[ $key ][ $device ] ) ) {
			$attributes[ $key ][ $device ] = array(
				'topLeft'     => '0',
				'topRight'    => '0',
				'bottomRight' => '0',
				'bottomLeft'  => '0',
			);
		}
		$attributes[ $key ][ $device ][ $corner ] = $value;
	}

	/**
	 * Pull the first duration in seconds from a CSS time / transition value.
	 * `0.3s` → 0.3, `300ms` → 0.3, `transform 0.25s ease` → 0.25.
	 */
	public static function transition_seconds( string $value ): ?float {
		if ( preg_match( '/([\d.]+)\s*ms\b/i', $value, $match ) ) {
			return ( (float) $match[1] ) / 1000;
		}
		if ( preg_match( '/([\d.]+)\s*s\b/i', $value, $match ) ) {
			return (float) $match[1];
		}
		if ( is_numeric( trim( $value ) ) ) {
			return (float) trim( $value );
		}
		return null;
	}

	/**
	 * Map a transition shorthand onto known Blockish transition attrs when the
	 * property list is recognizable; otherwise return null (caller → customCss).
	 *
	 * @return array<string, float> attr => seconds
	 */
	public static function transition_attrs( string $value ): array {
		$seconds = self::transition_seconds( $value );
		if ( null === $seconds ) {
			return array();
		}

		$lower = strtolower( $value );
		$out   = array();

		$mentions_transform  = str_contains( $lower, 'transform' ) || str_contains( $lower, '--transform' );
		$mentions_background = str_contains( $lower, 'background' ) || str_contains( $lower, '--blockish-background' );
		$mentions_border     = (bool) preg_match( '/\bborder\b|--blockish-border/', $lower );

		if ( $mentions_transform ) {
			$out['transformTransitionDuration'] = $seconds;
		}
		if ( $mentions_background ) {
			$out['backgroundHoverTransition'] = $seconds;
		}
		if ( $mentions_border ) {
			$out['borderHoverTransition'] = $seconds;
		}

		// Bare duration / "all 0.3s" → transform transition (most common intentional motion).
		if ( empty( $out ) && ( ! preg_match( '/[a-z-]+\s+[\d.]/', $lower ) || str_contains( $lower, 'all' ) ) ) {
			$out['transformTransitionDuration'] = $seconds;
		}

		return $out;
	}

	/**
	 * Normalize a CSS typography value into the Blockish Typography field shape.
	 *
	 * @return mixed|null
	 */
	public static function normalize_typography_value( string $field, string $value, string $shape ) {
		$value = trim( $value );
		if ( '' === $value ) {
			return null;
		}

		if ( 'fontWeight' === $field ) {
			$lower = strtolower( $value );
			$map   = array(
				'normal'  => '400',
				'bold'    => '700',
				'lighter' => '300',
				'bolder'  => '700',
			);
			if ( isset( $map[ $lower ] ) ) {
				return $map[ $lower ];
			}
			if ( preg_match( '/^(100|200|300|400|500|600|700|800|900)$/', $value ) ) {
				return $value;
			}
			return null;
		}

		if ( 'fontStyle' === $field ) {
			$lower = strtolower( $value );
			if ( in_array( $lower, array( 'normal', 'italic' ), true ) ) {
				return $lower;
			}
			return null;
		}

		if ( 'textTransform' === $field ) {
			$lower = strtolower( $value );
			if ( in_array( $lower, array( 'none', 'uppercase', 'lowercase', 'capitalize' ), true ) ) {
				return $lower;
			}
			return null;
		}

		if ( 'textDecoration' === $field ) {
			$first = strtolower( strtok( $value, " \t" ) );
			if ( in_array( $first, array( 'none', 'underline', 'line-through' ), true ) ) {
				return $first;
			}
			return null;
		}

		if ( 'fontFamily' === $field ) {
			return self::font_family_option( $value );
		}

		// responsive lengths / unitless line-height — pass through.
		if ( 'responsive' === $shape ) {
			return $value;
		}

		return $value;
	}

	/**
	 * @return array{label: string, value: string}|null
	 */
	public static function font_family_option( string $value ): ?array {
		$value = trim( $value );
		if ( '' === $value || 'inherit' === strtolower( $value ) ) {
			return null;
		}

		$first = trim( explode( ',', $value )[0] );
		$first = trim( $first, " \t\"'" );
		if ( '' === $first ) {
			return null;
		}

		return array(
			'label' => $first,
			'value' => $value,
		);
	}

	/**
	 * Merge one Typography shape field into the stringified-JSON attribute.
	 */
	public static function merge_typography_field( $existing_json, string $field, string $shape, string $device, $value ): ?string {
		$typo = array();
		if ( is_string( $existing_json ) && '' !== $existing_json ) {
			$decoded = json_decode( $existing_json, true );
			if ( is_array( $decoded ) ) {
				$typo = $decoded;
			}
		} elseif ( is_array( $existing_json ) ) {
			$typo = $existing_json;
		}

		if ( 'responsive' === $shape ) {
			if ( ! isset( $typo[ $field ] ) || ! is_array( $typo[ $field ] ) ) {
				$typo[ $field ] = array();
			}
			$typo[ $field ][ $device ] = $value;
		} else {
			// Scalar / option typography keys are Desktop-only in the shape.
			if ( 'Desktop' !== $device ) {
				return null;
			}
			$typo[ $field ] = $value;
		}

		return wp_json_encode( $typo );
	}

	/**
	 * Typography JSON → per-device CSS declaration maps.
	 *
	 * @return array<string, array<string, string>>
	 */
	public static function typography_declarations( $json ): array {
		$typo = is_string( $json ) ? json_decode( $json, true ) : $json;
		if ( ! is_array( $typo ) ) {
			return array();
		}

		$out = array(
			'Desktop' => array(),
			'Tablet'  => array(),
			'Mobile'  => array(),
		);

		if ( ! empty( $typo['fontFamily']['value'] ) ) {
			$out['Desktop']['font-family'] = (string) $typo['fontFamily']['value'];
		}
		if ( isset( $typo['fontWeight'] ) && '' !== (string) $typo['fontWeight'] ) {
			$out['Desktop']['font-weight'] = (string) $typo['fontWeight'];
		}
		if ( ! empty( $typo['fontStyle'] ) ) {
			$out['Desktop']['font-style'] = (string) $typo['fontStyle'];
		}
		if ( ! empty( $typo['textTransform'] ) ) {
			$out['Desktop']['text-transform'] = (string) $typo['textTransform'];
		}
		if ( ! empty( $typo['textDecoration'] ) ) {
			$out['Desktop']['text-decoration'] = (string) $typo['textDecoration'];
		}

		$responsive = array(
			'fontSize'      => 'font-size',
			'lineHeight'    => 'line-height',
			'letterSpacing' => 'letter-spacing',
		);
		foreach ( $responsive as $field => $css_prop ) {
			if ( empty( $typo[ $field ] ) || ! is_array( $typo[ $field ] ) ) {
				continue;
			}
			foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
				if ( ! isset( $typo[ $field ][ $device ] ) || '' === (string) $typo[ $field ][ $device ] ) {
					continue;
				}
				$out[ $device ][ $css_prop ] = (string) $typo[ $field ][ $device ];
			}
		}

		return $out;
	}

	/**
	 * text-shadow → Box Shadow stringified JSON (no spread / inset).
	 */
	public static function text_shadow( string $value ): ?string {
		$value = trim( $value );
		if ( '' === $value || 'none' === strtolower( $value ) ) {
			return null;
		}

		// First layer only — commas inside rgba()/hsla() must not split.
		$value = self::first_comma_separated_layer( $value );

		$color = 'rgba(0, 0, 0, 0.3)';
		if ( preg_match( '/^(.*?)((?:rgba?|hsla?)\([^)]+\)|#[0-9a-fA-F]{3,8}|[a-zA-Z]+)$/', $value, $match ) ) {
			$color = trim( $match[2] );
			$value = trim( $match[1] );
		}

		$parts = preg_split( '/\s+/', $value );
		if ( count( $parts ) < 2 ) {
			return null;
		}

		return wp_json_encode(
			array(
				array(
					'x'     => $parts[0],
					'y'     => $parts[1],
					'blur'  => $parts[2] ?? '0',
					'color' => $color,
				),
			)
		);
	}

	/**
	 * Split on commas that are outside parentheses (multi-shadow lists).
	 */
	public static function first_comma_separated_layer( string $value ): string {
		$depth = 0;
		$len   = strlen( $value );
		for ( $i = 0; $i < $len; $i++ ) {
			$ch = $value[ $i ];
			if ( '(' === $ch ) {
				++$depth;
			} elseif ( ')' === $ch ) {
				$depth = max( 0, $depth - 1 );
			} elseif ( ',' === $ch && 0 === $depth ) {
				return trim( substr( $value, 0, $i ) );
			}
		}
		return trim( $value );
	}

	public static function text_shadow_css( $value ): string {
		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			$value   = is_array( $decoded ) ? $decoded : null;
		}
		if ( ! is_array( $value ) || empty( $value[0] ) ) {
			return '';
		}

		$shadow = $value[0];
		return trim(
			( $shadow['x'] ?? '0' ) . ' ' .
			( $shadow['y'] ?? '0' ) . ' ' .
			( $shadow['blur'] ?? '0' ) . ' ' .
			( $shadow['color'] ?? 'rgba(0,0,0,0.3)' )
		);
	}

	/**
	 * buttonPlacement / buttonAlignment are ToggleGroup controls: bare strings.
	 */
	public static function button_placement_value( string $value ): ?string {
		$map = array(
			'flex-start' => 'flex-start',
			'start'      => 'flex-start',
			'left'       => 'flex-start',
			'center'     => 'center',
			'flex-end'   => 'flex-end',
			'end'        => 'flex-end',
			'right'      => 'flex-end',
		);

		return $map[ strtolower( trim( $value ) ) ] ?? null;
	}

	public static function button_alignment_value( string $value ): ?string {
		$map = array(
			'start'      => 'start',
			'flex-start' => 'start',
			'left'       => 'start',
			'center'     => 'center',
			'end'        => 'end',
			'flex-end'   => 'end',
			'right'      => 'end',
		);

		return $map[ strtolower( trim( $value ) ) ] ?? null;
	}

	/**
	 * iconPosition is a bare string enum, not an Option object.
	 */
	public static function icon_position( string $value ): ?string {
		$v = strtolower( trim( $value ) );
		if ( in_array( $v, array( 'row', 'row-reverse' ), true ) ) {
			return $v;
		}
		return null;
	}

	/**
	 * CSS opacity → Blockish percent number (0–100) for `opacity: {{VALUE}}%`.
	 */
	public static function opacity_percent( string $value ): ?float {
		$value = trim( $value );
		if ( '' === $value ) {
			return null;
		}
		if ( preg_match( '/^([-.\d]+)\s*%$/', $value, $match ) ) {
			return (float) $match[1];
		}
		if ( ! is_numeric( $value ) ) {
			return null;
		}
		$n = (float) $value;
		if ( $n >= 0 && $n <= 1 ) {
			return $n * 100;
		}
		return $n;
	}

	/**
	 * filter: blur(4px) brightness(120%)… → stringified CSS Filters JSON.
	 */
	public static function css_filters( string $value ): ?string {
		$value = trim( $value );
		if ( '' === $value || 'none' === strtolower( $value ) ) {
			return null;
		}

		$out = array();
		if ( ! preg_match_all( '/(blur|brightness|contrast|saturate|hue-rotate|invert|grayscale|sepia)\(\s*([-.\d]+)\s*(px|%|deg)?\s*\)/i', $value, $matches, PREG_SET_ORDER ) ) {
			return null;
		}

		foreach ( $matches as $match ) {
			$out[ strtolower( $match[1] ) ] = (float) $match[2];
		}

		return empty( $out ) ? null : wp_json_encode( $out );
	}

	public static function css_filters_css( $value ): string {
		if ( is_string( $value ) ) {
			$decoded = json_decode( $value, true );
			$value   = is_array( $decoded ) ? $decoded : null;
		}
		if ( ! is_array( $value ) || empty( $value ) ) {
			return '';
		}

		$units = array(
			'blur'       => 'px',
			'brightness' => '%',
			'contrast'   => '%',
			'saturate'   => '%',
			'hue-rotate' => 'deg',
			'invert'     => '%',
			'grayscale'  => '%',
			'sepia'      => '%',
		);

		$parts = array();
		foreach ( $units as $name => $unit ) {
			if ( ! array_key_exists( $name, $value ) || '' === $value[ $name ] || null === $value[ $name ] ) {
				continue;
			}
			$parts[] = $name . '(' . (float) $value[ $name ] . $unit . ')';
		}

		return implode( ' ', $parts );
	}

	/**
	 * rotate(45deg) / 45deg / 45 → raw degree string for icon rotation attrs.
	 */
	public static function rotation_degrees( string $value ): ?string {
		$value = trim( $value );
		if ( '' === $value || 'none' === strtolower( $value ) ) {
			return null;
		}

		if ( preg_match( '/rotate\(\s*([-.\d]+)\s*deg\s*\)/i', $value, $match ) ) {
			$stripped = preg_replace( '/rotate\(\s*[-.\d]+\s*deg\s*\)/i', '', $value );
			$stripped = preg_replace( '/\s+/', '', (string) $stripped );
			if ( '' !== $stripped && 'none' !== strtolower( $stripped ) ) {
				return null; // mixed transform → customCss
			}
			return (string) (float) $match[1];
		}

		if ( preg_match( '/^([-.\d]+)\s*deg$/i', $value, $match ) ) {
			return (string) (float) $match[1];
		}

		if ( is_numeric( $value ) ) {
			return (string) (float) $value;
		}

		return null;
	}
}
