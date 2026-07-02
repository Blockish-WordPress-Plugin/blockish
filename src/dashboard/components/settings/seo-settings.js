import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import {
	Button,
	Card,
	CardBody,
	Flex,
	Modal,
	TextareaControl,
	__experimentalHeading as Heading,
	__experimentalText as Text,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { settingsIcon } from '../../../components/icons/block-icons';

export default function SeoSettings({
	seoSettings,
	isLoading,
	isSaving,
	onUpdateSeoSettings,
}) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [description, setDescription] = useState('');

	useEffect(() => {
		if (seoSettings?.global_meta_description !== undefined) {
			setDescription(seoSettings.global_meta_description);
		}
	}, [seoSettings]);

	const handleSave = () => {
		if (onUpdateSeoSettings) {
			onUpdateSeoSettings({ global_meta_description: description });
		}
		setIsModalOpen(false);
	};

	return (
		<>
			<Card className="blockish-block-card" size="small">
				<CardBody>
					<Flex justify="space-between" align="flex-start">
						<div>
							<Heading className="blockish-block-card-title blockish-heading-tertiary" level={3}>
								{__('SEO Settings', 'blockish')}
							</Heading>
							<Text className="blockish-block-card-description blockish-text-muted">
								{__('Configure global SEO settings like the homepage meta description.', 'blockish')}
							</Text>
						</div>
						<Button
							className="blockish-configure-icon-button"
							variant="tertiary"
							icon={settingsIcon}
							label={__('Manage SEO', 'blockish')}
							onClick={() => setIsModalOpen(true)}
							showTooltip
						/>
					</Flex>
				</CardBody>
			</Card>

			{isModalOpen && (
				<Modal
					title={__('SEO Settings', 'blockish')}
					onRequestClose={() => setIsModalOpen(false)}
					className="blockish-modal"
				>
					<VStack spacing={4}>
						<TextareaControl
							label={__('Global Meta Description (Homepage)', 'blockish')}
							help={__('This description will be added as a <meta> tag on your homepage for search engines.', 'blockish')}
							value={description}
							onChange={(val) => setDescription(val)}
							disabled={isLoading || isSaving}
							rows={4}
						/>

						<Flex justify="flex-end" gap={2}>
							<Button variant="secondary" onClick={() => setIsModalOpen(false)}>
								{__('Cancel', 'blockish')}
							</Button>
							<Button
								variant="primary"
								onClick={handleSave}
								isBusy={isSaving}
								disabled={isLoading || isSaving || description === seoSettings?.global_meta_description}
							>
								{__('Save Settings', 'blockish')}
							</Button>
						</Flex>
					</VStack>
				</Modal>
			)}
		</>
	);
}
