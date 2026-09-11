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
			'/' . $this->rest_base . '/theme-override-settings',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_theme_override_settings' ),
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
		$theme_override_settings = array(
			'global_theme_override_level' => \Blockish\Core\ThemeOverride::get_global_level(),
		);

		return rest_ensure_response(
			array(
				'status'                 => 'success',
				'schemas'                => $schemas,
				'classManager'           => $class_manager,
				'globalInteractions'     => $global_interactions,
				'seoSettings'            => $seo_settings,
				'themeOverrideSettings'  => $theme_override_settings,
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

	public function update_theme_override_settings( WP_REST_Request $request ) {
		$level = \Blockish\Core\ThemeOverride::sanitize_level(
			(int) $request->get_param( 'global_theme_override_level' )
		);
		update_option( \Blockish\Core\ThemeOverride::OPTION_KEY, $level, false );

		return rest_ensure_response(
			array(
				'status'                => 'success',
				'themeOverrideSettings' => array(
					'global_theme_override_level' => \Blockish\Core\ThemeOverride::get_global_level(),
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
			$out['actionType'] = $this->sanitize_interaction_action_type( (string) $item['actionType'] );
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
			$preset = isset( $item['preset'] ) ? $this->sanitize_interaction_preset_id( (string) $item['preset'] ) : 'fadeUp';
			$out['presetOptions'] = $this->sanitize_interaction_preset_options( $item['presetOptions'], $preset );
		}
		if ( isset( $item['className'] ) ) {
			$out['className'] = $this->sanitize_interaction_class_name( (string) $item['className'] );
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
				'scrollY'   => isset( $item['when']['scrollY'] ) ? absint( $item['when']['scrollY'] ) : 80,
				'parallax'  => isset( $item['when']['parallax'] ) ? absint( $item['when']['parallax'] ) : 0,
			);
		}
		if ( isset( $item['action'] ) && is_array( $item['action'] ) ) {
			$action = $item['action'];
			$preset = isset( $action['preset'] ) ? $this->sanitize_interaction_preset_id( (string) $action['preset'] ) : 'fadeUp';
			$out['action'] = array(
				'type'          => isset( $action['type'] ) ? $this->sanitize_interaction_action_type( (string) $action['type'] ) : 'custom',
				'preset'        => $preset,
				'eventName'     => isset( $action['eventName'] ) ? sanitize_text_field( (string) $action['eventName'] ) : '',
				'phase'         => isset( $action['phase'] ) ? sanitize_key( (string) $action['phase'] ) : 'start',
				'className'     => isset( $action['className'] ) ? $this->sanitize_interaction_class_name( (string) $action['className'] ) : '',
				'applyTo'       => isset( $action['applyTo'] ) ? sanitize_text_field( (string) $action['applyTo'] ) : '',
				'presetOptions' => $this->sanitize_interaction_preset_options(
					isset( $action['presetOptions'] ) && is_array( $action['presetOptions'] ) ? $action['presetOptions'] : array(),
					$preset
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
			$motion = $this->sanitize_interaction_motion( isset( $action['motion'] ) ? $action['motion'] : null );
			if ( $motion ) {
				$out['action']['motion'] = $motion;
			}
		}

		return $out;
	}

	/**
	 * Motion numbers stay signed. Missing keys use the preset seed.
	 *
	 * @param array  $opts   Raw presetOptions.
	 * @param string $preset Preset id.
	 * @return array
	 */
	private function sanitize_interaction_preset_options( $opts, $preset = 'fadeUp' ) {
		$opts  = is_array( $opts ) ? $opts : array();
		$seeds = array(
			'fadeIn'    => array( 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ),
			'fadeUp'    => array( 'fromY' => 40, 'toY' => 0, 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ),
			'fadeDown'  => array( 'fromY' => -40, 'toY' => 0, 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ),
			'fadeLeft'  => array( 'fromX' => 40, 'toX' => 0, 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ),
			'fadeRight' => array( 'fromX' => -40, 'toX' => 0, 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ),
			'zoomIn'    => array( 'fromScale' => 85, 'toScale' => 100, 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ),
			'custom'    => array( 'easing' => 'ease' ),
		);
		$seed = isset( $seeds[ $preset ] ) ? $seeds[ $preset ] : $seeds['fadeUp'];
		$clamp = static function ( $value, $min, $max ) {
			return max( $min, min( $max, intval( $value ) ) );
		};
		$easing = isset( $opts['easing'] ) ? sanitize_text_field( (string) $opts['easing'] ) : $seed['easing'];
		$allowed_easing = array(
			'ease',
			'ease-in',
			'ease-out',
			'ease-in-out',
			'linear',
			'cubic-bezier(0.22, 1, 0.36, 1)',
			'power1.inOut',
			'power2.in',
			'power2.out',
			'power2.inOut',
			'none',
			'expo.out',
		);
		if ( ! in_array( $easing, $allowed_easing, true ) ) {
			$easing = 'ease';
		}
		$out = array(
			'duration' => $this->sanitize_interaction_time_seconds( isset( $opts['duration'] ) ? $opts['duration'] : null, 0.6 ),
			'delay'    => $this->sanitize_interaction_time_seconds( isset( $opts['delay'] ) ? $opts['delay'] : null, 0 ),
			'once'     => array_key_exists( 'once', $opts ) ? ! empty( $opts['once'] ) : true,
			'stagger'  => $this->sanitize_interaction_time_seconds( isset( $opts['stagger'] ) ? $opts['stagger'] : null, 0 ),
			'easing'   => $easing,
		);
		$motion_keys = array(
			'fromX'       => array( -400, 400 ),
			'fromY'       => array( -400, 400 ),
			'fromScale'   => array( 0, 200 ),
			'fromRotate'  => array( -180, 180 ),
			'fromOpacity' => array( 0, 100 ),
			'toX'         => array( -400, 400 ),
			'toY'         => array( -400, 400 ),
			'toScale'     => array( 0, 200 ),
			'toRotate'    => array( -180, 180 ),
			'toOpacity'   => array( 0, 100 ),
		);
		foreach ( $motion_keys as $key => $range ) {
			if ( ! array_key_exists( $key, $opts ) && ! array_key_exists( $key, $seed ) ) {
				continue;
			}
			$raw         = array_key_exists( $key, $opts ) ? $opts[ $key ] : $seed[ $key ];
			$out[ $key ] = $clamp( $raw, $range[0], $range[1] );
		}
		return $out;
	}

	/**
	 * GSAP fromTo-compatible tweens. Extra transform keys pass through if present.
	 *
	 * @param mixed $motion Raw motion object.
	 * @return array|null
	 */
	private function sanitize_interaction_motion( $motion ) {
		if ( ! is_array( $motion ) || empty( $motion['tweens'] ) || ! is_array( $motion['tweens'] ) ) {
			return null;
		}
		$tweens = array();
		foreach ( array_slice( $motion['tweens'], 0, 12 ) as $tween ) {
			if ( ! is_array( $tween ) ) {
				continue;
			}
			$clean = array(
				'from'     => $this->sanitize_interaction_gsap_vars( isset( $tween['from'] ) ? $tween['from'] : array() ),
				'to'       => $this->sanitize_interaction_gsap_vars( isset( $tween['to'] ) ? $tween['to'] : array() ),
				'duration' => $this->clamp_interaction_float( isset( $tween['duration'] ) ? $tween['duration'] : 0.6, 0, 30 ),
				'delay'    => $this->clamp_interaction_float( isset( $tween['delay'] ) ? $tween['delay'] : 0, 0, 30 ),
				'ease'     => $this->sanitize_interaction_ease( isset( $tween['ease'] ) ? $tween['ease'] : 'power1.inOut' ),
			);
			if ( array_key_exists( 'position', $tween ) ) {
				if ( is_numeric( $tween['position'] ) ) {
					$clean['position'] = $this->clamp_interaction_float( $tween['position'], 0, 60 );
				} else {
					$clean['position'] = sanitize_text_field( (string) $tween['position'] );
				}
			}
			$tweens[] = $clean;
		}
		if ( ! $tweens ) {
			return null;
		}
		$out = array( 'tweens' => $tweens );
		if ( ! empty( $motion['pin'] ) ) {
			$out['pin'] = true;
		}
		$pin_end = $this->sanitize_interaction_pin_end( isset( $motion['pinEnd'] ) ? $motion['pinEnd'] : '' );
		if ( $pin_end !== '' ) {
			$out['pinEnd'] = $pin_end;
		}
		$pin_start = $this->sanitize_interaction_pin_start( isset( $motion['pinStart'] ) ? $motion['pinStart'] : '' );
		if ( $pin_start !== '' ) {
			$out['pinStart'] = $pin_start;
		}
		if ( array_key_exists( 'scrub', $motion ) ) {
			$scrub = $motion['scrub'];
			if ( true === $scrub || 'true' === $scrub || 'locked' === $scrub ) {
				$out['scrub'] = true;
			} else {
				$out['scrub'] = $this->clamp_interaction_float( $scrub, 0, 3 );
			}
		}
		if ( isset( $motion['transformOrigin'] ) ) {
			$origin = $this->sanitize_interaction_transform_origin( $motion['transformOrigin'] );
			if ( $origin !== '' ) {
				$out['transformOrigin'] = $origin;
			}
		}
		return $out;
	}

	/**
	 * Pin start: auto, 0, or pixel offset.
	 *
	 * @param mixed $raw Raw pinStart.
	 * @return string
	 */
	private function sanitize_interaction_pin_start( $raw ) {
		$s = strtolower( trim( (string) $raw ) );
		if ( '' === $s || 'auto' === $s ) {
			return 'auto';
		}
		if ( '0' === $s || 'top' === $s ) {
			return '0';
		}
		if ( is_numeric( $s ) ) {
			$n = (int) round( (float) $s );
			return (string) max( 0, min( 400, $n ) );
		}
		return '';
	}

	/**
	 * @param mixed $raw Raw transformOrigin.
	 * @return string
	 */
	private function sanitize_interaction_transform_origin( $raw ) {
		$s = sanitize_text_field( (string) $raw );
		if ( '' === $s || strlen( $s ) > 40 ) {
			return '';
		}
		return preg_match( '/^[0-9.%\sleftcenterrighttopbottom-]+$/i', $s ) ? $s : '';
	}

	/**
	 * ScrollTrigger end string (pin distance).
	 *
	 * @param mixed $raw Raw pinEnd.
	 * @return string
	 */
	private function sanitize_interaction_pin_end( $raw ) {
		$s = trim( (string) $raw );
		if ( '' === $s || strlen( $s ) > 32 ) {
			return '';
		}
		return preg_match( '/^[+\-=%\s0-9.a-zA-Z]+$/', $s ) ? $s : '';
	}

	/**
	 * @param mixed $vars Raw GSAP vars.
	 * @return array
	 */
	private function sanitize_interaction_gsap_vars( $vars ) {
		if ( ! is_array( $vars ) ) {
			return array();
		}
		$out    = array();
		$ranges = array(
			'x'         => array( -2000, 2000 ),
			'y'         => array( -2000, 2000 ),
			'z'         => array( -2000, 2000 ),
			'scale'     => array( 0, 10 ),
			'scaleX'    => array( 0, 10 ),
			'scaleY'    => array( 0, 10 ),
			'rotation'  => array( -720, 720 ),
			'rotationX' => array( -720, 720 ),
			'rotationY' => array( -720, 720 ),
			'rotationZ' => array( -720, 720 ),
			'skewX'     => array( -180, 180 ),
			'skewY'     => array( -180, 180 ),
			'xPercent'  => array( -200, 200 ),
			'yPercent'  => array( -200, 200 ),
			'opacity'   => array( 0, 1 ),
			'autoAlpha' => array( 0, 1 ),
		);
		foreach ( $ranges as $key => $range ) {
			if ( ! array_key_exists( $key, $vars ) ) {
				continue;
			}
			$out[ $key ] = $this->clamp_interaction_float( $vars[ $key ], $range[0], $range[1] );
		}
		if ( isset( $vars['transformOrigin'] ) ) {
			$out['transformOrigin'] = sanitize_text_field( (string) $vars['transformOrigin'] );
		}
		return $out;
	}

	private function sanitize_interaction_time_seconds( $value, $fallback ) {
		if ( null === $value || '' === $value ) {
			return (float) $fallback;
		}
		$n = is_numeric( $value ) ? (float) $value : (float) $fallback;
		if ( $n > 30 ) {
			$n = $n / 1000;
		}
		return $this->clamp_interaction_float( $n, 0, 30 );
	}

	private function clamp_interaction_float( $value, $min, $max ) {
		$n = is_numeric( $value ) ? (float) $value : 0.0;
		return max( $min, min( $max, $n ) );
	}

	private function sanitize_interaction_ease( $ease ) {
		$ease = sanitize_text_field( (string) $ease );
		if ( strlen( $ease ) <= 80 && preg_match( '/^[a-z0-9._, +\-()]+$/i', $ease ) ) {
			return $ease;
		}
		return 'power1.inOut';
	}

	/**
	 * Preset ids stay camelCase for CSS classes (fadeUp). sanitize_key would break them.
	 *
	 * @param string $preset Raw preset id.
	 * @return string
	 */
	private function sanitize_interaction_preset_id( $preset ) {
		$preset  = sanitize_text_field( (string) $preset );
		$allowed = array( 'fadeIn', 'fadeUp', 'fadeDown', 'fadeLeft', 'fadeRight', 'zoomIn', 'custom' );
		return in_array( $preset, $allowed, true ) ? $preset : 'fadeUp';
	}

	private function sanitize_interaction_action_type( $type ) {
		$allowed = array( 'preset', 'emit', 'custom', 'toggleClass', 'show', 'hide', 'toggle' );
		$type    = (string) $type;
		return in_array( $type, $allowed, true ) ? $type : 'custom';
	}

	private function sanitize_interaction_class_name( $class ) {
		$class = ltrim( sanitize_text_field( (string) $class ), '.' );
		return sanitize_html_class( $class );
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
