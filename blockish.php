<?php
/**
 * Plugin Name:       Blockish
 * Description:       A collection of creative Gutenberg blocks to help you build beautiful websites.
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Version:           1.0.3
 * Author:            wowdevs
 * Author URI:        https://wowdevs.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       blockish
 * Domain Path:       /languages
 * 
 * @package           Blockish
 */

use Blockish\Core\Blocks;
use Blockish\Core\Dashboard;
use Blockish\Core\Enqueue;
use Blockish\Core\StyleGenerator;
use Blockish\Extensions\ExtensionsLoader;
use Blockish\Routes\BlocksV1;
use Blockish\Routes\DashboardToolsV1;
use Blockish\Routes\ExtensionsV1;
use Blockish\Routes\IntegrationsV1;
use Blockish\Routes\SVGUploaderV1;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Main Blockish Class.
 * Implements the singleton pattern to ensure only one instance is running.
 */
final class Blockish {
    
    /**
     * Plugin version.
     *
     * @var string
     */
    const VERSION = '1.0.3';

    /**
     * Holds the instance of this class.
     *
     * @var Blockish|null
     */
    private static $instance = null;

    /**
     * Private constructor for singleton pattern.
     * Prevents the direct creation of an object from this class.
     */
    private function __construct() {
        // Define plugin constants.
        $this->define_constants();

        // Load after plugin activation.
        register_activation_hook( __FILE__, array( $this, 'activated_plugin' ) );

        // Load autoloader (vendor/autoload.php).
        require_once BLOCKISH_DIR . 'vendor/autoload.php';

        // Initialize plugin hooks.
        add_action( 'plugins_loaded', array( $this, 'plugins_loaded' ) );
    }

    /**
     * Defines plugin constants for easy access across the plugin.
     *
     * @return void
     */
    public function define_constants() {
        define( 'BLOCKISH_VERSION', self::VERSION );
        define( 'BLOCKISH_NAME', '' );
        define( 'BLOCKISH_URL', trailingslashit( plugin_dir_url( __FILE__ ) ) );
        define( 'BLOCKISH_DIR', trailingslashit( plugin_dir_path( __FILE__ ) ) );
        define( 'BLOCKISH_INCLUDES_DIR', BLOCKISH_DIR . 'includes/' );
        define( 'BLOCKISH_STYLES_DIR', BLOCKISH_DIR . 'build/styles/' );
        define( 'BLOCKISH_BLOCKS_DIR', BLOCKISH_DIR . 'build/blocks/' );
        define( 'BLOCKISH_EXTENSIONS_DIR', BLOCKISH_DIR . 'build/extensions/' );
        define( 'BLOCKISH_RESERVED_PLACEHOLDERS', [
            '{{VALUE}}',
            '{{TOP}}',
            '{{BOTTOM}}',
            '{{LEFT}}',
            '{{RIGHT}}',
            '{{TOP_LEFT}}',
            '{{TOP_RIGHT}}',
            '{{BOTTOM_LEFT}}',
            '{{BOTTOM_RIGHT}}',
        ] );
    }

    /**
     * Handles tasks to run upon plugin activation.
     * Sets version and installed time in the WordPress options table.
     *
     * @return void
     */
    public function activated_plugin() {
        // Update plugin version in the options table.
        update_option( 'blockish_version', BLOCKISH_VERSION );

        // Set installed time if it doesn't exist.
        if ( ! get_option( 'blockish_installed_time' ) ) {
            add_option( 'blockish_installed_time', time() );
        }
    }

    /**
     * Fires once all plugins have been loaded.
     * Initializes textdomain and other plugin-wide features.
     *
     * @return void
     */
    public function plugins_loaded() {

        // Add a custom class to the admin body tag.
        add_filter( 'admin_body_class', function( $classes ) {
            return $classes . ' blockish';
        });

        // Add custom classes to the front-end body tag.
        add_filter( 'body_class', function( $classes ) {
            return array_merge( $classes, array( 'blockish', 'blockish-frontend' ) );
        });

        add_action( 'admin_enqueue_scripts', [$this, 'admin_enqueue_scripts'] );

        // Load plugin classes.
        Dashboard::get_instance();
        Enqueue::get_instance();
        StyleGenerator::get_instance();
        BlocksV1::get_instance();
        ExtensionsV1::get_instance();
        IntegrationsV1::get_instance();
        DashboardToolsV1::get_instance();
        SVGUploaderV1::get_instance();
        Blocks::get_instance();
        ExtensionsLoader::get_instance();
    }

    public function admin_enqueue_scripts($screen) {
        wp_localize_script( 'wp-block-editor', 'blockish', [
            'ajaxurl' => admin_url( 'admin-ajax.php' ),
            'screen' => $screen
        ]);
    }

    /**
     * Ensures that only one instance of the plugin is running.
     *
     * @return Blockish
     */
    public static function instance() {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Prevents the plugin from being cloned.
     */
    public function __clone() {}

    /**
     * Prevents the plugin from being unserialized.
     */
    public function __wakeup() {}
}

/**
 * Kickstart the Blockish plugin.
 *
 * @return Blockish
 */
function blockish() {
    return Blockish::instance();
}
blockish();



/**
 * SDK Integration
 */

if ( ! function_exists( 'blockish_dci_plugin' ) ) {
	function blockish_dci_plugin() {

		// Include DCI SDK.
		require_once dirname( __FILE__ ) . '/dci/start.php';

		dci_dynamic_init( array(
			'product_id'           => 5,
			'plugin_name'          => 'Blockish - Creative Gutenberg Blocks', // make simple, must not empty
			'plugin_title'         => 'Love using Blockish? Congrats 🎉  ( Never miss an Important Update )', // You can describe your plugin title here
			'plugin_icon'          => plugins_url( 'assets/imgs/logo.svg', __FILE__ ), // delete the line if you don't need
			'api_endpoint'         => 'https://dashboard.wowdevs.com/wp-json/dci/v1/data-insights',
			'slug'                 => 'no-need', // folder-name or write 'no-need' if you don't want to use
			'core_file'            => false,
			'plugin_deactivate_id' => false,
			'menu'                 => array(
				'slug' => 'blockish-dashboard',
			),
			'public_key'           => 'pk_AyXCKb51WP7urdbX5vdqe2ScQewFI3Bn',
			'is_premium'           => false,
			// 'custom_data' => array(
			// 'test' => 'value',
			// ),
			'popup_notice'         => false,
			'deactivate_feedback'  => true,
			// 'delay_time'    => array(
			// 'time' => 3 * DAY_IN_SECONDS,
			// ),
			'text_domain'          => 'blockish',
			'plugin_msg'           => '<p>Be Top-contributor by sharing non-sensitive plugin data and create an impact to the global WordPress community today! You can receive valuable emails periodically.</p>',
		) );
	}
	add_action( 'admin_init', 'blockish_dci_plugin' );
}

