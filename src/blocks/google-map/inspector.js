import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { advancedControls } ) => {
	const { BlockishControl, BlockishGroupControl } =
		window?.blockish?.controls;

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
								title={ __( 'Google Maps', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishControl
									type="TextControl"
									label={ __( 'Location', 'blockish' ) }
									slug="location"
								/>
								<BlockishControl
									type="BlockishNumber"
									label={ __( 'Zoom', 'blockish' ) }
									slug="zoom"
									min={ 0 }
									max={ 21 }
								/>
								<BlockishControl
									type="BlockishRangeUnit"
									label={ __( 'Height', 'blockish' ) }
									slug="mapHeight"
								/>
							</BlockishControl>
						) }

						{ tabName === 'style' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Google Maps', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishControl
									type="BlockishTab"
									tabType="normal"
									tabs={ [
										{
											name: 'map-normal',
											title: 'Normal',
										},
										{
											name: 'map-hover',
											title: 'Hover',
										},
									] }
								>
									{ ( { name } ) => (
										<>
											{ name === 'map-normal' && (
												<BlockishGroupControl
													type="BlockishCSSFilters"
													label={ __(
														'CSS Filters',
														'blockish'
													) }
													slug="mapCSSFiltersNormal"
												/>
											) }

											{ name === 'map-hover' && (
												<>
													<BlockishGroupControl
														type="BlockishCSSFilters"
														label={ __(
															'CSS Filters',
															'blockish'
														) }
														slug="mapCSSFiltersHover"
													/>
													<BlockishControl
														type="BlockishRangeControl"
														label={ __(
															'Transition Duration (s)',
															'blockish'
														) }
														slug="mapHoverTransition"
														min={ 0 }
														max={ 10 }
														step={ 0.1 }
													/>
												</>
											) }
										</>
									) }
								</BlockishControl>
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
