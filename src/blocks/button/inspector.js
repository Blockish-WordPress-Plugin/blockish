import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ({ attributes, advancedControls }) => {
	const {
		BlockishControl,
		BlockishResponsiveControl,
		BlockishGroupControl
	} = window?.blockish?.controls;

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={[
					{
						name: 'content',
						title: 'Content'
					},
					{
						name: 'style',
						title: 'Style'
					},
					{
						name: 'advanced',
						title: 'Advanced'
					}
				]}
			>
				{({ name: tabName }) => (
					<>
						{
							tabName === 'content' && (
								<>
									<BlockishControl type="BlockishPanelBody" title={__('Button', 'blockish')} initialOpen={true}>
										<BlockishControl
											type="TextControl"
											label={__('Text', 'blockish')}
											slug="text"
										/>
										<BlockishControl
											type="BlockishLink"
											label={__('Link', 'blockish')}
											slug="url"
										/>
										<BlockishControl
											type="BlockishIconPicker"
											label={__('Icon', 'blockish')}
											slug="icon"
										/>
										{
											attributes?.icon && (
												<BlockishControl
													type="BlockishToggleGroup"
													slug="iconPosition"
													label={__('Icon Position', 'blockish')}
													options={[
														{ value: 'row-reverse', label: __('Left', 'blockish') },
														{ value: 'row', label: __('Right', 'blockish') },
													]}
												/>
											)
										}
									</BlockishControl>
								</>
							)
						}
						{
							tabName === 'style' && (
								<>
									<BlockishControl type="BlockishPanelBody" title={__('Button', 'blockish')} initialOpen={true}>
										<BlockishResponsiveControl
											left="5ch"
											type="BlockishRangeUnit"
											label={__('Width', 'blockish')}
											slug="buttonWidth"
										/>
										<BlockishResponsiveControl
											left="8ch"
											type="BlockishRangeUnit"
											label={__('Min Height', 'blockish')}
											slug="buttonMinHeight"
										/>
										{
											attributes?.icon?.path && (
												<BlockishResponsiveControl
													type="BlockishRangeUnit"
													label={__('Icon Size', 'blockish')}
													slug="buttonIconSize"
													left="8ch"
												/>
											)
										}
										<BlockishResponsiveControl
											type="BlockishToggleGroup"
											label={__('Placement', 'blockish')}
											slug="buttonPlacement"
											left="8ch"
											options={[
												{ value: 'flex-start', label: __('Left', 'blockish') },
												{ value: 'center', label: __('Center', 'blockish') },
												{ value: 'flex-end', label: __('Right', 'blockish') }
											]}
										/>
										<BlockishResponsiveControl
											type="BlockishToggleGroup"
											label={__('Alignment', 'blockish')}
											slug="buttonAlignment"
											left="8ch"
											options={[
												{ value: 'start', label: __('Left', 'blockish') },
												{ value: 'center', label: __('Center', 'blockish') },
												{ value: 'end', label: __('Right', 'blockish') },
											]}
										/>

										<BlockishResponsiveControl
											left="13ch"
											type="BlockishRangeUnit"
											label={__('Content Spacing', 'blockish')}
											slug="buttonContentSpacing"
										/>

										<BlockishControl type="BlockishDivider" />

										<BlockishControl
											type="BlockishTypography"
											label={__('Typography', 'blockish')}
											slug="buttonTypography"
										/>

										<BlockishGroupControl
											type="BlockishBoxShadow"
											label={__('Text Shadow', 'blockish')}
											slug="buttonTextShadow"
											exclude={['inset', 'spread']}
										/>

										<BlockishControl
											type="BlockishTab"
											tabs={[
												{
													name: 'button-normal',
													title: 'Normal'
												},
												{
													name: 'button-hover',
													title: 'Hover'
												}
											]}
										>
											{({ name }) => (
												<>
													{
														name === 'button-normal' && (
															<>
																<BlockishControl
																	type="BlockishColor"
																	label={__('Color', 'blockish')}
																	slug="buttonTextColor"
																/>
																<BlockishGroupControl
																	label={__('Background', 'blockish')}
																	type="BlockishBackground"
																	slug="buttonBackground"
																/>
																<BlockishGroupControl
																	type="BlockishBoxShadow"
																	label={__('Box Shadow', 'blockish')}
																	slug="buttonBoxShadow"
																/>
															</>
														)
													}
													{
														name === 'button-hover' && (
															<>
																<BlockishControl
																	type="BlockishColor"
																	label={__('Hover Color', 'blockish')}
																	slug="buttonHoverTextColor"
																/>
																<BlockishGroupControl
																	label={__('Hover Background', 'blockish')}
																	type="BlockishBackground"
																	slug="buttonHoverBackground"
																/>
																<BlockishControl
																	type="BlockishColor"
																	label={__('Border Color', 'blockish')}
																	slug="buttonHoverBorderColor"
																/>
																<BlockishGroupControl
																	type="BlockishBoxShadow"
																	label={__('Hover Box Shadow', 'blockish')}
																	slug="buttonHoverBoxShadow"
																/>
																<BlockishControl
																	type="BlockishRangeControl"
																	label={__('Transition(Sec)', 'blockish')}
																	slug="buttonHoverTransition"
																	min={0}
																	max={10}
																	step={0.1}
																/>
															</>
														)
													}
												</>
											)}
										</BlockishControl>
										<BlockishControl type="BlockishDivider" />
										<BlockishGroupControl
											type="BlockishBorder"
											label={__('Border', 'blockish')}
											slug="buttonBorder"
										/>
										<BlockishResponsiveControl
											type="BlockishBorderRadius"
											label={__('Border Radius', 'blockish')}
											slug="buttonBorderRadius"
											left="44px"
										/>
										<BlockishControl type="BlockishDivider" />
										<BlockishResponsiveControl
											type='BlockishSpacingSizes'
											label={__('Padding', 'blockish')}
											slug='buttonPadding'
											left="52px"
										/>

									</BlockishControl>

								</>
							)
						}
						{
							tabName === 'advanced' && (
								advancedControls
							)
						}
					</>
				)}
			</BlockishControl>
		</InspectorControls>
	)
}
export default memo(Inspector);
