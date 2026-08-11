<?php
namespace Blockish\Config;

use Blockish\Traits\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Configures and initializes the Blockish Freemius integration.
 */
class Freemius {

	use SingletonTrait;

	/**
	 * Freemius product credentials (Blockish parent).
	 */
	public const PRODUCT_ID = '35566';
	public const PUBLIC_KEY = 'pk_a6ef0401aa745e9a48b96b21c65eb';

	/**
	 * Freemius SDK instance.
	 *
	 * @var \Freemius|false
	 */
	private $sdk = false;

	/**
	 * Initialize the Freemius integration.
	 */
	protected function __construct() {
		$this->sdk = $this->initialize();

		if ( $this->sdk ) {
			$this->configure_parent_redirects( $this->sdk );
			$this->configure_local_icon( $this->sdk );
			$this->configure_parent_notices( $this->sdk );

			// Strip Freemius Plugins-row links before add-ons boot (they fire on this action).
			$this->hide_plugins_row_links( $this->sdk );
			add_action( 'blockish-forms/freemius/loaded', array( $this, 'hide_plugins_row_links' ) );
			add_action( 'blockish-dynamicity/freemius/loaded', array( $this, 'hide_plugins_row_links' ) );

			do_action( 'blockish/freemius/loaded', $this->sdk );
		}
	}

	/**
	 * Silence Freemius WP-admin nags for Core (opt-in email confirmation, etc.).
	 * Licensing / account UX lives in Blockish → Addons.
	 *
	 * @param \Freemius $sdk Freemius instance.
	 * @return void
	 */
	private function configure_parent_notices( $sdk ) {
		if ( ! is_object( $sdk ) || ! method_exists( $sdk, 'add_filter' ) ) {
			return;
		}

		$sdk->add_filter( 'show_admin_notice', array( $this, 'filter_show_admin_notice' ), 10, 2 );
	}

	/**
	 * Hide Freemius connect / pending-opt-in sticky notices on wp-admin.
	 *
	 * @param bool  $show Whether to show the notice.
	 * @param array $msg  Notice payload from Freemius.
	 * @return bool
	 */
	public function filter_show_admin_notice( $show, $msg ) {
		if ( ! is_array( $msg ) ) {
			return $show;
		}

		$id = isset( $msg['id'] ) ? (string) $msg['id'] : '';
		if ( in_array( $id, array( 'activation_pending', 'connect_account' ), true ) ) {
			return false;
		}

		$message = isset( $msg['message'] ) ? wp_strip_all_tags( (string) $msg['message'] ) : '';
		if (
			false !== stripos( $message, 'one step away' ) ||
			false !== stripos( $message, 'Activation Now' ) ||
			false !== stripos( $message, 'confirmation email' ) ||
			false !== stripos( $message, 'complete the opt-in' )
		) {
			return false;
		}

		return $show;
	}

	/**
	 * Force Freemius to use a local plugin icon rather than fetching from WP.org.
	 *
	 * @param \Freemius $sdk Freemius instance.
	 * @return void
	 */
	private function configure_local_icon( $sdk ) {
		if ( ! is_object( $sdk ) || ! method_exists( $sdk, 'add_filter' ) ) {
			return;
		}

		$sdk->add_filter( 'plugin_icon', static function () {
			return BLOCKISH_DIR . 'assets/logo.png';
		} );
	}

	/**
	 * After install/opt-in, always land on the Blockish React dashboard.
	 *
	 * @param \Freemius $sdk Freemius instance.
	 * @return void
	 */
	private function configure_parent_redirects( $sdk ) {
		if ( ! is_object( $sdk ) || ! method_exists( $sdk, 'add_filter' ) ) {
			return;
		}

		$dashboard = static function () {
			return admin_url( 'admin.php?page=blockish-dashboard' );
		};

		$sdk->add_filter( 'after_connect_url', $dashboard );
		$sdk->add_filter( 'after_skip_url', $dashboard );
		$sdk->add_filter( 'after_pending_connect_url', $dashboard );
	}

	/**
	 * Keep Plugins list clean — license/opt-out live in Blockish → Addons, not row links.
	 *
	 * @param \Freemius|false $sdk Freemius instance.
	 * @return void
	 */
	public function hide_plugins_row_links( $sdk ) {
		if ( ! is_object( $sdk ) || ! method_exists( $sdk, 'get_plugin_basename' ) ) {
			return;
		}

		$basename = $sdk->get_plugin_basename();
		if ( ! is_string( $basename ) || '' === $basename ) {
			return;
		}

		$strip = static function ( $links ) {
			if ( ! is_array( $links ) ) {
				return $links;
			}

			foreach ( $links as $key => $html ) {
				$key_s  = is_string( $key ) ? $key : '';
				$html_s = is_string( $html ) ? $html : '';

				$is_fs_key = (bool) preg_match(
					'/(opt-in-or-opt-out|activate-license|upgrade|addons)/i',
					$key_s
				);
				$is_fs_label = (bool) preg_match(
					'/>\s*(Opt Out|Opt In|Change License|Activate License|Upgrade|Add-Ons)\s*</i',
					$html_s
				);

				if ( $is_fs_key || $is_fs_label ) {
					unset( $links[ $key ] );
				}
			}

			return $links;
		};

		add_filter( 'plugin_action_links_' . $basename, $strip, 100 );
		add_filter( 'network_admin_plugin_action_links_' . $basename, $strip, 100 );
	}

