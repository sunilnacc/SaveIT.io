"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, Search, ChefHat, BarChart2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { RecipeAssistant } from '@/components/ai/RecipeAssistant';
import Link from 'next/link';
import Header from '@/components/savvy-cart/Header';
import { getChatResponse, getStreamingChatResponse } from '@/app/actions/chat';
import { TypewriterEffectSmooth } from '@/components/ui/typewriter-effect';

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

// Check if a message is specifically about finding or making recipes
const isRecipeQuery = (query: string): boolean => {
  const recipeKeywords = ['recipe for', 'how to cook', 'how to make', 'ingredients for', 'recipe of'];
  const foodItems = ['pizza', 'pasta', 'cake', 'bread', 'cookies', 'biryani', 'curry', 'soup'];
  const cookingVerbs = ['bake', 'roast', 'grill', 'fry', 'cook'];
  
  const lowerQuery = query.toLowerCase();
  
  // Check for explicit recipe requests
  const hasRecipeKeyword = recipeKeywords.some(keyword => lowerQuery.includes(keyword));
  
  // Check for food items with intent to make them
  const hasFoodWithIntent = foodItems.some(food => {
    return lowerQuery.includes(food) && 
           (lowerQuery.includes('make') || 
            lowerQuery.includes('cook') || 
            cookingVerbs.some(verb => lowerQuery.includes(verb)));
  });
  
  return hasRecipeKeyword || hasFoodWithIntent;
};

// Determine if we should suggest the recipe assistant
const shouldSuggestRecipeAssistant = (query: string): boolean => {
  return isRecipeQuery(query);
};

