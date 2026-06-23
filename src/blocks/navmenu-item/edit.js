import {
	useBlockProps,
	useInnerBlocksProps,
	RichText,
	BlockControls,
} from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { link, linkOff } from '@wordpress/icons';
import { useState, useEffect } from '@wordpress/element';
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

	const [ showLinkPopover, setShowLinkPopover ] = useState( () => ! hasRealLink );
	const [ popoverAnchor, setPopoverAnchor ] = useState( null );
	const [ linkPopoverAnchor, setLinkPopoverAnchor ] = useState( null );
	const entityKind = linkKind === 'post-type' ? 'postType' : linkKind;
	const { record } = useEntityRecord(
		entityKind || 'postType',
		linkType || 'page',
		linkId || 0
	);

	const [ isOpen, setIsOpen ] = useState( false );

	const { hasSubmenu, isSelectedOrHasSelectedChild } = useSelect(
		( select ) => {
			const { getBlockOrder, isBlockSelected, hasSelectedInnerBlock } =
				select( 'core/block-editor' );
			return {
				hasSubmenu: getBlockOrder( clientId ).length > 0,
				isSelectedOrHasSelectedChild:
					isBlockSelected( clientId ) ||
					hasSelectedInnerBlock( clientId, true ),
			};
		},
		[ clientId ]
	);

	useEffect( () => {
		setIsOpen( isSelectedOrHasSelectedChild );
	}, [ isSelectedOrHasSelectedChild ] );

	const isSubmenuOpen = hasSubmenu && isOpen;

	const blockProps = useBlockProps( {
		className: clsx( 'blockish-block-navmenu-item', {
			'has-submenu': hasSubmenu,
			'is-submenu-open': isSubmenuOpen,
		} ),
		ref: useMergeRefs( [ setPopoverAnchor ] ),
	} );

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
				hasRealLink={ hasRealLink }
				record={ record }
				setShowLinkPopover={ setShowLinkPopover }
				setLinkPopoverAnchor={ setLinkPopoverAnchor }
			/>
			<BlockControls group="block">
				<ToolbarGroup>
					<ToolbarButton
						icon={ hasRealLink ? link : linkOff }
						label={ __( 'Link', 'blockish' ) }
						isActive={ hasRealLink }
						onClick={ () => {
							setLinkPopoverAnchor( null );
							setShowLinkPopover( ( v ) => ! v );
						} }
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
					popoverAnchor={ linkPopoverAnchor || popoverAnchor }
					isAnchoredToSidebar={ !! linkPopoverAnchor }
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
				</a>
				{ hasSubmenu && (
					<button
						type="button"
						className="blockish-navmenu-submenu-toggle"
						aria-expanded={ isSubmenuOpen }
						aria-label={ __( 'Show submenu', 'blockish' ) }
						onClick={ () => setIsOpen( ( open ) => ! open ) }
					>
						<SubmenuIndicator />
					</button>
				) }
				{ hasSubmenu && <div { ...innerBlocksProps } /> }
			</div>
		</>
	);
}
