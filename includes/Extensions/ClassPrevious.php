<?php

namespace Blockish\Extensions;

use Blockish\Mcp\Abilities\GetClasses\Callbacks as GetClassesCallbacks;
use Blockish\Mcp\Converter\ClassStyleConverter;
use WP_REST_Request;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * Stores previous Class Manager content until AI preview Accept/Discard.
 *
 * Meta is written only when empty (first change in a pending cycle).
 * Accept deletes the meta. Discard restores content then deletes the meta.
 */
class ClassPrevious {

	public const META_KEY = 'blockishClassManagerPreviousContent';
	public const CSS_META_KEY = 'blockishClassManagerStyles';

	public static function register_hooks() {
		add_action( 'rest_api_init', array( self::class, 'register_rest_routes' ) );
	}

	public static function register_meta() {
		register_post_meta(
			'blockish-classes',
			self::META_KEY,
			array(
				'type'              => 'string',
				'single'            => true,
				'default'           => '',
				'show_in_rest'      => true,
				'sanitize_callback' => array( self::class, 'sanitize_meta' ),
				'auth_callback'     => function () {
					return current_user_can( 'edit_posts' );
				},
			)
		);
	}

	/**
	 * @param mixed $value
	 */
	public static function sanitize_meta( $value ): string {
		if ( is_array( $value ) ) {
			$json = wp_json_encode( $value );
			return false === $json ? '' : $json;
		}
		return is_string( $value ) ? $value : '';
	}

	public static function register_rest_routes() {
		register_rest_route(
			'blockish/v1',
			'/class-previous-content',
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( self::class, 'rest_get' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( self::class, 'rest_post' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
					'args'                => array(
						'action'   => array(
							'type'     => 'string',
							'enum'     => array( 'accept', 'discard', 'seed' ),
							'required' => true,
						),
						'class_id' => array(
							'type'    => 'integer',
							'minimum' => 1,
						),
						'created'  => array(
							'type' => 'boolean',
						),
					),
				),
			)
		);
	}

	public static function rest_get() {
		return rest_ensure_response(
			array(
				'pending' => self::list_pending(),
			)
		);
	}

	public static function rest_post( WP_REST_Request $request ) {
		$action = (string) $request->get_param( 'action' );

		if ( 'seed' === $action ) {
			$class_id = absint( $request->get_param( 'class_id' ) );
			if ( $class_id < 1 || 'blockish-classes' !== get_post_type( $class_id ) ) {
				return rest_ensure_response( array( 'error' => 'Invalid class_id.' ) );
			}
			$parent_id = self::resolve_parent_id( $class_id );
			self::seed_if_empty( $parent_id, (bool) $request->get_param( 'created' ) );
			return rest_ensure_response( array( 'ok' => true, 'class_id' => $parent_id ) );
		}

		if ( 'accept' === $action ) {
			return rest_ensure_response( self::accept_all() );
		}

		return rest_ensure_response( self::discard_all() );
	}

	/**
	 * Snapshot current parent + children before the first pending write.
	 */
	public static function seed_if_empty( int $parent_id, bool $created = false ): void {
		if ( $parent_id < 1 || 'blockish-classes' !== get_post_type( $parent_id ) ) {
			return;
		}
		if ( (int) get_post_field( 'post_parent', $parent_id ) > 0 ) {
			$parent_id = self::resolve_parent_id( $parent_id );
		}
		if ( self::has_previous( $parent_id ) ) {
			return;
		}

		if ( $created ) {
			update_post_meta(
				$parent_id,
				self::META_KEY,
				wp_json_encode(
					array(
						'created'  => true,
						'title'    => (string) get_post_field( 'post_title', $parent_id ),
						'content'  => array(),
						'children' => array(),
					)
				)
			);
			return;
		}

		update_post_meta( $parent_id, self::META_KEY, wp_json_encode( self::snapshot_tree( $parent_id ) ) );
	}

	public static function accept_all(): array {
		$ids = self::pending_parent_ids();
		foreach ( $ids as $id ) {
			delete_post_meta( $id, self::META_KEY );
		}
		return array(
			'ok'      => true,
			'cleared' => array_values( $ids ),
		);
	}

