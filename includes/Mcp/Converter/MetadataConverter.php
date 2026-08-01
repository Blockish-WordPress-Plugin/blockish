<?php

namespace Blockish\Mcp\Converter;

defined( 'ABSPATH' ) || exit;

/**
 * Metadata-driven fallback for Blockish blocks that do not need a handwritten
 * special map. Each block's own block.json remains the per-block source of truth.
 */
class MetadataConverter {

	private const DEVICES = array( 'Desktop', 'Tablet', 'Mobile' );

	/** @var array<string, string|null> */
	private static $dir_cache = array();

	/** @var array<string, array<string, array{type: string, options: array<string, string>}>> */
	private static $controls_cache = array();

	private static function block_dir( string $block_name ): ?string {
		if ( array_key_exists( $block_name, self::$dir_cache ) ) {
			return self::$dir_cache[ $block_name ];
		}

		self::$dir_cache[ $block_name ] = null;
		$roots                          = array();
		$slug                           = null;

		if ( str_starts_with( $block_name, 'blockish-dynamicity/' ) ) {
			$slug  = substr( $block_name, strlen( 'blockish-dynamicity/' ) );
			$roots = array( dirname( __DIR__, 4 ) . '/blockish-dynamicity/src/blocks/' );
		} elseif ( str_starts_with( $block_name, 'blockish-forms/' ) ) {
			$slug  = substr( $block_name, strlen( 'blockish-forms/' ) );
			$roots = array( dirname( __DIR__, 4 ) . '/blockish-forms/src/blocks/' );
		} elseif ( str_starts_with( $block_name, 'blockish/' ) ) {
			$slug  = substr( $block_name, strlen( 'blockish/' ) );
			$roots = array(
				dirname( __DIR__, 3 ) . '/src/blocks/',
				dirname( __DIR__, 4 ) . '/blockish-dynamicity/src/blocks/',
				dirname( __DIR__, 4 ) . '/blockish-forms/src/blocks/',
			);
		} else {
			return null;
		}

		if ( ! preg_match( '/^[a-z0-9-]+$/', $slug ) ) {
			return null;
		}

		foreach ( $roots as $root ) {
			$path = $root . $slug . '/block.json';
			if ( ! is_readable( $path ) ) {
				continue;
			}
			$decoded = json_decode( (string) file_get_contents( $path ), true );
			if ( is_array( $decoded ) && ( $decoded['name'] ?? '' ) === $block_name ) {
				self::$dir_cache[ $block_name ] = $root . $slug;
				break;
			}
		}

		return self::$dir_cache[ $block_name ];
	}

	/**
	 * @return array<string, mixed>|null
	 */
	private static function metadata( string $block_name ): ?array {
		$dir = self::block_dir( $block_name );
		if ( null === $dir ) {
			return null;
		}

		$decoded = json_decode( (string) file_get_contents( $dir . '/block.json' ), true );
		return is_array( $decoded ) ? $decoded : null;
	}

	/**
	 * Inspector controls keyed by attribute slug.
	 *
	 * The stored shape of an attribute depends on its control, not on its CSS
	 * property: react-select (`BlockishSelect`) stores `{label, value}` while
	 * `BlockishToggleGroup` stores a bare string — and the same property (e.g.
	 * justify-content) uses different controls in different blocks.
	 *
	 * @return array<string, array{type: string, options: array<string, string>}>
	 */
	private static function controls( string $block_name ): array {
		if ( isset( self::$controls_cache[ $block_name ] ) ) {
			return self::$controls_cache[ $block_name ];
		}

		self::$controls_cache[ $block_name ] = array();

		$dir = self::block_dir( $block_name );
		if ( null === $dir ) {
			return array();
		}

		$source = '';
		foreach ( glob( $dir . '/*.js' ) ?: array() as $file ) {
			$source .= (string) file_get_contents( $file ) . "\n";
		}
		if ( '' === $source ) {
			return array();
		}

		if ( ! preg_match_all( '/<Blockish(?:Responsive)?Control\b/', $source, $matches, PREG_OFFSET_CAPTURE ) ) {
			return array();
		}

		$starts  = array_column( $matches[0], 1 );
		$total   = count( $starts );
		$found   = array();

		for ( $i = 0; $i < $total; $i++ ) {
			$end   = $starts[ $i + 1 ] ?? strlen( $source );
			$chunk = substr( $source, $starts[ $i ], $end - $starts[ $i ] );

			if ( ! preg_match( '/\bslug=[{"\']+([A-Za-z0-9_]+)/', $chunk, $slug_match ) ) {
				continue;
			}
			if ( ! preg_match( '/\btype=[{"\']+([A-Za-z]+)/', $chunk, $type_match ) ) {
				continue;
			}

			$found[ $slug_match[1] ] = array(
				'type'    => $type_match[1],
				'options' => self::parse_control_options( $chunk ),
			);
		}

		self::$controls_cache[ $block_name ] = $found;
		return $found;
	}

