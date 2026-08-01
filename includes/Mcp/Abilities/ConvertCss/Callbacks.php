<?php

namespace Blockish\Mcp\Abilities\ConvertCss;

defined( 'ABSPATH' ) || exit;

use Blockish\Mcp\Converter\Converter;
use WP_Error;

class Callbacks {

	/**
	 * @param array $input
	 * @return array|WP_Error
	 */
	public static function execute( array $input ) {
		$action     = $input['action'] ?? '';
		$block_name = $input['block_name'] ?? 'blockish/global';

		if ( 'css_to_schema' === $action ) {
			$result = Converter::css_to_schema( $input );
			if ( ! empty( $result['error'] ) ) {
				return new WP_Error( 'convert_css_error', $result['error'] );
			}
			return $result;
		}

		if ( 'css_to_attributes' === $action ) {
			$result = Converter::css_to_attributes( $block_name, $input );
			if ( ! empty( $result['error'] ) ) {
				return new WP_Error( 'convert_css_error', $result['error'] );
			}

			if ( ! empty( $result['customCss'] ) ) {
				$result['attributes']['customCss'] = $result['customCss'];
			}

			return $result;
		}

		if ( 'attributes_to_css' === $action ) {
			$result = Converter::attributes_to_css( $block_name, $input );
			if ( ! empty( $result['error'] ) ) {
				return new WP_Error( 'convert_css_error', $result['error'] );
			}
			return $result;
		}

		return new WP_Error(
			'invalid_action',
			'action must be css_to_schema, css_to_attributes, or attributes_to_css.'
		);
	}
}
