<?php

namespace Blockish\Extensions;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Interaction {
	use \Blockish\Traits\SingletonTrait;

	const PAGE_META_KEY = 'blockish_page_interactions';

	private function __construct() {
		add_action( 'init', array( $this, 'register_page_meta' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_scripts' ) );
		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
		add_filter( 'register_block_type_args', array( $this, 'register_attributes' ), 20, 2 );
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

	public function enqueue_scripts() {
		$asset_file = BLOCKISH_EXTENSIONS_DIR . 'interactions/view.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset     = require $asset_file;
		$script_url = BLOCKISH_URL . 'build/extensions/interactions/view.js';

		wp_enqueue_script(
			'blockish-extension-interactions-view',
			$script_url,
			$asset['dependencies'] ?? array(),
			$asset['version'] ?? BLOCKISH_VERSION,
			true
		);

		$style_path = BLOCKISH_DIR . 'build/extensions/interactions/style-view.css';
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'blockish-extension-interactions-style',
				BLOCKISH_URL . 'build/extensions/interactions/style-view.css',
				array(),
				$asset['version'] ?? BLOCKISH_VERSION
			);
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
			'blockish-extension-interactions-view',
			'window.blockishGlobalInteractions = ' . $global_interactions_json . ';' .
			'window.blockishPageInteractions = ' . $page_interactions_json . ';',
			'before'
		);
	}

	public function enqueue_editor_scripts() {
		$asset_file = BLOCKISH_EXTENSIONS_DIR . 'interactions/editor.asset.php';

		if ( ! file_exists( $asset_file ) ) {
			return;
		}

		$asset      = require $asset_file;
		$script_url = BLOCKISH_URL . 'build/extensions/interactions/editor.js';

		wp_enqueue_script(
			'blockish-extension-interactions-editor',
			$script_url,
			$asset['dependencies'] ?? array(),
			$asset['version'] ?? BLOCKISH_VERSION,
			true
		);

		$style_path = BLOCKISH_DIR . 'build/extensions/interactions/editor.css';
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'blockish-extension-interactions-editor',
				BLOCKISH_URL . 'build/extensions/interactions/editor.css',
				array(),
				$asset['version'] ?? BLOCKISH_VERSION
			);
		}
	}

	public function register_attributes( $args, $block_type ) {
		if ( str_starts_with( $block_type, 'blockish' ) ) {
			if ( ! isset( $args['attributes'] ) ) {
				$args['attributes'] = array();
			}
			$args['attributes']['interactionData'] = array(
				'type'    => 'array',
				'default' => array(),
				'items'   => array(
					'type' => 'object',
				),
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
