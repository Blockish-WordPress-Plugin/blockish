<?php

namespace Blockish\Extensions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ClassManager {
	use \Blockish\Traits\SingletonTrait;

	private const CSS_META_KEY = 'blockishClassManagerStyles';
	private $used_post_ids = array();
	private $styles_enqueued = false;

	private function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_used_class_styles' ), 9 );
		add_action( 'before_delete_post', array( $this, 'delete_child_classes_on_parent_delete' ) );
	}

	public function enqueue_used_class_styles() {
		if ( $this->styles_enqueued ) {
			return;
		}

		$this->collect_used_post_ids_from_current_post();
		if ( empty( $this->used_post_ids ) ) {
			return;
		}

		$styles = $this->get_styles_for_classes();
		if ( '' === $styles ) {
			return;
		}

		$this->enqueue_inline_styles( $styles, false );
	}

	public function register_post_type() {
		register_post_type(
			'blockish-classes',
			array(
				'label'                 => __( 'Class Manager', 'blockish' ),
				'public'                => true,
				'show_ui'               => false,
				'show_in_menu'          => false,
				'show_in_admin_bar'     => false,
				'show_in_nav_menus'     => false,
				'exclude_from_search'   => true,
				'publicly_queryable'    => false,
				'hierarchical'          => true,
				'show_in_rest'          => true,
				'rest_base'             => 'blockish-classes',
				'rest_controller_class' => 'WP_REST_Posts_Controller',
				'supports'              => array( 'title', 'editor', 'page-attributes', 'custom-fields' ),
				'capability_type'       => 'post',
				'map_meta_cap'          => true,
				'rewrite'               => false,
				'query_var'             => false,
			)
		);

		register_post_meta(
			'blockish-classes',
			self::CSS_META_KEY,
			array(
				'type'              => 'string',
				'single'            => true,
				'default'           => '',
				'show_in_rest'      => true,
				'sanitize_callback' => 'wp_strip_all_tags',
			)
		);
	}

	public function render_block( $block_content, $block ) {
		if ( empty( $block['blockName'] ) || ! $this->is_supported_block_name( $block['blockName'] ) ) {
			return $block_content;
		}

		$class_items       = $block['attrs']['classManager'] ?? array();
		$subselector_items = $block['attrs']['classManagerSubselector'] ?? array();

		if ( ! is_array( $class_items ) ) {
			$class_items = array();
		}

		if ( ! is_array( $subselector_items ) ) {
			$subselector_items = array();
		}

		if ( empty( $class_items ) ) {
			return $block_content;
		}

		$tag_processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( ! $tag_processor->next_tag() ) {
			return $block_content;
		}

		$requested_ids = array();
		foreach ( $class_items as $class_item ) {
			if ( ! is_array( $class_item ) ) {
				continue;
			}
			$class_id = absint( $class_item['id'] ?? 0 );
			if ( $class_id > 0 ) {
				$requested_ids[] = $class_id;
			}
		}
		foreach ( $subselector_items as $selector_item ) {
			if ( ! is_array( $selector_item ) ) {
				continue;
			}
			$selector_id = absint( $selector_item['id'] ?? 0 );
			$parent_id   = absint( $selector_item['parent'] ?? 0 );
			if ( $selector_id > 0 ) {
				$requested_ids[] = $selector_id;
			}
			if ( $parent_id > 0 ) {
				$requested_ids[] = $parent_id;
			}
		}

		$requested_ids = array_values( array_filter( array_unique( array_map( 'absint', $requested_ids ) ) ) );
		if ( empty( $requested_ids ) ) {
			return $block_content;
		}

		$existing_posts = get_posts(
			array(
				'post_type'      => 'blockish-classes',
				'post_status'    => 'publish',
				'post__in'       => $requested_ids,
				'posts_per_page' => -1,
			)
		);
		if ( empty( $existing_posts ) ) {
			return $block_content;
		}

		$existing_by_id = array();
		foreach ( $existing_posts as $existing_post ) {
			$existing_by_id[ (int) $existing_post->ID ] = $existing_post;
		}

		$selected_parent_ids = array();

		foreach ( $class_items as $class_item ) {
			if ( ! is_array( $class_item ) ) {
				continue;
			}

			$class_id = absint( $class_item['id'] ?? 0 );
			if ( $class_id <= 0 || empty( $existing_by_id[ $class_id ] ) ) {
				continue;
			}

			$slug = $this->normalize_class_slug( $existing_by_id[ $class_id ]->post_title );
			if ( '' === $slug ) {
				continue;
			}

			$tag_processor->add_class( $slug );
			$this->used_post_ids[ $class_id ] = true;
			$selected_parent_ids[ $class_id ] = true;
		}

		if ( ! empty( $subselector_items ) && ! empty( $selected_parent_ids ) ) {
			foreach ( $subselector_items as $selector_item ) {
				if ( ! is_array( $selector_item ) ) {
					continue;
				}

				$selector_id = absint( $selector_item['id'] ?? 0 );
				$parent_id   = absint( $selector_item['parent'] ?? 0 );
				if (
					$selector_id <= 0 ||
					$parent_id <= 0 ||
					empty( $selected_parent_ids[ $parent_id ] ) ||
					empty( $existing_by_id[ $selector_id ] ) ||
					empty( $existing_by_id[ $parent_id ] )
				) {
					continue;
				}

				$tag_processor->add_class( 'blockish-cm-' . $selector_id );
				$this->used_post_ids[ $selector_id ] = true;
				$this->used_post_ids[ $parent_id ]   = true;
			}
		}

		return $tag_processor->get_updated_html();
	}

	public function print_used_class_styles() {
		if ( $this->styles_enqueued ) {
			return;
		}

		if ( empty( $this->used_post_ids ) ) {
			return;
		}

		$styles = $this->get_styles_for_classes();


		if ( '' === $styles ) {
			return;
		}
		$this->enqueue_inline_styles( $styles, true );
	}

	private function collect_used_post_ids_from_current_post() {
		$post_id = get_queried_object_id();
		if ( ! $post_id ) {
			return;
		}

		$post = get_post( $post_id );
		if ( ! $post || ! is_string( $post->post_content ) || '' === $post->post_content ) {
			return;
		}

		$blocks = parse_blocks( $post->post_content );
		if ( empty( $blocks ) ) {
			return;
		}

		$this->collect_used_post_ids_from_blocks( $blocks );
	}

	private function collect_used_post_ids_from_blocks( $blocks ) {
		if ( ! is_array( $blocks ) ) {
			return;
		}

		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			$attrs = $block['attrs'] ?? array();
			$class_items = $attrs['classManager'] ?? array();
			$subselector_items = $attrs['classManagerSubselector'] ?? array();

			if ( is_array( $class_items ) ) {
				foreach ( $class_items as $class_item ) {
					if ( ! is_array( $class_item ) ) {
						continue;
					}
					$class_id = absint( $class_item['id'] ?? 0 );
					if ( $class_id > 0 ) {
						$this->used_post_ids[ $class_id ] = true;
					}
				}
			}

			if ( is_array( $subselector_items ) ) {
				foreach ( $subselector_items as $selector_item ) {
					if ( ! is_array( $selector_item ) ) {
						continue;
					}
					$selector_id = absint( $selector_item['id'] ?? 0 );
					$parent_id   = absint( $selector_item['parent'] ?? 0 );
					if ( $selector_id > 0 ) {
						$this->used_post_ids[ $selector_id ] = true;
					}
					if ( $parent_id > 0 ) {
						$this->used_post_ids[ $parent_id ] = true;
					}
				}
			}

			$inner_blocks = $block['innerBlocks'] ?? array();
			if ( ! empty( $inner_blocks ) ) {
				$this->collect_used_post_ids_from_blocks( $inner_blocks );
			}
		}
	}

	private function enqueue_inline_styles( $styles, $print_now = false ) {
		if ( '' === $styles ) {
			return;
		}

		$handle = 'blockish-class-manager-inline';
		if ( ! wp_style_is( $handle, 'registered' ) ) {
			wp_register_style( $handle, false, array(), null );
		}
		wp_enqueue_style( $handle );
		wp_add_inline_style( $handle, $styles );
		if ( $print_now ) {
			wp_print_styles( array( $handle ) );
		}
		$this->styles_enqueued = true;
	}

	private function get_styles_for_classes() {
		$post_ids = array_values( array_filter( array_map( 'absint', array_keys( $this->used_post_ids ) ) ) );
		if ( empty( $post_ids ) ) {
			return '';
		}

		$css = '';
		foreach ( $post_ids as $post_id ) {
			$meta_css = trim( (string) get_post_meta( $post_id, self::CSS_META_KEY, true ) );
			if ( '' === $meta_css ) {
				continue;
			}
			$css .= $meta_css;
		}

		return $css;
	}

	public function delete_child_classes_on_parent_delete( $post_id ) {
		if ( 'blockish-classes' !== get_post_type( $post_id ) ) {
			return;
		}

		$children = get_posts(
			array(
				'post_type'   => 'blockish-classes',
				'post_parent' => $post_id,
				'numberposts' => -1,
				'fields'      => 'ids',
			)
		);

		if ( empty( $children ) ) {
			return;
		}

		foreach ( $children as $child_id ) {
			wp_delete_post( (int) $child_id, true );
		}
	}

	/**
	 * @param mixed $class_item
	 * @return array{slug: string, id: int}
	 */
	private function normalize_class_item( $class_item ) {
		if ( is_string( $class_item ) ) {
			return array(
				'slug' => $this->normalize_class_slug( $class_item ),
				'id'   => 0,
			);
		}

		if ( ! is_array( $class_item ) ) {
			return array(
				'slug' => '',
				'id'   => 0,
			);
		}

		$title = '';
		if ( isset( $class_item['title'] ) && is_string( $class_item['title'] ) ) {
			$title = $class_item['title'];
		}

		if ( '' === $title && isset( $class_item['slug'] ) && is_string( $class_item['slug'] ) ) {
			$title = $class_item['slug'];
		}

		return array(
			'slug' => $this->normalize_class_slug( $title ),
			'id'   => absint( $class_item['id'] ?? 0 ),
		);
	}

	/**
	 * @param string $block_name
	 * @return bool
	 */
	private function is_supported_block_name( $block_name ) {
		if ( ! is_string( $block_name ) || '' === $block_name ) {
			return false;
		}

		return str_starts_with( $block_name, 'blockish/' );
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
}
