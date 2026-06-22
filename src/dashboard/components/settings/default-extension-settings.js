import { __ } from '@wordpress/i18n';
import { Button, Modal, TextControl, ToggleControl, __experimentalText as Text, __experimentalVStack as VStack } from '@wordpress/components';

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
	onChange,
	onSave,
	onRequestClose,
}) {
	if (!slug || !schema) {
		return null;
	}

	const savedSettings = extension?.settings || {};
	const selectedValues = extensionDraft || getExtensionSettingsInitialState(schema.controls || []);

	return (
		<Modal
			title={__(schema.title, 'blockish')}
			className="blockish-configure-modal"
			onRequestClose={onRequestClose}
		>
			<VStack className="blockish-modal-controls" spacing={4}>
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

					return (
						<TextControl
							key={control.key}
							label={__(control.label, 'blockish')}
							value={(value ?? savedSettings[control.key]) || ''}
							onChange={(next) => onChange(slug, control.key, next)}
							__next40pxDefaultSize
						/>
					);
				})}
				<Text variant="muted">
					{__('Special extension controls are ready and can be persisted when API fields are added.', 'blockish')}
				</Text>
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
