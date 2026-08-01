<?php
namespace Blockish\Extensions;

use Blockish\Config\ExtensionList;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Device visibility: hide blocks on Desktop / Tablet / Mobile.
 */
class Visibility {
	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		add_action( 'init', array( $this, 'register_runtime_hooks' ), 20 );
	}

	public function register_runtime_hooks() {
		if ( ! $this->is_extension_enabled() ) {
			return;
		}

		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles_if_used' ), 20 );
	}

	private function is_extension_enabled() {
		$active = ExtensionList::get_instance()->get_list( 'active' );
		return ! empty( $active['visibility'] );
	}

	/**
	 * Frontend CSS for hide-on-* classes.
	 */
	public function enqueue_styles() {
		$handle = 'blockish-extension-visibility-style';
		if ( wp_style_is( $handle, 'registered' ) && ! wp_style_is( $handle, 'enqueued' ) ) {
			wp_enqueue_style( $handle );
		}
	}

	/**
	 * Enqueue frontend CSS only when the queried post (or a referenced pattern)
	 * contains an enabled hideOn setting.
	 */
	public function enqueue_styles_if_used() {
		global $wp_query;

		$posts = isset( $wp_query->posts ) && is_array( $wp_query->posts )
			? $wp_query->posts
			: array();
		if ( empty( $posts ) ) {
			return;
		}

		$seen_post_ids = array();
		foreach ( $posts as $post ) {
			if ( ! $post instanceof \WP_Post || ! is_string( $post->post_content ) || '' === $post->post_content ) {
				continue;
			}

			$seen_post_ids[ (int) $post->ID ] = true;
			if ( $this->blocks_use_visibility( parse_blocks( $post->post_content ), $seen_post_ids ) ) {
				$this->enqueue_styles();
				return;
			}
		}
	}

	/**
	 * Add hide-on-* classes to Blockish blocks.
	 *
	 * @param string $block_content Rendered HTML.
	 * @param array  $block         Parsed block.
	 * @return string
	 */
	public function render_block( $block_content, $block ) {
		if ( empty( $block_content ) || empty( $block['blockName'] ) ) {
			return $block_content;
		}

		if ( ! str_starts_with( $block['blockName'], 'blockish' ) ) {
			return $block_content;
		}

		$hide_on = isset( $block['attrs']['hideOn'] ) && is_array( $block['attrs']['hideOn'] )
			? $block['attrs']['hideOn']
			: array();

		$classes = array();
		if ( ! empty( $hide_on['Desktop'] ) ) {
			$classes[] = 'blockish-hide-on-desktop';
		}
		if ( ! empty( $hide_on['Tablet'] ) ) {
			$classes[] = 'blockish-hide-on-tablet';
		}
		if ( ! empty( $hide_on['Mobile'] ) ) {
			$classes[] = 'blockish-hide-on-mobile';
		}

		if ( empty( $classes ) ) {
			return $block_content;
		}

		/*
		 * Block themes render their full template before wp_head(), so this
		 * catches visibility used in template parts as well as post content.
		 */
		$this->enqueue_styles();

		$processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( ! $processor->next_tag() ) {
			return $block_content;
		}

		$existing = $processor->get_attribute( 'class' );
		$merged   = trim( ( is_string( $existing ) ? $existing : '' ) . ' ' . implode( ' ', $classes ) );
		$processor->set_attribute( 'class', $merged );

		return $processor->get_updated_html();
	}

	/**
	 * Recursively inspect blocks and synced pattern references for hideOn use.
	 *
	 * @param array $blocks        Parsed blocks.
	 * @param array $seen_post_ids Referenced post IDs already inspected.
	 * @return bool
	 */
	private function blocks_use_visibility( $blocks, &$seen_post_ids ) {
		if ( ! is_array( $blocks ) ) {
			return false;
		}

		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			$attrs   = isset( $block['attrs'] ) && is_array( $block['attrs'] ) ? $block['attrs'] : array();
			$hide_on = isset( $attrs['hideOn'] ) && is_array( $attrs['hideOn'] ) ? $attrs['hideOn'] : array();

			if (
				! empty( $hide_on['Desktop'] ) ||
				! empty( $hide_on['Tablet'] ) ||
				! empty( $hide_on['Mobile'] )
			) {
				return true;
			}

			if ( 'core/block' === ( $block['blockName'] ?? '' ) ) {
				$ref = absint( $attrs['ref'] ?? 0 );
				if ( $ref > 0 && empty( $seen_post_ids[ $ref ] ) ) {
					$seen_post_ids[ $ref ] = true;
					$pattern              = get_post( $ref );
					if (
						$pattern &&
						is_string( $pattern->post_content ) &&
						$this->blocks_use_visibility( parse_blocks( $pattern->post_content ), $seen_post_ids )
					) {
						return true;
					}
				}
			}

			if ( $this->blocks_use_visibility( $block['innerBlocks'] ?? array(), $seen_post_ids ) ) {
				return true;
			}
		}

		return false;
	}
}
