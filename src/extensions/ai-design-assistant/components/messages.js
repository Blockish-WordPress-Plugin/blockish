export default function AssistantMessages({ messages, isTyping, chatBodyRef }) {
	return (
		<div className="blockish-ai-assistant-chat" ref={chatBodyRef}>
			{messages.map((message) => (
				<div
					key={message.id}
					className={`blockish-ai-assistant-message blockish-ai-assistant-message--${message.role}`}
				>
					<p>{message.content || ' '}</p>
					{isTyping && message.role === 'assistant' && !message.content && (
						<span className="blockish-ai-assistant-caret" aria-hidden="true" />
					)}
				</div>
			))}
		</div>
	);
}
