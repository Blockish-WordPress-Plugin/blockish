import { useBlockProps, useInnerBlocksProps, store as blockEditorStore } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import Branding from './branding';
import './editor.scss';

export default function Edit( props ) {
	const { attributes, clientId } = props;
	const {
		syncWithMenu,
		offcanvasAnimation,
		offcanvasSide,
		hamburgerAlign,
		hamburgerIcon,
		headerType,
		headerText,
		headerImage,
	} = attributes;

	const { BlockishIcon } = window?.blockish?.helpers || {};
	// A picked icon replaces the default three-bar hamburger.
	const hamburgerContent = hamburgerIcon && BlockishIcon ? (
		<BlockishIcon icon={ hamburgerIcon } width={ 24 } height={ 24 } fill="currentColor" />
	) : (
		<>
			<span></span>
			<span></span>
			<span></span>
		</>
	);

	const [ isOpen, setIsOpen ] = useState( false );

	// Find the sibling navmenu under the shared parent and read its items.
	// A serialized signature of those items' attributes lets the sync effect
	// depend on a primitive (stable across renders) instead of fresh array
	// references, so it only fires when the source actually changes.
	const { sourceItems, sourceSig } = useSelect(
		( select ) => {
			const { getBlockRootClientId, getBlocks } = select( blockEditorStore );
			const parentId = getBlockRootClientId( clientId );
			const siblings = parentId ? getBlocks( parentId ) : [];
			const navmenu = siblings.find( ( block ) => block.name === 'blockish/navmenu' );
			const items = navmenu
				? navmenu.innerBlocks.filter( ( block ) => block.name === 'blockish/navmenu-item' )
				: [];

			return {
				sourceItems: items,
				sourceSig: JSON.stringify( items.map( ( item ) => item.attributes ) ),
			};
		},
		[ clientId ]
	);

	const currentSig = useSelect(
		( select ) =>
			JSON.stringify(
				select( blockEditorStore )
					.getBlocks( clientId )
					.map( ( block ) => block.attributes )
			),
		[ clientId ]
	);

	const { replaceInnerBlocks } = useDispatch( blockEditorStore );

	useEffect( () => {
		if ( ! syncWithMenu || sourceSig === currentSig ) {
			return;
		}

		replaceInnerBlocks(
			clientId,
			sourceItems.map( ( item ) => createBlock( 'blockish/navmenu-item', item.attributes ) ),
			false
		);
	}, [ syncWithMenu, sourceSig, currentSig, clientId, replaceInnerBlocks ] );

	const blockProps = useBlockProps( {
		className: clsx(
			'blockish-offcanvas',
			`offcanvas-animation-${ offcanvasAnimation || 'slide' }`,
			`offcanvas-side-${ offcanvasSide || 'left' }`,
			`hamburger-align-${ hamburgerAlign || 'left' }`,
			{ 'is-open': isOpen }
		),
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'blockish-offcanvas-nav' },
		{
			allowedBlocks: [ 'blockish/navmenu-item' ],
			// Synced items are a locked mirror; turn sync off to edit freely.
			templateLock: syncWithMenu ? 'all' : false,
			orientation: 'vertical',
		}
	);

	return (
		<div { ...blockProps }>
			<Inspector { ...props } />
			<button
				type="button"
				className={ clsx( 'blockish-offcanvas-hamburger', {
					'has-icon': !! hamburgerIcon,
				} ) }
				aria-label={ __( 'Toggle menu', 'blockish' ) }
				onClick={ () => setIsOpen( ( open ) => ! open ) }
			>
				{ hamburgerContent }
			</button>
			<div
				className="blockish-offcanvas-overlay"
				aria-hidden="true"
				onClick={ () => setIsOpen( false ) }
			/>
			<div className="blockish-offcanvas-panel">
				<div className="blockish-offcanvas-header">
					<div className="blockish-offcanvas-branding">
						<Branding
							headerType={ headerType }
							headerText={ headerText }
							headerImage={ headerImage }
						/>
					</div>
					<button
						type="button"
						className="blockish-offcanvas-close"
						aria-label={ __( 'Close menu', 'blockish' ) }
						onClick={ () => setIsOpen( false ) }
					>
						&times;
					</button>
				</div>
				<nav { ...innerBlocksProps } aria-label={ __( 'Mobile navigation', 'blockish' ) } />
			</div>
		</div>
	);
}
