<?php

namespace Blockish\Routes;

use Blockish\Extensions\AiPreview;
use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AiPreviewQueueV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'ai-preview-queue';

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
						'action' => array(
							'type'     => 'string',
							'enum'     => array( 'accept', 'discard' ),
							'required' => true,
						),
						'ids'      => array(
							'type'     => 'array',
							'required' => true,
							'items'    => array(
								'type'    => 'integer',
								'minimum' => 1,
							),
						),
						'contents' => array(
							'type'                 => 'object',
							'additionalProperties' => array(
								'type' => 'string',
							),
						),
					),
				),
			)
		);

		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base . '/(?P<id>\d+)',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get_queue_item' ),
				'permission_callback' => array( $this, 'item_permissions_check' ),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'edit_posts' );
	}

	public function item_permissions_check( WP_REST_Request $request ) {
		$id = absint( $request['id'] );
		return $id > 0 && current_user_can( 'edit_post', $id );
	}

	public function get_pending() {
		$items = AiPreview::find_pending();

		return rest_ensure_response(
			array(
				'items' => $items,
				'count' => count( $items ),
			)
		);
	}

	public function get_queue_item( WP_REST_Request $request ) {
		$item = AiPreview::get_item( absint( $request['id'] ) );
		if ( ! $item ) {
			return new \WP_Error(
				'blockish_ai_preview_not_pending',
				__( 'No pending AI preview on this item.', 'blockish' ),
				array( 'status' => 404 )
			);
		}

		return rest_ensure_response( $item );
	}

	public function handle_action( WP_REST_Request $request ) {
		$ids = $request->get_param( 'ids' );
		if ( ! is_array( $ids ) || empty( $ids ) ) {
			return new \WP_Error(
				'blockish_ai_preview_missing_ids',
				__( 'Select at least one pending preview.', 'blockish' ),
				array( 'status' => 400 )
			);
		}

		$contents = $request->get_param( 'contents' );
		if ( ! is_array( $contents ) ) {
			$contents = array();
		}

		return rest_ensure_response(
			AiPreview::apply_action( $ids, (string) $request->get_param( 'action' ), $contents )
		);
	}
}
