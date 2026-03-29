import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ({ advancedControls }) => {
	const { BlockishControl, BlockishResponsiveControl, BlockishGroupControl } =
		window?.blockish?.controls;

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={[
					{ name: 'content', title: 'Content' },
					{ name: 'style', title: 'Style' },
					{ name: 'advanced', title: 'Advanced' },
				]}
			>
				{({ name: tabName }) => (
					<>
						{tabName === 'content' && (
							<BlockishControl type="BlockishPanelBody" title={__('Tab', 'blockish')} initialOpen={true}>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={__('Direction', 'blockish')}
									slug="direction"
									options={[
										{ value: 'column', label: __('Above', 'blockish') },
										{ value: 'column-reverse', label: __('Below', 'blockish') },
										{ value: 'row', label: __('Before', 'blockish') },
										{ value: 'row-reverse', label: __('After', 'blockish') },
									]}
									left="60px"
								/>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={__('Justify', 'blockish')}
									slug="justify"
									options={[
										{ value: 'flex-start', label: __('Start', 'blockish') },
										{ value: 'center', label: __('Center', 'blockish') },
										{ value: 'flex-end', label: __('End', 'blockish') },
										{ value: 'space-between', label: __('Between', 'blockish') },
									]}
									left="45px"
								/>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={__('Align Title', 'blockish')}
									slug="alignTitle"
									options={[
										{ value: 'left', label: __('Left', 'blockish') },
										{ value: 'center', label: __('Center', 'blockish') },
										{ value: 'right', label: __('Right', 'blockish') },
									]}
									left="68px"
								/>
							</BlockishControl>
						)}
						{tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={__('Tabs', 'blockish')}
									initialOpen={true}
								>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={__('Gap Between Tabs', 'blockish')}
										slug="navGap"
										left="110px"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={__('Distance From Content', 'blockish')}
										slug="distanceFromContent"
										left="147px"
									/>
									<BlockishControl
										type="BlockishTab"
										tabs={[
											{ name: 'tabs-normal', title: 'Normal' },
											{ name: 'tabs-hover', title: 'Hover' },
											{ name: 'tabs-active', title: 'Active' },
										]}
									>
										{({ name }) => (
											<>
												{name === 'tabs-normal' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={__('Background', 'blockish')}
															slug="tabsBackgroundNormal"
														/>
														<BlockishGroupControl
															type="BlockishBorder"
															label={__('Border', 'blockish')}
															slug="tabsBorderNormal"
														/>
														<BlockishGroupControl
															type="BlockishBoxShadow"
															label={__('Box Shadow', 'blockish')}
															slug="tabsBoxShadowNormal"
														/>
													</>
												)}
												{name === 'tabs-hover' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={__('Background', 'blockish')}
															slug="tabsBackgroundHover"
														/>
														<BlockishGroupControl
															type="BlockishBorder"
															label={__('Border', 'blockish')}
															slug="tabsBorderHover"
														/>
														<BlockishGroupControl
															type="BlockishBoxShadow"
															label={__('Box Shadow', 'blockish')}
															slug="tabsBoxShadowHover"
														/>
													</>
												)}
												{name === 'tabs-active' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={__('Background', 'blockish')}
															slug="tabsBackgroundActive"
														/>
														<BlockishGroupControl
															type="BlockishBorder"
															label={__('Border', 'blockish')}
															slug="tabsBorderActive"
														/>
														<BlockishGroupControl
															type="BlockishBoxShadow"
															label={__('Box Shadow', 'blockish')}
															slug="tabsBoxShadowActive"
														/>
													</>
												)}
											</>
										)}
									</BlockishControl>
									<BlockishControl type="BlockishDivider" />
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={__('Border Radius', 'blockish')}
										slug="tabsBorderRadius"
										left="44px"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={__('Padding', 'blockish')}
										slug="tabsPadding"
										left="52px"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={__('Titles', 'blockish')}
									initialOpen={false}
								>
									<BlockishGroupControl
										type="BlockishTypography"
										label={__('Typography', 'blockish')}
										slug="titleTypography"
									/>
									<BlockishControl
										type="BlockishTab"
										tabs={[
											{ name: 'title-normal', title: 'Normal' },
											{ name: 'title-hover', title: 'Hover' },
											{ name: 'title-active', title: 'Active' },
										]}
									>
										{({ name }) => (
											<>
												{name === 'title-normal' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={__('Color', 'blockish')}
															slug="titleColorNormal"
														/>
														<BlockishGroupControl
															type="BlockishBoxShadow"
															label={__('Text Shadow', 'blockish')}
															slug="titleTextShadowNormal"
															exclude={['inset', 'spread']}
														/>
														<BlockishGroupControl
															type="BlockishTextStroke"
															label={__('Text Stroke', 'blockish')}
															slug="titleTextStrokeNormal"
														/>
													</>
												)}
												{name === 'title-hover' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={__('Color', 'blockish')}
															slug="titleColorHover"
														/>
														<BlockishGroupControl
															type="BlockishBoxShadow"
															label={__('Text Shadow', 'blockish')}
															slug="titleTextShadowHover"
															exclude={['inset', 'spread']}
														/>
														<BlockishGroupControl
															type="BlockishTextStroke"
															label={__('Text Stroke', 'blockish')}
															slug="titleTextStrokeHover"
														/>
													</>
												)}
												{name === 'title-active' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={__('Color', 'blockish')}
															slug="titleColorActive"
														/>
														<BlockishGroupControl
															type="BlockishBoxShadow"
															label={__('Text Shadow', 'blockish')}
															slug="titleTextShadowActive"
															exclude={['inset', 'spread']}
														/>
														<BlockishGroupControl
															type="BlockishTextStroke"
															label={__('Text Stroke', 'blockish')}
															slug="titleTextStrokeActive"
														/>
													</>
												)}
											</>
										)}
									</BlockishControl>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={__('Icon', 'blockish')}
									initialOpen={false}
								>
									<BlockishResponsiveControl
										type="BlockishToggleGroup"
										label={__('Position', 'blockish')}
										slug="iconPosition"
										options={[
											{ value: 'row-reverse', label: __('Left', 'blockish') },
											{ value: 'row', label: __('Right', 'blockish') },
										]}
										left="52px"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={__('Size', 'blockish')}
										slug="iconSize"
										left="25px"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={__('Spacing', 'blockish')}
										slug="iconSpacing"
										left="6ch"
									/>
									<BlockishControl
										type="BlockishTab"
										tabs={[
											{ name: 'icon-normal', title: 'Normal' },
											{ name: 'icon-hover', title: 'Hover' },
											{ name: 'icon-active', title: 'Active' },
										]}
									>
										{({ name }) => (
											<>
												{name === 'icon-normal' && (
													<BlockishControl
														type="BlockishColor"
														label={__('Color', 'blockish')}
														slug="iconColorNormal"
													/>
												)}
												{name === 'icon-hover' && (
													<BlockishControl
														type="BlockishColor"
														label={__('Color', 'blockish')}
														slug="iconColorHover"
													/>
												)}
												{name === 'icon-active' && (
													<BlockishControl
														type="BlockishColor"
														label={__('Color', 'blockish')}
														slug="iconColorActive"
													/>
												)}
											</>
										)}
									</BlockishControl>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={__('Content', 'blockish')}
									initialOpen={false}
								>
									<BlockishControl
										type="BlockishColor"
										label={__('Color', 'blockish')}
										slug="contentColor"
									/>
									<BlockishGroupControl
										type="BlockishBackground"
										label={__('Background', 'blockish')}
										slug="contentBackground"
									/>
									<BlockishGroupControl
										type="BlockishBorder"
										label={__('Border', 'blockish')}
										slug="contentBorder"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={__('Border Radius', 'blockish')}
										slug="contentBorderRadius"
										left="44px"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={__('Padding', 'blockish')}
										slug="contentPadding"
										left="52px"
									/>
								</BlockishControl>
							</>
						)}
						{tabName === 'advanced' && advancedControls}
					</>
				)}
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo(Inspector);
