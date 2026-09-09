<?php

namespace Blockish\Mcp\Abilities\GetAiPreviewPending;

defined( 'ABSPATH' ) || exit;

class Callbacks {
	public static function handle( $input ): array {
		$request  = new \WP_REST_Request( 'GET', '/blockish/v1/ai-preview-queue/count' );
		$response = rest_do_request( $request );

		if ( $response->is_error() ) {
			$error = $response->as_error();
			return [
				'count'   => 0,
				'items'   => [],
				'message' => '',
				'error'   => $error ? $error->get_error_message() : 'Failed to read pending AI preview count.',
			];
		}

		$data  = $response->get_data();
		$count = isset( $data['count'] ) ? absint( $data['count'] ) : 0;

		// Short titles for the agent message (same inventory as the count source).
		$list_req  = new \WP_REST_Request( 'GET', '/blockish/v1/ai-preview-queue' );
		$list_res  = rest_do_request( $list_req );
		$list_data = ( ! $list_res->is_error() && is_array( $list_res->get_data() ) ) ? $list_res->get_data() : [];
		$raw_items = isset( $list_data['items'] ) && is_array( $list_data['items'] ) ? $list_data['items'] : [];

		$items = array_map(
			static function ( $item ) {
				return [
					'id'        => absint( $item['id'] ?? 0 ),
					'title'     => (string) ( $item['title'] ?? '' ),
					'typeLabel' => (string) ( $item['typeLabel'] ?? $item['type'] ?? '' ),
				];
			},
			$raw_items
		);

		if ( $count < 1 ) {
			$message = 'No AI Preview designs are pending Accept.';
		} else {
			$message = sprintf(
				/* translators: %d: pending count */
				'%d AI Preview design(s) are still pending. Tell the user to open Settings → AI Preview and Accept them manually (do not Accept via MCP).',
				$count
			);
		}

		return [
			'count'   => $count,
			'items'   => $items,
			'message' => $message,
		];
	}
}
