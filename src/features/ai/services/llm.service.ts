import { generateObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type LlmProvider = 'openai' | 'ollama';

const categorySuggestionSchema = z.object({
  suggestedCategory: z.string(),
  suggestedSummary: z.string(),
});

function getProvider(): LlmProvider {
  return process.env.AI_PROVIDER?.toLowerCase() === 'ollama' ? 'ollama' : 'openai';
}

function getOpenAIModel() {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

function getOllamaModel() {
  return process.env.OLLAMA_MODEL || 'llama3.1:8b';
}

function getOllamaBaseUrl() {
  return (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/$/, '');
}

async function callOllamaChat(messages: ChatMessage[]) {
  const response = await fetch(`${getOllamaBaseUrl()}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: getOllamaModel(),
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Ollama request failed (${response.status}): ${details}`);
  }

  const data = (await response.json()) as { message?: { content?: string } };
  return data.message?.content?.trim() || '';
}

function parseJsonObject(text: string) {
  const fencedJson = text.match(/```json\s*([\s\S]*?)```/i)?.[1];
  const rawJson = fencedJson || text.match(/\{[\s\S]*\}/)?.[0] || text;
  return JSON.parse(rawJson);
}

export const llmService = {
  getProvider,

  async generateChatText({
    system,
    messages,
  }: {
    system: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  }) {
    if (getProvider() === 'ollama') {
      return callOllamaChat([{ role: 'system', content: system }, ...messages]);
    }

    const { text } = await generateText({
      model: openai(getOpenAIModel()),
      system,
      messages,
    });

    return text;
  },

  async suggestArticleCategory({
    text,
    categoryNames,
  }: {
    text: string;
    categoryNames: string;
  }) {
    const prompt = `Analyze the following article text and suggest a category and a short summary.

Available Categories: ${categoryNames || 'None yet'}

Article Text:
${text}`;

    if (getProvider() === 'ollama') {
      const response = await callOllamaChat([
        {
          role: 'system',
          content:
            'Return only valid JSON with these exact string keys: suggestedCategory, suggestedSummary.',
        },
        { role: 'user', content: prompt },
      ]);

      return categorySuggestionSchema.parse(parseJsonObject(response));
    }

    const { object } = await generateObject({
      model: openai(getOpenAIModel()),
      schema: categorySuggestionSchema,
      prompt,
    });

    return object;
  },
};
