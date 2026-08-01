<?php

namespace Blockish\Routes;

use WP_REST_Controller;
use WP_REST_Request;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST endpoints for Blockish add-on license management (Freemius).
 */
class AddonsV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	/**
	 * Map dashboard addon slug → Freemius helper function.
	 *
	 * @var array<string, string>
	 */
	private $helpers = array(
		'blockish-forms'      => 'blockish_forms_fs',
		'blockish-dynamicity' => 'blockish_dynamicity_fs',
	);

	private function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'addons';

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_addons' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/license/activate',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'activate_license' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => array(
						'slug'        => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_key',
						),
						'license_key' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_text_field',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/license/deactivate',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'deactivate_license' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => array(
						'slug' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_key',
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/checkout-context',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_checkout_context' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => array(
						'slug' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_key',
						),
					),
				),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	public function get_addons() {
		return rest_ensure_response(
			array(
				'status' => 'success',
				'addons' => \Blockish\Config\AddonsList::get_instance()->refresh_list(),
			)
		);
	}

	public function activate_license( WP_REST_Request $request ) {
		$slug        = $request->get_param( 'slug' );
		$license_key = trim( (string) $request->get_param( 'license_key' ) );

		if ( '' === $license_key ) {
			return new WP_Error(
				'blockish_missing_license_key',
				__( 'Please enter a license key.', 'blockish' ),
				array( 'status' => 400 )
			);
		}

		$sdk = $this->resolve_sdk( $slug );
		if ( is_wp_error( $sdk ) ) {
			return $sdk;
		}

		if ( ! method_exists( $sdk, 'activate_migrated_license' ) ) {
			return new WP_Error(
				'blockish_freemius_unavailable',
				__( 'License activation is unavailable. Freemius SDK is missing activate support.', 'blockish' ),
				array( 'status' => 500 )
			);
		}

		$result = $sdk->activate_migrated_license( $license_key );

		if ( empty( $result['success'] ) ) {
			$message = ! empty( $result['error'] )
				? (string) $result['error']
				: __( 'License activation failed. Check the key and try again.', 'blockish' );

			return new WP_Error(
				'blockish_license_activation_failed',
				$message,
				array( 'status' => 400 )
			);
		}

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'message' => __( 'License activated successfully. Reload the page to load premium features.', 'blockish' ),
				'addons'  => \Blockish\Config\AddonsList::get_instance()->refresh_list(),
				'reload'  => true,
			)
		);
	}

	public function deactivate_license( WP_REST_Request $request ) {
		$slug = $request->get_param( 'slug' );
		$sdk  = $this->resolve_sdk( $slug );

		if ( is_wp_error( $sdk ) ) {
			return $sdk;
		}

		if ( ! method_exists( $sdk, 'can_use_premium_code' ) || ! $sdk->can_use_premium_code() ) {
			return new WP_Error(
				'blockish_no_active_license',
				__( 'This site does not have an active license for this add-on.', 'blockish' ),
				array( 'status' => 400 )
			);
		}

		try {
			$method = new \ReflectionMethod( $sdk, '_deactivate_license' );
			$method->setAccessible( true );
			$method->invoke( $sdk, false );
		} catch ( \Throwable $e ) {
			return new WP_Error(
				'blockish_license_deactivation_failed',
				__( 'License deactivation failed.', 'blockish' ),
				array( 'status' => 500 )
			);
		}

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'message' => __( 'License deactivated.', 'blockish' ),
				'addons'  => \Blockish\Config\AddonsList::get_instance()->refresh_list(),
				'reload'  => true,
			)
		);
	}

	/**
	 * Provide checkout options for Buy / Upgrade, including the active license key when present.
	 *
	 * @param WP_REST_Request $request Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function get_checkout_context( WP_REST_Request $request ) {
		$slug  = $request->get_param( 'slug' );
		$addons = \Blockish\Config\AddonsList::get_instance()->refresh_list();

		if ( empty( $addons[ $slug ] ) || ! empty( $addons[ $slug ]['is_bundle'] ) ) {
			return new WP_Error(
				'blockish_unknown_addon',
				__( 'Unknown add-on.', 'blockish' ),
				array( 'status' => 404 )
			);
		}

		$addon = $addons[ $slug ];
		$context = array(
			'status'      => 'success',
			'plugin_id'   => $addon['freemius_id'] ?? '',
			'public_key'  => $addon['public_key'] ?? '',
			'name'        => $addon['name'] ?? $slug,
			'license_key' => '',
			'is_upgrade'  => false,
		);

		$sdk = $this->resolve_sdk( $slug );
		if ( ! is_wp_error( $sdk ) && method_exists( $sdk, '_get_license' ) ) {
			$license = $sdk->_get_license();
			if (
				is_object( $license )
				&& ! empty( $license->secret_key )
				&& method_exists( $sdk, 'can_use_premium_code' )
				&& $sdk->can_use_premium_code()
			) {
				$context['license_key'] = (string) $license->secret_key;
				$context['is_upgrade']  = true;
			}
		}

		return rest_ensure_response( $context );
	}

	/**
	 * Resolve Freemius SDK for an add-on slug.
	 *
	 * @param string $slug Add-on slug.
	 * @return \Freemius|WP_Error
	 */
	private function resolve_sdk( $slug ) {
		if ( empty( $this->helpers[ $slug ] ) ) {
			return new WP_Error(
				'blockish_unknown_addon',
				__( 'Unknown add-on.', 'blockish' ),
				array( 'status' => 404 )
			);
		}

		if ( ! function_exists( 'blockish_fs' ) || ! blockish_fs() ) {
			return new WP_Error(
				'blockish_parent_freemius',
				__( 'Blockish Freemius is not configured. Set the parent product ID and public key first.', 'blockish' ),
				array( 'status' => 503 )
			);
		}

		$helper = $this->helpers[ $slug ];

		if ( ! function_exists( $helper ) ) {
			return new WP_Error(
				'blockish_addon_not_installed',
				__( 'Install and activate this add-on plugin before managing its license.', 'blockish' ),
				array( 'status' => 400 )
			);
		}

		$sdk = call_user_func( $helper );

		if ( ! is_object( $sdk ) ) {
			return new WP_Error(
				'blockish_addon_freemius',
				__( 'This add-on’s Freemius credentials are not configured yet.', 'blockish' ),
				array( 'status' => 503 )
			);
		}

		return $sdk;
	}
}
