import { PluginSidebar } from '@wordpress/editor';
import { registerPlugin } from '@wordpress/plugins';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import './editor.scss';
import { PLUGIN_NAME } from './constants';
import { INITIAL_MESSAGES, getAssistantReply, getChatTitle } from './utils/chat';
import { getProviderLabel } from './utils/provider';
import useSidebarHeight from './hooks/use-sidebar-height';
import useProvider from './hooks/use-provider';
import AssistantHeader from './components/header';
import AssistantMessages from './components/messages';
import AssistantComposer from './components/composer';

const buildSession = (id, sessionMessages) => ({
	id,
	title: getChatTitle(sessionMessages),
	messages: sessionMessages,
	updatedAt: Date.now(),
});

function AIDesignAssistantSidebar() {
	const sidebarIcon =
		window?.blockish?.components?.blockIcons?.aiDesignAssistantIcon || 'admin-customizer';
	const initialSessionId = `session-${Date.now()}`;
	const [messages, setMessages] = useState(INITIAL_MESSAGES);
	const [chatSessions, setChatSessions] = useState([buildSession(initialSessionId, INITIAL_MESSAGES)]);
	const [activeSessionId, setActiveSessionId] = useState(initialSessionId);
	const [input, setInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const chatBodyRef = useRef(null);
	const typingIntervalRef = useRef(null);
	const { panelHeight, setAssistantRoot } = useSidebarHeight();
	const { activeProvider, providerSaving, handleProviderChange } = useProvider();

	useEffect(() => {
		if (chatBodyRef.current) {
			chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
		}
	}, [messages, isTyping]);

	useEffect(() => {
		return () => {
			if (typingIntervalRef.current) {
				clearInterval(typingIntervalRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!activeSessionId) {
			return;
		}

		setChatSessions((prev) =>
			prev.map((session) =>
				session.id === activeSessionId
					? {
							...session,
							title: getChatTitle(messages),
							messages,
							updatedAt: Date.now(),
					  }
					: session
			)
		);
	}, [messages, activeSessionId]);

	const activeSessionTitle =
		chatSessions.find((session) => session.id === activeSessionId)?.title ||
		__('AI Design Assistant', 'blockish');

	const resetChat = () => {
		if (typingIntervalRef.current) {
			clearInterval(typingIntervalRef.current);
		}
		const nextSessionId = `session-${Date.now()}`;
		setIsTyping(false);
		setInput('');
		setMessages(INITIAL_MESSAGES);
		setActiveSessionId(nextSessionId);
		setChatSessions((prev) => [buildSession(nextSessionId, INITIAL_MESSAGES), ...prev]);
	};

	const handleSelectSession = (sessionId) => {
		const session = chatSessions.find((item) => item.id === sessionId);
		if (!session) {
			return;
		}

		if (typingIntervalRef.current) {
			clearInterval(typingIntervalRef.current);
			typingIntervalRef.current = null;
		}

		setIsTyping(false);
		setInput('');
		setActiveSessionId(sessionId);
		setMessages(session.messages || INITIAL_MESSAGES);
	};

	const typeAssistantReply = (fullReply) => {
		const typingId = `assistant-${Date.now()}`;
		let charIndex = 0;

		setIsTyping(true);
		setMessages((prev) => [...prev, { id: typingId, role: 'assistant', content: '' }]);

		typingIntervalRef.current = setInterval(() => {
			charIndex += 1;
			const nextContent = fullReply.slice(0, charIndex);

			setMessages((prev) =>
				prev.map((message) =>
					message.id === typingId ? { ...message, content: nextContent } : message
				)
			);

			if (charIndex >= fullReply.length) {
				clearInterval(typingIntervalRef.current);
				typingIntervalRef.current = null;
				setIsTyping(false);
			}
		}, 16);
	};

	const handleSend = () => {
		const nextMessage = input.trim();
		if (!nextMessage || isTyping) {
			return;
		}

		setMessages((prev) => [
			...prev,
			{ id: `user-${Date.now()}`, role: 'user', content: nextMessage },
		]);
		setInput('');

		window.setTimeout(() => {
			typeAssistantReply(getAssistantReply(nextMessage));
		}, 220);
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	};

	return (
		<PluginSidebar
			name={PLUGIN_NAME}
			title={__('AI Design Assistant', 'blockish')}
			icon={sidebarIcon}
			className="blockish-ai-assistant-sidebar"
		>
			<div
				className="blockish-ai-assistant"
				ref={setAssistantRoot}
				style={panelHeight ? { height: `${panelHeight}px` } : undefined}
			>
				<AssistantHeader
					onResetChat={resetChat}
					chatSessions={[...chatSessions].sort((a, b) => b.updatedAt - a.updatedAt)}
					activeSessionId={activeSessionId}
					onSelectSession={handleSelectSession}
					currentTitle={activeSessionTitle}
				/>
				<AssistantMessages messages={messages} isTyping={isTyping} chatBodyRef={chatBodyRef} />
				<AssistantComposer
					input={input}
					onInputChange={(event) => setInput(event.target.value)}
					onKeyDown={handleKeyDown}
					onSend={handleSend}
					isTyping={isTyping}
					providerLabel={getProviderLabel(activeProvider)}
					onProviderChange={handleProviderChange}
					providerSaving={providerSaving}
				/>
			</div>
		</PluginSidebar>
	);
}

registerPlugin(PLUGIN_NAME, { render: AIDesignAssistantSidebar });
