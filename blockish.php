<?php

/**
 * Plugin Name:       Blockish
 * Description:       A collection of creative Gutenberg blocks to help you build beautiful websites.
 * Requires at least: 6.1
 * Requires PHP:      7.4
 * Version:           1.0.8
 * Author:            wowdevs
 * Author URI:        https://wowdevs.com
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       blockish
 * Domain Path:       /languages
 * 
 * @package           Blockish
 */

use Blockish\Config\ExtensionList;
use Blockish\Core\Blocks;
use Blockish\Core\Dashboard;
use Blockish\Core\Enqueue;
use Blockish\Core\StyleGenerator;
use Blockish\Extensions\ExtensionsLoader;
use Blockish\Mcp\Loader;
use Blockish\Routes\BlocksV1;
use Blockish\Routes\DashboardToolsV1;
use Blockish\Routes\ExtensionsV1;
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
    const VERSION = '1.0.8';

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
        add_action('admin_enqueue_scripts', [$this, 'override_dci_styles'], 999);
        add_action('admin_init', [$this, 'init_dci']);

        // Load plugin classes.
        Dashboard::get_instance();
        Enqueue::get_instance();
        StyleGenerator::get_instance();
        BlocksV1::get_instance();
        ExtensionsV1::get_instance();
        DashboardToolsV1::get_instance();
        SVGUploaderV1::get_instance();
        Blocks::get_instance();
        ExtensionsLoader::get_instance();

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

    public function override_dci_styles()
    {
        if (! wp_style_is('dci-sdk-wowdevs', 'enqueued')) {
            return;
        }

        wp_add_inline_style('dci-sdk-wowdevs', '
            :root {
                --dci-primary:       #2563eb;
                --dci-primary-dark:  #1d4ed8;
                --dci-primary-light: #eff6ff;
                --dci-secondary:     #3b82f6;
                --dci-skip-bg:       #f9fafb;
                --dci-skip-hover:    #f3f4f6;
                --dci-border:        #e5e7eb;
                --dci-text:          #4b5563;
                --dci-radius:        8px;
            }
            .dci-global-notice.notice-success {
                border-left-color: #2563eb;
                background: #fff;
            }
        ');
    }

    public function init_dci()
    {
        require_once BLOCKISH_DIR . 'dci/start.php';

        dci_dynamic_init(array(
            'product_id'           => 5,
            'plugin_name'          => 'Blockish - Creative Gutenberg Blocks',
            'plugin_title'         => 'Love using Blockish? Congrats 🎉  ( Never miss an Important Update )',
            'plugin_icon'          => 'https://ps.w.org/blockish/assets/icon-256x256.png',

            'api_endpoint'         => 'https://dashboard.wowdevs.com/wp-json/dci/v1/data-insights',
            'slug'                 => 'blockish',
            'core_file'            => false,
            'plugin_deactivate_id' => false,
            'menu'                 => array(
                'slug' => 'blockish-dashboard',
            ),
            'public_key'           => 'pk_AyXCKb51WP7urdbX5vdqe2ScQewFI3Bn',
            'is_premium'           => false,
            'popup_notice'         => false,
            'deactivate_feedback'  => true,
            'text_domain'          => 'blockish',
            'plugin_msg'           => '<p>Be Top-contributor by sharing non-sensitive plugin data and create an impact to the global WordPress community today! You can receive valuable emails periodically.</p>',
        ));
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
blockish();
