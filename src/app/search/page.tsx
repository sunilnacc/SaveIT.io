"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, Search, ChefHat, BarChart2 } from 'lucide-react';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { RecipeAssistant } from '@/components/ai/RecipeAssistant';
import Link from 'next/link';

type Message = {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
};

// Check if a message is about recipes
const isRecipeQuery = (query: string): boolean => {
  const recipeKeywords = ['recipe', 'cook', 'make', 'prepare', 'ingredients for', 'how to make'];
  const lowerQuery = query.toLowerCase();
  return recipeKeywords.some(keyword => lowerQuery.includes(keyword));
};

export default function SearchPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showRecipeAssistant, setShowRecipeAssistant] = useState(false);
  const [recipeQuery, setRecipeQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement> | string) => {
    // Prevent default if it's a form event
    if (typeof e !== 'string') {
      e.preventDefault();
    }
    
    // Get the message content
    const messageContent = typeof e === 'string' ? e : input.trim();
    if (!messageContent) return;

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

    // Check if this is a recipe query
    if (isRecipeQuery(messageContent)) {
      setRecipeQuery(messageContent);
      setShowRecipeAssistant(true);
      
      // Add a message about the recipe assistant
      setTimeout(() => {
        handleNewMessage("I can help you find the ingredients and compare prices across different platforms. Here's what you'll need:");
      }, 500);
    } else {
      // Handle other types of queries
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `I can help you find the best deals on products. Try asking about a recipe (e.g., "I want to make pizza") to see how I can help you shop for ingredients.`,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botResponse]);
      }, 1000);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSubmit(suggestion);
  };

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Simple Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-orange-500" />
              <h1 className="text-lg font-semibold">SaveIT.ai</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/compare" className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-800/50 text-orange-600 dark:text-orange-400 transition-colors">
                <BarChart2 className="h-4 w-4" />
                <span className="text-sm font-medium">Compare</span>
              </Link>
            </div>
            <button className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Sign in
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div 
        ref={chatContainerRef}
        className={`flex-1 flex flex-col overflow-hidden w-full max-w-3xl mx-auto px-4 ${showRecipeAssistant ? 'overflow-y-auto' : ''}`}
      >
        {/* Welcome Message */}
        {showWelcome && messages.length === 0 && !showRecipeAssistant && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 px-4">
            <div className="w-full max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-6">
                <Search className="w-8 h-8 text-orange-500" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What would you like to compare today?
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                I can help you find the best prices across multiple platforms. Just tell me what you're looking for!
              </p>
              
              <div className="grid grid-cols-1 gap-3 max-w-xl mx-auto">
                {prompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(prompt)}
                    className="flex items-center space-x-3 p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-orange-500">
                      <Search className="w-4 h-4" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Messages */}
        <div className={`flex-1 overflow-y-auto py-4 ${showWelcome || showRecipeAssistant ? 'hidden' : 'block'}`}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} py-4`}
            >
              <div className={`flex w-full max-w-3xl ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                {!message.isUser && (
                  <div className="flex-shrink-0 mr-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                  </div>
                )}
                <div className={`${message.isUser ? 'max-w-[80%]' : 'max-w-[90%]'}`}>
                  <div 
                    className={`inline-block px-4 py-2.5 rounded-2xl ${
                      message.isUser 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <p className="leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Recipe Assistant */}
        {showRecipeAssistant && (
          <div className="flex-1 overflow-y-auto py-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ChefHat className="h-5 w-5 text-orange-500" />
                  <h3 className="font-medium">Recipe Assistant</h3>
                </div>
                <button 
                  onClick={handleBackToChat}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Back to chat
                </button>
              </div>
              <RecipeAssistant key="recipe-assistant" />
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="py-4 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto px-4">
            <div className="relative">
              <PlaceholdersAndVanishInput
                placeholders={prompts}
                onChange={(e) => setInput(e.target.value)}
                onSubmit={handleSubmit}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <div className={`p-1 rounded-full ${
                  input.trim() ? 'bg-orange-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  <Send size={16} />
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
              SaveIT.ai can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
