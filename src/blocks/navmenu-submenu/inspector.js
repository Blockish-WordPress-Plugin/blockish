import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { advancedControls } ) => {
	const { BlockishControl, BlockishGroupControl, BlockishResponsiveControl } =
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
								title={ __( 'Submenu', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishResponsiveControl
									type="BlockishSelect"
									label={ __( 'Alignment', 'blockish' ) }
									slug="alignment"
									options={ [
										{ value: 'flex-start', label: __( 'Start', 'blockish' ) },
										{ value: 'center', label: __( 'Center', 'blockish' ) },
										{ value: 'flex-end', label: __( 'End', 'blockish' ) },
										{ value: 'space-between', label: __( 'Space Between', 'blockish' ) },
									] }
									__nextHasNoMarginBottom={ true }
									help={ __( 'Justifies the label and submenu indicator within each item.', 'blockish' ) }
								/>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Width', 'blockish' ) }
									slug="containerWidth"
									left="44px"
								/>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Item Gap', 'blockish' ) }
									slug="itemGap"
									left="60px"
								/>
							</BlockishControl>
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
									<BlockishGroupControl
										type="BlockishBorder"
										label={ __( 'Border', 'blockish' ) }
										slug="panelBorder"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Border Radius', 'blockish' ) }
										slug="panelBorderRadius"
										left="44px"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Padding', 'blockish' ) }
										slug="panelPadding"
										left="52px"
									/>
									<BlockishGroupControl
										type="BlockishBoxShadow"
										label={ __( 'Box Shadow', 'blockish' ) }
										slug="panelBoxShadow"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Submenu Item', 'blockish' ) }
									initialOpen={ false }
								>
									<BlockishGroupControl
										type="BlockishTypography"
										label={ __( 'Typography', 'blockish' ) }
										slug="subItemTypography"
									/>
									<BlockishControl
										type="BlockishTab"
										tabs={ [
											{ name: 'sub-item-normal', title: 'Normal' },
											{ name: 'sub-item-hover', title: 'Hover' },
											{ name: 'sub-item-active', title: 'Active' },
										] }
									>
										{ ( { name } ) => (
											<>
												{ name === 'sub-item-normal' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="subItemBgNormal"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Text Color', 'blockish' ) }
															slug="subItemColorNormal"
														/>
														<BlockishGroupControl
															type="BlockishBorder"
															label={ __( 'Border', 'blockish' ) }
															slug="subItemBorderNormal"
														/>
													</>
												) }
												{ name === 'sub-item-hover' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="subItemBgHover"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Text Color', 'blockish' ) }
															slug="subItemColorHover"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Border Color', 'blockish' ) }
															slug="subItemBorderColorHover"
														/>
													</>
												) }
												{ name === 'sub-item-active' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __( 'Background', 'blockish' ) }
															slug="subItemBgActive"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Text Color', 'blockish' ) }
															slug="subItemColorActive"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __( 'Border Color', 'blockish' ) }
															slug="subItemBorderColorActive"
														/>
													</>
												) }
											</>
										) }
									</BlockishControl>
									<BlockishControl type="BlockishDivider" />
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Padding', 'blockish' ) }
										slug="subItemPadding"
										left="52px"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Border Radius', 'blockish' ) }
										slug="subItemBorderRadius"
										left="44px"
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
