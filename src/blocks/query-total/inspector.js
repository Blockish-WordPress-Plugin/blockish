import { InspectorControls } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import TextStylePanel from '../shared/text-style-panel';
import {
	DEFAULT_RANGE_FORMAT,
	DEFAULT_RANGE_FORMAT_SINGLE,
	DEFAULT_TOTAL_FORMAT,
	DEFAULT_TOTAL_FORMAT_SINGULAR,
} from './format-label';

const Inspector = ( { attributes, setAttributes, advancedControls } ) => {
	const { BlockishControl, BlockishResponsiveControl } =
		window?.blockish?.controls || {};

	if ( ! BlockishControl ) {
		return null;
	}

	const displayType = attributes.displayType?.value || 'total-results';
	const isRange = displayType === 'range-display';

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
								title={ __( 'Query Total', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishControl
									type="BlockishSelect"
									label={ __( 'Display', 'blockish' ) }
									slug="displayType"
									options={ [
										{
											value: 'total-results',
											label: __(
												'Total results',
												'blockish'
											),
										},
										{
											value: 'range-display',
											label: __(
												'Range display',
												'blockish'
											),
										},
									] }
									__nextHasNoMarginBottom={ true }
								/>
								{ ! isRange && (
									<>
										<TextControl
											label={ __(
												'Plural format',
												'blockish'
											) }
											value={
												attributes.totalFormat ??
												DEFAULT_TOTAL_FORMAT
											}
											onChange={ ( totalFormat ) =>
												setAttributes( {
													totalFormat,
												} )
											}
											help={ __(
												'Tokens: {count}, {total}',
												'blockish'
											) }
											__nextHasNoMarginBottom={ true }
										/>
										<TextControl
											label={ __(
												'Singular format',
												'blockish'
											) }
											value={
												attributes.totalFormatSingular ??
												DEFAULT_TOTAL_FORMAT_SINGULAR
											}
											onChange={ (
												totalFormatSingular
											) =>
												setAttributes( {
													totalFormatSingular,
												} )
											}
											help={ __(
												'Used when there is exactly 1 result. Tokens: {count}, {total}',
												'blockish'
											) }
											__nextHasNoMarginBottom={ true }
										/>
									</>
								) }
								{ isRange && (
									<>
										<TextControl
											label={ __(
												'Range format',
												'blockish'
											) }
											value={
												attributes.rangeFormat ??
												DEFAULT_RANGE_FORMAT
											}
											onChange={ ( rangeFormat ) =>
												setAttributes( {
													rangeFormat,
												} )
											}
											help={ __(
												'Tokens: {start}, {end}, {total}, {count}',
												'blockish'
											) }
											__nextHasNoMarginBottom={ true }
										/>
										<TextControl
											label={ __(
												'Single-item range format',
												'blockish'
											) }
											value={
												attributes.rangeFormatSingle ??
												DEFAULT_RANGE_FORMAT_SINGLE
											}
											onChange={ ( rangeFormatSingle ) =>
												setAttributes( {
													rangeFormatSingle,
												} )
											}
											help={ __(
												'Used when start and end are the same. Tokens: {start}, {end}, {total}, {count}',
												'blockish'
											) }
											__nextHasNoMarginBottom={ true }
										/>
									</>
								) }
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
								title={ __( 'Query Total', 'blockish' ) }
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
