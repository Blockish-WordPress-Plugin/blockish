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
		'blockish-pro' => 'blockish_pro_fs',
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

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/license/resend',
			array(
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'resend_license' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => array(
						'slug'  => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_key',
						),
						'email' => array(
							'type'              => 'string',
							'required'          => true,
							'sanitize_callback' => 'sanitize_email',
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
				'addons' => array(
					'blockish-pro' => \Blockish\Config\Freemius::get_instance()->get_pro_data(),
				),
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
				'addons'  => array(
					'blockish-pro' => \Blockish\Config\Freemius::get_instance()->get_pro_data(),
				),
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

		$has_active     = method_exists( $sdk, 'can_use_premium_code' ) && $sdk->can_use_premium_code();
		$is_registered  = method_exists( $sdk, 'is_registered' ) && $sdk->is_registered();
		$has_local_data = $this->has_addon_in_fs_accounts( $slug, $sdk );

		if ( ! $has_active && ! $is_registered && ! $has_local_data ) {
			return new WP_Error(
				'blockish_no_active_license',
				__( 'This site does not have an active license for this add-on.', 'blockish' ),
				array( 'status' => 400 )
			);
		}

		// 1. If currently licensed, unlink/deactivate on Freemius servers.
		if ( $has_active ) {
			try {
				$method = new \ReflectionMethod( $sdk, '_deactivate_license' );
				$method->setAccessible( true );
				$method->invoke( $sdk, false );
			} catch ( \Throwable $e ) {
				// Continue to cleanup.
			}
		}

		// 2. Tell Freemius servers to delete the site install if registered.
		try {
			if ( method_exists( $sdk, 'get_api_site_scope' ) ) {
				$api_method = new \ReflectionMethod( $sdk, 'get_api_site_scope' );
				$api_method->setAccessible( true );
				$api = $api_method->invoke( $sdk );
				if ( is_object( $api ) && method_exists( $api, 'call' ) ) {
					$api->call( '/', 'delete' );
				}
			}
		} catch ( \Throwable $e ) {
			// Remote deletion may fail if already deleted or network is unreachable; proceed with local purge.
		}

		// 3. Clear scheduled sync crons for this add-on.
		try {
			if ( method_exists( $sdk, 'clear_install_sync_cron' ) ) {
				$sdk->clear_install_sync_cron();
			}
			if ( method_exists( $sdk, 'clear_sync_cron' ) ) {
				$sdk->clear_sync_cron();
			}
		} catch ( \Throwable $e ) {
		}

		// 4. Purge all add-on data (sites, plans, licenses, user-license map, updates) from fs_accounts.
		$this->purge_addon_from_fs_accounts( $slug, $sdk );

		// 5. Reset in-memory properties on the SDK instance.
		try {
			$ref = new \ReflectionClass( $sdk );
			foreach ( array( '_site', '_license', '_licenses', '_plans' ) as $prop_name ) {
				if ( $ref->hasProperty( $prop_name ) ) {
					$prop = $ref->getProperty( $prop_name );
					$prop->setAccessible( true );
					$prop->setValue( $sdk, false );
				}
			}
		} catch ( \Throwable $e ) {
		}

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'message' => __( 'License deactivated and removed from this site.', 'blockish' ),
				'addons'  => array(
					'blockish-pro' => \Blockish\Config\Freemius::get_instance()->get_pro_data(),
				),
				'reload'  => true,
			)
		);
	}

	/**
	 * Determine if fs_accounts contains any stored data for the given add-on.
	 *
	 * @param string    $slug Add-on slug.
	 * @param \Freemius $sdk  Freemius SDK instance.
	 * @return bool
	 */
	private function has_addon_in_fs_accounts( $slug, $sdk ) {
		$accounts = get_option( 'fs_accounts' );
		if ( ! is_array( $accounts ) ) {
			return false;
		}

		if ( ! empty( $accounts['sites'][ $slug ] ) || ! empty( $accounts['plans'][ $slug ] ) ) {
			return true;
		}

		$module_ids = $this->get_addon_module_ids( $slug, $sdk );
		foreach ( $module_ids as $mid ) {
			if ( ! empty( $accounts['all_licenses'][ $mid ] ) || ! empty( $accounts['user_id_license_ids_map'][ $mid ] ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Get possible module/product IDs for an add-on (int and string variants).
	 *
	 * @param string    $slug Add-on slug.
	 * @param \Freemius $sdk  Freemius SDK instance.
	 * @return array<int|string>
	 */
	private function get_addon_module_ids( $slug, $sdk ) {
		$ids = array();
		if ( is_object( $sdk ) && method_exists( $sdk, 'get_id' ) ) {
			$id = $sdk->get_id();
			if ( ! empty( $id ) ) {
				$ids[] = $id;
				$ids[] = (string) $id;
				$ids[] = (int) $id;
			}
		}

		$pro_id = \Blockish\Config\Freemius::PRODUCT_ID;
		$ids[]  = $pro_id;
		$ids[]  = (string) $pro_id;
		$ids[]  = (int) $pro_id;

		return array_values( array_unique( $ids ) );
	}

	/**
	 * Completely purge add-on licenses, sites, plans, and maps from fs_accounts.
	 *
	 * @param string    $slug Add-on slug.
	 * @param \Freemius $sdk  Freemius SDK instance.
	 * @return void
	 */
	private function purge_addon_from_fs_accounts( $slug, $sdk ) {
		$accounts = get_option( 'fs_accounts' );
		if ( ! is_array( $accounts ) ) {
			return;
		}

		$module_ids = $this->get_addon_module_ids( $slug, $sdk );

		// 1. Remove from sites
		if ( isset( $accounts['sites'][ $slug ] ) ) {
			unset( $accounts['sites'][ $slug ] );
		}

		// 2. Remove from plans
		if ( isset( $accounts['plans'][ $slug ] ) ) {
			unset( $accounts['plans'][ $slug ] );
		}

		// 3. Remove from all_licenses
		if ( isset( $accounts['all_licenses'] ) && is_array( $accounts['all_licenses'] ) ) {
			foreach ( $module_ids as $mid ) {
				unset( $accounts['all_licenses'][ $mid ] );
			}
		}

		// 4. Remove from user_id_license_ids_map
		if ( isset( $accounts['user_id_license_ids_map'] ) && is_array( $accounts['user_id_license_ids_map'] ) ) {
			foreach ( $module_ids as $mid ) {
				unset( $accounts['user_id_license_ids_map'][ $mid ] );
			}
		}

		// 5. Remove from updates
		if ( isset( $accounts['updates'] ) && is_array( $accounts['updates'] ) ) {
			foreach ( $module_ids as $mid ) {
				unset( $accounts['updates'][ $mid ] );
			}
		}

		// 6. Remove from admin_notices
		if ( isset( $accounts['admin_notices'][ $slug ] ) ) {
			unset( $accounts['admin_notices'][ $slug ] );
		}

		// 7. Remove from account_addons if present
		if ( isset( $accounts['account_addons'] ) && is_array( $accounts['account_addons'] ) ) {
			foreach ( $accounts['account_addons'] as $parent_id => $addon_ids ) {
				if ( is_array( $addon_ids ) ) {
					$accounts['account_addons'][ $parent_id ] = array_values(
						array_filter(
							$addon_ids,
							function( $id ) use ( $module_ids ) {
								return ! in_array( $id, $module_ids, false );
							}
						)
					);
				}
			}
		}

		update_option( 'fs_accounts', $accounts );

		// Reload in-memory FS_Options singleton if loaded.
		if ( class_exists( '\FS_Options' ) && defined( 'WP_FS__ACCOUNTS_OPTION_NAME' ) ) {
			$accounts_opt = \FS_Options::instance( WP_FS__ACCOUNTS_OPTION_NAME, true );
			if ( is_object( $accounts_opt ) && method_exists( $accounts_opt, 'load' ) ) {
				$accounts_opt->load( true );
			}
		}

		// Delete API cache so stale responses are not served.
		delete_option( 'fs_api_cache' );
	}

	/**
	 * Email the license key to the purchase address via Freemius (branded as Blockish in UI).
	 *
	 * @param WP_REST_Request $request Request.
	 * @return \WP_REST_Response|WP_Error
	 */
	public function resend_license( WP_REST_Request $request ) {
		$slug  = $request->get_param( 'slug' );
		$email = sanitize_email( (string) $request->get_param( 'email' ) );

		if ( ! is_email( $email ) ) {
			return new WP_Error(
				'blockish_invalid_email',
				__( 'Please enter a valid email address.', 'blockish' ),
				array( 'status' => 400 )
			);
		}

		$rate_key = 'blockish_lic_resend_' . md5( strtolower( $email ) . '|' . $slug );
		$attempts = (int) get_transient( $rate_key );
		if ( $attempts >= 3 ) {
			return new WP_Error(
				'blockish_resend_rate_limited',
				__( 'Too many requests. Please wait a while and try again.', 'blockish' ),
				array( 'status' => 429 )
			);
		}
		set_transient( $rate_key, $attempts + 1, HOUR_IN_SECONDS );

		$sdk = $this->resolve_sdk( $slug );
		if ( is_wp_error( $sdk ) ) {
			return $sdk;
		}

		if ( ! method_exists( $sdk, 'get_api_plugin_scope' ) ) {
			return new WP_Error(
				'blockish_freemius_unavailable',
				__( 'License recovery is unavailable right now.', 'blockish' ),
				array( 'status' => 503 )
			);
		}

		$api    = $sdk->get_api_plugin_scope();
		$result = $api->call(
			'/licenses/resend.json',
			'post',
			array(
				'email' => $email,
				'url'   => home_url(),
			)
		);

		$generic_ok = __(
			'If we find a purchase for that email, we will send the license key shortly. Check your inbox and spam folder.',
			'blockish'
		);

		if ( is_object( $result ) && isset( $result->error ) ) {
			$code = isset( $result->error->code ) ? (string) $result->error->code : '';

			// Avoid leaking whether an email exists in our system.
			if ( in_array( $code, array( 'invalid_email', 'no_user', 'no_license' ), true ) ) {
				return rest_ensure_response(
					array(
						'status'  => 'success',
						'message' => $generic_ok,
					)
				);
			}

			$message = ! empty( $result->error->message )
				? (string) $result->error->message
				: __( 'Could not send the license key. Please try again.', 'blockish' );

			return new WP_Error(
				'blockish_resend_failed',
				$message,
				array( 'status' => 400 )
			);
		}

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'message' => $generic_ok,
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
		$slug = $request->get_param( 'slug' );
		$pro  = \Blockish\Config\Freemius::get_instance()->get_pro_data();

		if ( 'blockish-pro' !== $slug ) {
			return new WP_Error(
				'blockish_unknown_addon',
				__( 'Unknown add-on.', 'blockish' ),
				array( 'status' => 404 )
			);
		}

		$context = array(
			'status'      => 'success',
			'plugin_id'   => \Blockish\Config\Freemius::PRODUCT_ID,
			'public_key'  => $pro['public_key'] ?? \Blockish\Config\Freemius::PUBLIC_KEY,
			'name'        => $pro['name'] ?? 'Blockish Pro',
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
