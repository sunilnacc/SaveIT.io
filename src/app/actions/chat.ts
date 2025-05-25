'use server';

/**
 * Server actions for chat functionality
 * This file contains server-side functions that can be called from client components
 */

import { chatWithUser, streamChatWithUser } from '@/ai/flows/chat';

export type ChatMessage = {
  content: string;
  isUser: boolean;
};

// Non-streaming version for compatibility
export async function getChatResponse(message: string, chatHistory: ChatMessage[] = []) {
  try {
    return await chatWithUser({ 
      message, 
      chatHistory 
    });
  } catch (error) {
    console.error('Error getting chat response:', error);
    throw new Error('Failed to get chat response');
  }
}

// Streaming version that returns a ReadableStream
export async function getStreamingChatResponse(message: string, chatHistory: ChatMessage[] = []) {
  try {
    // Create a new TransformStream to handle the streaming response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    
    // Start the streaming process
    streamChatWithUser({ message, chatHistory }, {
      onPartialResponse: async (partialResponse) => {
        try {
          // Encode the partial response as a JSON string and write it to the stream
          const data = JSON.stringify({
            type: 'partial',
            content: partialResponse.partial,
            isRecipeRelated: partialResponse.isRecipeRelated
          });
          await writer.write(new TextEncoder().encode(data + '\n'));
        } catch (err) {
          console.error('Error writing partial response:', err);
        }
      },
      onCompletion: async (finalResponse) => {
        try {
          // Encode the final response as a JSON string and write it to the stream
          const data = JSON.stringify({
            type: 'complete',
            content: finalResponse.response,
            isRecipeRelated: finalResponse.isRecipeRelated
          });
          await writer.write(new TextEncoder().encode(data + '\n'));
          await writer.close();
        } catch (err) {
          console.error('Error writing final response:', err);
          await writer.close();
        }
      },
      onError: async (error) => {
        console.error('Error in streaming chat:', error);
        try {
          const errorData = JSON.stringify({
            type: 'error',
            content: 'Sorry, there was an error processing your request.'
          });
          await writer.write(new TextEncoder().encode(errorData + '\n'));
          await writer.close();
        } catch (err) {
          console.error('Error writing error response:', err);
          await writer.close();
        }
      }
    });
    
    return readable;
  } catch (error) {
    console.error('Error setting up streaming chat response:', error);
    throw new Error('Failed to set up streaming chat response');
  }
}
