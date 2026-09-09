<?php

namespace Blockish\Mcp\Abilities\GetAiPreviewPending;

defined( 'ABSPATH' ) || exit;

class Config {
	const NAME = 'blockish/get-ai-preview-pending';

	public static function get(): array {
		return [
			'label'               => __( 'Get AI Preview Pending Count', 'blockish' ),
			'description'         => __( 'Reports how many AI Preview designs are still pending Accept. After a build/verify handoff, call this and tell the user the count — they must Accept manually in Settings → AI Preview. This tool never Accepts or Discards.', 'blockish' ),
			'category'            => 'blockish',
			'input_schema'        => [
				'type'       => 'object',
				'properties' => (object) [],
			],
			'output_schema'       => [
				'type'       => 'object',
				'properties' => [
					'count'   => [ 'type' => 'integer' ],
					'items'   => [ 'type' => 'array' ],
					'message' => [ 'type' => 'string' ],
					'error'   => [ 'type' => 'string' ],
				],
			],
			'execute_callback'    => [ Callbacks::class, 'handle' ],
			'permission_callback' => fn() => current_user_can( 'edit_posts' ),
			'meta'                => [
				'mcp'         => [ 'public' => true ],
				'usage_notes' => 'After staging + verify loop: call this. If count > 0, tell the user how many designs are pending and that they should open Settings → AI Preview and Accept manually (selected or one-by-one). Do not Accept/Discard via MCP. If count is 0, say nothing is pending.',
			],
		];
	}
}
