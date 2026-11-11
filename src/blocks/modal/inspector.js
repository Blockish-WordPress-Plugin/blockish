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
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Trigger', 'blockish' ) }
									initialOpen={ true }
									indicatorSlugs={ [ 'showTrigger', 'triggerText', 'triggerIcon', 'triggerIconPosition', 'triggerAlign', 'triggerSelector' ] }
								>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Show trigger button', 'blockish' ) }
										slug="showTrigger"
									/>
									{ attributes?.showTrigger && (
										<>
											<BlockishControl
												type="TextControl"
												label={ __( 'Button text', 'blockish' ) }
												slug="triggerText"
											/>
											<BlockishControl
												type="BlockishIconPicker"
												label={ __( 'Icon', 'blockish' ) }
												slug="triggerIcon"
											/>
											<BlockishControl
												type="BlockishToggleGroup"
												label={ __( 'Icon position', 'blockish' ) }
												slug="triggerIconPosition"
												options={ [
													{ value: 'left', label: __( 'Left', 'blockish' ) },
													{ value: 'right', label: __( 'Right', 'blockish' ) },
												] }
												isDeselectable={ false }
											/>
											<BlockishControl
												type="BlockishToggleGroup"
												label={ __( 'Alignment', 'blockish' ) }
												slug="triggerAlign"
												options={ [
													{ value: 'left', label: __( 'Left', 'blockish' ) },
													{ value: 'center', label: __( 'Center', 'blockish' ) },
													{ value: 'right', label: __( 'Right', 'blockish' ) },
													{ value: 'full', label: __( 'Full', 'blockish' ) },
												] }
												isDeselectable={ false }
											/>
										</>
									) }
									<BlockishControl
										type="TextControl"
										label={ __( 'External trigger selector', 'blockish' ) }
										help={ __( 'Optional CSS selector (e.g. .open-signup or #hero-cta) so any element on the page opens this modal.', 'blockish' ) }
										slug="triggerSelector"
									/>
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Dialog & Behavior', 'blockish' ) }
									initialOpen={ true }
									indicatorSlugs={ [ 'showHeader', 'modalTitle', 'showCloseButton', 'modalPosition', 'modalAnimation', 'closeOnOverlay', 'closeOnEsc', 'lockScroll' ] }
								>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Show header', 'blockish' ) }
										slug="showHeader"
									/>
									{ attributes?.showHeader && (
										<BlockishControl
											type="TextControl"
											label={ __( 'Modal title', 'blockish' ) }
											slug="modalTitle"
										/>
									) }
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Show close button', 'blockish' ) }
										slug="showCloseButton"
									/>
									<BlockishControl
										type="BlockishToggleGroup"
										label={ __( 'Position', 'blockish' ) }
										slug="modalPosition"
										options={ [
											{ value: 'center', label: __( 'Center', 'blockish' ) },
											{ value: 'top', label: __( 'Top', 'blockish' ) },
											{ value: 'bottom', label: __( 'Bottom', 'blockish' ) },
										] }
										isDeselectable={ false }
									/>
									<BlockishControl
										type="SelectControl"
										label={ __( 'Animation', 'blockish' ) }
										slug="modalAnimation"
										options={ [
											{ value: 'scale', label: __( 'Scale', 'blockish' ) },
											{ value: 'fade', label: __( 'Fade', 'blockish' ) },
											{ value: 'slideUp', label: __( 'Slide Up', 'blockish' ) },
											{ value: 'slideDown', label: __( 'Slide Down', 'blockish' ) },
										] }
										__next40pxDefaultSize
									/>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Close on backdrop click', 'blockish' ) }
										slug="closeOnOverlay"
									/>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Close on Escape key', 'blockish' ) }
										slug="closeOnEsc"
									/>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Lock background scroll', 'blockish' ) }
										slug="lockScroll"
									/>
								</BlockishControl>
							</>
						) }

						{ tabName === 'style' && (
							<>
								{ attributes?.showTrigger && (
									<BlockishControl
										type="BlockishPanelBody"
										title={ __( 'Trigger Button', 'blockish' ) }
										initialOpen={ true }
										indicatorSlugs={ [ 'triggerTypography', 'triggerColor', 'triggerColorHover', 'triggerBackground', 'triggerBackgroundHover', 'triggerBorder', 'triggerBorderRadius', 'triggerPadding', 'triggerGap' ] }
									>
										<BlockishGroupControl
											type="BlockishTypography"
											label={ __( 'Typography', 'blockish' ) }
											slug="triggerTypography"
										/>
										<BlockishControl
											type="BlockishColor"
											label={ __( 'Text color', 'blockish' ) }
											slug="triggerColor"
										/>
										<BlockishControl
											type="BlockishColor"
											label={ __( 'Hover text color', 'blockish' ) }
											slug="triggerColorHover"
										/>
										<BlockishGroupControl
											type="BlockishBackground"
											label={ __( 'Background', 'blockish' ) }
											slug="triggerBackground"
										/>
										<BlockishGroupControl
											type="BlockishBackground"
											label={ __( 'Hover background', 'blockish' ) }
											slug="triggerBackgroundHover"
										/>
										<BlockishGroupControl
											type="BlockishBorder"
											label={ __( 'Border', 'blockish' ) }
											slug="triggerBorder"
										/>
										<BlockishResponsiveControl
											type="BlockishBorderRadius"
											label={ __( 'Border radius', 'blockish' ) }
											slug="triggerBorderRadius"
										/>
										<BlockishResponsiveControl
											type="BlockishSpacingSizes"
											label={ __( 'Padding', 'blockish' ) }
											slug="triggerPadding"
										/>
										<BlockishResponsiveControl
											type="BlockishRangeUnit"
											label={ __( 'Icon gap', 'blockish' ) }
											slug="triggerGap"
										/>
									</BlockishControl>
								) }

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Modal Dialog', 'blockish' ) }
									initialOpen={ ! attributes?.showTrigger }
									indicatorSlugs={ [ 'modalWidth', 'modalMaxHeight', 'modalBackground', 'modalBorder', 'modalBorderRadius', 'modalBoxShadow', 'modalPadding', 'overlayColor' ] }
								>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Width', 'blockish' ) }
										slug="modalWidth"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Max height', 'blockish' ) }
										slug="modalMaxHeight"
									/>
									<BlockishGroupControl
										type="BlockishBackground"
										label={ __( 'Background', 'blockish' ) }
										slug="modalBackground"
									/>
									<BlockishGroupControl
										type="BlockishBorder"
										label={ __( 'Border', 'blockish' ) }
										slug="modalBorder"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Border radius', 'blockish' ) }
										slug="modalBorderRadius"
									/>
									<BlockishGroupControl
										type="BlockishBoxShadow"
										label={ __( 'Shadow', 'blockish' ) }
										slug="modalBoxShadow"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Body padding', 'blockish' ) }
										slug="modalPadding"
									/>
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Backdrop overlay', 'blockish' ) }
										slug="overlayColor"
									/>
								</BlockishControl>

								{ ( attributes?.showHeader || attributes?.showCloseButton ) && (
									<BlockishControl
										type="BlockishPanelBody"
										title={ __( 'Header & Close Button', 'blockish' ) }
										initialOpen={ false }
										indicatorSlugs={ [ 'headerTitleColor', 'headerTitleTypography', 'headerPadding', 'headerBorder', 'closeColor', 'closeColorHover', 'closeBackground', 'closeBackgroundHover', 'closeSize' ] }
									>
										{ attributes?.showHeader && (
											<>
												<BlockishControl
													type="BlockishColor"
													label={ __( 'Title color', 'blockish' ) }
													slug="headerTitleColor"
												/>
												<BlockishGroupControl
													type="BlockishTypography"
													label={ __( 'Title typography', 'blockish' ) }
													slug="headerTitleTypography"
												/>
												<BlockishResponsiveControl
													type="BlockishSpacingSizes"
													label={ __( 'Header padding', 'blockish' ) }
													slug="headerPadding"
												/>
												<BlockishGroupControl
													type="BlockishBorder"
													label={ __( 'Header border', 'blockish' ) }
													slug="headerBorder"
												/>
											</>
										) }
										{ attributes?.showCloseButton && (
											<>
												<BlockishControl
													type="BlockishColor"
													label={ __( 'Close icon color', 'blockish' ) }
													slug="closeColor"
												/>
												<BlockishControl
													type="BlockishColor"
													label={ __( 'Close icon hover', 'blockish' ) }
													slug="closeColorHover"
												/>
												<BlockishGroupControl
													type="BlockishBackground"
													label={ __( 'Close background', 'blockish' ) }
													slug="closeBackground"
												/>
												<BlockishGroupControl
													type="BlockishBackground"
													label={ __( 'Close hover background', 'blockish' ) }
													slug="closeBackgroundHover"
												/>
												<BlockishResponsiveControl
													type="BlockishRangeUnit"
													label={ __( 'Close button size', 'blockish' ) }
													slug="closeSize"
												/>
											</>
										) }
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

