import { useEffect, useRef, useState } from '@wordpress/element';
import ReactMarkdown from 'react-markdown';
import { __ } from '@wordpress/i18n';
import { INITIAL_MESSAGES, copyTextToClipboard, parseChatMessages } from '../utils/chat';
import { ASSISTANT_CONTEXT_EVENT, ASSISTANT_MESSAGE_EDIT_EVENT, ASSISTANT_REGENERATE_EVENT, ASSISTANT_SUGGESTION_EVENT } from '../constants';
import { getAssistantContext } from '../utils/session';

const FULL_PAGE_SUGGESTIONS = [
	__( 'Build a hero section', 'blockish' ),
	__( 'Create a landing page for my product', 'blockish' ),
	__( 'Design a pricing section', 'blockish' ),
	__( 'Make a contact section', 'blockish' ),
	__( 'Build a features section', 'blockish' ),
	__( 'Add a testimonials section', 'blockish' ),
	__( 'Create an FAQ section', 'blockish' ),
	__( 'Design a call-to-action section', 'blockish' ),
	__( 'Build an about section', 'blockish' ),
	__( 'Create a team section', 'blockish' ),
	__( 'Design a portfolio section', 'blockish' ),
	__( 'Build a stats section', 'blockish' ),
];

const BLOCK_SUGGESTIONS = {
	heading: [
		__( 'Make this heading more impactful', 'blockish' ),
		__( 'Suggest a better font size and weight', 'blockish' ),
		__( 'Improve the heading hierarchy', 'blockish' ),
		__( 'Make this heading stand out more', 'blockish' ),
	],
	button: [
		__( 'Make this CTA more compelling', 'blockish' ),
		__( 'Suggest a better button style', 'blockish' ),
		__( 'Improve the button color and contrast', 'blockish' ),
		__( 'Make this button more clickable', 'blockish' ),
	],
	container: [
		__( 'Improve this section layout', 'blockish' ),
		__( 'Make this section more visually striking', 'blockish' ),
		__( 'Suggest a better background style', 'blockish' ),
		__( 'Improve the content hierarchy here', 'blockish' ),
	],
	image: [
		__( 'Suggest a better image presentation', 'blockish' ),
		__( 'Improve the image styling and layout', 'blockish' ),
		__( 'Add visual framing to the image', 'blockish' ),
		__( 'Make the image section more impactful', 'blockish' ),
	],
	paragraph: [
		__( 'Improve text readability and spacing', 'blockish' ),
		__( 'Enhance the typography style', 'blockish' ),
		__( 'Make this text more engaging', 'blockish' ),
		__( 'Suggest better font and line height', 'blockish' ),
	],
	accordion: [
		__( 'Improve the accordion design', 'blockish' ),
		__( 'Make this FAQ section more user-friendly', 'blockish' ),
		__( 'Enhance the accordion visual hierarchy', 'blockish' ),
		__( 'Make the accordion more engaging', 'blockish' ),
	],
	'icon-list': [
		__( 'Improve the icon list layout', 'blockish' ),
		__( 'Make the list items more scannable', 'blockish' ),
		__( 'Suggest better icons and spacing', 'blockish' ),
		__( 'Enhance the list visual style', 'blockish' ),
	],
	counter: [
		__( 'Make the stats more impactful', 'blockish' ),
		__( 'Improve the counter visual style', 'blockish' ),
		__( 'Suggest a better number display', 'blockish' ),
		__( 'Enhance the metrics layout', 'blockish' ),
	],
	'progress-bar': [
		__( 'Improve the progress bar style', 'blockish' ),
		__( 'Make the progress section more engaging', 'blockish' ),
		__( 'Suggest better colors for the bars', 'blockish' ),
		__( 'Enhance the progress visualization', 'blockish' ),
	],
	tab: [
		__( 'Improve the tab design', 'blockish' ),
		__( 'Make the tabs more user-friendly', 'blockish' ),
		__( 'Enhance the tab visual style', 'blockish' ),
		__( 'Make the tab navigation clearer', 'blockish' ),
	],
	rating: [
		__( 'Improve the rating display', 'blockish' ),
		__( 'Make the reviews section more trustworthy', 'blockish' ),
		__( 'Suggest a better review layout', 'blockish' ),
		__( 'Enhance the star rating style', 'blockish' ),
	],
	'social-icons': [
		__( 'Improve the social icons style', 'blockish' ),
		__( 'Make the social links more prominent', 'blockish' ),
		__( 'Suggest better icon sizing and spacing', 'blockish' ),
		__( 'Enhance the social section layout', 'blockish' ),
	],
	video: [
		__( 'Improve the video section layout', 'blockish' ),
		__( 'Make the video presentation more engaging', 'blockish' ),
		__( 'Suggest a better video frame style', 'blockish' ),
		__( 'Enhance the media section design', 'blockish' ),
	],
	'google-map': [
		__( 'Improve the map section layout', 'blockish' ),
		__( 'Make the map more visually integrated', 'blockish' ),
		__( 'Suggest a better map presentation', 'blockish' ),
		__( 'Enhance the contact/location section', 'blockish' ),
	],
	icon: [
		__( 'Improve the icon presentation', 'blockish' ),
		__( 'Suggest a better icon style', 'blockish' ),
		__( 'Make the icon more visually impactful', 'blockish' ),
		__( 'Enhance the icon size and color', 'blockish' ),
	],
};

const MULTI_BLOCK_SUGGESTIONS = [
	__( 'Improve spacing between these blocks', 'blockish' ),
	__( 'Make these blocks more visually cohesive', 'blockish' ),
	__( 'Suggest a better layout for this section', 'blockish' ),
	__( 'Improve the visual hierarchy here', 'blockish' ),
];

