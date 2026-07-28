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
			// Strip Freemius Plugins-row links before add-ons boot (they fire on this action).
			$this->hide_plugins_row_links( $this->sdk );
			add_action( 'blockish-forms/freemius/loaded', array( $this, 'hide_plugins_row_links' ) );
			add_action( 'blockish-dynamicity/freemius/loaded', array( $this, 'hide_plugins_row_links' ) );

			do_action( 'blockish/freemius/loaded', $this->sdk );
		}
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
	 * Load and initialize the shared Freemius SDK.
	 *
	 * No Freemius menu is registered because Blockish owns its React dashboard
	 * and Addons route.
	 *
	 * @return \Freemius|false
	 */
	private function initialize() {
		if ( ! $this->is_configured() ) {
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
			)
		);
	}
}
