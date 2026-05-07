import { __ } from '@wordpress/i18n';
import { Button, Flex, __experimentalText as Text } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import useTextareaHeight from '../hooks/use-textarea-height';
import { useDispatch } from '@wordpress/data';
import { getChatTitle } from '../utils/chat';
import { CHAT_POST_TYPE } from '../constants';
import { setSessionChatId } from '../utils/session';

export default function AssistantComposer({ selectedChat }) {
	const textareaRef = useRef(null);
	const [input, setInput] = useState('');
	const [assistantConfig, setAssistantConfig] = useState({ provider: '', apiKey: '' });
	useTextareaHeight(textareaRef, input);
	const { saveEntityRecord, editEntityRecord, saveEditedEntityRecord } = useDispatch('core');

	const resolveAssistantConfig = async () => {
		try {
			const [extensionsResponse, integrationsResponse] = await Promise.all([
				apiFetch({ path: '/blockish/v1/extensions', method: 'GET' }),
				apiFetch({ path: '/blockish/v1/integrations', method: 'GET' }),
			]);

			const configuredProvider =
				extensionsResponse?.extensions?.['ai-design-assistant']?.settings?.provider || '';
			const provider = configuredProvider || assistantConfig.provider || 'openai';
			const apiKey =
				integrationsResponse?.integrations?.[provider]?.settings?.apiKey || '';
			const nextConfig = { provider, apiKey };

			setAssistantConfig(nextConfig);
			return nextConfig;
		} catch (error) {
			console.error(error);
			return assistantConfig;
		}
	};

	useEffect(() => {
		resolveAssistantConfig();
	}, []);

	const getAssistantContent = (response) => {
		if (typeof response?.response === 'string' && response.response.trim()) {
			return response.response;
		}

		if (typeof response?.message === 'string' && response.message.trim()) {
			return response.message;
		}

		return __('I could not generate a response right now. Please try again.', 'blockish');
	};

	const onSendMessage = async () => {
		if (!input.trim()) {
			return;
		}

		const message = {
			id: `${Date.now()}`,
			role: 'user',
			content: input,
		};
		const messagesForContext = selectedChat?.content
			? [
				...JSON.parse(selectedChat.content),
				message,
			]
			: [message];
		const userInput = input;
		setInput('');

		let assistantResponse;
		try {
			let configForRequest = assistantConfig;
			if (!configForRequest.provider || !configForRequest.apiKey) {
				configForRequest = await resolveAssistantConfig();
			}

			assistantResponse = await apiFetch({
				path: '/blockish/v1/assistant',
				method: 'POST',
				data: {
					message: userInput,
					messages: messagesForContext,
					provider: configForRequest.provider,
					apiKey: configForRequest.apiKey,
				},
			});
		} catch (error) {
			console.error(error);
			assistantResponse = null;
		}

		const assistantMessage = {
			id: `${Date.now() + 1}`,
			role: 'assistant',
			content: getAssistantContent(assistantResponse),
		};

		const nextMessages = [
			...messagesForContext,
			assistantMessage,
		];

		if (!selectedChat?.id) {
			const newChat = await saveEntityRecord('postType', CHAT_POST_TYPE, {
				title: getChatTitle(nextMessages),
				content: JSON.stringify(nextMessages),
				status: 'publish',
			})

			setSessionChatId(newChat.id);
		} else {
			try {
				await editEntityRecord('postType', CHAT_POST_TYPE, selectedChat.id, {
					content: JSON.stringify(nextMessages),
				})
				await saveEditedEntityRecord('postType', CHAT_POST_TYPE, selectedChat?.id);
			} catch (error) {
				console.error(error);
			}
		}
	};

	return (
		<div className="blockish-ai-assistant-composer">
			<textarea
				ref={textareaRef}
				className="blockish-ai-assistant-composer-input"
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						onSendMessage();
					}
				}}
				placeholder={__('Ask for follow-up changes', 'blockish')}
				rows={2}
			/>
			<Flex justify="space-between" align="center">
				<Flex align="center" expanded={false} gap={0}>
					<Text size="small" style={{color: '#9ca3af'}}>OpenAI</Text>
				</Flex>
				<Button
					className="blockish-ai-assistant-send"
					variant="secondary"
					icon="arrow-up-alt2"
					iconSize={12}
					onClick={onSendMessage}
					label={__('Send', 'blockish')}
					disabled={!input.trim()}
				/>
			</Flex>
		</div>
	);
}
