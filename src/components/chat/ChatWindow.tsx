import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchChatMessages, sendMessage, markMessagesAsRead } from '../../store/chatSlice';

const ChatWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { currentChat, isLoading } = useAppSelector((state) => state.chat);
  
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | undefined>(undefined);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const [pendingMessage, setPendingMessage] = useState<any | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (currentUser && currentChat) {
      dispatch(fetchChatMessages(currentChat._id));
      
      // Mark messages as read
      if (currentChat.unreadCount > 0) {
        dispatch(markMessagesAsRead({ chatId: currentChat._id, userId: currentUser._id }));
      }
    }
  }, [dispatch, currentUser, currentChat]);
  
  // Update local messages when currentChat changes
  useEffect(() => {
    if (currentChat?.messages) {
      setLocalMessages([...currentChat.messages]);
    }
  }, [currentChat?.messages]);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [localMessages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentChat || (!message.trim() && !mediaFile)) return;
    
    // Create a temporary message to display immediately
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      chatID: currentChat._id,
      sender: currentUser._id,
      senderName: currentUser.username,
      senderProfilePic: currentUser.profilePic,
      content: message.trim(),
      media: mediaPreview,
      timestamp: new Date().toISOString(),
      isRead: false,
      isPending: true
    };
    
    // Add to local messages immediately
    setLocalMessages(prev => [...prev, tempMessage]);
    setPendingMessage(tempMessage);
    
    // Dispatch the actual message to Redux
    dispatch(
      sendMessage({
        chatID: currentChat._id,
        sender: currentUser._id,
        senderName: currentUser.username,
        senderProfilePic: currentUser.profilePic,
        content: message.trim(),
        media: mediaPreview
      })
    )
      .unwrap()
      .then((result) => {
        // Replace the temporary message with the real one
        setLocalMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id ? { ...result, isPending: false } : msg
          )
        );
        setPendingMessage(null);
      })
      .catch((error) => {
        // Mark the message as failed
        setLocalMessages(prev => 
          prev.map(msg => 
            msg._id === tempMessage._id ? { ...msg, isPending: false, isFailed: true } : msg
          )
        );
        setPendingMessage(null);
        console.error('Failed to send message:', error);
      });
    
    setMessage('');
    setMediaFile(null);
    setMediaPreview(undefined);
    setShowEmojiPicker(false);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      
      // Create a preview URL for the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleEmojiClick = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  // Common emojis for quick access
  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🐶', '🐱', '🙏', '😍', '🤔'];
  
  // Group messages by date
  const groupMessagesByDate = () => {
    if (!localMessages || localMessages.length === 0) return [];
    
    const groups: { date: string; messages: any[] }[] = [];
    let currentDate = '';
    let currentGroup: any[] = [];
    
    localMessages.forEach((msg) => {
      const msgDate = new Date(msg.timestamp).toLocaleDateString();
      
      if (msgDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = msgDate;
        currentGroup = [msg];
      } else {
        currentGroup.push(msg);
      }
    });
    
    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }
    
    return groups;
  };
  
  if (!currentChat) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <div className="text-gray-500 mb-4">Select a conversation to start chatting</div>
      </div>
    );
  }
  
  // Find the other user in the chat
  const otherUser = currentChat.users.find((u) => u.userID !== currentUser?._id) || currentChat.users[0];
  
  return (
    <div className="flex flex-col h-full" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <img
          src={otherUser.profilePic}
          alt={otherUser.username}
          className="h-10 w-10 rounded-full object-cover mr-3"
        />
        <div>
          <h3 className="font-medium text-gray-800 dark:text-white">{otherUser.username}</h3>
        </div>
      </div>
      
      {/* Main content area - using flex to ensure proper layout */}
      <div className="flex flex-col flex-grow overflow-hidden">
        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="flex-grow overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 custom-scrollbar"
          style={{ 
            height: '400px',
            maxHeight: 'calc(100vh - 240px)',
            overflowY: 'auto'
          }}
        >
          {isLoading && !localMessages.length ? (
            <div className="flex justify-center items-center h-full">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {groupMessagesByDate().map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className="flex justify-center mb-4">
                    <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                      {formatDate(group.messages[0].timestamp)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {group.messages.map((msg) => {
                      const isSentByMe = msg.sender === currentUser?._id;
                      
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isSentByMe ? 'justify-start' : 'justify-end'}`}
                        >
                          {isSentByMe && (
                            <img
                              src={msg.senderProfilePic}
                              alt={msg.senderName}
                              className="h-8 w-8 rounded-full object-cover mr-2 mt-1"
                            />
                          )}
                          
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              isSentByMe
                                ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-none'
                                : 'bg-primary text-white rounded-tr-none'
                            } ${msg.isPending ? 'opacity-70' : ''} ${msg.isFailed ? 'border border-red-500' : ''}`}
                          >
                            {msg.media && (
                              <div className="mb-2">
                                <img 
                                  src={msg.media} 
                                  alt="Shared media" 
                                  className="rounded-md max-w-full max-h-60 object-contain"
                                />
                              </div>
                            )}
                            {msg.content && <p>{msg.content}</p>}
                            <div
                              className={`text-xs ${isSentByMe ? 'text-gray-500 dark:text-gray-400' : 'text-blue-100'} text-right mt-1 flex items-center justify-end`}
                            >
                              {formatTime(msg.timestamp)}
                              {isSentByMe && (
                                <>
                                  {msg.isPending ? (
                                    <span className="ml-1 animate-pulse">⌛</span>
                                  ) : msg.isFailed ? (
                                    <span className="ml-1 text-red-500">❌</span>
                                  ) : (
                                    <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          
                          {!isSentByMe && (
                            <img
                              src={msg.senderProfilePic}
                              alt={msg.senderName}
                              className="h-8 w-8 rounded-full object-cover ml-2 mt-1"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Footer Section - Fixed at bottom */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {/* Media Preview */}
          {mediaPreview && (
            <div className="p-2 bg-gray-50 dark:bg-gray-800">
              <div className="relative inline-block">
                <img 
                  src={mediaPreview} 
                  alt="Media preview" 
                  className="h-20 rounded-md object-contain"
                />
                <button 
                  onClick={() => {
                    setMediaPreview(undefined);
                    setMediaFile(null);
                  }}
                  className="absolute top-0 right-0 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 transform translate-x-1/2 -translate-y-1/2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="p-2 bg-white dark:bg-gray-800 flex flex-wrap gap-2">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiClick(emoji)}
                  className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
          
          {/* Message Input - Always visible */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow mx-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              
              <button
                type="submit"
                disabled={!message.trim() && !mediaFile}
                className="p-2 bg-primary text-white rounded-full hover:bg-primary/90 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow; 