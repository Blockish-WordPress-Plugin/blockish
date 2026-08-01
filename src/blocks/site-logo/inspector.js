import { InspectorControls } from '@wordpress/block-editor';
import { ToggleControl } from '@wordpress/components';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { attributes, setAttributes, advancedControls } ) => {
	const { BlockishControl, BlockishResponsiveControl, BlockishGroupControl } =
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
					{ name: 'content', title: __( 'Content', 'blockish' ) },
					{ name: 'style', title: __( 'Style', 'blockish' ) },
					{ name: 'advanced', title: __( 'Advanced', 'blockish' ) },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Site Logo', 'blockish' ) }
								initialOpen={ true }
							>
								<ToggleControl
									label={ __( 'Link to home', 'blockish' ) }
									checked={ attributes.linkToHome }
									onChange={ ( linkToHome ) =>
										setAttributes( { linkToHome } )
									}
								/>
								{ attributes.linkToHome && (
									<ToggleControl
										label={ __(
											'Open in new tab',
											'blockish'
										) }
										checked={ attributes.openInNewTab }
										onChange={ ( openInNewTab ) =>
											setAttributes( { openInNewTab } )
										}
									/>
								) }
							</BlockishControl>
						) }
						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Layout', 'blockish' ) }
									initialOpen={ true }
								>
									<BlockishResponsiveControl
										type="BlockishToggleGroup"
										label={ __( 'Alignment', 'blockish' ) }
										slug="alignment"
										left="66px"
										options={ [
											{
												value: 'left',
												label: __( 'Left', 'blockish' ),
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
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Width', 'blockish' ) }
										slug="logoWidth"
										left="39px"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Max Width', 'blockish' ) }
										slug="logoMaxWidth"
										left="66px"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __(
										'Border & Shadow',
										'blockish'
									) }
									initialOpen={ false }
								>
									<BlockishGroupControl
										type="BlockishBorder"
										label={ __( 'Border', 'blockish' ) }
										slug="border"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __(
											'Border Radius',
											'blockish'
										) }
										slug="borderRadius"
										left="44px"
									/>
									<BlockishGroupControl
										type="BlockishBoxShadow"
										label={ __( 'Box Shadow', 'blockish' ) }
										slug="boxShadow"
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
