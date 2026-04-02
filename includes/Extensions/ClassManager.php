<?php

namespace Blockish\Extensions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ClassManager {
	use \Blockish\Traits\SingletonTrait;

	/**
	 * @var array<string, bool>
	 */
	private $used_classes = array();

	private function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
		add_action( 'wp_footer', array( $this, 'print_used_class_styles' ), 99 );
	}

	public function register_post_type() {
		register_post_type(
			'blockish-class-manager',
			array(
				'label'                 => __( 'Class Manager', 'blockish' ),
				'public'                => false,
				'show_ui'               => false,
				'show_in_menu'          => false,
				'show_in_admin_bar'     => false,
				'show_in_nav_menus'     => false,
				'exclude_from_search'   => true,
				'publicly_queryable'    => false,
				'hierarchical'          => false,
				'show_in_rest'          => true,
				'rest_base'             => 'blockish-class-manager',
				'rest_controller_class' => 'WP_REST_Posts_Controller',
				'supports'              => array( 'title', 'editor' ),
				'capability_type'       => 'post',
				'map_meta_cap'          => true,
				'rewrite'               => false,
				'query_var'             => false,
			)
		);
	}

	public function render_block( $block_content, $block ) {
		if ( empty( $block['blockName'] ) || ! str_starts_with( $block['blockName'], 'blockish/' ) ) {
			return $block_content;
		}

		$classes = $block['attrs']['classManager'] ?? array();
		if ( ! is_array( $classes ) || empty( $classes ) ) {
			return $block_content;
		}

		$processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( ! $processor->next_tag() ) {
			return $block_content;
		}

		foreach ( $classes as $class_slug ) {
			$class_slug = $this->normalize_class_slug( $class_slug );
			if ( empty( $class_slug ) ) {
				continue;
			}

			$processor->add_class( $class_slug );
			$this->used_classes[ $class_slug ] = true;
		}

		return $processor->get_updated_html();
	}

	public function print_used_class_styles() {
		if ( empty( $this->used_classes ) ) {
			return;
		}

		$classes = array_keys( $this->used_classes );
		$styles  = $this->get_styles_for_classes( $classes );

		if ( empty( $styles ) ) {
			return;
		}

		echo '<style id="blockish-class-manager-styles">' . $styles . '</style>'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	}

	/**
	 * @param array<int, string> $classes
	 * @return string
	 */
	private function get_styles_for_classes( $classes ) {
		$posts = get_posts(
			array(
				'post_type'      => 'blockish-class-manager',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
			)
		);

		if ( empty( $posts ) ) {
			return '';
		}

		$lookup = array_fill_keys( $classes, true );
		$css    = '';

		foreach ( $posts as $post ) {
			$slug = $this->normalize_class_slug( $post->post_title );
			if ( empty( $slug ) || ! isset( $lookup[ $slug ] ) ) {
				continue;
			}

			$content = trim( (string) $post->post_content );
			if ( '' === $content ) {
				continue;
			}

			if ( str_contains( $content, '{' ) ) {
				$css .= $content;
				continue;
			}

			$declarations = $this->sanitize_css_declarations( $content );
			if ( '' === $declarations ) {
				continue;
			}

			if ( ! str_ends_with( $declarations, ';' ) ) {
				$declarations .= ';';
			}

			$css .= '.' . $slug . '{' . $declarations . '}';
		}

		return $css;
	}

	private function normalize_class_slug( $value ) {
		$value = strtolower( trim( (string) $value ) );
		$value = str_replace( ' ', '-', $value );
		$value = preg_replace( '/[^a-z0-9_-]/', '', $value );

		if ( ! is_string( $value ) ) {
			return '';
		}

		if ( ! preg_match( '/^[a-z_][a-z0-9_-]*$/', $value ) ) {
			return '';
		}

		return $value;
	}

	private function sanitize_css_declarations( $css ) {
		$css = wp_strip_all_tags( (string) $css );
		$css = str_replace( array( '{', '}' ), '', $css );
		return trim( $css );
	}
}
