<?php
namespace Blockish\Extensions;

use Blockish\Config\ExtensionList;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Device visibility: hide blocks on Desktop / Tablet / Mobile.
 */
class Visibility {
	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		add_action( 'init', array( $this, 'register_runtime_hooks' ), 20 );
	}

	public function register_runtime_hooks() {
		if ( ! $this->is_extension_enabled() ) {
			return;
		}

		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_styles' ), 20 );
		add_action( 'enqueue_block_assets', array( $this, 'enqueue_styles' ), 20 );
	}

	private function is_extension_enabled() {
		$active = ExtensionList::get_instance()->get_list( 'active' );
		return ! empty( $active['visibility'] );
	}

	/**
	 * Frontend CSS for hide-on-* classes.
	 */
	public function enqueue_styles() {
		$handle = 'blockish-extension-visibility-style';
		if ( wp_style_is( $handle, 'registered' ) && ! wp_style_is( $handle, 'enqueued' ) ) {
			wp_enqueue_style( $handle );
		}
	}

	/**
	 * Add hide-on-* classes to Blockish blocks.
	 *
	 * @param string $block_content Rendered HTML.
	 * @param array  $block         Parsed block.
	 * @return string
	 */
	public function render_block( $block_content, $block ) {
		if ( empty( $block_content ) || empty( $block['blockName'] ) ) {
			return $block_content;
		}

		if ( ! str_starts_with( $block['blockName'], 'blockish' ) ) {
			return $block_content;
		}

		$hide_on = isset( $block['attrs']['hideOn'] ) && is_array( $block['attrs']['hideOn'] )
			? $block['attrs']['hideOn']
			: array();

		$classes = array();
		if ( ! empty( $hide_on['Desktop'] ) ) {
			$classes[] = 'blockish-hide-on-desktop';
		}
		if ( ! empty( $hide_on['Tablet'] ) ) {
			$classes[] = 'blockish-hide-on-tablet';
		}
		if ( ! empty( $hide_on['Mobile'] ) ) {
			$classes[] = 'blockish-hide-on-mobile';
		}

		if ( empty( $classes ) ) {
			return $block_content;
		}

		$processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( ! $processor->next_tag() ) {
			return $block_content;
		}

		$existing = $processor->get_attribute( 'class' );
		$merged   = trim( ( is_string( $existing ) ? $existing : '' ) . ' ' . implode( ' ', $classes ) );
		$processor->set_attribute( 'class', $merged );

		return $processor->get_updated_html();
	}
}
