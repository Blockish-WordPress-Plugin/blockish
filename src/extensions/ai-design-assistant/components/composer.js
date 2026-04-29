import { __ } from '@wordpress/i18n';
import { Button, Flex, __experimentalText as Text } from '@wordpress/components';
import { useRef, useState } from '@wordpress/element';
import useTextareaHeight from '../hooks/use-textarea-height';
import { useDispatch } from '@wordpress/data';
import { getChatTitle } from '../utils/chat';
import { CHAT_POST_TYPE, CHAT_SESSION_KEY } from '../constants';

export default function AssistantComposer({ selectedChat }) {
	const textareaRef = useRef(null);
	useTextareaHeight(textareaRef?.current);
	const [input, setInput] = useState('');
	const { saveEntityRecord, editEntityRecord, saveEditedEntityRecord } = useDispatch('core');

	const onSendMessage = async () => {
		if (!input.trim()) {
			return;
		}

		const message = {
			id: `${Date.now()}`,
			role: 'user',
			content: input,
		};

		if (!selectedChat?.id) {
			const newChat = await saveEntityRecord('postType', CHAT_POST_TYPE, {
				title: getChatTitle([message]),
				content: JSON.stringify([message]),
				status: 'publish',
			})

			window.sessionStorage.setItem(CHAT_SESSION_KEY, newChat.id);
		} else {
			try {
				await editEntityRecord('postType', CHAT_POST_TYPE, selectedChat.id, {
					content: JSON.stringify([
						...JSON.parse(selectedChat.content),
						message,
					]),
				})
				await saveEditedEntityRecord('postType', CHAT_POST_TYPE, selectedChat?.id);
			} catch (error) {
				console.error(error);
			}
		}

		setInput('');
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
