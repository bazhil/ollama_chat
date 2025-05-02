"use server";

import { z } from 'zod';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

const OllamaResponseSchema = z.object({
  model: z.string(),
  created_at: z.string(),
  message: MessageSchema,
  done: z.boolean(),
  total_duration: z.number().optional(),
  load_duration: z.number().optional(),
  prompt_eval_count: z.number().optional(),
  prompt_eval_duration: z.number().optional(),
  eval_count: z.number().optional(),
  eval_duration: z.number().optional(),
});

const OllamaErrorResponseSchema = z.object({
  error: z.string(),
});

type OllamaResponse = z.infer<typeof OllamaResponseSchema>;
type OllamaErrorResponse = z.infer<typeof OllamaErrorResponseSchema>;


// Define the return type for the server action
interface ActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

// Make sure OLLAMA_HOST is set in your environment variables
// For Docker Compose, this will typically be 'http://ollama:11434'
const OLLAMA_API_URL = process.env.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = 'deepseek-r1'; // Model specified in the request

export async function sendMessageToOllama(userInput: string): Promise<ActionResult> {
  try {
    console.log(`Sending message to Ollama at ${OLLAMA_API_URL}/api/chat`);
    const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'user', content: userInput }],
        stream: false, // We want the full response, not a stream
      }),
    });

    console.log(`Ollama response status: ${response.status}`);

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Ollama API Error (${response.status}): ${errorText}`);
         try {
            const errorJson = JSON.parse(errorText) as OllamaErrorResponse;
            if (OllamaErrorResponseSchema.safeParse(errorJson).success) {
                return { success: false, error: errorJson.error };
            }
         } catch (parseError) {
            // If parsing fails, return the raw text
         }
        return { success: false, error: `Ollama API Error (${response.status}): ${errorText}` };
    }

    const data: OllamaResponse = await response.json();
    console.log('Ollama response data:', data);

    // Validate the response structure
    const parsedData = OllamaResponseSchema.safeParse(data);

    if (!parsedData.success) {
        console.error("Invalid response structure from Ollama:", parsedData.error);
        return { success: false, error: "Received an invalid response structure from Ollama." };
    }

    return { success: true, message: parsedData.data.message.content };

  } catch (error) {
    console.error('Network or fetch error:', error);
    if (error instanceof Error) {
      return { success: false, error: `Network error: ${error.message}` };
    }
    return { success: false, error: 'An unknown network error occurred.' };
  }
}
