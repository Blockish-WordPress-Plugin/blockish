import { __ } from '@wordpress/i18n';
import { Button, Flex, Modal, TextControl, ToggleControl, __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';
import { useHistory } from '../../routes';

function getExtensionSettingsInitialState(schema = []) {
	const next = {};

	schema.forEach((control) => {
		next[control.key] = control.type === 'toggle' ? false : '';
	});

	return next;
}

export default function DefaultExtensionSettings({
	slug,
	schema,
	extension,
	extensionDraft,
	configuredProviders = {},
	onChange,
	onSave,
	onRequestClose,
}) {
	const history = useHistory();

	if (!slug || !schema) {
		return null;
	}

	const savedSettings = extension?.settings || {};
	const selectedValues = extensionDraft || getExtensionSettingsInitialState(schema.controls || []);

	return (
		<Modal
			title={__(schema.title, 'blockish')}
			className={`blockish-configure-modal ${slug === 'ai-design-assistant' ? 'blockish-ai-settings-modal' : ''}`}
			onRequestClose={onRequestClose}
		>
			<VStack className="blockish-modal-controls" spacing={4}>
				{schema.description && (
					<Text variant="muted">{__(schema.description, 'blockish')}</Text>
				)}
				{(schema.controls || []).map((control) => {
					const value = selectedValues[control.key];
					if (control.type === 'toggle') {
						return (
							<ToggleControl
								key={control.key}
								className="blockish-toggle-control"
								label={__(control.label, 'blockish')}
								checked={Boolean(value ?? savedSettings[control.key])}
								onChange={(next) => onChange(slug, control.key, next)}
							/>
						);
					}

					if (control.type === 'button-group') {
						const selectedValue = (value ?? savedSettings[control.key]) || '';
						const requiresConfiguredProviders = Boolean(control.requiresConfiguredProviders);
						const hasConfiguredProvider =
							Boolean(configuredProviders?.openai) || Boolean(configuredProviders?.gemini);

						if (requiresConfiguredProviders && !hasConfiguredProvider) {
							return (
								<VStack key={control.key} spacing={3}>
									<Text variant="muted">
										{__(
											'No AI provider is configured yet. Please add an API key in Integrations first.',
											'blockish'
										)}
									</Text>
									<Button
										className="blockish-action-button is-secondary blockish-button-base blockish-button-secondary"
										variant="secondary"
										onClick={() => {
											onRequestClose?.();
											history.push({ route: 'integrations' });
										}}
									>
										{__('Go to Integrations', 'blockish')}
									</Button>
								</VStack>
							);
						}

						return (
							<VStack key={control.key} spacing={2}>
								<Text>{__(control.label, 'blockish')}</Text>
								<Flex justify="flex-start" align="center" gap={2}>
									{(control.options || []).map((option) => (
										<Button
											key={option.value}
											className={`blockish-filter-button blockish-button-base ${selectedValue === option.value ? 'is-active' : ''}`}
											variant={selectedValue === option.value ? 'primary' : 'secondary'}
											onClick={() => onChange(slug, control.key, option.value)}
										>
											{__(option.label, 'blockish')}
										</Button>
									))}
								</Flex>
							</VStack>
						);
					}

					return (
						<TextControl
							key={control.key}
							label={__(control.label, 'blockish')}
							value={(value ?? savedSettings[control.key]) || ''}
							onChange={(next) => onChange(slug, control.key, next)}
						/>
					);
				})}
				{slug !== 'ai-design-assistant' && (
					<Text variant="muted">
						{__('Special extension controls are ready and can be persisted when API fields are added.', 'blockish')}
					</Text>
				)}
				<Button
					className="blockish-action-button is-primary blockish-button-base blockish-button-primary"
					variant="primary"
					onClick={onSave}
				>
					{__('Save Settings', 'blockish')}
				</Button>
			</VStack>
		</Modal>
	);
}
