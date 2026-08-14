<?php

namespace Blockish\Routes;

use Blockish\Extensions\ClassPrevious;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ClassPreviousV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'class-previous-content';

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'get_pending' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'handle_action' ),
					'permission_callback' => array( $this, 'permissions_check' ),
					'args'                => array(
						'action'    => array(
							'type'     => 'string',
							'enum'     => array( 'accept', 'discard', 'seed', 'snapshots' ),
							'required' => true,
						),
						'class_id'  => array(
							'type'    => 'integer',
							'minimum' => 1,
						),
						'created'   => array(
							'type' => 'boolean',
						),
						'class_ids' => array(
							'type'  => 'array',
							'items' => array(
								'type'    => 'integer',
								'minimum' => 1,
							),
						),
					),
				),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'edit_posts' );
	}

	public function get_pending() {
		return rest_ensure_response(
			array(
				'pending' => ClassPrevious::list_pending(),
			)
		);
	}

	public function handle_action( WP_REST_Request $request ) {
		$action = (string) $request->get_param( 'action' );

		if ( 'seed' === $action ) {
			$class_id = absint( $request->get_param( 'class_id' ) );
			if ( $class_id < 1 || 'blockish-classes' !== get_post_type( $class_id ) ) {
				return rest_ensure_response( array( 'error' => 'Invalid class_id.' ) );
			}
			$parent_id = ClassPrevious::resolve_parent_id( $class_id );
			ClassPrevious::snapshot_current( $parent_id, (bool) $request->get_param( 'created' ) );
			return rest_ensure_response( array( 'ok' => true, 'class_id' => $parent_id ) );
		}

		if ( 'accept' === $action ) {
			$class_ids = $request->get_param( 'class_ids' );
			if ( is_array( $class_ids ) && ! empty( $class_ids ) ) {
				return rest_ensure_response( ClassPrevious::accept_ids( array_map( 'absint', $class_ids ) ) );
			}
			return rest_ensure_response( ClassPrevious::accept_all() );
		}

		if ( 'snapshots' === $action ) {
			$class_ids = $request->get_param( 'class_ids' );
			if ( ! is_array( $class_ids ) || empty( $class_ids ) ) {
				return rest_ensure_response( array( 'ok' => true, 'records' => array() ) );
			}
			return rest_ensure_response( ClassPrevious::snapshots_for_ids( array_map( 'absint', $class_ids ) ) );
		}

		return rest_ensure_response( ClassPrevious::discard_all() );
	}
}
