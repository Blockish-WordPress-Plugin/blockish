import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
	BlockControls,
} from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { link, linkOff } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { useMergeRefs } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEntityRecord } from '@wordpress/core-data';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import SubmenuIndicator from './submenu-indicator';
import LinkPopover from './link-popover';
import './editor.scss';

export default function Edit( { attributes, setAttributes, clientId, advancedControls, onReplace } ) {
	const { label, url, openInNewTab, linkId, linkKind, linkType } = attributes;
	const hasRealLink = !! url && url !== '#';

	// New items have no real link yet — open the LinkControl immediately
	// instead of leaving them sitting on a dead "#" until someone notices
	// the toolbar button (matches GutenKit's nav-menu-item creation flow).
	const [ showLinkPopover, setShowLinkPopover ] = useState( () => ! hasRealLink );
	const [ popoverAnchor, setPopoverAnchor ] = useState( null );

	// LinkControl reports kind as "post-type"/"taxonomy" (matches its own
	// suggestion API), but @wordpress/core-data's entity kind for posts and
	// pages is the camelCased "postType" — translate before looking it up.
	const entityKind = linkKind === 'post-type' ? 'postType' : linkKind;
	const { hasResolved, record } = useEntityRecord(
		entityKind || 'postType',
		linkType || 'page',
		linkId || 0
	);
	const isBrokenLink = !! linkId && hasResolved && ! record;

	const blockProps = useBlockProps( {
		className: clsx( 'blockish-block-navmenu-item', {
			'is-link-broken': isBrokenLink,
		} ),
		ref: useMergeRefs( [ setPopoverAnchor ] ),
	} );

	const hasSubmenu = useSelect(
		( select ) => select( 'core/block-editor' ).getBlockOrder( clientId ).length > 0,
		[ clientId ]
	);

	const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'blockish-block-navmenu-item-submenu-slot' },
		{
			allowedBlocks: [ 'blockish/navmenu-submenu' ],
			renderAppender: false,
			templateLock: false,
		}
	);

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				advancedControls={ advancedControls }
				hasSubmenu={ hasSubmenu }
			/>
			<BlockControls group="block">
				<ToolbarGroup>
					<ToolbarButton
						icon={ hasRealLink ? link : linkOff }
						label={ __( 'Link', 'blockish' ) }
						isActive={ hasRealLink }
						onClick={ () => setShowLinkPopover( ( v ) => ! v ) }
					/>
					{ ! hasSubmenu ? (
						<ToolbarButton
							label={ __( 'Add Submenu', 'blockish' ) }
							onClick={ () => {
								const submenu = createBlock( 'blockish/navmenu-submenu' );
								replaceInnerBlocks( clientId, [ submenu ] );
							} }
						>
							{ __( 'Add Submenu', 'blockish' ) }
						</ToolbarButton>
					) : (
						<ToolbarButton
							label={ __( 'Remove Submenu', 'blockish' ) }
							onClick={ () => replaceInnerBlocks( clientId, [] ) }
						>
							{ __( 'Remove Submenu', 'blockish' ) }
						</ToolbarButton>
					) }
				</ToolbarGroup>
			</BlockControls>
			{ showLinkPopover && (
				<LinkPopover
					url={ url }
					label={ label }
					openInNewTab={ openInNewTab }
					linkId={ linkId }
					linkKind={ linkKind }
					linkType={ linkType }
					setAttributes={ setAttributes }
					onReplace={ onReplace }
					clientId={ clientId }
					popoverAnchor={ popoverAnchor }
					setShowLinkPopover={ setShowLinkPopover }
					isEditingURL={ hasRealLink }
				/>
			) }
			<div { ...blockProps }>
				<a
					className="blockish-navmenu-item-link"
					href={ url || '#' }
					onClick={ ( e ) => e.preventDefault() }
					rel={ openInNewTab ? 'noopener noreferrer' : undefined }
				>
					<RichText
						tagName="span"
						identifier="label"
						value={ label }
						onChange={ ( value ) => setAttributes( { label: value } ) }
						withoutInteractiveFormatting
						placeholder={ __( 'Add Link', 'blockish' ) }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
						aria-label={ __( 'Navigation link text', 'blockish' ) }
					/>
					{ isBrokenLink && (
						<span
							className="blockish-navmenu-item-broken-link"
							title={ __( 'This link points to content that no longer exists.', 'blockish' ) }
						>
							{ __( 'Broken link', 'blockish' ) }
						</span>
					) }
					{ hasSubmenu && <SubmenuIndicator /> }
				</a>
				{ hasSubmenu && <div { ...innerBlocksProps } /> }
			</div>
		</>
	);
}
