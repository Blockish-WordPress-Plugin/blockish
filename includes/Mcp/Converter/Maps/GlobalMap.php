<?php

namespace Blockish\Mcp\Converter\Maps;

defined( 'ABSPATH' ) || exit;

/**
 * Shared Advanced-panel attributes available on every Blockish block.
 *
 * Sourced from src/global/block.json + core.md §4.
 */
class GlobalMap {

	public const BLOCK_NAME = 'blockish/global';

	/**
	 * Every border spelling a stylesheet can use, pointed at one Border attribute.
	 *
	 * @return array<string, array{attr: string, type: string, hover_attr: string|null, part?: string, side?: string}>
	 */
	public static function border_entries( string $attr, ?string $hover_attr ): array {
		$entries = array(
			'border' => array( 'attr' => $attr, 'type' => 'border', 'hover_attr' => $hover_attr ),
		);

		foreach ( array( 'width', 'style', 'color' ) as $part ) {
			$entries[ 'border-' . $part ] = array(
				'attr'       => $attr,
				'type'       => 'border_part',
				'part'       => $part,
				'hover_attr' => $hover_attr,
			);
		}

		foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
			$entries[ 'border-' . $side ] = array(
				'attr'       => $attr,
				'type'       => 'border',
				'side'       => $side,
				'hover_attr' => $hover_attr,
			);

			foreach ( array( 'width', 'style', 'color' ) as $part ) {
				$entries[ "border-{$side}-{$part}" ] = array(
					'attr'       => $attr,
					'type'       => 'border_part',
					'part'       => $part,
					'side'       => $side,
					'hover_attr' => $hover_attr,
				);
			}
		}

