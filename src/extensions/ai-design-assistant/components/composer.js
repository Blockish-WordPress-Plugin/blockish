import { __ } from '@wordpress/i18n';
import { Button, Flex, __experimentalText as Text } from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import useTextareaHeight from '../hooks/use-textarea-height';
import { useDispatch } from '@wordpress/data';
import { getChatTitle, parseChatMessages } from '../utils/chat';
import {
	ASSISTANT_CONTEXT_EVENT,
	ASSISTANT_INTERACTION_EVENT,
	ASSISTANT_MESSAGE_EDIT_EVENT,
	ASSISTANT_SCHEMA_REVIEW_EVENT,
	CHAT_POST_TYPE,
} from '../constants';
import {
	clearAssistantContext,
	getAssistantContext,
	setSessionChatId,
} from '../utils/session';
import {
	getAssistantContent,
	getAssistantInteraction,
	getAssistantSchema,
	requestAssistant,
} from '../utils/assistant-request';
import { readImageAttachment } from '../utils/attachments';
import {
	applyAssistantSchema,
	getFullPageAssistantContext,
} from '../utils/block-schema';
import useClassManagerContent from '../hooks/use-class-manager-content';

const getContextLabel = (context) => {
	if (!context?.blocks?.length) {
		return __('Full page context', 'blockish');
	}

	const blockCount = context.blocks.length;
	const blockLabel = blockCount === 1
		? __('1 selected block', 'blockish')
		: __(`${blockCount} selected blocks`, 'blockish');

	if (context.mode === 'blocks_with_inner_blocks') {
		return `${blockLabel} ${__('with inner blocks', 'blockish')}`;
	}

	return blockLabel;
};

