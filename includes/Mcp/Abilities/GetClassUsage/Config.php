<?php

namespace Blockish\Mcp\Abilities\GetClassUsage;

defined( 'ABSPATH' ) || exit;

class Config {
	const NAME = 'blockish/get-class-usage';

	public static function get(): array {
		return array(
			'label'               => __( 'Get Class Manager Usage', 'blockish' ),
			'description'         => __( 'Reports where each Class Manager parent class is attached (posts, pages, patterns, templates, forms). Filter by post_id or name. Also returns an unused list for cleanup.', 'blockish' ),
			'category'            => 'blockish',
			'input_schema'        => array(
				'type'       => 'object',
				'properties' => array(
					'post_id' => array(
						'type'        => 'integer',
						'description' => 'Optional. Limit the report to one class (parent or child ID — children roll up to the parent).',
					),
					'name'    => array(
						'type'        => 'string',
						'description' => 'Optional. Limit the report to one class by name/slug.',
					),
				),
			),
			'output_schema'       => array(
				'type'       => 'object',
				'properties' => array(
					'classes'            => array( 'type' => 'object' ),
					'unused'             => array( 'type' => 'array' ),
					'scanned_post_types' => array( 'type' => 'array' ),
					'error'              => array( 'type' => 'string' ),
				),
			),
			'execute_callback'    => array( Callbacks::class, 'get_class_usage' ),
			'permission_callback' => fn() => current_user_can( 'edit_posts' ),
			'meta'                => array(
				'mcp'         => array( 'public' => true ),
				'usage_notes' => 'Call before sweeping unused classes. Use blockish/manage-class action=sweep with confirm:true to delete unused parents.',
			),
		);
	}
}
