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
										'event'     => [ 'type' => 'string', 'description' => 'ready | click | mouseenter | focus | inView | scroll | scrollProgress (dom).' ],
										'selector'  => [ 'type' => 'string' ],
										'eventName' => [ 'type' => 'string' ],
										'phase'     => [ 'type' => 'string' ],
										'scrollY'   => [ 'type' => 'integer', 'description' => 'For scroll: pixels from top before it fires (reverses above).' ],
										'parallax'  => [ 'type' => 'integer', 'description' => 'For scrollProgress: optional translateY shift in px.' ],
									],
								],
								'action' => [
									'type'       => 'object',
									'properties' => [
										'type'          => [ 'type' => 'string', 'enum' => [ 'preset', 'show', 'hide', 'toggle', 'toggleClass', 'emit', 'custom' ] ],
										'preset'        => [ 'type' => 'string' ],
										'presetOptions' => [ 'type' => 'object' ],
										'motion'        => [
											'type'        => 'object',
											'description' => 'CSS tween list: { tweens: [{ from, to, duration (s), delay (s), ease }] }. Use x/y/scale/rotation/opacity. Runtime plays tweens[0] only.',
										],
										'applyTo'       => [ 'type' => 'string', 'description' => 'Optional CSS selector for where the action runs (any block on the page). Empty = this block. when.selector is only the listen/click target inside this block.' ],
										'eventName'     => [ 'type' => 'string', 'description' => 'Signal name. For type emit: the signal to send. For other types: optional then-signal after this action (sequence).' ],
										'phase'         => [ 'type' => 'string', 'description' => 'emit: signal phase tag. Other types: send then-signal when this starts or finishes (default end).' ],
										'className'     => [ 'type' => 'string' ],
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
				'usage_notes' => 'scope=global → site-wide library (edit_theme_options). scope=page + post_id → that page\'s library (edit_post). Block-only rules stay on interactionData via manage-post. Prefer structured when/action; animation payload is action.motion.tweens[0] (x/y/scale/rotation/opacity, duration seconds, ease). While scroll: when.event scrollProgress scrubs that tween. Legacy event/selector/callbacks still sanitize. Hover reverses on leave; click toggles class/visibility/preset. Lifecycle: when.event ready/init for one-time setup. Prefer Class Manager classes as when.selector / action.applyTo targets. update replaces the entire list for that scope — get first, merge in your head, then update.',
			],
		];
	}
}