export default function SearchPage() {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showRecipeAssistant, setShowRecipeAssistant] = useState(false);
  const [recipeQuery, setRecipeQuery] = useState('');
  const [suggestRecipeAssistant, setSuggestRecipeAssistant] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamAbortController = useRef<AbortController | null>(null);
  
  const handleNewMessage = useCallback((message: string) => {
    const botResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: message,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, botResponse]);
  }, []);
  
  const handleBackToChat = useCallback(() => {
    setShowRecipeAssistant(false);
  }, []);
  
  const prompts = [
    'I want to make a pizza',
    'Find me a recipe for pasta',
    'Ingredients for chocolate cake',
    'How to prepare biryani?',
  ];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus the input field on component mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Function to abort any ongoing streaming requests
  const abortStreamingRequest = useCallback(() => {
    if (streamAbortController.current) {
      streamAbortController.current.abort();
      streamAbortController.current = null;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement> | string) => {
    // Prevent default if it's a form event
    if (typeof e !== 'string') {
      e.preventDefault();
    }
    
    // Get the message content
    const messageContent = typeof e === 'string' ? e : input.trim();
    if (!messageContent) return;

    // Abort any ongoing streaming request
    abortStreamingRequest();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShowWelcome(false);

    // Set loading state and create a placeholder for the streaming message
    setIsLoading(true);
    const streamingId = (Date.now() + 1).toString();
    const initialStreamingMessage: Message = {
      id: streamingId,
      content: '',
      isUser: false,
      timestamp: new Date(),
    };
    setStreamingMessage(initialStreamingMessage);
    
    // Prepare chat history for API
    const chatHistory = messages.map(msg => ({
      content: msg.content,
      isUser: msg.isUser
    }));
    
    try {
      // Create a new AbortController for this request
      streamAbortController.current = new AbortController();
      const signal = streamAbortController.current.signal;
      
      // Initialize parallel API calls
      const apiCalls = [];
      
      // 1. Main chat response API call
      const chatResponsePromise = getStreamingChatResponse(messageContent, chatHistory);
      apiCalls.push(chatResponsePromise);
      
      // 2. Additional data API calls can be added here
      // For example, if we want to fetch product recommendations in parallel:
      // const productRecommendationsPromise = fetchProductRecommendations(messageContent);
      // apiCalls.push(productRecommendationsPromise);
      
      // Wait for the main chat response (we need this one to proceed)
      // Other API calls will continue in the background
      const streamResponse = await chatResponsePromise;
      
      if (!streamResponse) {
        throw new Error('No stream response received');
      }
      
      // Set up the reader
      const reader = streamResponse.getReader();
      let isRecipeRelated = false;
      let done = false;
      
      // Process the stream
      while (!done && !signal.aborted) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        
        if (done) break;
        
        // Decode the chunk
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        // Process each line (there might be multiple JSON objects in one chunk)
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'partial') {
              // Check for special commands (navigation)
              if (data.specialCommand && data.specialCommand.type === 'navigate') {
                // Handle navigation command
                const destination = data.specialCommand.destination;
                
                // Add the bot response message with a unique ID
                const botResponse: Message = {
                  id: Date.now().toString(), // Use a truly unique ID
                  content: data.content,
                  isUser: false,
                  timestamp: new Date(),
                };
                
                // Add the message to the list without relying on previous state
                setMessages(messages => {
                  const newMessages = [...messages];
                  newMessages.push(botResponse);
                  return newMessages;
                });
                
                // Clear the streaming message
                setStreamingMessage(null);
                setIsLoading(false);
                
                // Navigate to the specified destination
                setTimeout(() => {
                  router.push(destination);
                }, 500);
                
                // Break out of the stream processing
                reader.cancel();
                return;
              }
              
              // Update the streaming message with the partial content
              // Instead of replacing the entire content, which can cause rendering issues,
              // we'll set it directly without relying on the previous state
              setStreamingMessage({
                id: Date.now().toString(), // Use a truly unique ID
                content: data.content || '',
                isUser: false,
                timestamp: new Date(),
              });
              
              // Check if this is recipe-related
              if (data.isRecipeRelated) {
                isRecipeRelated = true;
              }
            } else if (data.type === 'complete') {
              // Final message - check if it's recipe-related
              isRecipeRelated = data.isRecipeRelated;
              
              // Clear the streaming message
              setStreamingMessage(null);
              
              // Check if the response already contains a recipe assistant prompt
              const hasRecipePrompt = data.content.toLowerCase().includes('recipe assistant') || 
                                     data.content.toLowerCase().includes('activate the recipe');
              
              // Wait for any remaining parallel API calls to complete
              try {
                // We can use Promise.allSettled to wait for all promises without failing if one rejects
                const results = await Promise.allSettled(apiCalls.filter(p => p !== chatResponsePromise));
                
                // Process additional API results if needed
                // results.forEach(result => {
                //   if (result.status === 'fulfilled') {
                //     // Handle successful API call results
                //     const additionalData = result.value;
                //     // Integrate additional data with the response if needed
                //   }
                // });
              } catch (parallelError) {
                console.error('Error with parallel API calls:', parallelError);
                // Continue with the main response even if parallel calls fail
              }
              
              if (isRecipeRelated && !hasRecipePrompt) {
                // For recipe-related queries, add a suggestion to use the recipe assistant
                setRecipeQuery(messageContent);
                setSuggestRecipeAssistant(true);
                
                // Create a new message with a unique ID to avoid rendering issues
                const botResponse: Message = {
                  id: Date.now().toString(), // Use a truly unique ID
                  content: `${data.content}\n\nWould you like me to activate the recipe assistant to help you find ingredients and compare prices across different platforms?`,
                  isUser: false,
                  timestamp: new Date(),
                };
                
                // Add the message to the list without relying on previous state
                setMessages(messages => {
                  const newMessages = [...messages];
                  newMessages.push(botResponse);
                  return newMessages;
                });
              } else {
                // For regular queries or if the response already contains a recipe prompt
                const botResponse: Message = {
                  id: Date.now().toString(), // Use a truly unique ID
                  content: data.content,
                  isUser: false,
                  timestamp: new Date(),
                };
                
                // Add the message to the list without relying on previous state
                setMessages(messages => {
                  const newMessages = [...messages];
                  newMessages.push(botResponse);
                  return newMessages;
                });
                
                // If the response already has a recipe prompt, set the recipe state
                if (hasRecipePrompt) {
                  setRecipeQuery(messageContent);
                  setSuggestRecipeAssistant(true);
                }
              }
            } else if (data.type === 'error') {
              throw new Error(data.content);
            }
          } catch (parseError) {
            console.error('Error parsing stream chunk:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Error with streaming chat response:', error);
      // Clear the streaming message
      setStreamingMessage(null);
      
      // Add an error message
      const errorMessage: Message = {
        id: streamingId,
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      streamAbortController.current = null;
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(suggestion);
  };

  // Handle user's response to recipe assistant suggestion
  const handleUserResponse = useCallback((message: Message) => {
    const content = message.content.toLowerCase();
    
    // Check if user wants to use the recipe assistant
    if (suggestRecipeAssistant && 
        (content.includes('yes') || 
         content.includes('sure') || 
         content.includes('okay') || 
         content.includes('ok') || 
         content.includes('please') || 
         content.includes('activate'))) {
      
      setShowRecipeAssistant(true);
      setSuggestRecipeAssistant(false);
      
      // Add a message about activating the recipe assistant
      setTimeout(() => {
        handleNewMessage("I've activated the recipe assistant. Here's what you'll need:");
      }, 300);
    } else if (suggestRecipeAssistant) {
      // User declined the recipe assistant
      setSuggestRecipeAssistant(false);
      
      setTimeout(() => {
        handleNewMessage("No problem! I'll continue as a regular chat assistant. How else can I help you today?");
      }, 300);
    }
  }, [suggestRecipeAssistant, handleNewMessage]);
  
  // Process new messages to check for user responses
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.isUser) {
        handleUserResponse(lastMessage);
      }
    }
  }, [messages, handleUserResponse]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Use the same Header component as the compare page */}
      <Header />
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {/* Main Content Area - Conditionally show welcome screen or chat+recipe content */}
        {showWelcome ? (
          /* Welcome Screen */
          <div className="flex-1 flex flex-col justify-center items-center py-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to SaveIT.ai</h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your AI shopping assistant that helps you find the best deals across multiple platforms.
              </p>
            </div>
            <div className="w-full max-w-md">
              <div className="bg-card rounded-lg border border-border p-4 mb-4">
                <h2 className="text-lg font-medium text-foreground mb-3">Try asking about:</h2>
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSuggestionClick(prompt)}
                    className="flex items-center space-x-3 p-3 text-left rounded-lg border border-border hover:bg-accent transition-colors group w-full mb-2"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:text-primary">
                      <Search className="w-4 h-4" />
                    </div>
                    <span className="text-foreground">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat and Recipe Content */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Messages - Only visible when recipe assistant is not active */}
            <div className={`flex-1 overflow-y-auto py-4 ${showRecipeAssistant ? 'hidden' : 'block'}`}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} py-4`}
                >
                  <div className={`flex w-full max-w-3xl ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                    {!message.isUser && (
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Bot size={16} className="text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    <div className={`${message.isUser ? 'max-w-[80%]' : 'max-w-[90%]'} break-words`}>
                      <div 
                        className={`block w-full px-4 py-2.5 rounded-2xl ${
                          message.isUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {message.isUser ? (
                          <p className="leading-relaxed whitespace-pre-wrap break-words overflow-visible">{message.content}</p>
                        ) : (
                          <p className="leading-relaxed whitespace-pre-wrap break-words overflow-visible">{message.content}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Streaming message (currently being generated) */}
              {streamingMessage && (
                <div
                  key="streaming-message"
                  className="flex justify-start py-4"
                >
                  <div className="flex w-full max-w-3xl justify-start">
                    <div className="flex-shrink-0 mr-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <Bot size={16} className="text-primary-foreground" />
                      </div>
                    </div>
                    <div className="max-w-[90%] break-words">
                      <div className="block w-full px-4 py-2.5 rounded-2xl bg-muted text-foreground">
                        {streamingMessage.content ? (
                          <p className="leading-relaxed whitespace-pre-wrap break-words overflow-visible">{streamingMessage.content}</p>
                        ) : (
                          <div className="flex items-center">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Recipe Assistant - Conditionally visible */}
            {showRecipeAssistant && (
              <div className="flex-1 overflow-y-auto py-4">
                <div className="bg-card rounded-lg border border-border p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <ChefHat className="h-5 w-5 text-primary" />
                      <h3 className="font-medium text-foreground">Recipe Assistant</h3>
                    </div>
                    <button 
                      onClick={handleBackToChat}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Back to chat
                    </button>
                  </div>
                  <RecipeAssistant key="recipe-assistant" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="py-4 border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4">
            <div className="relative">
              <PlaceholdersAndVanishInput
                placeholders={prompts}
                onChange={(e) => setInput(e.target.value)}
                onSubmit={handleSubmit}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <div className={`p-1 rounded-full ${
                  input.trim() ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">
              SaveIT.ai can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
