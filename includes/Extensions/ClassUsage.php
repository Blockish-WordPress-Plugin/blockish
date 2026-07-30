<?php

namespace Blockish\Extensions;

use Blockish\Mcp\Abilities\GetClasses\Callbacks as GetClassesCallbacks;
use Blockish\Mcp\Abilities\ManageClass\Callbacks as ManageClassCallbacks;
use Blockish\Mcp\Converter\ClassStyleConverter;

defined( 'ABSPATH' ) || exit;

/**
 * Scan WordPress content for Class Manager attachments and report usage.
 */
class ClassUsage {

	/**
	 * Post types excluded from usage scans (all other public/private types are searched).
	 *
	 * @return string[]
	 */
	public static function excluded_usage_post_types(): array {
		$types = array(
			'revision',
			'blockish-classes',
			'nav_menu_item',
			'custom_css',
			'customize_changeset',
			'oembed_cache',
			'user_request',
			'wp_global_styles',
			'wp_navigation',
		);

		/**
		 * Filter post types excluded from Class Manager usage scans.
		 *
		 * @param string[] $types
		 */
		$types = apply_filters( 'blockish_class_usage_excluded_post_types', $types );

		return array_values( array_unique( array_filter( array_map( 'strval', (array) $types ) ) ) );
	}

	/**
	 * Find posts whose block markup references classManager / classManagerSubselector.
	 *
	 * Uses a lightweight SQL LIKE pre-filter, then parse_blocks only on hits.
	 *
	 * @return \WP_Post[]
	 */
	public static function find_posts_with_class_attrs(): array {
		global $wpdb;

		$excluded_types = self::excluded_usage_post_types();
		if ( empty( $excluded_types ) ) {
			$type_clause = '1=1';
			$type_params = array();
		} else {
			$placeholders = implode( ', ', array_fill( 0, count( $excluded_types ), '%s' ) );
			$type_clause  = "post_type NOT IN ( {$placeholders} )";
			$type_params  = $excluded_types;
		}

		$sql = "
			SELECT ID
			FROM {$wpdb->posts}
			WHERE post_status NOT IN ( 'trash', 'auto-draft', 'inherit' )
			AND {$type_clause}
			AND (
				post_content LIKE %s
				OR post_content LIKE %s
			)
			ORDER BY ID ASC
		";

		$params   = array_merge( $type_params, array( '%"classManager"%', '%"classManagerSubselector"%' ) );
		$prepared = $wpdb->prepare( $sql, $params );
		$ids      = $wpdb->get_col( $prepared );

		if ( empty( $ids ) ) {
			return array();
		}

		return array_map( 'get_post', array_map( 'absint', $ids ) );
	}

	/**
	 * Panel payload: usage report + combined CSS per parent class.
	 *
	 * @return array{classes: array<int, array>, unused: array<int, array>}
	 */
	public static function panel_data(): array {
		$report  = self::report();
		$classes = array();

		foreach ( $report['classes'] as $id => $row ) {
			$classes[] = array_merge(
				$row,
				array(
					'css' => GetClassesCallbacks::combined_css_for_parent( (int) $id ),
				)
			);
		}

		usort(
			$classes,
			static function ( $a, $b ) {
				return strcasecmp( (string) $a['name'], (string) $b['name'] );
			}
		);

		return array(
			'classes' => $classes,
			'unused'  => $report['unused'],
		);
	}

