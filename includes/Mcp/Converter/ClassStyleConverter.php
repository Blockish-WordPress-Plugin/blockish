<?php

namespace Blockish\Mcp\Converter;

defined( 'ABSPATH' ) || exit;

/**
 * CSS ↔ Class Manager native model.
 *
 * AI surface is raw CSS only. Internally:
 * - exact `.slug` rules → parent style object
 * - `.slug:hover`, `.slug h2`, `.slug:hover h2`, … → child posts named by the
 *   remainder (`:hover`, `h2`, `:hover h2`) so the Class Manager UI can edit them
 * - leftovers that cannot map → that node's customCss ({{SELECTOR}})
 *
 * AI never sees parent/child posts — manage-class / get-classes expose CSS only.
 */
class ClassStyleConverter {

	private const SELECTOR_TOKEN = '{{SELECTOR}}';

	/**
	 * Convert a stylesheet into Class Manager parent + child style objects.
	 *
	 * @return array{
	 *   content?: array,
	 *   children?: array<int, array{name: string, content: array}>,
	 *   css?: string,
	 *   mapped?: string[],
	 *   unmapped?: string[],
	 *   error?: string
	 * }
	 */
	public static function css_to_class_tree( string $css, string $class_slug ): array {
		$slug = self::normalize_slug( $class_slug );
		if ( '' === $slug ) {
			return array( 'error' => 'Invalid class name: must normalize to a valid CSS class slug (start with a letter or underscore; only a-z, 0-9, hyphen, underscore).' );
		}

		$css = trim( $css );
		if ( '' === $css ) {
			return array(
				'content'  => array(),
				'children' => array(),
				'css'      => '',
				'mapped'   => array(),
				'unmapped' => array(),
			);
		}

		$root     = '.' . $slug;
		$prepared = str_replace( self::SELECTOR_TOKEN, $root, $css );
		$parsed   = CssParser::parse( $prepared );
		$errors   = array();

		foreach ( $parsed['rules'] as $rule ) {
			if ( ! self::selector_is_scoped( $rule['selector'], $slug ) ) {
				$errors[] = 'Selector "' . $rule['selector'] . '" is outside class scope ".' . $slug . '". Every selector must start with .' . $slug . ' (e.g. .' . $slug . ', .' . $slug . ':hover, .' . $slug . ' h2).';
			}
		}

		foreach ( $parsed['raw_leftovers'] as $leftover ) {
			if ( preg_match_all( '/([^{}@][^{]*)\{/', $leftover, $matches ) ) {
				foreach ( $matches[1] as $sel_chunk ) {
					foreach ( preg_split( '/\s*,\s*/', trim( $sel_chunk ) ) as $sel ) {
						$sel = trim( $sel );
						if ( '' === $sel || '@' === ( $sel[0] ?? '' ) ) {
							continue;
						}
						if ( ! self::selector_is_scoped( $sel, $slug ) ) {
							$errors[] = 'Selector "' . $sel . '" inside at-rule is outside class scope ".' . $slug . '".';
						}
					}
				}
			}
		}

		if ( ! empty( $errors ) ) {
			return array( 'error' => implode( ' ', array_unique( $errors ) ) );
		}

		return self::build_tree_for_slug( $parsed['rules'], $parsed['raw_leftovers'], $slug );
	}

	/**
	 * Convert a stylesheet that may declare several classes into one tree per
	 * class. The class name is read from each rule's leftmost class selector,
	 * so callers do not need to pass a name. `{{SELECTOR}}` is rejected here —
	 * it has no name to derive; use css_to_class_tree with an explicit name.
	 *
	 * @return array{classes?: array<int, array{slug: string, name: string, content: array, children: array, css: string, mapped: string[], unmapped: string[]}>, error?: string}
	 */
	public static function css_to_class_trees( string $css ): array {
		$css = trim( $css );
		if ( '' === $css ) {
			return array( 'classes' => array() );
		}

		if ( false !== strpos( $css, self::SELECTOR_TOKEN ) ) {
			return array( 'error' => self::SELECTOR_TOKEN . ' has no class name to derive from. Use real ".class" selectors so the name can be read from the CSS, or pass an explicit name for a single class.' );
		}

		$parsed = CssParser::parse( $css );
		$errors = array();
		$groups = array(); // slug => array{ name: string, rules: array, leftovers: string[] }
		$order  = array();

		$ensure_group = static function ( string $slug, string $name ) use ( &$groups, &$order ): void {
			if ( ! isset( $groups[ $slug ] ) ) {
				$groups[ $slug ] = array(
					'name'      => $name,
					'rules'     => array(),
					'leftovers' => array(),
				);
				$order[]         = $slug;
			}
		};

		foreach ( $parsed['rules'] as $rule ) {
			$root = self::root_class_of_selector( $rule['selector'] );
			if ( '' === $root ) {
				$errors[] = 'Selector "' . $rule['selector'] . '" must start with a class (e.g. .card, .card:hover, .card h2). Bare element / id / attribute selectors are not allowed.';
				continue;
			}
			$slug = self::normalize_slug( $root );
			if ( '' === $slug ) {
				$errors[] = 'Class name in "' . $rule['selector'] . '" is not a valid CSS class (only a-z, 0-9, hyphen, underscore; start with a letter or underscore).';
				continue;
			}
			$ensure_group( $slug, $root );
			$groups[ $slug ]['rules'][] = $rule;
		}

		foreach ( $parsed['raw_leftovers'] as $leftover ) {
			$leftover_slug = null;
			if ( preg_match_all( '/([^{}@][^{]*)\{/', $leftover, $matches ) ) {
				foreach ( $matches[1] as $sel_chunk ) {
					foreach ( preg_split( '/\s*,\s*/', trim( $sel_chunk ) ) as $sel ) {
						$sel = trim( $sel );
						if ( '' === $sel || '@' === ( $sel[0] ?? '' ) ) {
							continue;
						}
						$root = self::root_class_of_selector( $sel );
						if ( '' === $root ) {
							$errors[] = 'Selector "' . $sel . '" inside an at-rule must start with a class.';
							continue;
						}
						$slug = self::normalize_slug( $root );
						if ( '' === $slug ) {
							continue;
						}
						if ( null === $leftover_slug ) {
							$leftover_slug = $slug;
							$ensure_group( $slug, $root );
						} elseif ( $leftover_slug !== $slug ) {
							$errors[] = 'An at-rule block targets more than one class ("' . $leftover_slug . '" and "' . $slug . '"). Split it so each at-rule scopes a single class.';
						}
					}
				}
			}
			if ( null !== $leftover_slug ) {
				$groups[ $leftover_slug ]['leftovers'][] = $leftover;
			}
		}

		if ( ! empty( $errors ) ) {
			return array( 'error' => implode( ' ', array_unique( $errors ) ) );
		}

		$classes = array();
		foreach ( $order as $slug ) {
			$group          = $groups[ $slug ];
			$tree           = self::build_tree_for_slug( $group['rules'], $group['leftovers'], $slug );
			$tree['slug']   = $slug;
			$tree['name']   = $group['name'];
			$classes[]      = $tree;
		}

		return array( 'classes' => $classes );
	}

	/**
	 * Leftmost class token of a selector (without the dot), or '' when the
	 * selector does not begin with a class. `.card h2` → `card`,
	 * `.card:hover` → `card`, `div .card` / `#id` → ''.
	 */
	public static function root_class_of_selector( string $selector ): string {
		$selector = preg_replace( '/\s+/', ' ', trim( (string) $selector ) );
		if ( '' === $selector ) {
			return '';
		}
		if ( preg_match( '/^\.([a-zA-Z_][a-zA-Z0-9_-]*)/', $selector, $match ) ) {
			return $match[1];
		}
		return '';
	}

