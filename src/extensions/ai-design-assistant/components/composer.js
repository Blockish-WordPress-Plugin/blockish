import { __ } from '@wordpress/i18n';
import { Button, Flex } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';

export default function AssistantComposer({
	input,
	onInputChange,
	onKeyDown,
	onSend,
	isTyping,
	providerLabel,
	onProviderChange,
	providerSaving,
}) {
	const textareaRef = useRef(null);

	useEffect(() => {
		if (!textareaRef.current) {
			return;
		}

		textareaRef.current.style.height = 'auto';
		const nextHeight = Math.min(textareaRef.current.scrollHeight, 180);
		textareaRef.current.style.height = `${nextHeight}px`;
	}, [input]);

	return (
		<div className="blockish-ai-assistant-composer">
			<textarea
				ref={textareaRef}
				className="blockish-ai-assistant-composer-input"
				value={input}
				onChange={onInputChange}
				onKeyDown={onKeyDown}
				placeholder={__('Ask for follow-up changes', 'blockish')}
				rows={2}
			/>
			<Flex justify="space-between" align="center">
				<Flex align="center" expanded={false} gap={0}>
					<Button
						className="blockish-ai-assistant-provider-switch"
						variant="tertiary"
						icon="update"
						iconSize={14}
						onClick={onProviderChange}
						label={__('Change provider', 'blockish')}
						disabled={providerSaving}
					>
						{providerLabel}
					</Button>
				</Flex>
				<Button
					className="blockish-ai-assistant-send"
					variant="secondary"
					icon="arrow-up-alt2"
					iconSize={12}
					onClick={onSend}
					label={__('Send', 'blockish')}
					disabled={!input.trim() || isTyping}
				/>
			</Flex>
		</div>
	);
}
