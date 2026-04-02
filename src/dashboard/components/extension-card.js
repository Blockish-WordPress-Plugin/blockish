import { __ } from '@wordpress/i18n';
import {
	Button,
	Card,
	CardBody,
	Flex,
	FormToggle,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { settingsIcon } from '../../components/icons/block-icons';

export default function ExtensionCard({ extension, isSaving, onToggle, onOpenSettings }) {
	const isActive = extension.status === 'active';

	return (
		<Card className={`blockish-block-card ${!isActive ? 'is-inactive' : ''}`} size="small">
			<CardBody>
				<VStack spacing={4}>
					<Flex justify="space-between" align="flex-start">
						<Heading className="blockish-block-card-title blockish-heading-tertiary" level={3}>
							{extension.name}
						</Heading>
						<div className="blockish-extension-controls">
							<FormToggle
								className="blockish-block-toggle"
								checked={isActive}
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
						</div>
					</Flex>
					<Text className="blockish-block-card-description blockish-text-muted">
						{extension.description}
					</Text>
					<Flex justify="space-between" align="center">
						<Text className={`blockish-extension-category-tag is-${extension.categoryKey || 'general'}`}>
							{extension.categoryLabel}
						</Text>
						<Text className={`blockish-status-badge ${isActive ? 'is-active' : 'is-inactive'}`}>
							{isActive ? __('Active', 'blockish') : __('Inactive', 'blockish')}
						</Text>
					</Flex>
				</VStack>
			</CardBody>
		</Card>
	);
}
