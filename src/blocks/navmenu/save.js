import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { getBreakpointClass, HamburgerIcon, CloseIcon, MobileLogo } from './shared';

export default function Save( { attributes } ) {
	const {
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

	const blockProps = useBlockProps.save( {
		className: clsx(
			'blockish-navmenu',
			getBreakpointClass( menuBreakpoint ),
			`hamburger-position-${ hamburgerIconPosition || 'right' }`,
			{
				'is-vertical': isVertical,
			}
		),
		'data-scroll-lock-offcanvas': scrollLockOffcanvas ? 'true' : 'false',
		'data-custom-breakpoint': menuBreakpoint === 'custom' ? menuCustomBreakpoint : '',
	} );

	// menuAnimation controls how dropdown submenus open (fadeInUp/transform/
	// transformPerspective/rotateY) — it's a per-item submenu reveal style,
	// not the offcanvas panel's own open/close transition (that's fixed).
	const innerBlocksProps = useInnerBlocksProps.save( {
		className: clsx( 'blockish-navmenu-nav', `menu-animation-${ menuAnimation || 'none' }` ),
	} );

	return (
		<div { ...blockProps }>
			<button
				type="button"
				className="blockish-navmenu-hamburger"
				aria-expanded="false"
				aria-label={ __( 'Toggle menu', 'blockish' ) }
			>
				<HamburgerIcon />
			</button>
			<div className="blockish-navmenu-overlay" />
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
					>
						<CloseIcon />
					</button>
				</div>
				<nav { ...innerBlocksProps } aria-label={ __( 'Navigation', 'blockish' ) } />
			</div>
		</div>
	);
}
