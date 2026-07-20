import { __ } from '@wordpress/i18n';
import DashboardHome from './dashboard-home';
import BlocksPage from './blocks-page';
import ExtensionsPage from './extensions-page';
import PlaceholderSection from './placeholder-section';
import SettingsPage from './settings-page';
import IntegrationsPage from './integrations-page';
import AddonsPage from './addons-page';
import McpConfigPage from './mcp-config-page';

import TemplateBuilderPage from './template-builder/template-builder-page';

export default function ContentArea({
	activeMenu,
	data,
	isSaving,
	onNavigate,
	onToggleBlock,
	onSetAllBlockStatus,
	onToggleExtension,
	onSetAllExtensionStatus,
	onSaveExtensionSettings,
}) {
	if (activeMenu === 'dashboard') {
		return <DashboardHome data={data} onNavigate={onNavigate} />;
	}

	if (activeMenu === 'template-builder') {
		return <TemplateBuilderPage data={data} />;
	}

	if (activeMenu === 'blocks') {
		return (
			<BlocksPage
				blocks={data?.blocks}
				isSaving={isSaving}
				onToggleBlock={onToggleBlock}
				onSetAllBlockStatus={onSetAllBlockStatus}
			/>
		);
	}

	if (activeMenu === 'settings') {
		return <SettingsPage />;
	}

	if (activeMenu === 'extensions') {
		return (
			<ExtensionsPage
				extensions={data?.extensions}
				isSaving={isSaving}
				onToggleExtension={onToggleExtension}
				onSetAllExtensionStatus={onSetAllExtensionStatus}
				onSaveExtensionSettings={onSaveExtensionSettings}
			/>
		);
	}

	if (activeMenu === 'integrations') {
		return <IntegrationsPage />;
	}

	if (activeMenu === 'addons') {
		return <AddonsPage blocks={data?.blocks} extensions={data?.extensions} />;
	}

	if (activeMenu === 'mcp-config') {
		return <McpConfigPage />;
	}

	return (
		<PlaceholderSection
			title={__('License', 'blockish')}
			description={__('Manage your license key and update eligibility.', 'blockish')}
		/>
	);
}
