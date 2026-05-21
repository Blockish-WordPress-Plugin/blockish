import { __ } from '@wordpress/i18n';

const getSchemaMessageFromText = (text) => {
	if (typeof text !== 'string' || !text.trim().startsWith('{')) {
		return '';
	}

	try {
		const parsed = JSON.parse(text);

		if (parsed?.schema?.new) {
			return typeof parsed.message === 'string' && parsed.message.trim()
				? parsed.message
				: __('The block structure is ready.', 'blockish');
		}
	} catch (error) {
		return '';
	}

	return '';
};

export const isAssistantSchemaContent = (text) => Boolean(getSchemaMessageFromText(text));

export const getAssistantContent = (response) => {
	const responseData = response?.data || response;

	if (typeof responseData?.message === 'string') {
		return getSchemaMessageFromText(responseData.message) || responseData.message;
	}

	if (typeof response === 'string') {
		return getSchemaMessageFromText(response) || response;
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

export const getAssistantTodo = (response) => {
	const responseData = response?.data || response;
	const todo = responseData?.todo;

	return Array.isArray(todo) ? todo.filter(Boolean) : [];
};

export const getAssistantSummary = (response) => {
	const responseData = response?.data || response;
	return typeof responseData?.summary === 'string' ? responseData.summary : '';
};

export const getAssistantMetrics = (response) => {
	const responseData = response?.data || response;
	const metrics = responseData?.metrics;

	return metrics && typeof metrics === 'object' ? metrics : null;
};

const getAssistantSocketConfig = () => {
	const config = window?.blockishAiDesignAssistant || {};

	return {
		token: config.assistantWsAuthToken || '',
		url: config.assistantWsUrl || '',
	};
};

const createRequestId = () => (
	typeof globalThis?.crypto?.randomUUID === 'function'
		? globalThis.crypto.randomUUID()
		: `assistant-${Date.now()}-${Math.random().toString(16).slice(2)}`
);

const createAbortError = () => {
	const error = new Error(__('Assistant request was cancelled.', 'blockish'));
	error.name = 'AbortError';
	return error;
};

const createSocketUrl = () => {
	const { token, url } = getAssistantSocketConfig();

	if (!url) {
		throw new Error(__('Assistant WebSocket URL is missing.', 'blockish'));
	}

	if (!token) {
		throw new Error(__('Assistant authentication token is missing.', 'blockish'));
	}

	const socketUrl = new URL(url);
	socketUrl.searchParams.set('token', token);

	return socketUrl.toString();
};

const normalizeStatusEventData = (eventData) => ({
	...eventData,
	step: eventData?.data?.message || eventData?.step || eventData?.message || '',
});

const formatLogDuration = (duration) => `${Math.round(duration)}ms`;

const createAssistantSocketLogger = () => {
	const startedAt = performance.now();
	let previousAt = startedAt;

	return (label, data = {}) => {
		const now = performance.now();
		const elapsedMs = now - startedAt;
		const sincePreviousMs = now - previousAt;
		previousAt = now;

		console.log(
			`[Blockish AI][WS +${formatLogDuration(elapsedMs)} Δ${formatLogDuration(sincePreviousMs)}] ${label}`,
			{
				timing: {
					elapsedMs: Math.round(elapsedMs),
					sincePreviousMs: Math.round(sincePreviousMs),
				},
				...data,
			}
		);
	};
};

export const requestAssistant = async (payload, signal, onChunk, onEvent) => (
	new Promise((resolve, reject) => {
		const requestId = createRequestId();
		const socketUrl = createSocketUrl();
		const socket = new WebSocket(socketUrl);
		const logAssistantSocketEvent = createAssistantSocketLogger();
		let settled = false;
		let finalResponse = null;

		logAssistantSocketEvent('connecting', {
			requestId,
			url: socketUrl.replace(/token=[^&]+/, 'token=[hidden]'),
			payload,
		});

		const cleanup = () => {
			signal?.removeEventListener('abort', abortRequest);
		};

		const settle = (callback, value) => {
			if (settled) {
				return;
			}

			settled = true;
			cleanup();
			callback(value);
		};

		const closeSocket = () => {
			if (
				socket.readyState === WebSocket.OPEN ||
				socket.readyState === WebSocket.CONNECTING
			) {
				socket.close();
			}
		};

		function abortRequest() {
			logAssistantSocketEvent('cancel requested', { requestId });

			if (socket.readyState === WebSocket.OPEN) {
				socket.send(JSON.stringify({
					type: 'assistant.cancel',
					requestId,
				}));
				window.setTimeout(closeSocket, 100);
			} else {
				closeSocket();
			}

			settle(reject, createAbortError());
		}

		if (signal?.aborted) {
			abortRequest();
			return;
		}

		signal?.addEventListener('abort', abortRequest, { once: true });

		socket.addEventListener('open', async () => {
			logAssistantSocketEvent('connected', { requestId });

			if (onEvent) {
				await onEvent('status', {
					step: __('Connected to assistant', 'blockish'),
				});
			}

			socket.send(JSON.stringify({
				type: 'assistant.request',
				requestId,
				body: payload,
			}));
			logAssistantSocketEvent('request sent', { requestId, payload });
		});

		socket.addEventListener('message', async (event) => {
			let eventData;

			try {
				eventData = JSON.parse(event.data);
			} catch (error) {
				logAssistantSocketEvent('raw message', {
					requestId,
					data: event.data,
				});
				if (onChunk) {
					await onChunk(event.data);
				}
				return;
			}

			const eventType = eventData?.type || '';
			logAssistantSocketEvent('event received', {
				requestId,
				type: eventType,
				data: eventData,
			});

			if (eventType === 'assistant.status') {
				if (onEvent) {
					await onEvent('status', normalizeStatusEventData(eventData));
				}
				return;
			}

			if (eventType === 'assistant.tool_start') {
				logAssistantSocketEvent('tool started', {
					requestId,
					agent: eventData?.data?.agent || '',
					tool: eventData?.data?.name || '',
					input: eventData?.data?.input,
				});
				if (onEvent) {
					await onEvent('tool_start', eventData?.data || {});
				}
				return;
			}

			if (eventType === 'assistant.tool_end') {
				logAssistantSocketEvent('tool completed', {
					requestId,
					agent: eventData?.data?.agent || '',
					tool: eventData?.data?.name || '',
					durationMs: eventData?.data?.durationMs,
					status: eventData?.data?.status,
					output: eventData?.data?.output,
					error: eventData?.data?.error,
				});
				if (onEvent) {
					await onEvent('tool_end', eventData?.data || {});
				}
				return;
			}

			if (eventType === 'assistant.interaction') {
				const interactionData = eventData?.data || {};
				if (onEvent) {
					await onEvent('interaction', interactionData);
				}
				closeSocket();
				settle(resolve, {
					ok: true,
					data: {
						message: interactionData.message || '',
						interaction: interactionData.interaction || null,
						reasoning: [],
						todo: [],
						summary: '',
						schema: { prev: null, new: null },
					},
				});
				return;
			}

			if (eventType === 'assistant.interrupt') {
				const interruptData = eventData?.data || {};
				if (onEvent) {
					await onEvent('interaction', interruptData);
				}
				closeSocket();
				settle(resolve, {
					ok: true,
					data: {
						message: interruptData.message || '',
						interaction: interruptData.interaction || null,
						reasoning: [],
						todo: [],
						summary: '',
						schema: { prev: null, new: null },
					},
				});
				return;
			}

			if (eventType === 'assistant.delta') {
				const chunk = eventData?.data?.delta || eventData?.delta || '';

				if (chunk && onChunk) {
					await onChunk(chunk);
				}
				return;
			}

			if (eventType === 'assistant.answer_done') {
				if (onEvent) {
					await onEvent('answer_done', {});
				}
				return;
			}

			if (eventType === 'assistant.final') {
				finalResponse = {
					ok: eventData?.ok !== false,
					data: eventData?.data,
				};
				logAssistantSocketEvent('final response received', {
					requestId,
					response: finalResponse,
				});
				closeSocket();
				settle(resolve, finalResponse);
				return;
			}

			if (eventType === 'assistant.done') {
				closeSocket();
				settle(resolve, finalResponse);
				return;
			}

			if (eventType === 'assistant.cancelled') {
				closeSocket();
				settle(reject, createAbortError());
				return;
			}

			if (eventType === 'assistant.error') {
				closeSocket();
				settle(
					reject,
					new Error(eventData?.error || __('Assistant request failed.', 'blockish'))
				);
			}
		});

		socket.addEventListener('error', (event) => {
			logAssistantSocketEvent('connection error', { requestId, event });
			settle(reject, new Error(__('Assistant WebSocket connection failed.', 'blockish')));
		});

		socket.addEventListener('close', (event) => {
			logAssistantSocketEvent('closed', {
				requestId,
				code: event.code,
				reason: event.reason,
				wasClean: event.wasClean,
			});

			if (settled) {
				return;
			}

			if (finalResponse) {
				settle(resolve, finalResponse);
				return;
			}

			settle(reject, new Error(__('Assistant WebSocket connection closed.', 'blockish')));
		});
	})
);