	/**
	 * Build one parent + children tree from already-parsed rules/leftovers that
	 * all belong to a single class slug.
	 *
	 * @param array<int, array{selector: string, declarations: array<string, string>, device: string}> $rules
	 * @param string[] $leftovers
	 * @return array{content: array, children: array, css: string, mapped: string[], unmapped: string[]}
	 */
	private static function build_tree_for_slug( array $rules, array $leftovers, string $slug ): array {
		// Bucket rules by child name ('' = parent) then device.
		$buckets = array(
			'' => array(
				'Desktop' => array(),
				'Tablet'  => array(),
				'Mobile'  => array(),
			),
		);
		$mapped = array();

		foreach ( $rules as $rule ) {
			$child_name = self::child_name_from_selector( $rule['selector'], $slug );
			if ( ! isset( $buckets[ $child_name ] ) ) {
				$buckets[ $child_name ] = array(
					'Desktop' => array(),
					'Tablet'  => array(),
					'Mobile'  => array(),
				);
			}
			foreach ( $rule['declarations'] as $property => $value ) {
				$property = strtolower( trim( $property ) );
				$buckets[ $child_name ][ $rule['device'] ][ $property ] = $value;
				$mapped[] = ( '' === $child_name ? 'root' : $child_name ) . ':' . $property . '@' . $rule['device'];
			}
		}

		$parent_leftovers = array();
		foreach ( $leftovers as $leftover ) {
			$parent_leftovers[] = self::rewrite_selectors_in_css( $leftover, $slug );
		}

		$parent   = self::declarations_bucket_to_content( $buckets[''] ?? array(), $parent_leftovers );
		$children = array();
		foreach ( $buckets as $child_name => $by_device ) {
			if ( '' === $child_name ) {
				continue;
			}
			$children[] = array(
				'name'    => $child_name,
				'content' => self::declarations_bucket_to_content( $by_device, array() ),
			);
		}

		$css_out = self::class_tree_to_css( $parent, $children, $slug );

		return array(
			'content'  => $parent,
			'children' => $children,
			'css'      => $css_out,
			'mapped'   => array_values( array_unique( $mapped ) ),
			'unmapped' => self::list_unmapped_from_tree( $parent, $children ),
		);
	}

	/**
	 * Back-compat wrapper — returns parent content only (children discarded).
	 * Prefer css_to_class_tree for manage-class.
	 *
	 * @return array{content?: array, css?: string, mapped?: string[], unmapped?: string[], error?: string}
	 */
	public static function css_to_style_object( string $css, string $class_slug ): array {
		$tree = self::css_to_class_tree( $css, $class_slug );
		if ( isset( $tree['error'] ) ) {
			return $tree;
		}
		return array(
			'content'  => $tree['content'] ?? array(),
			'css'      => $tree['css'] ?? '',
			'mapped'   => $tree['mapped'] ?? array(),
			'unmapped' => $tree['unmapped'] ?? array(),
		);
	}

	/**
	 * Rebuild AI-facing CSS from parent + children (no blockish-cm ids).
	 *
	 * @param array<string, mixed>                         $parent
	 * @param array<int, array{name: string, content: array}> $children
	 */
	public static function class_tree_to_css( array $parent, array $children, string $class_slug ): string {
		$slug = self::normalize_slug( $class_slug );
		if ( '' === $slug ) {
			return '';
		}

		$chunks = array();
		$parent_css = self::style_object_to_css( $parent, $slug, '.' . $slug );
		if ( '' !== $parent_css ) {
			$chunks[] = $parent_css;
		}

		foreach ( $children as $child ) {
			$name = trim( (string) ( $child['name'] ?? '' ) );
			if ( '' === $name ) {
				continue;
			}
			$ai_selector = self::ai_selector_for_child( $slug, $name );
			$child_css   = self::style_object_to_css( $child['content'] ?? array(), $slug, $ai_selector );
			if ( '' !== $child_css ) {
				$chunks[] = $child_css;
			}
		}

		return trim( implode( "\n", array_filter( $chunks ) ) );
	}

	/**
	 * Remainder after `.slug` becomes the Class Manager child title.
	 * `.hero:hover` → `:hover`, `.hero h2` → `h2`, `.hero:hover h2` → `:hover h2`.
	 */
	public static function child_name_from_selector( string $selector, string $slug ): string {
		$selector = preg_replace( '/\s+/', ' ', trim( $selector ) );
		$root     = '.' . $slug;
		if ( $selector === $root ) {
			return '';
		}
		if ( 0 !== strpos( $selector, $root ) ) {
			return '';
		}
		return ltrim( substr( $selector, strlen( $root ) ) );
	}

	public static function ai_selector_for_child( string $slug, string $child_name ): string {
		$child_name = trim( $child_name );
		$root       = '.' . $slug;
		if ( '' === $child_name ) {
			return $root;
		}
		// Pseudo / compound attached without space; descendants need a space.
		if ( 0 === strpos( $child_name, ':' ) || 0 === strpos( $child_name, '::' ) ) {
			return $root . $child_name;
		}
		return $root . ' ' . $child_name;
	}

	/**
	 * @param array<string, array<string, string>> $by_device
	 * @param string[]                             $extra_custom
	 * @return array<string, mixed>
	 */
	private static function declarations_bucket_to_content( array $by_device, array $extra_custom ): array {
		$content          = array();
		$custom_by_device = array(
			'Desktop' => array(),
			'Tablet'  => array(),
			'Mobile'  => array(),
		);
		$bg_by_device = array();

		foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
			$declarations = $by_device[ $device ] ?? array();
			if ( empty( $declarations ) ) {
				continue;
			}

			$unmapped = array();
			foreach ( $declarations as $property => $value ) {
				// !important cannot live in structured Class Manager controls —
				// keep the full declaration in this node's customCss.
				if ( preg_match( '/!important\s*$/i', trim( (string) $value ) ) ) {
					$unmapped[ $property ] = $value;
					continue;
				}

				if ( self::is_background_property( $property ) ) {
					if ( ! isset( $bg_by_device[ $device ] ) ) {
						$bg_by_device[ $device ] = array();
					}
					$bg_by_device[ $device ][ $property ] = $value;
					continue;
				}

				$ok = self::apply_root_declaration( $content, $property, $value, $device );
				if ( ! $ok ) {
					$unmapped[ $property ] = $value;
				}
			}

			if ( ! empty( $unmapped ) ) {
				$custom_by_device[ $device ][] = self::rule_to_css( self::SELECTOR_TOKEN, $unmapped );
			}
		}

		foreach ( $bg_by_device as $device => $declarations ) {
			$existing = isset( $content['background'] ) && is_array( $content['background'] )
				? $content['background']
				: null;
			$merged   = Codecs::merge_background( $declarations, $device, $existing );
			if ( $merged ) {
				$content['background'] = $merged;
			} else {
				$custom_by_device[ $device ][] = self::rule_to_css( self::SELECTOR_TOKEN, $declarations );
			}
		}

		foreach ( $extra_custom as $chunk ) {
			if ( '' !== trim( (string) $chunk ) ) {
				$custom_by_device['Desktop'][] = (string) $chunk;
			}
		}

		$custom_css = self::assemble_custom_css( $custom_by_device );
		if ( '' !== $custom_css ) {
			$content['customCss'] = $custom_css;
		}

