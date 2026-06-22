import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Placeholder, Button } from '@wordpress/components';
import { menu as menuIcon } from '@wordpress/icons';
import { useState } from '@wordpress/element';
import { useResizeObserver } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import { getBreakpointClass, HamburgerIcon, CloseIcon, MobileLogo } from './shared';
import './editor.scss';

// Matches GutenKit's own placeholder behavior: fetch real top-level pages
// and link the starter items to them, instead of inventing fake "About" /
// "Contact" items with no real destination.
const fetchPageItems = async () => {
	const pages = await apiFetch( { path: '/wp/v2/pages?per_page=5&parent=0' } );

	return pages.map( ( page ) => [
		'blockish/navmenu-item',
		{
			label: page?.title?.rendered || page?.slug,
			url: page?.link,
			linkId: page?.id,
			linkKind: 'post-type',
			linkType: 'page',
		},
	] );
};

const FALLBACK_ITEM = [ 'blockish/navmenu-item', { label: __( 'Home', 'blockish' ), url: '/' } ];

export default function Edit( props ) {
	const { attributes, setAttributes, clientId } = props;
	const {
		hasStarted,
		isVertical,
		menuBreakpoint,
		menuAnimation,
		scrollLockOffcanvas,
		menuCustomBreakpoint,
		hamburgerIconPosition,
		mobileLogo,
		mobileLogoLinkType,
		mobileLogoCustomLink,
	} = attributes;

	const [ isOffcanvasOpen, setIsOffcanvasOpen ] = useState( false );

	// Tablet/Mobile work in the editor for free via a real CSS @media query
	// (the canvas iframe's actual width). "Custom" has no fixed breakpoint
	// to write a static @media query for, and view.js (which handles this on
	// the frontend with matchMedia) doesn't run inside the editor — so it
	// needs its own width measurement here to behave the same way.
	const [ resizeListener, { width } ] = useResizeObserver();
	const isCustomCollapsed =
		menuBreakpoint === 'custom' && !! width && width <= menuCustomBreakpoint;

	const hasChildBlocks = useSelect(
		( select ) => select( blockEditorStore ).getBlockOrder( clientId ).length > 0,
		[ clientId ]
	);
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );

	const blockProps = useBlockProps( {
		className: clsx(
			'blockish-navmenu',
			getBreakpointClass( menuBreakpoint ),
			`hamburger-position-${ hamburgerIconPosition || 'right' }`,
			{
				'is-vertical': isVertical,
				'is-offcanvas-open': isOffcanvasOpen,
				'is-custom-collapsed': isCustomCollapsed,
			}
		),
		'data-scroll-lock-offcanvas': scrollLockOffcanvas ? 'true' : 'false',
		'data-custom-breakpoint': menuBreakpoint === 'custom' ? menuCustomBreakpoint : '',
	} );

	// menuAnimation controls how dropdown submenus open (fadeInUp/transform/
	// transformPerspective/rotateY) — it's a per-item submenu reveal style,
	// not the offcanvas panel's own open/close transition (that's fixed).
	const innerBlocksProps = useInnerBlocksProps(
		{ className: clsx( 'blockish-navmenu-nav', `menu-animation-${ menuAnimation || 'none' }` ) },
		{ orientation: 'horizontal' }
	);

	// Existing saved menus already have child blocks and should never show
	// the placeholder again just because they predate the `hasStarted` flag.
	if ( ! hasStarted && ! hasChildBlocks ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon={ menuIcon }
					label={ __( 'Nav Menu', 'blockish' ) }
					instructions={ __( 'Start with a blank menu and add your own items.', 'blockish' ) }
				>
					<Button
						variant="primary"
						onClick={ async () => {
							let items;

							try {
								items = await fetchPageItems();
							} catch ( error ) {
								items = [];
							}

							if ( ! items.length ) {
								items = [ FALLBACK_ITEM ];
							}

							replaceInnerBlocks(
								clientId,
								items.map( ( [ name, itemAttributes ] ) =>
									createBlock( name, itemAttributes )
								)
							);
							setAttributes( { hasStarted: true } );
						} }
					>
						{ __( 'Start Blank', 'blockish' ) }
					</Button>
				</Placeholder>
			</div>
		);
	}

	return (
		<div { ...blockProps }>
			{ resizeListener }
			<Inspector { ...props } />
			<button
				type="button"
				className="blockish-navmenu-hamburger"
				aria-expanded={ isOffcanvasOpen }
				aria-label={ __( 'Toggle menu', 'blockish' ) }
				onClick={ () => setIsOffcanvasOpen( ( open ) => ! open ) }
			>
				<HamburgerIcon />
			</button>
			<div
				className="blockish-navmenu-overlay"
				onClick={ () => setIsOffcanvasOpen( false ) }
			/>
			<div className="blockish-navmenu-wrapper">
				<div className="blockish-navmenu-wrapper-header">
					<MobileLogo
						mobileLogo={ mobileLogo }
						mobileLogoLinkType={ mobileLogoLinkType }
						mobileLogoCustomLink={ mobileLogoCustomLink }
					/>
					<button
						type="button"
						className="blockish-navmenu-close"
						aria-label={ __( 'Close menu', 'blockish' ) }
						onClick={ () => setIsOffcanvasOpen( false ) }
					>
						<CloseIcon />
					</button>
				</div>
				<nav { ...innerBlocksProps } aria-label={ __( 'Navigation', 'blockish' ) } />
			</div>
		</div>
	);
}
