import { __ } from '@wordpress/i18n';
import { Icon, __experimentalHeading as Heading, __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { SIDEBAR_MENUS } from '../utils';

export default function DashboardSidebar({ activeMenu, onMenuClick }) {
	return (
		<aside className="blockish-sidebar">
			<VStack className="blockish-sidebar-brand" spacing={0}>
				<Heading className="blockish-heading-secondary" level={2}>
					{__('Blockish', 'blockish')}
				</Heading>
				<Text className="blockish-text-muted">{__('Gutenberg Blocks', 'blockish')}</Text>
			</VStack>

			<nav className="blockish-sidebar-nav">
				{SIDEBAR_MENUS.map((menu) => (
					<button
						key={menu.key}
						type="button"
						className={menu.key === activeMenu ? 'is-active' : ''}
						onClick={() => onMenuClick(menu.key)}
					>
						<Icon icon={menu.icon} />
						<Text>{__(menu.label, 'blockish')}</Text>
					</button>
				))}
			</nav>
		</aside>
	);
}
