import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/components';
import { layout, header } from '@wordpress/icons';
import { getDashboardUrl, navigateToUrl } from '../library/navigation';

const FILTERS = [
	{ key: 'template', label: __( 'Templates', 'blockish' ), icon: layout },
	{ key: 'part', label: __( 'Parts', 'blockish' ), icon: header },
];

function BrandMark( { size = 28 } ) {
	return (
		<svg
			width={ size }
			height={ size }
			viewBox="0 0 512 512"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			focusable="false"
		>
			<defs>
				<linearGradient id="blockishTbLogoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
					<stop offset="0%" stopColor="#3B5BDB" />
					<stop offset="100%" stopColor="#9B2CF3" />
				</linearGradient>
			</defs>
			<rect width="512" height="512" rx="112" ry="112" fill="url(#blockishTbLogoGrad)" />
			<rect x="112" y="112" width="118" height="118" rx="28" fill="#fff" />
			<rect x="282" y="112" width="118" height="118" rx="28" fill="#fff" />
			<rect x="112" y="282" width="118" height="118" rx="28" fill="#fff" />
			<rect x="282" y="282" width="118" height="118" rx="28" fill="#fff" />
		</svg>
	);
}

export default function Sidebar( { activeFilter, onFilter } ) {
	return (
		<aside className="blockish-tb-sidebar">
			<button
				type="button"
				className="blockish-tb-sidebar__brand"
				onClick={ () => navigateToUrl( getDashboardUrl() ) }
				aria-label={ __( 'Back to Blockish dashboard', 'blockish' ) }
			>
				<BrandMark size={ 28 } />
				<span className="blockish-tb-sidebar__brand-name">
					{ __( 'Blockish', 'blockish' ) }
				</span>
			</button>

			<nav className="blockish-tb-sidebar__nav" aria-label={ __( 'Theme Builder', 'blockish' ) }>
				{ FILTERS.map( ( item ) => (
					<button
						key={ item.key }
						type="button"
						className={
							'blockish-tb-sidebar__item' +
							( activeFilter === item.key ? ' is-active' : '' )
						}
						onClick={ () => onFilter( item.key ) }
					>
						<Icon icon={ item.icon } />
						{ item.label }
					</button>
				) ) }
			</nav>
		</aside>
	);
}
