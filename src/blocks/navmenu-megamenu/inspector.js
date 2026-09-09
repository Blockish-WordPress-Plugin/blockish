import { InspectorControls } from '@wordpress/block-editor';
import { Button, Spinner, SelectControl } from '@wordpress/components';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const WIDTH_MODES = [
	{
		value: 'navigation',
		label: __( 'Navigation Width', 'blockish' ),
	},
	{
		value: 'full',
		label: __( 'Full Width', 'blockish' ),
	},
	{
		value: 'custom',
		label: __( 'Custom Width', 'blockish' ),
	},
];

const Inspector = ( {
	advancedControls,
	megamenus,
	hasResolved,
	attributes,
	setAttributes,
	onOpenPicker,
} ) => {
	const { BlockishControl, BlockishResponsiveControl } =
		window?.blockish?.controls || {};

	if ( ! BlockishControl ) {
		return null;
	}

	const selected = ( megamenus || [] ).find(
		( item ) => item.id === attributes.megamenuId
	);
	const selectedTitle = selected?.title?.rendered || '';

	let widthModeValue =
		typeof attributes.widthMode === 'string'
			? attributes.widthMode
			: attributes.widthMode?.value || 'navigation';
	if ( ! [ 'navigation', 'full', 'custom' ].includes( widthModeValue ) ) {
		widthModeValue = 'navigation';
	}

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'content', title: __( 'Content', 'blockish' ) },
					{ name: 'advanced', title: __( 'Advanced', 'blockish' ) },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Mega Menu', 'blockish' ) }
									initialOpen={ true }
									indicatorSlugs={ [ 'megamenuId' ] }
								>
									{ ! hasResolved ? (
										<Spinner />
									) : (
										<>
											<p
												style={ {
													marginTop: 0,
													marginBottom: '12px',
													fontSize: '13px',
												} }
											>
												{ selectedTitle ||
													( attributes.megamenuId
														? __(
																'(Untitled)',
																'blockish'
														  )
														: __(
																'No Mega Menu selected.',
																'blockish'
														  ) ) }
											</p>
											<Button
												variant="secondary"
												onClick={ onOpenPicker }
												style={ { width: '100%' } }
											>
												{ attributes.megamenuId
													? __(
															'Replace Mega Menu',
															'blockish'
													  )
													: __(
															'Select Mega Menu',
															'blockish'
													  ) }
											</Button>
										</>
									) }
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Layout & Position', 'blockish' ) }
									initialOpen={ true }
									indicatorSlugs={ [
										'widthMode',
										'customWidth',
										'positionAlign',
										'alignRelativeTo',
										'offsetY',
										'offsetX',
									] }
								>
									<SelectControl
										label={ __( 'Width Mode', 'blockish' ) }
										value={ widthModeValue }
										options={ WIDTH_MODES }
										onChange={ ( nextMode ) => {
											const val =
												typeof nextMode === 'string'
													? nextMode
													: nextMode?.value ||
													  'navigation';
											setAttributes( {
												widthMode: [ 'navigation', 'full', 'custom' ].includes(
													val
												)
													? val
													: 'navigation',
											} );
										} }
										help={ __(
											'Full = viewport width. Navigation = match nav. Custom = set a width (capped to the screen).',
											'blockish'
										) }
										__nextHasNoMarginBottom
									/>

									{ widthModeValue === 'custom' && (
										<>
											<BlockishResponsiveControl
												type="BlockishRangeUnit"
												label={ __( 'Custom Width', 'blockish' ) }
												slug="customWidth"
												left="80px"
											/>

											<BlockishControl
												type="BlockishToggleGroup"
												label={ __( 'Horizontal Alignment', 'blockish' ) }
												slug="positionAlign"
												options={ [
													{ value: 'left', label: __( 'Left', 'blockish' ) },
													{ value: 'center', label: __( 'Center', 'blockish' ) },
													{ value: 'right', label: __( 'Right', 'blockish' ) },
												] }
											/>

											<BlockishControl
												type="BlockishToggleGroup"
												label={ __( 'Align Relative To', 'blockish' ) }
												slug="alignRelativeTo"
												options={ [
													{ value: 'viewport', label: __( 'Screen', 'blockish' ) },
													{ value: 'navigation', label: __( 'Navigation', 'blockish' ) },
													{ value: 'item', label: __( 'Menu Item', 'blockish' ) },
												] }
											/>
										</>
									) }

									<BlockishControl type="BlockishDivider" />

									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Top Distance (Offset Y)', 'blockish' ) }
										slug="offsetY"
										left="148px"
									/>

									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Horizontal Offset (X)', 'blockish' ) }
										slug="offsetX"
										left="140px"
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
