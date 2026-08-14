<?php

/**
 * Plugin Name:       Blockish – MCP AI Site Builder for Block Editor
 * Description:       Build sites with AI via MCP (Cursor, Claude). 30+ Gutenberg blocks, Class Manager, and review & Accept in the editor.
 * Requires at least: 6.2
 * Requires PHP:      7.4
 * Version:           1.2.4
 * Author:            wowdevs
 * Author URI:        https://wowdevs.com
 * Plugin URI:        https://blockish.wowdevs.com/
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       blockish
 * Domain Path:       /languages
 * 
 * @package           Blockish
 */

use Blockish\Config\ExtensionList;
use Blockish\Config\Freemius as FreemiusConfig;
use Blockish\Core\Blocks;
use Blockish\Core\Dashboard;
use Blockish\Core\Enqueue;
use Blockish\Core\LicenseNotice;
use Blockish\Core\SEO;
use Blockish\Core\StyleGenerator;
use Blockish\Extensions\ExtensionsLoader;
use Blockish\Mcp\Loader;
use Blockish\Routes\AddonsV1;
use Blockish\Routes\BlocksV1;
use Blockish\Routes\AiPreviewQueueV1;
use Blockish\Routes\ClassPreviousV1;
use Blockish\Routes\DashboardToolsV1;
use Blockish\Routes\EditorSyncV1;
use Blockish\Routes\ExtensionsV1;
use Blockish\Routes\IntegrationsV1;
use Blockish\Routes\SVGUploaderV1;

// Exit if accessed directly.
if (! defined('ABSPATH')) {
    exit;
}

/**
 * Main Blockish Class.
 * Implements the singleton pattern to ensure only one instance is running.
 */
final class Blockish
{

    /**
     * Plugin version.
     *
     * @var string
     */
    const VERSION = '1.2.4';

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
    private function __construct()
    {
        // Define plugin constants.
        $this->define_constants();

        // Load after plugin activation.
        register_activation_hook(__FILE__, array($this, 'activated_plugin'));

        // Load autoloader (vendor/autoload.php).
        require_once BLOCKISH_DIR . 'vendor/autoload_packages.php';

        // Initialize Freemius after the Blockish autoloader is available.
        FreemiusConfig::get_instance();

        // Initialize plugin hooks.
        add_action('plugins_loaded', array($this, 'plugins_loaded'));
    }

    /**
     * Defines plugin constants for easy access across the plugin.
     *
     * @return void
     */
    public function define_constants()
    {
        define('BLOCKISH_VERSION', self::VERSION);
        define('BLOCKISH_NAME', '');
        define('BLOCKISH_URL', trailingslashit(plugin_dir_url(__FILE__)));
        define('BLOCKISH_DIR', trailingslashit(plugin_dir_path(__FILE__)));
        define('BLOCKISH_INCLUDES_DIR', BLOCKISH_DIR . 'includes/');
        define('BLOCKISH_STYLES_DIR', BLOCKISH_DIR . 'build/styles/');
        define('BLOCKISH_BLOCKS_DIR', BLOCKISH_DIR . 'build/blocks/');
        define('BLOCKISH_EXTENSIONS_DIR', BLOCKISH_DIR . 'build/extensions/');
        define('BLOCKISH_TEMPLATE_LIBRARY_URL', 'https://blockish.wowdevs.com/wp-json/blockish-template-library/v1');
        define('BLOCKISH_TEMPLATE_LIBRARY_TOKEN', 'blockish-design-library');
        define('BLOCKISH_RESERVED_PLACEHOLDERS', [
            '{{VALUE}}',
            '{{TOP}}',
            '{{BOTTOM}}',
            '{{LEFT}}',
            '{{RIGHT}}',
            '{{TOP_LEFT}}',
            '{{TOP_RIGHT}}',
            '{{BOTTOM_LEFT}}',
            '{{BOTTOM_RIGHT}}',
        ]);
    }

    /**
     * Handles tasks to run upon plugin activation.
     * Sets version and installed time in the WordPress options table.
     *
     * @return void
     */
    public function activated_plugin()
    {
        // Update plugin version in the options table.
        update_option('blockish_version', BLOCKISH_VERSION);

        // Set installed time if it doesn't exist.
        if (! get_option('blockish_installed_time')) {
            add_option('blockish_installed_time', time());
        }
    }

    /**
     * Fires once all plugins have been loaded.
     * Initializes textdomain and other plugin-wide features.
     *
     * @return void
     */
    public function plugins_loaded()
    {

        // Add a custom class to the admin body tag.
        add_filter('admin_body_class', function ($classes) {
            return $classes . ' blockish';
        });

        // Add custom classes to the front-end body tag.
        add_filter('body_class', function ($classes) {
            return array_merge($classes, array('blockish', 'blockish-frontend'));
        });

        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts']);

        // Load plugin classes.
        Dashboard::get_instance();
        Enqueue::get_instance();
        StyleGenerator::get_instance();
        LicenseNotice::get_instance();
        BlocksV1::get_instance();
        ExtensionsV1::get_instance();
        EditorSyncV1::get_instance();
        ClassPreviousV1::get_instance();
        AiPreviewQueueV1::get_instance();
        DashboardToolsV1::get_instance();
        AddonsV1::get_instance();
        IntegrationsV1::get_instance();
        SVGUploaderV1::get_instance();
        Blocks::get_instance();
        ExtensionsLoader::get_instance();
        SEO::get_instance();
        \Blockish\Core\MagicLogin::get_instance();

        if (! class_exists('WP\MCP\Core\McpAdapter')) {
            // MCP Adapter is not active — show an admin notice or return early.
            return;
        }

        // Defer the extension-list check (and anything that depends on it, like
        // translated strings in ExtensionList) until init — checking this early,
        // directly in plugins_loaded, triggers WP's "translation loaded too early" notice.
        add_action('init', [$this, 'maybe_init_mcp'], 1);
    }

    public function maybe_init_mcp()
    {
        if (empty(ExtensionList::get_instance()->get_list('active')['mcp-ai'])) {
            // AI/MCP access extension is disabled for this site — do not expose any abilities.
            return;
        }

        \WP\MCP\Core\McpAdapter::instance();
        Loader::get_instance();
    }

    public function admin_enqueue_scripts($screen)
    {
        wp_localize_script('wp-block-editor', 'blockish', [
            'ajaxurl' => admin_url('admin-ajax.php'),
            'screen' => $screen
        ]);
    }

    /**
     * Ensures that only one instance of the plugin is running.
     *
     * @return Blockish
     */
    public static function instance()
    {
        if (is_null(self::$instance)) {
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
function blockish()
{
    return Blockish::instance();
}

/**
 * Retrieve the Blockish Freemius SDK instance.
 *
 * @return \Freemius|false
 */
function blockish_fs()
{
    return FreemiusConfig::get_instance()->get_sdk();
}

blockish();
