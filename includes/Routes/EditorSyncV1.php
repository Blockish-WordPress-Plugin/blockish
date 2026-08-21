<?php

namespace Blockish\Routes;

use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class EditorSyncV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'check-refresh';

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'check_refresh' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'edit_posts' );
	}

	public function check_refresh( WP_REST_Request $request ) {
		$post_id = $request->get_param( 'post_id' );

		if ( ! $post_id ) {
			return rest_ensure_response(
				array(
					'refresh' => false,
				)
			);
		}

		$post_id        = sanitize_text_field( $post_id );
		$transient_name = 'blockish_ai_refresh_' . $post_id;
		$needs_refresh  = get_transient( $transient_name );

		if ( $needs_refresh ) {
			// Consume immediately so one flag cannot keep re-firing.
			delete_transient( $transient_name );
			return rest_ensure_response(
				array(
					'refresh' => true,
					// Client soft-syncs; token helps debugging / future debounce.
					'token'   => is_scalar( $needs_refresh ) ? (string) $needs_refresh : '1',
				)
			);
		}

		return rest_ensure_response(
			array(
				'refresh' => false,
			)
		);
	}
}
