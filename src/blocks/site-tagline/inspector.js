import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import TextStylePanel from '../shared/text-style-panel';

const Inspector = ( { advancedControls } ) => {
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
								title={ __( 'Site Tagline', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishControl
									type="BlockishSelect"
									label={ __( 'HTML Tag', 'blockish' ) }
									slug="tag"
									options={ [
										{
											value: 'p',
											label: __( 'P', 'blockish' ),
										},
										{
											value: 'div',
											label: __( 'Div', 'blockish' ),
										},
										{
											value: 'span',
											label: __( 'Span', 'blockish' ),
										},
										{
											value: 'h1',
											label: __( 'H1', 'blockish' ),
										},
										{
											value: 'h2',
											label: __( 'H2', 'blockish' ),
										},
										{
											value: 'h3',
											label: __( 'H3', 'blockish' ),
										},
										{
											value: 'h4',
											label: __( 'H4', 'blockish' ),
										},
										{
											value: 'h5',
											label: __( 'H5', 'blockish' ),
										},
										{
											value: 'h6',
											label: __( 'H6', 'blockish' ),
										},
									] }
									__nextHasNoMarginBottom={ true }
								/>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={ __( 'Alignment', 'blockish' ) }
									slug="alignment"
									left="65px"
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
							<TextStylePanel
								title={ __( 'Site Tagline', 'blockish' ) }
							/>
						) }
						{ tabName === 'advanced' && advancedControls }
					</>
				) }
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo( Inspector );
