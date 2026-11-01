import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ALIGN_OPTIONS } from './shared';

const Inspector = ( { attributes, advancedControls } ) => {
	const { BlockishControl, BlockishResponsiveControl, BlockishGroupControl } =
		window?.blockish?.controls;
	const { showSearch, showFilters } = attributes;

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
									title={ __( 'Search', 'blockish' ) }
									initialOpen={ true }
									indicatorSlugs={ [ 'showSearch', 'searchPlaceholder', 'searchInText' ] }
								>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Show search box', 'blockish' ) }
										slug="showSearch"
									/>
									{ showSearch && (
										<>
											<BlockishControl
												type="TextControl"
												label={ __( 'Placeholder', 'blockish' ) }
												slug="searchPlaceholder"
											/>
											<BlockishControl
												type="ToggleControl"
												label={ __( 'Also search block text', 'blockish' ) }
												help={ __(
													'Off (recommended): search matches the search keywords and filter terms you give each block. On: it also matches all text inside a block, which is less precise in complex layouts.',
													'blockish'
												) }
												slug="searchInText"
											/>
										</>
									) }
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Filter buttons', 'blockish' ) }
									initialOpen={ true }
									indicatorSlugs={ [ 'showFilters', 'allLabel', 'filterMode' ] }
								>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Show filter buttons', 'blockish' ) }
										help={ __(
											'Buttons are made from the filter terms of the blocks inside.',
											'blockish'
										) }
										slug="showFilters"
									/>
									{ showFilters && (
										<>
											<BlockishControl
												type="TextControl"
												label={ __( '"All" button label', 'blockish' ) }
												slug="allLabel"
											/>
											<BlockishControl
												type="BlockishToggleGroup"
												label={ __( 'Selection', 'blockish' ) }
												slug="filterMode"
												options={ [
													{ value: 'single', label: __( 'One', 'blockish' ) },
													{ value: 'multiple', label: __( 'Several', 'blockish' ) },
												] }
												isDeselectable={ false }
											/>
										</>
									) }
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Items', 'blockish' ) }
									initialOpen={ true }
									indicatorSlugs={ [ 'itemsLayout', 'columns', 'itemsGap' ] }
								>
									<BlockishControl
										type="BlockishToggleGroup"
										label={ __( 'Layout', 'blockish' ) }
										slug="itemsLayout"
										options={ [
											{ value: 'grid', label: __( 'Grid', 'blockish' ) },
											{ value: 'stack', label: __( 'Stack', 'blockish' ) },
										] }
										isDeselectable={ false }
									/>
									{ attributes.itemsLayout !== 'stack' && (
										<BlockishResponsiveControl
											type="BlockishRangeControl"
											label={ __( 'Columns', 'blockish' ) }
											slug="columns"
											left="60px"
											min={ 1 }
											max={ 6 }
										/>
									) }
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Gap', 'blockish' ) }
										slug="itemsGap"
										left="4ch"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'No results', 'blockish' ) }
									indicatorSlugs={ [ 'emptyMessage' ] }
								>
									<BlockishControl
										type="TextControl"
										label={ __( 'Message', 'blockish' ) }
										slug="emptyMessage"
									/>
								</BlockishControl>
							</>
						) }

						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Layout', 'blockish' ) }
									initialOpen={ true }
									indicatorSlugs={ [ 'controlsAlign', 'controlsSpacing' ] }
								>
									<BlockishResponsiveControl
										type="BlockishToggleGroup"
										label={ __( 'Controls alignment', 'blockish' ) }
										slug="controlsAlign"
										options={ ALIGN_OPTIONS }
										left="17ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Space below controls', 'blockish' ) }
										slug="controlsSpacing"
										left="19ch"
									/>
								</BlockishControl>
								{ showSearch && (
									<BlockishControl
										type="BlockishPanelBody"
										title={ __( 'Search box', 'blockish' ) }
										indicatorSlugs={ [
											'searchWidth',
											'searchTypography',
											'searchColor',
											'searchIconColor',
											'searchIconSize',
											'searchBackground',
											'searchBorder',
											'searchBorderRadius',
											'searchPadding',
										] }
									>
										<BlockishResponsiveControl
											type="BlockishRangeUnit"
											label={ __( 'Width', 'blockish' ) }
											slug="searchWidth"
											left="6ch"
										/>
										<BlockishGroupControl
											type="BlockishTypography"
											label={ __( 'Typography', 'blockish' ) }
											slug="searchTypography"
										/>
										<BlockishControl
											type="BlockishColor"
											label={ __( 'Text color', 'blockish' ) }
											slug="searchColor"
										/>
										<BlockishControl
											type="BlockishColor"
											label={ __( 'Icon color', 'blockish' ) }
											slug="searchIconColor"
										/>
										<BlockishResponsiveControl
											type="BlockishRangeUnit"
											label={ __( 'Icon size', 'blockish' ) }
											slug="searchIconSize"
											left="60px"
										/>
										<BlockishGroupControl
											type="BlockishBackground"
											label={ __( 'Background', 'blockish' ) }
											slug="searchBackground"
										/>
										<BlockishGroupControl
											type="BlockishBorder"
											label={ __( 'Border', 'blockish' ) }
											slug="searchBorder"
										/>
										<BlockishResponsiveControl
											type="BlockishBorderRadius"
											label={ __( 'Border radius', 'blockish' ) }
											slug="searchBorderRadius"
											left="44px"
										/>
										<BlockishResponsiveControl
											type="BlockishSpacingSizes"
											label={ __( 'Padding', 'blockish' ) }
											slug="searchPadding"
											left="52px"
										/>
									</BlockishControl>
								) }
								{ showFilters && (
									<BlockishControl
										type="BlockishPanelBody"
										title={ __( 'Filter buttons', 'blockish' ) }
										indicatorSlugs={ [ 'buttonsGap', 'buttonTypography', 'buttonColor', 'buttonBackground', 'buttonBorder', 'buttonColorActive', 'buttonBackgroundActive', 'buttonBorderActive', 'buttonBorderRadius', 'buttonPadding' ] }
									>
										<BlockishResponsiveControl
											type="BlockishRangeUnit"
											label={ __( 'Gap', 'blockish' ) }
											slug="buttonsGap"
											left="4ch"
										/>
										<BlockishGroupControl
											type="BlockishTypography"
											label={ __( 'Typography', 'blockish' ) }
											slug="buttonTypography"
										/>
										<BlockishControl
											type="BlockishTab"
											tabs={ [
												{ name: 'button-normal', title: 'Normal' },
												{ name: 'button-active', title: 'Active' },
											] }
										>
											{ ( { name } ) => (
												<>
													{ name === 'button-normal' && (
														<>
															<BlockishControl
																type="BlockishColor"
																label={ __( 'Text color', 'blockish' ) }
																slug="buttonColor"
															/>
															<BlockishGroupControl
																type="BlockishBackground"
																label={ __( 'Background', 'blockish' ) }
																slug="buttonBackground"
															/>
															<BlockishGroupControl
																type="BlockishBorder"
																label={ __( 'Border', 'blockish' ) }
																slug="buttonBorder"
															/>
														</>
													) }
													{ name === 'button-active' && (
														<>
															<BlockishControl
																type="BlockishColor"
																label={ __( 'Text color', 'blockish' ) }
																slug="buttonColorActive"
															/>
															<BlockishGroupControl
																type="BlockishBackground"
																label={ __( 'Background', 'blockish' ) }
																slug="buttonBackgroundActive"
															/>
															<BlockishGroupControl
																type="BlockishBorder"
																label={ __( 'Border', 'blockish' ) }
																slug="buttonBorderActive"
															/>
														</>
													) }
												</>
											) }
										</BlockishControl>
										<BlockishControl type="BlockishDivider" />
										<BlockishResponsiveControl
											type="BlockishBorderRadius"
											label={ __( 'Border radius', 'blockish' ) }
											slug="buttonBorderRadius"
											left="44px"
										/>
										<BlockishResponsiveControl
											type="BlockishSpacingSizes"
											label={ __( 'Padding', 'blockish' ) }
											slug="buttonPadding"
											left="52px"
										/>
									</BlockishControl>
								) }
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'No results', 'blockish' ) }
									indicatorSlugs={ [ 'emptyColor', 'emptyTypography' ] }
								>
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Text color', 'blockish' ) }
										slug="emptyColor"
									/>
									<BlockishGroupControl
										type="BlockishTypography"
										label={ __( 'Typography', 'blockish' ) }
										slug="emptyTypography"
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
