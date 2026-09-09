import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { advancedControls, isInOffcanvas } ) => {
	const { BlockishControl, BlockishResponsiveControl } =
		window?.blockish?.controls || {};

	if ( ! BlockishControl ) {
		return null;
	}

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'style', title: __( 'Style', 'blockish' ) },
					{ name: 'advanced', title: __( 'Advanced', 'blockish' ) },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Submenu', 'blockish' ) }
									initialOpen={ true }
									indicatorSlugs={ [ 'alignment', 'itemGap' ] }
								>
									<BlockishResponsiveControl
										type="BlockishSelect"
										label={ __( 'Alignment', 'blockish' ) }
										slug="alignment"
										left="68px"
										options={ [
											{
												value: 'flex-start',
												label: __( 'Start', 'blockish' ),
											},
											{
												value: 'center',
												label: __( 'Center', 'blockish' ),
											},
											{
												value: 'flex-end',
												label: __( 'End', 'blockish' ),
											},
											{
												value: 'space-between',
												label: __(
													'Space Between',
													'blockish'
												),
											},
										] }
										__nextHasNoMarginBottom={ true }
										help={ __(
											'Justifies the label within each submenu item.',
											'blockish'
										) }
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Item Gap', 'blockish' ) }
										slug="itemGap"
										left="60px"
									/>
								</BlockishControl>

								{ ! isInOffcanvas && (
									<BlockishControl
										type="BlockishPanelBody"
										title={ __(
											'Layout & Position',
											'blockish'
										) }
										initialOpen={ true }
										indicatorSlugs={ [
											'positionAlign',
											'offsetY',
											'offsetX',
										] }
									>
										<BlockishControl
											type="BlockishToggleGroup"
											label={ __(
												'Horizontal Alignment',
												'blockish'
											) }
											slug="positionAlign"
											options={ [
												{
													value: 'left',
													label: __(
														'Left',
														'blockish'
													),
												},
												{
													value: 'center',
													label: __(
														'Center',
														'blockish'
													),
												},
												{
													value: 'right',
													label: __(
														'Right',
														'blockish'
													),
												},
											] }
											help={ __(
												'Aligns the dropdown to the parent menu item.',
												'blockish'
											) }
										/>

										<BlockishControl type="BlockishDivider" />

										<BlockishResponsiveControl
											type="BlockishRangeUnit"
											label={ __(
												'Top Distance (Offset Y)',
												'blockish'
											) }
											slug="offsetY"
											left="148px"
										/>

										<BlockishResponsiveControl
											type="BlockishRangeUnit"
											label={ __(
												'Horizontal Offset (X)',
												'blockish'
											) }
											slug="offsetX"
											left="140px"
										/>
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
