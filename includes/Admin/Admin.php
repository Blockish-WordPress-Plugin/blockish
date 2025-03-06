<?php
/**
 * Admin class
 *
 * @package Blockish
 * @since 2.7.0
 */

namespace Blockish\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Description of Menu
 *
 * @since 2.7.0
 */
class Admin {
	public function __construct() {
		add_action( 'admin_enqueue_scripts', array( $this, 'app_enqueue_styles' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'app_enqueue_scripts' ) );
		$this->dispatch_actions();
		error_log( 'Admin constructor' );
		new Menu();
	}

	/**
	 * Dispatch Actions
	 *
	 * @since 1.0.0
	 */
	public function dispatch_actions() {
		// new Classes\Dashboard();
		// new Classes\Widgets_Settings();
	}

	/**
	 * App Styles
	 *
	 * @since 1.0.0
	 */
	public function app_enqueue_styles( $hook_suffix ) {
		if ( 'toplevel_page_blockish' !== $hook_suffix ) {
			return;
		}
		$direction_suffix = is_rtl() ? '.rtl' : '';
		wp_enqueue_style( 'wp-components' );
		wp_register_style( 'blockish', BLOCKISH_URL . 'build/admin/index.css', array(), BLOCKISH_VERSION );
		wp_enqueue_style( 'blockish' );
	}

	/**
	 * App Scripts
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function app_enqueue_scripts( $hook_suffix ) {

		if ( 'toplevel_page_blockish' !== $hook_suffix ) {
			return;
		}

		$asset_file = BLOCKISH_DIR . 'build/admin/index.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = include $asset_file;

		wp_register_script( 'blockish', BLOCKISH_URL . 'build/admin/index.js', $asset['dependencies'], $asset['version'], true );
		wp_enqueue_script( 'blockish' );

		/**
		 * Localize Script
		 */
		$script_config = array(
			'rest_url'     => esc_url( get_rest_url() ),
			'version'      => BLOCKISH_VERSION,
			'nonce'        => wp_create_nonce( 'wp_rest' ),
			'assets_url'   => BLOCKISH_ASSETS_URL,
			'logo'         => BLOCKISH_ASSETS_URL . 'images/sky-logo-gradient.png',
			'root_url'     => BLOCKISH_URL,
			'pro_init'     => apply_filters( 'blockish_pro_init', false ),
			'current_user' => array(
				'domain'       => esc_url( home_url() ),
				'display_name' => wp_get_current_user()->display_name,
				'email'        => wp_get_current_user()->user_email,
				'id'           => wp_get_current_user()->ID,
				'avatar'       => get_avatar_url( wp_get_current_user()->ID ),
			),
		);

		wp_localize_script( 'blockish', 'BlockishConfig', $script_config );
	}
}
