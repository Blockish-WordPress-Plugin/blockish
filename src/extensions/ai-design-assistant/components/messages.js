import { useEffect, useRef, useState } from '@wordpress/element';
import ReactMarkdown from 'react-markdown';
import { INITIAL_MESSAGES, copyTextToClipboard, parseChatMessages } from '../utils/chat';
import { ASSISTANT_MESSAGE_EDIT_EVENT } from '../constants';
import MessageActions from './message-actions';
import MessageAttachments from './message-attachments';
import MessageEditor from './message-editor';
import MessageInteraction from './message-interaction';
import MessageReasoning from './message-reasoning';
import MessageSchemaReview from './message-schema-review';

export default function AssistantMessages({ selectedChat }) {
	const chatRef = useRef(null);
	const scrollFrameRef = useRef(null);
	const copyResetTimeoutRef = useRef(null);
	const [copiedMessageId, setCopiedMessageId] = useState(null);
	const [editingMessageId, setEditingMessageId] = useState(null);
	const [editingContent, setEditingContent] = useState('');
	const messages = selectedChat?.content
		? parseChatMessages(selectedChat.content)
		: INITIAL_MESSAGES;

	const scrollToBottom = () => {
		if (scrollFrameRef.current) {
			cancelAnimationFrame(scrollFrameRef.current);
		}

		scrollFrameRef.current = requestAnimationFrame(() => {
			if (!chatRef.current) {
				return;
			}

			chatRef.current.scrollTop = chatRef.current.scrollHeight;
		});
	};

	useEffect(() => {
		scrollToBottom();

		return () => {
			if (scrollFrameRef.current) {
				cancelAnimationFrame(scrollFrameRef.current);
			}
		};
	}, [selectedChat?.content]);

	useEffect(() => (
		() => {
			if (copyResetTimeoutRef.current) {
				clearTimeout(copyResetTimeoutRef.current);
			}
		}
	), []);

	const copyMessageContent = async (message) => {
		const content = message?.content || '';

		await copyTextToClipboard(content);
		setCopiedMessageId(message.id);
		if (copyResetTimeoutRef.current) {
			clearTimeout(copyResetTimeoutRef.current);
		}
		copyResetTimeoutRef.current = setTimeout(() => {
			setCopiedMessageId(null);
		}, 1200);
	};

	const startEditingMessage = (message) => {
		setEditingMessageId(message.id);
		setEditingContent(message?.content || '');
	};

	const cancelEditingMessage = () => {
		setEditingMessageId(null);
		setEditingContent('');
	};

	const saveEditedMessage = async (messageId) => {
		if (!selectedChat?.id || !editingContent.trim()) {
			return;
		}

		window.dispatchEvent(new CustomEvent(ASSISTANT_MESSAGE_EDIT_EVENT, {
			detail: {
				chatId: selectedChat.id,
				content: editingContent.trim(),
				messageId,
			},
		}));
		cancelEditingMessage();
	};

	return (
		<div
			ref={chatRef}
			className="blockish-ai-assistant-chat"
		>
			{messages.map((message) => {
				const isUserMessage = message.role === 'user';
				const isEditing = editingMessageId === message.id;

				return (
					<div
						key={message.id}
						className={`blockish-ai-assistant-message-row blockish-ai-assistant-message-row--${message.role}${isEditing ? ' is-editing' : ''}`}
					>
						<div
							className={`blockish-ai-assistant-message blockish-ai-assistant-message--${message.role}${isEditing ? ' is-editing' : ''}`}
						>
							{isEditing ? (
								<MessageEditor
									content={editingContent}
									onCancel={cancelEditingMessage}
									onChange={setEditingContent}
									onSave={() => saveEditedMessage(message.id)}
								/>
							) : (
								<>
									{message.role === 'assistant' && message?.isStreaming ? (
										<MessageReasoning reasoning={message?.reasoning} />
									) : null}
									<ReactMarkdown>
										{message?.content || ''}
									</ReactMarkdown>
								</>
							)}
							<MessageAttachments
								attachments={message?.attachments}
								onImageLoad={scrollToBottom}
							/>
							<MessageInteraction
								interaction={message?.interaction}
								message={message}
							/>
							<MessageSchemaReview message={message} />
							{message?.isStreaming ? (
								<span className="blockish-ai-assistant-caret" />
							) : null}
						</div>
						{isUserMessage && !isEditing ? (
							<MessageActions
								copied={copiedMessageId === message.id}
								message={message}
								onCopy={copyMessageContent}
								onEdit={startEditingMessage}
							/>
						) : null}
					</div>
				);
			})}
		</div>
	);
}
