import { InspectorControls } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import { memo } from '@wordpress/element';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

const DueDateControl = () => {
	const clientId = useSelect( ( select ) => {
		return select( 'core/block-editor' ).getSelectedBlockClientId();
	}, [] );
	const dueDate = useSelect( ( select ) => {
		return (
			select( 'core/block-editor' ).getSelectedBlock()?.attributes
				?.dueDate || ''
		);
	}, [] );
	const { updateBlockAttributes } = useDispatch( 'core/block-editor' );

	return (
		<TextControl
			label={ __( 'Due Date', 'blockish' ) }
			type="datetime-local"
			value={ dueDate }
			onChange={ ( value ) =>
				updateBlockAttributes( clientId, { dueDate: value } )
			}
			help={ __(
				'Local date and time the countdown ends.',
				'blockish'
			) }
			__next40pxDefaultSize
			__nextHasNoMarginBottom
		/>
	);
};

const Inspector = ( { attributes, advancedControls } ) => {
	const { BlockishControl, BlockishResponsiveControl, BlockishGroupControl } =
		window?.blockish?.controls;

	const isInline = attributes?.layout?.value === 'inline';
	const isCircular = attributes?.layout?.value === 'circular';
	const isFlip = attributes?.layout?.value === 'flip';
	const isBoxed =
		attributes?.layout?.value === 'boxes' ||
		attributes?.layout?.value === 'stacked';

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
									title={ __( 'Countdown', 'blockish' ) }
									initialOpen={ true }
									indicatorSlugs={ [
										'dueDate',
										'layout',
										'padZeros',
										'showLabels',
										'separator',
										'circularDaysMax',
									] }
								>
									<DueDateControl />
									<BlockishControl
										type="BlockishSelect"
										label={ __( 'Design', 'blockish' ) }
										slug="layout"
										options={ [
											{
												value: 'boxes',
												label: __( 'Boxes', 'blockish' ),
											},
											{
												value: 'inline',
												label: __( 'Inline', 'blockish' ),
											},
											{
												value: 'stacked',
												label: __(
													'Stacked',
													'blockish'
												),
											},
											{
												value: 'circular',
												label: __(
													'Circular',
													'blockish'
												),
											},
											{
												value: 'flip',
												label: __( 'Flip', 'blockish' ),
											},
										] }
									/>
									<BlockishControl
										type="ToggleControl"
										label={ __(
											'Pad Zeros',
											'blockish'
										) }
										slug="padZeros"
									/>
									<BlockishControl
										type="ToggleControl"
										label={ __(
											'Show Labels',
											'blockish'
										) }
										slug="showLabels"
									/>
									{ isInline && (
										<BlockishControl
											type="BlockishSelect"
											label={ __(
												'Separator',
												'blockish'
											) }
											slug="separator"
											options={ [
												{
													value: ':',
													label: __(
														'Colon (:)',
														'blockish'
													),
												},
												{
													value: '|',
													label: __(
														'Pipe (|)',
														'blockish'
													),
												},
												{
													value: '•',
													label: __(
														'Dot (•)',
														'blockish'
													),
												},
												{
													value: '/',
													label: __(
														'Slash (/)',
														'blockish'
													),
												},
												{
													value: 'none',
													label: __(
														'None',
														'blockish'
													),
												},
											] }
										/>
									) }
									{ isCircular && (
										<BlockishControl
											type="BlockishNumber"
											label={ __(
												'Circular Days Max',
												'blockish'
											) }
											slug="circularDaysMax"
											min={ 1 }
											max={ 365 }
											help={ __(
												'Ring fill for days uses value ÷ this max.',
												'blockish'
											) }
										/>
									) }
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Units', 'blockish' ) }
									initialOpen={ false }
									indicatorSlugs={ [
										'showDays',
										'daysLabel',
										'showHours',
										'hoursLabel',
										'showMinutes',
										'minutesLabel',
										'showSeconds',
										'secondsLabel',
									] }
								>
									<BlockishControl
										type="ToggleControl"
										label={ __( 'Show Days', 'blockish' ) }
										slug="showDays"
									/>
									{ attributes?.showDays !== false && (
										<BlockishControl
											type="TextControl"
											label={ __(
												'Days Label',
												'blockish'
											) }
											slug="daysLabel"
											__next40pxDefaultSize
										/>
									) }
									<BlockishControl
										type="ToggleControl"
										label={ __(
											'Show Hours',
											'blockish'
										) }
										slug="showHours"
									/>
									{ attributes?.showHours !== false && (
										<BlockishControl
											type="TextControl"
											label={ __(
												'Hours Label',
												'blockish'
											) }
											slug="hoursLabel"
											__next40pxDefaultSize
										/>
									) }
									<BlockishControl
										type="ToggleControl"
										label={ __(
											'Show Minutes',
											'blockish'
										) }
										slug="showMinutes"
									/>
									{ attributes?.showMinutes !== false && (
										<BlockishControl
											type="TextControl"
											label={ __(
												'Minutes Label',
												'blockish'
											) }
											slug="minutesLabel"
											__next40pxDefaultSize
										/>
									) }
									<BlockishControl
										type="ToggleControl"
										label={ __(
											'Show Seconds',
											'blockish'
										) }
										slug="showSeconds"
									/>
									{ attributes?.showSeconds !== false && (
										<BlockishControl
											type="TextControl"
											label={ __(
												'Seconds Label',
												'blockish'
											) }
											slug="secondsLabel"
											__next40pxDefaultSize
										/>
									) }
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Expired', 'blockish' ) }
									initialOpen={ false }
									indicatorSlugs={ [
										'showExpiredMessage',
										'expiredMessage',
									] }
								>
									<BlockishControl
										type="ToggleControl"
										label={ __(
											'Show Expired Message',
											'blockish'
										) }
										slug="showExpiredMessage"
									/>
									{ attributes?.showExpiredMessage !==
										false && (
										<BlockishControl
											type="TextControl"
											label={ __(
												'Expired Message',
												'blockish'
											) }
											slug="expiredMessage"
											__next40pxDefaultSize
										/>
									) }
								</BlockishControl>
							</>
						) }

						{ tabName === 'style' && (
							<>
								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Layout', 'blockish' ) }
									initialOpen={ true }
									indicatorSlugs={ [
										'alignment',
										'unitsGap',
										'unitMinWidth',
										'labelGap',
									] }
								>
									<BlockishResponsiveControl
										type="BlockishToggleGroup"
										label={ __(
											'Alignment',
											'blockish'
										) }
										slug="alignment"
										left="9ch"
										options={ [
											{
												value: 'flex-start',
												label: __(
													'Start',
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
												value: 'flex-end',
												label: __(
													'End',
													'blockish'
												),
											},
										] }
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Units Gap', 'blockish' ) }
										slug="unitsGap"
										left="9ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __(
											'Unit Min Width',
											'blockish'
										) }
										slug="unitMinWidth"
										left="12ch"
									/>
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Label Gap', 'blockish' ) }
										slug="labelGap"
										left="8ch"
									/>
								</BlockishControl>

								{ isBoxed && (
									<BlockishControl
										type="BlockishPanelBody"
										title={ __( 'Unit Box', 'blockish' ) }
										initialOpen={ false }
										indicatorSlugs={ [
											'unitBackground',
											'unitBorder',
											'unitBorderRadius',
											'unitPadding',
											'unitBoxShadow',
										] }
									>
										<BlockishControl
											type="BlockishColor"
											label={ __(
												'Background',
												'blockish'
											) }
											slug="unitBackground"
										/>
										<BlockishGroupControl
											type="BlockishBorder"
											label={ __( 'Border', 'blockish' ) }
											slug="unitBorder"
										/>
										<BlockishResponsiveControl
											type="BlockishBorderRadius"
											label={ __(
												'Border Radius',
												'blockish'
											) }
											slug="unitBorderRadius"
											left="11ch"
										/>
										<BlockishResponsiveControl
											type="BlockishDimensions"
											label={ __(
												'Padding',
												'blockish'
											) }
											slug="unitPadding"
											left="7ch"
										/>
										<BlockishGroupControl
											type="BlockishBoxShadow"
											label={ __(
												'Box Shadow',
												'blockish'
											) }
											slug="unitBoxShadow"
										/>
									</BlockishControl>
								) }

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Number', 'blockish' ) }
									initialOpen={ false }
									indicatorSlugs={ [
										'numberTextColor',
										'numberTypography',
									] }
								>
									<BlockishControl
										type="BlockishColor"
										label={ __(
											'Text Color',
											'blockish'
										) }
										slug="numberTextColor"
									/>
									<BlockishGroupControl
										type="BlockishTypography"
										label={ __(
											'Typography',
											'blockish'
										) }
										slug="numberTypography"
									/>
								</BlockishControl>

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Label', 'blockish' ) }
									initialOpen={ false }
									indicatorSlugs={ [
										'labelTextColor',
										'labelTypography',
									] }
								>
									<BlockishControl
										type="BlockishColor"
										label={ __(
											'Text Color',
											'blockish'
										) }
										slug="labelTextColor"
									/>
									<BlockishGroupControl
										type="BlockishTypography"
										label={ __(
											'Typography',
											'blockish'
										) }
										slug="labelTypography"
									/>
								</BlockishControl>

								{ isCircular && (
									<BlockishControl
										type="BlockishPanelBody"
										title={ __( 'Ring', 'blockish' ) }
										initialOpen={ false }
										indicatorSlugs={ [
											'ringColor',
											'ringTrackColor',
											'ringSize',
											'ringStrokeWidth',
										] }
									>
										<BlockishControl
											type="BlockishColor"
											label={ __(
												'Progress Color',
												'blockish'
											) }
											slug="ringColor"
										/>
										<BlockishControl
											type="BlockishColor"
											label={ __(
												'Track Color',
												'blockish'
											) }
											slug="ringTrackColor"
										/>
										<BlockishResponsiveControl
											type="BlockishRangeUnit"
											label={ __( 'Size', 'blockish' ) }
											slug="ringSize"
											left="5ch"
										/>
										<BlockishResponsiveControl
											type="BlockishRangeUnit"
											label={ __(
												'Stroke Width',
												'blockish'
											) }
											slug="ringStrokeWidth"
											left="11ch"
										/>
									</BlockishControl>
								) }

								{ isFlip && (
									<BlockishControl
										type="BlockishPanelBody"
										title={ __( 'Flip Card', 'blockish' ) }
										initialOpen={ false }
										indicatorSlugs={ [
											'flipCardBackground',
											'flipCardColor',
										] }
									>
										<BlockishControl
											type="BlockishColor"
											label={ __(
												'Background',
												'blockish'
											) }
											slug="flipCardBackground"
										/>
										<BlockishControl
											type="BlockishColor"
											label={ __(
												'Text Color',
												'blockish'
											) }
											slug="flipCardColor"
										/>
									</BlockishControl>
								) }

								{ isInline && (
									<BlockishControl
										type="BlockishPanelBody"
										title={ __( 'Separator', 'blockish' ) }
										initialOpen={ false }
										indicatorSlugs={ [
											'separatorTextColor',
											'separatorTypography',
										] }
									>
										<BlockishControl
											type="BlockishColor"
											label={ __(
												'Text Color',
												'blockish'
											) }
											slug="separatorTextColor"
										/>
										<BlockishGroupControl
											type="BlockishTypography"
											label={ __(
												'Typography',
												'blockish'
											) }
											slug="separatorTypography"
										/>
									</BlockishControl>
								) }

								<BlockishControl
									type="BlockishPanelBody"
									title={ __( 'Expired', 'blockish' ) }
									initialOpen={ false }
									indicatorSlugs={ [
										'expiredTextColor',
										'expiredTypography',
									] }
								>
									<BlockishControl
										type="BlockishColor"
										label={ __(
											'Text Color',
											'blockish'
										) }
										slug="expiredTextColor"
									/>
									<BlockishGroupControl
										type="BlockishTypography"
										label={ __(
											'Typography',
											'blockish'
										) }
										slug="expiredTypography"
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
