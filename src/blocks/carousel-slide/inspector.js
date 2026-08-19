import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { advancedControls } ) => {
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
								title={ __( 'Slide layout', 'blockish' ) }
								initialOpen={ true }
							indicatorSlugs={['minHeight', 'flexDirection', 'alignItems', 'justifyContent', 'gap']}>
								<p className="blockish-carousel-slide-help">
									{ __(
										'Only content blocks are allowed here (no Container). Use Background below for hero fills.',
										'blockish'
									) }
								</p>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Min height', 'blockish' ) }
									slug="minHeight"
									left="10ch"
								/>
								<BlockishControl
									type="BlockishToggleGroup"
									label={ __( 'Direction', 'blockish' ) }
									slug="flexDirection"
									options={ [
										{
											value: 'column',
											label: __( 'Column', 'blockish' ),
										},
										{
											value: 'row',
											label: __( 'Row', 'blockish' ),
										},
									] }
									left="60px"
								/>
								<BlockishControl
									type="BlockishToggleGroup"
									label={ __( 'Align', 'blockish' ) }
									slug="alignItems"
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
											value: 'stretch',
											label: __( 'Stretch', 'blockish' ),
										},
									] }
									left="60px"
								/>
								<BlockishControl
									type="BlockishToggleGroup"
									label={ __( 'Justify', 'blockish' ) }
									slug="justifyContent"
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
											label: __( 'Between', 'blockish' ),
										},
									] }
									left="60px"
								/>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Gap', 'blockish' ) }
									slug="gap"
									left="10ch"
								/>
							</BlockishControl>
						) }

						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Background', 'blockish' ) }
									initialOpen={ true }
								indicatorSlugs={['slideBackground', 'slideBackgroundOverlay']}>
									<BlockishGroupControl
										type="BlockishBackground"
										label={ __( 'Background', 'blockish' ) }
										slug="slideBackground"
									/>
									<BlockishGroupControl
										type="BlockishBackgroundOverlay"
										label={ __( 'Overlay', 'blockish' ) }
										slug="slideBackgroundOverlay"
									/>
								</BlockishControl>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Spacing', 'blockish' ) }
								indicatorSlugs={['padding']}>
									<BlockishResponsiveControl
										type="BlockishSpacing"
										label={ __( 'Padding', 'blockish' ) }
										slug="padding"
										left="8ch"
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