	/**
	 * value => label pairs from an inspector `options={[ … ]}` array.
	 *
	 * @return array<string, string>
	 */
	private static function parse_control_options( string $chunk ): array {
		if ( ! preg_match( '/\boptions=\{\s*\[([\s\S]*?)\]\s*\}/', $chunk, $match ) ) {
			return array();
		}

		$options = array();
		foreach ( preg_split( '/\}\s*,/', $match[1] ) ?: array() as $item ) {
			if ( ! preg_match( '/\bvalue\s*:\s*[\'"]([^\'"]*)[\'"]/', $item, $value_match ) ) {
				continue;
			}
			if ( ! preg_match( '/\blabel\s*:\s*(?:__\(\s*)?[\'"]([^\'"]*)[\'"]/', $item, $label_match ) ) {
				continue;
			}
			$options[ $value_match[1] ] = $label_match[1];
		}

		return $options;
	}

	public static function supports( string $block_name ): bool {
		return null !== self::metadata( $block_name );
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	private static function entries( string $block_name ): array {
		$metadata = self::metadata( $block_name );
		if ( ! $metadata || empty( $metadata['attributes'] ) || ! is_array( $metadata['attributes'] ) ) {
			return array();
		}

		$controls = self::controls( $block_name );

		$entries = array();
		foreach ( $metadata['attributes'] as $attr => $definition ) {
			if ( ! is_array( $definition ) ) {
				continue;
			}

			$control = $controls[ (string) $attr ] ?? null;

			if ( ! empty( $definition['selectors'] ) && is_array( $definition['selectors'] ) ) {
				foreach ( $definition['selectors'] as $selector => $declarations ) {
					foreach ( self::parse_declaration_templates( (string) $declarations ) as $declaration ) {
						// Shadow templates spell out their tokens instead of using
						// groupSelector; route them through the shadow codec.
						$shadow_group = self::shadow_group( $declaration['property'], $declaration['value'] );

						$entries[] = array(
							'attr'           => (string) $attr,
							'selector'       => (string) $selector,
							'property'       => $declaration['property'],
							'template'       => $shadow_group ? '{{VALUE}}' : $declaration['value'],
							'kind'           => $shadow_group ? 'group' : self::direct_kind( $declaration['value'] ),
							'wp_type'        => $definition['type'] ?? 'string',
							'group_type'     => $shadow_group,
							'option'         => self::stores_option( $definition, $control, $declaration['property'] ),
							'option_labels'  => $control['options'] ?? array(),
						);
					}
				}
			}

			if ( ! empty( $definition['groupSelector']['type'] ) && ! empty( $definition['groupSelector']['selector'] ) ) {
				$group_type = (string) $definition['groupSelector']['type'];
				$selector   = (string) $definition['groupSelector']['selector'];
				foreach ( self::group_properties( $group_type ) as $property ) {
					$entries[] = array(
						'attr'          => (string) $attr,
						'selector'      => $selector,
						'property'      => $property,
						'template'      => '{{VALUE}}',
						'kind'          => 'group',
						'wp_type'       => $definition['type'] ?? 'string',
						'group_type'    => $group_type,
						'option'        => false,
						'option_labels' => array(),
					);
				}
			}
		}

		return $entries;
	}

	/**
	 * @return array<int, array{property: string, value: string}>
	 */
	private static function parse_declaration_templates( string $css ): array {
		$out = array();
		foreach ( explode( ';', $css ) as $part ) {
			if ( ! str_contains( $part, ':' ) ) {
				continue;
			}
			list( $property, $value ) = array_map( 'trim', explode( ':', $part, 2 ) );
			if ( '' !== $property && '' !== $value ) {
				$out[] = array(
					'property' => strtolower( $property ),
					'value'    => $value,
				);
			}
		}
		return $out;
	}

	/**
	 * @return string[]
	 */
	private static function group_properties( string $type ): array {
		switch ( $type ) {
			case 'BlockishTypography':
				return array( 'font-family', 'font-weight', 'font-size', 'line-height', 'letter-spacing', 'text-transform', 'font-style', 'text-decoration' );
			case 'BlockishBackground':
				return array( 'background', 'background-color', 'background-image', 'background-size', 'background-position', 'background-repeat', 'background-attachment', 'background-blend-mode' );
			case 'BlockishBorder':
				return array(
					'border', 'border-width', 'border-style', 'border-color',
					'border-top', 'border-right', 'border-bottom', 'border-left',
					'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width',
					'border-top-style', 'border-right-style', 'border-bottom-style', 'border-left-style',
					'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color',
				);
			case 'BlockishBoxShadow':
				return array( 'box-shadow' );
			case 'BlockishTextShadow':
				return array( 'text-shadow' );
			case 'BlockishCSSFilters':
				return array( 'filter' );
			case 'BlockishTextStroke':
				return array( '-webkit-text-stroke-width', '-webkit-text-stroke-color' );
			case 'BlockishBackgroundOverlay':
				return array( 'background', 'background-color', 'background-image', 'opacity', 'filter', 'mix-blend-mode' );
			default:
				return array();
		}
	}

	private static function shadow_group( string $property, string $template ): ?string {
		if ( ! str_contains( $template, '{{HOFFSET}}' ) ) {
			return null;
		}

		if ( 'box-shadow' === $property ) {
			return 'BlockishBoxShadow';
		}

		return 'text-shadow' === $property ? 'BlockishTextShadow' : null;
	}

	private static function direct_kind( string $template ): string {
		if ( str_contains( $template, '{{TOP_LEFT}}' ) || str_contains( $template, '{{BOTTOM_RIGHT}}' ) ) {
			return 'radius';
		}
		// Full box shorthand only — lone {{TOP}} is a length token (e.g. accordion iconSize).
		if (
			str_contains( $template, '{{TOP}}' )
			&& str_contains( $template, '{{RIGHT}}' )
			&& str_contains( $template, '{{BOTTOM}}' )
			&& str_contains( $template, '{{LEFT}}' )
		) {
			return 'spacing';
		}
		return 'value';
	}

	/**
	 * @param array<string, mixed> $input
	 * @return array<string, mixed>
	 */
	public static function css_to_attributes( string $block_name, array $input ): array {
		$css = isset( $input['css'] ) ? trim( (string) $input['css'] ) : '';
		if ( '' === $css ) {
			return array( 'error' => 'css is required for css_to_attributes.' );
		}

		$entries = self::entries( $block_name );

		$parsed = CssParser::parse( $css );
		$root   = isset( $input['root_selector'] ) ? trim( (string) $input['root_selector'] ) : '';
		if ( '' === $root ) {
			$root = self::guess_root( $parsed['rules'] );
		}

		$attributes = array();
		$mapped     = array();
		$unmapped   = array();
		$global_css = array();

		foreach ( $parsed['rules'] as $rule ) {
			$rule_selector = trim( (string) $rule['selector'] );
			$device        = (string) $rule['device'];

			foreach ( $rule['declarations'] as $property => $value ) {
				$property = strtolower( (string) $property );
				$entry    = self::find_entry( $entries, $rule_selector, $root, $property );

				if ( ! $entry && 'gap' === $property && self::apply_gap_shorthand( $attributes, $entries, $rule_selector, $root, (string) $value, $device ) ) {
					$mapped[] = 'gap@' . $device;
					continue;
				}

				if ( ! $entry ) {
					if ( self::is_root_selector( $rule_selector, $root ) ) {
						$global_css[] = self::rule_to_css( $rule_selector, array( $property => $value ), $device );
					} else {
						$unmapped[] = self::rule_to_css( $rule_selector, array( $property => $value ), $device );
					}
					continue;
				}
				if ( ! self::apply_entry( $attributes, $entry, (string) $value, $device ) ) {
					$unmapped[] = self::rule_to_css( $rule_selector, array( $property => $value ), $device );
					continue;
				}
				$mapped[] = $property . '@' . $device;
			}
		}

		foreach ( $parsed['raw_leftovers'] as $leftover ) {
			$unmapped[] = $leftover;
		}

		if ( ! empty( $global_css ) ) {
			$global = Converter::css_to_attributes(
				'blockish/global',
				array(
					'css'           => implode( ' ', $global_css ),
					'root_selector' => $root,
				)
			);
			if ( empty( $global['error'] ) ) {
				$attributes = array_replace_recursive( $global['attributes'] ?? array(), $attributes );
				$mapped     = array_merge( $mapped, $global['mapped'] ?? array() );
				$unmapped   = array_merge( $unmapped, $global['unmapped'] ?? array() );
			} else {
				$unmapped = array_merge( $unmapped, $global_css );
			}
		}

		$custom_css = self::build_custom_css( $unmapped, $root );
		return array(
			'attributes'    => $attributes,
			'customCss'     => $custom_css,
			'mapped'        => array_values( array_unique( $mapped ) ),
			'unmapped'      => $unmapped,
			'root_selector' => $root,
			'block_name'    => $block_name,
		);
	}

	/**
	 * `gap: <row> <column>` when metadata only declares row-gap / column-gap.
	 *
	 * @param array<string, mixed>             $attributes
	 * @param array<int, array<string, mixed>> $entries
	 */
	private static function apply_gap_shorthand( array &$attributes, array $entries, string $rule_selector, string $root, string $value, string $device ): bool {
		$parts  = preg_split( '/\s+/', trim( $value ) ) ?: array();
		$row    = $parts[0] ?? '';
		$column = $parts[1] ?? $row;

		if ( '' === $row ) {
			return false;
		}

		$applied = false;
		foreach ( array( 'row-gap' => $row, 'column-gap' => $column ) as $property => $part ) {
			$entry = self::find_entry( $entries, $rule_selector, $root, $property );
			if ( $entry && self::apply_entry( $attributes, $entry, $part, $device ) ) {
				$applied = true;
			}
		}

		return $applied;
	}

	/**
	 * @param array<int, array<string, mixed>> $entries
	 * @return array<string, mixed>|null
	 */
	private static function find_entry( array $entries, string $rule_selector, string $root, string $property ): ?array {
		$rule_selectors = array_map( 'trim', explode( ',', $rule_selector ) );

		foreach ( self::property_candidates( $property ) as $candidate_property ) {
			foreach ( $entries as $entry ) {
				if ( $entry['property'] !== $candidate_property ) {
					continue;
				}
				foreach ( self::expand_selector( (string) $entry['selector'], $root ) as $candidate ) {
					foreach ( $rule_selectors as $actual ) {
						if ( self::normalize_selector( $candidate ) === self::normalize_selector( $actual ) ) {
							return $entry;
						}
					}
				}
			}
		}

		return null;
	}

	/**
	 * Authors write the specific longhand; metadata often declares the shorthand
	 * (or vice versa). Try the equivalent property before giving up.
	 *
	 * @return string[]
	 */
	private static function property_candidates( string $property ): array {
		$aliases = array(
			'background-color' => 'background',
			'background'       => 'background-color',
			'background-image' => 'background',
		);

		$candidates = array( $property );
		if ( isset( $aliases[ $property ] ) ) {
			$candidates[] = $aliases[ $property ];
		}

		return $candidates;
	}

	/**
	 * @return string[]
	 */
	private static function expand_selector( string $selector, string $root ): array {
		$selector = str_replace( array( '.{{WRAPPER}}', '{{WRAPPER}}' ), $root, $selector );
		return array_values(
			array_filter(
				array_map( 'trim', explode( ',', $selector ) ),
				static fn( $part ) => '' !== $part
			)
		);
	}

	private static function normalize_selector( string $selector ): string {
		$selector = strtolower( trim( $selector ) );
		$selector = (string) preg_replace( '/\s+/', ' ', $selector );
		$selector = (string) preg_replace( '/\s*([>+~])\s*/', '$1', $selector );
		return $selector;
	}

	private static function is_root_selector( string $selector, string $root ): bool {
		$selector = trim( (string) preg_replace( '/:hover\b/i', '', $selector ) );
		return self::normalize_selector( $selector ) === self::normalize_selector( $root );
	}

	/**
	 * @param array<string, mixed> $attributes
	 * @param array<string, mixed> $entry
	 */
	private static function apply_entry( array &$attributes, array $entry, string $css_value, string $device ): bool {
		$attr       = (string) $entry['attr'];
		$group_type = $entry['group_type'];

		if ( $group_type ) {
			return self::apply_group( $attributes, $attr, (string) $group_type, (string) $entry['property'], $css_value, $device );
		}

		$kind = (string) $entry['kind'];
		if ( 'spacing' === $kind ) {
			$value = Codecs::spacing( $css_value );
			if ( ! $value ) {
				return false;
			}
			Codecs::set_responsive( $attributes, $attr, $device, $value );
			return true;
		}
		if ( 'radius' === $kind ) {
			$value = Codecs::radius( $css_value );
			if ( ! $value ) {
				return false;
			}
			Codecs::set_responsive( $attributes, $attr, $device, $value );
			return true;
		}

		$value = self::extract_template_value( (string) $entry['template'], $css_value );
		if ( null === $value ) {
			return false;
		}

		$wp_type = (string) $entry['wp_type'];
		if ( 'number' === $wp_type ) {
			if ( ! is_numeric( $value ) ) {
				return false;
			}
			$attributes[ $attr ] = (float) $value;
			return true;
		}

		if ( 'object' === $wp_type ) {
			if ( ! empty( $entry['option'] ) ) {
				Codecs::set_responsive(
					$attributes,
					$attr,
					$device,
					self::option_value( $value, (string) $entry['property'], $entry['option_labels'] ?? array() )
				);
			} else {
				Codecs::set_responsive( $attributes, $attr, $device, $value );
			}
			return true;
		}

		if ( 'Desktop' !== $device ) {
			return false;
		}
		$attributes[ $attr ] = $value;
		return true;
	}

	/**
	 * @param array<string, mixed> $attributes
	 */
	private static function apply_group( array &$attributes, string $attr, string $group_type, string $property, string $value, string $device ): bool {
		switch ( $group_type ) {
			case 'BlockishTypography':
				$fields = array(
					'font-family'    => array( 'fontFamily', 'option' ),
					'font-weight'    => array( 'fontWeight', 'scalar' ),
					'font-size'      => array( 'fontSize', 'responsive' ),
					'line-height'    => array( 'lineHeight', 'responsive' ),
					'letter-spacing'=> array( 'letterSpacing', 'responsive' ),
					'text-transform'=> array( 'textTransform', 'scalar' ),
					'font-style'     => array( 'fontStyle', 'scalar' ),
					'text-decoration'=> array( 'textDecoration', 'scalar' ),
				);
				if ( ! isset( $fields[ $property ] ) ) {
					return false;
				}
				list( $field, $shape ) = $fields[ $property ];
				$normalized = Codecs::normalize_typography_value( $field, $value, $shape );
				if ( null === $normalized ) {
					return false;
				}
				$merged = Codecs::merge_typography_field( $attributes[ $attr ] ?? null, $field, $shape, $device, $normalized );
				if ( null === $merged ) {
					return false;
				}
				$attributes[ $attr ] = $merged;
				return true;

			case 'BlockishBackground':
				$existing = self::decode_json_object( $attributes[ $attr ] ?? null );
				$merged   = Codecs::merge_background( array( $property => $value ), $device, $existing ?: null );
				if ( ! $merged ) {
					return false;
				}
				$attributes[ $attr ] = wp_json_encode( $merged );
				return true;

			case 'BlockishBorder':
				$part = null;
				$side = null;
				if ( preg_match( '/^border(?:-(top|right|bottom|left))?-(width|style|color)$/', $property, $match ) ) {
					$side = $match[1] ?: null;
					$part = $match[2];
				}
				$merged = $part
					? Codecs::merge_border_part( $attributes[ $attr ] ?? null, $device, $part, $value, $side )
					: Codecs::merge_border( $attributes[ $attr ] ?? null, $device, $value, str_replace( 'border-', '', $property ) !== $property ? str_replace( 'border-', '', $property ) : null );
				if ( ! $merged ) {
					return false;
				}
				$attributes[ $attr ] = $merged['value'];
				return true;

			case 'BlockishBoxShadow':
				$shadow = Codecs::box_shadow( $value );
				if ( ! $shadow || 'Desktop' !== $device ) {
					return false;
				}
				$attributes[ $attr ] = $shadow;
				return true;

			case 'BlockishTextShadow':
				$shadow = Codecs::text_shadow( $value );
				if ( ! $shadow || 'Desktop' !== $device ) {
					return false;
				}
				$attributes[ $attr ] = $shadow;
				return true;

			case 'BlockishCSSFilters':
				$filters = Codecs::css_filters( $value );
				if ( ! $filters || 'Desktop' !== $device ) {
					return false;
				}
				$attributes[ $attr ] = $filters;
				return true;

			case 'BlockishTextStroke':
				$stroke = self::decode_json_object( $attributes[ $attr ] ?? null );
				if ( '-webkit-text-stroke-width' === $property ) {
					if ( ! isset( $stroke['width'] ) || ! is_array( $stroke['width'] ) ) {
						$stroke['width'] = array();
					}
					$stroke['width'][ $device ] = trim( $value );
				} elseif ( '-webkit-text-stroke-color' === $property ) {
					if ( 'Desktop' !== $device ) {
						return false;
					}
					$stroke['color'] = trim( $value );
				} else {
					return false;
				}
				$attributes[ $attr ] = wp_json_encode( $stroke );
				return true;

			case 'BlockishBackgroundOverlay':
				if ( 'Desktop' !== $device ) {
					return false;
				}
				$overlay            = self::decode_json_object( $attributes[ $attr ] ?? null );
				$overlay['enabled'] = true;
				if ( in_array( $property, array( 'background', 'background-color' ), true ) ) {
					if ( preg_match( '/(?:linear|radial|conic)-gradient\(/i', $value ) ) {
						$overlay['type']     = 'gradient';
						$overlay['gradient'] = trim( $value );
					} else {
						$overlay['type']  = 'color';
						$overlay['color'] = trim( $value );
					}
				} elseif ( 'background-image' === $property ) {
					$overlay['type']     = 'gradient';
					$overlay['gradient'] = trim( $value );
				} elseif ( 'opacity' === $property ) {
					$opacity = Codecs::opacity_percent( $value );
					if ( null === $opacity && preg_match( '/calc\(\s*([.\d]+)\s*\/\s*100\s*\)/i', $value, $match ) ) {
						$opacity = (float) $match[1];
					}
					if ( null === $opacity ) {
						return false;
					}
					$overlay['opacity'] = $opacity;
				} elseif ( 'filter' === $property ) {
					$filters = Codecs::css_filters( $value );
					if ( ! $filters ) {
						return false;
					}
					$overlay['filters'] = $filters;
				} elseif ( 'mix-blend-mode' === $property ) {
					$overlay['blendMode'] = Codecs::option( 'background-blend-mode', $value ) ?? array(
						'label' => ucwords( str_replace( '-', ' ', trim( $value ) ) ),
						'value' => trim( $value ),
					);
				} else {
					return false;
				}
				$attributes[ $attr ] = wp_json_encode( $overlay );
				return true;
		}

		return false;
	}

	/**
	 * @param mixed $value
	 * @return array<string, mixed>
	 */
	private static function decode_json_object( $value ): array {
		if ( is_array( $value ) ) {
			return $value;
		}
		if ( is_string( $value ) && '' !== $value ) {
			$decoded = json_decode( $value, true );
			return is_array( $decoded ) ? $decoded : array();
		}
		return array();
	}

	/**
	 * Does this attribute store `{label, value}` rather than a bare string?
	 *
	 * The control wins over everything else — it is what reads and writes the
	 * attribute in the editor. A few blocks ship a default whose shape disagrees
	 * with their control; following the control keeps the control usable.
	 *
	 * @param array<string, mixed>                                       $definition
	 * @param array{type: string, options: array<string, string>}|null   $control
	 */
	private static function stores_option( array $definition, ?array $control, string $property ): bool {
		if ( null !== $control ) {
			return str_starts_with( $control['type'], 'BlockishSelect' );
		}

		$probe = $definition['default'] ?? null;
		if ( is_array( $probe ) && array_key_exists( 'Desktop', $probe ) ) {
			$probe = $probe['Desktop'];
		}
		if ( is_array( $probe ) ) {
			return isset( $probe['value'] );
		}
		if ( is_string( $probe ) && '' !== $probe ) {
			return false;
		}

		return self::is_option_property( $property );
	}

	/**
	 * @param array<string, string> $labels value => label from the block's own control.
	 * @return array{label: string, value: string}
	 */
	private static function option_value( string $value, string $property, array $labels ): array {
		if ( isset( $labels[ $value ] ) ) {
			return array(
				'label' => $labels[ $value ],
				'value' => $value,
			);
		}

		return Codecs::option( $property, $value ) ?? array(
			'label' => ucwords( str_replace( array( '-', '_' ), ' ', $value ) ),
			'value' => $value,
		);
	}

	/** Last resort when a block has neither a control nor a default to learn from. */
	private static function is_option_property( string $property ): bool {
		return in_array(
			$property,
			array(
				'align-items', 'align-self', 'justify-content', 'justify-self',
				'flex-direction', 'object-fit', 'overflow', 'position',
				'background-size', 'background-position', 'background-repeat',
				'background-attachment', 'background-blend-mode', 'aspect-ratio',
			),
			true
		);
	}

	private static function extract_template_value( string $template, string $css_value ): ?string {
		$trimmed = trim( $template );
		if ( '{{VALUE}}' === $trimmed || '{{TOP}}' === $trimmed ) {
			return trim( $css_value );
		}

		// Authors space function arguments differently than the template does,
		// so match on a whitespace-insensitive pattern.
		$quoted = preg_quote( $trimmed, '/' );
		$quoted = str_replace( array( '\{\{VALUE\}\}', '\{\{TOP\}\}' ), '(.+?)', $quoted );
		$quoted = (string) preg_replace( '/(\\\\\s|\s)+/', '\\\\s*', $quoted );

		if ( preg_match( '/^\s*' . $quoted . '\s*$/i', trim( $css_value ), $match ) ) {
			return trim( $match[1] );
		}

		return null;
	}

	/**
	 * @param array<string, mixed> $input
	 * @return array<string, mixed>
	 */
	public static function attributes_to_css( string $block_name, array $input ): array {
		$attributes = $input['attributes'] ?? null;
		if ( ! is_array( $attributes ) ) {
			return array( 'error' => 'attributes object is required for attributes_to_css.' );
		}

		$root    = isset( $input['root_selector'] ) && '' !== trim( (string) $input['root_selector'] )
			? trim( (string) $input['root_selector'] )
			: '{{SELECTOR}}';
		$entries = self::entries( $block_name );
		$buckets = array(
			'Desktop' => array(),
			'Tablet'  => array(),
			'Mobile'  => array(),
		);

		$handled_groups = array();
		foreach ( $entries as $entry ) {
			$attr = (string) $entry['attr'];
			if ( ! array_key_exists( $attr, $attributes ) ) {
				continue;
			}

			if ( $entry['group_type'] ) {
				$key = $attr . '|' . $entry['selector'];
				if ( isset( $handled_groups[ $key ] ) ) {
					continue;
				}
				$handled_groups[ $key ] = true;
				self::emit_group( $buckets, $root, $entry, $attributes[ $attr ] );
				continue;
			}

			self::emit_direct( $buckets, $root, $entry, $attributes[ $attr ] );
		}

		$block_attrs = array();
		foreach ( $entries as $entry ) {
			$block_attrs[ (string) $entry['attr'] ] = true;
		}
		$global_attributes = array_diff_key( $attributes, $block_attrs );
		unset( $global_attributes['customCss'] );

		$css = '';
		if ( ! empty( $global_attributes ) ) {
			$global = Converter::attributes_to_css(
				'blockish/global',
				array(
					'attributes'    => $global_attributes,
					'root_selector' => $root,
				)
			);
			if ( empty( $global['error'] ) ) {
				$css .= (string) ( $global['css'] ?? '' );
			}
		}

		foreach ( self::DEVICES as $device ) {
			if ( empty( $buckets[ $device ] ) ) {
				continue;
			}
			$device_css = '';
			foreach ( $buckets[ $device ] as $selector => $declarations ) {
				$device_css .= self::declarations_block( $selector, $declarations );
			}
			if ( 'Tablet' === $device ) {
				$css .= '@media (max-width: 1024px) {' . $device_css . '}';
			} elseif ( 'Mobile' === $device ) {
				$css .= '@media (max-width: 768px) {' . $device_css . '}';
			} else {
				$css .= $device_css;
			}
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
	 * @param array<string, array<string, array<string, string>>> $buckets
	 * @param array<string, mixed> $entry
	 * @param mixed $value
	 */
	private static function emit_direct( array &$buckets, string $root, array $entry, $value ): void {
		$selectors = self::expand_selector( (string) $entry['selector'], $root );
		$selector  = ! empty( $selectors ) ? implode( ', ', $selectors ) : $root;
		$kind     = (string) $entry['kind'];

		if ( 'spacing' === $kind || 'radius' === $kind ) {
			$values = self::responsive_values( $value );
			foreach ( $values as $device => $raw ) {
				$css_value = 'spacing' === $kind ? Codecs::spacing_css( $raw ) : Codecs::radius_css( $raw );
				self::push( $buckets, $device, $selector, (string) $entry['property'], $css_value );
			}
			return;
		}

		foreach ( self::responsive_values( $value ) as $device => $raw ) {
			$raw = Codecs::option_css( $raw );
			if ( '' === $raw ) {
				continue;
			}
			$css_value = str_replace(
				array( '{{VALUE}}', '{{TOP}}' ),
				array( $raw, $raw ),
				(string) $entry['template']
			);
			self::push( $buckets, $device, $selector, (string) $entry['property'], $css_value );
		}
	}

	/**
	 * @param array<string, array<string, array<string, string>>> $buckets
	 * @param array<string, mixed> $entry
	 * @param mixed $value
	 */
	private static function emit_group( array &$buckets, string $root, array $entry, $value ): void {
		$selectors = self::expand_selector( (string) $entry['selector'], $root );
		$selector  = ! empty( $selectors ) ? implode( ', ', $selectors ) : $root;
		switch ( $entry['group_type'] ) {
			case 'BlockishTypography':
				foreach ( Codecs::typography_declarations( $value ) as $device => $declarations ) {
					foreach ( $declarations as $property => $css_value ) {
						self::push( $buckets, $device, $selector, $property, $css_value );
					}
				}
				break;
			case 'BlockishBackground':
				foreach ( Codecs::background_css( $value ) as $property => $css_value ) {
					self::push( $buckets, 'Desktop', $selector, $property, $css_value );
				}
				break;
			case 'BlockishBorder':
				foreach ( Codecs::border_css_map( $value ) as $device => $declarations ) {
					foreach ( $declarations as $property => $css_value ) {
						self::push( $buckets, $device, $selector, $property, $css_value );
					}
				}
				break;
			case 'BlockishBoxShadow':
				self::push( $buckets, 'Desktop', $selector, 'box-shadow', Codecs::box_shadow_css( $value ) );
				break;
			case 'BlockishTextShadow':
				self::push( $buckets, 'Desktop', $selector, 'text-shadow', Codecs::text_shadow_css( $value ) );
				break;
			case 'BlockishCSSFilters':
				self::push( $buckets, 'Desktop', $selector, 'filter', Codecs::css_filters_css( $value ) );
				break;
			case 'BlockishTextStroke':
				$stroke = self::decode_json_object( $value );
				if ( ! empty( $stroke['width'] ) && is_array( $stroke['width'] ) ) {
					foreach ( self::DEVICES as $device ) {
						if ( isset( $stroke['width'][ $device ] ) && '' !== (string) $stroke['width'][ $device ] ) {
							self::push( $buckets, $device, $selector, '-webkit-text-stroke-width', (string) $stroke['width'][ $device ] );
						}
					}
				}
				if ( ! empty( $stroke['color'] ) ) {
					self::push( $buckets, 'Desktop', $selector, '-webkit-text-stroke-color', (string) $stroke['color'] );
				}
				break;
			case 'BlockishBackgroundOverlay':
				$overlay = self::decode_json_object( $value );
				if ( empty( $overlay['enabled'] ) ) {
					break;
				}
				if ( 'gradient' === ( $overlay['type'] ?? '' ) && ! empty( $overlay['gradient'] ) ) {
					self::push( $buckets, 'Desktop', $selector, 'background-image', (string) $overlay['gradient'] );
				} elseif ( ! empty( $overlay['color'] ) ) {
					self::push( $buckets, 'Desktop', $selector, 'background', (string) $overlay['color'] );
				}
				if ( isset( $overlay['opacity'] ) && is_numeric( $overlay['opacity'] ) ) {
					self::push( $buckets, 'Desktop', $selector, 'opacity', 'calc(' . $overlay['opacity'] . ' / 100)' );
				}
				if ( ! empty( $overlay['filters'] ) ) {
					self::push( $buckets, 'Desktop', $selector, 'filter', Codecs::css_filters_css( $overlay['filters'] ) );
				}
				if ( ! empty( $overlay['blendMode'] ) ) {
					self::push( $buckets, 'Desktop', $selector, 'mix-blend-mode', Codecs::option_css( $overlay['blendMode'] ) );
				}
				break;
		}
	}

	/**
	 * @param mixed $value
	 * @return array<string, mixed>
	 */
	private static function responsive_values( $value ): array {
		if ( ! is_array( $value ) ) {
			return array( 'Desktop' => $value );
		}

		$out = array();
		foreach ( self::DEVICES as $device ) {
			if ( array_key_exists( $device, $value ) ) {
				$out[ $device ] = $value[ $device ];
			}
		}
		if ( empty( $out ) ) {
			$out['Desktop'] = $value;
		}
		return $out;
	}

	/**
	 * @param array<string, array<string, array<string, string>>> $buckets
	 */
	private static function push( array &$buckets, string $device, string $selector, string $property, string $value ): void {
		if ( '' === trim( $value ) ) {
			return;
		}
		$buckets[ $device ][ $selector ][ $property ] = $value;
	}

	/**
	 * @param array<int, array<string, mixed>> $rules
	 */
	private static function guess_root( array $rules ): string {
		foreach ( $rules as $rule ) {
			$selector = trim( (string) ( $rule['selector'] ?? '' ) );
			$selector = trim( (string) preg_replace( '/:hover\b/i', '', $selector ) );
			if ( preg_match( '/^([.#][a-zA-Z0-9_-]+)/', $selector, $match ) ) {
				return $match[1];
			}
		}
		return '{{SELECTOR}}';
	}

	/**
	 * @param array<string, string> $declarations
	 */
	private static function rule_to_css( string $selector, array $declarations, string $device ): string {
		$rule = self::declarations_block( $selector, $declarations );
		if ( 'Tablet' === $device ) {
			return '@media (max-width: 1024px) {' . $rule . '}';
		}
		if ( 'Mobile' === $device ) {
			return '@media (max-width: 768px) {' . $rule . '}';
		}
		return $rule;
	}

	/**
	 * @param string[] $rules
	 */
	private static function build_custom_css( array $rules, string $root ): string {
		$css = implode( ' ', $rules );
		if ( '' !== $root && '{{SELECTOR}}' !== $root ) {
			$css = str_replace( $root, '{{SELECTOR}}', $css );
		}
		return trim( $css );
	}

	/**
	 * @param array<string, string> $declarations
	 */
	private static function declarations_block( string $selector, array $declarations ): string {
		if ( empty( $declarations ) ) {
			return '';
		}
		$body = '';
		foreach ( $declarations as $property => $value ) {
			$body .= $property . ': ' . $value . '; ';
		}
		return $selector . ' { ' . $body . '}';
	}
}