	public static function discard_all(): array {
		$restored = array();
		foreach ( self::pending_parent_ids() as $id ) {
			$restored[] = self::restore_one( $id );
		}
		return array(
			'ok'       => true,
			'restored' => $restored,
		);
	}

	/**
	 * @return array<int, array{id: int, name: string, created: bool}>
	 */
	public static function list_pending(): array {
		$out = array();
		foreach ( self::pending_parent_ids() as $id ) {
			$snap = self::read_snapshot( $id );
			$out[] = array(
				'id'      => $id,
				'name'    => (string) get_post_field( 'post_title', $id ),
				'created' => ! empty( $snap['created'] ),
			);
		}
		return $out;
	}

	public static function resolve_parent_id( int $id ): int {
		$parent = (int) get_post_field( 'post_parent', $id );
		return $parent > 0 ? $parent : $id;
	}

	public static function has_previous( int $parent_id ): bool {
		$raw = get_post_meta( $parent_id, self::META_KEY, true );
		return is_string( $raw ) && '' !== trim( $raw );
	}

	/**
	 * @return int[]
	 */
	private static function pending_parent_ids(): array {
		$ids = get_posts(
			array(
				'post_type'      => 'blockish-classes',
				'post_status'    => 'publish',
				'post_parent'    => 0,
				'posts_per_page' => -1,
				'fields'         => 'ids',
				'meta_key'       => self::META_KEY,
				'meta_compare'   => '!=',
				'meta_value'     => '',
			)
		);

		return array_map( 'absint', is_array( $ids ) ? $ids : array() );
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function snapshot_tree( int $parent_id ): array {
		$post = get_post( $parent_id );
		$content = json_decode( $post ? (string) $post->post_content : '', true );

		$children = array();
		foreach ( self::child_posts( $parent_id ) as $child ) {
			$child_content = json_decode( (string) $child->post_content, true );
			$children[]    = array(
				'name'    => (string) $child->post_title,
				'content' => is_array( $child_content ) ? $child_content : array(),
				'css'     => (string) get_post_meta( $child->ID, self::CSS_META_KEY, true ),
			);
		}

		return array(
			'created'  => false,
			'title'    => $post ? (string) $post->post_title : '',
			'content'  => is_array( $content ) ? $content : array(),
			'css'      => (string) get_post_meta( $parent_id, self::CSS_META_KEY, true ),
			'children' => $children,
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function read_snapshot( int $parent_id ): array {
		$raw = get_post_meta( $parent_id, self::META_KEY, true );
		if ( ! is_string( $raw ) || '' === trim( $raw ) ) {
			return array();
		}
		$decoded = json_decode( $raw, true );
		return is_array( $decoded ) ? $decoded : array();
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function restore_one( int $parent_id ): array {
		$snap = self::read_snapshot( $parent_id );
		if ( empty( $snap ) ) {
			return array( 'id' => $parent_id, 'action' => 'skipped' );
		}

		if ( ! empty( $snap['created'] ) ) {
			if ( current_user_can( 'delete_post', $parent_id ) ) {
				wp_delete_post( $parent_id, true );
			}
			return array( 'id' => $parent_id, 'action' => 'deleted' );
		}

		if ( ! current_user_can( 'edit_post', $parent_id ) ) {
			return array( 'id' => $parent_id, 'error' => 'forbidden' );
		}

		$title   = (string) ( $snap['title'] ?? get_post_field( 'post_title', $parent_id ) );
		$content = isset( $snap['content'] ) && is_array( $snap['content'] ) ? $snap['content'] : array();

		wp_update_post(
			array(
				'ID'           => $parent_id,
				'post_title'   => $title,
				'post_content' => wp_slash( wp_json_encode( $content ) ),
			)
		);

		$children = isset( $snap['children'] ) && is_array( $snap['children'] ) ? $snap['children'] : array();
		self::sync_children( $parent_id, $children );
		self::restore_css_meta( $parent_id, $snap, $children );
		delete_post_meta( $parent_id, self::META_KEY );

		return array(
			'id'      => $parent_id,
			'action'  => 'restored',
			'records' => self::editor_records_for_parent( $parent_id ),
		);
	}

	/**
	 * @param array<int, array{name?: string, content?: array}> $children
	 */
	private static function sync_children( int $parent_id, array $children ): void {
		$existing = self::child_posts( $parent_id );
		$by_title = array();
		foreach ( $existing as $post ) {
			$by_title[ trim( (string) $post->post_title ) ] = $post;
		}

		$seen = array();
		foreach ( $children as $child ) {
			$name = trim( (string) ( $child['name'] ?? '' ) );
			if ( '' === $name ) {
				continue;
			}
			$seen[ $name ] = true;
			$content_json  = wp_slash( wp_json_encode( isset( $child['content'] ) && is_array( $child['content'] ) ? $child['content'] : array() ) );

			if ( isset( $by_title[ $name ] ) ) {
				wp_update_post(
					array(
						'ID'           => (int) $by_title[ $name ]->ID,
						'post_content' => $content_json,
						'post_parent'  => $parent_id,
						'post_status'  => 'publish',
					)
				);
			} else {
				wp_insert_post(
					array(
						'post_type'    => 'blockish-classes',
						'post_status'  => 'publish',
						'post_title'   => $name,
						'post_parent'  => $parent_id,
						'post_content' => $content_json,
					)
				);
			}
		}

		foreach ( $by_title as $title => $post ) {
			if ( ! isset( $seen[ $title ] ) ) {
				wp_delete_post( (int) $post->ID, true );
			}
		}
	}

	/**
	 * Restore compiled CSS meta from the snapshot when present; otherwise regenerate.
	 *
	 * @param array<string, mixed>                 $snap
	 * @param array<int, array<string, mixed>>     $children
	 */
	private static function restore_css_meta( int $parent_id, array $snap, array $children ): void {
		if ( isset( $snap['css'] ) && is_string( $snap['css'] ) ) {
			update_post_meta( $parent_id, self::CSS_META_KEY, $snap['css'] );

			$by_title = array();
			foreach ( self::child_posts( $parent_id ) as $child ) {
				$by_title[ trim( (string) $child->post_title ) ] = $child;
			}
			foreach ( $children as $child ) {
				$name = trim( (string) ( $child['name'] ?? '' ) );
				if ( '' === $name || ! isset( $by_title[ $name ] ) || ! isset( $child['css'] ) || ! is_string( $child['css'] ) ) {
					continue;
				}
				update_post_meta( $by_title[ $name ]->ID, self::CSS_META_KEY, $child['css'] );
			}
			return;
		}

		self::refresh_css_meta( $parent_id );
	}

	/**
	 * @return array<int, array<string, mixed>>
	 */
	private static function editor_records_for_parent( int $parent_id ): array {
		$ids = array( $parent_id );
		foreach ( self::child_posts( $parent_id ) as $child ) {
			$ids[] = (int) $child->ID;
		}

		$out = array();
		foreach ( $ids as $id ) {
			$post = get_post( $id );
			if ( ! $post ) {
				continue;
			}
			$out[] = array(
				'id'      => $id,
				'title'   => (string) $post->post_title,
				'content' => (string) $post->post_content,
				'css'     => (string) get_post_meta( $id, self::CSS_META_KEY, true ),
				'parent'  => (int) $post->post_parent,
			);
		}

		return $out;
	}

	private static function refresh_css_meta( int $parent_id ): void {
		$post = get_post( $parent_id );
		if ( ! $post ) {
			return;
		}

		$content = json_decode( (string) $post->post_content, true );
		$parent_css = ClassStyleConverter::style_object_to_css(
			is_array( $content ) ? $content : array(),
			(string) $post->post_title,
			'.' . ClassStyleConverter::normalize_slug( (string) $post->post_title )
		);
		update_post_meta( $parent_id, self::CSS_META_KEY, $parent_css );

		foreach ( self::child_posts( $parent_id ) as $child ) {
			$child_content = json_decode( (string) $child->post_content, true );
			$child_sel     = GetClassesCallbacks::build_selector( $child->ID, (string) $child->post_title, $parent_id );
			$child_css     = ClassStyleConverter::style_object_to_css(
				is_array( $child_content ) ? $child_content : array(),
				(string) $child->post_title,
				$child_sel
			);
			update_post_meta( $child->ID, self::CSS_META_KEY, $child_css );
		}
	}

	/**
	 * @return \WP_Post[]
	 */
	private static function child_posts( int $parent_id ): array {
		return get_posts(
			array(
				'post_type'      => 'blockish-classes',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'post_parent'    => $parent_id,
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);
	}
}
