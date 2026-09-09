import { useBlockProps, useInnerBlocksProps, store as blockEditorStore } from '@wordpress/block-editor';
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { cloneBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import Branding from './branding';
import './editor.scss';

const CLOSE_MS = 420;

/** Stable signature of a block tree (name + attrs + nested children). */
function blockTreeSig( blocks ) {
	return blocks.map( ( block ) => ( {
		name: block.name,
		attributes: block.attributes,
		innerBlocks: blockTreeSig( block.innerBlocks || [] ),
	} ) );
}

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
	const [ isClosing, setIsClosing ] = useState( false );
	const closeTimerRef = useRef( null );

	const openPanel = useCallback( () => {
		if ( closeTimerRef.current ) {
			window.clearTimeout( closeTimerRef.current );
			closeTimerRef.current = null;
		}
		setIsClosing( false );
		setIsOpen( true );
	}, [] );

	const closePanel = useCallback( () => {
		if ( closeTimerRef.current ) {
			return;
		}
		setIsOpen( ( open ) => {
			if ( ! open ) {
				return open;
			}
			setIsClosing( true );
			closeTimerRef.current = window.setTimeout( () => {
				setIsOpen( false );
				setIsClosing( false );
				closeTimerRef.current = null;
			}, CLOSE_MS );
			return open;
		} );
	}, [] );

	useEffect(
		() => () => {
			if ( closeTimerRef.current ) {
				window.clearTimeout( closeTimerRef.current );
			}
		},
		[]
	);

	// Find the sibling navmenu under the shared parent and read its items.
	// Signature includes nested submenu trees so sync fires when children change.
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
				sourceSig: JSON.stringify( blockTreeSig( items ) ),
			};
		},
		[ clientId ]
	);

	const currentSig = useSelect(
		( select ) =>
			JSON.stringify(
				blockTreeSig( select( blockEditorStore ).getBlocks( clientId ) )
			),
		[ clientId ]
	);

	const { replaceInnerBlocks } = useDispatch( blockEditorStore );

	useEffect( () => {
		if ( ! syncWithMenu || sourceSig === currentSig ) {
			return undefined;
		}

		const timer = window.setTimeout( () => {
			replaceInnerBlocks(
				clientId,
				sourceItems.map( ( item ) => cloneBlock( item ) ),
				false
			);
		}, 250 );

		return () => window.clearTimeout( timer );
	}, [ syncWithMenu, sourceSig, currentSig, sourceItems, clientId, replaceInnerBlocks ] );

	const blockProps = useBlockProps( {
		className: clsx(
			'blockish-offcanvas',
			`offcanvas-animation-${ offcanvasAnimation || 'slide' }`,
			`offcanvas-side-${ offcanvasSide || 'left' }`,
			`hamburger-align-${ hamburgerAlign || 'left' }`,
			{ 'is-open': isOpen, 'is-closing': isClosing }
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
				aria-expanded={ isOpen && ! isClosing }
				onClick={ () => {
					if ( isOpen && ! isClosing ) {
						closePanel();
					} else if ( ! isOpen ) {
						openPanel();
					}
				} }
			>
				{ hamburgerContent }
			</button>
			<div
				className="blockish-offcanvas-overlay"
				aria-hidden="true"
				onClick={ closePanel }
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
						onClick={ closePanel }
					>
						&times;
					</button>
				</div>
				<nav { ...innerBlocksProps } aria-label={ __( 'Mobile navigation', 'blockish' ) } />
			</div>
		</div>
	);
}
