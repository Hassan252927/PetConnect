import React, { useState, useRef, useEffect } from 'react';
import useChat, { ChatMessage } from '../../hooks/useChat';

const FloatingChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const [input, setInput] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat with welcome message
  const initialMessages: ChatMessage[] = [
    {
      role: 'system',
      content: 'Welcome to the PetConnect AI Assistant! I can help you with pet care, training advice, breed information, nutrition, and other animal-related questions. Please note that I can only answer questions about animals and pets.',
      timestamp: new Date(),
    }
  ];

  const { 
    messages, 
    isLoading, 
    isTyping, 
    currentResponse, 
    sendMessage, 
    clearMessages 
  } = useChat({ initialMessages });

  // Add bounce animation periodically to attract attention
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 1000);
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Auto scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    sendMessage(input);
    setInput('');
  };

  // Determine if there are unread messages
  const hasUnreadMessages = messages.length > 1;

  // Suggested pet questions for quick selection
  const suggestedQuestions = [
    "What's the best dog breed for apartments?",
    "How often should I feed my cat?",
    "How do I train my puppy not to bite?",
    "What fish are easy to care for?",
    "What's a good first pet for kids?",
    "How long do rabbits live?",
  ];

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:bg-primary-dark transition-all duration-300 hover:shadow-xl z-50 ${
          isBouncing ? 'animate-bounce' : ''
        }`}
        aria-label="Chat with Pet Assistant"
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {hasUnreadMessages && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {messages.length > 2 ? '!' : '1'}
            </span>
          )}
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div 
            ref={modalRef} 
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-slideUp"
          >
            <div className="p-4 bg-primary text-white flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-2xl mr-2">🐾</span>
                <h3 className="text-lg font-semibold">Pet Care Assistant</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={clearMessages}
                  className="text-white hover:text-gray-200 focus:outline-none p-1"
                  title="Clear chat history"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : message.role === 'system'
                        ? 'bg-gray-200 text-gray-800 rounded-tl-none'
                        : 'bg-white border border-gray-200 shadow-sm text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <div className="text-sm mb-1 flex justify-between items-center">
                      <span className="font-medium">
                        {message.role === 'user' ? 'You' : message.role === 'system' ? 'System' : 'Pet Assistant'}
                      </span>
                      <span className="text-xs opacity-75">{formatTimestamp(message.timestamp)}</span>
                    </div>
                    <div>
                      {message === messages[messages.length - 1] && message.role === 'assistant' && isTyping
                        ? currentResponse
                        : message.content}
                      {message === messages[messages.length - 1] && message.role === 'assistant' && isTyping && (
                        <span className="inline-flex items-center ml-2">
                          <span className="h-2 w-2 bg-current rounded-full mx-0.5 animate-pulse"></span>
                          <span className="h-2 w-2 bg-current rounded-full mx-0.5 animate-pulse delay-100"></span>
                          <span className="h-2 w-2 bg-current rounded-full mx-0.5 animate-pulse delay-200"></span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef}></div>

              {isLoading && !isTyping && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm max-w-[80%] rounded-tl-none">
                    <div className="flex items-center space-x-2">
                      <div className="text-primary font-medium">Pet Assistant</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Questions */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Suggested pet questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(question);
                      inputRef.current?.focus();
                    }}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded-full transition-colors duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
              <div className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                  placeholder="Ask about pet care, breeds, or training..."
                  className="flex-grow rounded-full border border-gray-300 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:shadow-sm"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="ml-2 bg-primary text-white rounded-full p-3 hover:bg-primary-dark transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!input.trim() || isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Note:</span> I can only answer questions about animals and pets!
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Welcome Message Tooltip - shows only when chat is not open and only for new users */}
      {!isOpen && messages.length <= 1 && showTooltip && (
        <div className="fixed bottom-24 right-6 bg-white rounded-lg shadow-lg p-3 max-w-xs animate-fadeIn z-40">
          <div className="flex justify-between items-start">
            <div className="text-sm pr-6">
              <p className="font-medium text-gray-800">Need help with your pet?</p>
              <p className="text-gray-600 text-xs mt-1">Ask our AI assistant about pet care, training, breeds, and more!</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="absolute top-1 right-1 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close tooltip"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="absolute bottom-2 right-2 w-4 h-4 bg-white transform rotate-45"></div>
        </div>
      )}
    </>
  );
};

export default FloatingChatButton; 