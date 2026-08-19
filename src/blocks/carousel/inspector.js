import { InspectorControls } from '@wordpress/block-editor';
import { RangeControl } from '@wordpress/components';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { attributes, setAttributes, advancedControls } ) => {
	const { BlockishControl, BlockishResponsiveControl, BlockishGroupControl } =
		window?.blockish?.controls || {};

	if ( ! BlockishControl ) {
		return null;
	}

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'content', title: __( 'Content', 'blockish' ) },
					{ name: 'style', title: __( 'Style', 'blockish' ) },
					{ name: 'advanced', title: __( 'Advanced', 'blockish' ) },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Carousel settings', 'blockish' ) }
									initialOpen={ true }
								indicatorSlugs={['slidesPerView', 'slidesPerViewTablet', 'slidesPerViewMobile', 'gap', 'transitionSpeed']}>
									<p className="blockish-carousel-help">
										{ __(
											'Add Carousel Slide blocks. Each slide has its own background/layout — only limited content blocks are allowed (no Container).',
											'blockish'
										) }
									</p>
									<RangeControl
										label={ __( 'Slides per view (Desktop)', 'blockish' ) }
										value={ attributes.slidesPerView || 1 }
										onChange={ ( slidesPerView ) =>
											setAttributes( { slidesPerView } )
										}
										min={ 1 }
										max={ 8 }
									/>
									<RangeControl
										label={ __( 'Slides per view (Tablet)', 'blockish' ) }
										value={ attributes.slidesPerViewTablet || 1 }
										onChange={ ( slidesPerViewTablet ) =>
											setAttributes( { slidesPerViewTablet } )
										}
										min={ 1 }
										max={ 6 }
									/>
									<RangeControl
										label={ __( 'Slides per view (Mobile)', 'blockish' ) }
										value={ attributes.slidesPerViewMobile || 1 }
										onChange={ ( slidesPerViewMobile ) =>
											setAttributes( { slidesPerViewMobile } )
										}
										min={ 1 }
										max={ 4 }
									/>
									<RangeControl
										label={ __( 'Gap (px)', 'blockish' ) }
										value={ attributes.gap ?? 16 }
										onChange={ ( gap ) => setAttributes( { gap } ) }
										min={ 0 }
										max={ 64 }
									/>
									<RangeControl
										label={ __( 'Transition speed (ms)', 'blockish' ) }
										value={ attributes.transitionSpeed ?? 450 }
										onChange={ ( transitionSpeed ) =>
											setAttributes( { transitionSpeed } )
										}
										min={ 100 }
										max={ 1200 }
										step={ 50 }
									/>
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Navigation', 'blockish' ) }
								indicatorSlugs={['showArrows', 'arrowsPosition', 'showDots', 'dotsPosition', 'dotsAlign', 'loop', 'autoplay', 'pauseOnHover']}
								indicatorWhen={{
									arrowsPosition: 'showArrows',
									dotsPosition: 'showDots',
									dotsAlign: 'showDots',
									pauseOnHover: 'autoplay',
								}}>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Show arrows', 'blockish' ) }
										slug="showArrows"
										checked={ !! attributes.showArrows }
										value={ !! attributes.showArrows }
										onChange={ ( showArrows ) =>
											setAttributes( { showArrows: !! showArrows } )
										}
									/>
									{ attributes.showArrows && (
										<BlockishControl
											type="SelectControl"
											label={ __( 'Arrows position', 'blockish' ) }
											slug="arrowsPosition"
											options={ [
												{
													label: __( 'Inside', 'blockish' ),
													value: 'inside',
												},
												{
													label: __( 'Outside', 'blockish' ),
													value: 'outside',
												},
												{
													label: __( 'Overlay edges', 'blockish' ),
													value: 'overlay',
												},
											] }
											__next40pxDefaultSize
										/>
									) }
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Show dots', 'blockish' ) }
										slug="showDots"
										checked={ !! attributes.showDots }
										value={ !! attributes.showDots }
										onChange={ ( showDots ) =>
											setAttributes( { showDots: !! showDots } )
										}
									/>
									{ attributes.showDots && (
										<>
											<BlockishControl
												type="SelectControl"
												label={ __( 'Dots position', 'blockish' ) }
												slug="dotsPosition"
												options={ [
													{
														label: __( 'Below', 'blockish' ),
														value: 'below',
													},
													{
														label: __( 'Overlay (bottom)', 'blockish' ),
														value: 'overlay',
													},
												] }
												__next40pxDefaultSize
											/>
											<BlockishControl
												type="SelectControl"
												label={ __( 'Dots align', 'blockish' ) }
												slug="dotsAlign"
												options={ [
													{
														label: __( 'Start', 'blockish' ),
														value: 'flex-start',
													},
													{
														label: __( 'Center', 'blockish' ),
														value: 'center',
													},
													{
														label: __( 'End', 'blockish' ),
														value: 'flex-end',
													},
												] }
												__next40pxDefaultSize
											/>
										</>
									) }
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Loop', 'blockish' ) }
										slug="loop"
										checked={ !! attributes.loop }
										value={ !! attributes.loop }
										onChange={ ( loop ) =>
											setAttributes( { loop: !! loop } )
										}
									/>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Autoplay', 'blockish' ) }
										slug="autoplay"
										checked={ !! attributes.autoplay }
										value={ !! attributes.autoplay }
										onChange={ ( autoplay ) =>
											setAttributes( { autoplay: !! autoplay } )
										}
									/>
									{ attributes.autoplay && (
										<>
											<RangeControl
												label={ __( 'Autoplay speed (ms)', 'blockish' ) }
												value={ attributes.autoplaySpeed || 4000 }
												onChange={ ( autoplaySpeed ) =>
													setAttributes( { autoplaySpeed } )
												}
												min={ 1500 }
												max={ 12000 }
												step={ 500 }
											/>
											<BlockishControl
												type="ToggleControl"
												label={ __( 'Pause on hover', 'blockish' ) }
												slug="pauseOnHover"
												checked={ !! attributes.pauseOnHover }
												value={ !! attributes.pauseOnHover }
												onChange={ ( pauseOnHover ) =>
													setAttributes( {
														pauseOnHover: !! pauseOnHover,
													} )
												}
											/>
										</>
									) }
								</BlockishControl>
							</>
						) }

						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Track & slides', 'blockish' ) }
									initialOpen={ true }
								indicatorSlugs={['slideMinHeight', 'slideBorderRadius', 'trackPadding']}>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Slide min height', 'blockish' ) }
										slug="slideMinHeight"
										left="10ch"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Slide radius', 'blockish' ) }
										slug="slideBorderRadius"
										left="8ch"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacing"
										label={ __( 'Viewport padding', 'blockish' ) }
										slug="trackPadding"
										left="8ch"
									/>
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Arrows', 'blockish' ) }
								indicatorSlugs={['arrowSize', 'arrowIconSize', 'arrowOffset', 'arrowBorderRadius', 'arrowColor', 'arrowBackground', 'arrowBorder', 'arrowBoxShadow', 'arrowColorHover', 'arrowBackgroundHover']}>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Size', 'blockish' ) }
										slug="arrowSize"
										left="10ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Icon size', 'blockish' ) }
										slug="arrowIconSize"
										left="10ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Side offset', 'blockish' ) }
										slug="arrowOffset"
										left="10ch"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Radius', 'blockish' ) }
										slug="arrowBorderRadius"
										left="8ch"
									/>
									<BlockishControl
										type="BlockishTab"
										tabs={ [
											{
												name: 'arrow-normal',
												title: __( 'Normal', 'blockish' ),
											},
											{
												name: 'arrow-hover',
												title: __( 'Hover', 'blockish' ),
											},
										] }
									>
										{ ( { name } ) => (
											<>
												{ name === 'arrow-normal' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Color', 'blockish' ) }
															slug="arrowColor"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Background', 'blockish' ) }
															slug="arrowBackground"
														/>
														<BlockishGroupControl
															type="BlockishBorder"
															label={ __( 'Border', 'blockish' ) }
															slug="arrowBorder"
														/>
														<BlockishGroupControl
															type="BlockishBoxShadow"
															label={ __( 'Shadow', 'blockish' ) }
															slug="arrowBoxShadow"
														/>
													</>
												) }
												{ name === 'arrow-hover' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Color', 'blockish' ) }
															slug="arrowColorHover"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Background', 'blockish' ) }
															slug="arrowBackgroundHover"
														/>
													</>
												) }
											</>
										) }
									</BlockishControl>
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Dots', 'blockish' ) }
								indicatorSlugs={['dotSize', 'dotActiveSize', 'dotGap', 'dotsOffset', 'dotBorderRadius', 'dotColor', 'dotActiveColor']}>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Size', 'blockish' ) }
										slug="dotSize"
										left="10ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Active size', 'blockish' ) }
										slug="dotActiveSize"
										left="10ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Gap', 'blockish' ) }
										slug="dotGap"
										left="10ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Offset', 'blockish' ) }
										slug="dotsOffset"
										left="10ch"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Radius', 'blockish' ) }
										slug="dotBorderRadius"
										left="8ch"
									/>
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Color', 'blockish' ) }
										slug="dotColor"
									/>
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Active color', 'blockish' ) }
										slug="dotActiveColor"
									/>
								</BlockishControl>
							</>
						) }

						{ tabName === 'advanced' && advancedControls }
					</>
				) }
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo( Inspector );
