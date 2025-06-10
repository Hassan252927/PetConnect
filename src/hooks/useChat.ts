import { useState, useEffect } from 'react';
import { getPetAssistantResponse, simulateAIResponse } from '../services/aiService';

// Define types
type AIRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: AIRole;
  content: string;
  timestamp: Date;
}

interface UseChatOptions {
  initialMessages?: ChatMessage[];
  storageKey?: string;
  maxStoredMessages?: number;
}

export const useChat = ({
  initialMessages = [],
  storageKey = 'pet-connect-chat',
  maxStoredMessages = 50
}: UseChatOptions = {}) => {
  // Initialize messages from localStorage or default
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window === 'undefined') return initialMessages;
    
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return initialMessages;
      
      // Parse stored messages and convert timestamp strings back to Date objects
      const parsed = JSON.parse(stored);
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    } catch (error) {
      console.error('Failed to load chat messages from localStorage:', error);
      return initialMessages;
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [fullResponse, setFullResponse] = useState('');

  // Simulate typing effect for AI responses
  useEffect(() => {
    if (fullResponse && isTyping) {
      const timeout = setTimeout(() => {
        if (currentResponse.length < fullResponse.length) {
          setCurrentResponse(fullResponse.substring(0, currentResponse.length + 1));
        } else {
          setIsTyping(false);
        }
      }, 15); // Adjust speed by changing timeout duration
      return () => clearTimeout(timeout);
    }
  }, [currentResponse, fullResponse, isTyping]);

  // Store messages in localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Store only the most recent messages to avoid localStorage size limits
      const messagesToStore = messages.slice(-maxStoredMessages);
      localStorage.setItem(storageKey, JSON.stringify(messagesToStore));
    } catch (error) {
      console.error('Failed to store chat messages in localStorage:', error);
    }
  }, [messages, storageKey, maxStoredMessages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setIsLoading(true);

    try {
      // Get previous messages for context (excluding system messages)
      const messageHistory = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({ role: msg.role, content: msg.content }));
      
      // Use the AI service to get a response
      const response = await getPetAssistantResponse(content, messageHistory);
      setFullResponse(response);
      setCurrentResponse('');
      setIsTyping(true);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again later.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    // Keep only system messages and remove the rest
    const systemMessages = messages.filter(msg => msg.role === 'system');
    setMessages(systemMessages);
    
    // Clear from localStorage
    try {
      localStorage.setItem(storageKey, JSON.stringify(systemMessages));
    } catch (error) {
      console.error('Failed to clear chat messages from localStorage:', error);
    }
  };

  return {
    messages,
    isLoading,
    isTyping,
    currentResponse,
    sendMessage,
    clearMessages,
  };
};

export default useChat; 