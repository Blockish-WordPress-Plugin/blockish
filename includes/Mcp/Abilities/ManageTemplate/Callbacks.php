<?php

namespace Blockish\Mcp\Abilities\ManageTemplate;

use Blockish\Mcp\Abilities\ThemeBuilderTemplates;
use Blockish\Mcp\BlockSchemaMeta;
use Blockish\Mcp\SchemaUtils;
use Blockish\Mcp\TemplateRouting;
use WP_Query;

defined( 'ABSPATH' ) || exit;

class Callbacks {

	public static function manage_template( $input ): array {
		$backend = TemplateRouting::backend();
		if ( TemplateRouting::BACKEND_THEME_BUILDER === $backend ) {
			return ThemeBuilderTemplates::manage_template( is_array( $input ) ? $input : array() );
		}
		if ( TemplateRouting::BACKEND_FSE !== $backend ) {
			return TemplateRouting::unavailable_error();
		}

		return self::manage_fse_template( is_array( $input ) ? $input : array() );
	}

	/**
	 * @param array<string, mixed> $input Tool input.
	 * @return array<string, mixed>
	 */
	private static function manage_fse_template( array $input ): array {
		$theme_slug = wp_get_theme()->get_stylesheet();
		$slug       = $input['slug'] ?? '';

		if ( empty( $slug ) ) {
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

		$args = array(
			'post_type'      => $type,
			'name'           => $slug,
			'post_status'    => 'publish',
			'posts_per_page' => 1,
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
			'tax_query'      => array(
				array(
					'taxonomy' => 'wp_theme',
					'field'    => 'name',
					'terms'    => $theme_slug,
				),
			),
		);

		$query    = new WP_Query( $args );
		$existing = ! empty( $query->posts ) ? $query->posts[0] : null;

		$is_delete = ! empty( $input['delete'] );

		if ( $is_delete ) {
			if ( ! $existing ) {
				return array( 'error' => 'Template not found for deletion.' );
			}
			wp_delete_post( $existing->ID, true );

			return array(
				'backend'       => TemplateRouting::BACKEND_FSE,
				'id'            => $existing->ID,
				'slug'          => $slug,
				'action'        => 'deleted',
				'schema_staged' => false,
			);
		}

		$post_data = array(
			'post_type'   => $type,
			'post_name'   => $slug,
			'post_title'  => $input['title'] ?? ( $existing ? $existing->post_title : $slug ),
			'post_status' => 'publish',
		);
		if ( $has_block_schema ) {
			$existing_content        = $existing ? (string) $existing->post_content : '';
			$post_data['post_content'] = wp_slash(
				SchemaUtils::build_staged_ai_preview_content(
					$existing_content,
					$input['block_schema']
				)
			);
		}

		if ( $existing ) {
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

		wp_set_post_terms( $post_id, $theme_slug, 'wp_theme' );
		if ( 'wp_template_part' === $type && ! empty( $input['area'] ) ) {
			wp_set_post_terms( $post_id, $input['area'], 'wp_template_part_area' );
		}

		$schema_staged = false;
		$warnings      = array();
		if ( $has_block_schema ) {
			if ( ! empty( $input['block_schema'] ) ) {
				$warnings      = BlockSchemaMeta::get_schema_warnings( $input['block_schema'] );
				$schema_staged = true;
			}
		}

		$result = array(
			'backend'       => TemplateRouting::BACKEND_FSE,
			'id'            => $post_id,
			'slug'          => $slug,
			'edit_url'      => get_edit_post_link( $post_id, 'raw' ),
			'action'        => $action,
			'schema_staged' => $schema_staged,
		);
		if ( ! empty( $warnings ) ) {
			$result['warnings'] = $warnings;
		}
		return $result;
	}
}
