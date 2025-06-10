import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchUserChats, setCurrentChat } from '../../store/chatSlice';

interface ChatListProps {
  onSelectChat?: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { chats, isLoading, error, currentChat } = useAppSelector((state) => state.chat);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchUserChats(currentUser._id));
    }
  }, [dispatch, currentUser]);

  const handleSelectChat = (chatId: string) => {
    const chat = chats.find((c) => c._id === chatId);
    if (chat) {
      dispatch(setCurrentChat(chat));
      if (onSelectChat) {
        onSelectChat();
      }
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffInDays < 7) {
      // Less than a week - show day name
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // More than a week - show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-gray-500 mb-4">No conversations yet</div>
        <button className="btn-primary">Start a New Chat</button>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-screen">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Messages</h2>
      
      <div className="space-y-2">
        {chats.map((chat) => {
          // Find the other user in the chat
          const otherUser = chat.users.find((u) => u.userID !== currentUser?._id) || chat.users[0];
          
          return (
            <div
              key={chat._id}
              className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                currentChat && currentChat._id === chat._id ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleSelectChat(chat._id)}
            >
              <div className="relative">
                <img
                  src={otherUser.profilePic}
                  alt={otherUser.username}
                  className="h-12 w-12 rounded-full object-cover mr-3"
                />
                {chat.unreadCount > 0 && (
                  <span className="absolute top-0 right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800 truncate">{otherUser.username}</h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatTime(chat.lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                
                {chat.lastMessage ? (
                  <p
                    className={`text-sm truncate ${
                      chat.unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    {chat.lastMessage.sender === currentUser?._id ? 'You: ' : ''}
                    {chat.lastMessage.content}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No messages yet</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList; 