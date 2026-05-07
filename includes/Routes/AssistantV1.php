<?php

namespace Blockish\Routes;

use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AssistantV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'assistant';

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'chat' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	public function chat( WP_REST_Request $request ) {
		$payload = $request->get_json_params();
		if ( ! is_array( $payload ) ) {
			$payload = array();
		}

		$response = wp_remote_post(
			trailingslashit( BLOCKISH_AI_ASSISTANT_URL ) . 'assistant',
			array(
				'headers' => array(
					'Content-Type' => 'application/json',
				),
				'body'    => wp_json_encode( $payload ),
				'timeout' => 20,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return rest_ensure_response(
			array(
				'status'      => 'success',
				'status_code' => (int) wp_remote_retrieve_response_code( $response ),
				'response'    => wp_remote_retrieve_body( $response ),
			)
		);
	}
}
