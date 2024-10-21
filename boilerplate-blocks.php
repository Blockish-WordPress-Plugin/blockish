<?php
/**
 * Plugin Name:       Boilerplate Blocks
 * Description:       Starter plugin for bdthemes.
 * Requires at least: 6.6
 * Requires PHP:      7.2
 * Version:           0.1.0
 * Author:            bdthemes
 * Author URI:        https://bdthemes.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       boilerplate-blocks
 */

use BoilerplateBlocks\Core\Blocks;
use BoilerplateBlocks\Core\Enqueue;
use BoilerplateBlocks\Core\ExtenSions;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Main BoilerplateBlocks Class.
 * Implements the singleton pattern to ensure only one instance is running.
 */
final class BoilerplateBlocks {
    
    /**
     * Plugin version.
     *
     * @var string
     */
    const VERSION = '0.1.0';

    /**
     * Holds the instance of this class.
     *
     * @var BoilerplateBlocks|null
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
        require_once BOILERPLATE_BLOCKS_PLUGIN_DIR . 'vendor/autoload.php';

        // Initialize plugin hooks.
        add_action( 'plugins_loaded', array( $this, 'plugins_loaded' ) );
    }

    /**
     * Defines plugin constants for easy access across the plugin.
     *
     * @return void
     */
    public function define_constants() {
        define( 'BOILERPLATE_BLOCKS_PLUGIN_VERSION', self::VERSION );
        define( 'BOILERPLATE_BLOCKS_PLUGIN_NAME', 'Boilerplate Blocks' );
        define( 'BOILERPLATE_BLOCKS_PLUGIN_URL', trailingslashit( plugin_dir_url( __FILE__ ) ) );
        define( 'BOILERPLATE_BLOCKS_PLUGIN_DIR', trailingslashit( plugin_dir_path( __FILE__ ) ) );
        define( 'BOILERPLATE_BLOCKS_INCLUDES_DIR', BOILERPLATE_BLOCKS_PLUGIN_DIR . 'includes/' );
        define( 'BOILERPLATE_BLOCKS_STYLES_DIR', BOILERPLATE_BLOCKS_PLUGIN_DIR . 'build/styles/' );
        define( 'BOILERPLATE_BLOCKS_BLOCKS_DIR', BOILERPLATE_BLOCKS_PLUGIN_DIR . 'build/blocks/' );
        define( 'BOILERPLATE_BLOCKS_EXTENSIONS_DIR', BOILERPLATE_BLOCKS_PLUGIN_DIR . 'build/extensions/' );
        define( 'BOILERPLATE_RESERVED_PLACEHOLDERS', [
            '{{VALUE}}',
            '{{TOP}}',
            '{{BOTTOM}}',
            '{{LEFT}}',
            '{{RIGHT}}',
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
        update_option( 'boilerplate_blocks_version', BOILERPLATE_BLOCKS_PLUGIN_VERSION );

        // Set installed time if it doesn't exist.
        if ( ! get_option( 'boilerplate_blocks_installed_time' ) ) {
            add_option( 'boilerplate_blocks_installed_time', time() );
        }
    }

    /**
     * Fires once all plugins have been loaded.
     * Initializes textdomain and other plugin-wide features.
     *
     * @return void
     */
    public function plugins_loaded() {
        // Load plugin textdomain for translations.
        load_plugin_textdomain( 'boilerplate-blocks', false, BOILERPLATE_BLOCKS_PLUGIN_DIR . 'languages/' );

        // Add a custom class to the admin body tag.
        add_filter( 'admin_body_class', function( $classes ) {
            return $classes . ' boilerplate-blocks';
        });

        // Add custom classes to the front-end body tag.
        add_filter( 'body_class', function( $classes ) {
            return array_merge( $classes, array( 'boilerplate-blocks', 'boilerplate-blocks-frontend' ) );
        });

        add_action( 'admin_enqueue_scripts', [$this, 'admin_enqueue_scripts'] );

        // Load plugin classes.
        Blocks::get_instance();
        Enqueue::get_instance();
        ExtenSions::get_instance();
    }

    public function admin_enqueue_scripts($screen) {
        wp_localize_script( 'wp-block-editor', 'boilerplateBlocks', [
            'ajaxurl' => admin_url( 'admin-ajax.php' ),
            'screen' => $screen
        ]);
    }

    /**
     * Ensures that only one instance of the plugin is running.
     *
     * @return BoilerplateBlocks
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
 * Kickstart the BoilerplateBlocks plugin.
 *
 * @return BoilerplateBlocks
 */
function boilerplate_blocks() {
    return BoilerplateBlocks::instance();
}
boilerplate_blocks();
