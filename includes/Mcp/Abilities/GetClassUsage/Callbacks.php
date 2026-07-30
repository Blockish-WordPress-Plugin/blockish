<?php

namespace Blockish\Mcp\Abilities\GetClassUsage;

use Blockish\Extensions\ClassUsage;

defined( 'ABSPATH' ) || exit;

class Callbacks {
	public static function get_class_usage( $input ): array {
		$input = is_array( $input ) ? $input : array();

		$class_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : null;
		$name     = isset( $input['name'] ) && is_string( $input['name'] ) ? $input['name'] : null;

		if ( $class_id && $class_id > 0 && 'blockish-classes' !== get_post_type( $class_id ) ) {
			return array( 'error' => 'post_id must be a blockish-classes post.' );
		}

		return ClassUsage::report( $class_id ?: null, $name );
	}
}
