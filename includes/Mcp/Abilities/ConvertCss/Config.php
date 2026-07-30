<?php

namespace Blockish\Mcp\Abilities\ConvertCss;

defined( 'ABSPATH' ) || exit;

class Config {
	const NAME = 'blockish/convert-css';

	public static function get(): array {
		return array(
			'label'               => __( 'Convert CSS', 'blockish' ),
			'description'         => __( 'Convert CSS ↔ Blockish style attributes. Prefer action css_to_schema: build a full block_schema with content attrs + per-node css using {{ROOT}}, convert once, push the returned schema to manage-pattern / manage-post. Also supports single-block css_to_attributes / attributes_to_css. Style only — markup and content attrs come from get-block-docs.', 'blockish' ),
			'category'            => 'blockish',
			'input_schema'        => array(
				'type'       => 'object',
				'properties' => array(
					'action'        => array(
						'type'        => 'string',
						'enum'        => array( 'css_to_schema', 'css_to_attributes', 'attributes_to_css' ),
						'description' => 'css_to_schema: whole tree in one call (preferred). css_to_attributes / attributes_to_css: single block.',
					),
					'block_schema'  => array(
						'type'        => 'array',
						'description' => 'For css_to_schema. Array of {name, attributes?, css?, innerBlocks?}. Put style CSS on each node; use {{ROOT}} for that node\'s wrapper. Content/data attrs stay in attributes. Transport fields css / root_selector / key are stripped from the returned schema.',
						'items'       => array( 'type' => 'object' ),
					),
					'block_name'    => array(
						'type'        => 'string',
						'description' => 'For single-block actions: blockish/global, any installed blockish/* , blockish-dynamicity/*, or blockish-forms/*.',
						'default'     => 'blockish/global',
					),
					'css'           => array(
						'type'        => 'string',
						'description' => 'Single-block css_to_attributes stylesheet. May include @media (max-width) for Tablet/Mobile. Prefer {{ROOT}} (or pass root_selector).',
					),
					'attributes'    => array(
						'type'        => 'object',
						'description' => 'Block attributes object for attributes_to_css.',
					),
					'root_selector' => array(
						'type'        => 'string',
						'description' => 'Single-block only. Optional when CSS uses {{ROOT}}. Otherwise a temporary class like ".hero". Never saved on the block.',
					),
				),
				'required'   => array( 'action' ),
			),
			'output_schema'       => array(
				'type'       => 'object',
				'properties' => array(
					'block_schema'  => array(
						'type'        => 'array',
						'description' => 'css_to_schema result: clean schema ready for manage-pattern / manage-post (css stripped, style attrs merged).',
						'items'       => array( 'type' => 'object' ),
					),
					'report'        => array(
						'type'        => 'object',
						'description' => 'css_to_schema summary: converted/skipped counts, mapped, unmapped, warnings.',
					),
					'attributes'    => array(
						'type'        => 'object',
						'description' => 'Single-block attributes ready to spread onto a schema node. Includes customCss when there are leftovers.',
					),
					'customCss'     => array( 'type' => 'string' ),
					'css'           => array( 'type' => 'string' ),
					'mapped'        => array(
						'type'        => 'array',
						'description' => 'Declarations that became attributes, as "property@Device".',
						'items'       => array( 'type' => 'string' ),
					),
					'unmapped'      => array(
						'type'        => 'array',
						'description' => 'Rules that could not be mapped and went to customCss.',
						'items'       => array( 'type' => 'string' ),
					),
					'root_selector' => array( 'type' => 'string' ),
					'block_name'    => array( 'type' => 'string' ),
					'error'         => array( 'type' => 'string' ),
				),
			),
			'execute_callback'    => array( Callbacks::class, 'execute' ),
			'permission_callback' => fn() => current_user_can( 'edit_posts' ),
			'meta'                => array(
				'mcp'         => array( 'public' => true ),
				'usage_notes' => 'For reusable or section-level styles, prefer blockish/manage-class (write CSS, attach classManager) instead of stuffing block attributes. Use convert-css for true one-offs or block-specific Markup targets. Prefer css_to_schema: one tree with per-node css using {{ROOT}} for the wrapper and Markup classes for descendants/hover. Returns block_schema ready to push. Content/data attributes are never produced from CSS — set them on the node before converting. Single-block css_to_attributes / attributes_to_css still available. Unmapped CSS becomes customCss ({{SELECTOR}} placeholder).',
			),
		);
	}
}
