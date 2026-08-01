<?php

namespace Blockish\Mcp\Converter\Maps;

defined( 'ABSPATH' ) || exit;

/**
 * Button chrome styles → button* attributes (not global border/background/padding).
 *
 * Merged on top of GlobalMap. Content (text/url/icon) is never produced.
 *
 * Selector surfaces (Converter):
 * - wrapper: root → buttonPlacement (justify-content), margin, widthType unlock
 * - chrome: root or `.blockish-button-link` → button* appearance
 * - icon: `.blockish-button-icon` → buttonIconSize
 */
class ButtonMap {

	public const BLOCK_NAME = 'blockish/button';

	/**
	 * @return array<string, array>
	 */
	public static function properties(): array {
		$padding = array(
			'padding'        => array( 'attr' => 'buttonPadding', 'type' => 'spacing' ),
			'padding-top'    => array( 'attr' => 'buttonPadding', 'type' => 'spacing_side', 'side' => 'top' ),
			'padding-right'  => array( 'attr' => 'buttonPadding', 'type' => 'spacing_side', 'side' => 'right' ),
			'padding-bottom' => array( 'attr' => 'buttonPadding', 'type' => 'spacing_side', 'side' => 'bottom' ),
			'padding-left'   => array( 'attr' => 'buttonPadding', 'type' => 'spacing_side', 'side' => 'left' ),
		);

		$typography = array(
			'font-size'       => array( 'attr' => 'buttonTypography', 'type' => 'typography_field', 'field' => 'fontSize', 'shape' => 'responsive' ),
			'line-height'     => array( 'attr' => 'buttonTypography', 'type' => 'typography_field', 'field' => 'lineHeight', 'shape' => 'responsive' ),
			'letter-spacing'  => array( 'attr' => 'buttonTypography', 'type' => 'typography_field', 'field' => 'letterSpacing', 'shape' => 'responsive' ),
			'font-weight'     => array( 'attr' => 'buttonTypography', 'type' => 'typography_field', 'field' => 'fontWeight', 'shape' => 'scalar' ),
			'font-style'      => array( 'attr' => 'buttonTypography', 'type' => 'typography_field', 'field' => 'fontStyle', 'shape' => 'scalar' ),
			'text-transform'  => array( 'attr' => 'buttonTypography', 'type' => 'typography_field', 'field' => 'textTransform', 'shape' => 'scalar' ),
			'text-decoration' => array( 'attr' => 'buttonTypography', 'type' => 'typography_field', 'field' => 'textDecoration', 'shape' => 'scalar' ),
			'font-family'     => array( 'attr' => 'buttonTypography', 'type' => 'typography_field', 'field' => 'fontFamily', 'shape' => 'option' ),
		);

		return array_merge(
			GlobalMap::border_entries( 'buttonBorder', null ),
			GlobalMap::radius_entries( 'buttonBorderRadius', null ),
			GlobalMap::background_entries( 'buttonBackground', 'buttonHoverBackground' ),
			$padding,
			$typography,
			array(
				// Placement on wrapper; alignment remapped for chrome in Converter.
				'justify-content' => array( 'attr' => 'buttonPlacement', 'type' => 'button_placement' ),
				'text-align'      => array( 'attr' => 'buttonAlignment', 'type' => 'button_alignment' ),

				'color' => array(
					'attr'       => 'buttonTextColor',
					'type'       => 'desktop_scalar',
					'hover_attr' => 'buttonHoverTextColor',
				),

				'gap'            => array( 'attr' => 'buttonContentSpacing', 'type' => 'responsive' ),
				'min-height'     => array( 'attr' => 'buttonMinHeight', 'type' => 'responsive' ),
				'width'          => array( 'attr' => '__button_width', 'type' => 'special' ),
				'flex-direction' => array( 'attr' => 'iconPosition', 'type' => 'icon_position' ),

				'box-shadow' => array(
					'attr'       => 'buttonBoxShadow',
					'type'       => 'box_shadow',
					'hover_attr' => 'buttonHoverBoxShadow',
				),
				'text-shadow' => array(
					'attr'       => 'buttonTextShadow',
					'type'       => 'text_shadow',
					'hover_attr' => null,
				),

				// Hover border is color-only on buttons.
				'border-color' => array(
					'attr'       => 'buttonBorder',
					'type'       => 'border_part',
					'part'       => 'color',
					'hover_attr' => 'buttonHoverBorderColor',
				),

				'transition' => array( 'attr' => '__button_transition', 'type' => 'special' ),
				'--blockish-button-hover-transition' => array(
					'attr' => 'buttonHoverTransition',
					'type' => 'transition_seconds',
				),
			)
		);
	}
}
