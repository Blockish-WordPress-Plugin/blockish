<?php

namespace Blockish\Mcp\Converter\Maps;

defined( 'ABSPATH' ) || exit;

/**
 * Container-only properties + overrides of GlobalMap where the container uses
 * its own attribute names (containerBackground, …) or special width/grid handling.
 *
 * Merged on top of GlobalMap at convert time — these keys win.
 */
class ContainerMap {

	public const BLOCK_NAME = 'blockish/container';

	/**
	 * @return array<string, array>
	 */
	public static function properties(): array {
		return array_merge(
			GlobalMap::border_entries( 'containerBorder', 'containerHoverBorder' ),
			GlobalMap::radius_entries( 'containerBorderRadius', 'containerHoverBorderRadius' ),
			GlobalMap::background_entries( 'containerBackground', 'containerHoverBackground' ),
			array(
				// Layout parent.
				'display'         => array( 'attr' => '__container_display', 'type' => 'special' ),
				'flex-direction'  => array( 'attr' => 'flexDirection', 'type' => 'responsive_option', 'hover_attr' => null ),
				'flex-wrap'       => array( 'attr' => 'flexWrap', 'type' => 'responsive' ),
				'justify-content' => array( 'attr' => 'justifyContent', 'type' => 'responsive_option' ),
				'align-items'     => array( 'attr' => 'alignItems', 'type' => 'responsive_option' ),
				'column-gap'      => array( 'attr' => 'columnGap', 'type' => 'responsive' ),
				'row-gap'         => array( 'attr' => 'rowGap', 'type' => 'responsive' ),
				'gap'             => array( 'attr' => '__gap', 'type' => 'special' ),
				'overflow'        => array( 'attr' => 'overflow', 'type' => 'responsive_option' ),
				'min-height'      => array( 'attr' => 'containerMinHeight', 'type' => 'responsive' ),
				'height'          => array( 'attr' => '__height', 'type' => 'special' ),

				// Width: container model, not global maxWidth.
				'max-width'       => array( 'attr' => '__max_width', 'type' => 'special' ),

				// Grid (Blockish fixed / auto models only).
				'grid-template-columns' => array( 'attr' => '__grid_template_columns', 'type' => 'special' ),
				'grid-template-rows'    => array( 'attr' => '__grid_template_rows', 'type' => 'special' ),
				'grid-auto-rows'        => array( 'attr' => '__grid_auto_rows', 'type' => 'special' ),

				// Appearance.
				'box-shadow' => array(
					'attr'       => 'containerBoxShadow',
					'type'       => 'box_shadow',
					'hover_attr' => 'containerHoverBoxShadow',
				),
			)
		);
	}
}
