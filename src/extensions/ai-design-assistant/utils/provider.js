export const getProviderLabel = (provider) => (provider === 'openai' ? 'OpenAI' : 'Gemini');

export const toggleProvider = (provider) => (provider === 'openai' ? 'gemini' : 'openai');
