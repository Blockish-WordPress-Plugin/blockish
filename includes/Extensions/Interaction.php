<?php

namespace Blockish\Extensions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interaction {
	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_scripts' ) );
		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
		add_filter( 'register_block_type_args', array( $this, 'register_attributes' ), 20, 2 );
	}

	public function enqueue_scripts() {
		$asset_file = BLOCKISH_EXTENSIONS_DIR . 'interactions/view.asset.php';
		
		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;
		$script_url = BLOCKISH_URL . 'build/extensions/interactions/view.js';

		wp_enqueue_script(
			'blockish-extension-interactions-view',
			$script_url,
			$asset['dependencies'] ?? array(),
			$asset['version'] ?? BLOCKISH_VERSION,
			true
		);

		$global_interactions = get_option( 'blockish_global_interactions', [] );


		if ( is_string( $global_interactions ) ) {
			$global_interactions_json = $global_interactions;
		} else {
			$global_interactions_json = wp_json_encode( $global_interactions );
		}
		
		if ( empty( $global_interactions_json ) ) {
			$global_interactions_json = '[]';
		}

		wp_add_inline_script(
			'blockish-extension-interactions-view',
			'window.blockishGlobalInteractions = ' . $global_interactions_json . ';',
			'before'
		);
	}

	public function enqueue_editor_scripts() {
		$asset_file = BLOCKISH_EXTENSIONS_DIR . 'interactions/editor.asset.php';
		
		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset = require $asset_file;
		$script_url = BLOCKISH_URL . 'build/extensions/interactions/editor.js';

		wp_enqueue_script(
			'blockish-extension-interactions-editor',
			$script_url,
			$asset['dependencies'] ?? array(),
			$asset['version'] ?? BLOCKISH_VERSION,
			true
		);
	}

	public function register_attributes( $args, $block_type ) {
		if ( str_starts_with( $block_type, 'blockish' ) ) {
			if ( ! isset( $args['attributes'] ) ) {
				$args['attributes'] = array();
			}
			$args['attributes']['interactionData'] = array(
				'type'    => 'array',
				'default' => array(),
			);
		}
		return $args;
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
