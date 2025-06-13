import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchUserChats, fetchChatMessages } from '../../store/chatSlice';
import { Chat } from '../../services/chatService';

interface ChatListProps {
  onSelectChat?: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { chats, currentChat, isLoading } = useAppSelector((state) => state.chat);

  useEffect(() => {
    if (currentUser) {
      dispatch(fetchUserChats(currentUser._id));
    }
  }, [dispatch, currentUser]);

  const handleSelectChat = (chat: Chat) => {
    // Update the current chat in the store
    dispatch({ type: 'chat/setCurrentChat', payload: chat });

    // Dispatch fetchChatMessages for the selected chat
    if (currentUser && chat.participants) {
      const otherUser = chat.participants.find((u) => u && u._id !== currentUser._id) || chat.participants[0];
      if (otherUser) {
        dispatch(fetchChatMessages({ user1Id: currentUser._id, user2Id: otherUser._id }));
      }
    }
    onSelectChat?.();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chats || !Array.isArray(chats) || chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm">Start chatting with other pet lovers!</p>
      </div>
    );
  }

  // Ensure currentUser exists before attempting to render chats
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {chats
        .filter(
          (chat) =>
            chat &&
            chat.participants &&
            Array.isArray(chat.participants) &&
            chat.participants.length > 0
        )
        .map((chat) => {
          // Find the other user in the chat
          const otherUser =
            chat.participants.find((u) => u && u._id !== currentUser._id) ||
            (chat.participants.length > 0 ? chat.participants[0] : null);

          // Only render if otherUser is found
          if (!otherUser) {
            return null; // Skip rendering this chat if no valid otherUser is found
          }

          return (
            <div
              key={chat._id}
              className={`flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                currentChat && currentChat._id === chat._id ? 'bg-gray-100' : ''
              }`}
              onClick={() => handleSelectChat(chat)}
            >
              <div className="relative">
                <img
                  src={otherUser.profilePic}
                  alt={otherUser.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
                {chat.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">{otherUser.username}</h3>
                  {chat.lastMessage && (
                    <span className="text-xs text-gray-500">
                      {new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                {chat.lastMessage && (
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default ChatList; 