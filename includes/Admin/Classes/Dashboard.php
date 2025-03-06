<?php
/**
 * Dashboard Handler
 *
 * @package Blockish
 * @since 2.7.0
 */

namespace Blockish\Classes;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use WP_REST_Controller;
use WP_REST_Server;
use WP_REST_Request;
use WP_REST_Response;
use WP_Error;

/**
 * Dashboard Handler
 *
 * @since 2.7.0
 */
class Dashboard {

	private static $instance = null;

	/**
	 * Namespace
	 *
	 * @var string
	 */
	protected $namespace;

	/**
	 * Rest Base
	 *
	 * @var string
	 */

	protected $rest_base;

	/**
	 * Construct
	 */
	public function __construct() {
		$this->namespace = 'skyaddons/v1';
		$this->rest_base = 'dashboard';
		add_action( 'rest_api_init', array( $this, 'register_rest_routes' ) );
	}

	/**
	 * Register the routes
	 *
	 * @since 2.7.0
	 */
	public function register_rest_routes() {

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'handle_dashboard' ),
				// 'permission_callback' => array( $this, 'get_permissions_check' ),
				'permission_callback' => '__return_true',
			)
		);

		// register_rest_route(
		// $this->namespace,
		// '/' . $this->rest_base,
		// array(
		// 'methods'             => WP_REST_Server::EDITABLE,
		// 'callback'            => array( $this, 'set_dashboard' ),
		// 'permission_callback' => array( $this, 'update_permissions_check' ),
		// )
		// );
	}

	/**
	 * Check the permissions for getting the settings
	 *
	 * @since 2.7.0
	 */
	public function get_permissions_check() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check the permissions for updating the settings
	 *
	 * @since 2.7.0
	 */
	public function update_permissions_check() {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Set Init
	 *
	 * @since 2.7.0
	 */
	public function handle_dashboard( WP_REST_Request $request ) {
		$params = $request->get_params();
		return $this->dashboard_welcome();
	}

	/**
	 * Dashboard Welcome
	 *
	 * @return WP_REST_Response
	 */
	public function dashboard_welcome() {
		$cache_key  = 'dci_dashboard_welcome_data';
		$cache_time = 2 * MINUTE_IN_SECONDS; // Cache for 12 hours

		$data = get_transient( $cache_key );
		$data = false;

		if ( false === $data ) {
			// $data = array(
			// 'last_30_days_sync' => $this->last_30_days_sync(),
			// );

			// Set the transient
			set_transient( $cache_key, $data, $cache_time );
		}

		return new WP_REST_Response(
			array(
				'message' => 'Welcome to the Dashboard!',
				'data'    => $data,
			),
			200
		);
	}


	/**
	 * ChartJS BG Colors
	 */
	public function chartjs_bg_colors( $id ) {
		$bg = array(
			'rgba(255, 99, 132, 0.4)',
			'rgba(54, 162, 235, 0.4)',
			'rgba(255, 206, 86, 0.4)',
			'rgba(75, 192, 192, 0.4)',
			'rgba(153, 102, 255, 0.4)',
			'rgba(255, 159, 64, 0.4)',
			'rgba(54, 162, 235, 0.4)',
			'rgba(104, 132, 245, 0.4)',
			'rgba(255, 99, 132, 0.4)',
			'rgba(54, 162, 235, 0.4)',
			'rgba(255, 206, 86, 0.4)',
			'rgba(75, 192, 192, 0.4)',
			'rgba(153, 102, 255, 0.4)',
			'rgba(255, 159, 64, 0.4)',
			'rgba(54, 162, 235, 0.4)',
			'rgba(255, 206, 86, 0.4)',
			'rgba(75, 192, 192, 0.4)',
			'rgba(153, 102, 255, 0.4)',
			'rgba(255, 159, 64, 0.4)',
			'rgba(54, 162, 235, 0.4)',
			'rgba(255, 206, 86, 0.4)',
			'rgba(75, 192, 192, 0.4)',
			'rgba(153, 102, 255, 0.4)',
			'rgba(255, 159, 64, 0.4)',
			'rgba(54, 162, 235, 0.4)',
			'rgba(255, 206, 86, 0.4)',
			'rgba(75, 192, 192, 0.4)',
			'rgba(153, 102, 255, 0.4)',
			'rgba(255, 159, 64, 0.4)',
		);

		$bg = array_unique( $bg );

		return ( isset( $bg[ $id ] ) ) ? $bg[ $id ] : 'rgba(255, 99, 132, 0.4)';
	}
}
