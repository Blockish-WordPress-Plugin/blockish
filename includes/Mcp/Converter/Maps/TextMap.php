<?php

namespace Blockish\Mcp\Converter\Maps;

defined( 'ABSPATH' ) || exit;

/**
 * Style attrs shared by text blocks (heading, paragraph): alignment, color,
 * typography (stringified JSON), text-shadow.
 *
 * Content / tag are not style — never produced by the converter.
 */
class TextMap {

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

			'color' => array(
				'attr'       => 'color',
				'type'       => 'desktop_scalar',
				'hover_attr' => 'hoverColor',
			),

			'font-size'      => array(
				'attr'  => 'typography',
				'type'  => 'typography_field',
				'field' => 'fontSize',
				'shape' => 'responsive',
			),
			'line-height'    => array(
				'attr'  => 'typography',
				'type'  => 'typography_field',
				'field' => 'lineHeight',
				'shape' => 'responsive',
			),
			'letter-spacing' => array(
				'attr'  => 'typography',
				'type'  => 'typography_field',
				'field' => 'letterSpacing',
				'shape' => 'responsive',
			),
			'font-weight'    => array(
				'attr'  => 'typography',
				'type'  => 'typography_field',
				'field' => 'fontWeight',
				'shape' => 'scalar',
			),
			'font-style'     => array(
				'attr'  => 'typography',
				'type'  => 'typography_field',
				'field' => 'fontStyle',
				'shape' => 'scalar',
			),
			'text-transform' => array(
				'attr'  => 'typography',
				'type'  => 'typography_field',
				'field' => 'textTransform',
				'shape' => 'scalar',
			),
			'text-decoration' => array(
				'attr'  => 'typography',
				'type'  => 'typography_field',
				'field' => 'textDecoration',
				'shape' => 'scalar',
			),
			'font-family'    => array(
				'attr'  => 'typography',
				'type'  => 'typography_field',
				'field' => 'fontFamily',
				'shape' => 'option',
			),

			'text-shadow' => array(
				'attr'       => 'textShadow',
				'type'       => 'text_shadow',
				'hover_attr' => 'textShadowHover',
			),
		);
	}
}
