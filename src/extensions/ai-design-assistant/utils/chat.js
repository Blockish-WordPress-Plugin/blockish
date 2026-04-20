import { __ } from '@wordpress/i18n';

export const INITIAL_MESSAGES = [
	{
		id: 'welcome',
		role: 'assistant',
		content: __('Hi! Tell me what you want to improve and I will suggest a design direction.', 'blockish'),
	},
];

export const getAssistantReply = (prompt) => {
	const cleaned = prompt.trim();

	if (!cleaned) {
		return __('Share your design goal and I will help you shape it.', 'blockish');
	}

	return __(
		'Great direction. I suggest: 1) simplify spacing rhythm, 2) tighten heading hierarchy, 3) increase contrast for key actions. If you want, I can generate a more minimal version next.',
		'blockish'
	);
};

export const getChatTitle = (sessionMessages = []) => {
	const firstUserMessage = sessionMessages.find(
		(message) => message.role === 'user' && message.content?.trim()
	);

	if (!firstUserMessage) {
		return __('New chat', 'blockish');
	}

	const cleaned = firstUserMessage.content
		.replace(/\s+/g, ' ')
		.replace(/[^\w\s]/g, '')
		.trim();

	if (!cleaned) {
		return __('New chat', 'blockish');
	}

	const words = cleaned.split(' ').slice(0, 6);
	const title = words.join(' ');

	return title.length > 40 ? `${title.slice(0, 40)}...` : title;
};
