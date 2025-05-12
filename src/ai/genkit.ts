
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  // Updated to a valid and current model.
  // Ensure GOOGLE_API_KEY is set in your environment variables.
  model: 'googleai/gemini-1.5-flash-latest', 
});