		return $content;
	}

	/**
	 * @param array<string, mixed>                         $parent
	 * @param array<int, array{name: string, content: array}> $children
	 * @return string[]
	 */
	private static function list_unmapped_from_tree( array $parent, array $children ): array {
		$out = array();
		if ( ! empty( $parent['customCss'] ) ) {
			$out[] = 'parent.customCss';
		}
		foreach ( $children as $child ) {
			if ( ! empty( $child['content']['customCss'] ) ) {
				$out[] = ( $child['name'] ?? '?' ) . '.customCss';
			}
		}
		return $out;
	}

	/**
	 * Convert the stored Class Manager style object back to canonical CSS.
	 *
	 * This is intentionally independent of compiled post meta: get-classes must
	 * expose what post_content represents, even when editor-generated meta is
	 * stale. $root_selector supports legacy child-class selectors.
	 */
	public static function style_object_to_css( $content, string $class_slug, string $root_selector = '' ): string {
		$slug = self::normalize_slug( $class_slug );
		$selector = trim( $root_selector );
		if ( '' === $selector && '' !== $slug ) {
			$selector = '.' . $slug;
		}
		if ( '' === $selector ) {
			return '';
		}

		if ( is_string( $content ) ) {
			$decoded = json_decode( $content, true );
			$content = is_array( $decoded ) ? $decoded : array();
		}
		if ( ! is_array( $content ) ) {
			return '';
		}

		$chunks = array();
		foreach ( array( 'Desktop', 'Tablet', 'Mobile' ) as $device ) {
			$declarations = self::style_declarations( $content, $device );
			if ( empty( $declarations ) ) {
				continue;
			}

			$rule = self::rule_to_css( $selector, $declarations );
			if ( 'Tablet' === $device ) {
				$rule = '@media (max-width: 1024px) { ' . $rule . ' }';
			} elseif ( 'Mobile' === $device ) {
				$rule = '@media (max-width: 768px) { ' . $rule . ' }';
			}
			$chunks[] = $rule;
		}

		$custom = isset( $content['customCss'] ) ? (string) $content['customCss'] : '';
		if ( '' !== trim( $custom ) ) {
			$chunks[] = trim(
				str_replace(
					array( self::SELECTOR_TOKEN, 'SELECTOR' ),
					$selector,
					$custom
				)
			);
		}

		return trim( implode( "\n", array_filter( $chunks ) ) );
	}

	/**
	 * Compile one device's declarations, mirroring src/extensions/class-manager/style.js.
	 *
	 * @param array<string, mixed> $styles
	 * @return array<string, string>
	 */
	private static function style_declarations( array $styles, string $device ): array {
		$out = array();

		$map = array(
			'display'          => 'display',
			'flexDirection'    => 'flex-direction',
			'flexWrap'         => 'flex-wrap',
			'justifyContent'   => 'justify-content',
			'alignItems'       => 'align-items',
			'alignSelf'        => 'align-self',
			'justifySelf'      => 'justify-self',
			'columnGap'        => 'column-gap',
			'rowGap'           => 'row-gap',
			'flexGrow'         => 'flex-grow',
			'flexShrink'       => 'flex-shrink',
			'gridColumnStart'  => 'grid-column-start',
			'gridColumnEnd'    => 'grid-column-end',
			'gridRowStart'     => 'grid-row-start',
			'gridRowEnd'       => 'grid-row-end',
			'width'            => 'width',
			'height'           => 'height',
			'minWidth'         => 'min-width',
			'minHeight'        => 'min-height',
			'maxWidth'         => 'max-width',
			'maxHeight'        => 'max-height',
			'overflow'         => 'overflow',
			'aspectRatio'      => 'aspect-ratio',
			'objectFit'        => 'object-fit',
			'position'         => 'position',
			'top'              => 'top',
			'right'            => 'right',
			'bottom'           => 'bottom',
			'left'             => 'left',
			'zIndex'           => 'z-index',
			'anchorOffset'     => 'scroll-margin-top',
			'fontWeight'       => 'font-weight',
			'fontSize'         => 'font-size',
			'textAlign'        => 'text-align',
			'lineHeight'       => 'line-height',
			'letterSpacing'    => 'letter-spacing',
			'wordSpacing'      => 'word-spacing',
			'columnCount'      => 'column-count',
			'textDecoration'   => 'text-decoration',
			'textTransform'    => 'text-transform',
			'direction'        => 'direction',
			'fontStyle'        => 'font-style',
			'textOverflow'     => 'text-overflow',
			'blendMode'        => 'mix-blend-mode',
			'backgroundClip'   => 'background-clip',
			'borderRadius'     => 'border-radius',
			'opacity'          => 'opacity',
			'perspective'      => 'perspective',
		);

		$unitless_keys = array(
			'flexGrow'        => true,
			'flexShrink'      => true,
			'gridColumnStart' => true,
			'gridColumnEnd'   => true,
			'gridRowStart'    => true,
			'gridRowEnd'      => true,
			'zIndex'          => true,
			'columnCount'     => true,
		);

		foreach ( $map as $key => $property ) {
			$exists = false;
			$value  = self::device_value( $styles[ $key ] ?? null, $device, $exists );
			if ( ! $exists ) {
				continue;
			}
			$css = self::css_value( $value );
			if ( isset( $unitless_keys[ $key ] ) ) {
				$num = self::unitless_number( $css );
				if ( ! is_numeric( $num ) ) {
					continue;
				}
				$css = (string) $num;
			}
			if ( '' !== $css ) {
				$out[ $property ] = $css;
			}
		}

		$order_exists = false;
		$flex_order   = self::css_value( self::device_value( $styles['flexOrder'] ?? null, $device, $order_exists ) );
		if ( $order_exists && 'custom' === $flex_order ) {
			$custom_exists = false;
			$custom        = self::css_value( self::device_value( $styles['flexCustomOrder'] ?? null, $device, $custom_exists ) );
			if ( $custom_exists && '' !== $custom ) {
				$out['order'] = (string) (int) $custom;
			}
		} elseif ( $order_exists && '' !== $flex_order ) {
			$out['order'] = $flex_order;
		}

		self::compile_grid_span( $out, $styles, $device, 'gridColumn', 'grid-column' );
		self::compile_grid_span( $out, $styles, $device, 'gridRow', 'grid-row' );

		foreach ( array( 'padding', 'margin' ) as $key ) {
			$exists = false;
			$value  = self::device_value( $styles[ $key ] ?? null, $device, $exists );
			if ( $exists ) {
				$css = self::expand_preset_tokens( Codecs::spacing_css( $value ) );
				if ( '' !== $css ) {
					$out[ $key ] = $css;
				}
			}
		}

		// Non-responsive editor fields belong only in the base rule.
		if ( 'Desktop' === $device ) {
			$font_family = $styles['fontFamily']['value'] ?? null;
			if ( is_scalar( $font_family ) && '' !== trim( (string) $font_family ) ) {
				$out['font-family'] = trim( (string) $font_family );
			}

			$color = self::normalize_color_css( $styles['color'] ?? null );
			if ( '' !== $color ) {
				$out['color'] = $color;
			}

			foreach (
				array(
					'boxShadow'        => 'box-shadow',
					'textShadow'       => 'text-shadow',
					'filters'          => 'filter',
					'backgroundFilters'=> 'backdrop-filter',
				) as $key => $property
			) {
				$css = '';
				if ( 'boxShadow' === $key ) {
					$css = Codecs::box_shadow_css( $styles[ $key ] ?? null );
				} elseif ( 'textShadow' === $key ) {
					$css = Codecs::text_shadow_css( $styles[ $key ] ?? null );
				} else {
					$css = Codecs::css_filters_css( $styles[ $key ] ?? null );
				}
				if ( '' !== $css ) {
					$out[ $property ] = $css;
				}
			}
		}

		foreach ( self::background_declarations( $styles['background'] ?? null, $device ) as $property => $value ) {
			$out[ $property ] = $value;
		}

		$border_map = Codecs::border_css_map( $styles['border'] ?? null );
		foreach ( $border_map[ $device ] ?? array() as $property => $value ) {
			if ( '' !== trim( (string) $value ) ) {
				$out[ $property ] = trim( (string) $value );
			}
		}

		$text_stroke = $styles['textStroke'] ?? null;
		if ( is_array( $text_stroke ) ) {
			$exists = false;
			$width  = self::device_value( $text_stroke['width'] ?? null, $device, $exists );
			if ( $exists && '' !== self::css_value( $width ) ) {
				$out['-webkit-text-stroke-width'] = self::css_value( $width );
			}
			if ( 'Desktop' === $device && ! empty( $text_stroke['color'] ) ) {
				$out['-webkit-text-stroke-color'] = (string) $text_stroke['color'];
			}
		}

		self::append_grid_declarations( $out, $styles, $device );
		self::append_transform_declarations( $out, $styles, $device );
		self::append_transition_declaration( $out, $styles, $device );

		return $out;
	}

	/**
	 * @param mixed $value
	 * @param bool  $exists
	 * @return mixed
	 */
	private static function device_value( $value, string $device, bool &$exists ) {
		$exists = false;
		if ( null === $value ) {
			return null;
		}

		if ( is_array( $value ) && self::has_device_keys( $value ) ) {
			if ( ! array_key_exists( $device, $value ) ) {
				return null;
			}
			$exists = true;
			return $value[ $device ];
		}

		if ( 'Desktop' !== $device ) {
			return null;
		}

		$exists = true;
		return $value;
	}

	private static function has_device_keys( array $value ): bool {
		return array_key_exists( 'Desktop', $value )
			|| array_key_exists( 'Tablet', $value )
			|| array_key_exists( 'Mobile', $value );
	}

	/**
	 * @param mixed $value
	 */
	private static function css_value( $value ): string {
		if ( is_array( $value ) ) {
			if ( array_key_exists( 'value', $value ) ) {
				$raw = $value['value'];
				if ( ! is_scalar( $raw ) ) {
					return '';
				}
				return self::expand_preset_tokens( trim( (string) $raw . ( isset( $value['unit'] ) ? (string) $value['unit'] : '' ) ) );
			}
			return '';
		}
		return is_scalar( $value ) ? self::expand_preset_tokens( trim( (string) $value ) ) : '';
	}

	/**
	 * WP preset shorthand (var:preset|spacing|30) → var(--wp--preset--spacing--30),
	 * mirroring toLength() in src/extensions/class-manager/style.js.
	 */
	private static function expand_preset_tokens( string $value ): string {
		if ( ! str_contains( $value, 'var:' ) ) {
			return $value;
		}

		return (string) preg_replace_callback(
			'/var:([a-z0-9_-]+(?:\|[a-z0-9_-]+)*)/i',
			static function ( array $match ): string {
				return 'var(--wp--' . str_replace( '|', '--', $match[1] ) . ')';
			},
			$value
		);
	}

	/**
	 * @param mixed $value
	 */
	private static function normalize_color_css( $value ): string {
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return '';
		}
		$value = trim( $value );
		if ( str_contains( $value, '|' ) ) {
			list( $variable, $fallback ) = array_pad( explode( '|', $value, 2 ), 2, '' );
			if ( '' !== $variable && '' !== $fallback ) {
				return 'var(' . $variable . ', ' . $fallback . ')';
			}
		}
		return $value;
	}

	/**
	 * @param mixed $background
	 * @return array<string, string>
	 */
	private static function background_declarations( $background, string $device ): array {
		if ( is_string( $background ) ) {
			$decoded    = json_decode( $background, true );
			$background = is_array( $decoded ) ? $decoded : null;
		}
		if ( ! is_array( $background ) ) {
			return array();
		}

		$out  = array();
		$type = $background['backgroundType'] ?? 'classic';
		if ( 'Desktop' === $device ) {
			if ( 'gradient' === $type && ! empty( $background['gradient'] ) ) {
				$out['background'] = (string) $background['gradient'];
			} elseif ( ! empty( $background['backgroundColor'] ) ) {
				$out['background-color'] = (string) $background['backgroundColor'];
			}
			$attachment = self::css_value( $background['backgroundImageAttachment'] ?? null );
			$blend      = self::css_value( $background['backgroundImageBlendMode'] ?? null );
			if ( '' !== $attachment ) {
				$out['background-attachment'] = $attachment;
			}
			if ( '' !== $blend ) {
				$out['background-blend-mode'] = $blend;
			}
		}

		$image = $background['backgroundImage'][ $device ]['url'] ?? null;
		if ( is_string( $image ) && '' !== trim( $image ) ) {
			$out['background-image'] = 'url(' . trim( $image ) . ')';
		}

		$size = self::css_value( $background['backgroundImageSize'][ $device ] ?? null );
		if ( 'custom' === $size ) {
			$size = self::css_value( $background['backgroundImageSizeWidth'][ $device ] ?? null );
		}
		if ( '' !== $size ) {
			$out['background-size'] = $size;
		}

		$position = self::css_value( $background['backgroundImagePosition'][ $device ] ?? null );
		if ( 'custom' === $position ) {
			$x = self::css_value( $background['backgroundImagePositionHorizontal'][ $device ] ?? null );
			$y = self::css_value( $background['backgroundImagePositionVertical'][ $device ] ?? null );
			$position = '' !== $x && '' !== $y ? $x . ' ' . $y : '';
		}
		if ( '' !== $position ) {
			$out['background-position'] = $position;
		}

		$repeat = self::css_value( $background['backgroundImageRepeat'][ $device ] ?? null );
		if ( '' !== $repeat ) {
			$out['background-repeat'] = $repeat;
		}

		return $out;
	}

	/**
	 * @param array<string, string> $out
	 * @param array<string, mixed>  $styles
	 */
	private static function append_grid_declarations( array &$out, array $styles, string $device ): void {
		$exists = false;
		$type   = self::device_value( $styles['gridLayoutType'] ?? null, $device, $exists );
		if ( ! $exists ) {
			return;
		}
		$type = self::css_value( $type );

		if ( 'fixed' === $type ) {
			foreach ( array( 'gridColumns' => 'grid-template-columns', 'gridRows' => 'grid-template-rows' ) as $key => $property ) {
				$has   = false;
				$count = self::device_value( $styles[ $key ] ?? null, $device, $has );
				$count = self::unitless_number( self::css_value( $count ) );
				if ( $has && is_numeric( $count ) && '' !== (string) $count ) {
					$out[ $property ] = 'repeat(' . $count . ', minmax(0, 1fr))';
				}
			}
		} elseif ( 'auto' === $type ) {
			$has   = false;
			$width = self::device_value( $styles['autoGridWidth'] ?? null, $device, $has );
			$width = self::css_value( $width );
			if ( $has && '' !== $width ) {
				$out['grid-template-columns'] = 'repeat(auto-fill, minmax(min(' . $width . ', 100%), 1fr))';
			}
			$has    = false;
			$height = self::device_value( $styles['autoGridHeight'] ?? null, $device, $has );
			$height = self::css_value( $height );
			if ( $has && '' !== $height ) {
				$out['grid-auto-rows'] = $height;
			}
		}
	}

	/**
	 * @param array<string, string> $out
	 * @param array<string, mixed>  $styles
	 */
	private static function append_transform_declarations( array &$out, array $styles, string $device ): void {
		$parts = array();
		foreach (
			array(
				'translateX' => array( 'translateX', '' ),
				'translateY' => array( 'translateY', '' ),
				'translateZ' => array( 'translateZ', '' ),
				'rotate'     => array( 'rotate', 'deg' ),
				'rotateX'    => array( 'rotateX', 'deg' ),
				'rotateY'    => array( 'rotateY', 'deg' ),
				'rotateZ'    => array( 'rotateZ', 'deg' ),
				'scale'      => array( 'scale', '' ),
				'skewX'      => array( 'skewX', 'deg' ),
				'skewY'      => array( 'skewY', 'deg' ),
			) as $key => $spec
		) {
			$exists = false;
			$value  = self::device_value( $styles[ $key ] ?? null, $device, $exists );
			$value  = self::css_value( $value );
			if ( $exists && '' !== $value ) {
				$parts[] = $spec[0] . '(' . $value . $spec[1] . ')';
			}
		}

		$scale3d        = array();
		$has_scale3d    = false;
		foreach ( array( 'scale3DX', 'scale3DY', 'scale3DZ' ) as $key ) {
			$exists   = false;
			$value    = self::device_value( $styles[ $key ] ?? null, $device, $exists );
			$has_scale3d = $has_scale3d || $exists;
			$scale3d[] = $exists && '' !== self::css_value( $value ) ? self::css_value( $value ) : '1';
		}
		if ( $has_scale3d ) {
			$parts[] = 'scale3d(' . implode( ', ', $scale3d ) . ')';
		}
		if ( ! empty( $parts ) ) {
			$out['transform'] = implode( ' ', $parts );
		}

		$exists = false;
		$origin = self::device_value( $styles['transformOrigin'] ?? null, $device, $exists );
		$origin = self::css_value( $origin );
		if ( $exists && '' !== $origin ) {
			if ( 'custom' === $origin ) {
				$x_exists = false;
				$y_exists = false;
				$x = self::device_value( $styles['transformOriginX'] ?? null, $device, $x_exists );
				$y = self::device_value( $styles['transformOriginY'] ?? null, $device, $y_exists );
				$x = self::css_value( $x );
				$y = self::css_value( $y );
				if ( $x_exists || $y_exists ) {
					$out['transform-origin'] = ( '' !== $x ? $x : 'center' ) . ' ' . ( '' !== $y ? $y : 'center' );
				}
			} else {
				$out['transform-origin'] = $origin;
			}
		}
	}

	/**
	 * @param array<string, string> $out
	 * @param array<string, mixed>  $styles
	 */
	private static function append_transition_declaration( array &$out, array $styles, string $device ): void {
		$duration_exists = false;
		$delay_exists    = false;
		$duration = self::device_value( $styles['transitionDuration'] ?? null, $device, $duration_exists );
		$delay    = self::device_value( $styles['transitionDelay'] ?? null, $device, $delay_exists );
		if ( ! $duration_exists && ! $delay_exists ) {
			return;
		}

		$property_exists = false;
		$timing_exists   = false;
		$property = self::device_value( $styles['transitionProperty'] ?? null, $device, $property_exists );
		$timing   = self::device_value( $styles['transitionTimingFunction'] ?? null, $device, $timing_exists );

		$property = self::css_value( $property );
		$duration = self::css_value( $duration );
		$timing   = self::css_value( $timing );
		$delay    = self::css_value( $delay );

		$out['transition'] =
			( '' !== $property ? $property : 'all' ) . ' ' .
			( '' !== $duration ? $duration : '0.2' ) . 's ' .
			( '' !== $timing ? $timing : 'ease' ) . ' ' .
			( '' !== $delay ? $delay : '0' ) . 's';
	}

	public static function normalize_slug( string $value ): string {
		$value = strtolower( trim( $value ) );
		$value = str_replace( ' ', '-', $value );
		$value = preg_replace( '/[^a-z0-9_-]/', '', $value );

		if ( ! is_string( $value ) || ! preg_match( '/^[a-z_][a-z0-9_-]*$/', $value ) ) {
			return '';
		}

		return $value;
	}

	/**
	 * True when the selector targets this class (root, pseudo, or descendant).
	 */
	public static function selector_is_scoped( string $selector, string $slug ): bool {
		$selector = preg_replace( '/\s+/', ' ', trim( $selector ) );
		if ( '' === $selector ) {
			return false;
		}

		// Must begin with .slug as a whole class token.
		$pattern = '/^\.' . preg_quote( $slug, '/' ) . '(?![a-zA-Z0-9_-])/';
		return (bool) preg_match( $pattern, $selector );
	}

	private static function is_exact_root( string $selector, string $slug ): bool {
		$selector = preg_replace( '/\s+/', ' ', trim( $selector ) );
		return $selector === '.' . $slug;
	}

	private static function selector_to_token( string $selector, string $slug ): string {
		$root = '.' . $slug;
		if ( 0 === strpos( $selector, $root ) ) {
			return self::SELECTOR_TOKEN . substr( $selector, strlen( $root ) );
		}
		return $selector;
	}

	private static function rewrite_selectors_in_css( string $css, string $slug ): string {
		// Replace .slug as a class token with {{SELECTOR}}.
		return (string) preg_replace(
			'/\.' . preg_quote( $slug, '/' ) . '(?![a-zA-Z0-9_-])/',
			self::SELECTOR_TOKEN,
			$css
		);
	}

	/**
	 * @param array<string, string> $declarations
	 */
	private static function rule_to_css( string $selector, array $declarations ): string {
		$parts = array();
		foreach ( $declarations as $property => $value ) {
			$parts[] = $property . ': ' . $value;
		}
		if ( empty( $parts ) ) {
			return '';
		}
		return $selector . ' { ' . implode( '; ', $parts ) . '; }';
	}

	/**
	 * @param array<string, string[]> $custom_by_device
	 */
	private static function assemble_custom_css( array $custom_by_device ): string {
		$chunks = array();

		if ( ! empty( $custom_by_device['Desktop'] ) ) {
			$chunks[] = implode( "\n", array_filter( $custom_by_device['Desktop'] ) );
		}
		if ( ! empty( $custom_by_device['Tablet'] ) ) {
			$inner    = implode( ' ', array_filter( $custom_by_device['Tablet'] ) );
			$chunks[] = '@media (max-width: 1024px) { ' . $inner . ' }';
		}
		if ( ! empty( $custom_by_device['Mobile'] ) ) {
			$inner    = implode( ' ', array_filter( $custom_by_device['Mobile'] ) );
			$chunks[] = '@media (max-width: 768px) { ' . $inner . ' }';
		}

		return trim( implode( "\n", array_filter( $chunks ) ) );
	}

	private static function list_unmapped_from_custom( string $custom_css ): array {
		$custom_css = trim( $custom_css );
		if ( '' === $custom_css ) {
			return array();
		}
		// One entry so callers can see leftovers went to customCss.
		return array( 'customCss' );
	}

	private static function normalize_output_css( string $css, string $slug ): string {
		// Keep AI CSS largely intact; ensure {{SELECTOR}} is expanded for meta.
		return trim( str_replace( self::SELECTOR_TOKEN, '.' . $slug, $css ) );
	}

	private static function is_background_property( string $property ): bool {
		return in_array(
			$property,
			array(
				'background',
				'background-color',
				'background-image',
				'background-size',
				'background-position',
				'background-repeat',
				'background-attachment',
				'background-blend-mode',
			),
			true
		);
	}

	/**
	 * @param array<string, mixed> $content
	 */
	private static function apply_root_declaration( array &$content, string $property, string $value, string $device ): bool {
		$value = trim( $value );

		// Structured Class Manager controls cannot express !important — keep the
		// full declaration (including !important) in this node's customCss.
		if ( preg_match( '/!important\s*$/i', $value ) ) {
			return false;
		}

		switch ( $property ) {
			case 'padding':
			case 'margin':
				$spacing = Codecs::spacing( $value );
				if ( ! $spacing ) {
					return false;
				}
				Codecs::set_responsive( $content, $property, $device, $spacing );
				return true;

			case 'padding-top':
			case 'padding-right':
			case 'padding-bottom':
			case 'padding-left':
				Codecs::set_spacing_side( $content, 'padding', $device, substr( $property, 8 ), $value );
				return true;

			case 'margin-top':
			case 'margin-right':
			case 'margin-bottom':
			case 'margin-left':
				Codecs::set_spacing_side( $content, 'margin', $device, substr( $property, 7 ), $value );
				return true;

			case 'border-radius':
				Codecs::set_responsive( $content, 'borderRadius', $device, $value );
				return true;

			case 'border':
			case 'border-top':
			case 'border-right':
			case 'border-bottom':
			case 'border-left':
				$side   = 'border' === $property ? null : substr( $property, 7 );
				$border = Codecs::merge_border( $content['border'] ?? null, $device, $value, $side );
				if ( ! $border ) {
					return false;
				}
				$content['border'] = $border['value'];
				return true;

			case 'border-width':
			case 'border-style':
			case 'border-color':
				// Class Manager's structured Border control only emits color/style
				// when it also has a width. Preserve standalone CSS longhands in
				// this node's customCss instead of silently dropping them.
				if (
					in_array( $property, array( 'border-style', 'border-color' ), true )
					&& empty( $content['border'] )
				) {
					return false;
				}
				$part   = substr( $property, 7 );
				$border = Codecs::merge_border_part( $content['border'] ?? null, $device, $part, $value, null );
				if ( ! $border ) {
					return false;
				}
				$content['border'] = $border['value'];
				return true;

			case 'box-shadow':
				$shadow = Codecs::box_shadow( $value );
				if ( ! $shadow || 'Desktop' !== $device ) {
					return false;
				}
				$decoded = json_decode( $shadow, true );
				if ( ! is_array( $decoded ) ) {
					return false;
				}
				// Class Manager stores an array (and uses inset as "" when not set).
				foreach ( $decoded as &$layer ) {
					if ( is_array( $layer ) && ! array_key_exists( 'inset', $layer ) ) {
						$layer['inset'] = '';
					}
					if ( is_array( $layer ) && true === ( $layer['inset'] ?? null ) ) {
						$layer['inset'] = 'inset';
					}
				}
				unset( $layer );
				$content['boxShadow'] = $decoded;
				return true;

			case 'text-shadow':
				$shadow = Codecs::text_shadow( $value );
				if ( ! $shadow || 'Desktop' !== $device ) {
					return false;
				}
				$decoded = json_decode( $shadow, true );
				if ( ! is_array( $decoded ) ) {
					return false;
				}
				$content['textShadow'] = $decoded;
				return true;

			case 'filter':
				$filters = Codecs::css_filters( $value );
				if ( ! $filters || 'Desktop' !== $device ) {
					return false;
				}
				$decoded = is_string( $filters ) ? json_decode( $filters, true ) : $filters;
				if ( ! is_array( $decoded ) ) {
					return false;
				}
				$content['filters'] = $decoded;
				return true;

			case 'backdrop-filter':
				$filters = Codecs::css_filters( $value );
				if ( ! $filters || 'Desktop' !== $device ) {
					return false;
				}
				$decoded = is_string( $filters ) ? json_decode( $filters, true ) : $filters;
				if ( ! is_array( $decoded ) ) {
					return false;
				}
				$content['backgroundFilters'] = $decoded;
				return true;

			case 'color':
				if ( 'Desktop' !== $device ) {
					return false;
				}
				$content['color'] = $value;
				return true;

			case 'font-family':
				if ( 'Desktop' !== $device ) {
					return false;
				}
				$content['fontFamily'] = array( 'value' => $value );
				return true;

			case 'font-size':
			case 'line-height':
			case 'letter-spacing':
			case 'word-spacing':
			case 'width':
			case 'height':
			case 'min-width':
			case 'min-height':
			case 'max-width':
			case 'max-height':
			case 'top':
			case 'right':
			case 'bottom':
			case 'left':
			case 'column-gap':
			case 'row-gap':
			case 'perspective':
				$attr = self::length_attr( $property );
				if ( ! $attr ) {
					return false;
				}
				Codecs::set_responsive( $content, $attr, $device, $value );
				return true;

			case 'z-index':
			case 'opacity':
			case 'column-count':
			case 'flex-grow':
			case 'flex-shrink':
			case 'grid-column-start':
			case 'grid-column-end':
			case 'grid-row-start':
			case 'grid-row-end':
				if ( self::apply_grid_span_token( $content, $property, $value, $device ) ) {
					return true;
				}
				$attr = self::camel( $property );
				if ( 'flex-grow' === $property ) {
					$attr = 'flexGrow';
				} elseif ( 'flex-shrink' === $property ) {
					$attr = 'flexShrink';
				}
				Codecs::set_responsive( $content, $attr, $device, self::unitless_number( $value ) );
				return true;

			case 'order':
				return self::apply_flex_order( $content, $value, $device );

			case 'grid-column':
			case 'grid-row':
				return self::apply_grid_line_shorthand( $content, $property, $value, $device );

			case 'display':
			case 'flex-direction':
			case 'flex-wrap':
			case 'justify-content':
			case 'align-items':
			case 'align-self':
			case 'justify-self':
			case 'overflow':
			case 'position':
			case 'object-fit':
			case 'aspect-ratio':
			case 'text-align':
			case 'text-decoration':
			case 'text-transform':
			case 'font-style':
			case 'direction':
			case 'text-overflow':
			case 'mix-blend-mode':
			case 'background-clip':
				$attr = self::option_attr( $property );
				if ( ! $attr ) {
					return false;
				}
				$option = self::option_value( $property, $value );
				Codecs::set_responsive( $content, $attr, $device, $option );
				return true;

			case 'font-weight':
				$option = self::option_value( 'font-weight', $value );
				Codecs::set_responsive( $content, 'fontWeight', $device, $option );
				return true;

			case 'transition':
				return self::apply_transition_shorthand( $content, $value, $device );

			case 'transition-property':
				Codecs::set_responsive( $content, 'transitionProperty', $device, $value );
				return true;

			case 'transition-duration':
				$seconds = Codecs::transition_seconds( $value );
				if ( null === $seconds ) {
					return false;
				}
				Codecs::set_responsive( $content, 'transitionDuration', $device, $seconds );
				return true;

			case 'transition-delay':
				$seconds = Codecs::transition_seconds( $value );
				if ( null === $seconds ) {
					return false;
				}
				Codecs::set_responsive( $content, 'transitionDelay', $device, $seconds );
				return true;

			case 'transition-timing-function':
				$option = self::option_value( 'transition-timing-function', $value );
				Codecs::set_responsive( $content, 'transitionTimingFunction', $device, $option );
				return true;

			case 'transform':
				return self::apply_transform_shorthand( $content, $value, $device );

			case 'transform-origin':
				return self::apply_transform_origin( $content, $value, $device );

			default:
				return false;
		}
	}

	/**
	 * @param array<string, mixed> $content
	 */
	private static function apply_transition_shorthand( array &$content, string $value, string $device ): bool {
		$seconds = Codecs::transition_seconds( $value );
		if ( null === $seconds ) {
			return false;
		}

		// property duration timing delay — best-effort parse.
		$property = 'all';
		$timing   = 'ease';
		if ( preg_match( '/^([a-z0-9_,\s-]+?)\s+[\d.]+m?s/i', $value, $match ) ) {
			$candidate = trim( $match[1] );
			if ( '' !== $candidate && ! preg_match( '/^(ease|linear)/i', $candidate ) ) {
				$property = $candidate;
			}
		}
		if ( preg_match( '/\b(ease(?:-in-out|-in|-out)?|linear)\b/i', $value, $match ) ) {
			$timing = strtolower( $match[1] );
		}

		Codecs::set_responsive( $content, 'transitionProperty', $device, $property );
		Codecs::set_responsive( $content, 'transitionDuration', $device, $seconds );
		Codecs::set_responsive( $content, 'transitionTimingFunction', $device, self::option_value( 'transition-timing-function', $timing ) );
		return true;
	}

	/**
	 * @param array<string, mixed> $content
	 */
	private static function apply_transform_shorthand( array &$content, string $value, string $device ): bool {
		$matched = false;

		if ( preg_match_all( '/translateX\(\s*([^)]+)\s*\)/i', $value, $m ) ) {
			Codecs::set_responsive( $content, 'translateX', $device, trim( $m[1][0] ) );
			$matched = true;
		}
		if ( preg_match_all( '/translateY\(\s*([^)]+)\s*\)/i', $value, $m ) ) {
			Codecs::set_responsive( $content, 'translateY', $device, trim( $m[1][0] ) );
			$matched = true;
		}
		if ( preg_match_all( '/translateZ\(\s*([^)]+)\s*\)/i', $value, $m ) ) {
			Codecs::set_responsive( $content, 'translateZ', $device, trim( $m[1][0] ) );
			$matched = true;
		}
		if ( preg_match_all( '/\brotate\(\s*([^)]+)\s*\)/i', $value, $m ) ) {
			Codecs::set_responsive( $content, 'rotate', $device, self::strip_deg( $m[1][0] ) );
			$matched = true;
		}
		if ( preg_match_all( '/rotateX\(\s*([^)]+)\s*\)/i', $value, $m ) ) {
			Codecs::set_responsive( $content, 'rotateX', $device, self::strip_deg( $m[1][0] ) );
			$matched = true;
		}
		if ( preg_match_all( '/rotateY\(\s*([^)]+)\s*\)/i', $value, $m ) ) {
			Codecs::set_responsive( $content, 'rotateY', $device, self::strip_deg( $m[1][0] ) );
			$matched = true;
		}
		if ( preg_match_all( '/rotateZ\(\s*([^)]+)\s*\)/i', $value, $m ) ) {
			Codecs::set_responsive( $content, 'rotateZ', $device, self::strip_deg( $m[1][0] ) );
			$matched = true;
		}
		if ( preg_match_all( '/\bscale\(\s*([^)]+)\s*\)/i', $value, $m ) ) {
			Codecs::set_responsive( $content, 'scale', $device, trim( $m[1][0] ) );
			$matched = true;
		}
		if ( preg_match_all( '/skewX\(\s*([^)]+)\s*\)/i', $value, $m ) ) {
			Codecs::set_responsive( $content, 'skewX', $device, self::strip_deg( $m[1][0] ) );
			$matched = true;
		}
		if ( preg_match_all( '/skewY\(\s*([^)]+)\s*\)/i', $value, $m ) ) {
			Codecs::set_responsive( $content, 'skewY', $device, self::strip_deg( $m[1][0] ) );
			$matched = true;
		}

		return $matched;
	}

	/**
	 * @param array<string, mixed> $content
	 */
	private static function apply_transform_origin( array &$content, string $value, string $device ): bool {
		$lower  = strtolower( trim( $value ) );
		$known  = array(
			'top left', 'top center', 'top right',
			'center left', 'center', 'center center', 'center right',
			'bottom left', 'bottom center', 'bottom right',
		);
		if ( 'center' === $lower ) {
			$lower = 'center center';
		}
		if ( in_array( $lower, $known, true ) ) {
			Codecs::set_responsive(
				$content,
				'transformOrigin',
				$device,
				array(
					'label' => ucwords( $lower ),
					'value' => $lower,
				)
			);
			return true;
		}

		$parts = preg_split( '/\s+/', trim( $value ) );
		if ( count( $parts ) >= 2 ) {
			Codecs::set_responsive(
				$content,
				'transformOrigin',
				$device,
				array(
					'label' => 'Custom',
					'value' => 'custom',
				)
			);
			Codecs::set_responsive( $content, 'transformOriginX', $device, $parts[0] );
			Codecs::set_responsive( $content, 'transformOriginY', $device, $parts[1] );
			return true;
		}

		return false;
	}

	private static function strip_deg( string $value ): string {
		$value = trim( $value );
		return preg_replace( '/deg$/i', '', $value );
	}

	private static function length_attr( string $property ): ?string {
		$map = array(
			'font-size'      => 'fontSize',
			'line-height'    => 'lineHeight',
			'letter-spacing' => 'letterSpacing',
			'word-spacing'   => 'wordSpacing',
			'width'          => 'width',
			'height'         => 'height',
			'min-width'      => 'minWidth',
			'min-height'     => 'minHeight',
			'max-width'      => 'maxWidth',
			'max-height'     => 'maxHeight',
			'top'            => 'top',
			'right'          => 'right',
			'bottom'         => 'bottom',
			'left'           => 'left',
			'column-gap'     => 'columnGap',
			'row-gap'        => 'rowGap',
			'perspective'    => 'perspective',
		);
		return $map[ $property ] ?? null;
	}

	private static function option_attr( string $property ): ?string {
		$map = array(
			'display'          => 'display',
			'flex-direction'   => 'flexDirection',
			'flex-wrap'        => 'flexWrap',
			'justify-content'  => 'justifyContent',
			'align-items'      => 'alignItems',
			'align-self'       => 'alignSelf',
			'justify-self'     => 'justifySelf',
			'overflow'         => 'overflow',
			'position'         => 'position',
			'object-fit'       => 'objectFit',
			'aspect-ratio'     => 'aspectRatio',
			'text-align'       => 'textAlign',
			'text-decoration'  => 'textDecoration',
			'text-transform'   => 'textTransform',
			'font-style'       => 'fontStyle',
			'direction'        => 'direction',
			'text-overflow'    => 'textOverflow',
			'mix-blend-mode'   => 'blendMode',
			'background-clip'  => 'backgroundClip',
		);
		return $map[ $property ] ?? null;
	}

	private static function unitless_number( string $value ) {
		$trimmed = trim( $value );
		if ( is_numeric( $trimmed ) ) {
			return 0 + $trimmed;
		}
		if ( preg_match( '/^-?[\d.]+/', $trimmed, $match ) ) {
			return 0 + $match[0];
		}
		return $trimmed;
	}

	/**
	 * @param array<string, mixed> $content
	 */
	private static function apply_flex_order( array &$content, string $value, string $device ): bool {
		$number = self::unitless_number( $value );
		if ( -99999 === (int) $number || '-99999' === (string) $number ) {
			Codecs::set_responsive(
				$content,
				'flexOrder',
				$device,
				array(
					'label' => 'Start',
					'value' => '-99999',
				)
			);
			return true;
		}
		if ( 99999 === (int) $number || '99999' === (string) $number ) {
			Codecs::set_responsive(
				$content,
				'flexOrder',
				$device,
				array(
					'label' => 'End',
					'value' => '99999',
				)
			);
			return true;
		}

		Codecs::set_responsive(
			$content,
			'flexOrder',
			$device,
			array(
				'label' => 'Custom',
				'value' => 'custom',
			)
		);
		Codecs::set_responsive( $content, 'flexCustomOrder', $device, $number );
		return true;
	}

	private static function apply_grid_span_token( array &$content, string $property, string $value, string $device ): bool {
		if ( ! preg_match( '/^span\s+(\d+)/i', trim( $value ), $match ) ) {
			return false;
		}
		$prefix = str_starts_with( $property, 'grid-column' ) ? 'gridColumn' : 'gridRow';
		if ( ! str_starts_with( $property, 'grid-' ) ) {
			return false;
		}
		Codecs::set_responsive( $content, $prefix . 'Span', $device, (int) $match[1] );
		return true;
	}

	/**
	 * @param array<string, mixed> $content
	 */
	private static function apply_grid_line_shorthand( array &$content, string $property, string $value, string $device ): bool {
		$parts  = preg_split( '/\s*\/\s*/', trim( $value ) );
		$start  = isset( $parts[0] ) ? trim( $parts[0] ) : '';
		$end    = isset( $parts[1] ) ? trim( $parts[1] ) : '';
		$prefix = 'grid-column' === $property ? 'gridColumn' : 'gridRow';
		$ok     = false;

		if ( self::apply_grid_span_token( $content, $property, $start, $device ) ) {
			$ok = true;
		} elseif ( '' !== $start && 'auto' !== strtolower( $start ) ) {
			Codecs::set_responsive( $content, $prefix . 'Start', $device, self::unitless_number( $start ) );
			$ok = true;
		}

		if ( '' !== $end && self::apply_grid_span_token( $content, $property, $end, $device ) ) {
			$ok = true;
		} elseif ( '' !== $end && 'auto' !== strtolower( $end ) ) {
			Codecs::set_responsive( $content, $prefix . 'End', $device, self::unitless_number( $end ) );
			$ok = true;
		}

		return $ok;
	}

	/**
	 * @param array<string, string> $out
	 * @param array<string, mixed>  $styles
	 */
	private static function compile_grid_span( array &$out, array $styles, string $device, string $prefix, string $property ): void {
		$span_exists = false;
		$span        = self::css_value( self::device_value( $styles[ $prefix . 'Span' ] ?? null, $device, $span_exists ) );
		if ( ! $span_exists || '' === $span ) {
			return;
		}
		$span = (string) (int) self::unitless_number( $span );
		if ( '0' === $span ) {
			return;
		}

		$start_exists = false;
		$start        = self::css_value( self::device_value( $styles[ $prefix . 'Start' ] ?? null, $device, $start_exists ) );
		$start_num    = self::unitless_number( $start );
		$start        = is_numeric( $start_num ) ? (string) $start_num : '';
		unset( $out[ $property . '-start' ], $out[ $property . '-end' ] );
		$out[ $property ] = ( $start_exists && '' !== $start )
			? $start . ' / span ' . $span
			: 'span ' . $span;
	}

	private static function camel( string $property ): string {
		return lcfirst( str_replace( ' ', '', ucwords( str_replace( '-', ' ', $property ) ) ) );
	}

	/**
	 * @return array{label: string, value: string}
	 */
	private static function option_value( string $property, string $value ): array {
		$value = trim( $value );
		$from  = Codecs::option( $property, $value );
		if ( $from ) {
			return $from;
		}

		$labels = array(
			'display'         => array(
				'block' => 'Block', 'inline-block' => 'Inline Block', 'flex' => 'Flex',
				'inline-flex' => 'Inline Flex', 'grid' => 'Grid', 'inline-grid' => 'Inline Grid', 'none' => 'None',
			),
			'flex-wrap'       => array( 'nowrap' => 'No Wrap', 'wrap' => 'Wrap', 'wrap-reverse' => 'Wrap Reverse' ),
			'align-items'     => array( 'baseline' => 'Baseline', 'stretch' => 'Stretch' ),
			'align-self'      => array(
				'start' => 'Start', 'center' => 'Center', 'end' => 'End', 'stretch' => 'Stretch',
				'flex-start' => 'Start', 'flex-end' => 'End',
			),
			'justify-self'    => array(
				'start' => 'Start', 'center' => 'Center', 'end' => 'End', 'stretch' => 'Stretch',
				'flex-start' => 'Start', 'flex-end' => 'End',
			),
			'text-align'      => array(
				'left' => 'Left', 'center' => 'Center', 'right' => 'Right',
				'justify' => 'Justify', 'start' => 'Start', 'end' => 'End',
			),
			'text-decoration' => array(
				'none' => 'None', 'underline' => 'Underline', 'overline' => 'Overline', 'line-through' => 'Line Through',
			),
			'text-transform'  => array(
				'none' => 'None', 'uppercase' => 'Uppercase', 'lowercase' => 'Lowercase', 'capitalize' => 'Capitalize',
			),
			'font-style'      => array( 'normal' => 'Normal', 'italic' => 'Italic', 'oblique' => 'Oblique' ),
			'direction'       => array( 'ltr' => 'LTR', 'rtl' => 'RTL' ),
			'text-overflow'   => array( 'clip' => 'Clip', 'ellipsis' => 'Ellipsis' ),
			'background-clip' => array(
				'border-box' => 'Border Box', 'padding-box' => 'Padding Box',
				'content-box' => 'Content Box', 'text' => 'Text',
			),
			'aspect-ratio'    => array(
				'auto' => 'Auto', '1 / 1' => '1 / 1', '4 / 3' => '4 / 3', '3 / 2' => '3 / 2',
				'16 / 9' => '16 / 9', '21 / 9' => '21 / 9',
			),
			'transition-timing-function' => array(
				'ease' => 'Ease', 'linear' => 'Linear', 'ease-in' => 'Ease In',
				'ease-out' => 'Ease Out', 'ease-in-out' => 'Ease In Out',
			),
			'font-weight'     => array(
				'100' => '100', '200' => '200', '300' => '300', '400' => '400', '500' => '500',
				'600' => '600', '700' => '700', '800' => '800', '900' => '900',
				'normal' => '400', 'bold' => '700',
			),
			'mix-blend-mode'  => array(),
		);

		$key = strtolower( $value );
		if ( in_array( $property, array( 'align-self', 'justify-self' ), true ) ) {
			if ( 'flex-start' === $key ) {
				$key = 'start';
			} elseif ( 'flex-end' === $key ) {
				$key = 'end';
			}
		}

		if ( 'font-weight' === $property && isset( $labels['font-weight'][ $key ] ) ) {
			$mapped = $labels['font-weight'][ $key ];
			return array( 'label' => (string) $mapped, 'value' => (string) $mapped );
		}

		if ( isset( $labels[ $property ][ $key ] ) ) {
			return array( 'label' => $labels[ $property ][ $key ], 'value' => $key );
		}

		// aspect-ratio often written as 16/9 without spaces.
		if ( 'aspect-ratio' === $property ) {
			$normalized = preg_replace( '/\s*\/\s*/', ' / ', $key );
			if ( isset( $labels['aspect-ratio'][ $normalized ] ) ) {
				return array( 'label' => $labels['aspect-ratio'][ $normalized ], 'value' => $normalized );
			}
		}

		return array(
			'label' => ucwords( str_replace( '-', ' ', $value ) ),
			'value' => $value,
		);
	}
}
