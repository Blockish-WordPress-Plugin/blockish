<?php

namespace Blockish\Extensions;

defined( 'ABSPATH' ) || exit;

/**
 * Locates staged blockish/ai-preview blocks via a single posts-table LIKE query.
 */
class AiPreview {

	private const BLOCK_COMMENT = '<!-- wp:blockish/ai-preview';

	/**
	 * @return array<int, array{id:int,type:string,typeLabel:string,title:string,status:string,modified:string,edit_url:string}>
	 */
	public static function find_pending( int $limit = 200 ): array {
		global $wpdb;

		$limit    = max( 1, min( 500, $limit ) );
		$like     = '%' . $wpdb->esc_like( self::BLOCK_COMMENT ) . '%';
		$excluded = array(
			'revision',
			'nav_menu_item',
			'customize_changeset',
			'oembed_cache',
			'user_request',
			'wp_global_styles',
			'wp_navigation',
			'attachment',
			'blockish-classes',
		);

		$placeholders = implode( ',', array_fill( 0, count( $excluded ), '%s' ) );
		$params       = array_merge( $excluded, array( $like, $limit ) );

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				"SELECT ID, post_type, post_title, post_name, post_status, post_modified, post_content
				FROM {$wpdb->posts}
				WHERE post_type NOT IN ({$placeholders})
				AND post_status IN ('publish','draft','private','pending','future','auto-draft')
				AND post_content LIKE %s
				ORDER BY post_modified DESC
				LIMIT %d",
				...$params
			),
			ARRAY_A
		);

		if ( empty( $rows ) ) {
			return array();
		}

		$items = array();
		foreach ( $rows as $row ) {
			$id = absint( $row['ID'] ?? 0 );
			if ( $id < 1 || ! self::content_has_preview_block( (string) ( $row['post_content'] ?? '' ) ) ) {
				continue;
			}

			$type  = (string) ( $row['post_type'] ?? '' );
			$title = (string) ( $row['post_title'] ?? '' );
			if ( '' === trim( $title ) ) {
				$title = (string) ( $row['post_name'] ?? '' );
			}
			if ( '' === trim( $title ) ) {
				$title = '#' . $id;
			}

			$items[] = array(
				'id'         => $id,
				'type'       => $type,
				'typeLabel'  => self::type_label( $type ),
				'title'      => $title,
				'status'     => (string) ( $row['post_status'] ?? '' ),
				'modified'   => (string) ( $row['post_modified'] ?? '' ),
				'edit_url'   => self::edit_url( $id, $type, (string) ( $row['post_name'] ?? '' ) ),
				'rest_id'    => self::rest_id( $id, $type, (string) ( $row['post_name'] ?? '' ) ),
				'rest_route' => self::rest_route( $id, $type, (string) ( $row['post_name'] ?? '' ) ),
			);
		}

		return $items;
	}

	public static function get_item( int $post_id ): ?array {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return null;
		}

		$preview = \Blockish\Mcp\SchemaUtils::find_ai_preview_block( (string) $post->post_content );
		if ( ! $preview ) {
			return null;
		}
		$pending = $preview
			? \Blockish\Mcp\SchemaUtils::decode_schema_attr( $preview['attrs']['pendingSchema'] ?? '' )
			: array();

		$post_type = $post->post_type;
		$post_name = (string) $post->post_name;

		return array(
			'id'             => $post_id,
			'pendingSchema'  => $pending,
			'previousSchema' => $preview
				? \Blockish\Mcp\SchemaUtils::decode_schema_attr( $preview['attrs']['previousSchema'] ?? '' )
				: array(),
			'rest_id'        => self::rest_id( $post_id, $post_type, $post_name ),
			'rest_route'     => self::rest_route( $post_id, $post_type, $post_name ),
		);
	}

	/**
	 * @param int[]             $post_ids
	 * @param array<int,string> $contents Serialized block markup from editor createBlock/serialize.
	 * @return array{ok:bool,action:string,updated:int[],skipped:int[]}
	 */
	public static function apply_action( array $post_ids, string $action, array $contents = array() ): array {
		$action  = 'discard' === $action ? 'discard' : 'accept';
		$updated = array();
		$skipped = array();

		foreach ( array_unique( array_map( 'absint', $post_ids ) ) as $post_id ) {
			if ( $post_id < 1 || ! current_user_can( 'edit_post', $post_id ) ) {
				$skipped[] = $post_id;
				continue;
			}
			$content = $contents[ $post_id ] ?? $contents[ (string) $post_id ] ?? null;
			$result  = is_string( $content )
				? self::apply_action_to_post( $post_id, $action, $content )
				: false;
			if ( $result ) {
				$updated[] = $post_id;
			} else {
				$skipped[] = $post_id;
			}
		}

		return array(
			'ok'      => true,
			'action'  => $action,
			'updated' => $updated,
			'skipped' => $skipped,
		);
	}

	private static function apply_action_to_post( int $post_id, string $action, string $content ): bool {
		$post = get_post( $post_id );
		if ( ! $post ) {
			return false;
		}

		$preview = \Blockish\Mcp\SchemaUtils::find_ai_preview_block( (string) $post->post_content );
		if ( ! $preview ) {
			return false;
		}

		$pending = \Blockish\Mcp\SchemaUtils::decode_schema_attr( $preview['attrs']['pendingSchema'] ?? '' );

		$saved = wp_update_post(
			array(
				'ID'           => $post_id,
				'post_content' => $content,
			),
			true
		);
		if ( is_wp_error( $saved ) || ! $saved ) {
			return false;
		}

		$class_ids = self::collect_class_ids( $pending );
		if ( ! empty( $class_ids ) ) {
			if ( 'discard' === $action ) {
				ClassPrevious::discard_ids( $class_ids );
			} else {
				ClassPrevious::accept_ids( $class_ids );
			}
		}

		return true;
	}

	/**
	 * @return int[]
	 */
	private static function collect_class_ids( array $nodes ): array {
		$ids = array();
		$walk = function ( $list ) use ( &$ids, &$walk ) {
			if ( ! is_array( $list ) ) {
				return;
			}
			foreach ( $list as $node ) {
				if ( ! is_array( $node ) ) {
					continue;
				}
				$attrs = isset( $node['attributes'] ) && is_array( $node['attributes'] ) ? $node['attributes'] : array();
				foreach ( array( 'classManager', 'classManagerSubselector' ) as $key ) {
					if ( empty( $attrs[ $key ] ) || ! is_array( $attrs[ $key ] ) ) {
						continue;
					}
					foreach ( $attrs[ $key ] as $item ) {
						if ( is_array( $item ) ) {
							if ( ! empty( $item['id'] ) ) {
								$ids[] = absint( $item['id'] );
							}
							if ( ! empty( $item['parent'] ) ) {
								$ids[] = absint( $item['parent'] );
							}
						}
					}
				}
				if ( ! empty( $node['innerBlocks'] ) ) {
					$walk( $node['innerBlocks'] );
				}
			}
		};
		$walk( $nodes );
		return array_values( array_unique( array_filter( $ids ) ) );
	}

	private static function content_has_preview_block( string $content ): bool {
		if ( false === strpos( $content, self::BLOCK_COMMENT ) ) {
			return false;
		}

		return null !== \Blockish\Mcp\SchemaUtils::find_ai_preview_block( $content );
	}

	private static function template_theme_slug( int $post_id, string $post_name = '' ): array {
		if ( '' === $post_name ) {
			$post      = get_post( $post_id );
			$post_name = $post ? (string) $post->post_name : '';
		}

		$theme = get_stylesheet();
		$terms = get_the_terms( $post_id, 'wp_theme' );
		if ( $terms && ! is_wp_error( $terms ) && ! empty( $terms[0]->slug ) ) {
			$theme = (string) $terms[0]->slug;
		}

		return array( $theme, $post_name );
	}

	private static function rest_id( int $post_id, string $post_type, string $post_name = '' ): string {
		if ( in_array( $post_type, array( 'wp_template', 'wp_template_part' ), true ) ) {
			list( $theme, $slug ) = self::template_theme_slug( $post_id, $post_name );
			return $theme . '//' . $slug;
		}

		return (string) $post_id;
	}

	private static function rest_route( int $post_id, string $post_type, string $post_name = '' ): string {
		if ( in_array( $post_type, array( 'wp_template', 'wp_template_part' ), true ) ) {
			$rest_base = 'wp_template' === $post_type ? 'templates' : 'template-parts';
			return '/wp/v2/' . $rest_base . '/' . rawurlencode( self::rest_id( $post_id, $post_type, $post_name ) );
		}

		return rest_get_route_for_post( $post_id );
	}

	private static function edit_url( int $post_id, string $post_type, string $post_name = '' ): string {
		if ( in_array( $post_type, array( 'wp_template', 'wp_template_part' ), true ) ) {
			list( $theme, $slug ) = self::template_theme_slug( $post_id, $post_name );

			return admin_url(
				'site-editor.php?p=/' . $post_type . '/' . rawurlencode( $theme . '//' . $slug ) . '&canvas=edit'
			);
		}

		return admin_url( 'post.php?post=' . $post_id . '&action=edit' );
	}

	private static function type_label( string $post_type ): string {
		switch ( $post_type ) {
			case 'wp_template':
				return __( 'Template', 'blockish' );
			case 'wp_template_part':
				return __( 'Template part', 'blockish' );
			case 'wp_block':
			case 'blockish-pattern':
				return __( 'Pattern', 'blockish' );
			case 'blockish_form':
				return __( 'Form', 'blockish' );
			case 'page':
			case 'blockish-page':
				return __( 'Page', 'blockish' );
			default:
				return __( 'Post', 'blockish' );
		}
	}
}
