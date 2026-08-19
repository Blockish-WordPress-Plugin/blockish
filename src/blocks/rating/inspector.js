import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { attributes, setAttributes, advancedControls } ) => {
	const { BlockishControl, BlockishResponsiveControl } =
		window?.blockish?.controls;

	const ratingScale = Math.max(
		1,
		Math.min( 10, parseInt( attributes?.ratingScale, 10 ) || 1 )
	);

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{
						name: 'content',
						title: 'Content',
					},
					{
						name: 'style',
						title: 'Style',
					},
					{
						name: 'advanced',
						title: 'Advanced',
					},
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Rating', 'blockish' ) }
								initialOpen={ true }
							indicatorSlugs={['ratingScale', 'rating', 'icon', 'alignment']}>
								<BlockishControl
									type="BlockishNumber"
									label={ __( 'Rating Scale', 'blockish' ) }
									slug="ratingScale"
									min={ 1 }
									max={ 10 }
									onChange={ ( value ) => {
										const safeScale = Math.max(
											1,
											Math.min(
												10,
												parseInt( value, 10 ) || 1
											)
										);
										const currentRating =
											parseFloat(
												attributes?.rating
											) || safeScale;
										const safeRating = Math.min(
											Math.round( currentRating * 2 ) / 2,
											safeScale
										);
										setAttributes( {
											ratingScale: safeScale,
											rating: safeRating,
										} );
									} }
								/>
								<BlockishControl
									type="BlockishNumber"
									label={ __( 'Rating', 'blockish' ) }
									slug="rating"
									min={ 0 }
									max={ ratingScale }
									step={ 0.5 }
									onChange={ ( value ) => {
										const parsedRating =
											parseFloat( value ) || 0;
										const safeRating = Math.max(
											0,
											Math.min(
												ratingScale,
												Math.round(
													parsedRating * 2
												) / 2
											)
										);
										setAttributes( { rating: safeRating } );
									} }
								/>
								<BlockishControl
									type="BlockishIconPicker"
									label={ __( 'Icon', 'blockish' ) }
									slug="icon"
								/>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={ __( 'Alignment', 'blockish' ) }
									slug="alignment"
									left="8ch"
									options={ [
										{
											value: 'left',
											label: __( 'Left', 'blockish' ),
										},
										{
											value: 'center',
											label: __( 'Center', 'blockish' ),
										},
										{
											value: 'right',
											label: __( 'Right', 'blockish' ),
										},
									] }
								/>
							</BlockishControl>
						) }

						{ tabName === 'style' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Icon', 'blockish' ) }
								initialOpen={ true }
							indicatorSlugs={['iconSize', 'iconSpacing', 'iconColor', 'unmarkedColor']}>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Size', 'blockish' ) }
									slug="iconSize"
									left="4ch"
								/>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Spacing', 'blockish' ) }
									slug="iconSpacing"
									left="7ch"
								/>
								<BlockishControl
									type="BlockishColor"
									label={ __( 'Color', 'blockish' ) }
									slug="iconColor"
								/>
								<BlockishControl
									type="BlockishColor"
									label={ __( 'Unmarked Color', 'blockish' ) }
									slug="unmarkedColor"
								/>
							</BlockishControl>
						) }

						{ tabName === 'advanced' && advancedControls }
					</>
				) }
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo( Inspector );
