import {
	InspectorControls,
	LinkControl,
} from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { getBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import LinkPreviewCard from './link-preview-card';

const Inspector = ( {
	attributes,
	setAttributes,
	advancedControls,
	hasRealLink,
	record,
	setShowLinkPopover,
	setLinkPopoverAnchor,
} ) => {
	const { BlockishControl, BlockishGroupControl, BlockishResponsiveControl } =
		window?.blockish?.controls;
	const { label, url, openInNewTab, linkId, linkKind, linkType, description, rel } = attributes;
	
	const isMegamenuAvailable = !!getBlockType('blockish-addon/megamenu');
	
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
								title={ __( 'Settings', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishControl
									type="TextControl"
									label={ __( 'Text', 'blockish' ) }
									slug="label"
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
								<div style={ { marginBottom: '16px' } }>
									<BlockishControl
										type="BlockishDivider"
									/>
									<p style={ { margin: '0 0 8px', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' } }>
										{ __( 'Link To', 'blockish' ) }
									</p>
									{ hasRealLink ? (
										<LinkPreviewCard
											url={ url }
											label={ label }
											linkId={ linkId }
											linkType={ linkType }
											record={ record }
											onClick={ ( anchor ) => {
												setLinkPopoverAnchor( anchor );
												setShowLinkPopover( true );
											} }
										/>
									) : (
										<LinkControl
											hasRichPreviews
											value={ {
												url: url ? url : undefined,
												title: label || undefined,
												opensInNewTab: openInNewTab,
												id: linkId || undefined,
												kind: linkKind || undefined,
												type: linkType || undefined,
											} }
											onChange={ ( { url: newUrl, opensInNewTab, id, kind, type, title } ) => {
												setAttributes( {
													url: newUrl || '#',
													openInNewTab: !! opensInNewTab,
													linkId: id || 0,
													linkKind: kind || '',
													linkType: type || '',
													...( ! label && { label: title || newUrl || '' } ),
												} );
											} }
											showSuggestions
											showInitialSuggestions
										/>
									) }
								</div>
								<BlockishControl
									type="BlockishToggle"
									label={ __( 'Open in new tab', 'blockish' ) }
									slug="openInNewTab"
									__nextHasNoMarginBottom
								/>
								<BlockishControl
									type="BlockishTextareaControl"
									label={ __( 'Description', 'blockish' ) }
									slug="description"
									help={ __( 'The description will be displayed in the menu if the current theme supports it.', 'blockish' ) }
									__nextHasNoMarginBottom
								/>
								<BlockishControl
									type="TextControl"
									label={ __( 'Rel attribute', 'blockish' ) }
									slug="rel"
									help={ __( 'The relationship of the linked URL as space-separated link types.', 'blockish' ) }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
								<BlockishControl type="BlockishDivider" />
								<BlockishControl
									type="BlockishIconPicker"
									label={ __( 'Icon', 'blockish' ) }
									slug="icon"
								/>
								{ attributes?.icon && (
									<BlockishControl
										type="BlockishToggleGroup"
										label={ __( 'Icon Position', 'blockish' ) }
										slug="iconPosition"
										options={ [
											{ value: 'left', label: __( 'Left', 'blockish' ) },
											{ value: 'right', label: __( 'Right', 'blockish' ) },
										] }
										left="60px"
									/>
								) }
							</BlockishControl>
						) }
						{ tabName === 'style' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Item', 'blockish' ) }
								initialOpen={ true }
								help={ __(
									'Override this single item — handy for turning the last item into a button (combine with the Advanced tab for background, border and padding).',
									'blockish'
								) }
							>
								<BlockishControl
									type="BlockishTab"
									tabs={ [
										{ name: 'text-normal', title: 'Normal' },
										{ name: 'text-hover', title: 'Hover' },
									] }
								>
									{ ( { name } ) => (
										<>
											{ name === 'text-normal' && (
												<BlockishControl
													type="BlockishColor"
													label={ __( 'Text Color', 'blockish' ) }
													slug="itemTextColor"
												/>
											) }
											{ name === 'text-hover' && (
												<BlockishControl
													type="BlockishColor"
													label={ __( 'Text Color', 'blockish' ) }
													slug="itemTextColorHover"
												/>
											) }
										</>
									) }
								</BlockishControl>
								<BlockishControl type="BlockishDivider" />
								<BlockishGroupControl
									type="BlockishTypography"
									label={ __( 'Typography', 'blockish' ) }
									slug="itemTypography"
								/>
								{ attributes?.icon && (
									<BlockishResponsiveControl
										type="BlockishRangeUnit"
										label={ __( 'Icon Size', 'blockish' ) }
										slug="iconSize"
										left="60px"
									/>
								) }
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
