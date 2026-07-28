import { __ } from '@wordpress/i18n';
import {
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { orderSidebarMenus, SIDEBAR_MENUS } from '../utils';

export default function DashboardSidebar( { activeMenu, onMenuClick } ) {
	const menus = orderSidebarMenus(
		applyFilters( 'blockish.dashboard.sidebarMenus', SIDEBAR_MENUS )
	);

	return (
		<aside className="blockish-sidebar">
			<VStack className="blockish-sidebar-brand" spacing={ 0 }>
				<Heading className="blockish-heading-secondary" level={ 2 }>
					{ __( 'Blockish', 'blockish' ) }
				</Heading>
				<Text className="blockish-text-muted">
					{ __( 'Gutenberg Blocks', 'blockish' ) }
				</Text>
			</VStack>

			<nav
				className="blockish-sidebar-nav"
				aria-label={ __( 'Blockish dashboard', 'blockish' ) }
			>
				{ menus.map( ( menu ) => {
					const isAddons = menu.key === 'addons';
					const isActive = menu.key === activeMenu;

					return (
						<button
							key={ menu.key }
							type="button"
							className={ [
								'blockish-sidebar-nav-item',
								isActive ? 'is-active' : '',
								menu.hint ? 'has-hint' : '',
								isAddons ? 'is-addons' : '',
							]
								.filter( Boolean )
								.join( ' ' ) }
							onClick={ () => {
								if ( typeof menu.callback === 'function' ) {
									menu.callback( menu, onMenuClick );
									return;
								}
								onMenuClick( menu.key );
							} }
						>
							<span className="blockish-sidebar-nav-icon" aria-hidden="true">
								{ menu.icon }
							</span>
							<span className="blockish-sidebar-nav-copy">
								<Text className="blockish-sidebar-nav-label">
									{ __( menu.label, 'blockish' ) }
								</Text>
								{ menu.hint ? (
									<Text className="blockish-sidebar-nav-hint">
										{ __( menu.hint, 'blockish' ) }
									</Text>
								) : null }
							</span>
						</button>
					);
				} ) }
			</nav>
		</aside>
	);
}
