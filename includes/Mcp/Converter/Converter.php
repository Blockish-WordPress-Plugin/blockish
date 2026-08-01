<?php

namespace Blockish\Mcp\Converter;

use Blockish\Mcp\Converter\Maps\ButtonMap;
use Blockish\Mcp\Converter\Maps\ContainerMap;
use Blockish\Mcp\Converter\Maps\GlobalMap;
use Blockish\Mcp\Converter\Maps\IconMap;
use Blockish\Mcp\Converter\Maps\ImageMap;
use Blockish\Mcp\Converter\Maps\TextMap;

defined( 'ABSPATH' ) || exit;

/**
 * CSS <-> attributes converter.
 *
 * Supported block_name values:
 * - blockish/global     - Advanced-panel attrs shared by every block
 * - blockish/container  - GlobalMap + container-specific overrides
 * - blockish/heading    - GlobalMap + text style
 * - blockish/paragraph  - same text map as heading
 * - blockish/button     - GlobalMap + button* chrome
 * - blockish/image      - GlobalMap + image and caption styles
 * - blockish/icon       - GlobalMap + size/color/rotation/alignment
 */
class Converter {

	private const SUPPORTED = 'blockish/global, every installed blockish/* block, blockish-dynamicity/*, and blockish-forms/*';

	/**
	 * @param array{css?: string, attributes?: array, root_selector?: string} $input
	 * @return array{attributes?: array, customCss?: string, mapped?: string[], unmapped?: string[], root_selector?: string, block_name?: string, error?: string}
	 */
	public static function css_to_attributes( string $block_name, array $input ): array {
		$css = isset( $input['css'] ) ? (string) $input['css'] : '';
		if ( '' === trim( $css ) ) {
			return array( 'error' => 'css is required for css_to_attributes.' );
		}

		if ( str_contains( $css, self::ROOT_TOKEN ) ) {
			$css                     = str_replace( self::ROOT_TOKEN, self::SCHEMA_ROOT_SELECTOR, $css );
			$input['css']            = $css;
			$input['root_selector']  = ! empty( $input['root_selector'] )
				? $input['root_selector']
				: self::SCHEMA_ROOT_SELECTOR;
		}

		$map = self::resolve_map( $block_name );
		if ( null === $map ) {
			if ( MetadataConverter::supports( $block_name ) ) {
				return MetadataConverter::css_to_attributes( $block_name, $input );
			}
			return array(
				'error' => 'Unsupported block_name "' . $block_name . '". Supported: ' . self::SUPPORTED . '.',
			);
		}

		$parsed        = CssParser::parse( $css );
		$root_selector = isset( $input['root_selector'] ) ? trim( (string) $input['root_selector'] ) : '';
		if ( '' === $root_selector ) {
			$root_selector = self::guess_root_selector( $parsed['rules'] );
		}

		$attributes           = array();
		$mapped               = array();
		$unmapped_rules       = array();
		$background_buckets   = array();

		foreach ( $parsed['rules'] as $rule ) {
			$selector = $rule['selector'];
			$device   = $rule['device'];
			$classified = self::classify_rule( $selector, $root_selector, $block_name );
			$kind       = $classified['kind'];
			$surface    = $classified['surface'];

			if ( 'other' === $kind ) {
				$unmapped_rules[] = self::rule_to_css( $selector, $rule['declarations'], $device );
				continue;
			}

			$is_hover = ( 'hover' === $kind );

			foreach ( $rule['declarations'] as $property => $value ) {
				$meta = self::resolve_surface_meta( $map, $property, $surface, $block_name );
				if ( null === $meta ) {
					$unmapped_rules[] = self::rule_to_css( $selector, array( $property => $value ), $device );
					continue;
				}

				$type = $meta['type'];

				if ( 'background_bucket' === $type ) {
					$bucket_key = ( $is_hover ? 'hover:' : 'normal:' ) . ( $meta['attr'] ?? 'background' );
					if ( ! isset( $background_buckets[ $bucket_key ] ) ) {
						$background_buckets[ $bucket_key ] = array(
							'attr'      => $is_hover ? ( $meta['hover_attr'] ?? null ) : $meta['attr'],
							'by_device' => array(),
						);
					}
					if ( ! $background_buckets[ $bucket_key ]['attr'] ) {
						$unmapped_rules[] = self::rule_to_css( $selector, array( $property => $value ), $device );
						continue;
					}
					if ( ! isset( $background_buckets[ $bucket_key ]['by_device'][ $device ] ) ) {
						$background_buckets[ $bucket_key ]['by_device'][ $device ] = array();
					}
					$background_buckets[ $bucket_key ]['by_device'][ $device ][ $property ] = $value;
					$mapped[] = $property . '@' . $device . ( $is_hover ? ':hover' : '' );
					continue;
				}

				$attr = self::resolve_attr( $meta, $is_hover );
				if ( ! $attr ) {
					$unmapped_rules[] = self::rule_to_css( $selector, array( $property => $value ), $device );
					continue;
				}

				$overflow = array();
				$ok       = self::apply_property( $attributes, $attr, $meta, $property, $value, $device, $is_hover, $overflow );
				if ( $ok ) {
					$mapped[] = $property . '@' . $device . ( $is_hover ? ':hover' : '' );
					if ( ! empty( $overflow ) ) {
						$unmapped_rules[] = self::rule_to_css( $selector, $overflow, $device );
					}
				} else {
					$unmapped_rules[] = self::rule_to_css( $selector, array( $property => $value ), $device );
				}
			}
		}

		foreach ( $background_buckets as $bucket ) {
			if ( ! $bucket['attr'] || empty( $bucket['by_device'] ) ) {
				continue;
			}
			$payload = null;
			foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
				if ( empty( $bucket['by_device'][ $device ] ) ) {
					continue;
				}
				$payload = Codecs::merge_background( $bucket['by_device'][ $device ], $device, $payload );
			}
			// Devices not in the preferred order (shouldn't happen).
			foreach ( $bucket['by_device'] as $device => $decls ) {
				if ( in_array( $device, array( 'Desktop', 'Tablet', 'Mobile' ), true ) ) {
					continue;
				}
				$payload = Codecs::merge_background( $decls, $device, $payload );
			}
			if ( $payload ) {
				$attributes[ $bucket['attr'] ] = (string) wp_json_encode( $payload );
			} else {
				$flat = array();
				foreach ( $bucket['by_device'] as $decls ) {
					$flat = array_merge( $flat, $decls );
				}
				$unmapped_rules[] = self::rule_to_css( $root_selector, $flat, 'Desktop' );
			}
		}

		foreach ( $parsed['raw_leftovers'] as $raw ) {
			$unmapped_rules[] = $raw;
		}

		// Handwritten maps cover the common surfaces; block.json declares the rest
		// (overlays, icon chrome, …). Retry leftovers there before giving up.
		if ( ! empty( $unmapped_rules ) && MetadataConverter::supports( $block_name ) ) {
			$fallback = MetadataConverter::css_to_attributes(
				$block_name,
				array(
					'css'           => implode( "\n", $unmapped_rules ),
					'root_selector' => $root_selector,
				)
			);

			if ( empty( $fallback['error'] ) && ! empty( $fallback['mapped'] ) ) {
				$attributes     = array_merge( $fallback['attributes'] ?? array(), $attributes );
				$mapped         = array_merge( $mapped, $fallback['mapped'] );
				$unmapped_rules = $fallback['unmapped'] ?? array();
			}
		}

		unset( $attributes['customCss'] );

		$custom_css = self::build_custom_css( $unmapped_rules, $root_selector );

