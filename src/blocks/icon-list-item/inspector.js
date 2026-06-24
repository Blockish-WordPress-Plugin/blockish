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
								title={ __( 'Item', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishControl
									type="TextControl"
									label={ __( 'Text', 'blockish' ) }
									slug="text"
									__next40pxDefaultSize
								/>
								<BlockishControl
									type="BlockishIconPicker"
									label={ __( 'Icon', 'blockish' ) }
									slug="icon"
								/>
								<BlockishControl
									type="BlockishLink"
									label={ __( 'Link', 'blockish' ) }
									slug="link"
								/>
							</BlockishControl>
						) }

						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Icon', 'blockish' ) }
									initialOpen={ true }
								>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Size', 'blockish' ) }
										slug="iconSize"
										left="28px"
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
														slug="iconColor"
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
															slug="iconHoverColor"
														/>
														<BlockishControl
															type="BlockishRangeControl"
															label={ __(
																'Transition(Sec)',
																'blockish'
															) }
															slug="iconHoverTransition"
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
								>
									<BlockishGroupControl
										type="BlockishTypography"
										label={ __( 'Typography', 'blockish' ) }
										slug="textTypography"
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
														slug="textColor"
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
															slug="textHoverColor"
														/>
														<BlockishControl
															type="BlockishRangeControl"
															label={ __(
																'Transition(Sec)',
																'blockish'
															) }
															slug="textHoverTransition"
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
