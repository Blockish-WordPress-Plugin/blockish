import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const HOVER_ANIMATION_OPTIONS = [
	{ label: __( 'None', 'blockish' ), value: 'none' },
	{ label: 'Pulse', value: 'pulse' },
	{ label: 'Bounce', value: 'bounce' },
	{ label: 'Rubber Band', value: 'rubberBand' },
	{ label: 'Shake X', value: 'shakeX' },
	{ label: 'Swing', value: 'swing' },
	{ label: 'Tada', value: 'tada' },
	{ label: 'Wobble', value: 'wobble' },
	{ label: 'Jello', value: 'jello' },
	{ label: 'Heart Beat', value: 'heartBeat' },
];

const Inspector = ( { attributes, advancedControls } ) => {
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
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Social Icons', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishControl
									type="BlockishToggleGroup"
									label={ __( 'Shape', 'blockish' ) }
									slug="shape"
									options={ [
										{
											label: __( 'Square', 'blockish' ),
											value: 'square',
										},
										{
											label: __( 'Rounded', 'blockish' ),
											value: 'rounded',
										},
										{
											label: __( 'Circle', 'blockish' ),
											value: 'circle',
										},
									] }
								/>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={ __( 'Direction', 'blockish' ) }
									slug="flexDirection"
									left="8ch"
									options={ [
										{
											label: __( 'Row', 'blockish' ),
											value: 'row',
										},
										{
											label: __( 'Column', 'blockish' ),
											value: 'column',
										},
									] }
								/>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={ __( 'Wrap', 'blockish' ) }
									slug="flexWrap"
									left="7ch"
									options={ [
										{
											label: __( 'Wrap', 'blockish' ),
											value: 'wrap',
										},
										{
											label: __( 'Unwrap', 'blockish' ),
											value: 'nowrap',
										},
									] }
								/>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={ __( 'Alignment', 'blockish' ) }
									slug="alignment"
									left="8ch"
									options={ [
										{ label: __( 'Left', 'blockish' ), value: 'flex-start' },
										{ label: __( 'Center', 'blockish' ), value: 'center' },
										{ label: __( 'Right', 'blockish' ), value: 'flex-end' },
									] }
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
									<BlockishControl
										type="BlockishToggleGroup"
										label={ __( 'Primary Color', 'blockish' ) }
										slug="iconColorMode"
										options={ [
											{
												label: __( 'Official', 'blockish' ),
												value: 'official',
											},
											{
												label: __( 'Custom', 'blockish' ),
												value: 'custom',
											},
										] }
									/>
									{ attributes?.iconColorMode === 'custom' && (
										<BlockishControl
											type="BlockishColor"
											label={ __( 'Primary Color', 'blockish' ) }
											slug="iconColor"
										/>
									) }
									<BlockishControl
										type="BlockishColor"
										label={ __( 'Secondary Color', 'blockish' ) }
										slug="iconSecondaryColor"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Size', 'blockish' ) }
										slug="iconSize"
										left="3ch"
									/>
									<BlockishResponsiveControl
										type="BlockishSpacingSizes"
										label={ __( 'Padding', 'blockish' ) }
										slug="iconPadding"
										left="6ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Spacing', 'blockish' ) }
										slug="iconSpacing"
										left="6ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Rows Gap', 'blockish' ) }
										slug="iconRowsGap"
										left="8ch"
									/>
									<BlockishGroupControl
										type="BlockishBorder"
										label={ __( 'Border', 'blockish' ) }
										slug="iconBorder"
									/>
									<BlockishResponsiveControl
										type="BlockishBorderRadius"
										label={ __( 'Border Radius', 'blockish' ) }
										slug="iconBorderRadius"
										left="6ch"
									/>
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Icon Hover', 'blockish' ) }
									initialOpen={ false }
								>
								<BlockishControl
									type="BlockishSelect"
									label={ __( 'Hover Animation', 'blockish' ) }
									slug="hoverAnimation"
									options={ HOVER_ANIMATION_OPTIONS }
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
