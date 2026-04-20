<?php

namespace Blockish\Routes;

use WP_REST_Controller;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class IntegrationsV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	const INTEGRATIONS_OPTION = 'blockish_integrations_list';

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
					'callback'            => array( $this, 'get_integrations' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_integrations' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	public function get_integrations() {
		return rest_ensure_response(
			array(
				'status'       => 'success',
				'integrations' => $this->get_saved_integrations(),
				'message'      => array( 'Integrations list has been fetched successfully.' ),
			)
		);
	}

	public function update_integrations( WP_REST_Request $request ) {
		$updates = $request->get_param( 'integrations' );

		if ( ! is_array( $updates ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => array( 'Invalid payload. Expected: { "integrations": { "slug": { "settings": { "apiKey": "..." } } } }' ),
				)
			);
		}

		$saved = get_option( self::INTEGRATIONS_OPTION, array() );
		$next  = is_array( $saved ) ? $saved : array();

		foreach ( $updates as $slug => $incoming ) {
			$clean_slug = sanitize_key( $slug );
			if ( '' === $clean_slug || ! is_array( $incoming ) ) {
				continue;
			}

			$incoming_settings = isset( $incoming['settings'] ) && is_array( $incoming['settings'] ) ? $incoming['settings'] : array();
			$api_key           = isset( $incoming_settings['apiKey'] ) ? sanitize_text_field( $incoming_settings['apiKey'] ) : '';

			if ( ! isset( $next[ $clean_slug ] ) || ! is_array( $next[ $clean_slug ] ) ) {
				$next[ $clean_slug ] = array();
			}

			$next[ $clean_slug ]['settings'] = array(
				'apiKey' => $api_key,
			);
		}

		update_option( self::INTEGRATIONS_OPTION, $next );

		return rest_ensure_response(
			array(
				'status'       => 'success',
				'integrations' => $next,
				'message'      => array( 'Integrations list has been updated successfully.' ),
			)
		);
	}

	private function get_saved_integrations() {
		$saved = get_option( self::INTEGRATIONS_OPTION, array() );
		return is_array( $saved ) ? $saved : array();
	}
}

