"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User as UserIcon, Sparkles, Search, ChefHat, BarChart2 } from 'lucide-react';
import { PlaceholdersAndVanishInput } from '@/components/ui/placeholders-and-vanish-input';
import { RecipeAssistant } from '@/components/ai/RecipeAssistant';
import Link from 'next/link';
import Header from '@/components/savvy-cart/Header';

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
    <div className="flex flex-col h-screen bg-background">
      {/* Use the same Header component as the compare page */}
      <Header />
      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {/* Welcome Screen */}
        {showWelcome && (
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
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <Bot size={16} className="text-primary-foreground" />
                    </div>
                  </div>
                )}
                <div className={`${message.isUser ? 'max-w-[80%]' : 'max-w-[90%]'}`}>
                  <div 
                    className={`inline-block px-4 py-2.5 rounded-2xl ${
                      message.isUser 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
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
                  <Send size={16} />
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
