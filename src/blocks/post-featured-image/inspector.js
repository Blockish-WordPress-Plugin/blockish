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
								title={ __( 'Featured Image', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishControl
									type="BlockishSelect"
									label={ __( 'Image Size', 'blockish' ) }
									slug="imageSize"
									options={ [
										{
											value: 'thumbnail',
											label: __(
												'Thumbnail',
												'blockish'
											),
										},
										{
											value: 'medium',
											label: __( 'Medium', 'blockish' ),
										},
										{
											value: 'large',
											label: __( 'Large', 'blockish' ),
										},
										{
											value: 'full',
											label: __(
												'Full Size',
												'blockish'
											),
										},
									] }
								/>
								<ToggleControl
									label={ __( 'Link to post', 'blockish' ) }
									checked={ attributes.linkToPost }
									onChange={ ( linkToPost ) =>
										setAttributes( { linkToPost } )
									}
								/>
								{ attributes.linkToPost && (
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
										slug="imageWidth"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Max Width', 'blockish' ) }
										slug="imageMaxWidth"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Height', 'blockish' ) }
										slug="imageHeight"
									/>
									<BlockishResponsiveControl
										type="BlockishSelect"
										label={ __( 'Object Fit', 'blockish' ) }
										slug="objectFit"
										options={ [
											{
												value: 'cover',
												label: __(
													'Cover',
													'blockish'
												),
											},
											{
												value: 'contain',
												label: __(
													'Contain',
													'blockish'
												),
											},
											{
												value: 'fill',
												label: __( 'Fill', 'blockish' ),
											},
										] }
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
