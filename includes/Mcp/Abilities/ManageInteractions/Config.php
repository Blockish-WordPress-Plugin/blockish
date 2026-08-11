<?php

namespace Blockish\Mcp\Abilities\ManageInteractions;

defined( 'ABSPATH' ) || exit;

class Config
{
	const NAME = 'blockish/manage-interactions';

	public static function get(): array
	{
		return [
			'label'               => __( 'Manage Interactions', 'blockish' ),
			'description'         => __( 'Get or update Blockish interaction libraries: site-wide (global) or for a specific page/post (page). Block-level rules still use the interactionData attribute on blocks via manage-post / manage-pattern.', 'blockish' ),
			'category'            => 'blockish',
			'input_schema'        => [
				'type'       => 'object',
				'properties' => [
					'action' => [
						'type'        => 'string',
						'enum'        => [ 'get', 'update' ],
						'description' => 'get = retrieve current library; update = replace the whole library for this scope.',
					],
					'scope' => [
						'type'        => 'string',
						'enum'        => [ 'global', 'page' ],
						'description' => 'global = option blockish_global_interactions (site-wide). page = post meta blockish_page_interactions for post_id.',
					],
					'post_id' => [
						'type'        => 'integer',
						'description' => 'Required when scope is "page". The page/post ID that owns the page interaction library.',
					],
					'interactions' => [
						'type'        => 'array',
						'description' => 'Required when action is "update". Full array of interaction objects (same shape as interactionData / docs §9). Replaces the previous list for this scope.',
						'items'       => [
							'type'       => 'object',
							'properties' => [
								'id'    => [ 'type' => 'string', 'description' => 'Unique interaction id (e.g. ix_…).' ],
								'title' => [ 'type' => 'string' ],
								'scope' => [
									'type'        => 'string',
									'enum'        => [ 'global', 'page' ],
									'description' => 'Must match the request scope. Forced to request scope on update if omitted/wrong.',
								],
								'when' => [
									'type'       => 'object',
									'properties' => [
										'source'    => [ 'type' => 'string', 'enum' => [ 'dom', 'listen' ] ],
										'event'     => [ 'type' => 'string', 'description' => 'ready | click | mouseenter | focus | inView (dom).' ],
										'selector'  => [ 'type' => 'string' ],
										'eventName' => [ 'type' => 'string' ],
										'phase'     => [ 'type' => 'string' ],
									],
								],
								'action' => [
									'type'       => 'object',
									'properties' => [
										'type'          => [ 'type' => 'string', 'enum' => [ 'preset', 'emit', 'custom' ] ],
										'preset'        => [ 'type' => 'string' ],
										'presetOptions' => [ 'type' => 'object' ],
										'eventName'     => [ 'type' => 'string' ],
										'phase'         => [ 'type' => 'string' ],
										'callbacks'     => [
											'type'  => 'array',
											'items' => [ 'type' => 'string' ],
										],
									],
								],
							],
							'required'   => [ 'id' ],
						],
					],
				],
				'required'   => [ 'action', 'scope' ],
			],
			'output_schema'       => [
				'type'       => 'object',
				'properties' => [
					'scope'        => [ 'type' => 'string' ],
					'post_id'      => [ 'type' => 'integer' ],
					'count'        => [ 'type' => 'integer' ],
					'interactions' => [
						'type'        => 'array',
						'description' => 'The current interactions for this scope.',
					],
					'message'      => [ 'type' => 'string' ],
				],
			],
			'execute_callback'    => [ Callbacks::class, 'execute' ],
			'permission_callback' => static function () {
				return current_user_can( 'edit_posts' ) || current_user_can( 'edit_theme_options' );
			},
			'meta'                => [
				'mcp'         => [ 'public' => true ],
				'usage_notes' => 'scope=global → site-wide library (edit_theme_options). scope=page + post_id → that page\'s library (edit_post). Block-only rules stay on interactionData via manage-post. Prefer structured when/action (preset|emit|custom); legacy event/selector/callbacks still sanitize. Lifecycle: when.event ready/init for one-time setup. Prefer Class Manager classes as when.selector targets. update replaces the entire list for that scope — get first, merge in your head, then update.',
			],
		];
	}
}
