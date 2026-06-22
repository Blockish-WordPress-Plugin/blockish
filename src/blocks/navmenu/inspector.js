import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { attributes, advancedControls } ) => {
	const {
		BlockishControl,
		BlockishResponsiveControl,
		BlockishGroupControl,
	} = window?.blockish?.controls;

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
							<>
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
											{ value: 'custom', label: __( 'Custom', 'blockish' ) },
										] }
										left="60px"
									/>
									{ attributes?.menuBreakpoint === 'custom' && (
										<BlockishControl
											type="RangeControl"
											label={ __( 'Custom Breakpoint (Max Width, px)', 'blockish' ) }
											slug="menuCustomBreakpoint"
											min={ 400 }
											max={ 2000 }
											__nextHasNoMarginBottom={ true }
										/>
									) }
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Scroll Lock For Offcanvas', 'blockish' ) }
										slug="scrollLockOffcanvas"
										help={ __( 'It will lock the scrolling of the offcanvas when you are in the frontend', 'blockish' ) }
									/>
									<BlockishResponsiveControl
										type="BlockishSelect"
										label={ __( 'Justify Content', 'blockish' ) }
										slug="justifyContent"
										options={ [
											{ value: 'flex-start', label: __( 'Start', 'blockish' ) },
											{ value: 'center', label: __( 'Center', 'blockish' ) },
											{ value: 'flex-end', label: __( 'End', 'blockish' ) },
											{ value: 'space-between', label: __( 'Space Between', 'blockish' ) },
											{ value: 'space-around', label: __( 'Space Around', 'blockish' ) },
											{ value: 'space-evenly', label: __( 'Space Evenly', 'blockish' ) },
										] }
										__nextHasNoMarginBottom={ true }
										left="110px"
										help={ __( 'It will not applied in the sidebar menu', 'blockish' ) }
									/>
									<BlockishResponsiveControl
										type="BlockishSelect"
										label={ __( 'Align Items', 'blockish' ) }
										slug="alignItems"
										options={ [
											{ value: 'flex-start', label: __( 'Start', 'blockish' ) },
											{ value: 'center', label: __( 'Center', 'blockish' ) },
											{ value: 'flex-end', label: __( 'End', 'blockish' ) },
											{ value: 'stretch', label: __( 'Stretch', 'blockish' ) },
										] }
										__nextHasNoMarginBottom={ true }
										left="80px"
										help={ __( 'It will not applied in the sidebar menu', 'blockish' ) }
									/>
									<BlockishControl
										type="SelectControl"
										label={ __( 'Menu Animation', 'blockish' ) }
										slug="menuAnimation"
										options={ [
											{ value: 'none', label: __( 'None', 'blockish' ) },
											{ value: 'fadeInUp', label: __( 'Fade In Up', 'blockish' ) },
											{ value: 'transform', label: __( 'Transform', 'blockish' ) },
											{ value: 'transformPerspective', label: __( 'Transform Perspective', 'blockish' ) },
											{ value: 'rotateY', label: __( 'Rotate Y', 'blockish' ) },
										] }
										help={ __( 'Animates how dropdown submenus open.', 'blockish' ) }
										left="108px"
										__next40pxDefaultSize
									/>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Vertical Menu', 'blockish' ) }
										slug="isVertical"
										help={ __( 'It will make the menu vertical', 'blockish' ) }
									/>
									<BlockishControl
										type="BlockishToggleGroup"
										label={ __( 'Hamburger Icon Position', 'blockish' ) }
										slug="hamburgerIconPosition"
										options={ [
											{ value: 'left', label: __( 'Left', 'blockish' ) },
											{ value: 'center', label: __( 'Center', 'blockish' ) },
											{ value: 'right', label: __( 'Right', 'blockish' ) },
										] }
										left="60px"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Mobile Menu Logo', 'blockish' ) }
									initialOpen={ false }
								>
									<BlockishControl
										type="BlockishMediaUploader"
										label={ __( 'Logo', 'blockish' ) }
										slug="mobileLogo"
									/>
									<BlockishControl
										type="BlockishToggleGroup"
										label={ __( 'Logo Link', 'blockish' ) }
										slug="mobileLogoLinkType"
										options={ [
											{ value: 'home', label: __( 'Home', 'blockish' ) },
											{ value: 'custom', label: __( 'Custom', 'blockish' ) },
										] }
										left="60px"
									/>
									{ attributes?.mobileLogoLinkType === 'custom' && (
										<BlockishControl
											type="BlockishLink"
											label={ __( 'Custom Link', 'blockish' ) }
											slug="mobileLogoCustomLink"
										/>
									) }
								</BlockishControl>
							</>
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
											{ name: 'item-active', title: 'Active' },
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
												{ name === 'item-active' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Color', 'blockish' ) }
															slug="itemColorActive"
														/>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="itemBgActive"
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
									title={ __( 'Menu Wrapper', 'blockish' ) }
									initialOpen={ false }
								>
									<BlockishGroupControl
										type="BlockishBackground"
										label={ __( 'Background', 'blockish' ) }
										slug="navWrapperBg"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Padding', 'blockish' ) }
										slug="navWrapperPadding"
										left="52px"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Border Radius', 'blockish' ) }
										slug="navWrapperBorderRadius"
										left="44px"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Hamburger Style', 'blockish' ) }
									initialOpen={ false }
								>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Icon Size', 'blockish' ) }
										slug="hamburgerIconSize"
										left="60px"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Button Width', 'blockish' ) }
										slug="hamburgerBtnWidth"
										left="80px"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Button Height', 'blockish' ) }
										slug="hamburgerBtnHeight"
										left="85px"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Border Radius', 'blockish' ) }
										slug="hamburgerBtnBorderRadius"
										left="44px"
									/>
									<BlockishControl
										type="BlockishTab"
										tabs={ [
											{ name: 'hamburger-normal', title: 'Normal' },
											{ name: 'hamburger-hover', title: 'Hover' },
										] }
									>
										{ ( { name } ) => (
											<>
												{ name === 'hamburger-normal' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="hamburgerBtnBgNormal"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Icon Color', 'blockish' ) }
															slug="hamburgerIconColorNormal"
														/>
														<BlockishGroupControl
															type="BlockishBorder"
															label={ __( 'Border', 'blockish' ) }
															slug="hamburgerBtnBorderNormal"
														/>
													</>
												) }
												{ name === 'hamburger-hover' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="hamburgerBtnBgHover"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Icon Color', 'blockish' ) }
															slug="hamburgerIconColorHover"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Border Color', 'blockish' ) }
															slug="hamburgerBtnBorderColorHover"
														/>
													</>
												) }
											</>
										) }
									</BlockishControl>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Close Button Style', 'blockish' ) }
									initialOpen={ false }
								>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Icon Size', 'blockish' ) }
										slug="closeBtnIconSize"
										left="60px"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Margin', 'blockish' ) }
										slug="closeBtnMargin"
										left="52px"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Width', 'blockish' ) }
										slug="closeBtnWidth"
										left="50px"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Height', 'blockish' ) }
										slug="closeBtnHeight"
										left="55px"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Border Radius', 'blockish' ) }
										slug="closeBtnBorderRadius"
										left="44px"
									/>
									<BlockishControl
										type="BlockishTab"
										tabs={ [
											{ name: 'close-normal', title: 'Normal' },
											{ name: 'close-hover', title: 'Hover' },
										] }
									>
										{ ( { name } ) => (
											<>
												{ name === 'close-normal' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="closeBtnBgNormal"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Icon Color', 'blockish' ) }
															slug="closeIconColorNormal"
														/>
														<BlockishGroupControl
															type="BlockishBorder"
															label={ __( 'Border', 'blockish' ) }
															slug="closeBtnBorderNormal"
														/>
													</>
												) }
												{ name === 'close-hover' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="closeBtnBgHover"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Icon Color', 'blockish' ) }
															slug="closeIconColorHover"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Border Color', 'blockish' ) }
															slug="closeBtnBorderColorHover"
														/>
													</>
												) }
											</>
										) }
									</BlockishControl>
								</BlockishControl>
								{ attributes?.mobileLogo?.url && (
									<BlockishControl
										type="BlockishPanelBody"
										title={ __( 'Mobile Menu Logo', 'blockish' ) }
										initialOpen={ false }
									>
										<BlockishResponsiveControl
											type="BlockishRangeUnit"
											label={ __( 'Width', 'blockish' ) }
											slug="mobileLogoWidth"
											left="50px"
										/>
										<BlockishResponsiveControl
											type="BlockishRangeUnit"
											label={ __( 'Height', 'blockish' ) }
											slug="mobileLogoHeight"
											left="55px"
										/>
										<BlockishResponsiveControl
											type="BlockishSpacingSizes"
											label={ __( 'Padding', 'blockish' ) }
											slug="mobileLogoPadding"
											left="52px"
										/>
										<BlockishResponsiveControl
											type="BlockishSpacingSizes"
											label={ __( 'Margin', 'blockish' ) }
											slug="mobileLogoMargin"
											left="55px"
										/>
									</BlockishControl>
								) }
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
