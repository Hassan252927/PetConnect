import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchChatMessages, sendMessage, markMessagesAsRead } from '../../store/chatSlice';

const ChatWindow: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { currentChat, isLoading } = useAppSelector((state) => state.chat);
  
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (currentUser && currentChat) {
      dispatch(fetchChatMessages(currentChat._id));
      
      // Mark messages as read
      if (currentChat.unreadCount > 0) {
        dispatch(markMessagesAsRead({ chatId: currentChat._id, userId: currentUser._id }));
      }
    }
  }, [dispatch, currentUser, currentChat]);
  
  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [currentChat?.messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !currentChat || !message.trim()) return;
    
    dispatch(
      sendMessage({
        chatID: currentChat._id,
        sender: currentUser._id,
        senderName: currentUser.username,
        senderProfilePic: currentUser.profilePic,
        content: message.trim(),
      })
    );
    
    setMessage('');
  };
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };
  
  // Group messages by date
  const groupMessagesByDate = () => {
    if (!currentChat?.messages) return [];
    
    const groups: { date: string; messages: typeof currentChat.messages }[] = [];
    let currentDate = '';
    let currentGroup: typeof currentChat.messages = [];
    
    currentChat.messages.forEach((msg) => {
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
    <div className="flex flex-col h-full">
      <div className="flex items-center p-4 border-b border-gray-200">
        <img
          src={otherUser.profilePic}
          alt={otherUser.username}
          className="h-10 w-10 rounded-full object-cover mr-3"
        />
        <div>
          <h3 className="font-medium text-gray-800">{otherUser.username}</h3>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-gray-500">Loading messages...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {groupMessagesByDate().map((group, groupIndex) => (
              <div key={groupIndex}>
                <div className="flex justify-center mb-4">
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {formatDate(group.messages[0].timestamp)}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {group.messages.map((msg) => {
                    const isCurrentUser = msg.sender === currentUser?._id;
                    
                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isCurrentUser && (
                          <img
                            src={msg.senderProfilePic}
                            alt={msg.senderName}
                            className="h-8 w-8 rounded-full object-cover mr-2 mt-1"
                          />
                        )}
                        
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            isCurrentUser
                              ? 'bg-primary text-white rounded-tr-none'
                              : 'bg-gray-100 text-gray-800 rounded-tl-none'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <div
                            className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'} text-right mt-1`}
                          >
                            {formatTime(msg.timestamp)}
                            {isCurrentUser && (
                              <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>
                            )}
                          </div>
                        </div>
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
      
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow; 