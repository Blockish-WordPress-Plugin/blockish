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
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Icon List', 'blockish' ) }
								initialOpen={ true }
							indicatorSlugs={['layout']}>
								<BlockishControl
									type="BlockishToggleGroup"
									label={ __( 'Layout', 'blockish' ) }
									slug="layout"
									options={ [
										{
											label: __( 'Vertical', 'blockish' ),
											value: 'column',
										},
										{
											label: __(
												'Horizontal',
												'blockish'
											),
											value: 'row',
										},
									] }
								/>
							</BlockishControl>
						) }

						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'List', 'blockish' ) }
									initialOpen={ true }
								indicatorSlugs={['rowGap', 'columnGap', 'itemPadding', 'itemContentSpacing']}>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Row Gap', 'blockish' ) }
										slug="rowGap"
										left="7ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Column Gap', 'blockish' ) }
										slug="columnGap"
										left="9ch"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __(
											'Item Padding',
											'blockish'
										) }
										slug="itemPadding"
										left="10ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __(
											'Icon/Text Spacing',
											'blockish'
										) }
										slug="itemContentSpacing"
										left="14ch"
									/>
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Icon', 'blockish' ) }
									initialOpen={ false }
								indicatorSlugs={['itemIconSize', 'itemIconColor', 'itemIconHoverColor', 'itemIconHoverTransition']}>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Size', 'blockish' ) }
										slug="itemIconSize"
										left="3ch"
									/>
									<BlockishControl
										type="BlockishTab"
										tabType="normal"
										tabs={ [
											{
												name: 'icon-normal',
												title: 'Normal',
											},
											{
												name: 'icon-hover',
												title: 'Hover',
											},
										] }
									>
										{ ( { name } ) => (
											<>
												{ name === 'icon-normal' && (
													<BlockishControl
														type="BlockishColor"
														label={ __(
															'Color',
															'blockish'
														) }
														slug="itemIconColor"
													/>
												) }
												{ name === 'icon-hover' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={ __(
																'Color',
																'blockish'
															) }
															slug="itemIconHoverColor"
														/>
														<BlockishControl
															type="BlockishRangeControl"
															label={ __(
																'Transition(Sec)',
																'blockish'
															) }
															slug="itemIconHoverTransition"
															min={ 0 }
															max={ 10 }
															step={ 0.1 }
														/>
													</>
												) }
											</>
										) }
									</BlockishControl>
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Text', 'blockish' ) }
									initialOpen={ false }
								indicatorSlugs={['itemTextTypography', 'itemTextColor', 'itemTextHoverColor', 'itemTextHoverTransition']}>
									<BlockishGroupControl
										type="BlockishTypography"
										label={ __( 'Typography', 'blockish' ) }
										slug="itemTextTypography"
									/>
									<BlockishControl
										type="BlockishTab"
										tabType="normal"
										tabs={ [
											{
												name: 'text-normal',
												title: 'Normal',
											},
											{
												name: 'text-hover',
												title: 'Hover',
											},
										] }
									>
										{ ( { name } ) => (
											<>
												{ name === 'text-normal' && (
													<BlockishControl
														type="BlockishColor"
														label={ __(
															'Color',
															'blockish'
														) }
														slug="itemTextColor"
													/>
												) }
												{ name === 'text-hover' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={ __(
																'Color',
																'blockish'
															) }
															slug="itemTextHoverColor"
														/>
														<BlockishControl
															type="BlockishRangeControl"
															label={ __(
																'Transition(Sec)',
																'blockish'
															) }
															slug="itemTextHoverTransition"
															min={ 0 }
															max={ 10 }
															step={ 0.1 }
														/>
													</>
												) }
											</>
										) }
									</BlockishControl>
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
