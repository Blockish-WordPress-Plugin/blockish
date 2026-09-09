<?php

namespace Blockish\Mcp\Abilities;

use Blockish\Mcp\BlockSchemaMeta;
use Blockish\Mcp\SchemaUtils;
use Blockish\Mcp\TemplateRouting;
use Blockish\ThemeBuilder\Conditions;
use Blockish\ThemeBuilder\DefaultPosts;
use Blockish\ThemeBuilder\PostType;
use Blockish\ThemeBuilder\TemplateOptions;
use WP_Query;

defined( 'ABSPATH' ) || exit;

/**
 * Theme Builder backend for blockish/get-templates and blockish/manage-template.
 */
class ThemeBuilderTemplates {

	/**
	 * @param array<string, mixed> $input Tool input.
	 * @return array<string, mixed>
	 */
	public static function get_templates( array $input ): array {
		$types = self::normalize_types( $input['type'] ?? null );
		$slug  = ! empty( $input['slug'] ) ? sanitize_title( (string) $input['slug'] ) : '';

		$library = DefaultPosts::get_library_post();
		$exclude = $library instanceof \WP_Post ? array( (int) $library->ID ) : array();

		$meta_query = array(
			'relation' => 'OR',
			array(
				'key'   => PostType::META_KIND,
				'value' => PostType::KIND_TEMPLATE,
			),
			array(
				'key'   => PostType::META_KIND,
				'value' => PostType::KIND_PART,
			),
		);

		if ( '' !== $slug ) {
			$meta_query = array(
				'relation' => 'AND',
				$meta_query,
				array(
					'key'   => PostType::META_SLUG,
					'value' => $slug,
				),
			);
		}

		$query = new WP_Query(
			array(
				'post_type'              => PostType::POST_TYPE,
				'post_status'            => 'publish',
				'posts_per_page'         => 100,
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => false,
				'post__not_in'           => $exclude,
				'meta_query'             => $meta_query,
				'orderby'                => 'title',
				'order'                  => 'ASC',
			)
		);

		$templates = array();

		foreach ( $query->posts as $post ) {
			if ( ! $post instanceof \WP_Post ) {
				continue;
			}

			$row = self::format_template_row( $post, '' !== $slug );
			if ( ! in_array( $row['type'], $types, true ) ) {
				continue;
			}

			$templates[] = $row;
		}

		return array(
			'backend'   => TemplateRouting::BACKEND_THEME_BUILDER,
			'theme'     => wp_get_theme()->get_stylesheet(),
			'templates' => $templates,
		);
	}

