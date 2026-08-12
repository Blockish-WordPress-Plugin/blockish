<?php
namespace Blockish\Routes;

use Blockish\Core\Integrations;
use WP_REST_Controller;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST: Blockish Integrations (global connections).
 */
class IntegrationsV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'integrations';

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_items' ),
					'permission_callback' => array( $this, 'permissions_check_read' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<key>[a-z0-9\-]+)',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_item' ),
					'permission_callback' => array( $this, 'permissions_check_read' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( $this, 'delete_item' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	/**
	 * Form editors need to list connected destinations without managing credentials.
	 */
	public function permissions_check_read() {
		return current_user_can( 'edit_posts' );
	}

	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	public function get_items( $request ) {
		return rest_ensure_response( Integrations::get_public_list() );
	}

	public function get_item( $request ) {
		$key = sanitize_key( $request['key'] );
		$def = Integrations::get_definition( $key );
		if ( ! $def ) {
			return new WP_Error( 'invalid_integration', __( 'Unknown integration.', 'blockish' ), array( 'status' => 404 ) );
		}
		return rest_ensure_response( Integrations::format_public_item( $def ) );
	}

	public function update_item( $request ) {
		$key    = sanitize_key( $request['key'] );
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = array();
		}
		$config = isset( $params['config'] ) && is_array( $params['config'] )
			? $params['config']
			: $params;

		$result = Integrations::save_connection( $key, $config );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response(
			array(
				'item'    => $result,
				'message' => __( 'Integration saved.', 'blockish' ),
			)
		);
	}

	public function delete_item( $request ) {
		$key    = sanitize_key( $request['key'] );
		$result = Integrations::disconnect( $key );
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		return rest_ensure_response(
			array(
				'item'    => $result,
				'message' => __( 'Integration disconnected.', 'blockish' ),
			)
		);
	}
}
