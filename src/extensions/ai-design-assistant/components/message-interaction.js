import { __ } from '@wordpress/i18n';
import {
	Button,
	CheckboxControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { ASSISTANT_INTERACTION_EVENT } from '../constants';

const getOptionLabel = (option) => option?.label || option?.value || '';

const submitInteraction = ({
	action = 'submit',
	interaction,
	label,
	messageId,
	value,
}) => {
	window.dispatchEvent(new CustomEvent(ASSISTANT_INTERACTION_EVENT, {
		detail: {
			action,
			interaction,
			label,
			messageId,
			value,
		},
	}));
};

const ChoiceButton = ({ interaction, messageId, option }) => (
	<Button
		className="blockish-ai-assistant-interaction-choice"
		variant="secondary"
		onClick={() => submitInteraction({
			interaction,
			label: getOptionLabel(option),
			messageId,
			value: option.value,
		})}
	>
		{getOptionLabel(option)}
	</Button>
);

const CustomSingleChoice = ({
	customValue,
	interaction,
	messageId,
	setCustomValue,
}) => (
	<div className="blockish-ai-assistant-interaction-custom">
		<textarea
			className="blockish-ai-assistant-interaction-input"
			value={customValue}
			onChange={(event) => setCustomValue(event.target.value)}
			placeholder={__('Write custom answer', 'blockish')}
			rows={2}
		/>
		<Button
			className="blockish-ai-assistant-interaction-submit"
			variant="secondary"
			onClick={() => submitInteraction({
				interaction,
				label: customValue.trim(),
				messageId,
				value: customValue.trim(),
			})}
			disabled={!customValue.trim()}
		>
			{__('Send', 'blockish')}
		</Button>
	</div>
);

const MultiChoiceInteraction = ({
	customValue,
	interaction,
	messageId,
	options,
	selectedValues,
	setCustomValue,
	setSelectedValues,
}) => {
	const toggleValue = (value) => {
		setSelectedValues((currentValues) => (
			currentValues.includes(value)
				? currentValues.filter((currentValue) => currentValue !== value)
				: [...currentValues, value]
		));
	};
	const selectedLabels = options
		.filter((option) => selectedValues.includes(option.value))
		.map(getOptionLabel);
	const customLabels = customValue
		.split(',')
		.map((value) => value.trim())
		.filter(Boolean);
	const allLabels = [...selectedLabels, ...customLabels];
	const allValues = [...selectedValues, ...customLabels];

	return (
		<div className="blockish-ai-assistant-interaction">
			<div className="blockish-ai-assistant-interaction-checks">
				{options.map((option) => (
					<CheckboxControl
						key={option.value}
						className="blockish-ai-assistant-interaction-check"
						label={getOptionLabel(option)}
						checked={selectedValues.includes(option.value)}
						onChange={() => toggleValue(option.value)}
					/>
				))}
			</div>
			{interaction.allowCustom ? (
				<textarea
					className="blockish-ai-assistant-interaction-input"
					value={customValue}
					onChange={(event) => setCustomValue(event.target.value)}
					placeholder={__('Add custom choices, comma separated', 'blockish')}
					rows={2}
				/>
			) : null}
			<Button
				className="blockish-ai-assistant-interaction-submit"
				variant="secondary"
				onClick={() => submitInteraction({
					interaction,
					label: allLabels.join(', '),
					messageId,
					value: allValues,
				})}
				disabled={!allValues.length}
			>
				{__('Send choices', 'blockish')}
			</Button>
		</div>
	);
};

const MessageInteraction = ({ interaction, message }) => {
	const options = interaction?.options || [];
	const [customValue, setCustomValue] = useState('');
	const [selectedValues, setSelectedValues] = useState([]);
	const isAnswered = Boolean(message?.interactionResponse);

	useEffect(() => {
		setCustomValue('');
		setSelectedValues([]);
	}, [interaction?.id]);

	if (!interaction || isAnswered) {
		return null;
	}

	if (interaction.type === 'yes_no' || interaction.type === 'single_choice') {
		return (
			<div className="blockish-ai-assistant-interaction">
				<div className="blockish-ai-assistant-interaction-options">
					{options.map((option) => (
						<ChoiceButton
							key={option.value}
							interaction={interaction}
							messageId={message.id}
							option={option}
						/>
					))}
				</div>
				{interaction.type === 'single_choice' && interaction.allowCustom ? (
					<CustomSingleChoice
						customValue={customValue}
						interaction={interaction}
						messageId={message.id}
						setCustomValue={setCustomValue}
					/>
				) : null}
			</div>
		);
	}

	if (interaction.type === 'multi_choice') {
		return (
			<MultiChoiceInteraction
				customValue={customValue}
				interaction={interaction}
				messageId={message.id}
				options={options}
				selectedValues={selectedValues}
				setCustomValue={setCustomValue}
				setSelectedValues={setSelectedValues}
			/>
		);
	}

	return null;
};

export default MessageInteraction;
