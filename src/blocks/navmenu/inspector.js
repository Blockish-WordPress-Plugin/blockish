import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { advancedControls } ) => {
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
								title={ __( 'Menu', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishControl
									type="BlockishToggleGroup"
									label={ __( 'Menu Breakpoint', 'blockish' ) }
									slug="menuBreakpoint"
									options={ [
										{ value: 'tablet', label: __( 'Tablet', 'blockish' ) },
										{ value: 'mobile', label: __( 'Mobile', 'blockish' ) },
										{ value: 'none', label: __( 'None', 'blockish' ) },
									] }
									left="110px"
								/>
								<BlockishControl
									type="ToggleControl"
									label={ __( 'Scroll Lock For Offcanvas', 'blockish' ) }
									slug="scrollLockOffcanvas"
									help={ __( 'It will lock the scrolling of the offcanvas when you are in the frontend', 'blockish' ) }
								/>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={ __( 'Justify Content', 'blockish' ) }
									slug="justifyContent"
									options={ [
										{ value: 'flex-start', label: __( 'Start', 'blockish' ) },
										{ value: 'center', label: __( 'Center', 'blockish' ) },
										{ value: 'flex-end', label: __( 'End', 'blockish' ) },
										{ value: 'space-between', label: __( 'Between', 'blockish' ) },
										{ value: 'space-around', label: __( 'Around', 'blockish' ) },
										{ value: 'space-evenly', label: __( 'Evenly', 'blockish' ) },
									] }
									left="110px"
									help={ __( 'It will not applied in the sidebar menu', 'blockish' ) }
								/>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={ __( 'Align Items', 'blockish' ) }
									slug="alignItems"
									options={ [
										{ value: 'flex-start', label: __( 'Start', 'blockish' ) },
										{ value: 'center', label: __( 'Center', 'blockish' ) },
										{ value: 'flex-end', label: __( 'End', 'blockish' ) },
										{ value: 'stretch', label: __( 'Stretch', 'blockish' ) },
									] }
									left="80px"
									help={ __( 'It will not applied in the sidebar menu', 'blockish' ) }
								/>
								<BlockishControl
									type="SelectControl"
									label={ __( 'Menu Animation', 'blockish' ) }
									slug="menuAnimation"
									options={ [
										{ value: 'none', label: __( 'None', 'blockish' ) },
										{ value: 'slide', label: __( 'Slide', 'blockish' ) },
										{ value: 'fade', label: __( 'Fade', 'blockish' ) },
									] }
									left="108px"
								/>
								<BlockishControl
									type="ToggleControl"
									label={ __( 'Vertical Menu', 'blockish' ) }
									slug="isVertical"
									help={ __( 'It will make the menu vertical', 'blockish' ) }
								/>
							</BlockishControl>
						) }
						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Nav Items', 'blockish' ) }
									initialOpen={ true }
								>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Gap', 'blockish' ) }
										slug="navGap"
										left="30px"
									/>
									<BlockishControl
										type="BlockishTab"
										tabs={ [
											{ name: 'item-normal', title: 'Normal' },
											{ name: 'item-hover', title: 'Hover' },
										] }
									>
										{ ( { name } ) => (
											<>
												{ name === 'item-normal' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Color', 'blockish' ) }
															slug="itemColorNormal"
														/>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="itemBgNormal"
														/>
													</>
												) }
												{ name === 'item-hover' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Color', 'blockish' ) }
															slug="itemColorHover"
														/>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="itemBgHover"
														/>
													</>
												) }
											</>
										) }
									</BlockishControl>
									<BlockishControl type="BlockishDivider" />
									<BlockishGroupControl
										type="BlockishTypography"
										label={ __( 'Typography', 'blockish' ) }
										slug="itemTypography"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Border Radius', 'blockish' ) }
										slug="itemBorderRadius"
										left="44px"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Padding', 'blockish' ) }
										slug="itemPadding"
										left="52px"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Offcanvas', 'blockish' ) }
									initialOpen={ false }
								>
									<BlockishGroupControl
										type="BlockishBackground"
										label={ __( 'Background', 'blockish' ) }
										slug="offcanvasBg"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Padding', 'blockish' ) }
										slug="offcanvasPadding"
										left="52px"
									/>
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Close Icon Color', 'blockish' ) }
										slug="offcanvasCloseColor"
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