	/**
	 * Usage report for parent classes (children roll up to their parent).
	 *
	 * @param int|null    $class_id Optional parent (or child) post ID filter.
	 * @param string|null $name     Optional class name / slug filter.
	 * @return array{classes: array<int, array>, unused: array<int, array>, scanned_post_types: string[]}
	 */
	public static function report( ?int $class_id = null, ?string $name = null ): array {
		$parents = self::parent_classes();
		$index   = self::build_index( $parents );

		if ( null !== $class_id && $class_id > 0 ) {
			$resolved = self::resolve_to_parent_id( $class_id, $index );
			$parents  = array_values(
				array_filter(
					$parents,
					static function ( $row ) use ( $resolved ) {
						return (int) $row['post_id'] === (int) $resolved;
					}
				)
			);
			$index = self::build_index( $parents );
		} elseif ( null !== $name && '' !== trim( $name ) ) {
			$slug    = ClassStyleConverter::normalize_slug( $name );
			$parents = array_values(
				array_filter(
					$parents,
					static function ( $row ) use ( $slug, $name ) {
						return $row['slug'] === $slug || strcasecmp( $row['name'], trim( $name ) ) === 0;
					}
				)
			);
			$index = self::build_index( $parents );
		}

		$usages = array();
		foreach ( $parents as $row ) {
			$usages[ (int) $row['post_id'] ] = array();
		}

		foreach ( self::find_posts_with_class_attrs() as $post ) {
			if ( ! $post instanceof \WP_Post ) {
				continue;
			}

			$ids = self::collect_class_ids_from_content( (string) $post->post_content );
			if ( empty( $ids ) ) {
				continue;
			}

			$parent_hits = array();
			foreach ( $ids as $attached_id ) {
				$parent_id = self::resolve_to_parent_id( $attached_id, $index );
				if ( $parent_id && isset( $usages[ $parent_id ] ) ) {
					$parent_hits[ $parent_id ] = true;
				}
			}

			if ( empty( $parent_hits ) ) {
				continue;
			}

			$entry = array(
				'post_id'   => (int) $post->ID,
				'post_type' => (string) $post->post_type,
				'title'     => (string) $post->post_title,
				'status'    => (string) $post->post_status,
				'edit_url'  => (string) get_edit_post_link( $post->ID, 'raw' ),
			);

			foreach ( array_keys( $parent_hits ) as $parent_id ) {
				$usages[ $parent_id ][] = $entry;
			}
		}

		$classes = array();
		$unused  = array();
		foreach ( $parents as $row ) {
			$id      = (int) $row['post_id'];
			$used_in = $usages[ $id ] ?? array();
			$item    = array(
				'post_id'      => $id,
				'name'         => $row['name'],
				'css_selector' => '.' . $row['slug'],
				'usage_count'  => count( $used_in ),
				'used_in'      => $used_in,
			);
			$classes[ $id ] = $item;
			if ( 0 === $item['usage_count'] ) {
				$unused[] = array(
					'post_id'      => $id,
					'name'         => $row['name'],
					'css_selector' => '.' . $row['slug'],
				);
			}
		}

		return array(
			'classes'             => $classes,
			'unused'              => $unused,
			'scanned_post_types'  => self::scannable_post_types(),
			'excluded_post_types' => self::excluded_usage_post_types(),
		);
	}

	/**
	 * Post types included in usage scans (all registered minus excluded).
	 *
	 * @return string[]
	 */
	public static function scannable_post_types(): array {
		$all     = get_post_types( array( 'public' => true ), 'names' );
		$private = get_post_types( array( 'public' => false, 'show_ui' => true ), 'names' );
		$types   = array_merge( array_values( (array) $all ), array_values( (array) $private ) );

		return array_values( array_diff( $types, self::excluded_usage_post_types() ) );
	}

	/**
	 * @return array<int, array{post_id:int,name:string,slug:string}>
	 */
	public static function parent_classes(): array {
		$posts = get_posts(
			array(
				'post_type'      => 'blockish-classes',
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'post_parent'    => 0,
				'orderby'        => 'title',
				'order'          => 'ASC',
			)
		);

		$out = array();
		foreach ( $posts as $post ) {
			$name = (string) $post->post_title;
			$slug = ClassStyleConverter::normalize_slug( $name );
			if ( '' === $slug ) {
				continue;
			}
			$out[] = array(
				'post_id' => (int) $post->ID,
				'name'    => $name,
				'slug'    => $slug,
			);
		}
		return $out;
	}

	/**
	 * Collect Class Manager post IDs referenced in serialized block markup.
	 *
	 * @return int[]
	 */
	public static function collect_class_ids_from_content( string $content ): array {
		if ( '' === trim( $content ) ) {
			return array();
		}

		$ids = array();
		self::walk_blocks( parse_blocks( $content ), $ids );
		$ids = array_values( array_unique( array_filter( array_map( 'absint', $ids ) ) ) );
		sort( $ids );
		return $ids;
	}

	/**
	 * Serialize parent classes (+ children + css) for template-library dependency bundles.
	 *
	 * @param int[] $class_ids Parent or child IDs (children expand to parent).
	 * @return array<int, array{id:int,title:string,name:string,css:string,content:string,children:array}>
	 */
	public static function serialize_classes_for_bundle( array $class_ids ): array {
		$bundle = array();
		$seen   = array();

		foreach ( $class_ids as $raw_id ) {
			$id = absint( $raw_id );
			if ( $id <= 0 ) {
				continue;
			}
			$post = get_post( $id );
			if ( ! $post || 'blockish-classes' !== $post->post_type ) {
				continue;
			}
			$parent_id = (int) $post->post_parent > 0 ? (int) $post->post_parent : (int) $post->ID;
			if ( isset( $seen[ $parent_id ] ) ) {
				continue;
			}
			$seen[ $parent_id ] = true;

			$parent = get_post( $parent_id );
			if ( ! $parent ) {
				continue;
			}

			$children_posts = get_posts(
				array(
					'post_type'      => 'blockish-classes',
					'post_status'    => 'publish',
					'posts_per_page' => -1,
					'post_parent'    => $parent_id,
					'orderby'        => 'title',
					'order'          => 'ASC',
				)
			);

			$children = array();
			foreach ( $children_posts as $child ) {
				$children[] = array(
					'title'   => (string) $child->post_title,
					'content' => (string) $child->post_content,
				);
			}

			$bundle[] = array(
				'id'       => $parent_id,
				'title'    => (string) $parent->post_title,
				'name'     => (string) $parent->post_title,
				'css'      => GetClassesCallbacks::combined_css_for_parent( $parent_id ),
				'content'  => (string) $parent->post_content,
				'children' => $children,
			);
		}

		return $bundle;
	}

