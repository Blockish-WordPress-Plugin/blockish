<?php

namespace Blockish\Mcp\Converter\Maps;

defined( 'ABSPATH' ) || exit;

/**
 * Image media / caption styles to image* and caption* attributes.
 *
 * Surfaces (Converter):
 * - wrapper: alignment, hover transition; appearance also accepted (AI styles root as media)
 * - media: `.blockish-image` / `img`
 * - caption: `.blockish-image-caption` / `figcaption`
 *
 * Content (image/alt/lightbox/caption text) is never produced.
 */
class ImageMap {

	public const BLOCK_NAME = 'blockish/image';

	/**
	 * @return array<string, array>
	 */
	public static function properties(): array {
		return array_merge(
			GlobalMap::border_entries( 'imageBorderNormal', 'imageBorderHover' ),
			GlobalMap::radius_entries( 'imageBorderRadiusNormal', 'imageBorderRadiusHover' ),
			array(
				'text-align' => array(
					'attr' => 'alignment',
					'type' => 'enum_responsive',
					'enum' => array( 'left', 'center', 'right' ),
				),

				'width'     => array( 'attr' => 'imageWidth', 'type' => 'responsive' ),
				'max-width' => array( 'attr' => 'imageMaxWidth', 'type' => 'responsive' ),
				'height'    => array( 'attr' => 'imageHeight', 'type' => 'responsive' ),

				'object-fit' => array( 'attr' => 'objectFit', 'type' => 'responsive_option' ),

				'box-shadow' => array(
					'attr'       => 'imageBoxShadowNormal',
					'type'       => 'box_shadow',
					'hover_attr' => 'imageBoxShadowHover',
				),

				'opacity' => array(
					'attr'       => 'imageOpacityNormal',
					'type'       => 'opacity_percent',
					'hover_attr' => 'imageOpacityHover',
				),

				'filter' => array(
					'attr'       => 'imageCSSFiltersNormal',
					'type'       => 'css_filters',
					'hover_attr' => 'imageCSSFiltersHover',
				),

				'transition' => array( 'attr' => '__image_transition', 'type' => 'special' ),
				'--blockish-image-hover-transition' => array(
					'attr' => 'imageHoverTransition',
					'type' => 'transition_seconds',
				),
			)
		);
	}

	/**
	 * Caption-only property map (applied when surface is caption).
	 *
	 * @return array<string, array>
	 */
	public static function caption_properties(): array {
		return array(
			'text-align' => array(
				'attr' => 'captionAlignment',
				'type' => 'enum_responsive',
				'enum' => array( 'left', 'center', 'right' ),
			),
			'color' => array(
				'attr' => 'captionColor',
				'type' => 'desktop_scalar',
			),
			'background-color' => array(
				'attr' => 'captionBackgroundColor',
				'type' => 'desktop_scalar',
			),
			'margin-block-start' => array( 'attr' => 'captionSpacing', 'type' => 'responsive' ),
			'margin-top'         => array( 'attr' => 'captionSpacing', 'type' => 'responsive' ),
			'text-shadow'        => array(
				'attr'       => 'captionTextShadow',
				'type'       => 'text_shadow',
				'hover_attr' => null,
			),
			'font-size'       => array( 'attr' => 'captionTypography', 'type' => 'typography_field', 'field' => 'fontSize', 'shape' => 'responsive' ),
			'line-height'     => array( 'attr' => 'captionTypography', 'type' => 'typography_field', 'field' => 'lineHeight', 'shape' => 'responsive' ),
			'letter-spacing'  => array( 'attr' => 'captionTypography', 'type' => 'typography_field', 'field' => 'letterSpacing', 'shape' => 'responsive' ),
			'font-weight'     => array( 'attr' => 'captionTypography', 'type' => 'typography_field', 'field' => 'fontWeight', 'shape' => 'scalar' ),
			'font-style'      => array( 'attr' => 'captionTypography', 'type' => 'typography_field', 'field' => 'fontStyle', 'shape' => 'scalar' ),
			'text-transform'  => array( 'attr' => 'captionTypography', 'type' => 'typography_field', 'field' => 'textTransform', 'shape' => 'scalar' ),
			'text-decoration' => array( 'attr' => 'captionTypography', 'type' => 'typography_field', 'field' => 'textDecoration', 'shape' => 'scalar' ),
			'font-family'     => array( 'attr' => 'captionTypography', 'type' => 'typography_field', 'field' => 'fontFamily', 'shape' => 'option' ),
		);
	}
}