	/**
	 * Determine whether real Freemius credentials have been configured.
	 *
	 * @return bool
	 */
	public function is_configured() {
		return (
			(bool) preg_match( '/^[1-9][0-9]*$/', (string) self::PRODUCT_ID ) &&
			(bool) preg_match( '/^pk_[A-Za-z0-9]+$/', self::PUBLIC_KEY )
		);
	}

	/**
	 * Retrieve the initialized Freemius SDK instance.
	 *
	 * @return \Freemius|false
	 */
	public function get_sdk() {
		return $this->sdk;
	}

	/**
	 * Whether this request is (or will be) a REST API request.
	 *
	 * `REST_REQUEST` is only defined after routing; detect early via URI so
	 * Freemius (and license-gated add-ons) boot in time to register routes.
	 *
	 * @return bool
	 */
	private function is_rest_request_early() {
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return true;
		}

		// Plain permalinks: index.php?rest_route=/wp/v2/...
		if ( isset( $_GET['rest_route'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
			return true;
		}

		if ( empty( $_SERVER['REQUEST_URI'] ) ) {
			return false;
		}

		$request_uri = (string) wp_unslash( $_SERVER['REQUEST_URI'] );
		$prefix      = function_exists( 'rest_get_url_prefix' ) ? rest_get_url_prefix() : 'wp-json';
		$prefix      = '/' . trim( (string) $prefix, '/' );

		if ( false !== strpos( $request_uri, $prefix . '/' ) || false !== strpos( $request_uri, $prefix . '?' ) ) {
			return true;
		}

		// Exact /wp-json or /wp-json/
		$path = (string) wp_parse_url( $request_uri, PHP_URL_PATH );
		return $path === $prefix || $path === $prefix . '/';
	}

	/**
	 * Load and initialize the shared Freemius SDK.
	 *
	 * Menu slug matches the Blockish dashboard so Freemius does not create a
	 * second top-level page. Submenus (account/pricing/…) are disabled —
	 * licensing lives under Blockish → Addons.
	 *
	 * @return \Freemius|false
	 */
	private function initialize() {
		if ( ! $this->is_configured() ) {
			return false;
		}

		// Prevent Freemius from bloating the front-end with database queries.
		// We only load the SDK where it's actually needed (admin, ajax, cron, REST, CLI, or webhooks).
		//
		// CRITICAL: REST_REQUEST is defined late (after parse_request). Plugin bootstrap
		// runs earlier, so URI / rest_route detection is required — otherwise add-ons that
		// gate on Freemius never register CPT REST routes and editor saves fail with
		// "No route was found matching the URL and request method."
		$is_admin   = is_admin();
		$is_ajax    = wp_doing_ajax();
		$is_cron    = wp_doing_cron();
		$is_cli     = defined( 'WP_CLI' ) && WP_CLI;
		$is_rest    = $this->is_rest_request_early();
		$is_webhook = isset( $_REQUEST['fs_action'] ) || isset( $_REQUEST['freemius'] );

		if ( ! $is_admin && ! $is_ajax && ! $is_cron && ! $is_cli && ! $is_rest && ! $is_webhook ) {
			return false;
		}

		$sdk_start = BLOCKISH_DIR . 'vendor/freemius/start.php';

		if ( ! file_exists( $sdk_start ) ) {
			return false;
		}

		require_once $sdk_start;

		if ( ! function_exists( 'fs_dynamic_init' ) ) {
			return false;
		}

		return \fs_dynamic_init(
			array(
				'id'                  => self::PRODUCT_ID,
				'slug'                => 'blockish',
				'type'                => 'plugin',
				'public_key'          => self::PUBLIC_KEY,
				'is_premium'          => false,
				'has_premium_version' => false,
				'has_paid_plans'      => false,
				'has_addons'          => true,
				'is_org_compliant'    => true,
				'menu'                => array(
					'slug'        => 'blockish-dashboard',
					'first-path'  => 'admin.php?page=blockish-dashboard',
					'account'     => false,
					'contact'     => false,
					'support'     => false,
					'affiliation' => false,
					'pricing'     => false,
					'addons'      => false,
				),
			)
		);
	}
}
