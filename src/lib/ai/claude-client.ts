import { ClaudeAPIError } from './types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MODEL = 'claude-haiku-4-5';

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  usage: { input_tokens: number; output_tokens: number };
  model: string;
}

interface AnthropicErrorResponse {
  error: { message: string; type: string };
}

/**
 * Sends a completion request to the Anthropic Claude API.
 * Returns the generated text and token usage.
 * Throws ClaudeAPIError on 4xx/5xx responses.
 */
export async function generateCompletion(
  systemPrompt: string,
  userMessage: string,
  model: string = DEFAULT_MODEL,
): Promise<{ text: string; tokensUsed: number }> {
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new ClaudeAPIError(401, 'EXPO_PUBLIC_ANTHROPIC_API_KEY is not set');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const statusCode = response.status;

    if (statusCode === 429) {
      throw new ClaudeAPIError(429, 'Rate limit exceeded — retry after 60s');
    }

    let errorMessage = `API error ${statusCode}`;
    try {
      const errorBody = (await response.json()) as AnthropicErrorResponse;
      if (errorBody.error?.message) {
        errorMessage = errorBody.error.message;
      }
    } catch {
      // Use default error message if JSON parse fails
    }

    throw new ClaudeAPIError(statusCode, errorMessage);
  }

  const data = (await response.json()) as AnthropicResponse;

  return {
    text: data.content[0].text,
    tokensUsed: data.usage.input_tokens + data.usage.output_tokens,
  };
}
