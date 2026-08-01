<?php

namespace Blockish\Mcp\Converter\Maps;

defined( 'ABSPATH' ) || exit;

/**
 * Icon styles → size / color / rotation / alignment.
 *
 * Surfaces (Converter):
 * - wrapper: alignment; size/color/rotation also accepted when AI styles the root
 * - svg: `.blockish-icon svg` / `svg`
 *
 * Content (icon path/viewBox, link) is never produced.
 */
class IconMap {

	public const BLOCK_NAME = 'blockish/icon';

	/**
	 * @return array<string, array>
	 */
	public static function properties(): array {
		return array(
			'text-align' => array(
				'attr' => 'alignment',
				'type' => 'enum_responsive',
				'enum' => array( 'left', 'center', 'right' ),
			),

			'width'  => array( 'attr' => 'size', 'type' => 'responsive' ),
			'height' => array( 'attr' => 'size', 'type' => 'responsive' ),

			'fill'  => array(
				'attr'       => 'color',
				'type'       => 'desktop_scalar',
				'hover_attr' => 'hoverColor',
			),
			'color' => array(
				'attr'       => 'color',
				'type'       => 'desktop_scalar',
				'hover_attr' => 'hoverColor',
			),

			'transform' => array( 'attr' => '__icon_rotation', 'type' => 'special' ),
			'rotate'    => array( 'attr' => '__icon_rotation', 'type' => 'special' ),
		);
	}
}
