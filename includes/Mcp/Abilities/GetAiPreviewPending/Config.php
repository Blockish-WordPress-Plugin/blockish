<?php

namespace Blockish\Mcp\Abilities\GetAiPreviewPending;

defined( 'ABSPATH' ) || exit;

class Config {
	const NAME = 'blockish/get-ai-preview-pending';

	public static function get(): array {
		return [
			'label'               => __( 'Get AI Preview Pending Count', 'blockish' ),
			'description'         => __( 'Reports how many AI Preview designs are not finalized yet. Once resolved (an editor was opened), a staged design is already live on the frontend for every visitor; Accept only finalizes it (drops the saved previous version Discard would restore). Accept is never required to continue. This tool never Accepts or Discards.', 'blockish' ),
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
				'usage_notes' => 'After staging + verify loop: call this. If count > 0, tell the user as info: the designs are already live, and they can finalize them in Settings → AI Preview (Accept) or roll back (Discard) whenever they like. Do not block or wait on Accept, and do not Accept/Discard via MCP. If count is 0, say nothing is pending.',
			],
		];
	}
}
