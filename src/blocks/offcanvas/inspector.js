import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { attributes, advancedControls } ) => {
	const {
		BlockishControl,
		BlockishResponsiveControl,
		BlockishGroupControl,
	} = window?.blockish?.controls;

	const headerType = attributes?.headerType;

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
									title={ __( 'Offcanvas', 'blockish' ) }
									initialOpen={ true }
								>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Sync with Menu', 'blockish' ) }
										slug="syncWithMenu"
										help={ __(
											'Mirror the sibling Nav Menu’s items automatically. Turn off to edit the offcanvas items independently.',
											'blockish'
										) }
									/>
									<BlockishControl type="BlockishDivider" />
									<BlockishControl
										type="BlockishToggleGroup"
										label={ __( 'Open Side', 'blockish' ) }
										slug="offcanvasSide"
										options={ [
											{ value: 'left', label: __( 'Left', 'blockish' ) },
											{ value: 'right', label: __( 'Right', 'blockish' ) },
										] }
										left="60px"
									/>
									<BlockishControl
										type="SelectControl"
										label={ __( 'Animation', 'blockish' ) }
										slug="offcanvasAnimation"
										options={ [
											{ value: 'slide', label: __( 'Slide', 'blockish' ) },
											{ value: 'fade', label: __( 'Fade', 'blockish' ) },
											{ value: 'slideFade', label: __( 'Slide + Fade', 'blockish' ) },
											{ value: 'scale', label: __( 'Scale', 'blockish' ) },
										] }
										left="90px"
										__next40pxDefaultSize
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Header', 'blockish' ) }
									initialOpen={ false }
								>
									<BlockishControl
										type="SelectControl"
										label={ __( 'Header Content', 'blockish' ) }
										slug="headerType"
										options={ [
											{ value: 'none', label: __( 'None', 'blockish' ) },
											{ value: 'siteTitle', label: __( 'Site Title', 'blockish' ) },
											{ value: 'siteLogo', label: __( 'Site Logo', 'blockish' ) },
											{ value: 'customImage', label: __( 'Custom Logo', 'blockish' ) },
											{ value: 'customText', label: __( 'Custom Text', 'blockish' ) },
										] }
										left="108px"
										__next40pxDefaultSize
									/>
									{ headerType === 'customImage' && (
										<BlockishControl
											type="BlockishMediaUploader"
											label={ __( 'Logo', 'blockish' ) }
											slug="headerImage"
										/>
									) }
									{ headerType === 'customText' && (
										<BlockishControl
											type="TextControl"
											label={ __( 'Text', 'blockish' ) }
											slug="headerText"
										/>
									) }
									{ ( headerType === 'customImage' || headerType === 'siteLogo' ) && (
										<BlockishResponsiveControl
											type="BlockishRangeUnit"
											label={ __( 'Logo Width', 'blockish' ) }
											slug="headerLogoWidth"
											left="80px"
										/>
									) }
								</BlockishControl>
							</>
						) }
						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Panel', 'blockish' ) }
									initialOpen={ true }
								>
									<BlockishGroupControl
										type="BlockishBackground"
										label={ __( 'Background', 'blockish' ) }
										slug="panelBg"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Width', 'blockish' ) }
										slug="panelWidth"
										left="50px"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Padding', 'blockish' ) }
										slug="panelPadding"
										left="52px"
									/>
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Overlay Color', 'blockish' ) }
										slug="overlayBg"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Header', 'blockish' ) }
									initialOpen={ false }
								>
									<BlockishGroupControl
										type="BlockishBackground"
										label={ __( 'Background', 'blockish' ) }
										slug="headerBg"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Padding', 'blockish' ) }
										slug="headerPadding"
										left="52px"
									/>
									<BlockishGroupControl
										type="BlockishBorder"
										label={ __( 'Border', 'blockish' ) }
										slug="headerBorder"
									/>
									<BlockishControl type="BlockishDivider" />
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Title Color', 'blockish' ) }
										slug="headerTitleColor"
									/>
									<BlockishGroupControl
										type="BlockishTypography"
										label={ __( 'Title Typography', 'blockish' ) }
										slug="headerTitleTypography"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Close Button', 'blockish' ) }
									initialOpen={ false }
								>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Button Size', 'blockish' ) }
										slug="closeSize"
										left="80px"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Icon Size', 'blockish' ) }
										slug="closeIconSize"
										left="60px"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Border Radius', 'blockish' ) }
										slug="closeBorderRadius"
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
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Icon Color', 'blockish' ) }
															slug="closeIconColor"
														/>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="closeBgNormal"
														/>
													</>
												) }
												{ name === 'close-hover' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Icon Color', 'blockish' ) }
															slug="closeIconColorHover"
														/>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="closeBgHover"
														/>
													</>
												) }
											</>
										) }
									</BlockishControl>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Hamburger', 'blockish' ) }
									initialOpen={ false }
								>
									<BlockishControl
										type="BlockishIconPicker"
										label={ __( 'Icon', 'blockish' ) }
										slug="hamburgerIcon"
										help={ __( 'Leave empty for the default bars icon.', 'blockish' ) }
									/>
									<BlockishControl
										type="BlockishToggleGroup"
										label={ __( 'Alignment', 'blockish' ) }
										slug="hamburgerAlign"
										options={ [
											{ value: 'left', label: __( 'Left', 'blockish' ) },
											{ value: 'center', label: __( 'Center', 'blockish' ) },
											{ value: 'right', label: __( 'Right', 'blockish' ) },
										] }
										left="60px"
									/>
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Color', 'blockish' ) }
										slug="hamburgerColor"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Size', 'blockish' ) }
										slug="hamburgerSize"
										left="40px"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Menu Items', 'blockish' ) }
									initialOpen={ false }
								>
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
													<BlockishControl
														type="BlockishColor"
														label={ __( 'Color', 'blockish' ) }
														slug="itemColorNormal"
													/>
												) }
												{ name === 'item-hover' && (
													<BlockishControl
														type="BlockishColor"
														label={ __( 'Color', 'blockish' ) }
														slug="itemColorHover"
													/>
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
										type="BlockishSpacingSizes"
										label={ __( 'Padding', 'blockish' ) }
										slug="itemPadding"
										left="52px"
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