		return $entries;
	}

	/**
	 * @return array<string, array{attr: string, type: string, hover_attr?: string|null, side?: string, corner?: string}>
	 */
	public static function radius_entries( string $attr, ?string $hover_attr ): array {
		$corners = array(
			'border-radius'            => null,
			'border-top-left-radius'   => 'topLeft',
			'border-top-right-radius'  => 'topRight',
			'border-bottom-right-radius'=> 'bottomRight',
			'border-bottom-left-radius'=> 'bottomLeft',
		);

		$entries = array();
		foreach ( $corners as $property => $corner ) {
			$entries[ $property ] = array(
				'attr'       => $attr,
				'type'       => null === $corner ? 'radius' : 'radius_side',
				'corner'     => $corner,
				'hover_attr' => $hover_attr,
			);
			if ( null === $corner ) {
				unset( $entries[ $property ]['corner'] );
			}
		}

		return $entries;
	}

	/**
	 * Background color/image/shorthand + size/position/repeat/attachment/blend.
	 *
	 * @return array<string, array{attr: string, type: string, hover_attr?: string|null}>
	 */
	public static function background_entries( string $attr, ?string $hover_attr ): array {
		$props = array(
			'background',
			'background-color',
			'background-image',
			'background-size',
			'background-position',
			'background-repeat',
			'background-attachment',
			'background-blend-mode',
		);

		$entries = array();
		foreach ( $props as $property ) {
			$entries[ $property ] = array(
				'attr'       => $attr,
				'type'       => 'background_bucket',
				'hover_attr' => $hover_attr,
			);
		}

		return $entries;
	}

	/**
	 * @return array<string, array>
	 */
	public static function properties(): array {
		return array_merge(
			self::border_entries( 'border', 'borderHover' ),
			self::radius_entries( 'borderRadius', 'borderRadiusHover' ),
			self::background_entries( 'background', 'backgroundHover' ),
			array(
				// Layout & sizing.
				'padding'         => array( 'attr' => 'padding', 'type' => 'spacing' ),
				'padding-top'     => array( 'attr' => 'padding', 'type' => 'spacing_side', 'side' => 'top' ),
				'padding-right'   => array( 'attr' => 'padding', 'type' => 'spacing_side', 'side' => 'right' ),
				'padding-bottom'  => array( 'attr' => 'padding', 'type' => 'spacing_side', 'side' => 'bottom' ),
				'padding-left'    => array( 'attr' => 'padding', 'type' => 'spacing_side', 'side' => 'left' ),
				'margin'          => array( 'attr' => 'margin', 'type' => 'spacing' ),
				'margin-top'      => array( 'attr' => 'margin', 'type' => 'spacing_side', 'side' => 'top' ),
				'margin-right'    => array( 'attr' => 'margin', 'type' => 'spacing_side', 'side' => 'right' ),
				'margin-bottom'   => array( 'attr' => 'margin', 'type' => 'spacing_side', 'side' => 'bottom' ),
				'margin-left'     => array( 'attr' => 'margin', 'type' => 'spacing_side', 'side' => 'left' ),
				'z-index'         => array( 'attr' => 'zIndex', 'type' => 'responsive' ),
				'min-width'       => array( 'attr' => 'minWidth', 'type' => 'responsive' ),
				'max-width'       => array( 'attr' => 'maxWidth', 'type' => 'responsive' ),
				'width'           => array( 'attr' => '__width', 'type' => 'special' ),
				'display'         => array( 'attr' => '__display', 'type' => 'special' ),

				// Position (Option — matches Advanced Position panel).
				'position'        => array( 'attr' => 'position', 'type' => 'option' ),
				'top'             => array( 'attr' => 'positionTop', 'type' => 'responsive' ),
				'right'           => array( 'attr' => 'positionRight', 'type' => 'responsive' ),
				'bottom'          => array( 'attr' => 'positionBottom', 'type' => 'responsive' ),
				'left'            => array( 'attr' => 'positionLeft', 'type' => 'responsive' ),

				// Flex / grid child.
				'align-self'        => array( 'attr' => 'alignSelf', 'type' => 'responsive' ),
				'justify-self'      => array( 'attr' => 'justifySelf', 'type' => 'responsive' ),
				'order'             => array( 'attr' => '__order', 'type' => 'special' ),
				'flex-grow'         => array( 'attr' => 'flexGrow', 'type' => 'responsive' ),
				'flex-shrink'       => array( 'attr' => 'flexShrink', 'type' => 'responsive' ),
				'grid-column-start' => array( 'attr' => 'gridColumnStart', 'type' => 'responsive' ),
				'grid-column-end'   => array( 'attr' => 'gridColumnEnd', 'type' => 'responsive' ),
				'grid-row-start'    => array( 'attr' => 'gridRowStart', 'type' => 'responsive' ),
				'grid-row-end'      => array( 'attr' => 'gridRowEnd', 'type' => 'responsive' ),
				'grid-column'       => array( 'attr' => '__grid_column', 'type' => 'special' ),
				'grid-row'          => array( 'attr' => '__grid_row', 'type' => 'special' ),

				// Appearance.
				'box-shadow' => array(
					'attr'       => 'boxShadow',
					'type'       => 'box_shadow',
					'hover_attr' => 'boxShadowHover',
				),

				// Transitions.
				'transition'                              => array( 'attr' => '__transition', 'type' => 'special' ),
				'--blockish-background-hover-transition'  => array( 'attr' => 'backgroundHoverTransition', 'type' => 'transition_seconds' ),
				'--blockish-border-hover-transition'      => array( 'attr' => 'borderHoverTransition', 'type' => 'transition_seconds' ),
				'--transform-transition'                  => array( 'attr' => 'transformTransitionDuration', 'type' => 'transition_seconds' ),

				// Transform.
				'transform'        => array( 'attr' => '__transform', 'type' => 'special' ),
				'transform-origin' => array( 'attr' => '__transform_origin', 'type' => 'special' ),
				'translate'        => array( 'attr' => '__translate', 'type' => 'special' ),
				'scale'            => array( 'attr' => '__scale', 'type' => 'special' ),
				'rotate'           => array( 'attr' => '__rotate', 'type' => 'special' ),
				'perspective'      => array( 'attr' => 'perspective', 'type' => 'transform_length' ),
			)
		);
	}
}
