/**
 * @fileOverview A general chat AI agent that handles conversational interactions.
 * - chatWithUser - Handles general chat interactions with users
 * - streamChatWithUser - Handles streaming chat interactions with users
 *
 * NOTE: This file is imported by server components. All exported functions should be async.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Helper function to clean JSON from response text
function cleanJsonFromText(text: string): string {
  // Remove JSON blocks with backticks
  text = text.replace(/```json[\s\S]*?```/g, '');
  text = text.replace(/```[\s\S]*?```/g, '');
  
  // Remove raw JSON objects
  text = text.replace(/\{\s*"[^"]*"\s*:\s*(?:true|false|"[^"]*")(?:\s*,\s*"[^"]*"\s*:\s*(?:true|false|"[^"]*"))*\s*\}/g, '');
  
  // Remove recipe assistant prompts
  text = text.replace(/Would you like me to activate the recipe assistant[^?]*\?/g, '');
  text = text.replace(/isRecipeRelated\s*:\s*(?:true|false)/g, '');
  
  // Clean up any extra whitespace from the removals
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n');
  text = text.replace(/\s{2,}/g, ' ');
  text = text.trim();
  
  return text;
}

// Define input/output schemas
export const ChatInput = z.object({
  message: z.string().describe('The user message to respond to.'),
  chatHistory: z.array(z.object({
    content: z.string(),
    isUser: z.boolean()
  })).optional().describe('Previous chat history for context.')
});

export const ChatOutput = z.object({
  response: z.string().describe('The AI response to the user message.'),
  isRecipeRelated: z.boolean().describe('Whether the conversation is about recipes and could benefit from the recipe assistant.')
});

// Define streaming output types
export interface StreamingPartialResponse {
  partial: string;
  isRecipeRelated: boolean;
}

export interface StreamingCallbacks {
  onPartialResponse: (partialResponse: StreamingPartialResponse) => Promise<void>;
  onCompletion: (finalResponse: z.infer<typeof ChatOutput>) => Promise<void>;
  onError: (error: Error) => Promise<void>;
}

// Define the chat prompt
const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: { schema: ChatInput },
  output: { schema: ChatOutput },
  prompt: `You are SaveIT.ai, a shopping assistant that helps users find the best deals on products and answers questions about shopping.

You are friendly, helpful, and concise. You provide accurate information about shopping, products, and deals.

Respond to the user's message in a conversational manner. If the user is asking about recipes, cooking, or food preparation, indicate that this is recipe-related in your response.

User message: {{{message}}}

{{#if chatHistory}}
Previous conversation:
{{#each chatHistory}}
{{#if isUser}}User: {{else}}Assistant: {{/if}}{{content}}
{{/each}}
{{/if}}

Respond to the user's message and determine if the query is recipe-related. If the user is asking about recipes, cooking ingredients, or how to prepare food, set isRecipeRelated to true.`
});

// Define the chat flow
export const chatWithUser = ai.defineFlow(
  {
    name: 'chatWithUser',
    inputSchema: ChatInput,
    outputSchema: ChatOutput,
  },
  async (input) => {
    try {
      const { output } = await chatPrompt(input);
      return output!;
    } catch (error) {
      console.error('Error in chatWithUser:', error);
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        isRecipeRelated: false
      };
    }
  }
);

// Define the streaming chat flow
export async function streamChatWithUser(
  input: z.infer<typeof ChatInput>,
  callbacks: StreamingCallbacks
): Promise<void> {
  try {
    // First, send an immediate partial response to indicate processing
    await callbacks.onPartialResponse({
      partial: '',
      isRecipeRelated: false
    });
    
    // Create the prompt for streaming
    const promptText = `You are SaveIT.ai, a shopping assistant that helps users find the best deals on products and answers questions about shopping.

You are friendly, helpful, and concise. You provide accurate information about shopping, products, and deals.

Respond to the user's message in a conversational manner. If the user is asking about recipes, cooking, or food preparation, indicate that this is recipe-related in your response.

User message: ${input.message}

${input.chatHistory ? `Previous conversation:
${input.chatHistory.map(msg => `${msg.isUser ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}
` : ''}

Respond to the user's message and determine if the query is recipe-related. If the user is asking about recipes, cooking ingredients, or how to prepare food, set isRecipeRelated to true.`;
    
    // Use the generateStream method to get streaming responses
    // Note: We're not using structured output for streaming to avoid JSON in text
    const { stream, response } = await ai.generateStream({
      prompt: promptText
    });
    
    // Track if we've detected recipe-related content
    let isRecipeRelated = false;
    let fullResponse = '';
    
    // Process the stream chunks as they arrive
    for await (const chunk of stream) {
      if (chunk.text) {
        // Update the full response with the new chunk
        fullResponse += chunk.text;
        
        // Clean any JSON from the response
        const cleanedResponse = cleanJsonFromText(fullResponse);
        
        // Check for recipe-related keywords in the partial response
        const lowerResponse = cleanedResponse.toLowerCase();
        if (
          lowerResponse.includes('recipe') ||
          lowerResponse.includes('cook') ||
          lowerResponse.includes('ingredient') ||
          lowerResponse.includes('food preparation')
        ) {
          isRecipeRelated = true;
        }
        
        // Send the partial response
        await callbacks.onPartialResponse({
          partial: cleanedResponse,
          isRecipeRelated
        });
      }
    }
    
    // Get the final complete response
    const finalResponse = await response;
    
    // Send the final complete response
    // Get the final text and clean any JSON from it
    const finalText = finalResponse.text || fullResponse;
    const cleanedFinalText = cleanJsonFromText(finalText);
    
    // Check for recipe-related keywords in the final response
    const lowerFinalText = cleanedFinalText.toLowerCase();
    const finalIsRecipeRelated = 
      lowerFinalText.includes('recipe') ||
      lowerFinalText.includes('cook') ||
      lowerFinalText.includes('ingredient') ||
      lowerFinalText.includes('food preparation') ||
      isRecipeRelated;
      
    await callbacks.onCompletion({
      response: cleanedFinalText,
      isRecipeRelated: finalIsRecipeRelated
    });
  } catch (error) {
    console.error('Error in streamChatWithUser:', error);
    await callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
  }
}
