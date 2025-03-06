<?php
/**
 * Menu class
 *
 * @package Blockish\Admin
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
class Menu {
	/**
	 * Constructor
	 *
	 * @return void
	 * @since 2.7.0
	 */
	public function __construct() {
		add_action( 'admin_menu', array( $this, 'admin_menu' ) );
    error_log("Menu constructor");
	}

	/**
	 * Register admin menu
	 *
	 * @return void
	 * @since 2.6.5
	 */
	public function admin_menu() {
		$parent_slug = 'blockish';
		$capability  = 'manage_options';
		add_menu_page( esc_html__( 'Blockish', 'blockish' ), esc_html__( 'Blockish', 'blockish' ), $capability, $parent_slug, array( $this, 'plugin_layout' ), $this->get_b64_icon(), 59 );
	}

	/**
	 * Plugin Layout
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function plugin_layout() {
		echo '<div id="blockish" class="wrap blockish"> <h2>Loading...</h2> </div>';
	}

	public static function get_dashboard_link( $suffix = '#' ) {
		return add_query_arg( array( 'page' => 'blockish' . $suffix ), admin_url( 'admin.php' ) );
	}

	public static function get_b64_icon() {
		// return 'data:image/svg+xml;base64,' . base64_encode( file_get_contents( SKY_ADDONS_ASSETS_PATH . 'images/sky-top-menu-logo.svg' ) );
	}
}