const UNKNOWN_BLOCK_SUGGESTIONS = [
	__( 'Improve this block design', 'blockish' ),
	__( 'Make this block more visually impactful', 'blockish' ),
	__( 'Suggest better styling for this block', 'blockish' ),
	__( 'Improve the layout and spacing', 'blockish' ),
];

function getContextualSuggestions( context ) {
	const blocks = context?.blocks || [];

	if ( ! blocks.length ) {
		return FULL_PAGE_SUGGESTIONS;
	}

	if ( blocks.length === 1 ) {
		const blockBase = blocks[ 0 ]?.name?.split( '/' )?.[ 1 ] || '';
		// Strip variant suffixes like "-item" for parent lookups (e.g. tab-item → tab)
		const suggestions = BLOCK_SUGGESTIONS[ blockBase ]
			|| BLOCK_SUGGESTIONS[ blockBase.replace( /-item$/, '' ) ]
			|| BLOCK_SUGGESTIONS[ blockBase.replace( /-icon-item$/, 's' ) ];
		return suggestions || UNKNOWN_BLOCK_SUGGESTIONS;
	}

	return MULTI_BLOCK_SUGGESTIONS;
}

function AssistantSuggestions() {
	const [ context, setContext ] = useState( () => getAssistantContext() );

	useEffect( () => {
		const sync = ( event ) => setContext( event?.detail?.context ?? getAssistantContext() );
		window.addEventListener( ASSISTANT_CONTEXT_EVENT, sync );
		return () => window.removeEventListener( ASSISTANT_CONTEXT_EVENT, sync );
	}, [] );

	const suggestions = getContextualSuggestions( context );

	const onSuggestionClick = ( suggestion ) => {
		window.dispatchEvent(
			new CustomEvent( ASSISTANT_SUGGESTION_EVENT, { detail: { suggestion } } )
		);
	};

	const isFullPage = ! context?.blocks?.length;

	return (
		<div className="blockish-ai-assistant-suggestions">
			{ isFullPage && (
				<div className="blockish-ai-assistant-suggestions-header">
					<p className="blockish-ai-assistant-suggestions-label">
						{ __( 'What would you like to build?', 'blockish' ) }
					</p>
				</div>
			) }
			{ suggestions.map( ( suggestion ) => (
				<button
					key={ suggestion }
					className="blockish-ai-assistant-suggestion"
					onClick={ () => onSuggestionClick( suggestion ) }
				>
					{ suggestion }
				</button>
			) ) }
		</div>
	);
}
import MessageActions from './message-actions';
import MessageAttachments from './message-attachments';
import MessageEditor from './message-editor';
import MessageInteraction from './message-interaction';
import MessageReasoning from './message-reasoning';
import MessageThinking from './message-thinking';
import MessageSchemaReview from './message-schema-review';

export default function AssistantMessages({ selectedChat }) {
	const chatRef = useRef(null);
	const scrollFrameRef = useRef(null);
	const copyResetTimeoutRef = useRef(null);
	const [copiedMessageId, setCopiedMessageId] = useState(null);
	const [editingMessageId, setEditingMessageId] = useState(null);
	const [editingContent, setEditingContent] = useState('');
	const isInitial = !selectedChat?.content;
	const messages = isInitial
		? INITIAL_MESSAGES
		: parseChatMessages(selectedChat.content);
	const isChatBusy = messages.some((message) => (
		message.role === 'assistant' && message?.isStreaming
	));
	const lastMessage = messages.at(-1);
	const lastAssistantMessage = !isChatBusy
		? [...messages].reverse().find((m) => m.role === 'assistant' && !m.isStreaming)
		: null;
	const isWaitingForAnswer = (
		! isInitial &&
		! isChatBusy &&
		lastMessage?.role === 'assistant' &&
		( lastMessage?.content?.toLowerCase().includes('**question:**') ||
		  lastMessage?.content?.toLowerCase().includes('question:') )
	);

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

	useEffect(() => {
		if (isChatBusy && editingMessageId) {
			cancelEditingMessage();
		}
	}, [isChatBusy, editingMessageId]);

	const regenerateMessage = (message) => {
		window.dispatchEvent(new CustomEvent(ASSISTANT_REGENERATE_EVENT, {
			detail: { messageId: message.id },
		}));
	};

	const copyMessageContent = async (message) => {
		if (isChatBusy) {
			return;
		}

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
		if (isChatBusy) {
			return;
		}

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
										<MessageThinking
											plan={message?.plan}
											status={message?.status}
										/>
									) : null}
									{message.role === 'assistant' && !message?.isStreaming ? (
										<MessageReasoning
											reasoning={message?.reasoning}
											summary={message?.summary}
										/>
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
						{isUserMessage && !isEditing && !isChatBusy ? (
							<MessageActions
								copied={copiedMessageId === message.id}
								message={message}
								onCopy={copyMessageContent}
								onEdit={startEditingMessage}
							/>
						) : null}
						{!isUserMessage && message.id === lastAssistantMessage?.id ? (
							<MessageActions
								message={message}
								onRegenerate={regenerateMessage}
							/>
						) : null}
					</div>
				);
			})}
			{ isInitial && <AssistantSuggestions /> }
			{ isWaitingForAnswer && (
				<div className="blockish-ai-awaiting-reply">
					<span className="blockish-ai-awaiting-reply-dot" />
					{ __( 'Awaiting your reply', 'blockish' ) }
				</div>
			) }
		</div>
	);
}
