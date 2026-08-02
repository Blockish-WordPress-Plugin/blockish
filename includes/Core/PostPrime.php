<?php

namespace Blockish\Core;

defined( 'ABSPATH' ) || exit;

/**
 * Prime synced-pattern (core/block ref) posts once per request — before render.
 *
 * Block themes call get_the_block_template_html() before wp_head / wp_enqueue_scripts.
 * Class Manager and Visibility previously primed on enqueue, which is too late:
 * core render_block_core_block() had already queried each ref. Priming on `wp`
 * warms the posts cache first so render + later walks share one bulk fetch.
 */
class PostPrime {

	/**
	 * @var array<int, \WP_Post|null>
	 */
	private static $posts = array();

	/**
	 * @var array<int, true>
	 */
	private static $attempted = array();

	/**
	 * @var bool
	 */
	private static $hooks_registered = false;

	/**
	 * @var bool
	 */
	private static $request_primed = false;

	/**
	 * Register the early frontend prime hook (idempotent).
	 */
	public static function register_hooks() {
		if ( self::$hooks_registered ) {
			return;
		}
		self::$hooks_registered = true;

		// After the main query is set, before template-canvas renders blocks.
		add_action( 'wp', array( __CLASS__, 'prime_for_frontend_request' ), 20 );
	}

	/**
	 * Warm pattern posts for the current frontend view.
	 */
	public static function prime_for_frontend_request() {
		if ( self::$request_primed || is_admin() || wp_doing_ajax() || wp_doing_cron() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) {
			return;
		}
		self::$request_primed = true;

		$post_id = get_queried_object_id();
		if ( $post_id ) {
			$post = get_post( $post_id );
			if ( $post instanceof \WP_Post && is_string( $post->post_content ) && '' !== $post->post_content ) {
				self::prime_pattern_refs_from_blocks( parse_blocks( $post->post_content ) );
			}
		}

		if ( ! function_exists( 'wp_is_block_theme' ) || ! wp_is_block_theme() ) {
			return;
		}

		// Same scope as Class Manager: patterns inside shared template parts.
		$parts = get_posts(
			array(
				'post_type'              => 'wp_template_part',
				'post_status'            => array( 'publish', 'private' ),
				'posts_per_page'         => -1,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);

		foreach ( $parts as $part ) {
			if ( ! $part instanceof \WP_Post || ! is_string( $part->post_content ) || '' === $part->post_content ) {
				continue;
			}
			self::prime_pattern_refs_from_blocks( parse_blocks( $part->post_content ) );
		}
	}

	/**
	 * Collect core/block ref IDs from a block tree (does not expand patterns).
	 *
	 * @param array $blocks Parsed blocks.
	 * @return int[] Unique post IDs.
	 */
	public static function collect_block_refs( $blocks ) {
		$refs = array();
		self::collect_block_refs_recursive( $blocks, $refs );
		return array_map( 'intval', array_keys( $refs ) );
	}

	/**
	 * @param array $blocks
	 * @param array $refs   Ref ID => true.
	 */
	private static function collect_block_refs_recursive( $blocks, &$refs ) {
		if ( ! is_array( $blocks ) ) {
			return;
		}

		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			if ( 'core/block' === ( $block['blockName'] ?? '' ) ) {
				$ref = absint( $block['attrs']['ref'] ?? 0 );
				if ( $ref > 0 ) {
					$refs[ $ref ] = true;
				}
			}

			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				self::collect_block_refs_recursive( $block['innerBlocks'], $refs );
			}
		}
	}

	/**
	 * Warm the posts cache for the given IDs (skips IDs already attempted).
	 *
	 * @param int[] $ids Post IDs.
	 */
	public static function prime_ids( $ids ) {
		$ids = array_values( array_unique( array_filter( array_map( 'absint', (array) $ids ) ) ) );
		if ( empty( $ids ) ) {
			return;
		}

		$missing = array();
		foreach ( $ids as $id ) {
			if ( isset( self::$attempted[ $id ] ) ) {
				continue;
			}
			if ( false !== wp_cache_get( $id, 'posts' ) ) {
				self::$attempted[ $id ] = true;
				continue;
			}
			$missing[] = $id;
		}

		if ( ! empty( $missing ) ) {
			_prime_post_caches( $missing, false, false );
		}

		foreach ( $ids as $id ) {
			if ( array_key_exists( $id, self::$posts ) ) {
				self::$attempted[ $id ] = true;
				continue;
			}

			$cached = wp_cache_get( $id, 'posts' );
			if ( false !== $cached ) {
				$post = $cached instanceof \WP_Post ? $cached : get_post( $id );
				self::$posts[ $id ]     = ( $post instanceof \WP_Post ) ? $post : null;
				self::$attempted[ $id ] = true;
				continue;
			}

			// Miss after prime: negative-cache so walks do not re-hit the DB.
			$post = get_post( $id );
			self::$posts[ $id ]     = ( $post instanceof \WP_Post ) ? $post : null;
			self::$attempted[ $id ] = true;
		}
	}

	/**
	 * Request-local get_post that avoids repeat SELECTs for the same ID.
	 *
	 * @param int $id Post ID.
	 * @return \WP_Post|null
	 */
	public static function get_post( $id ) {
		$id = absint( $id );
		if ( $id <= 0 ) {
			return null;
		}

		if ( array_key_exists( $id, self::$posts ) ) {
			return self::$posts[ $id ];
		}

		self::prime_ids( array( $id ) );

		return array_key_exists( $id, self::$posts ) ? self::$posts[ $id ] : null;
	}

	/**
	 * Prime pattern posts referenced by a block tree, including one nested level.
	 *
	 * @param array $blocks Parsed blocks from page/template content.
	 */
	public static function prime_pattern_refs_from_blocks( $blocks ) {
		$refs = self::collect_block_refs( $blocks );
		self::prime_ids( $refs );

		$nested = array();
		foreach ( $refs as $id ) {
			$post = self::get_post( $id );
			if ( ! $post instanceof \WP_Post || ! is_string( $post->post_content ) || '' === $post->post_content ) {
				continue;
			}
			foreach ( self::collect_block_refs( parse_blocks( $post->post_content ) ) as $nested_id ) {
				$nested[] = $nested_id;
			}
		}

		self::prime_ids( $nested );
	}
}