	/**
	 * @param array<string, mixed> $input Tool input.
	 * @return array<string, mixed>
	 */
	public static function manage_template( array $input ): array {
		$slug = isset( $input['slug'] ) ? sanitize_title( (string) $input['slug'] ) : '';
		if ( '' === $slug ) {
			if ( empty( $input ) && isset( $_SERVER['CONTENT_LENGTH'] ) && (int) $_SERVER['CONTENT_LENGTH'] > 0 ) {
				return array( 'error' => BlockSchemaMeta::payload_truncated_error() );
			}
			return array( 'error' => 'slug is required.' );
		}

		if ( ! empty( $input['schema_file'] ) && ! empty( $input['schema_url'] ) ) {
			return array( 'error' => 'Provide only one of schema_file or schema_url.' );
		}

		if ( ! empty( $input['schema_file'] ) ) {
			$loaded = SchemaUtils::load_schema_file( (string) $input['schema_file'] );
			if ( is_string( $loaded ) ) {
				return array( 'error' => $loaded );
			}
			$input['block_schema'] = $loaded;
		} elseif ( ! empty( $input['schema_url'] ) ) {
			$loaded = SchemaUtils::load_schema_url( (string) $input['schema_url'] );
			if ( is_string( $loaded ) ) {
				return array( 'error' => $loaded );
			}
			$input['block_schema'] = $loaded;
		}

		$has_block_schema = array_key_exists( 'block_schema', $input ) && is_array( $input['block_schema'] );
		if ( $has_block_schema && ! empty( $input['block_schema'] ) ) {
			$shape_error = SchemaUtils::validate_schema_shape( $input['block_schema'] );
			if ( $shape_error ) {
				return array( 'error' => $shape_error );
			}
			$mono_error = BlockSchemaMeta::get_monolithic_schema_error( $input['block_schema'], 'template' );
			if ( $mono_error ) {
				return array( 'error' => $mono_error );
			}
		}

		$type = $input['type'] ?? 'wp_template';
		if ( ! in_array( $type, array( 'wp_template', 'wp_template_part' ), true ) ) {
			return array( 'error' => 'type must be wp_template or wp_template_part.' );
		}

		$kind = self::kind_from_type( $type );
		$existing = self::find_post_by_slug( $slug, $kind );

		if ( ! empty( $input['delete'] ) ) {
			if ( ! $existing instanceof \WP_Post ) {
				return array( 'error' => 'Template not found for deletion.' );
			}
			wp_delete_post( $existing->ID, true );

			return array(
				'backend'       => TemplateRouting::BACKEND_THEME_BUILDER,
				'id'            => (int) $existing->ID,
				'slug'          => $slug,
				'type'          => $type,
				'action'        => 'deleted',
				'schema_staged' => false,
			);
		}

		if ( ! $existing instanceof \WP_Post ) {
			$create_error = self::validate_create( $slug, $kind, $input );
			if ( $create_error ) {
				return array( 'error' => $create_error );
			}
		}

		$placement_error = self::validate_part_placement( $existing, $slug, $kind, $input );
		if ( $placement_error ) {
			return array( 'error' => $placement_error );
		}

		$post_data = array(
			'post_type'   => PostType::POST_TYPE,
			'post_title'  => $input['title'] ?? ( $existing ? $existing->post_title : self::default_title_for_slug( $slug, $kind ) ),
			'post_status' => 'publish',
		);

		if ( $has_block_schema ) {
			$existing_content       = $existing ? (string) $existing->post_content : '';
			$post_data['post_content'] = wp_slash(
				SchemaUtils::build_staged_ai_preview_content(
					$existing_content,
					$input['block_schema']
				)
			);
		}

		if ( $existing instanceof \WP_Post ) {
			unset( $post_data['post_name'] );
			$post_data['ID'] = $existing->ID;
			$post_id         = wp_update_post( $post_data, true );
			$action          = 'updated';
		} else {
			$post_id = wp_insert_post( $post_data, true );
			$action  = 'created';
		}

		if ( is_wp_error( $post_id ) ) {
			return array( 'error' => $post_id->get_error_message() );
		}

		self::sync_meta( (int) $post_id, $slug, $kind, $input, ! ( $existing instanceof \WP_Post ) );

		$schema_staged = false;
		$warnings      = array();
		if ( $has_block_schema && ! empty( $input['block_schema'] ) ) {
			$warnings      = BlockSchemaMeta::get_schema_warnings( $input['block_schema'] );
			$schema_staged = true;
		}

		$result = array(
			'backend'       => TemplateRouting::BACKEND_THEME_BUILDER,
			'id'            => (int) $post_id,
			'slug'          => $slug,
			'type'          => $type,
			'edit_url'      => get_edit_post_link( $post_id, 'raw' ),
			'action'        => $action,
			'schema_staged' => $schema_staged,
		);

		if ( ! empty( $warnings ) ) {
			$result['warnings'] = $warnings;
		}

		return $result;
	}

	/**
	 * @param mixed $type Raw type filter.
	 * @return string[]
	 */
	private static function normalize_types( $type ): array {
		if ( null === $type || '' === $type ) {
			return array( 'wp_template', 'wp_template_part' );
		}

		if ( ! is_array( $type ) ) {
			$type = array( $type );
		}

		$allowed = array( 'wp_template', 'wp_template_part' );
		$types   = array();
		foreach ( $type as $row ) {
			$row = (string) $row;
			if ( in_array( $row, $allowed, true ) && ! in_array( $row, $types, true ) ) {
				$types[] = $row;
			}
		}

		return $types ? $types : array( 'wp_template', 'wp_template_part' );
	}

	/**
	 * @param string $type wp_template|wp_template_part.
	 * @return string
	 */
	private static function kind_from_type( string $type ): string {
		return 'wp_template_part' === $type ? PostType::KIND_PART : PostType::KIND_TEMPLATE;
	}

	/**
	 * @param string $kind template|part.
	 * @return string
	 */
	private static function type_from_kind( string $kind ): string {
		return PostType::KIND_PART === $kind ? 'wp_template_part' : 'wp_template';
	}

	/**
	 * @param \WP_Post $post Post object.
	 * @param bool     $include_content Include content + schema.
	 * @return array<string, mixed>
	 */
	private static function format_template_row( \WP_Post $post, bool $include_content ): array {
		$kind       = PostType::sanitize_kind( get_post_meta( $post->ID, PostType::META_KIND, true ) );
		$slug       = sanitize_title( (string) get_post_meta( $post->ID, PostType::META_SLUG, true ) );
		$area       = sanitize_title( (string) get_post_meta( $post->ID, PostType::META_AREA, true ) );
		$active     = get_post_meta( $post->ID, PostType::META_ACTIVE, true );
		$conditions = get_post_meta( $post->ID, PostType::META_CONDITIONS, true );
		$content    = (string) $post->post_content;
		$has_preview = SchemaUtils::content_has_ai_preview( $content );

		$row = array(
			'id'            => (int) $post->ID,
			'slug'          => $slug,
			'title'         => (string) $post->post_title,
			'type'          => self::type_from_kind( $kind ),
			'kind'          => $kind,
			'area'          => $area,
			'source'        => 'custom',
			'is_custom'     => true,
			'has_theme_file'=> false,
			'schema_staged' => $has_preview,
			'active'        => ( '' === $active || (bool) $active ),
		);

		if ( PostType::KIND_PART === $kind && in_array( $slug, array( 'header', 'footer' ), true ) ) {
			$row['show_on'] = self::show_on_from_conditions( $conditions );
		}

		if ( $include_content ) {
			$row['content'] = $content;
			$row['schema']  = SchemaUtils::resolve_schema_from_content( $content );
		}

		return $row;
	}

