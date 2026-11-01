import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {
	Button,
	Card,
	CardBody,
	Flex,
	FormToggle,
	Modal,
	Icon,
	Notice,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { settingsIcon } from '../../components/icons/block-icons';
import { lock } from '@wordpress/icons';

const THEME_BUILDER_SLUG = 'theme-builder';

export default function ExtensionCard({ extension, isSaving, onToggle, onOpenSettings, onNavigate }) {
	const isUnavailable = Boolean(extension.unavailable);
	const isActive = extension.status === 'active' && !isUnavailable;
	const isLocked = extension.status === 'locked';
	const showLockControl = isLocked || isUnavailable;
	const migration = extension.themeBuilderMigration || null;
	const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
	const [isUnavailableModalOpen, setIsUnavailableModalOpen] = useState(false);
	const [isMigrating, setIsMigrating] = useState(false);
	const [migrationNotice, setMigrationNotice] = useState(null);

	const themeBuilderApiPath =
		window.blockishDashboardData?.themeBuilderApiPath || '/blockish/v1/theme-builder';

	const canMigrate =
		extension.slug === THEME_BUILDER_SLUG &&
		isUnavailable &&
		migration &&
		migration.total > 0;

	const openLockModal = () => {
		if (isLocked) {
			setIsPremiumModalOpen(true);
			return;
		}
		if (isUnavailable) {
			setIsUnavailableModalOpen(true);
		}
	};

	const handleMigrate = async () => {
		setIsMigrating(true);
		setMigrationNotice(null);

		try {
			const response = await apiFetch({
				path: `${themeBuilderApiPath}/migrate-to-site-editor`,
				method: 'POST',
			});

			const migratedCount = Array.isArray(response?.migrated) ? response.migrated.length : 0;
			const siteEditorUrl = response?.siteEditorUrl || migration?.siteEditorUrl;

			setMigrationNotice({
				status: response?.status === 'fail' ? 'error' : 'success',
				message:
					response?.message?.[0] ||
					(migratedCount > 0
						? __('Templates and parts moved to Site Editor.', 'blockish')
						: __('Nothing to migrate.', 'blockish')),
				siteEditorUrl,
			});
		} catch (error) {
			setMigrationNotice({
				status: 'error',
				message: error?.message || __('Migration failed.', 'blockish'),
			});
		} finally {
			setIsMigrating(false);
		}
	};

	const badgeLabel = isLocked
		? __('Locked', 'blockish')
		: isUnavailable
			? __('Unavailable', 'blockish')
			: isActive
				? __('Active', 'blockish')
				: __('Inactive', 'blockish');

	const badgeClass = isLocked || isUnavailable
		? 'is-locked'
		: isActive
			? 'is-active'
			: 'is-inactive';

	return (
		<>
			<Card
				className={`blockish-block-card ${!isActive && !isUnavailable ? 'is-inactive' : ''} ${isLocked ? 'is-locked-card' : ''} ${isUnavailable ? 'is-unavailable-card' : ''}`}
				size="small"
				onClick={() => {
					if (showLockControl) {
						openLockModal();
					}
				}}
				style={{ cursor: showLockControl ? 'pointer' : 'default' }}
			>
				<div className={`blockish-status-badge ${badgeClass}`}>
					{badgeLabel}
				</div>
				<CardBody>
				<VStack spacing={4}>
					<Flex justify="space-between" align="flex-start">
						<Heading className="blockish-block-card-title blockish-heading-tertiary" level={3}>
							{extension.name}
						</Heading>
						<div className="blockish-extension-controls">
							{showLockControl ? (
								<Button
									className="blockish-lock-icon"
									icon={lock}
									label={
										isUnavailable
											? __('This extension is not available on block themes', 'blockish')
											: __('This extension requires a premium addon', 'blockish')
									}
									onClick={(event) => {
										event.stopPropagation();
										openLockModal();
									}}
								/>
							) : (
								<>
									<FormToggle
										className="blockish-block-toggle"
										checked={isActive}
										disabled={isSaving}
										onChange={(event) => onToggle(extension.slug, event.target.checked)}
									/>
									{extension.hasSpecialControls && (
										<Button
											className="blockish-configure-icon-button"
											variant="tertiary"
											icon={settingsIcon}
											label={__('Configure extension', 'blockish')}
											showTooltip
											disabled={!isActive || isSaving}
											onClick={() => onOpenSettings(extension.slug)}
										/>
									)}
								</>
							)}
						</div>
					</Flex>
					<Text className="blockish-block-card-description blockish-text-muted">
						{extension.description}
					</Text>
					<Flex justify="space-between" align="center" style={{ marginTop: 'auto', paddingTop: '16px' }}>
						<Text className="blockish-category-badge">{extension.categoryLabel}</Text>
						<Text className="blockish-addon-badge">{extension.sourceName || __('Blockish', 'blockish')}</Text>
					</Flex>
				</VStack>
			</CardBody>
		</Card>

		{isUnavailableModalOpen && (
			<Modal
				title={extension.name}
				onRequestClose={() => {
					setIsUnavailableModalOpen(false);
					setMigrationNotice(null);
				}}
				className="blockish-unavailable-extension-modal"
				style={{ maxWidth: '480px' }}
			>
				<VStack spacing={4}>
					<Text>
						{extension.unavailableReason ||
							__('This extension is not available with your current theme.', 'blockish')}
					</Text>

					{canMigrate && (
						<VStack spacing={3}>
							<Text className="blockish-text-muted">
								{__(
									'You have Theme Builder templates or parts that can be copied into the Site Editor.',
									'blockish'
								)}
							</Text>
							<Flex gap={2} wrap>
								<Button
									variant="primary"
									isBusy={isMigrating}
									disabled={isMigrating}
									onClick={handleMigrate}
								>
									{__('Move to Site Editor', 'blockish')}
								</Button>
								{migration?.siteEditorUrl && (
									<Button variant="secondary" href={migration.siteEditorUrl}>
										{__('Open Site Editor', 'blockish')}
									</Button>
								)}
							</Flex>
						</VStack>
					)}

					{!canMigrate && migration?.siteEditorUrl && (
						<Button variant="secondary" href={migration.siteEditorUrl}>
							{__('Open Site Editor', 'blockish')}
						</Button>
					)}

					{migrationNotice && (
						<Notice
							status={migrationNotice.status === 'error' ? 'error' : 'success'}
							isDismissible
							onRemove={() => setMigrationNotice(null)}
						>
							{migrationNotice.message}
							{migrationNotice.siteEditorUrl && migrationNotice.status === 'success' && (
								<>
									{' '}
									<a href={migrationNotice.siteEditorUrl}>
										{__('Open Site Editor', 'blockish')}
									</a>
								</>
							)}
						</Notice>
					)}
				</VStack>
			</Modal>
		)}

		{isPremiumModalOpen && (
			<Modal
				title={false}
				onRequestClose={() => setIsPremiumModalOpen(false)}
				className="blockish-locked-feature-modal"
				style={{ maxWidth: '420px', padding: 0 }}
			>
				<VStack spacing={5} style={{ padding: '0 24px 32px', textAlign: 'center' }}>
					<Flex justify="center" style={{ marginBottom: '8px' }}>
						<div style={{
							background: 'var(--wp-admin-theme-color, #2271b1)',
							color: '#fff',
							padding: '16px',
							borderRadius: '50%',
							display: 'inline-flex',
							boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
						}}>
							<Icon icon={lock} size={36} />
						</div>
					</Flex>

					<Heading level={2} style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
						{__('Unlock Premium Feature', 'blockish')}
					</Heading>

					<Text variant="muted" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
						{__('The ', 'blockish')}
						<strong style={{ color: 'var(--wp-admin-theme-color, #2271b1)' }}>{extension.name}</strong>
						{__(' extension is a premium feature available exclusively in the ', 'blockish')}
						<strong>{extension.sourceName || __('Blockish', 'blockish')}</strong>
						{__(' addon. Upgrade now to enhance your website building experience!', 'blockish')}
					</Text>

					<Flex justify="center" gap={3} style={{ marginTop: '16px' }}>
						<Button
							variant="secondary"
							onClick={() => setIsPremiumModalOpen(false)}
							style={{ padding: '8px 16px' }}
						>
							{__('Maybe Later', 'blockish')}
						</Button>
						<Button
							variant="primary"
							style={{ padding: '8px 24px' }}
							onClick={() => {
								setIsPremiumModalOpen(false);
								const proUrl = window.blockishDashboardData?.links?.pricing || 'https://blockish.wowdevs.com/pricing/';
								window.open(proUrl, '_blank');
							}}
						>
							{__('Get Pro', 'blockish')}
						</Button>
					</Flex>
				</VStack>
			</Modal>
		)}
		</>
	);
}
