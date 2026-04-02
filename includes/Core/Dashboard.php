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
        add_action( 'admin_menu', array( $this, 'hide_adjacent_separator' ), 100 );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
    }

    public function register_menu_page() {
        add_menu_page(
            __( 'Blockish Dashboard', 'blockish' ),
            __( 'Blockish', 'blockish' ),
            'manage_options',
            self::PAGE_SLUG,
            array( $this, 'render_dashboard_page' ),
            'dashicons-screenoptions',
            58
        );
    }

    public function render_dashboard_page() {
        echo '<div class="wrap"><div id="blockish-dashboard-root"></div></div>';
    }

    public function hide_adjacent_separator() {
        global $menu;

        if ( ! is_array( $menu ) ) {
            return;
        }

        $keys = array_keys( $menu );
        sort( $keys, SORT_NUMERIC );

        foreach ( $keys as $index => $key ) {
            if ( empty( $menu[ $key ][2] ) || self::PAGE_SLUG !== $menu[ $key ][2] ) {
                continue;
            }

            $next_key = $keys[ $index + 1 ] ?? null;
            $prev_key = $keys[ $index - 1 ] ?? null;

            if ( null !== $next_key && ! empty( $menu[ $next_key ][4] ) && false !== strpos( $menu[ $next_key ][4], 'wp-menu-separator' ) ) {
                unset( $menu[ $next_key ] );
            }

            if ( null !== $prev_key && ! empty( $menu[ $prev_key ][4] ) && false !== strpos( $menu[ $prev_key ][4], 'wp-menu-separator' ) ) {
                unset( $menu[ $prev_key ] );
            }

            break;
        }
    }

    public function enqueue_assets( $hook_suffix ) {
        $page_hook = 'toplevel_page_' . self::PAGE_SLUG;

        if ( $hook_suffix !== $page_hook ) {
            return;
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