	/**
	 * @param string $slug Catalog slug.
	 * @param string $kind template|part.
	 * @return \WP_Post|null
	 */
	private static function find_post_by_slug( string $slug, string $kind ): ?\WP_Post {
		$library = DefaultPosts::get_library_post();
		$exclude = $library instanceof \WP_Post ? array( (int) $library->ID ) : array();

		$query = new WP_Query(
			array(
				'post_type'              => PostType::POST_TYPE,
				'post_status'            => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page'         => 1,
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => false,
				'post__not_in'           => $exclude,
				'meta_query'             => array(
					'relation' => 'AND',
					array(
						'key'   => PostType::META_KIND,
						'value' => $kind,
					),
					array(
						'key'   => PostType::META_SLUG,
						'value' => $slug,
					),
				),
			)
		);

		if ( empty( $query->posts[0] ) || ! $query->posts[0] instanceof \WP_Post ) {
			return null;
		}

		return $query->posts[0];
	}

	/**
	 * @param string               $slug Catalog slug.
	 * @param string               $kind template|part.
	 * @param array<string, mixed> $input Tool input.
	 * @return string|null
	 */
	private static function validate_create( string $slug, string $kind, array $input ): ?string {
		if ( PostType::KIND_TEMPLATE === $kind && 'custom' !== $slug ) {
			$existing = self::find_post_by_slug( $slug, $kind );
			if ( $existing instanceof \WP_Post ) {
				return 'This template type already exists. Only one is allowed — edit the existing item instead.';
			}
		}

		if ( PostType::KIND_PART === $kind && TemplateOptions::is_woocommerce_part_slug( $slug ) ) {
			$existing = self::find_post_by_slug( $slug, $kind );
			if ( $existing instanceof \WP_Post ) {
				return 'This WooCommerce part slug already exists. Edit the existing part instead.';
			}
		}

		unset( $input );

		return null;
	}

	/**
	 * @param \WP_Post|null        $existing Existing post.
	 * @param string               $slug Catalog slug.
	 * @param string               $kind template|part.
	 * @param array<string, mixed> $input Tool input.
	 * @return string|null
	 */
	private static function validate_part_placement( ?\WP_Post $existing, string $slug, string $kind, array $input ): ?string {
		if ( PostType::KIND_PART !== $kind ) {
			return null;
		}

		if ( TemplateOptions::is_woocommerce_part_slug( $slug ) ) {
			return null;
		}

		if ( ! in_array( $slug, array( 'header', 'footer' ), true ) ) {
			return null;
		}

		$area = PostType::area_from_slug( $slug );
		if ( ! empty( $input['area'] ) ) {
			$area = PostType::sanitize_area( $input['area'] );
		}

		$conditions = ( $existing instanceof \WP_Post && ! array_key_exists( 'conditions', $input ) && ! array_key_exists( 'show_on', $input ) )
			? get_post_meta( $existing->ID, PostType::META_CONDITIONS, true )
			: self::conditions_from_input( $input );
		$signature  = Conditions::signature( $conditions );
		$exclude_id = $existing instanceof \WP_Post ? (int) $existing->ID : 0;

		$query = new WP_Query(
			array(
				'post_type'              => PostType::POST_TYPE,
				'post_status'            => array( 'publish', 'draft', 'pending', 'private', 'future' ),
				'posts_per_page'         => 50,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => false,
				'post__not_in'           => $exclude_id ? array( $exclude_id ) : array(),
				'meta_query'             => array(
					array(
						'key'   => PostType::META_KIND,
						'value' => PostType::KIND_PART,
					),
				),
			)
		);

		foreach ( $query->posts as $post_id ) {
			$post_id   = (int) $post_id;
			$part_area = PostType::sanitize_area( get_post_meta( $post_id, PostType::META_AREA, true ) );
			if ( '' === $part_area ) {
				$part_area = PostType::area_from_slug( get_post_meta( $post_id, PostType::META_SLUG, true ) );
			}
			if ( $part_area !== $area ) {
				continue;
			}
			if ( Conditions::signature( get_post_meta( $post_id, PostType::META_CONDITIONS, true ) ) !== $signature ) {
				continue;
			}

			return sprintf(
				'Another part already uses this Area + Show on combination ("%s"). Choose a different show_on value or edit that part instead.',
				get_the_title( $post_id ) ?: __( 'Untitled', 'blockish' )
			);
		}

		return null;
	}

