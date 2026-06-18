import {
	useBlockProps,
	RichText,
	BlockControls,
	__experimentalLinkControl as LinkControl,
} from '@wordpress/block-editor';
import { ToolbarButton, Popover } from '@wordpress/components';
import { link, linkOff } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';
import './editor.scss';

export default function Edit( { attributes, setAttributes, advancedControls } ) {
	const { label, url, openInNewTab } = attributes;
	const [ showLinkPopover, setShowLinkPopover ] = useState( false );

	const blockProps = useBlockProps( {
		className: 'blockish-block-navmenu-item',
	} );

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				advancedControls={ advancedControls }
			/>
			<BlockControls group="block">
				<ToolbarButton
					icon={ url && url !== '#' ? link : linkOff }
					label={ __( 'Link', 'blockish' ) }
					isActive={ !! url && url !== '#' }
					onClick={ () => setShowLinkPopover( ( v ) => ! v ) }
				/>
			</BlockControls>
			{ showLinkPopover && (
				<Popover
					placement="bottom"
					onClose={ () => setShowLinkPopover( false ) }
					focusOnMount
				>
					<LinkControl
						value={ { url, opensInNewTab: openInNewTab } }
						onChange={ ( { url: newUrl, opensInNewTab } ) => {
							setAttributes( {
								url: newUrl || '#',
								openInNewTab: !! opensInNewTab,
							} );
						} }
					/>
				</Popover>
			) }
			<a
				{ ...blockProps }
				href={ url || '#' }
				onClick={ ( e ) => e.preventDefault() }
				rel={ openInNewTab ? 'noopener noreferrer' : undefined }
			>
				<RichText
					tagName="span"
					value={ label }
					onChange={ ( value ) => setAttributes( { label: value } ) }
					placeholder={ __( 'Menu Item', 'blockish' ) }
					allowedFormats={ [] }
				/>
			</a>
		</>
	);
}
