<?php

namespace Blockish\Extensions;

use Blockish\Config\ExtensionList;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Interactions runtime: page meta, view assets, and data-blockish-interactions markup.
 * Editor assets + interactionData attribute come from block.json via Core\Extensions.
 */
class Interaction {
	use \Blockish\Traits\SingletonTrait;

	const PAGE_META_KEY = 'blockish_page_interactions';

	/**
	 * Handles registered from build/extensions/interactions/block.json via Core\Extensions.
	 * Core\Extensions runs the block.json field name through sanitize_key(), so the
	 * generated handles are always lowercase ("viewScript" => "viewscript").
	 */
	const VIEW_SCRIPT_HANDLE = 'blockish-extension-interactions-viewscript';
	const VIEW_STYLE_HANDLE  = 'blockish-extension-interactions-style';

	private function __construct() {
		add_action( 'init', array( $this, 'register_page_meta' ) );
		add_action( 'init', array( $this, 'register_runtime_hooks' ), 20 );
	}

	public function register_runtime_hooks() {
		if ( ! $this->is_extension_enabled() ) {
			return;
		}

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_view_assets' ) );
		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
	}

	private function is_extension_enabled() {
		$active = ExtensionList::get_instance()->get_list( 'active' );
		return ! empty( $active['interactions'] );
	}

	public function register_page_meta() {
		register_post_meta(
			'',
			self::PAGE_META_KEY,
			array(
				'type'              => 'array',
				'single'            => true,
				'default'           => array(),
				'show_in_rest'      => array(
					'schema' => array(
						'type'  => 'array',
						'items' => array(
							'type'                 => 'object',
							'additionalProperties' => true,
						),
					),
				),
				'auth_callback'     => function ( $allowed, $meta_key, $post_id ) {
					return current_user_can( 'edit_post', $post_id );
				},
			)
		);
	}

	/**
	 * Enqueue registered viewScript/style and inject global + page interaction JSON.
	 */
	public function enqueue_view_assets() {
		if ( ! wp_script_is( self::VIEW_SCRIPT_HANDLE, 'registered' ) ) {
			return;
		}

		wp_enqueue_script( self::VIEW_SCRIPT_HANDLE );

		if ( wp_style_is( self::VIEW_STYLE_HANDLE, 'registered' ) ) {
			wp_enqueue_style( self::VIEW_STYLE_HANDLE );
		}

		$global_interactions = get_option( 'blockish_global_interactions', array() );
		if ( is_string( $global_interactions ) ) {
			$global_interactions_json = $global_interactions;
		} else {
			$global_interactions_json = wp_json_encode( $global_interactions );
		}

		if ( empty( $global_interactions_json ) ) {
			$global_interactions_json = '[]';
		}

		$page_interactions_json = '[]';
		if ( is_singular() ) {
			$page_interactions = get_post_meta( get_the_ID(), self::PAGE_META_KEY, true );
			if ( is_array( $page_interactions ) && ! empty( $page_interactions ) ) {
				$page_interactions_json = wp_json_encode( $page_interactions );
			} elseif ( is_string( $page_interactions ) && '' !== trim( $page_interactions ) ) {
				$page_interactions_json = $page_interactions;
			}
		}

		if ( empty( $page_interactions_json ) ) {
			$page_interactions_json = '[]';
		}

		wp_add_inline_script(
			self::VIEW_SCRIPT_HANDLE,
			'window.blockishGlobalInteractions = ' . $global_interactions_json . ';' .
			'window.blockishPageInteractions = ' . $page_interactions_json . ';',
			'before'
		);
	}

	public function render_block( $block_content, $block ) {
		if ( empty( $block['attrs']['interactionData'] ) ) {
			return $block_content;
		}

		$interaction_data = $block['attrs']['interactionData'];

		if ( ! is_array( $interaction_data ) || empty( $interaction_data ) ) {
			return $block_content;
		}

		$tag_processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( ! $tag_processor->next_tag() ) {
			return $block_content;
		}

		$tag_processor->set_attribute( 'data-blockish-interactions', wp_json_encode( $interaction_data ) );

		return $tag_processor->get_updated_html();
	}
}
