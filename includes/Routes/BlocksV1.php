<?php

namespace Blockish\Routes;

use WP_REST_Controller;
use WP_REST_Request;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class BlocksV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	const BLOCK_OPTION = 'blockish_block_list';

	private function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'blocks';

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( $this, 'get_blocks' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( $this, 'update_blocks' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	public function get_blocks() {
		$hardcoded_blocks = \Blockish\Config\BlocksList::get_instance()->get_list('list');
		$saved_blocks = $this->get_saved_blocks();
		$addons = \Blockish\Config\AddonsList::get_instance()->get_list('list');

		foreach ( $hardcoded_blocks as $slug => &$block ) {
			// Restore the user's saved status
			if ( isset( $saved_blocks[ $slug ]['status'] ) ) {
				$status = $saved_blocks[ $slug ]['status'];
				if ( in_array( $status, array( 'active', 'inactive' ), true ) ) {
					$block['status'] = $status;
				}
			}

			// Override with locked if required addon is not installed
			if ( ! empty( $block['addon'] ) && isset( $addons[ $block['addon'] ] ) ) {
				if ( empty( $addons[ $block['addon'] ]['is_installed'] ) ) {
					$block['status'] = 'locked';
				}
			}
		}

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'blocks'  => $hardcoded_blocks,
				'message' => array( 'Blocks list has been fetched successfully.' ),
			)
		);
	}

	public function update_blocks( WP_REST_Request $request ) {
		$updates = $request->get_param( 'blocks' );

		if ( ! is_array( $updates ) ) {
			return rest_ensure_response(
				array(
					'status'  => 'fail',
					'message' => array( 'Invalid payload. Expected: { "blocks": { "slug": "active|inactive" } }' ),
				)
			);
		}

		$saved = get_option( self::BLOCK_OPTION, array() );
		$next = is_array( $saved ) ? $saved : array();

		foreach ( $updates as $slug => $incoming ) {
			if ( ! isset( $next[ $slug ] ) || ! is_array( $next[ $slug ] ) ) {
				continue;
			}

			$status = is_array( $incoming )
				? ( $incoming['status'] ?? $next[ $slug ]['status'] ?? 'active' )
				: $incoming;

			$status = sanitize_key( $status );
			if ( ! in_array( $status, array( 'active', 'inactive' ), true ) ) {
				continue;
			}

			$next[ $slug ]['status'] = $status;
		}

		update_option( self::BLOCK_OPTION, $next );

		return rest_ensure_response(
			array(
				'status'  => 'success',
				'blocks'  => $next,
				'message' => array( 'Blocks list has been updated successfully.' ),
			)
		);
	}

	private function get_saved_blocks() {
		return get_option( self::BLOCK_OPTION, array() );
	}
}
