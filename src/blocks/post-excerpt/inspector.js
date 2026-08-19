import { InspectorControls } from '@wordpress/block-editor';
import { ToggleControl } from '@wordpress/components';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { attributes, setAttributes, advancedControls } ) => {
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
								title={ __( 'Post Excerpt', 'blockish' ) }
								initialOpen={ true }
							indicatorSlugs={['excerptLength', 'moreText', 'alignment']}>
								<BlockishControl
									type="BlockishRangeControl"
									label={ __( 'Excerpt Length', 'blockish' ) }
									slug="excerptLength"
									min={ 1 }
									max={ 100 }
								/>
								<BlockishControl
									type="TextControl"
									label={ __( 'Read More Text', 'blockish' ) }
									slug="moreText"
								/>
								{ attributes.moreText && (
									<ToggleControl
										label={ __(
											'Show link on new line',
											'blockish'
										) }
										checked={ attributes.showMoreOnNewLine }
										onChange={ ( showMoreOnNewLine ) =>
											setAttributes( {
												showMoreOnNewLine,
											} )
										}
									/>
								) }
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
											label: __( 'Center', 'blockish' ),
										},
										{
											value: 'right',
											label: __( 'Right', 'blockish' ),
										},
									] }
								/>
							</BlockishControl>
						) }
						{ tabName === 'style' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Excerpt', 'blockish' ) }
								initialOpen={ true }
							indicatorSlugs={['typography', 'color', 'moreColor', 'moreHoverColor']}>
								<BlockishControl
									type="BlockishTypography"
									label={ __( 'Typography', 'blockish' ) }
									slug="typography"
								/>
								<BlockishControl
									type="BlockishColor"
									label={ __( 'Text Color', 'blockish' ) }
									slug="color"
								/>
								<BlockishControl
									type="BlockishColor"
									label={ __( 'Link Color', 'blockish' ) }
									slug="moreColor"
								/>
								<BlockishControl
									type="BlockishColor"
									label={ __(
										'Link Hover Color',
										'blockish'
									) }
									slug="moreHoverColor"
								/>
							</BlockishControl>
						) }
						{ tabName === 'advanced' && advancedControls }
					</>
				) }
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo( Inspector );
