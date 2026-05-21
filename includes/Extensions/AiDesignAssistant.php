<?php

namespace Blockish\Extensions;

defined( 'ABSPATH' ) || exit;

class AiDesignAssistant {
	use \Blockish\Traits\SingletonTrait;

	/**
	 * Constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'localize_editor_data' ), 20 );
	}

	/**
	 * Add assistant runtime data for the editor UI.
	 *
	 * @return void
	 */
	public function localize_editor_data() {
		$handle = 'blockish-extension-ai-design-assistant-editorscript';

		if ( ! wp_script_is( $handle, 'enqueued' ) ) {
			return;
		}

		wp_localize_script(
			$handle,
			'blockishAiDesignAssistant',
			array(
				'assistantWsUrl'       => $this->get_assistant_ws_url(),
				'assistantWsAuthToken' => $this->create_assistant_ws_auth_token(),
				'currentUser'          => $this->get_current_user_payload(),
			)
		);
	}

	/**
	 * Get assistant WebSocket URL from the configured assistant HTTP URL.
	 *
	 * @return string
	 */
	private function get_assistant_ws_url() {
		$url = trailingslashit( BLOCKISH_AI_ASSISTANT_URL ) . 'assistant/ws';

		if ( str_starts_with( $url, 'https://' ) ) {
			return 'wss://' . substr( $url, strlen( 'https://' ) );
		}

		if ( str_starts_with( $url, 'http://' ) ) {
			return 'ws://' . substr( $url, strlen( 'http://' ) );
		}

		return $url;
	}

	/**
	 * Create short-lived signed auth token for direct assistant WebSocket calls.
	 *
	 * @return string
	 */
	private function create_assistant_ws_auth_token() {
		if ( ! is_user_logged_in() || ! current_user_can( 'manage_options' ) ) {
			return '';
		}

		$payload = $this->base64url_encode(
			wp_json_encode(
				array(
					'userId'    => get_current_user_id(),
					'siteUrl'   => home_url(),
					'roles'     => $this->get_current_user_roles(),
					'issuedAt'  => time(),
					'expiresAt' => time() + 30 * MINUTE_IN_SECONDS,
				)
			)
		);
		$signature = $this->base64url_encode(
			hash_hmac( 'sha256', $payload, $this->get_assistant_ws_auth_secret(), true )
		);

		return $payload . '.' . $signature;
	}

	/**
	 * Get shared WebSocket auth secret.
	 *
	 * @return string
	 */
	private function get_assistant_ws_auth_secret() {
		if ( defined( 'BLOCKISH_AI_ASSISTANT_WS_AUTH_SECRET' ) ) {
			return (string) BLOCKISH_AI_ASSISTANT_WS_AUTH_SECRET;
		}

		return 'blockish-local-dev-secret';
	}

	/**
	 * Get current user payload for non-security UI context.
	 *
	 * @return array
	 */
	private function get_current_user_payload() {
		if ( ! is_user_logged_in() ) {
			return array();
		}

		$user = wp_get_current_user();

		return array(
			'id'          => get_current_user_id(),
			'displayName' => $user->display_name,
			'roles'       => $this->get_current_user_roles(),
		);
	}

	/**
	 * Get current user roles.
	 *
	 * @return array
	 */
	private function get_current_user_roles() {
		$user = wp_get_current_user();

		return array_values( array_filter( (array) $user->roles, 'is_string' ) );
	}

	/**
	 * Base64 URL encode a value.
	 *
	 * @param string $value Value to encode.
	 * @return string
	 */
	private function base64url_encode( $value ) {
		return rtrim( strtr( base64_encode( (string) $value ), '+/', '-_' ), '=' );
	}

	/**
	 * Register AI Design Assistant post type.
	 *
	 * Public for now. We can tighten capabilities/visibility later and
	 * control it fully through custom REST endpoints.
	 *
	 * @return void
	 */
	public function register_post_type() {
		$labels = array(
			'name'               => __( 'Assistant Chat History', 'blockish' ),
			'singular_name'      => __( 'Assistant Chat History', 'blockish' ),
			'add_new'            => __( 'Add New', 'blockish' ),
			'add_new_item'       => __( 'Add New Assistant Chat History', 'blockish' ),
			'edit_item'          => __( 'Edit Assistant Chat History', 'blockish' ),
			'new_item'           => __( 'New Assistant Chat History', 'blockish' ),
			'view_item'          => __( 'View Assistant Chat History', 'blockish' ),
			'search_items'       => __( 'Search Assistant Chat History', 'blockish' ),
			'not_found'          => __( 'No posts found.', 'blockish' ),
			'not_found_in_trash' => __( 'No posts found in Trash.', 'blockish' ),
			'all_items'          => __( 'Assistant Chat History', 'blockish' ),
			'menu_name'          => __( 'Assistant Chat History', 'blockish' ),
		);

		register_post_type(
			'blockish-ai-history',
			array(
				'labels'                => $labels,
				'public'                => true,
				'publicly_queryable'    => true,
				'show_ui'               => true,
				'show_in_menu'          => true,
				'show_in_admin_bar'     => true,
				'show_in_nav_menus'     => true,
				'exclude_from_search'   => false,
				'has_archive'           => true,
				'hierarchical'          => false,
				'menu_position'         => 25,
				'supports'              => array( 'title', 'editor' ),
				'show_in_rest'          => true,
				'rest_base'             => 'blockish-ai-history',
				'rest_controller_class' => 'WP_REST_Posts_Controller',
				'capability_type'       => 'post',
				'map_meta_cap'          => true,
				'rewrite'               => array( 'slug' => 'blockish-ai-history' ),
				'query_var'             => true,
			)
		);
	}
}
