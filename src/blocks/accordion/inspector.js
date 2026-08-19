import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ITEM_POSITION_OPTIONS, ICON_POSITION_OPTIONS } from './shared';

const Inspector = ( { advancedControls } ) => {
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
									title={ __( 'Layout', 'blockish' ) }
									initialOpen={ true }
								indicatorSlugs={['itemPosition', 'iconPosition', 'faqSchema']}>
									<BlockishResponsiveControl
										type="BlockishToggleGroup"
										label={ __(
											'Item Position',
											'blockish'
										) }
										slug="itemPosition"
										options={ ITEM_POSITION_OPTIONS }
										left="11ch"
									/>
									<BlockishResponsiveControl
										type="BlockishToggleGroup"
										label={ __(
											'Icon Position',
											'blockish'
										) }
										slug="iconPosition"
										options={ ICON_POSITION_OPTIONS }
										left="11ch"
									/>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'FAQ Schema', 'blockish' ) }
										slug="faqSchema"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Interactions', 'blockish' ) }
									initialOpen={ true }
								indicatorSlugs={['maxItemExpanded']}>
									<BlockishControl
										type="BlockishToggleGroup"
										label={ __(
											'Max Items Expanded',
											'blockish'
										) }
										slug="maxItemExpanded"
										options={ [
											{ value: 'one', label: 'One' },
											{
												value: 'multiple',
												label: 'Multiple',
											},
										] }
									/>
								</BlockishControl>
							</>
						) }

						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Accordion', 'blockish' ) }
									initialOpen={ true }
								indicatorSlugs={['itemsSpaceBetween', 'distanceBetweenContent', 'accordionBackgroundNormal', 'accordionBorderNormal', 'accordionBackgroundHover', 'accordionBorderHover', 'accordionBackgroundActive', 'accordionBorderActive', 'accordionBorderRadius', 'accordionPadding']}>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __(
											'Space Between Items',
											'blockish'
										) }
										slug="itemsSpaceBetween"
										left="16ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __(
											'Distance Between Content',
											'blockish'
										) }
										slug="distanceBetweenContent"
										left="21ch"
									/>
									<BlockishControl
										type="BlockishTab"
										tabs={ [
											{
												name: 'accordion-normal',
												title: 'Normal',
											},
											{
												name: 'accordion-hover',
												title: 'Hover',
											},
											{
												name: 'accordion-active',
												title: 'Active',
											},
										] }
									>
										{ ( { name } ) => (
											<>
												{ name ===
													'accordion-normal' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __(
																'Background',
																'blockish'
															) }
															slug="accordionBackgroundNormal"
														/>
														<BlockishGroupControl
															type="BlockishBorder"
															label={ __(
																'Border',
																'blockish'
															) }
															slug="accordionBorderNormal"
														/>
													</>
												) }
												{ name ===
													'accordion-hover' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __(
																'Background',
																'blockish'
															) }
															slug="accordionBackgroundHover"
														/>
														<BlockishGroupControl
															type="BlockishBorder"
															label={ __(
																'Border',
																'blockish'
															) }
															slug="accordionBorderHover"
														/>
													</>
												) }
												{ name ===
													'accordion-active' && (
													<>
														<BlockishGroupControl
															type="BlockishBackground"
															label={ __(
																'Background',
																'blockish'
															) }
															slug="accordionBackgroundActive"
														/>
														<BlockishGroupControl
															type="BlockishBorder"
															label={ __(
																'Border',
																'blockish'
															) }
															slug="accordionBorderActive"
														/>
													</>
												) }
											</>
										) }
									</BlockishControl>
									<BlockishControl type="BlockishDivider" />
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __(
											'Border Radius',
											'blockish'
										) }
										slug="accordionBorderRadius"
										left="44px"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Padding', 'blockish' ) }
										slug="accordionPadding"
										left="52px"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Header', 'blockish' ) }
								indicatorSlugs={['headerTypography', 'iconSize', 'headerTextColor', 'iconColor', 'headerTextShadow', 'headerTextStroke', 'headerTextColorHover', 'iconColorHover', 'headerTextShadowHover', 'headerTextStrokeHover', 'headerTextColorActive', 'iconColorActive', 'headerTextShadowActive', 'headerTextStrokeActive']}>
									<BlockishGroupControl
										type="BlockishTypography"
										label={ __( 'Typography', 'blockish' ) }
										slug="headerTypography"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Icon Size', 'blockish' ) }
										slug="iconSize"
										left="8ch"
									/>
									<BlockishControl
										type="BlockishTab"
										tabs={ [
											{
												name: 'header-normal',
												title: 'Normal',
											},
											{
												name: 'header-hover',
												title: 'Hover',
											},
											{
												name: 'header-active',
												title: 'Active',
											},
										] }
									>
										{ ( { name } ) => (
											<>
												{ name === 'header-normal' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={ __(
																'Text Color',
																'blockish'
															) }
															slug="headerTextColor"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __(
																'Icon Color',
																'blockish'
															) }
															slug="iconColor"
														/>
														<BlockishGroupControl
															type="BlockishBoxShadow"
															label={ __(
																'Text Shadow',
																'blockish'
															) }
															slug="headerTextShadow"
															exclude={ [
																'inset',
																'spread',
															] }
														/>
														<BlockishGroupControl
															type="BlockishTextStroke"
															label={ __(
																'Text Stroke',
																'blockish'
															) }
															slug="headerTextStroke"
														/>
													</>
												) }
												{ name === 'header-hover' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={ __(
																'Text Color',
																'blockish'
															) }
															slug="headerTextColorHover"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __(
																'Icon Color',
																'blockish'
															) }
															slug="iconColorHover"
														/>
														<BlockishGroupControl
															type="BlockishBoxShadow"
															label={ __(
																'Text Shadow',
																'blockish'
															) }
															slug="headerTextShadowHover"
															exclude={ [
																'inset',
																'spread',
															] }
														/>
														<BlockishGroupControl
															type="BlockishTextStroke"
															label={ __(
																'Text Stroke',
																'blockish'
															) }
															slug="headerTextStrokeHover"
														/>
													</>
												) }
												{ name === 'header-active' && (
													<>
														<BlockishControl
															type="BlockishColor"
															label={ __(
																'Text Color',
																'blockish'
															) }
															slug="headerTextColorActive"
														/>
														<BlockishControl
															type="BlockishColor"
															label={ __(
																'Icon Color',
																'blockish'
															) }
															slug="iconColorActive"
														/>
														<BlockishGroupControl
															type="BlockishBoxShadow"
															label={ __(
																'Text Shadow',
																'blockish'
															) }
															slug="headerTextShadowActive"
															exclude={ [
																'inset',
																'spread',
															] }
														/>
														<BlockishGroupControl
															type="BlockishTextStroke"
															label={ __(
																'Text Stroke',
																'blockish'
															) }
															slug="headerTextStrokeActive"
														/>
													</>
												) }
											</>
										) }
									</BlockishControl>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Content', 'blockish' ) }
								indicatorSlugs={['contentTextColor', 'contentBackground', 'contentBorder', 'contentBorderRadius', 'contentPadding']}>
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Text Color', 'blockish' ) }
										slug="contentTextColor"
									/>
									<BlockishGroupControl
										type="BlockishBackground"
										label={ __( 'Background', 'blockish' ) }
										slug="contentBackground"
									/>
									<BlockishGroupControl
										type="BlockishBorder"
										label={ __( 'Border', 'blockish' ) }
										slug="contentBorder"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __(
											'Border Radius',
											'blockish'
										) }
										slug="contentBorderRadius"
										left="44px"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Padding', 'blockish' ) }
										slug="contentPadding"
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
