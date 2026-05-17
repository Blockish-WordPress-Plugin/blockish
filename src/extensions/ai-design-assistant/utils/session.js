import {
	ASSISTANT_CONTEXT_EVENT,
	ASSISTANT_CONTEXT_KEY,
	CHAT_SESSION_EVENT,
	CHAT_SESSION_KEY,
} from '../constants';

const dispatchSessionChange = (chatId = null) => {
	if (typeof window === 'undefined') {
		return;
	}

	window.dispatchEvent(
		new CustomEvent(CHAT_SESSION_EVENT, {
			detail: { chatId },
		})
	);
};

export const getSessionChatId = () => {
	if (typeof window === 'undefined') {
		return null;
	}

	return window.sessionStorage.getItem(CHAT_SESSION_KEY);
};

export const setSessionChatId = (chatId) => {
	if (typeof window === 'undefined') {
		return;
	}

	const nextChatId = `${chatId}`;
	window.sessionStorage.setItem(CHAT_SESSION_KEY, nextChatId);
	dispatchSessionChange(nextChatId);
};

export const clearSessionChatId = () => {
	if (typeof window === 'undefined') {
		return;
	}

	window.sessionStorage.removeItem(CHAT_SESSION_KEY);
	dispatchSessionChange(null);
};

const dispatchAssistantContextChange = (context = null) => {
	if (typeof window === 'undefined') {
		return;
	}

	window.dispatchEvent(
		new CustomEvent(ASSISTANT_CONTEXT_EVENT, {
			detail: { context },
		})
	);
};

export const getAssistantContext = () => {
	if (typeof window === 'undefined') {
		return null;
	}

	const storedContext = window.sessionStorage.getItem(ASSISTANT_CONTEXT_KEY);

	if (!storedContext) {
		return null;
	}

	try {
		return JSON.parse(storedContext);
	} catch (error) {
		return null;
	}
};

export const setAssistantContext = (context) => {
	if (typeof window === 'undefined') {
		return;
	}

	window.sessionStorage.setItem(
		ASSISTANT_CONTEXT_KEY,
		JSON.stringify(context)
	);
	dispatchAssistantContextChange(context);
};

export const clearAssistantContext = () => {
	if (typeof window === 'undefined') {
		return;
	}

	window.sessionStorage.removeItem(ASSISTANT_CONTEXT_KEY);
	dispatchAssistantContextChange(null);
};