export default function AssistantComposer({ selectedChat }) {
	const textareaRef = useRef(null);
	const fileInputRef = useRef(null);
	const abortControllerRef = useRef(null);
	const [input, setInput] = useState('');
	const [imageAttachments, setImageAttachments] = useState([]);
	const [attachmentError, setAttachmentError] = useState('');
	const [isRequesting, setIsRequesting] = useState(false);
	const [assistantConfig, setAssistantConfig] = useState({ apiKey: '' });
	const [assistantContext, setAssistantContextState] = useState(() => getAssistantContext());
	useTextareaHeight(textareaRef, input);
	const { saveEntityRecord, editEntityRecord, saveEditedEntityRecord } = useDispatch('core');
	const classManager = useClassManagerContent();

	const resolveAssistantConfig = async () => {
		try {
			const response = await apiFetch({ path: '/blockish/v1/integrations', method: 'GET' });
			const nextConfig = {
				apiKey: response?.integrations?.openrouter?.settings?.apiKey || '',
			};

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

	useEffect(() => {
		const syncAssistantContext = (event) => {
			setAssistantContextState(event?.detail?.context ?? getAssistantContext());
		};

		window.addEventListener(ASSISTANT_CONTEXT_EVENT, syncAssistantContext);

		return () => {
			window.removeEventListener(ASSISTANT_CONTEXT_EVENT, syncAssistantContext);
		};
	}, []);

	const updateChatMessages = async (chatId, messages) => {
		await editEntityRecord('postType', CHAT_POST_TYPE, chatId, {
			content: JSON.stringify(messages),
		});
	};

	const getRequestAssistantContext = () => (
		assistantContext?.blocks?.length
			? assistantContext
			: getFullPageAssistantContext()
	);

	const saveAssistantResponse = async (
		userInput,
		messagesForContext,
		chatId,
		attachmentsForRequest = []
	) => {
		const assistantMessageId = `${Date.now() + 1}`;
		const abortController = new AbortController();
		let streamedContent = '';
		let latestMessages = [
			...messagesForContext,
			{
				id: assistantMessageId,
				role: 'assistant',
				content: __('Thinking...', 'blockish'),
				reasoning: [
					__('Reading your request.', 'blockish'),
					__('Checking what information is missing.', 'blockish'),
				],
				isStreaming: true,
			},
		];

		abortControllerRef.current = abortController;
		setIsRequesting(true);
		await updateChatMessages(chatId, latestMessages);

		try {
			let configForRequest = assistantConfig;
			if (!configForRequest.apiKey) {
				configForRequest = await resolveAssistantConfig();
			}

			const assistantResponse = await requestAssistant(
				{
					message: userInput,
					messages: messagesForContext,
					attachments: attachmentsForRequest,
					apiKey: configForRequest.apiKey,
					classManager,
					assistantContext: getRequestAssistantContext(),
				},
				abortController.signal,
				async (chunk) => {
					streamedContent += chunk;
					latestMessages = latestMessages.map((message) => (
						message.id === assistantMessageId
							? {
								...message,
								content: streamedContent,
								isStreaming: true,
							}
							: message
					));
					await updateChatMessages(chatId, latestMessages);
				}
			);
			const finalContent = assistantResponse ? getAssistantContent(assistantResponse) : '';
			const assistantContent = finalContent || streamedContent;
			const assistantInteraction = getAssistantInteraction(assistantResponse);
			const assistantSchema = getAssistantSchema(assistantResponse);
			const schemaResult = assistantSchema
				? await applyAssistantSchema(assistantSchema, 'new')
				: { applied: false, schema: assistantSchema };

			latestMessages = latestMessages.map((message) => (
				message.id === assistantMessageId
					? {
						...message,
						content: assistantContent,
						interaction: assistantInteraction,
						...(assistantSchema ? {
							schema: schemaResult.schema,
							schemaReview: schemaResult.applied ? 'pending' : 'failed',
						} : {}),
						reasoning: [],
						isStreaming: false,
					}
					: message
			));
		} catch (error) {
			if (error?.name === 'AbortError') {
				latestMessages = latestMessages.map((message) => (
					message.id === assistantMessageId
						? {
							...message,
							content: streamedContent || __('Request stopped.', 'blockish'),
							isStreaming: false,
							isStopped: true,
						}
						: message
				));
			} else {
				console.error(error);
				const errorMessage = error?.message || __('I could not generate a response right now. Please try again.', 'blockish');
				latestMessages = latestMessages.map((message) => (
					message.id === assistantMessageId
						? {
							...message,
							content: errorMessage,
							isStreaming: false,
						}
						: message
				));
			}
		} finally {
			abortControllerRef.current = null;
			setIsRequesting(false);
		}

		try {
			await updateChatMessages(chatId, latestMessages);
			await saveEditedEntityRecord('postType', CHAT_POST_TYPE, chatId);
		} catch (error) {
			console.error(error);
		}
	};

	const sendMessage = async ({
		content,
		attachments = [],
		interactionResponse = null,
		prepareMessages = (messages) => messages,
	}) => {
		if ((!content.trim() && !attachments.length) || isRequesting) {
			return;
		}

		const currentAttachments = attachments;
		const message = {
			id: `${Date.now()}`,
			role: 'user',
			content: content.trim() || __('Uploaded an image.', 'blockish'),
			attachments: currentAttachments,
			...(interactionResponse ? { interactionResponse } : {}),
		};
		const currentMessages = parseChatMessages(selectedChat?.content);
		const preparedMessages = prepareMessages(currentMessages);
		const messagesForContext = currentMessages.length
			? [...preparedMessages, message]
			: [message];
		const userInput = message.content;
		let chatId = selectedChat?.id;

		if (!chatId) {
			const newChat = await saveEntityRecord('postType', CHAT_POST_TYPE, {
				title: getChatTitle(messagesForContext),
				content: JSON.stringify(messagesForContext),
				status: 'publish',
			});

			chatId = newChat.id;
			setSessionChatId(chatId);
		} else {
			try {
				await editEntityRecord('postType', CHAT_POST_TYPE, chatId, {
					content: JSON.stringify(messagesForContext),
				});
				await saveEditedEntityRecord('postType', CHAT_POST_TYPE, chatId);
			} catch (error) {
				console.error(error);
			}
		}

		await saveAssistantResponse(
			userInput,
			messagesForContext,
			chatId,
			currentAttachments
		);
	};

	const resendEditedMessage = async ({
		chatId,
		content,
		messageId,
	}) => {
		if (!chatId || !messageId || !content.trim() || isRequesting) {
			return;
		}

		const currentMessages = parseChatMessages(selectedChat?.content);
		const messageIndex = currentMessages.findIndex((message) => message.id === messageId);

		if (messageIndex === -1) {
			return;
		}

		const originalMessage = currentMessages[messageIndex];
		const editedMessage = {
			...originalMessage,
			content: content.trim(),
		};
		const messagesForContext = [
			...currentMessages.slice(0, messageIndex),
			editedMessage,
		];
		const attachmentsForRequest = Array.isArray(editedMessage.attachments)
			? editedMessage.attachments
			: [];

		try {
			await editEntityRecord('postType', CHAT_POST_TYPE, chatId, {
				content: JSON.stringify(messagesForContext),
			});
			await saveEditedEntityRecord('postType', CHAT_POST_TYPE, chatId);
		} catch (error) {
			console.error(error);
			return;
		}

		await saveAssistantResponse(
			editedMessage.content,
			messagesForContext,
			chatId,
			attachmentsForRequest
		);
	};

	const onSendMessage = async () => {
		const currentAttachments = imageAttachments;
		const userInput = input;

		setInput('');
		setImageAttachments([]);
		setAttachmentError('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}

		await sendMessage({
			content: userInput,
			attachments: currentAttachments,
		});
	};

	useEffect(() => {
		const submitInteractionResponse = async (event) => {
			const detail = event?.detail || {};

			if (!detail.messageId || !detail.interaction || !detail.label) {
				return;
			}

			const interactionResponse = {
				action: detail.action || 'submit',
				id: detail.interaction.id,
				type: detail.interaction.type,
				value: detail.value,
			};

			await sendMessage({
				content: detail.label,
				interactionResponse,
				prepareMessages: (messages) => messages.map((message) => (
					message.id === detail.messageId
						? {
							...message,
							interactionResponse,
						}
						: message
				)),
			});
		};

		window.addEventListener(ASSISTANT_INTERACTION_EVENT, submitInteractionResponse);

		return () => {
			window.removeEventListener(ASSISTANT_INTERACTION_EVENT, submitInteractionResponse);
		};
	}, [selectedChat, isRequesting, assistantConfig, assistantContext, classManager]);

	useEffect(() => {
		const submitEditedMessage = async (event) => {
			await resendEditedMessage(event?.detail || {});
		};

		window.addEventListener(ASSISTANT_MESSAGE_EDIT_EVENT, submitEditedMessage);

		return () => {
			window.removeEventListener(ASSISTANT_MESSAGE_EDIT_EVENT, submitEditedMessage);
		};
	}, [selectedChat, isRequesting, assistantConfig, assistantContext, classManager]);

	useEffect(() => {
		const reviewSchema = async (event) => {
			const detail = event?.detail || {};

			if (!selectedChat?.id || !detail.messageId || !detail.action) {
				return;
			}

			const currentMessages = parseChatMessages(selectedChat?.content);
			const targetMessage = currentMessages.find(
				(message) => message.id === detail.messageId
			);

			if (!targetMessage?.schema) {
				return;
			}

			if (detail.action === 'decline') {
				await applyAssistantSchema(targetMessage.schema, 'prev');
			}

			const nextMessages = currentMessages.map((message) => (
				message.id === detail.messageId
					? {
						...message,
						schemaReview: detail.action === 'accept' ? 'accepted' : 'declined',
					}
					: message
			));

			try {
				await updateChatMessages(selectedChat.id, nextMessages);
				await saveEditedEntityRecord('postType', CHAT_POST_TYPE, selectedChat.id);
			} catch (error) {
				console.error(error);
			}
		};

		window.addEventListener(ASSISTANT_SCHEMA_REVIEW_EVENT, reviewSchema);

		return () => {
			window.removeEventListener(ASSISTANT_SCHEMA_REVIEW_EVENT, reviewSchema);
		};
	}, [selectedChat]);

	const onStopRequest = () => {
		abortControllerRef.current?.abort();
	};

	const onSelectImage = async (event) => {
		const file = event.target.files?.[0];

		if (!file) {
			return;
		}

		try {
			const attachment = await readImageAttachment(file);
			setImageAttachments([attachment]);
			setAttachmentError('');
		} catch (error) {
			setAttachmentError(error instanceof Error ? error.message : __('Could not attach image.', 'blockish'));
		}
	};

	return (
		<div className="blockish-ai-assistant-composer">
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				className="blockish-ai-assistant-file-input"
				onChange={onSelectImage}
			/>
			{imageAttachments.length ? (
				<div className="blockish-ai-assistant-attachments">
					{imageAttachments.map((attachment) => (
						<div
							key={attachment.id}
							className="blockish-ai-assistant-attachment"
						>
							<img
								src={attachment.url}
								alt={attachment.name}
								className="blockish-ai-assistant-attachment-image"
							/>
							<Text className="blockish-ai-assistant-attachment-name">
								{attachment.name}
							</Text>
							<Button
								className="blockish-ai-assistant-attachment-remove"
								variant="tertiary"
								icon="no-alt"
								iconSize={12}
								onClick={() => setImageAttachments([])}
								label={__('Remove image', 'blockish')}
							/>
						</div>
					))}
				</div>
			) : null}
			{attachmentError ? (
				<Text className="blockish-ai-assistant-attachment-error">
					{attachmentError}
				</Text>
			) : null}
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
				<Flex align="center" expanded={false} gap={4}>
					<div className="blockish-ai-assistant-context">
						<Text className="blockish-ai-assistant-context-label">
							{__('Context:', 'blockish')}
						</Text>
						<Text className="blockish-ai-assistant-context-value">
							{getContextLabel(assistantContext)}
						</Text>
						{assistantContext?.blocks?.length ? (
							<Button
								className="blockish-ai-assistant-context-clear"
								variant="tertiary"
								icon="no-alt"
								iconSize={12}
								onClick={clearAssistantContext}
								label={__('Clear context', 'blockish')}
							/>
						) : null}
					</div>
				</Flex>
				<Flex align="center" expanded={false} gap={4}>
					<Button
						className="blockish-ai-assistant-composer-action"
						variant="tertiary"
						icon="format-image"
						iconSize={14}
						onClick={() => fileInputRef.current?.click()}
						label={__('Attach image', 'blockish')}
						disabled={isRequesting}
					/>
					<Button
						className="blockish-ai-assistant-send"
						variant="secondary"
						icon={isRequesting ? 'controls-pause' : 'arrow-up-alt2'}
						iconSize={12}
						onClick={isRequesting ? onStopRequest : onSendMessage}
						label={isRequesting ? __('Stop', 'blockish') : __('Send', 'blockish')}
						disabled={!isRequesting && !input.trim() && !imageAttachments.length}
					/>
				</Flex>
			</Flex>
		</div>
	);
}