	/**
	 * @param int                  $post_id Post ID.
	 * @param string               $slug Catalog slug.
	 * @param string               $kind template|part.
	 * @param array<string, mixed> $input Tool input.
	 * @param bool                 $is_create Whether this is a new post.
	 * @return void
	 */
	private static function sync_meta( int $post_id, string $slug, string $kind, array $input, bool $is_create ): void {
		update_post_meta( $post_id, PostType::META_KIND, $kind );
		update_post_meta( $post_id, PostType::META_SLUG, $slug );

		if ( array_key_exists( 'active', $input ) ) {
			update_post_meta( $post_id, PostType::META_ACTIVE, (bool) $input['active'] );
		} elseif ( $is_create ) {
			update_post_meta( $post_id, PostType::META_ACTIVE, true );
		}

		if ( PostType::KIND_PART === $kind ) {
			$area = ! empty( $input['area'] )
				? PostType::sanitize_area( $input['area'] )
				: PostType::area_from_slug( $slug );
			update_post_meta( $post_id, PostType::META_AREA, $area );

			if ( ! TemplateOptions::is_woocommerce_part_slug( $slug ) ) {
				if ( array_key_exists( 'conditions', $input ) || array_key_exists( 'show_on', $input ) ) {
					update_post_meta( $post_id, PostType::META_CONDITIONS, self::conditions_from_input( $input ) );
				} elseif ( $is_create ) {
					update_post_meta( $post_id, PostType::META_CONDITIONS, Conditions::default_conditions() );
				}

				if ( isset( $input['priority'] ) ) {
					update_post_meta( $post_id, PostType::META_PRIORITY, (int) $input['priority'] );
				} elseif ( $is_create ) {
					update_post_meta( $post_id, PostType::META_PRIORITY, 10 );
				}
			}
		}
	}

	/**
	 * @param array<string, mixed> $input Tool input.
	 * @return array<int, array<string, string>>
	 */
	private static function conditions_from_input( array $input ): array {
		if ( ! empty( $input['conditions'] ) && is_array( $input['conditions'] ) ) {
			return Conditions::sanitize( $input['conditions'] );
		}

		if ( ! empty( $input['show_on'] ) ) {
			return self::conditions_from_show_on( (string) $input['show_on'] );
		}

		return Conditions::default_conditions();
	}

	/**
	 * @param string $show_on Show-on key.
	 * @return array<int, array<string, string>>
	 */
	private static function conditions_from_show_on( string $show_on ): array {
		$show_on = sanitize_key( $show_on );
		if ( str_starts_with( $show_on, 'post_type:' ) ) {
			$value = sanitize_key( substr( $show_on, strlen( 'post_type:' ) ) );
			if ( ! in_array( $value, array( 'post', 'page' ), true ) ) {
				$value = 'post';
			}
			return array(
				array(
					'type'  => 'include',
					'rule'  => Conditions::RULE_POST_TYPE,
					'value' => $value,
				),
			);
		}

		return array(
			array(
				'type' => 'include',
				'rule' => $show_on ? $show_on : Conditions::RULE_ENTIRE_SITE,
			),
		);
	}

	/**
	 * @param mixed $conditions Stored conditions.
	 * @return string
	 */
	private static function show_on_from_conditions( $conditions ): string {
		$rules = Conditions::sanitize( $conditions );
		$rule  = $rules[0];

		if ( Conditions::RULE_POST_TYPE === $rule['rule'] ) {
			$value = isset( $rule['value'] ) ? (string) $rule['value'] : 'post';
			if ( in_array( $value, array( 'post', 'page' ), true ) ) {
				return 'post_type:' . $value;
			}
			return Conditions::RULE_ENTIRE_SITE;
		}

		return (string) $rule['rule'];
	}

	/**
	 * @param string $slug Catalog slug.
	 * @param string $kind template|part.
	 * @return string
	 */
	private static function default_title_for_slug( string $slug, string $kind ): string {
		$options = PostType::KIND_PART === $kind
			? TemplateOptions::part_slug_options()
			: TemplateOptions::template_slug_options();

		foreach ( $options as $row ) {
			if ( isset( $row['slug'] ) && $row['slug'] === $slug && ! empty( $row['label'] ) ) {
				return (string) $row['label'];
			}
		}

		return $slug;
	}
}