	/**
	 * Import a cloud/local class dependency (prefers raw css).
	 *
	 * @param array{name?:string,title?:string,css?:string,content?:string,children?:array} $item
	 * @return array{post_id:int,name:string,created:bool}|array{error:string}
	 */
	public static function import_class_dependency( array $item ): array {
		$name = '';
		if ( ! empty( $item['name'] ) && is_string( $item['name'] ) ) {
			$name = $item['name'];
		} elseif ( ! empty( $item['title'] ) && is_string( $item['title'] ) ) {
			$name = $item['title'];
		}
		$name = sanitize_text_field( $name );
		$slug = ClassStyleConverter::normalize_slug( $name );
		if ( '' === $slug ) {
			return array( 'error' => 'Invalid class name for import.' );
		}

		$existing_id = self::find_parent_id_by_slug( $slug );
		$css         = isset( $item['css'] ) && is_string( $item['css'] ) ? trim( $item['css'] ) : '';

		if ( '' === $css ) {
			$parent_content = array();
			if ( isset( $item['content'] ) ) {
				if ( is_array( $item['content'] ) ) {
					$parent_content = $item['content'];
				} elseif ( is_string( $item['content'] ) ) {
					$decoded        = json_decode( $item['content'], true );
					$parent_content = is_array( $decoded ) ? $decoded : array();
				}
			}

			$children = array();
			if ( ! empty( $item['children'] ) && is_array( $item['children'] ) ) {
				foreach ( $item['children'] as $child ) {
					if ( ! is_array( $child ) ) {
						continue;
					}
					$child_name = trim( (string) ( $child['title'] ?? $child['name'] ?? '' ) );
					if ( '' === $child_name ) {
						continue;
					}
					$child_content = $child['content'] ?? array();
					if ( is_string( $child_content ) ) {
						$decoded       = json_decode( $child_content, true );
						$child_content = is_array( $decoded ) ? $decoded : array();
					}
					if ( ! is_array( $child_content ) ) {
						$child_content = array();
					}
					$children[] = array(
						'name'    => $child_name,
						'content' => $child_content,
					);
				}
			}

			$css = ClassStyleConverter::class_tree_to_css( $parent_content, $children, $slug );
		}

		if ( '' === trim( $css ) ) {
			return array( 'error' => 'Class import requires css (or content that can compile to css).' );
		}

		$input = array(
			'action' => $existing_id ? 'update' : 'create',
			'name'   => $name,
			'css'    => $css,
		);
		if ( $existing_id ) {
			$input['post_id'] = $existing_id;
		}

		$result = ManageClassCallbacks::manage_class( $input );
		if ( isset( $result['error'] ) ) {
			return array( 'error' => (string) $result['error'] );
		}

		return array(
			'post_id' => (int) $result['post_id'],
			'name'    => (string) $result['name'],
			'created' => ! $existing_id,
		);
	}

	/**
	 * Delete unused parent classes (and their children).
	 *
	 * @param bool  $confirm  Must be true to delete.
	 * @param int[] $only_ids Optional whitelist of parent IDs to delete among unused.
	 * @return array{dry_run:bool,deleted:array,unused:array,note?:string}
	 */
	public static function sweep_unused( bool $confirm, array $only_ids = array() ): array {
		$report = self::report();
		$unused = $report['unused'];

		if ( ! empty( $only_ids ) ) {
			$only   = array_fill_keys( array_map( 'absint', $only_ids ), true );
			$unused = array_values(
				array_filter(
					$unused,
					static function ( $row ) use ( $only ) {
						return isset( $only[ (int) $row['post_id'] ] );
					}
				)
			);
		}

		if ( ! $confirm ) {
			return array(
				'dry_run' => true,
				'deleted' => array(),
				'unused'  => $unused,
				'note'    => 'Pass confirm:true to permanently delete these unused parent classes (children are deleted with the parent).',
			);
		}

		$deleted = array();
		foreach ( $unused as $row ) {
			$id = (int) $row['post_id'];
			if ( $id <= 0 || 'blockish-classes' !== get_post_type( $id ) ) {
				continue;
			}
			$children = get_posts(
				array(
					'post_type'      => 'blockish-classes',
					'post_status'    => 'any',
					'posts_per_page' => -1,
					'post_parent'    => $id,
					'fields'         => 'ids',
				)
			);
			foreach ( $children as $child_id ) {
				wp_delete_post( (int) $child_id, true );
			}
			wp_delete_post( $id, true );
			$deleted[] = $row;
		}

		return array(
			'dry_run' => false,
			'deleted' => $deleted,
			'unused'  => array(),
		);
	}

