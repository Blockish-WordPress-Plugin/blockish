import { INITIAL_MESSAGES } from "../utils/chat";

export default function AssistantMessages({ selectedChat }) {
	const messages = selectedChat?.content ? JSON.parse(selectedChat.content) : INITIAL_MESSAGES;
	return (
		<div className="blockish-ai-assistant-chat">
			{messages.map((message) => (
				<div
					key={message.id}
					className={`blockish-ai-assistant-message blockish-ai-assistant-message--${message.role}`}
				>
					<p>{message?.content}</p>
				</div>
			))}
		</div>
	);
}
