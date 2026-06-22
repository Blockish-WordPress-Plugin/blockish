import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { attributes, advancedControls } ) => {
	const { BlockishControl, BlockishResponsiveControl, BlockishGroupControl } =
		window?.blockish?.controls;

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'content', title: 'Content' },
					{ name: 'style', title: 'Style' },
					{ name: 'advanced', title: 'Advanced' },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Progress Bar', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishControl
									type="ToggleControl"
									label={ __( 'Show Title', 'blockish' ) }
									slug="showTitle"
								/>
								{ attributes?.showTitle && (
									<>
										<BlockishControl
											type="TextControl"
											label={ __( 'Title', 'blockish' ) }
											slug="title"
											__next40pxDefaultSize
										/>
										<BlockishControl
											type="BlockishSelect"
											label={ __( 'Title HTML Tag', 'blockish' ) }
											slug="titleTag"
											options={ [
												{ value: 'h1', label: __( 'H1', 'blockish' ) },
												{ value: 'h2', label: __( 'H2', 'blockish' ) },
												{ value: 'h3', label: __( 'H3', 'blockish' ) },
												{ value: 'h4', label: __( 'H4', 'blockish' ) },
												{ value: 'h5', label: __( 'H5', 'blockish' ) },
												{ value: 'h6', label: __( 'H6', 'blockish' ) },
												{ value: 'p', label: __( 'P', 'blockish' ) },
												{ value: 'span', label: __( 'Span', 'blockish' ) },
												{ value: 'div', label: __( 'Div', 'blockish' ) },
											] }
										/>
									</>
								) }
								<BlockishControl type="BlockishDivider" />
								<BlockishControl
									type="BlockishRangeControl"
									label={ __( 'Percentage', 'blockish' ) }
									slug="percentage"
									min={ 0 }
									max={ 100 }
									step={ 1 }
								/>
								<BlockishControl
									type="BlockishRangeControl"
									label={ __( 'Animation Duration(Sec)', 'blockish' ) }
									slug="animationDuration"
									min={ 0 }
									max={ 10 }
									step={ 0.1 }
								/>
								<BlockishControl
									type="ToggleControl"
									label={ __( 'Display Percentage', 'blockish' ) }
									slug="displayPercentage"
								/>
								<BlockishControl type="BlockishDivider" />
								<BlockishControl
									type="TextControl"
									label={ __( 'Inner Text', 'blockish' ) }
									slug="innerText"
									__next40pxDefaultSize
								/>
							</BlockishControl>
						) }

						{ tabName === 'style' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Progress Bar', 'blockish' ) }
								initialOpen={ true }
							>
								<p className="blockish-style-section-title">
									{ __( 'Title', 'blockish' ) }
								</p>
								<BlockishControl
									type="BlockishColor"
									label={ __( 'Text Color', 'blockish' ) }
									slug="titleTextColor"
								/>
								<BlockishGroupControl
									type="BlockishTypography"
									label={ __( 'Typography', 'blockish' ) }
									slug="titleTypography"
								/>
								<BlockishGroupControl
									type="BlockishBoxShadow"
									label={ __( 'Text Shadow', 'blockish' ) }
									slug="titleTextShadow"
									exclude={ [ 'inset', 'spread' ] }
								/>

								<BlockishControl type="BlockishDivider" />
								<p className="blockish-style-section-title">
									{ __( 'Percentage', 'blockish' ) }
								</p>
								<BlockishControl
									type="BlockishColor"
									label={ __( 'Color', 'blockish' ) }
									slug="percentageFillColor"
								/>
								<BlockishControl
									type="BlockishColor"
									label={ __( 'Background Color', 'blockish' ) }
									slug="percentageBackgroundColor"
								/>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Height', 'blockish' ) }
									slug="percentageHeight"
									left="42px"
								/>
								<BlockishResponsiveControl
									type="BlockishBorderRadius"
									label={ __( 'Border Radius', 'blockish' ) }
									slug="percentageBorderRadius"
									left="44px"
								/>

								<BlockishControl type="BlockishDivider" />
								<p className="blockish-style-section-title">
									{ __( 'Inner Text', 'blockish' ) }
								</p>
								<BlockishControl
									type="BlockishColor"
									label={ __( 'Text Color', 'blockish' ) }
									slug="innerTextColor"
								/>
								<BlockishGroupControl
									type="BlockishTypography"
									label={ __( 'Typography', 'blockish' ) }
									slug="innerTextTypography"
								/>
								<BlockishGroupControl
									type="BlockishBoxShadow"
									label={ __( 'Text Shadow', 'blockish' ) }
									slug="innerTextShadow"
									exclude={ [ 'inset', 'spread' ] }
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
