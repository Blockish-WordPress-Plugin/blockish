import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { advancedControls } ) => {
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
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Menu', 'blockish' ) }
								initialOpen={ true }
							>
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
							</BlockishControl>
						) }
						{ tabName === 'style' && (
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
						) }
						{ tabName === 'advanced' && advancedControls }
					</>
				) }
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo( Inspector );