		return array(
			'attributes'    => $attributes,
			'customCss'     => $custom_css,
			'mapped'        => array_values( array_unique( $mapped ) ),
			'unmapped'      => $unmapped_rules,
			'root_selector' => $root_selector,
			'block_name'    => $block_name,
		);
	}

	/**
	 * Temporary root token for css_to_schema. Authors write CSS against this
	 * keyword; it never becomes a real block class.
	 */
	public const ROOT_TOKEN = '{{ROOT}}';

	private const SCHEMA_ROOT_SELECTOR = '.blockish-convert-root';

	/**
	 * Walk a block_schema tree, convert each node's `css` (using {{ROOT}}) into
	 * style attributes, merge onto existing content attributes, and strip transport
	 * fields (`css`, `root_selector`). One call → ready-to-stage schema.
	 *
	 * @param array{block_schema?: array} $input
	 * @return array{block_schema?: array, report?: array, error?: string}
	 */
	public static function css_to_schema( array $input ): array {
		$schema = $input['block_schema'] ?? null;
		if ( ! is_array( $schema ) ) {
			return array( 'error' => 'block_schema (array of block nodes) is required for css_to_schema.' );
		}

		$report = array(
			'converted' => 0,
			'skipped'   => 0,
			'mapped'    => array(),
			'unmapped'  => array(),
			'warnings'  => array(),
		);

		$converted = self::convert_schema_nodes( $schema, '', $report );

		return array(
			'block_schema' => $converted,
			'report'       => $report,
		);
	}

	/**
	 * @param array<int, mixed> $nodes
	 * @param array{converted: int, skipped: int, mapped: array, unmapped: array, warnings: array} $report
	 * @return array<int, array>
	 */
	private static function convert_schema_nodes( array $nodes, string $path, array &$report ): array {
		$out = array();

		foreach ( array_values( $nodes ) as $index => $node ) {
			$node_path = '' === $path ? (string) $index : $path . '/' . $index;

			if ( ! is_array( $node ) ) {
				$report['warnings'][] = $node_path . ': skipped non-object node.';
				continue;
			}

			$out[] = self::convert_schema_node( $node, $node_path, $report );
		}

		return $out;
	}

	/**
	 * @param array<string, mixed> $node
	 * @param array{converted: int, skipped: int, mapped: array, unmapped: array, warnings: array} $report
	 * @return array<string, mixed>
	 */
	private static function convert_schema_node( array $node, string $path, array &$report ): array {
		$name = isset( $node['name'] ) ? (string) $node['name'] : '';
		$css  = isset( $node['css'] ) ? trim( (string) $node['css'] ) : '';

		unset( $node['css'], $node['root_selector'], $node['key'] );

		if ( '' !== $css ) {
			if ( '' === $name ) {
				$report['warnings'][] = $path . ': css present but name missing — left as customCss.';
				$node['attributes']   = self::merge_schema_attributes(
					$node['attributes'] ?? array(),
					array(),
					self::normalize_root_token( $css )
				);
				++$report['skipped'];
			} else {
				$result = self::css_to_attributes(
					$name,
					array(
						'css'           => self::normalize_root_token( $css ),
						'root_selector' => self::SCHEMA_ROOT_SELECTOR,
					)
				);

				if ( ! empty( $result['error'] ) ) {
					$report['warnings'][] = $path . ' (' . $name . '): ' . $result['error'];
					$node['attributes']   = self::merge_schema_attributes(
						$node['attributes'] ?? array(),
						array(),
						self::normalize_root_token( $css )
					);
					++$report['skipped'];
				} else {
					$style_attrs = $result['attributes'] ?? array();
					$custom_css  = $result['customCss'] ?? '';
					$node['attributes'] = self::merge_schema_attributes(
						$node['attributes'] ?? array(),
						$style_attrs,
						$custom_css
					);

					$label = $path . ' (' . $name . ')';
					foreach ( $result['mapped'] ?? array() as $mapped ) {
						$report['mapped'][] = $label . ': ' . $mapped;
					}
					foreach ( $result['unmapped'] ?? array() as $unmapped ) {
						$report['unmapped'][] = $label . ': ' . $unmapped;
					}
					++$report['converted'];
				}
			}
		}

		if ( ! empty( $node['innerBlocks'] ) && is_array( $node['innerBlocks'] ) ) {
			$node['innerBlocks'] = self::convert_schema_nodes( $node['innerBlocks'], $path, $report );
		}

		return $node;
	}

	/**
	 * Content/data attributes on the node win over converted style attrs when
	 * both set the same key (except customCss, which is concatenated).
	 *
	 * @param mixed $existing
	 * @param array<string, mixed> $style_attrs
	 * @return array<string, mixed>
	 */
	private static function merge_schema_attributes( $existing, array $style_attrs, string $custom_css ): array {
		$base = is_array( $existing ) ? $existing : array();

		$existing_custom = '';
		if ( isset( $base['customCss'] ) && is_string( $base['customCss'] ) ) {
			$existing_custom = trim( $base['customCss'] );
		}
		unset( $base['customCss'] );

		$style_custom = '';
		if ( isset( $style_attrs['customCss'] ) && is_string( $style_attrs['customCss'] ) ) {
			$style_custom = trim( $style_attrs['customCss'] );
		}
		unset( $style_attrs['customCss'] );

		// Style first, then content — so explicit content/data attrs are not overwritten.
		$merged = array_replace( $style_attrs, $base );

		$parts = array_filter(
			array( $existing_custom, $style_custom, trim( $custom_css ) ),
			static fn( $part ) => '' !== $part
		);
		if ( ! empty( $parts ) ) {
			$merged['customCss'] = implode( "\n", array_values( array_unique( $parts ) ) );
		}

		return $merged;
	}

	private static function normalize_root_token( string $css ): string {
		return str_replace( self::ROOT_TOKEN, self::SCHEMA_ROOT_SELECTOR, $css );
	}

	/**
	 * @param array{attributes?: array, root_selector?: string} $input
	 * @return array{css?: string, block_name?: string, error?: string}
	 */
	public static function attributes_to_css( string $block_name, array $input ): array {
		$map = self::resolve_map( $block_name );
		if ( null === $map ) {
			if ( MetadataConverter::supports( $block_name ) ) {
				return MetadataConverter::attributes_to_css( $block_name, $input );
			}
			return array(
				'error' => 'Unsupported block_name "' . $block_name . '". Supported: ' . self::SUPPORTED . '.',
			);
		}

		$attributes = $input['attributes'] ?? null;
		if ( ! is_array( $attributes ) ) {
			return array( 'error' => 'attributes object is required for attributes_to_css.' );
		}

		$selector = isset( $input['root_selector'] ) && '' !== trim( (string) $input['root_selector'] )
			? trim( (string) $input['root_selector'] )
			: '{{SELECTOR}}';

		$desktop = array();
		$tablet  = array();
		$mobile  = array();
		$chrome_desktop = array();
		$chrome_tablet  = array();
		$chrome_mobile  = array();
		$icon_desktop = array();
		$icon_tablet  = array();
		$icon_mobile  = array();
		$media_desktop = array();
		$media_tablet  = array();
		$media_mobile  = array();
		$caption_desktop = array();
		$caption_tablet  = array();
		$caption_mobile  = array();
		$svg_desktop = array();
		$svg_tablet  = array();
		$svg_mobile  = array();

		$push = static function ( string $device, string $property, string $value, string $surface = 'wrapper' ) use (
			&$desktop, &$tablet, &$mobile,
			&$chrome_desktop, &$chrome_tablet, &$chrome_mobile,
			&$icon_desktop, &$icon_tablet, &$icon_mobile,
			&$media_desktop, &$media_tablet, &$media_mobile,
			&$caption_desktop, &$caption_tablet, &$caption_mobile,
			&$svg_desktop, &$svg_tablet, &$svg_mobile
		) {
			if ( '' === $value ) {
				return;
			}
			$buckets = array(
				'chrome'  => array( &$chrome_desktop, &$chrome_tablet, &$chrome_mobile ),
				'icon'    => array( &$icon_desktop, &$icon_tablet, &$icon_mobile ),
				'media'   => array( &$media_desktop, &$media_tablet, &$media_mobile ),
				'caption' => array( &$caption_desktop, &$caption_tablet, &$caption_mobile ),
				'svg'     => array( &$svg_desktop, &$svg_tablet, &$svg_mobile ),
				'wrapper' => array( &$desktop, &$tablet, &$mobile ),
			);
			$group = $buckets[ $surface ] ?? $buckets['wrapper'];
			if ( 'Tablet' === $device ) {
				$group[1][ $property ] = $value;
			} elseif ( 'Mobile' === $device ) {
				$group[2][ $property ] = $value;
			} else {
				$group[0][ $property ] = $value;
			}
		};

		$emit_responsive = static function ( $value, string $property, bool $as_option = false, string $surface = 'wrapper' ) use ( $push ) {
			if ( ! is_array( $value ) ) {
				$css_value = $as_option ? Codecs::option_css( $value ) : (string) $value;
				$push( 'Desktop', $property, $css_value, $surface );
				return;
			}

			foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
				if ( ! array_key_exists( $device, $value ) ) {
					continue;
				}
				$raw       = $value[ $device ];
				$css_value = $as_option ? Codecs::option_css( $raw ) : ( is_array( $raw ) ? '' : (string) $raw );
				if ( is_array( $raw ) && ! $as_option ) {
					continue;
				}
				$push( $device, $property, $css_value, $surface );
			}
		};

		// Scalar / option / responsive from a reverse walk of known attrs.
		if ( isset( $attributes['display'] ) ) {
			$push( 'Desktop', 'display', (string) $attributes['display'] );
		}
		if ( isset( $attributes['position'] ) ) {
			$push( 'Desktop', 'position', Codecs::option_css( $attributes['position'] ) );
		}

		foreach (
			array(
				'flexDirection'  => array( 'flex-direction', true ),
				'justifyContent' => array( 'justify-content', true ),
				'alignItems'     => array( 'align-items', true ),
				'overflow'       => array( 'overflow', true ),
				'flexWrap'       => array( 'flex-wrap', false ),
				'columnGap'      => array( 'column-gap', false ),
				'rowGap'         => array( 'row-gap', false ),
				'containerMinHeight' => array( 'min-height', false ),
				'customWidthContainer' => array( 'max-width', false ),
				'maxWidth'       => array( 'max-width', false ),
				'minWidth'       => array( 'min-width', false ),
				'zIndex'         => array( 'z-index', false ),
				'positionTop'    => array( 'top', false ),
				'positionRight'  => array( 'right', false ),
				'positionBottom' => array( 'bottom', false ),
				'positionLeft'   => array( 'left', false ),
				'alignSelf'      => array( 'align-self', false ),
				'justifySelf'    => array( 'justify-self', false ),
				'flexGrow'       => array( 'flex-grow', false ),
				'flexShrink'     => array( 'flex-shrink', false ),
				'flexOrder'      => array( 'order', false ),
				'flexCustomOrder'=> array( 'order', false ),
				'gridColumnStart'=> array( 'grid-column-start', false ),
				'gridColumnEnd'  => array( 'grid-column-end', false ),
				'gridRowStart'   => array( 'grid-row-start', false ),
				'gridRowEnd'     => array( 'grid-row-end', false ),
				'autoGridWidth'  => array( '__auto_grid_width', false ),
				'autoGridHeight' => array( '__auto_grid_height', false ),
				'gridColumns'    => array( '__grid_columns', false ),
				'gridRows'       => array( '__grid_rows', false ),
			) as $attr => $meta
		) {
			if ( ! isset( $attributes[ $attr ] ) ) {
				continue;
			}
			$emit_responsive( $attributes[ $attr ], $meta[0], $meta[1] );
		}

		// Expand grid placeholders into real CSS after collect.
		foreach ( array( 'Desktop' => &$desktop, 'Tablet' => &$tablet, 'Mobile' => &$mobile ) as $device => &$bucket ) {
			if ( isset( $bucket['__grid_columns'] ) ) {
				$n = $bucket['__grid_columns'];
				$bucket['grid-template-columns'] = 'repeat(' . $n . ', minmax(0, 1fr))';
				unset( $bucket['__grid_columns'] );
				if ( empty( $attributes['display'] ) ) {
					$push( 'Desktop', 'display', 'grid' );
				}
			}
			if ( isset( $bucket['__grid_rows'] ) ) {
				$n = $bucket['__grid_rows'];
				$bucket['grid-template-rows'] = 'repeat(' . $n . ', minmax(0, 1fr))';
				unset( $bucket['__grid_rows'] );
			}
			if ( isset( $bucket['__auto_grid_width'] ) ) {
				$w = $bucket['__auto_grid_width'];
				$bucket['grid-template-columns'] = 'repeat(auto-fill, minmax(min(' . $w . ', 100%), 1fr))';
				unset( $bucket['__auto_grid_width'] );
			}
			if ( isset( $bucket['__auto_grid_height'] ) ) {
				$h = $bucket['__auto_grid_height'];
				$bucket['grid-auto-rows'] = 'minmax(' . $h . ', auto)';
				unset( $bucket['__auto_grid_height'] );
			}
		}
		unset( $bucket );

		// widthType / customWidth.
		if ( ! empty( $attributes['widthType'] ) ) {
			$wt = $attributes['widthType'];
			if ( is_array( $wt ) && isset( $wt['Desktop'] ) ) {
				foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
					if ( empty( $wt[ $device ] ) ) {
						continue;
					}
					$val = Codecs::option_css( $wt[ $device ] );
					if ( 'custom' === $val ) {
						$cw = $attributes['customWidth'][ $device ] ?? $attributes['customWidth']['Desktop'] ?? null;
						if ( $cw ) {
							$push( $device, 'width', is_array( $cw ) ? '' : (string) $cw );
						}
					} elseif ( '' !== $val ) {
						$push( $device, 'width', $val );
					}
				}
			} elseif ( is_array( $wt ) && isset( $wt['value'] ) ) {
				$val = (string) $wt['value'];
				if ( 'custom' === $val ) {
					$cw = $attributes['customWidth']['Desktop'] ?? $attributes['customWidth'] ?? null;
					if ( is_string( $cw ) || is_numeric( $cw ) ) {
						$push( 'Desktop', 'width', (string) $cw );
					}
				} else {
					$push( 'Desktop', 'width', $val );
				}
			}
		} elseif ( ! empty( $attributes['customWidth'] ) && empty( $attributes['customWidthContainer'] ) ) {
			$emit_responsive( $attributes['customWidth'], 'width', false );
		}

		foreach ( array( 'padding' => 'padding', 'margin' => 'margin', 'buttonPadding' => 'padding' ) as $attr => $property ) {
			if ( empty( $attributes[ $attr ] ) || ! is_array( $attributes[ $attr ] ) ) {
				continue;
			}
			$surface = ( 'buttonPadding' === $attr ) ? 'chrome' : 'wrapper';
			$val     = $attributes[ $attr ];
			if ( isset( $val['top'] ) || isset( $val['TOP'] ) ) {
				$push( 'Desktop', $property, Codecs::spacing_css( $val ), $surface );
			} else {
				foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
					if ( empty( $val[ $device ] ) ) {
						continue;
					}
					$push( $device, $property, Codecs::spacing_css( $val[ $device ] ), $surface );
				}
			}
		}

		$radius_pairs = array(
			'borderRadius'               => array( 'border-radius', false, 'wrapper' ),
			'borderRadiusHover'          => array( 'border-radius', true, 'wrapper' ),
			'containerBorderRadius'      => array( 'border-radius', false, 'wrapper' ),
			'containerHoverBorderRadius' => array( 'border-radius', true, 'wrapper' ),
			'buttonBorderRadius'         => array( 'border-radius', false, 'chrome' ),
			'imageBorderRadiusNormal'    => array( 'border-radius', false, 'media' ),
			'imageBorderRadiusHover'     => array( 'border-radius', true, 'media' ),
		);
		foreach ( $radius_pairs as $attr => $meta ) {
			if ( empty( $attributes[ $attr ] ) || ! is_array( $attributes[ $attr ] ) ) {
				continue;
			}
			$val     = $attributes[ $attr ];
			$hover   = $meta[1];
			$surface = $meta[2] ?? 'wrapper';
			$key     = $hover ? '__hover_border-radius' : 'border-radius';
			if ( isset( $val['topLeft'] ) ) {
				$push( 'Desktop', $key, Codecs::radius_css( $val ), $surface );
			} else {
				foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
					if ( empty( $val[ $device ] ) ) {
						continue;
					}
					$push( $device, $key, Codecs::radius_css( $val[ $device ] ), $surface );
				}
			}
		}

		$border_attrs = array(
			'border'               => array( '', 'wrapper' ),
			'borderHover'          => array( '__hover_', 'wrapper' ),
			'containerBorder'      => array( '', 'wrapper' ),
			'containerHoverBorder' => array( '__hover_', 'wrapper' ),
			'buttonBorder'         => array( '', 'chrome' ),
			'imageBorderNormal'    => array( '', 'media' ),
			'imageBorderHover'     => array( '__hover_', 'media' ),
		);
		foreach ( $border_attrs as $attr => $meta ) {
			if ( empty( $attributes[ $attr ] ) ) {
				continue;
			}
			$prefix  = $meta[0];
			$surface = $meta[1];
			foreach ( Codecs::border_css_map( $attributes[ $attr ] ) as $device => $declarations ) {
				foreach ( $declarations as $property => $css ) {
					$push( $device, $prefix . $property, $css, $surface );
				}
			}
		}

		$shadow_pairs = array(
			'boxShadow'               => array( 'box-shadow', 'wrapper' ),
			'boxShadowHover'          => array( '__hover_box-shadow', 'wrapper' ),
			'containerBoxShadow'      => array( 'box-shadow', 'wrapper' ),
			'containerHoverBoxShadow' => array( '__hover_box-shadow', 'wrapper' ),
			'buttonBoxShadow'         => array( 'box-shadow', 'chrome' ),
			'buttonHoverBoxShadow'    => array( '__hover_box-shadow', 'chrome' ),
			'imageBoxShadowNormal'    => array( 'box-shadow', 'media' ),
			'imageBoxShadowHover'     => array( '__hover_box-shadow', 'media' ),
		);
		foreach ( $shadow_pairs as $attr => $meta ) {
			if ( ! empty( $attributes[ $attr ] ) ) {
				$push( 'Desktop', $meta[0], Codecs::box_shadow_css( $attributes[ $attr ] ), $meta[1] );
			}
		}

		$bg_pairs = array(
			'background'               => array( '', 'wrapper' ),
			'backgroundHover'          => array( '__hover_', 'wrapper' ),
			'containerBackground'      => array( '', 'wrapper' ),
			'containerHoverBackground' => array( '__hover_', 'wrapper' ),
			'buttonBackground'         => array( '', 'chrome' ),
			'buttonHoverBackground'    => array( '__hover_', 'chrome' ),
		);
		foreach ( $bg_pairs as $attr => $meta ) {
			foreach ( Codecs::background_css( $attributes[ $attr ] ?? null ) as $property => $value ) {
				$push( 'Desktop', $meta[0] . $property, $value, $meta[1] );
			}
		}

		// Readable transform when applyTransform is on.
		$transform_css = self::compose_transform_css( $attributes, false );
		if ( '' !== $transform_css ) {
			$push( 'Desktop', 'transform', $transform_css );
		}
		$transform_hover_css = self::compose_transform_css( $attributes, true );
		if ( '' !== $transform_hover_css ) {
			$push( 'Desktop', '__hover_transform', $transform_hover_css );
		}
		if ( ! empty( $attributes['transformOrigin'] ) && is_string( $attributes['transformOrigin'] ) && 'custom' !== $attributes['transformOrigin'] ) {
			$push( 'Desktop', 'transform-origin', $attributes['transformOrigin'] );
		}

		if ( isset( $attributes['backgroundHoverTransition'] ) && is_numeric( $attributes['backgroundHoverTransition'] ) ) {
			$push( 'Desktop', '--blockish-background-hover-transition', $attributes['backgroundHoverTransition'] . 's' );
		}
		if ( isset( $attributes['borderHoverTransition'] ) && is_numeric( $attributes['borderHoverTransition'] ) ) {
			$push( 'Desktop', '--blockish-border-hover-transition', $attributes['borderHoverTransition'] . 's' );
		}
		if ( isset( $attributes['transformTransitionDuration'] ) && is_numeric( $attributes['transformTransitionDuration'] ) ) {
			$push( 'Desktop', '--transform-transition', $attributes['transformTransitionDuration'] . 's' );
		}

		// Text blocks: alignment, color, typography, text-shadow.
		if ( ! empty( $attributes['alignment'] ) ) {
			$emit_responsive( $attributes['alignment'], 'text-align', false );
		}
		if ( IconMap::BLOCK_NAME !== $block_name ) {
			if ( ! empty( $attributes['color'] ) && is_scalar( $attributes['color'] ) ) {
				$push( 'Desktop', 'color', (string) $attributes['color'] );
			}
			if ( ! empty( $attributes['hoverColor'] ) && is_scalar( $attributes['hoverColor'] ) ) {
				$push( 'Desktop', '__hover_color', (string) $attributes['hoverColor'] );
			}
		}
		if ( ! empty( $attributes['typography'] ) ) {
			foreach ( Codecs::typography_declarations( $attributes['typography'] ) as $device => $decls ) {
				foreach ( $decls as $property => $css_value ) {
					$push( $device, $property, $css_value );
				}
			}
		}
		if ( ! empty( $attributes['textShadow'] ) ) {
			$push( 'Desktop', 'text-shadow', Codecs::text_shadow_css( $attributes['textShadow'] ) );
		}
		if ( ! empty( $attributes['textShadowHover'] ) ) {
			$push( 'Desktop', '__hover_text-shadow', Codecs::text_shadow_css( $attributes['textShadowHover'] ) );
		}

		// Button chrome / placement / icon.
		if ( ! empty( $attributes['buttonPlacement'] ) ) {
			$emit_responsive( $attributes['buttonPlacement'], 'justify-content', true, 'wrapper' );
		}
		if ( ! empty( $attributes['buttonAlignment'] ) ) {
			$emit_responsive( $attributes['buttonAlignment'], 'justify-content', true, 'chrome' );
			$emit_responsive( $attributes['buttonAlignment'], 'text-align', true, 'chrome' );
		}
		if ( ! empty( $attributes['buttonContentSpacing'] ) ) {
			$emit_responsive( $attributes['buttonContentSpacing'], 'gap', false, 'chrome' );
		}
		if ( ! empty( $attributes['buttonWidth'] ) ) {
			$emit_responsive( $attributes['buttonWidth'], 'width', false, 'chrome' );
		}
		if ( ! empty( $attributes['buttonMinHeight'] ) ) {
			$emit_responsive( $attributes['buttonMinHeight'], 'min-height', false, 'chrome' );
		}
		if ( ! empty( $attributes['buttonTextColor'] ) && is_scalar( $attributes['buttonTextColor'] ) ) {
			$push( 'Desktop', 'color', (string) $attributes['buttonTextColor'], 'chrome' );
		}
		if ( ! empty( $attributes['buttonHoverTextColor'] ) && is_scalar( $attributes['buttonHoverTextColor'] ) ) {
			$push( 'Desktop', '__hover_color', (string) $attributes['buttonHoverTextColor'], 'chrome' );
		}
		if ( ! empty( $attributes['buttonHoverBorderColor'] ) && is_scalar( $attributes['buttonHoverBorderColor'] ) ) {
			$push( 'Desktop', '__hover_border-color', (string) $attributes['buttonHoverBorderColor'], 'chrome' );
		}
		if ( ! empty( $attributes['buttonTypography'] ) ) {
			foreach ( Codecs::typography_declarations( $attributes['buttonTypography'] ) as $device => $decls ) {
				foreach ( $decls as $property => $css_value ) {
					$push( $device, $property, $css_value, 'chrome' );
				}
			}
		}
		if ( ! empty( $attributes['buttonTextShadow'] ) ) {
			$push( 'Desktop', 'text-shadow', Codecs::text_shadow_css( $attributes['buttonTextShadow'] ), 'chrome' );
		}
		if ( ! empty( $attributes['iconPosition'] ) && is_string( $attributes['iconPosition'] ) ) {
			$push( 'Desktop', 'flex-direction', $attributes['iconPosition'], 'chrome' );
		}
		if ( isset( $attributes['buttonHoverTransition'] ) && is_numeric( $attributes['buttonHoverTransition'] ) ) {
			$push( 'Desktop', '--blockish-button-hover-transition', $attributes['buttonHoverTransition'] . 's', 'chrome' );
		}
		if ( ! empty( $attributes['buttonIconSize'] ) ) {
			$emit_responsive( $attributes['buttonIconSize'], 'width', false, 'icon' );
			$emit_responsive( $attributes['buttonIconSize'], 'height', false, 'icon' );
		}

		// Image media / caption / transition.
		if ( ! empty( $attributes['imageWidth'] ) ) {
			$emit_responsive( $attributes['imageWidth'], 'width', false, 'media' );
		}
		if ( ! empty( $attributes['imageMaxWidth'] ) ) {
			$emit_responsive( $attributes['imageMaxWidth'], 'max-width', false, 'media' );
		}
		if ( ! empty( $attributes['imageHeight'] ) ) {
			$emit_responsive( $attributes['imageHeight'], 'height', false, 'media' );
		}
		if ( ! empty( $attributes['objectFit'] ) ) {
			$emit_responsive( $attributes['objectFit'], 'object-fit', true, 'media' );
		}
		if ( isset( $attributes['imageOpacityNormal'] ) && is_numeric( $attributes['imageOpacityNormal'] ) ) {
			$push( 'Desktop', 'opacity', $attributes['imageOpacityNormal'] . '%', 'media' );
		}
		if ( isset( $attributes['imageOpacityHover'] ) && is_numeric( $attributes['imageOpacityHover'] ) ) {
			$push( 'Desktop', '__hover_opacity', $attributes['imageOpacityHover'] . '%', 'media' );
		}
		if ( ! empty( $attributes['imageCSSFiltersNormal'] ) ) {
			$push( 'Desktop', 'filter', Codecs::css_filters_css( $attributes['imageCSSFiltersNormal'] ), 'media' );
		}
		if ( ! empty( $attributes['imageCSSFiltersHover'] ) ) {
			$push( 'Desktop', '__hover_filter', Codecs::css_filters_css( $attributes['imageCSSFiltersHover'] ), 'media' );
		}
		if ( isset( $attributes['imageHoverTransition'] ) && is_numeric( $attributes['imageHoverTransition'] ) ) {
			$push( 'Desktop', '--blockish-image-hover-transition', $attributes['imageHoverTransition'] . 's', 'wrapper' );
		}
		if ( ! empty( $attributes['captionAlignment'] ) ) {
			$emit_responsive( $attributes['captionAlignment'], 'text-align', false, 'caption' );
		}
		if ( ! empty( $attributes['captionColor'] ) && is_scalar( $attributes['captionColor'] ) ) {
			$push( 'Desktop', 'color', (string) $attributes['captionColor'], 'caption' );
		}
		if ( ! empty( $attributes['captionBackgroundColor'] ) && is_scalar( $attributes['captionBackgroundColor'] ) ) {
			$push( 'Desktop', 'background-color', (string) $attributes['captionBackgroundColor'], 'caption' );
		}
		if ( ! empty( $attributes['captionSpacing'] ) ) {
			$emit_responsive( $attributes['captionSpacing'], 'margin-block-start', false, 'caption' );
		}
		if ( ! empty( $attributes['captionTypography'] ) ) {
			foreach ( Codecs::typography_declarations( $attributes['captionTypography'] ) as $device => $decls ) {
				foreach ( $decls as $property => $css_value ) {
					$push( $device, $property, $css_value, 'caption' );
				}
			}
		}
		if ( ! empty( $attributes['captionTextShadow'] ) ) {
			$push( 'Desktop', 'text-shadow', Codecs::text_shadow_css( $attributes['captionTextShadow'] ), 'caption' );
		}

		// Icon svg styles.
		if ( ! empty( $attributes['size'] ) ) {
			$emit_responsive( $attributes['size'], 'width', false, 'svg' );
			$emit_responsive( $attributes['size'], 'height', false, 'svg' );
		}
		if ( IconMap::BLOCK_NAME === $block_name || ! empty( $attributes['size'] ) || ! empty( $attributes['rotation'] ) ) {
			if ( ! empty( $attributes['color'] ) && is_scalar( $attributes['color'] ) ) {
				$push( 'Desktop', 'fill', (string) $attributes['color'], 'svg' );
			}
			if ( ! empty( $attributes['hoverColor'] ) && is_scalar( $attributes['hoverColor'] ) ) {
				$push( 'Desktop', '__hover_fill', (string) $attributes['hoverColor'], 'svg' );
			}
		}
		if ( ! empty( $attributes['rotation'] ) && is_array( $attributes['rotation'] ) ) {
			foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
				if ( ! isset( $attributes['rotation'][ $device ] ) || '' === (string) $attributes['rotation'][ $device ] ) {
					continue;
				}
				$push( $device, 'transform', 'rotate(' . $attributes['rotation'][ $device ] . 'deg)', 'svg' );
			}
		}
		if ( ! empty( $attributes['rotationHover'] ) && is_array( $attributes['rotationHover'] ) ) {
			foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
				if ( ! isset( $attributes['rotationHover'][ $device ] ) || '' === (string) $attributes['rotationHover'][ $device ] ) {
					continue;
				}
				$push( $device, '__hover_transform', 'rotate(' . $attributes['rotationHover'][ $device ] . 'deg)', 'svg' );
			}
		}

		// hideOn → display:none inside the matching media query.
		if ( ! empty( $attributes['hideOn'] ) && is_array( $attributes['hideOn'] ) ) {
			foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
				if ( empty( $attributes['hideOn'][ $device ] ) ) {
					continue;
				}
				$push( $device, 'display', 'none' );
			}
		}

		$chrome_selector  = $selector . ' .blockish-button-link';
		$icon_selector    = $selector . ' .blockish-button-link .blockish-button-icon';
		$media_selector   = $selector . ' .blockish-image';
		$caption_selector = $selector . ' .blockish-image-caption';
		$svg_selector     = $selector . ' svg';

		$css  = '';
		$css .= self::emit_selector_rules( $selector, $desktop );
		$css .= self::emit_selector_rules( $chrome_selector, $chrome_desktop );
		$css .= self::emit_selector_rules( $icon_selector, $icon_desktop );
		$css .= self::emit_selector_rules( $media_selector, $media_desktop );
		$css .= self::emit_selector_rules( $caption_selector, $caption_desktop );
		$css .= self::emit_selector_rules( $svg_selector, $svg_desktop );

		$has_tablet = ! empty( $tablet ) || ! empty( $chrome_tablet ) || ! empty( $icon_tablet )
			|| ! empty( $media_tablet ) || ! empty( $caption_tablet ) || ! empty( $svg_tablet );
		$has_mobile = ! empty( $mobile ) || ! empty( $chrome_mobile ) || ! empty( $icon_mobile )
			|| ! empty( $media_mobile ) || ! empty( $caption_mobile ) || ! empty( $svg_mobile );

		if ( $has_tablet ) {
			$css .= '@media (max-width: 1024px) {';
			$css .= self::emit_selector_rules( $selector, $tablet );
			$css .= self::emit_selector_rules( $chrome_selector, $chrome_tablet );
			$css .= self::emit_selector_rules( $icon_selector, $icon_tablet );
			$css .= self::emit_selector_rules( $media_selector, $media_tablet );
			$css .= self::emit_selector_rules( $caption_selector, $caption_tablet );
			$css .= self::emit_selector_rules( $svg_selector, $svg_tablet );
			$css .= '}';
		}
		if ( $has_mobile ) {
			$css .= '@media (max-width: 768px) {';
			$css .= self::emit_selector_rules( $selector, $mobile );
			$css .= self::emit_selector_rules( $chrome_selector, $chrome_mobile );
			$css .= self::emit_selector_rules( $icon_selector, $icon_mobile );
			$css .= self::emit_selector_rules( $media_selector, $media_mobile );
			$css .= self::emit_selector_rules( $caption_selector, $caption_mobile );
			$css .= self::emit_selector_rules( $svg_selector, $svg_mobile );
			$css .= '}';
		}

		if ( ! empty( $attributes['customCss'] ) && is_string( $attributes['customCss'] ) ) {
			$css .= $attributes['customCss'];
		}

		return array(
			'css'        => $css,
			'block_name' => $block_name,
		);
	}

	/**
	 * @return array<string, array>|null
	 */
	private static function resolve_map( string $block_name ): ?array {
		if ( GlobalMap::BLOCK_NAME === $block_name || 'global' === $block_name ) {
			return GlobalMap::properties();
		}

		if ( ContainerMap::BLOCK_NAME === $block_name ) {
			// Container-specific keys override shared Advanced globals.
			return array_merge( GlobalMap::properties(), ContainerMap::properties() );
		}

		if ( in_array( $block_name, array( 'blockish/heading', 'blockish/paragraph' ), true ) ) {
			return array_merge( GlobalMap::properties(), TextMap::properties() );
		}

		if ( ButtonMap::BLOCK_NAME === $block_name ) {
			return array_merge( GlobalMap::properties(), ButtonMap::properties() );
		}

		if ( ImageMap::BLOCK_NAME === $block_name ) {
			return array_merge( GlobalMap::properties(), ImageMap::properties() );
		}

		if ( IconMap::BLOCK_NAME === $block_name ) {
			return array_merge( GlobalMap::properties(), IconMap::properties() );
		}

		return null;
	}

	/**
	 * Pick the attribute key for a declaration. Specials that encode hover via
	 * $is_hover keep their __attr; transform_* append Hover; others need hover_attr.
	 */
	private static function resolve_attr( array $meta, bool $is_hover ): ?string {
		$attr = $meta['attr'] ?? null;
		if ( ! $attr ) {
			return null;
		}

		if ( ! $is_hover ) {
			return $attr;
		}

		if ( array_key_exists( 'hover_attr', $meta ) ) {
			return $meta['hover_attr']; // may be null = intentionally unmapped on hover
		}

		$type = $meta['type'] ?? '';
		if ( 'special' === $type && str_starts_with( $attr, '__' ) ) {
			return $attr;
		}

		if ( in_array( $type, array( 'transform_length', 'transform_angle', 'transform_number' ), true ) ) {
			return $attr . 'Hover';
		}

		return null;
	}

	/**
	 * @param array<string, string> $overflow Declarations the attribute shape cannot hold; caller keeps them in customCss.
	 */
	private static function apply_property( array &$attributes, string $attr, array $meta, string $property, string $value, string $device, bool $is_hover, array &$overflow = array() ): bool {
		switch ( $meta['type'] ) {
			case 'scalar':
				if ( 'Desktop' !== $device && 'display' === $attr ) {
					return false;
				}
				$attributes[ $attr ] = $value;
				return true;

			case 'option':
				$option = Codecs::option( $property, $value );
				if ( ! $option ) {
					return false;
				}
				$attributes[ $attr ] = $option;
				return true;

			case 'responsive':
				Codecs::set_responsive( $attributes, $attr, $device, $value );
				return true;

			case 'responsive_option':
				$option = Codecs::option( $property, $value );
				if ( ! $option ) {
					return false;
				}
				Codecs::set_responsive( $attributes, $attr, $device, $option );
				return true;

			case 'spacing':
				$spacing = Codecs::spacing( $value );
				if ( ! $spacing ) {
					return false;
				}
				Codecs::set_responsive( $attributes, $attr, $device, $spacing );
				return true;

			case 'spacing_side':
				$side = $meta['side'] ?? '';
				if ( '' === $side ) {
					return false;
				}
				Codecs::set_spacing_side( $attributes, $attr, $device, $side, trim( $value ) );
				return true;

			case 'radius':
				$radius = Codecs::radius( $value );
				if ( ! $radius ) {
					return false;
				}
				Codecs::set_responsive( $attributes, $attr, $device, $radius );
				return true;

			case 'radius_side':
				$corner = $meta['corner'] ?? '';
				if ( '' === $corner ) {
					return false;
				}
				Codecs::set_radius_side( $attributes, $attr, $device, $corner, trim( $value ) );
				return true;

			case 'transition_seconds':
				$seconds = Codecs::transition_seconds( $value );
				if ( null === $seconds ) {
					return false;
				}
				$attributes[ $attr ] = $seconds;
				return true;

			case 'border':
				$border = Codecs::merge_border( $attributes[ $attr ] ?? null, $device, $value, $meta['side'] ?? null );
				if ( ! $border ) {
					return false;
				}
				$attributes[ $attr ] = $border['value'];
				$overflow            = $border['overflow'];
				return true;

			case 'border_part':
				$part = $meta['part'] ?? '';
				if ( '' === $part ) {
					return false;
				}
				// Button hover is color-only (scalar), not a full Border JSON.
				if ( 'buttonHoverBorderColor' === $attr ) {
					if ( 'Desktop' !== $device ) {
						return false;
					}
					$attributes[ $attr ] = trim( $value );
					return true;
				}
				$border = Codecs::merge_border_part( $attributes[ $attr ] ?? null, $device, $part, $value, $meta['side'] ?? null );
				if ( ! $border ) {
					return false;
				}
				$attributes[ $attr ] = $border['value'];
				$overflow            = $border['overflow'];
				return true;

			case 'box_shadow':
				$shadow = Codecs::box_shadow( $value );
				if ( ! $shadow ) {
					return false;
				}
				$attributes[ $attr ] = $shadow;
				return true;

			case 'text_shadow':
				$shadow = Codecs::text_shadow( $value );
				if ( ! $shadow ) {
					return false;
				}
				$attributes[ $attr ] = $shadow;
				return true;

			case 'desktop_scalar':
				if ( 'Desktop' !== $device ) {
					return false;
				}
				$attributes[ $attr ] = trim( $value );
				return true;

			case 'enum_responsive':
				$allowed = $meta['enum'] ?? array();
				$normalized = strtolower( trim( $value ) );
				if ( ! in_array( $normalized, $allowed, true ) ) {
					return false;
				}
				Codecs::set_responsive( $attributes, $attr, $device, $normalized );
				return true;

			case 'typography_field':
				$field = $meta['field'] ?? '';
				$shape = $meta['shape'] ?? 'responsive';
				if ( '' === $field ) {
					return false;
				}
				$normalized = Codecs::normalize_typography_value( $field, $value, $shape );
				if ( null === $normalized ) {
					return false;
				}
				if ( in_array( $shape, array( 'scalar', 'option' ), true ) && 'Desktop' !== $device ) {
					return false;
				}
				$merged = Codecs::merge_typography_field( $attributes[ $attr ] ?? null, $field, $shape, $device, $normalized );
				if ( null === $merged ) {
					return false;
				}
				$attributes[ $attr ] = $merged;
				return true;

			case 'button_placement':
				$placement = Codecs::button_placement_value( $value );
				if ( null === $placement ) {
					return false;
				}
				Codecs::set_responsive( $attributes, $attr, $device, $placement );
				return true;

			case 'button_alignment':
				$alignment = Codecs::button_alignment_value( $value );
				if ( null === $alignment ) {
					return false;
				}
				Codecs::set_responsive( $attributes, $attr, $device, $alignment );
				return true;

			case 'icon_position':
				$pos = Codecs::icon_position( $value );
				if ( null === $pos ) {
					return false;
				}
				$attributes[ $attr ] = $pos;
				return true;

			case 'opacity_percent':
				$percent = Codecs::opacity_percent( $value );
				if ( null === $percent ) {
					return false;
				}
				if ( 'Desktop' !== $device ) {
					return false;
				}
				$attributes[ $attr ] = $percent;
				return true;

			case 'css_filters':
				$filters = Codecs::css_filters( $value );
				if ( ! $filters ) {
					return false;
				}
				if ( 'Desktop' !== $device ) {
					return false;
				}
				$attributes[ $attr ] = $filters;
				return true;

			case 'transform_length':
			case 'transform_angle':
			case 'transform_number':
				$clean = self::strip_transform_unit( $value, $meta['type'] );
				Codecs::set_responsive( $attributes, $attr, $device, $clean );
				self::enable_transform( $attributes, $is_hover );
				return true;

			case 'special':
				return self::apply_special( $attributes, $attr, $value, $device, $is_hover );
		}

		return false;
	}

	private static function apply_special( array &$attributes, string $attr, string $value, string $device, bool $is_hover ): bool {
		if ( '__button_width' === $attr ) {
			$trimmed = strtolower( trim( $value ) );
			if ( 'auto' === $trimmed ) {
				$option = Codecs::option( 'width', 'auto' );
				if ( $option ) {
					Codecs::set_responsive( $attributes, 'widthType', $device, $option );
				}
				return true;
			}
			Codecs::set_responsive( $attributes, 'buttonWidth', $device, trim( $value ) );
			return true;
		}

		if ( '__button_transition' === $attr ) {
			$seconds = Codecs::transition_seconds( $value );
			if ( null === $seconds ) {
				return false;
			}
			$attributes['buttonHoverTransition'] = $seconds;
			return true;
		}

		if ( '__image_transition' === $attr ) {
			$seconds = Codecs::transition_seconds( $value );
			if ( null === $seconds ) {
				return false;
			}
			$attributes['imageHoverTransition'] = $seconds;
			return true;
		}

		if ( '__icon_rotation' === $attr ) {
			$degrees = Codecs::rotation_degrees( $value );
			if ( null === $degrees ) {
				return false;
			}
			$key = $is_hover ? 'rotationHover' : 'rotation';
			Codecs::set_responsive( $attributes, $key, $device, $degrees );
			return true;
		}

		if ( '__display' === $attr || '__container_display' === $attr ) {
			return self::apply_display( $attributes, $attr, $value, $device );
		}

		if ( '__height' === $attr ) {
			Codecs::set_responsive( $attributes, 'containerMinHeight', $device, trim( $value ) );
			return true;
		}

		if ( '__transition' === $attr ) {
			$mapped = Codecs::transition_attrs( $value );
			if ( empty( $mapped ) ) {
				return false;
			}
			foreach ( $mapped as $key => $seconds ) {
				$attributes[ $key ] = $seconds;
			}
			return true;
		}

		if ( '__grid_template_columns' === $attr ) {
			return self::apply_grid_template_columns( $attributes, $value, $device );
		}

		if ( '__grid_template_rows' === $attr ) {
			return self::apply_grid_template_rows( $attributes, $value, $device );
		}

		if ( '__grid_auto_rows' === $attr ) {
			return self::apply_grid_auto_rows( $attributes, $value, $device );
		}

		if ( '__gap' === $attr ) {
			Codecs::set_responsive( $attributes, 'rowGap', $device, $value );
			Codecs::set_responsive( $attributes, 'columnGap', $device, $value );
			return true;
		}

		if ( '__max_width' === $attr ) {
			$attributes['containerWidth'] = 'align-custom-width';
			Codecs::set_responsive( $attributes, 'customWidthContainer', $device, $value );
			return true;
		}

		if ( '__width' === $attr ) {
			$trimmed = strtolower( trim( $value ) );
			$option  = Codecs::option( 'width', $trimmed );
			if ( $option && 'custom' !== $trimmed ) {
				Codecs::set_responsive( $attributes, 'widthType', $device, $option );
				return true;
			}
			Codecs::set_responsive( $attributes, 'widthType', $device, array( 'label' => 'Custom', 'value' => 'custom' ) );
			Codecs::set_responsive( $attributes, 'customWidth', $device, trim( $value ) );
			return true;
		}

		if ( '__order' === $attr ) {
			$trimmed = trim( $value );
			if ( ! is_numeric( $trimmed ) ) {
				Codecs::set_responsive( $attributes, 'flexOrder', $device, 'custom' );
				Codecs::set_responsive( $attributes, 'flexCustomOrder', $device, $trimmed );
				return true;
			}
			Codecs::set_responsive( $attributes, 'flexOrder', $device, $trimmed );
			return true;
		}

		if ( '__grid_column' === $attr || '__grid_row' === $attr ) {
			$parts = preg_split( '/\s*\/\s*/', trim( $value ) );
			$start = $parts[0] ?? '';
			$end   = $parts[1] ?? '';
			$prefix = '__grid_column' === $attr ? 'gridColumn' : 'gridRow';
			if ( '' !== $start ) {
				Codecs::set_responsive( $attributes, $prefix . 'Start', $device, $start );
			}
			if ( '' !== $end ) {
				Codecs::set_responsive( $attributes, $prefix . 'End', $device, $end );
			}
			return '' !== $start || '' !== $end;
		}

		if ( '__transform' === $attr ) {
			return self::parse_transform_shorthand( $attributes, $value, $device, $is_hover );
		}

		if ( '__translate' === $attr ) {
			$parts = preg_split( '/\s+/', trim( $value ) );
			if ( empty( $parts[0] ) ) {
				return false;
			}
			$x_attr = $is_hover ? 'translateXHover' : 'translateX';
			$y_attr = $is_hover ? 'translateYHover' : 'translateY';
			Codecs::set_responsive( $attributes, $x_attr, $device, self::strip_transform_unit( $parts[0], 'transform_length' ) );
			if ( ! empty( $parts[1] ) ) {
				Codecs::set_responsive( $attributes, $y_attr, $device, self::strip_transform_unit( $parts[1], 'transform_length' ) );
			}
			self::enable_transform( $attributes, $is_hover );
			return true;
		}

		if ( '__scale' === $attr ) {
			$parts = preg_split( '/\s+/', trim( $value ) );
			if ( empty( $parts[0] ) ) {
				return false;
			}
			if ( count( $parts ) >= 2 ) {
				$attributes[ $is_hover ? 'scaleSeparateHover' : 'scaleSeparate' ] = true;
				Codecs::set_responsive( $attributes, $is_hover ? 'scaleXHover' : 'scaleX', $device, self::strip_transform_unit( $parts[0], 'transform_number' ) );
				Codecs::set_responsive( $attributes, $is_hover ? 'scaleYHover' : 'scaleY', $device, self::strip_transform_unit( $parts[1], 'transform_number' ) );
			} else {
				Codecs::set_responsive( $attributes, $is_hover ? 'scaleHover' : 'scale', $device, self::strip_transform_unit( $parts[0], 'transform_number' ) );
			}
			self::enable_transform( $attributes, $is_hover );
			return true;
		}

		if ( '__rotate' === $attr ) {
			Codecs::set_responsive(
				$attributes,
				$is_hover ? 'rotateZHover' : 'rotateZ',
				$device,
				self::strip_transform_unit( $value, 'transform_angle' )
			);
			self::enable_transform( $attributes, $is_hover );
			return true;
		}

		if ( '__transform_origin' === $attr ) {
			$normalized = strtolower( preg_replace( '/\s+/', ' ', trim( $value ) ) );
			$presets    = array(
				'top left', 'top center', 'top right',
				'center left', 'center center', 'center', 'center right',
				'bottom left', 'bottom center', 'bottom right',
			);
			if ( 'center' === $normalized ) {
				$normalized = 'center center';
			}
			if ( in_array( $normalized, $presets, true ) ) {
				$attributes['transformOrigin'] = $normalized;
				self::enable_transform( $attributes, false );
				return true;
			}
			$parts = preg_split( '/\s+/', trim( $value ) );
			if ( count( $parts ) >= 2 ) {
				$attributes['transformOrigin'] = 'custom';
				Codecs::set_responsive( $attributes, 'transformOriginX', $device, $parts[0] );
				Codecs::set_responsive( $attributes, 'transformOriginY', $device, $parts[1] );
				self::enable_transform( $attributes, false );
				return true;
			}
			return false;
		}

		if ( '__skew' === $attr ) {
			$parts = preg_split( '/\s+/', trim( $value ) );
			if ( empty( $parts[0] ) ) {
				return false;
			}
			Codecs::set_responsive( $attributes, $is_hover ? 'skewXHover' : 'skewX', $device, self::strip_transform_unit( $parts[0], 'transform_angle' ) );
			if ( ! empty( $parts[1] ) ) {
				Codecs::set_responsive( $attributes, $is_hover ? 'skewYHover' : 'skewY', $device, self::strip_transform_unit( $parts[1], 'transform_angle' ) );
			}
			self::enable_transform( $attributes, $is_hover );
			return true;
		}

		return false;
	}

	/**
	 * Global: only `display:none` → hideOn.
	 * Container: Desktop flex/grid/… → display attr; any-device none → hideOn;
	 * non-Desktop non-none → fail (customCss) because display is scalar.
	 */
	private static function apply_display( array &$attributes, string $attr, string $value, string $device ): bool {
		$trimmed = strtolower( trim( $value ) );

		if ( 'none' === $trimmed ) {
			if ( ! isset( $attributes['hideOn'] ) || ! is_array( $attributes['hideOn'] ) ) {
				$attributes['hideOn'] = array(
					'Desktop' => false,
					'Tablet'  => false,
					'Mobile'  => false,
				);
			}
			$attributes['hideOn'][ $device ] = true;
			return true;
		}

		if ( '__display' === $attr ) {
			// No wrapper display attribute on global Advanced.
			return false;
		}

		// Container display is a scalar string.
		if ( 'Desktop' !== $device ) {
			return false;
		}

		$allowed = array( 'flex', 'grid', 'block', 'inline-flex', 'inline-block', 'inline', 'contents', 'flow-root' );
		if ( ! in_array( $trimmed, $allowed, true ) ) {
			return false;
		}

		$attributes['display'] = $trimmed;
		return true;
	}

	private static function apply_grid_template_columns( array &$attributes, string $value, string $device ): bool {
		$value = trim( $value );

		// fixed: repeat(3, minmax(0, 1fr)) or repeat(3, 1fr)
		if ( preg_match( '/^repeat\(\s*(\d+)\s*,/i', $value, $match ) ) {
			if ( ! self::claim_grid_layout_type( $attributes, 'fixed', $device ) ) {
				return false;
			}
			$attributes['display'] = 'grid';
			Codecs::set_responsive( $attributes, 'gridColumns', $device, (int) $match[1] );
			return true;
		}

		// auto: repeat(auto-fill|auto-fit, minmax(280px, 1fr)) — optionally nested min()
		if ( preg_match( '/^repeat\(\s*auto-(?:fill|fit)\s*,\s*minmax\(\s*(?:min\(\s*)?([^,\s)]+)/i', $value, $match ) ) {
			if ( ! self::claim_grid_layout_type( $attributes, 'auto', $device ) ) {
				return false;
			}
			$attributes['display'] = 'grid';
			Codecs::set_responsive( $attributes, 'autoGridWidth', $device, trim( $match[1] ) );
			return true;
		}

		return false;
	}

	private static function apply_grid_template_rows( array &$attributes, string $value, string $device ): bool {
		$value = trim( $value );
		if ( preg_match( '/^repeat\(\s*(\d+)\s*,/i', $value, $match ) ) {
			if ( ! self::claim_grid_layout_type( $attributes, 'fixed', $device ) ) {
				return false;
			}
			$attributes['display'] = 'grid';
			Codecs::set_responsive( $attributes, 'gridRows', $device, (int) $match[1] );
			return true;
		}
		return false;
	}

	private static function apply_grid_auto_rows( array &$attributes, string $value, string $device ): bool {
		$value = trim( $value );
		// minmax(12rem, auto) or bare length
		if ( preg_match( '/^minmax\(\s*([^,]+)\s*,/i', $value, $match ) ) {
			if ( ! self::claim_grid_layout_type( $attributes, 'auto', $device ) ) {
				return false;
			}
			$attributes['display'] = 'grid';
			Codecs::set_responsive( $attributes, 'autoGridHeight', $device, trim( $match[1] ) );
			return true;
		}
		if ( preg_match( '/^[\d.]+(px|rem|em|%)?$/i', $value ) ) {
			if ( ! self::claim_grid_layout_type( $attributes, 'auto', $device ) ) {
				return false;
			}
			$attributes['display'] = 'grid';
			Codecs::set_responsive( $attributes, 'autoGridHeight', $device, $value );
			return true;
		}
		return false;
	}

	/**
	 * gridLayoutType is a scalar. Desktop (or first claim) wins; a later breakpoint
	 * that needs the other model is left for customCss instead of silently flipping type.
	 */
	private static function claim_grid_layout_type( array &$attributes, string $type, string $device ): bool {
		$existing = $attributes['gridLayoutType'] ?? null;
		if ( null === $existing || '' === $existing ) {
			$attributes['gridLayoutType'] = $type;
			return true;
		}
		if ( $existing === $type ) {
			return true;
		}
		if ( 'Desktop' === $device ) {
			$attributes['gridLayoutType'] = $type;
			return true;
		}
		return false;
	}

	private static function parse_transform_shorthand( array &$attributes, string $value, string $device, bool $is_hover ): bool {
		if ( ! preg_match_all( '/([a-zA-Z0-9]+)\s*\(([^)]*)\)/', $value, $matches, PREG_SET_ORDER ) ) {
			return false;
		}

		$any = false;
		foreach ( $matches as $match ) {
			$fn    = strtolower( $match[1] );
			$args  = preg_split( '/\s*,\s*|\s+/', trim( $match[2] ) );
			$args  = array_values( array_filter( $args, static fn( $a ) => '' !== $a ) );

			switch ( $fn ) {
				case 'translate':
				case 'translate3d':
					if ( ! empty( $args[0] ) ) {
						Codecs::set_responsive( $attributes, $is_hover ? 'translateXHover' : 'translateX', $device, self::strip_transform_unit( $args[0], 'transform_length' ) );
						$any = true;
					}
					if ( ! empty( $args[1] ) ) {
						Codecs::set_responsive( $attributes, $is_hover ? 'translateYHover' : 'translateY', $device, self::strip_transform_unit( $args[1], 'transform_length' ) );
						$any = true;
					}
					if ( ! empty( $args[2] ) ) {
						$attributes[ $is_hover ? 'translate3DHover' : 'translate3D' ] = true;
						Codecs::set_responsive( $attributes, $is_hover ? 'translateZHover' : 'translateZ', $device, self::strip_transform_unit( $args[2], 'transform_length' ) );
						$any = true;
					}
					break;

				case 'translatex':
					Codecs::set_responsive( $attributes, $is_hover ? 'translateXHover' : 'translateX', $device, self::strip_transform_unit( $args[0] ?? '', 'transform_length' ) );
					$any = true;
					break;

				case 'translatey':
					Codecs::set_responsive( $attributes, $is_hover ? 'translateYHover' : 'translateY', $device, self::strip_transform_unit( $args[0] ?? '', 'transform_length' ) );
					$any = true;
					break;

				case 'translatez':
					$attributes[ $is_hover ? 'translate3DHover' : 'translate3D' ] = true;
					Codecs::set_responsive( $attributes, $is_hover ? 'translateZHover' : 'translateZ', $device, self::strip_transform_unit( $args[0] ?? '', 'transform_length' ) );
					$any = true;
					break;

				case 'scale':
					if ( count( $args ) >= 2 ) {
						$attributes[ $is_hover ? 'scaleSeparateHover' : 'scaleSeparate' ] = true;
						Codecs::set_responsive( $attributes, $is_hover ? 'scaleXHover' : 'scaleX', $device, self::strip_transform_unit( $args[0], 'transform_number' ) );
						Codecs::set_responsive( $attributes, $is_hover ? 'scaleYHover' : 'scaleY', $device, self::strip_transform_unit( $args[1], 'transform_number' ) );
					} else {
						Codecs::set_responsive( $attributes, $is_hover ? 'scaleHover' : 'scale', $device, self::strip_transform_unit( $args[0] ?? '1', 'transform_number' ) );
					}
					$any = true;
					break;

				case 'scalex':
					$attributes[ $is_hover ? 'scaleSeparateHover' : 'scaleSeparate' ] = true;
					Codecs::set_responsive( $attributes, $is_hover ? 'scaleXHover' : 'scaleX', $device, self::strip_transform_unit( $args[0] ?? '1', 'transform_number' ) );
					$any = true;
					break;

				case 'scaley':
					$attributes[ $is_hover ? 'scaleSeparateHover' : 'scaleSeparate' ] = true;
					Codecs::set_responsive( $attributes, $is_hover ? 'scaleYHover' : 'scaleY', $device, self::strip_transform_unit( $args[0] ?? '1', 'transform_number' ) );
					$any = true;
					break;

				case 'rotate':
				case 'rotatez':
					Codecs::set_responsive( $attributes, $is_hover ? 'rotateZHover' : 'rotateZ', $device, self::strip_transform_unit( $args[0] ?? '0', 'transform_angle' ) );
					$any = true;
					break;

				case 'rotatex':
					$attributes[ $is_hover ? 'rotate3DHover' : 'rotate3D' ] = true;
					Codecs::set_responsive( $attributes, $is_hover ? 'rotateXHover' : 'rotateX', $device, self::strip_transform_unit( $args[0] ?? '0', 'transform_angle' ) );
					$any = true;
					break;

				case 'rotatey':
					$attributes[ $is_hover ? 'rotate3DHover' : 'rotate3D' ] = true;
					Codecs::set_responsive( $attributes, $is_hover ? 'rotateYHover' : 'rotateY', $device, self::strip_transform_unit( $args[0] ?? '0', 'transform_angle' ) );
					$any = true;
					break;

				case 'skew':
					if ( ! empty( $args[0] ) ) {
						Codecs::set_responsive( $attributes, $is_hover ? 'skewXHover' : 'skewX', $device, self::strip_transform_unit( $args[0], 'transform_angle' ) );
						$any = true;
					}
					if ( ! empty( $args[1] ) ) {
						Codecs::set_responsive( $attributes, $is_hover ? 'skewYHover' : 'skewY', $device, self::strip_transform_unit( $args[1], 'transform_angle' ) );
						$any = true;
					}
					break;

				case 'skewx':
					Codecs::set_responsive( $attributes, $is_hover ? 'skewXHover' : 'skewX', $device, self::strip_transform_unit( $args[0] ?? '0', 'transform_angle' ) );
					$any = true;
					break;

				case 'skewy':
					Codecs::set_responsive( $attributes, $is_hover ? 'skewYHover' : 'skewY', $device, self::strip_transform_unit( $args[0] ?? '0', 'transform_angle' ) );
					$any = true;
					break;

				case 'perspective':
					Codecs::set_responsive( $attributes, $is_hover ? 'perspectiveHover' : 'perspective', $device, self::strip_transform_unit( $args[0] ?? '', 'transform_length' ) );
					$any = true;
					break;
			}
		}

		if ( $any ) {
			self::enable_transform( $attributes, $is_hover );
		}

		return $any;
	}

	private static function enable_transform( array &$attributes, bool $is_hover ): void {
		if ( $is_hover ) {
			$attributes['applyTransformHover'] = true;
		} else {
			$attributes['applyTransform'] = true;
		}
	}

	/**
	 * Strip units Blockish adds automatically (deg for angles; leave lengths as-is with unit).
	 * Docs: "Pass raw numbers — units are added automatically" for transform angles/scales.
	 * Lengths (translate, perspective) keep their unit in the Responsive value.
	 */
	private static function strip_transform_unit( string $value, string $type ): string {
		$value = trim( $value );
		if ( 'transform_angle' === $type ) {
			return (string) preg_replace( '/deg$/i', '', $value );
		}
		if ( 'transform_number' === $type ) {
			return $value;
		}
		return $value;
	}

	private static function compose_transform_css( array $attributes, bool $hover ): string {
		$flag = $hover ? 'applyTransformHover' : 'applyTransform';
		if ( empty( $attributes[ $flag ] ) ) {
			return '';
		}

		$pick = static function ( string $key ) use ( $attributes, $hover ) {
			$attr = $hover ? $key . 'Hover' : $key;
			$val  = $attributes[ $attr ] ?? null;
			if ( is_array( $val ) ) {
				$val = $val['Desktop'] ?? reset( $val );
			}
			return ( is_string( $val ) || is_numeric( $val ) ) ? (string) $val : null;
		};

		$parts = array();

		$perspective = $pick( 'perspective' );
		if ( null !== $perspective ) {
			$parts[] = 'perspective(' . $perspective . ')';
		}

		$rx = $pick( 'rotateX' );
		$ry = $pick( 'rotateY' );
		$rz = $pick( 'rotateZ' );
		if ( null !== $rx ) {
			$parts[] = 'rotateX(' . $rx . 'deg)';
		}
		if ( null !== $ry ) {
			$parts[] = 'rotateY(' . $ry . 'deg)';
		}
		if ( null !== $rz ) {
			$parts[] = 'rotateZ(' . $rz . 'deg)';
		}

		$tx = $pick( 'translateX' );
		$ty = $pick( 'translateY' );
		$tz = $pick( 'translateZ' );
		if ( null !== $tx ) {
			$parts[] = 'translateX(' . $tx . ')';
		}
		if ( null !== $ty ) {
			$parts[] = 'translateY(' . $ty . ')';
		}
		if ( null !== $tz ) {
			$parts[] = 'translateZ(' . $tz . ')';
		}

		$separate = ! empty( $attributes[ $hover ? 'scaleSeparateHover' : 'scaleSeparate' ] );
		if ( $separate ) {
			$sx = $pick( 'scaleX' );
			$sy = $pick( 'scaleY' );
			if ( null !== $sx ) {
				$parts[] = 'scaleX(' . $sx . ')';
			}
			if ( null !== $sy ) {
				$parts[] = 'scaleY(' . $sy . ')';
			}
		} else {
			$s = $pick( 'scale' );
			if ( null !== $s ) {
				$parts[] = 'scale(' . $s . ')';
			}
		}

		$skx = $pick( 'skewX' );
		$sky = $pick( 'skewY' );
		if ( null !== $skx ) {
			$parts[] = 'skewX(' . $skx . 'deg)';
		}
		if ( null !== $sky ) {
			$parts[] = 'skewY(' . $sky . 'deg)';
		}

		return implode( ' ', $parts );
	}

	private static function guess_root_selector( array $rules ): string {
		foreach ( $rules as $rule ) {
			$selector = $rule['selector'];
			$bare     = self::strip_hover( $selector );
			if ( self::is_simple_selector( $bare ) ) {
				return $bare;
			}
		}
		return '{{SELECTOR}}';
	}

	/**
	 * @return array{kind: 'root'|'hover'|'other', surface: 'wrapper'|'chrome'|'icon'|'media'|'caption'|'svg'}
	 */
	private static function classify_rule( string $selector, string $root_selector, string $block_name ): array {
		$is_hover = (bool) preg_match( '/:hover\b/i', $selector );
		$kind     = $is_hover ? 'hover' : 'root';
		$bare     = self::strip_hover( $selector );

		if ( ButtonMap::BLOCK_NAME === $block_name ) {
			$surface = self::button_surface( $bare, $root_selector );
			if ( null === $surface ) {
				return array( 'kind' => 'other', 'surface' => 'wrapper' );
			}
			return array( 'kind' => $kind, 'surface' => $surface );
		}

		if ( ImageMap::BLOCK_NAME === $block_name ) {
			$surface = self::image_surface( $bare, $root_selector );
			if ( null === $surface ) {
				return array( 'kind' => 'other', 'surface' => 'wrapper' );
			}
			return array( 'kind' => $kind, 'surface' => $surface );
		}

		if ( IconMap::BLOCK_NAME === $block_name ) {
			$surface = self::icon_surface( $bare, $root_selector );
			if ( null === $surface ) {
				return array( 'kind' => 'other', 'surface' => 'wrapper' );
			}
			return array( 'kind' => $kind, 'surface' => $surface );
		}

		$legacy = self::classify_selector( $selector, $root_selector );
		return array(
			'kind'    => $legacy,
			'surface' => 'wrapper',
		);
	}

	/**
	 * @return 'wrapper'|'chrome'|'icon'|null
	 */
	private static function button_surface( string $bare, string $root_selector ): ?string {
		$bare = trim( $bare );
		$root = trim( $root_selector );

		if ( '' === $root || '{{SELECTOR}}' === $root || '*' === $root ) {
			if ( preg_match( '/\.blockish-button-icon\b/i', $bare ) ) {
				return 'icon';
			}
			if ( preg_match( '/\.blockish-button-link\b/i', $bare ) || preg_match( '/\ba\b/i', $bare ) ) {
				return 'chrome';
			}
			if ( self::is_simple_selector( $bare ) ) {
				return 'wrapper';
			}
			return null;
		}

		$root_norm = self::normalize_selector( $root );
		$bare_norm = self::normalize_selector( $bare );

		if ( $bare_norm === $root_norm ) {
			return 'wrapper';
		}

		$root_quoted = preg_quote( $root, '/' );
		if ( ! preg_match( '/^' . $root_quoted . '(\s+|>)/i', $bare ) ) {
			return null;
		}

		if ( preg_match( '/\.blockish-button-icon\b/i', $bare ) ) {
			return 'icon';
		}
		if ( preg_match( '/\.blockish-button-link\b/i', $bare ) || preg_match( '/^' . $root_quoted . '\s+a\b/i', $bare ) ) {
			return 'chrome';
		}

		return null;
	}

	/**
	 * @return 'wrapper'|'media'|'caption'|null
	 */
	private static function image_surface( string $bare, string $root_selector ): ?string {
		$bare = trim( $bare );
		$root = trim( $root_selector );

		if ( '' === $root || '{{SELECTOR}}' === $root || '*' === $root ) {
			if ( preg_match( '/\.blockish-image-caption\b|figcaption\b/i', $bare ) ) {
				return 'caption';
			}
			if ( preg_match( '/\.blockish-image\b|\bimg\b/i', $bare ) ) {
				return 'media';
			}
			if ( self::is_simple_selector( $bare ) ) {
				return 'wrapper';
			}
			return null;
		}

		$root_norm = self::normalize_selector( $root );
		$bare_norm = self::normalize_selector( $bare );

		if ( $bare_norm === $root_norm ) {
			return 'wrapper';
		}

		$root_quoted = preg_quote( $root, '/' );
		if ( ! preg_match( '/^' . $root_quoted . '(\s+|>)/i', $bare ) ) {
			return null;
		}

		if ( preg_match( '/\.blockish-image-caption\b|figcaption\b/i', $bare ) ) {
			return 'caption';
		}
		if ( preg_match( '/\.blockish-image\b|\bimg\b/i', $bare ) ) {
			return 'media';
		}

		return null;
	}

	/**
	 * @return 'wrapper'|'svg'|null
	 */
	private static function icon_surface( string $bare, string $root_selector ): ?string {
		$bare = trim( $bare );
		$root = trim( $root_selector );

		if ( '' === $root || '{{SELECTOR}}' === $root || '*' === $root ) {
			if ( preg_match( '/\bsvg\b/i', $bare ) ) {
				return 'svg';
			}
			if ( self::is_simple_selector( $bare ) ) {
				return 'wrapper';
			}
			return null;
		}

		$root_norm = self::normalize_selector( $root );
		$bare_norm = self::normalize_selector( $bare );

		if ( $bare_norm === $root_norm ) {
			return 'wrapper';
		}

		$root_quoted = preg_quote( $root, '/' );
		if ( ! preg_match( '/^' . $root_quoted . '(\s+|>)/i', $bare ) ) {
			return null;
		}

		if ( preg_match( '/\bsvg\b/i', $bare ) ) {
			return 'svg';
		}

		return null;
	}

	/**
	 * @param array<string, array> $map
	 * @return array|null
	 */
	private static function resolve_surface_meta( array $map, string $property, string $surface, string $block_name ): ?array {
		if ( ButtonMap::BLOCK_NAME === $block_name ) {
			if ( 'icon' === $surface ) {
				if ( ! in_array( $property, array( 'width', 'height' ), true ) ) {
					return null;
				}
				return array( 'attr' => 'buttonIconSize', 'type' => 'responsive' );
			}

			if ( 'chrome' === $surface && in_array( $property, array( 'justify-content', 'text-align' ), true ) ) {
				return array( 'attr' => 'buttonAlignment', 'type' => 'button_alignment' );
			}

			if ( 'chrome' === $surface && 'width' === $property ) {
				return array( 'attr' => 'buttonWidth', 'type' => 'responsive' );
			}

			return $map[ $property ] ?? null;
		}

		if ( ImageMap::BLOCK_NAME === $block_name ) {
			if ( 'caption' === $surface ) {
				$caption_map = ImageMap::caption_properties();
				return $caption_map[ $property ] ?? null;
			}
			return $map[ $property ] ?? null;
		}

		if ( IconMap::BLOCK_NAME === $block_name ) {
			return $map[ $property ] ?? null;
		}

		return $map[ $property ] ?? null;
	}

	/**
	 * @return 'root'|'hover'|'other'
	 */
	private static function classify_selector( string $selector, string $root_selector ): string {
		$normalized_root = self::normalize_selector( $root_selector );
		$bare            = self::strip_hover( $selector );
		$normalized      = self::normalize_selector( $bare );

		if ( '{{SELECTOR}}' === $normalized_root || '*' === $normalized_root ) {
			if ( self::is_simple_selector( $bare ) ) {
				return str_ends_with( trim( $selector ), ':hover' ) ? 'hover' : 'root';
			}
			return 'other';
		}

		if ( $normalized === $normalized_root ) {
			return str_contains( $selector, ':hover' ) ? 'hover' : 'root';
		}

		// Root plus attached state/layout classes, e.g. ".hero.blockish-container.layout-type-flex".
		if ( str_starts_with( $normalized, $normalized_root ) ) {
			$suffix = substr( $normalized, strlen( $normalized_root ) );
			if ( preg_match( '/^[.#][a-z0-9_.#-]*$/', $suffix ) ) {
				return str_contains( $selector, ':hover' ) ? 'hover' : 'root';
			}
		}

		return 'other';
	}

	private static function emit_selector_rules( string $selector, array $declarations ): string {
		if ( empty( $declarations ) ) {
			return '';
		}
		$css   = self::declarations_block( $selector, self::strip_hover_keys( $declarations ) );
		$hover = self::only_hover_keys( $declarations );
		if ( ! empty( $hover ) ) {
			$css .= self::declarations_block( $selector . ':hover', $hover );
		}
		return $css;
	}

	private static function strip_hover( string $selector ): string {
		return trim( (string) preg_replace( '/:hover\b/i', '', $selector ) );
	}

	private static function normalize_selector( string $selector ): string {
		return strtolower( (string) preg_replace( '/\s+/', '', trim( $selector ) ) );
	}

	private static function is_simple_selector( string $selector ): bool {
		$selector = trim( $selector );
		if ( '' === $selector || '{{SELECTOR}}' === $selector ) {
			return true;
		}
		return ! preg_match( '/[\s>+~]/', $selector );
	}

	private static function rule_to_css( string $selector, array $declarations, string $device ): string {
		$body = '';
		foreach ( $declarations as $property => $value ) {
			$body .= "{$property}: {$value}; ";
		}
		$rule = trim( $selector ) . ' { ' . trim( $body ) . ' }';
		if ( 'Desktop' === $device ) {
			return $rule;
		}
		$max = 'Tablet' === $device ? '1024px' : '768px';
		return "@media (max-width: {$max}) { {$rule} }";
	}

	/**
	 * @param string[] $rules
	 */
	private static function build_custom_css( array $rules, string $root_selector ): string {
		if ( empty( $rules ) ) {
			return '';
		}

		$css  = implode( ' ', $rules );
		$root = trim( $root_selector );
		if ( '' !== $root && '{{SELECTOR}}' !== $root ) {
			$quoted = preg_quote( $root, '/' );
			$css    = (string) preg_replace( '/' . $quoted . '\b/', '{{SELECTOR}}', $css );
		}

		return $css;
	}

	private static function declarations_block( string $selector, array $declarations ): string {
		if ( empty( $declarations ) ) {
			return '';
		}
		$body = '';
		foreach ( $declarations as $property => $value ) {
			$body .= "{$property}: {$value}; ";
		}
		return $selector . ' { ' . trim( $body ) . ' }';
	}

	private static function strip_hover_keys( array $declarations ): array {
		$out = array();
		foreach ( $declarations as $property => $value ) {
			if ( str_starts_with( $property, '__hover_' ) ) {
				continue;
			}
			$out[ $property ] = $value;
		}
		return $out;
	}

	private static function only_hover_keys( array $declarations ): array {
		$out = array();
		foreach ( $declarations as $property => $value ) {
			if ( ! str_starts_with( $property, '__hover_' ) ) {
				continue;
			}
			$out[ substr( $property, 8 ) ] = $value;
		}
		return $out;
	}
}
