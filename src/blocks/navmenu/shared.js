import getLinkProps from '../../helpers/get-link-props';

export const getBreakpointClass = ( menuBreakpoint ) =>
	`is-breakpoint-${ menuBreakpoint || 'tablet' }`;

export const MobileLogo = ( { mobileLogo, mobileLogoLinkType, mobileLogoCustomLink } ) => {
	if ( ! mobileLogo?.url ) {
		return null;
	}

	const linkProps =
		mobileLogoLinkType === 'custom'
			? getLinkProps( mobileLogoCustomLink )
			: { href: '/' };

	return (
		<a className="blockish-navmenu-mobile-logo" { ...( linkProps || { href: '#' } ) }>
			<img src={ mobileLogo.url } alt={ mobileLogo.alt || '' } />
		</a>
	);
};

export const HamburgerIcon = () => (
	<>
		<span className="blockish-navmenu-hamburger-bar" />
		<span className="blockish-navmenu-hamburger-bar" />
		<span className="blockish-navmenu-hamburger-bar" />
	</>
);

export const CloseIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		focusable="false"
	>
		<path
			d="M1 1L15 15M15 1L1 15"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
		/>
	</svg>
);
