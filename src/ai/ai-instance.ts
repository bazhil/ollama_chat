import {genkit} from 'genkit';
// import {googleAI} from '@genkit-ai/googleai'; // Remove Google AI import

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    // Remove googleAI plugin instance
    // googleAI({
    //   apiKey: process.env.GOOGLE_GENAI_API_KEY,
    // }),
  ],
  // Remove default model as it's not needed for direct Ollama connection via fetch
  // model: 'googleai/gemini-2.0-flash',
  logLevel: 'debug', // Optional: Set log level for debugging
  enableTracing: true, // Optional: Enable tracing if needed
});
