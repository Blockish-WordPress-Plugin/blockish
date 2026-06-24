<?php

namespace Blockish\Core;

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Dashboard {

    use \Blockish\Traits\SingletonTrait;

    const PAGE_SLUG = 'blockish-dashboard';

    private function __construct() {
        add_action( 'admin_menu', array( $this, 'register_menu_page' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
        add_action( 'current_screen', array( $this, 'suppress_notices' ) );
    }

    public function suppress_notices( $screen ) {
        if ( $screen->id !== 'toplevel_page_' . self::PAGE_SLUG ) {
            return;
        }

        // Remove any notices already registered at this point.
        remove_all_actions( 'admin_notices' );
        remove_all_actions( 'all_admin_notices' );
        remove_all_actions( 'user_admin_notices' );
        remove_all_actions( 'network_admin_notices' );

        // Re-hook at the earliest priority so anything added after current_screen
        // (e.g. from admin_init or late plugins) also gets wiped before rendering.
        foreach ( [ 'admin_notices', 'all_admin_notices', 'user_admin_notices', 'network_admin_notices' ] as $hook ) {
            add_action( $hook, function() use ( $hook ) {
                remove_all_actions( $hook );
            }, -PHP_INT_MAX );
        }
    }

    public function register_menu_page() {
        add_menu_page(
            __( 'Blockish Dashboard', 'blockish' ),
            __( 'Blockish', 'blockish' ),
            'manage_options',
            self::PAGE_SLUG,
            array( $this, 'render_dashboard_page' ),
            'dashicons-screenoptions',
            60
        );
    }

    public function render_dashboard_page() {
        echo '<div class="wrap"><div id="blockish-dashboard-root"></div></div>';
    }

    public function enqueue_assets( $hook_suffix ) {
        $page_hook = 'toplevel_page_' . self::PAGE_SLUG;

        if ( $hook_suffix !== $page_hook ) {
            return;
        }

        $settings = wp_enqueue_code_editor(
            array(
                'type' => 'text/css',
            )
        );

        if ( false !== $settings ) {
            wp_enqueue_script( 'code-editor' );
            wp_enqueue_style( 'code-editor' );
        }

        $script_asset_file = BLOCKISH_DIR . 'build/dashboard/index.asset.php';

        if ( ! file_exists( $script_asset_file ) ) {
            return;
        }

        $script_asset = include $script_asset_file;

        wp_enqueue_script(
            'blockish-dashboard',
            BLOCKISH_URL . 'build/dashboard/index.js',
            $script_asset['dependencies'] ?? array(),
            $script_asset['version'] ?? BLOCKISH_VERSION,
            true
        );

        wp_enqueue_style(
            'blockish-dashboard',
            BLOCKISH_URL . 'build/dashboard/style-index.css',
            array(),
            $script_asset['version'] ?? BLOCKISH_VERSION
        );

        wp_add_inline_script(
            'blockish-dashboard',
            'window.blockishDashboardData = ' . wp_json_encode(
                array(
                    'blocksApiPath'     => '/blockish/v1/blocks',
                    'extensionsApiPath' => '/blockish/v1/extensions',
                    'dashboardToolsApiPath' => '/blockish/v1/dashboard-tools',
                    'nonce'             => wp_create_nonce( 'wp_rest' ),
                    'siteUrl'           => admin_url(),
                    'plugin'            => array(
                        'name'     => 'Blockish',
                        'tagline'  => __( 'Creative Gutenberg blocks for modern websites.', 'blockish' ),
                        'version'  => BLOCKISH_VERSION,
                        'wpVersion'=> get_bloginfo( 'version' ),
                        'links'    => array(
                            'documentation' => 'https://wordpress.org/plugins/blockish/',
                            'support'       => 'https://wordpress.org/support/plugin/blockish/',
                            'changelog'     => 'https://wordpress.org/plugins/blockish/#developers',
                        ),
                    ),
                )
            ) . ';',
            'before'
        );
    }
}
