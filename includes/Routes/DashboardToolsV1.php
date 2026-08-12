<?php

namespace Blockish\Routes;

use Blockish\Extensions\ClassUsage;
use Blockish\Extensions\ClassManager;
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
			'/' . $this->rest_base . '/class-manager/panel',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_class_manager_panel' ),
					'permission_callback' => array( $this, 'panel_permissions_check' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'create_class_manager_panel_item' ),
					'permission_callback' => array( $this, 'panel_permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/class-manager/panel/bulk-delete',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'bulk_delete_class_manager_panel_items' ),
					'permission_callback' => array( $this, 'panel_permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/class-manager/panel/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'rename_class_manager_panel_item' ),
					'permission_callback' => array( $this, 'panel_permissions_check' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'delete_class_manager_panel_item' ),
					'permission_callback' => array( $this, 'panel_permissions_check' ),
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
			'/' . $this->rest_base . '/global-interactions',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_global_interactions_route' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_global_interactions' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/global-interactions/(?P<id>[\w-]+)',
			array(
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'delete_global_interaction' ),
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
			'/' . $this->rest_base . '/class-manager/import',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'import_class_manager_dependency' ),
					'permission_callback' => function () {
						return current_user_can( 'edit_posts' );
					},
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/class-manager/regenerate-css',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'regenerate_class_manager_css' ),
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

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/generate-mcp-password',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'generate_mcp_password' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/search-posts',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'search_posts' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/page-interactions/(?P<id>\d+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_page_interactions' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_page_interactions' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	public function panel_permissions_check() {
		return current_user_can( 'edit_posts' );
	}

	public function get_class_manager_panel() {
		return rest_ensure_response(
			array(
				'status' => 'success',
				'panel'  => ClassUsage::panel_data(),
			)
		);
	}

	public function create_class_manager_panel_item( WP_REST_Request $request ) {
		$title = sanitize_text_field( (string) $request->get_param( 'title' ) );
		if ( '' === $title ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Class name is required.',
				)
			);
		}

		$slug = $this->normalize_class_slug( $title );
		if ( '' === $slug ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Invalid class name. Use lowercase letters, numbers, hyphens, and underscores; must start with a letter or underscore.',
				)
			);
		}

		if ( $slug !== strtolower( trim( $title ) ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Class name must already be a valid CSS slug (e.g. hero-card). Spaces and uppercase are not allowed.',
				)
			);
		}

		foreach ( ClassUsage::parent_classes() as $row ) {
			if ( $row['slug'] === $slug ) {
				return rest_ensure_response(
					array(
						'status'  => 'fail',
						'message' => 'Class already exists.',
					)
				);
			}
		}

		$created_id = wp_insert_post(
			array(
				'post_type'    => 'blockish-classes',
				'post_status'  => 'publish',
				'post_title'   => $slug,
				'post_content' => '{}',
				'post_parent'  => 0,
			),
			true
		);

		if ( is_wp_error( $created_id ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => $created_id->get_error_message(),
				)
			);
		}

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'post_id' => (int) $created_id,
				'panel'   => ClassUsage::panel_data(),
			)
		);
	}

	public function rename_class_manager_panel_item( WP_REST_Request $request ) {
		$id = absint( $request['id'] );
		if ( $id <= 0 || 'blockish-classes' !== get_post_type( $id ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Invalid class ID.',
				)
			);
		}

		if ( (int) wp_get_post_parent_id( $id ) > 0 ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Only parent classes can be renamed from the panel.',
				)
			);
		}

		$title = sanitize_text_field( (string) $request->get_param( 'title' ) );
		if ( '' === $title ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Class name is required.',
				)
			);
		}

		$slug = $this->normalize_class_slug( $title );
		if ( '' === $slug ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Invalid class name. Use lowercase letters, numbers, hyphens, and underscores; must start with a letter or underscore.',
				)
			);
		}

		if ( $slug !== strtolower( trim( $title ) ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Class name must already be a valid CSS slug (e.g. hero-card). Spaces and uppercase are not allowed.',
				)
			);
		}

		foreach ( ClassUsage::parent_classes() as $row ) {
			if ( (int) $row['post_id'] !== $id && $row['slug'] === $slug ) {
				return rest_ensure_response(
					array(
						'status'  => 'fail',
						'message' => 'Another class already uses this name.',
					)
				);
			}
		}

		wp_update_post(
			array(
				'ID'         => $id,
				'post_title' => $slug,
			)
		);

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'post_id' => $id,
				'panel'   => ClassUsage::panel_data(),
			)
		);
	}

	public function delete_class_manager_panel_item( WP_REST_Request $request ) {
		$id = absint( $request['id'] );
		if ( $id <= 0 || 'blockish-classes' !== get_post_type( $id ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Invalid class ID.',
				)
			);
		}

		if ( (int) wp_get_post_parent_id( $id ) > 0 ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Only parent classes can be deleted from the panel.',
				)
			);
		}

		wp_delete_post( $id, true );

		return rest_ensure_response(
			array(
				'status' => 'success',
				'panel'  => ClassUsage::panel_data(),
			)
		);
	}

	public function bulk_delete_class_manager_panel_items( WP_REST_Request $request ) {
		$raw_ids = $request->get_param( 'post_ids' );
		if ( ! is_array( $raw_ids ) || empty( $raw_ids ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'No classes selected.',
				)
			);
		}

		$deleted = array();
		foreach ( $raw_ids as $raw_id ) {
			$id = absint( $raw_id );
			if ( $id <= 0 || 'blockish-classes' !== get_post_type( $id ) ) {
				continue;
			}
			if ( (int) wp_get_post_parent_id( $id ) > 0 ) {
				continue;
			}
			wp_delete_post( $id, true );
			$deleted[] = $id;
		}

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'deleted' => $deleted,
				'panel'   => ClassUsage::panel_data(),
			)
		);
	}

	public function get_tools_data() {
		$schemas = $this->get_saved_schemas();
		$class_manager = $this->get_class_manager_items();
		$global_interactions = $this->get_global_interactions();
		$seo_settings = array(
			'global_meta_description' => get_option( 'blockish_global_meta_description', '' ),
		);

		return rest_ensure_response(
			array(
				'status'             => 'success',
				'schemas'            => $schemas,
				'classManager'       => $class_manager,
				'globalInteractions' => $global_interactions,
				'seoSettings'        => $seo_settings,
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

	public function get_global_interactions_route() {
		$data = $this->get_global_interactions();

		return rest_ensure_response(
			array(
				'status'             => 'success',
				'count'              => $data['count'],
				'items'              => $data['items'],
				'globalInteractions' => $data,
			)
		);
	}

	public function update_global_interactions( WP_REST_Request $request ) {
		$interactions = $request->get_param( 'interactions' );

		if ( ! is_array( $interactions ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Invalid interactions payload.',
				)
			);
		}

		$sanitized = array();
		foreach ( $interactions as $interaction ) {
			if ( ! is_array( $interaction ) ) {
				continue;
			}
			$sanitized[] = $this->sanitize_interaction_item( $interaction );
		}

		update_option( 'blockish_global_interactions', array_values( $sanitized ), false );

		$data = $this->get_global_interactions();

		return rest_ensure_response(
			array(
				'status'             => 'success',
				'count'              => $data['count'],
				'items'              => $data['items'],
				'globalInteractions' => $data,
			)
		);
	}

	public function delete_global_interaction( WP_REST_Request $request ) {
		$id = sanitize_text_field( (string) $request->get_param( 'id' ) );

		if ( empty( $id ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Invalid interaction ID.',
				)
			);
		}

		$interactions = get_option( 'blockish_global_interactions', array() );
		if ( ! is_array( $interactions ) ) {
			$interactions = array();
		}

		$updated_interactions = array_filter(
			$interactions,
			function ( $interaction ) use ( $id ) {
				return isset( $interaction['id'] ) && $interaction['id'] !== $id;
			}
		);

		update_option( 'blockish_global_interactions', array_values( $updated_interactions ), false );

		$data = $this->get_global_interactions();

		return rest_ensure_response(
			array(
				'status'             => 'success',
				'count'              => $data['count'],
				'items'              => $data['items'],
				'globalInteractions' => $data,
			)
		);
	}

	/**
	 * Light sanitize for interaction objects (preserve structure for runtime).
	 *
	 * @param array $item Interaction item.
	 * @return array
	 */
	private function sanitize_interaction_item( array $item ) {
		$out = array();

		if ( isset( $item['id'] ) ) {
			$out['id'] = sanitize_text_field( (string) $item['id'] );
		}
		if ( isset( $item['title'] ) ) {
			$out['title'] = sanitize_text_field( (string) $item['title'] );
		}
		if ( isset( $item['scope'] ) ) {
			$out['scope'] = sanitize_key( (string) $item['scope'] );
		}
		if ( isset( $item['event'] ) ) {
			$out['event'] = sanitize_text_field( (string) $item['event'] );
		}
		if ( isset( $item['selector'] ) ) {
			$out['selector'] = sanitize_text_field( (string) $item['selector'] );
		}
		if ( isset( $item['actionType'] ) ) {
			$out['actionType'] = sanitize_key( (string) $item['actionType'] );
		}
		if ( isset( $item['preset'] ) ) {
			$out['preset'] = $this->sanitize_interaction_preset_id( (string) $item['preset'] );
		}
		if ( isset( $item['listenEventName'] ) ) {
			$out['listenEventName'] = sanitize_text_field( (string) $item['listenEventName'] );
		}
		if ( isset( $item['listenPhase'] ) ) {
			$out['listenPhase'] = sanitize_key( (string) $item['listenPhase'] );
		}
		if ( isset( $item['emitEventName'] ) ) {
			$out['emitEventName'] = sanitize_text_field( (string) $item['emitEventName'] );
		}
		if ( isset( $item['emitPhase'] ) ) {
			$out['emitPhase'] = sanitize_key( (string) $item['emitPhase'] );
		}
		if ( isset( $item['presetOptions'] ) && is_array( $item['presetOptions'] ) ) {
			$out['presetOptions'] = array(
				'duration' => isset( $item['presetOptions']['duration'] ) ? absint( $item['presetOptions']['duration'] ) : 600,
				'delay'    => isset( $item['presetOptions']['delay'] ) ? absint( $item['presetOptions']['delay'] ) : 0,
				'once'     => ! empty( $item['presetOptions']['once'] ),
			);
		}
		if ( isset( $item['callbacks'] ) && is_array( $item['callbacks'] ) ) {
			$out['callbacks'] = array_values(
				array_filter(
					array_map(
						static function ( $cb ) {
							return is_string( $cb ) ? $cb : '';
						},
						$item['callbacks']
					)
				)
			);
		}
		if ( isset( $item['when'] ) && is_array( $item['when'] ) ) {
			$out['when'] = array(
				'source'    => isset( $item['when']['source'] ) ? sanitize_key( (string) $item['when']['source'] ) : 'dom',
				'event'     => isset( $item['when']['event'] ) ? sanitize_text_field( (string) $item['when']['event'] ) : 'ready',
				'selector'  => isset( $item['when']['selector'] ) ? sanitize_text_field( (string) $item['when']['selector'] ) : '',
				'eventName' => isset( $item['when']['eventName'] ) ? sanitize_text_field( (string) $item['when']['eventName'] ) : '',
				'phase'     => isset( $item['when']['phase'] ) ? sanitize_key( (string) $item['when']['phase'] ) : 'start',
			);
		}
		if ( isset( $item['action'] ) && is_array( $item['action'] ) ) {
			$action = $item['action'];
			$out['action'] = array(
				'type'          => isset( $action['type'] ) ? sanitize_key( (string) $action['type'] ) : 'custom',
				'preset'        => isset( $action['preset'] ) ? $this->sanitize_interaction_preset_id( (string) $action['preset'] ) : 'fadeUp',
				'eventName'     => isset( $action['eventName'] ) ? sanitize_text_field( (string) $action['eventName'] ) : '',
				'phase'         => isset( $action['phase'] ) ? sanitize_key( (string) $action['phase'] ) : 'start',
				'presetOptions' => isset( $action['presetOptions'] ) && is_array( $action['presetOptions'] )
					? array(
						'duration' => isset( $action['presetOptions']['duration'] ) ? absint( $action['presetOptions']['duration'] ) : 600,
						'delay'    => isset( $action['presetOptions']['delay'] ) ? absint( $action['presetOptions']['delay'] ) : 0,
						'once'     => ! empty( $action['presetOptions']['once'] ),
					)
					: array(
						'duration' => 600,
						'delay'    => 0,
						'once'     => true,
					),
				'callbacks'     => isset( $action['callbacks'] ) && is_array( $action['callbacks'] )
					? array_values(
						array_filter(
							array_map(
								static function ( $cb ) {
									return is_string( $cb ) ? $cb : '';
								},
								$action['callbacks']
							)
						)
					)
					: array(),
			);
		}

		return $out;
	}

	/**
	 * Preset ids stay camelCase for CSS classes (fadeUp). sanitize_key would break them.
	 *
	 * @param string $preset Raw preset id.
	 * @return string
	 */
	private function sanitize_interaction_preset_id( $preset ) {
		$preset  = sanitize_text_field( (string) $preset );
		$allowed = array( 'fadeIn', 'fadeUp', 'fadeDown', 'fadeLeft', 'fadeRight', 'zoomIn' );
		return in_array( $preset, $allowed, true ) ? $preset : 'fadeUp';
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

	public function regenerate_class_manager_css() {
		$result = ClassManager::get_instance()->regenerate_css_cache();
		$deleted = isset( $result['deleted'] ) ? (int) $result['deleted'] : 0;

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'deleted' => $deleted,
				'message' => sprintf(
					/* translators: %d: number of deleted CSS cache files */
					_n(
						'Cleared %d Class Manager CSS cache file. It will rebuild on the next page view.',
						'Cleared %d Class Manager CSS cache files. They will rebuild on the next page view.',
						$deleted,
						'blockish'
					),
					$deleted
				),
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

	/**
	 * Import a Class Manager dependency (template library / cloud bundle).
	 *
	 * Accepts raw css (preferred) or structured content + children.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return WP_REST_Response
	 */
	public function import_class_manager_dependency( WP_REST_Request $request ) {
		$result = \Blockish\Extensions\ClassUsage::import_class_dependency(
			array(
				'name'     => $request->get_param( 'name' ),
				'title'    => $request->get_param( 'title' ),
				'css'      => $request->get_param( 'css' ),
				'content'  => $request->get_param( 'content' ),
				'children' => $request->get_param( 'children' ),
			)
		);

		if ( isset( $result['error'] ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => (string) $result['error'],
				)
			);
		}

		return rest_ensure_response(
			array(
				'status'   => 'success',
				'id'       => (int) $result['post_id'],
				'name'     => (string) $result['name'],
				'created'  => ! empty( $result['created'] ),
				'children' => isset( $result['children'] ) && is_array( $result['children'] )
					? array_values( $result['children'] )
					: array(),
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

	private function get_global_interactions() {
		$interactions = get_option( 'blockish_global_interactions', array() );
		if ( ! is_array( $interactions ) ) {
			$interactions = array();
		}

		return array(
			'count' => count( $interactions ),
			'items' => $interactions,
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

	public function generate_mcp_password( WP_REST_Request $request ) {
		if ( ! class_exists( 'WP_Application_Passwords' ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => 'Application Passwords are not supported on this site.',
				)
			);
		}

		$user_id = get_current_user_id();
		$name    = 'Blockish MCP (' . gmdate( 'Y-m-d H:i:s' ) . ')';

		list( $password, $item ) = \WP_Application_Passwords::create_new_application_password( $user_id, array( 'name' => $name ) );

		if ( is_wp_error( $password ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => $password->get_error_message(),
				)
			);
		}

		return rest_ensure_response(
			array(
				'status'   => 'success',
				'password' => $password,
			)
		);
	}

	public function search_posts( WP_REST_Request $request ) {
		$search = $request->get_param( 'search' );
		
		$args = array(
			'post_type'      => array( 'post', 'page' ),
			'post_status'    => array( 'publish', 'draft', 'private' ),
			'posts_per_page' => 20,
		);

		if ( ! empty( $search ) ) {
			$args['s'] = $search;
		}

		$query = new \WP_Query( $args );
		$posts = array();

		if ( $query->have_posts() ) {
			foreach ( $query->posts as $post ) {
				$posts[] = array(
					'id'    => $post->ID,
					'title' => get_the_title( $post->ID ),
				);
			}
		}

		return rest_ensure_response( $posts );
	}

	public function get_page_interactions( WP_REST_Request $request ) {
		$id   = (int) $request->get_param( 'id' );
		$meta = get_post_meta( $id, 'blockish_page_interactions', true );
		if ( empty( $meta ) ) {
			$meta = array();
		}
		return rest_ensure_response( array(
			'status' => 'success',
			'items'  => $meta,
		) );
	}

	public function update_page_interactions( WP_REST_Request $request ) {
		$id           = (int) $request->get_param( 'id' );
		$interactions = $request->get_param( 'interactions' );
		
		if ( is_array( $interactions ) || is_string( $interactions ) ) {
			update_post_meta( $id, 'blockish_page_interactions', $interactions );
		}

		return rest_ensure_response( array(
			'status' => 'success',
			'items'  => $interactions,
		) );
	}
}
