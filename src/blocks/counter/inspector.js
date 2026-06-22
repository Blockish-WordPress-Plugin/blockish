import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ({ attributes, advancedControls }) => {
	const { BlockishControl, BlockishResponsiveControl, BlockishGroupControl } =
		window?.blockish?.controls;

	const isTitleSidePosition =
		attributes?.titlePosition === 'start' ||
		attributes?.titlePosition === 'end';

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={[
					{
						name: 'content',
						title: 'Content',
					},
					{
						name: 'style',
						title: 'Style',
					},
					{
						name: 'advanced',
						title: 'Advanced',
					},
				]}
			>
				{({ name: tabName }) => (
					<>
						{tabName === 'content' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={__('Counter', 'blockish')}
								initialOpen={true}
							>
								<BlockishControl
									type="BlockishNumber"
									label={__('Starting Number', 'blockish')}
									slug="startNumber"
								/>
								<BlockishControl
									type="BlockishNumber"
									label={__('Ending Number', 'blockish')}
									slug="endNumber"
								/>
								<BlockishControl
									type="TextControl"
									label={__('Number Prefix', 'blockish')}
									slug="numberPrefix"
									__next40pxDefaultSize
								/>
								<BlockishControl
									type="TextControl"
									label={__('Number Suffix', 'blockish')}
									slug="numberSuffix"
									__next40pxDefaultSize
								/>
								<BlockishControl
									type="BlockishRangeControl"
									label={__('Animation Duration(Sec)', 'blockish')}
									slug="animationDuration"
									min={0}
									max={30}
									step={0.1}
								/>
								<BlockishControl
									type="ToggleControl"
									label={__('Thousand Separator', 'blockish')}
									slug="thousandSeparator"
								/>
								{
									attributes?.thousandSeparator && (
										<BlockishControl
											type="BlockishSelect"
											label={__('Separator', 'blockish')}
											slug="separator"
											options={[
												{
													value: 'default',
													label: __('Default (,)', 'blockish'),
												},
												{
													value: 'dot',
													label: __('Dot (.)', 'blockish'),
												},
												{
													value: 'space',
													label: __('Space', 'blockish'),
												},
												{
													value: 'underscore',
													label: __('Underscore (_)', 'blockish'),
												},
												{
													value: 'apostrophe',
													label: __("Apostrophe (')", 'blockish'),
												},
											]}
										/>
									)
								}
								<BlockishControl
									type="BlockishDivider"
								/>
								<BlockishControl
									type="TextControl"
									label={__('Title', 'blockish')}
									slug="title"
									__next40pxDefaultSize
								/>
								<BlockishControl
									type="BlockishSelect"
									label={__('Title HTML Tag', 'blockish')}
									slug="titleTag"
									options={[
										{ value: 'h1', label: __('H1', 'blockish') },
										{ value: 'h2', label: __('H2', 'blockish') },
										{ value: 'h3', label: __('H3', 'blockish') },
										{ value: 'h4', label: __('H4', 'blockish') },
										{ value: 'h5', label: __('H5', 'blockish') },
										{ value: 'h6', label: __('H6', 'blockish') },
										{ value: 'p', label: __('P', 'blockish') },
										{
											value: 'span',
											label: __('Span', 'blockish'),
										},
										{
											value: 'div',
											label: __('Div', 'blockish'),
										},
									]}
								/>
							</BlockishControl>
						)}

						{tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={__('Counter', 'blockish')}
									initialOpen={true}
								>
									<BlockishControl
										type="BlockishToggleGroup"
										label={__('Title Position', 'blockish')}
										slug="titlePosition"
										options={[
											{
												value: 'before',
												label: __('Before', 'blockish'),
											},
											{
												value: 'after',
												label: __('After', 'blockish'),
											},
											{
												value: 'start',
												label: __('Start', 'blockish'),
											},
											{
												value: 'end',
												label: __('End', 'blockish'),
											},
										]}
									/>
									<BlockishResponsiveControl
										type="BlockishToggleGroup"
										label={__(
											'Title Horizontal Alignment',
											'blockish'
										)}
										slug="titleHorizontalAlignment"
										left="21ch"
										options={[
											{
												value: 'flex-start',
												label: __('Start', 'blockish'),
											},
											{
												value: 'center',
												label: __('Center', 'blockish'),
											},
											{
												value: 'flex-end',
												label: __('End', 'blockish'),
											},
										]}
									/>
									{isTitleSidePosition && (
										<BlockishResponsiveControl
											type="BlockishToggleGroup"
											label={__(
												'Title Vertical Alignment',
												'blockish'
											)}
											slug="titleVerticalAlignment"
											left="19ch"
											options={[
												{
													value: 'flex-start',
													label: __('Start', 'blockish'),
												},
												{
													value: 'center',
													label: __('Center', 'blockish'),
												},
												{
													value: 'flex-end',
													label: __('End', 'blockish'),
												},
											]}
										/>
									)}
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={__('Title Gap', 'blockish')}
										slug="titleGap"
										left="7ch"
									/>
									<BlockishResponsiveControl
										type="BlockishToggleGroup"
										label={__('Number Position', 'blockish')}
										slug="numberPosition"
										left="13ch"
										options={[
											{
												value: 'flex-start',
												label: __('Start', 'blockish'),
											},
											{
												value: 'center',
												label: __('Center', 'blockish'),
											},
											{
												value: 'flex-end',
												label: __('End', 'blockish'),
											},
											{
												value: 'stretch',
												label: __('Stretch', 'blockish'),
											},
										]}
									/>
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={__('Number', 'blockish')}
									initialOpen={false}
								>
									<BlockishControl
										type="BlockishColor"
										label={__('Text Color', 'blockish')}
										slug="numberTextColor"
									/>
									<BlockishGroupControl
										type="BlockishTypography"
										label={__('Typography', 'blockish')}
										slug="numberTypography"
									/>
									<BlockishGroupControl
										type="BlockishTextStroke"
										label={__('Text Stroke', 'blockish')}
										slug="numberTextStroke"
									/>
									<BlockishGroupControl
										type="BlockishBoxShadow"
										label={__('Text Shadow', 'blockish')}
										slug="numberTextShadow"
										exclude={['inset', 'spread']}
									/>
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={__('Title', 'blockish')}
									initialOpen={false}
								>
									<BlockishControl
										type="BlockishColor"
										label={__('Text Color', 'blockish')}
										slug="titleTextColor"
									/>
									<BlockishGroupControl
										type="BlockishTypography"
										label={__('Typography', 'blockish')}
										slug="titleTypography"
									/>
									<BlockishGroupControl
										type="BlockishTextStroke"
										label={__('Text Stroke', 'blockish')}
										slug="titleTextStroke"
									/>
									<BlockishGroupControl
										type="BlockishBoxShadow"
										label={__('Text Shadow', 'blockish')}
										slug="titleTextShadow"
										exclude={['inset', 'spread']}
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
