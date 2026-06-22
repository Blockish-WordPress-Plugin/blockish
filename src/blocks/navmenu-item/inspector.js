import {
	InspectorControls,
	LinkControl,
} from '@wordpress/block-editor';
import { TextControl, ToggleControl, TextareaControl } from '@wordpress/components';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

// Matches core/navigation-link's own Inspector — GutenKit's nav-menu-item
// has no typography/color "Item" style panel at all (that styling lives at
// the menu level only); the per-item sidebar is just Text / Link To / Open
// in New Tab / Description / Rel Attribute.
const Inspector = ( { attributes, setAttributes, advancedControls, hasSubmenu } ) => {
	const { BlockishControl, BlockishGroupControl, BlockishResponsiveControl } =
		window?.blockish?.controls;
	const { label, url, openInNewTab, linkId, linkKind, linkType, description, rel } = attributes;

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
								<TextControl
									label={ __( 'Text', 'blockish' ) }
									value={ label }
									onChange={ ( value ) => setAttributes( { label: value } ) }
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
									<LinkControl
										hasRichPreviews
										value={ {
											url: url && url !== '#' ? url : undefined,
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
								</div>
								<ToggleControl
									label={ __( 'Open in new tab', 'blockish' ) }
									checked={ !! openInNewTab }
									onChange={ ( value ) => setAttributes( { openInNewTab: value } ) }
									__nextHasNoMarginBottom
								/>
								<TextareaControl
									label={ __( 'Description', 'blockish' ) }
									value={ description }
									onChange={ ( value ) => setAttributes( { description: value } ) }
									help={ __( 'The description will be displayed in the menu if the current theme supports it.', 'blockish' ) }
									__nextHasNoMarginBottom
								/>
								<TextControl
									label={ __( 'Rel attribute', 'blockish' ) }
									value={ rel }
									onChange={ ( value ) => setAttributes( { rel: value } ) }
									help={ __( 'The relationship of the linked URL as space-separated link types.', 'blockish' ) }
									__next40pxDefaultSize
									__nextHasNoMarginBottom
								/>
							</BlockishControl>
						) }
						{ tabName === 'style' && hasSubmenu && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Submenu Indicator', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Icon Size', 'blockish' ) }
									slug="subMenuIndicatorIconSize"
									left="60px"
								/>
								<BlockishResponsiveControl
									type="BlockishRangeUnit"
									label={ __( 'Left Spacing', 'blockish' ) }
									slug="subMenuIndicatorLeftSpacing"
									left="75px"
								/>
								<BlockishGroupControl
									type="BlockishBorder"
									label={ __( 'Border', 'blockish' ) }
									slug="subMenuIndicatorBorder"
								/>
								<BlockishResponsiveControl
									type="BlockishSpacingSizes"
									label={ __( 'Padding', 'blockish' ) }
									slug="subMenuIndicatorPadding"
									left="52px"
								/>
								<BlockishResponsiveControl
									type="BlockishBorderRadius"
									label={ __( 'Border Radius', 'blockish' ) }
									slug="subMenuIndicatorBorderRadius"
									left="44px"
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
