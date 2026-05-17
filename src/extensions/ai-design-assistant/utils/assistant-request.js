import { __ } from '@wordpress/i18n';

export const getAssistantContent = (response) => {
	const responseData = response?.data || response;

	if (typeof responseData?.message === 'string') {
		return responseData.message;
	}

	if (typeof response === 'string') {
		return response;
	}

	if (typeof response?.response === 'string') {
		try {
			const parsedResponse = JSON.parse(response.response);
			return getAssistantContent(parsedResponse);
		} catch (error) {
			return response.response;
		}
	}

	if (responseData) {
		return JSON.stringify(responseData, null, 2);
	}

	return __('I could not generate a response right now. Please try again.', 'blockish');
};

export const getAssistantInteraction = (response) => {
	const responseData = response?.data || response;

	return responseData?.interaction || null;
};

export const getAssistantSchema = (response) => {
	const responseData = response?.data || response;
	const schema = responseData?.schema;

	if (schema?.new) {
		return schema;
	}

	return null;
};

export const getAssistantReasoning = (response) => {
	const responseData = response?.data || response;
	const reasoning = responseData?.reasoning;

	return Array.isArray(reasoning) ? reasoning.filter(Boolean) : [];
};

const getRestUrl = (path) => {
	const root = window?.wpApiSettings?.root || '/wp-json/';
	return `${root.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const getFetchHeaders = () => {
	const headers = {
		'Accept': 'text/event-stream',
		'Content-Type': 'application/json',
	};
	const nonce = window?.wpApiSettings?.nonce;

	if (nonce) {
		headers['X-WP-Nonce'] = nonce;
	}

	return headers;
};

const parseStreamEvent = async (part, onChunk) => {
	const lines = part.split('\n');
	const eventLine = lines.find((line) => line.startsWith('event:'));
	const dataLine = lines.find((line) => line.startsWith('data:'));
	const eventName = eventLine?.replace(/^event:\s*/, '') || 'message';

	if (!dataLine) {
		return null;
	}

	const data = dataLine.replace(/^data:\s*/, '');

	if (data === '[DONE]') {
		return null;
	}

	let eventData;

	try {
		eventData = JSON.parse(data);
	} catch (error) {
		await onChunk(data);
		return null;
	}

	if (eventName === 'error') {
		throw new Error(eventData?.error || __('Assistant request failed.', 'blockish'));
	}

	const chunk = eventData.delta || eventData.message || eventData.content || '';

	if (chunk) {
		await onChunk(chunk);
	}

	return eventData.response || null;
};

const readAssistantStream = async (response, onChunk) => {
	const reader = response.body?.getReader();

	if (!reader) {
		return response.json();
	}

	const decoder = new TextDecoder();
	let buffer = '';
	let finalResponse = null;

	while (true) {
		const { done, value } = await reader.read();

		if (done) {
			break;
		}

		buffer += decoder.decode(value, { stream: true });
		const parts = buffer.split('\n\n');
		buffer = parts.pop() || '';

		for (const part of parts) {
			finalResponse = await parseStreamEvent(part, onChunk) || finalResponse;
		}
	}

	const remaining = buffer.trim();
	if (remaining) {
		try {
			return JSON.parse(remaining);
		} catch (error) {
			await onChunk(remaining);
		}
	}

	return finalResponse;
};

export const requestAssistant = async (payload, signal, onChunk) => {
	const response = await fetch(getRestUrl('/blockish/v1/assistant'), {
		method: 'POST',
		headers: getFetchHeaders(),
		body: JSON.stringify(payload),
		signal,
	});

	const contentType = response.headers.get('content-type') || '';

	if (!response.ok) {
		let errorMessage = __('Assistant request failed.', 'blockish');

		try {
			const errorResponse = await response.json();
			errorMessage = errorResponse?.error || errorResponse?.message || errorMessage;
		} catch (error) {
			// Keep the generic message when the server does not return JSON.
		}

		throw new Error(errorMessage);
	}

	if (contentType.includes('text/event-stream')) {
		return readAssistantStream(response, onChunk);
	}

	return response.json();
};
