import {
	useBlockProps,
	RichText,
	BlockControls,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { link, linkOff } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { useMergeRefs } from '@wordpress/compose';
import { useEntityRecord } from '@wordpress/core-data';
import { getBlockType } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import LinkPopover from './link-popover';
import './editor.scss';

export default function Edit( { attributes, setAttributes, clientId, advancedControls, onReplace, isSelected } ) {
	const { label, url, openInNewTab, linkId, linkKind, linkType, icon, iconPosition } = attributes;
	const hasRealLink = !!url;
	
	const isMegamenuAvailable = !!getBlockType('blockish-addon/megamenu');

	const { BlockishIcon } = window?.blockish?.helpers || {};
	const iconMarkup = icon && BlockishIcon ? (
		<span className="blockish-navmenu-item-icon" aria-hidden="true">
			<BlockishIcon icon={ icon } width={ 18 } height={ 18 } fill="currentColor" />
		</span>
	) : null;

	const [ showLinkPopover, setShowLinkPopover ] = useState( () => ! hasRealLink );
	const [ popoverAnchor, setPopoverAnchor ] = useState( null );
	const [ linkPopoverAnchor, setLinkPopoverAnchor ] = useState( null );
	const entityKind = linkKind === 'post-type' ? 'postType' : linkKind;
	const { record } = useEntityRecord(
		entityKind || 'postType',
		linkType || 'page',
		linkId || 0
	);

	const hasChildren = useSelect( ( select ) => {
		const { getBlockOrder } = select( 'core/block-editor' );
		return getBlockOrder( clientId ).length > 0;
	}, [ clientId ] );

	const { insertBlock } = useDispatch( 'core/block-editor' );

	const blockProps = useBlockProps( {
		className: clsx( 'blockish-block-navmenu-item' ),
		ref: useMergeRefs( [ setPopoverAnchor ] ),
	} );

	const innerBlocksProps = useInnerBlocksProps( 
		{ 
			className: clsx( 'blockish-navmenu-submenu-wrapper', {
				'is-empty': ! hasChildren
			} )
		}, 
		{
			allowedBlocks: ['blockish-addon/megamenu'],
			renderAppender: false,
		} 
	);

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				advancedControls={ advancedControls }
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
					{ isMegamenuAvailable && ! hasChildren && (
						<ToolbarButton
							title={ __( 'Add Megamenu', 'blockish' ) }
							onClick={ () => {
								const { createBlock } = wp.blocks;
								insertBlock( createBlock( 'blockish-addon/megamenu' ), 0, clientId );
							} }
						>
							{ __( 'Add Megamenu', 'blockish' ) }
						</ToolbarButton>
					) }
				</ToolbarGroup>
			</BlockControls>
			{ isSelected && showLinkPopover && (
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
					className={ clsx( 'blockish-navmenu-item-link', {
						'has-icon': !! icon,
						'icon-position-right': iconPosition === 'right',
					} ) }
					href={ url }
					onClick={ ( e ) => e.preventDefault() }
					rel={ openInNewTab ? 'noopener noreferrer' : undefined }
				>
					{ iconPosition !== 'right' && iconMarkup }
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
					{ iconPosition === 'right' && iconMarkup }
				</a>
				{ isMegamenuAvailable && (
					<div { ...innerBlocksProps } />
				) }
			</div>
		</>
	);
}
