<?php

namespace Blockish\Routes;

use WP_REST_Controller;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ExtensionsV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	const EXTENSION_OPTION = 'blockish_extension_list';

	private function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'extensions';

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_extensions' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_extensions' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	public function get_extensions() {
		$hardcoded_extensions = \Blockish\Config\ExtensionList::get_instance()->get_list('list');
		$saved_extensions = $this->get_saved_extensions();
		$addons = \Blockish\Config\AddonsList::get_instance()->get_list('list');

		foreach ( $hardcoded_extensions as $slug => &$extension ) {
			// Restore the user's saved status
			if ( isset( $saved_extensions[ $slug ]['status'] ) ) {
				$status = $saved_extensions[ $slug ]['status'];
				if ( in_array( $status, array( 'active', 'inactive' ), true ) ) {
					$extension['status'] = $status;
				}
			}

			// Restore settings if they exist
			if ( isset( $saved_extensions[ $slug ]['settings'] ) ) {
				$extension['settings'] = $saved_extensions[ $slug ]['settings'];
			}

			// Override with locked if required addon is not installed
			if ( ! empty( $extension['addon'] ) && isset( $addons[ $extension['addon'] ] ) ) {
				if ( empty( $addons[ $extension['addon'] ]['is_installed'] ) ) {
					$extension['status'] = 'locked';
				}
			}
		}

		return rest_ensure_response(
			array(
				'status'     => 'success',
				'extensions' => $hardcoded_extensions,
				'message'    => array( 'Extensions list has been fetched successfully.' ),
			)
		);
	}

	public function update_extensions( WP_REST_Request $request ) {
		$updates = $request->get_param( 'extensions' );

		if ( ! is_array( $updates ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => array( 'Invalid payload. Expected: { "extensions": { "slug": "active|inactive" } }' ),
				)
			);
		}

		$saved = get_option( self::EXTENSION_OPTION, array() );
		$next = is_array( $saved ) ? $saved : array();

		$extension_list = \Blockish\Config\ExtensionList::get_instance()->get_list( 'list' );

		foreach ( $updates as $slug => $incoming ) {
			if ( ! isset( $next[ $slug ] ) || ! is_array( $next[ $slug ] ) ) {
				continue;
			}

			$status = is_array( $incoming )
				? ( $incoming['status'] ?? $next[ $slug ]['status'] ?? 'active' )
				: $incoming;

			$status = sanitize_key( $status );
			if ( ! in_array( $status, array( 'active', 'inactive' ), true ) ) {
				continue;
			}

			$next[ $slug ]['status'] = $status;

			if ( is_array( $incoming ) && isset( $incoming['settings'] ) && is_array( $incoming['settings'] ) ) {
				$schema = $extension_list[ $slug ]['settings_schema'] ?? array();
				if ( is_array( $schema ) ) {
					$clean_settings = array();
					foreach ( $schema as $key => $type ) {
						if ( ! array_key_exists( $key, $incoming['settings'] ) ) {
							continue;
						}
						$value = $incoming['settings'][ $key ];
						switch ( $type ) {
							case 'boolean':
								$clean_settings[ $key ] = (bool) $value;
								break;
							case 'string':
							default:
								$clean_settings[ $key ] = sanitize_text_field( $value );
								break;
						}
					}

					$next[ $slug ]['settings'] = $clean_settings;
				}
			}
		}

		update_option( self::EXTENSION_OPTION, $next );

		return rest_ensure_response(
			array(
				'status'     => 'success',
				'extensions' => $next,
				'message'    => array( 'Extensions list has been updated successfully.' ),
			)
		);
	}

	private function get_saved_extensions() {
		return get_option( self::EXTENSION_OPTION, array() );
	}
}