	/**
	 * @param array<int, array{post_id:int,name:string,slug:string}> $parents
	 * @return array{by_id: array<int,int>, child_to_parent: array<int,int>}
	 */
	private static function build_index( array $parents ): array {
		$by_id           = array();
		$child_to_parent = array();

		foreach ( $parents as $row ) {
			$id           = (int) $row['post_id'];
			$by_id[ $id ] = $id;

			$children = get_posts(
				array(
					'post_type'      => 'blockish-classes',
					'post_status'    => 'publish',
					'posts_per_page' => -1,
					'post_parent'    => $id,
					'fields'         => 'ids',
				)
			);
			foreach ( $children as $child_id ) {
				$child_to_parent[ (int) $child_id ] = $id;
				$by_id[ (int) $child_id ]           = $id;
			}
		}

		return array(
			'by_id'           => $by_id,
			'child_to_parent' => $child_to_parent,
		);
	}

	/**
	 * @param array{by_id: array<int,int>, child_to_parent: array<int,int>} $index
	 */
	private static function resolve_to_parent_id( int $id, array $index ): int {
		if ( isset( $index['by_id'][ $id ] ) ) {
			return (int) $index['by_id'][ $id ];
		}
		$post = get_post( $id );
		if ( $post && 'blockish-classes' === $post->post_type ) {
			return (int) $post->post_parent > 0 ? (int) $post->post_parent : (int) $post->ID;
		}
		return 0;
	}

	private static function find_parent_id_by_slug( string $slug ): int {
		foreach ( self::parent_classes() as $row ) {
			if ( $row['slug'] === $slug ) {
				return (int) $row['post_id'];
			}
		}
		return 0;
	}

	/**
	 * @param array<int, mixed> $blocks
	 * @param int[]             $ids
	 */
	private static function walk_blocks( array $blocks, array &$ids ): void {
		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}
			$attrs = isset( $block['attrs'] ) && is_array( $block['attrs'] ) ? $block['attrs'] : array();
			self::collect_ids_from_attr( $attrs['classManager'] ?? null, $ids );
			self::collect_ids_from_attr( $attrs['classManagerSubselector'] ?? null, $ids );

			if ( ! empty( $block['innerBlocks'] ) && is_array( $block['innerBlocks'] ) ) {
				self::walk_blocks( $block['innerBlocks'], $ids );
			}
		}
	}

	/**
	 * @param mixed $raw
	 * @param int[] $ids
	 */
	private static function collect_ids_from_attr( $raw, array &$ids ): void {
		if ( null === $raw || '' === $raw ) {
			return;
		}

		if ( is_string( $raw ) ) {
			$trim = trim( $raw );
			if ( '' === $trim ) {
				return;
			}
			$parts = preg_split( '/\s*,\s*/', $trim ) ?: array();
			foreach ( $parts as $part ) {
				$slug = ClassStyleConverter::normalize_slug( $part );
				if ( '' === $slug ) {
					continue;
				}
				$id = self::find_parent_id_by_slug( $slug );
				if ( $id > 0 ) {
					$ids[] = $id;
				}
			}
			return;
		}

		if ( ! is_array( $raw ) ) {
			return;
		}

		if ( isset( $raw['id'] ) || isset( $raw['title'] ) || isset( $raw['name'] ) ) {
			if ( ! empty( $raw['id'] ) ) {
				$ids[] = absint( $raw['id'] );
			} elseif ( ! empty( $raw['title'] ) || ! empty( $raw['name'] ) ) {
				$label = (string) ( $raw['title'] ?? $raw['name'] );
				$id    = self::find_parent_id_by_slug( ClassStyleConverter::normalize_slug( $label ) );
				if ( $id > 0 ) {
					$ids[] = $id;
				}
			}
			return;
		}

		foreach ( $raw as $item ) {
			self::collect_ids_from_attr( $item, $ids );
		}
	}
}
