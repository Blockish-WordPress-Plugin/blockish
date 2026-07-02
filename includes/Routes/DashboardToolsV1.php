<?php

namespace Blockish\Routes;

use WP_REST_Controller;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class DashboardToolsV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	const SCHEMA_OPTION = 'blockish_extension_schema_registry';

	private function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'dashboard-tools';

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_tools_data' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/schemas/cleanup',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'cleanup_schemas' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/class-manager/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_class_manager_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'delete_class_manager_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/class-manager',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'create_class_manager_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/seo-settings',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_seo_settings' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	public function get_tools_data() {
		$schemas = $this->get_saved_schemas();
		$class_manager = $this->get_class_manager_items();
		$seo_settings = array(
			'global_meta_description' => get_option( 'blockish_global_meta_description', '' ),
		);

		return rest_ensure_response(
			array(
				'status'       => 'success',
				'schemas'      => $schemas,
				'classManager' => $class_manager,
				'seoSettings'  => $seo_settings,
			)
		);
	}

	public function update_seo_settings( WP_REST_Request $request ) {
		$global_meta_description = sanitize_text_field( (string) $request->get_param( 'global_meta_description' ) );
		update_option( 'blockish_global_meta_description', $global_meta_description, false );

		return rest_ensure_response(
			array(
				'status'      => 'success',
				'seoSettings' => array(
					'global_meta_description' => get_option( 'blockish_global_meta_description', '' ),
				),
			)
		);
	}

	public function cleanup_schemas( WP_REST_Request $request ) {
		$slug = sanitize_key( (string) $request->get_param( 'slug' ) );
		$all = (bool) $request->get_param( 'all' );

		$registry = get_option( self::SCHEMA_OPTION, array() );
		if ( ! is_array( $registry ) ) {
			$registry = array();
		}

		if ( $all ) {
			$registry = array();
		} elseif ( '' !== $slug ) {
			unset( $registry[ $slug ] );
		}

		update_option( self::SCHEMA_OPTION, $registry, false );

		return rest_ensure_response(
			array(
				'status' => 'success',
				'schemas' => $this->get_saved_schemas(),
			)
		);
	}

	public function update_class_manager_item( WP_REST_Request $request ) {
		$id = absint( $request['id'] );
		if ( $id <= 0 || 'blockish-classes' !== get_post_type( $id ) ) {
			return rest_ensure_response(
				array(
					'status' => 'fail',
					'message' => 'Invalid class ID.',
				)
			);
		}

		$title = $request->get_param( 'title' );
		$content = $request->get_param( 'content' );
		$update = array( 'ID' => $id );
		if ( is_string( $title ) ) {
			$update['post_title'] = sanitize_text_field( $title );
		}
		if ( is_string( $content ) ) {
			$update['post_content'] = wp_kses_post( $content );
		}

		wp_update_post( $update );

		return rest_ensure_response(
			array(
				'status' => 'success',
				'classManager' => $this->get_class_manager_items(),
			)
		);
	}

	public function delete_class_manager_item( WP_REST_Request $request ) {
		$id = absint( $request['id'] );
		if ( $id <= 0 || 'blockish-classes' !== get_post_type( $id ) ) {
			return rest_ensure_response(
				array(
					'status' => 'fail',
					'message' => 'Invalid class ID.',
				)
			);
		}

		wp_delete_post( $id, true );

		return rest_ensure_response(
			array(
				'status' => 'success',
				'classManager' => $this->get_class_manager_items(),
			)
		);
	}

	public function create_class_manager_item( WP_REST_Request $request ) {
		$title = sanitize_text_field( (string) $request->get_param( 'title' ) );
		$content = wp_kses_post( (string) $request->get_param( 'content' ) );

		if ( '' === $title ) {
			return rest_ensure_response(
				array(
					'status' => 'fail',
					'message' => 'Class name is required.',
				)
			);
		}

		$slug = $this->normalize_class_slug( $title );
		if ( '' === $slug ) {
			return rest_ensure_response(
				array(
					'status' => 'fail',
					'message' => 'Invalid class name.',
				)
			);
		}

		$existing = get_posts(
			array(
				'post_type'      => 'blockish-classes',
				'post_status'    => array( 'publish', 'draft', 'private' ),
				'posts_per_page' => -1,
				'fields'         => 'ids',
			)
		);

		foreach ( $existing as $existing_id ) {
			$existing_title = (string) get_the_title( (int) $existing_id );
			if ( $slug === $this->normalize_class_slug( $existing_title ) ) {
				return rest_ensure_response(
					array(
						'status' => 'fail',
						'message' => 'Class already exists.',
					)
				);
			}
		}

		$created_id = wp_insert_post(
			array(
				'post_type'    => 'blockish-classes',
				'post_status'  => 'publish',
				'post_title'   => $title,
				'post_content' => $content,
			),
			true
		);

		if ( is_wp_error( $created_id ) ) {
			return rest_ensure_response(
				array(
					'status' => 'fail',
					'message' => $created_id->get_error_message(),
				)
			);
		}

		return rest_ensure_response(
			array(
				'status' => 'success',
				'classManager' => $this->get_class_manager_items(),
			)
		);
	}

	private function get_saved_schemas() {
		$registry = get_option( self::SCHEMA_OPTION, array() );
		if ( ! is_array( $registry ) ) {
			$registry = array();
		}

		$items = array();
		foreach ( $registry as $slug => $schema ) {
			if ( ! is_array( $schema ) ) {
				continue;
			}
			$attributes = isset( $schema['attributes'] ) && is_array( $schema['attributes'] ) ? $schema['attributes'] : array();
			$items[] = array(
				'slug' => $slug,
				'name' => isset( $schema['name'] ) && is_string( $schema['name'] ) ? $schema['name'] : $slug,
				'attributeCount' => count( $attributes ),
			);
		}

		return array(
			'count' => count( $items ),
			'items' => $items,
		);
	}

	private function get_class_manager_items() {
		$posts = get_posts(
			array(
				'post_type' => 'blockish-classes',
				'post_status' => array( 'publish', 'draft', 'private' ),
				'posts_per_page' => -1,
				'orderby' => 'title',
				'order' => 'ASC',
			)
		);

		$items = array();
		foreach ( $posts as $post ) {
			$title = (string) $post->post_title;
			$items[] = array(
				'id' => (int) $post->ID,
				'title' => $title,
				'slug' => $this->normalize_class_slug( $title ),
				'parent' => (int) $post->post_parent,
				'content' => (string) $post->post_content,
				'modified' => (string) $post->post_modified,
			);
		}

		return array(
			'count' => count( $items ),
			'items' => $items,
		);
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
