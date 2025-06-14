import React, { useEffect, useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchChatMessages, sendMessage, markMessagesAsRead } from '../../store/chatSlice';
import { Message } from '../../services/chatService';

// Try using require as a fallback for date-fns
const { format } = require('date-fns');
// Removed react-icons imports to resolve errors
// import { IoSendSharp } from "react-icons/io5";
// import { MdOutlinePhotoCamera } from "react-icons/md";
// import { HiOutlineDocumentMinus } from "react-icons/hi2";

interface ChatWindowProps {
  onBack?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = () => {
  const dispatch = useAppDispatch();
  const { currentChat, isLoading } = useAppSelector((state) => state.chat);
  const { currentUser } = useAppSelector((state) => state.user);
  const [message, setMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string | undefined>(undefined);
  const [selectedMediaFile, setSelectedMediaFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentChat && currentUser) {
      // Fetch messages for the current chat thread
      const otherUserId = currentChat.participants.find(p => p._id !== currentUser._id)?._id || currentChat.participants[0]._id;
      dispatch(fetchChatMessages({ user1Id: currentUser._id, user2Id: otherUserId }));

      // Mark messages as read
      if (otherUserId) {
        dispatch(markMessagesAsRead({ senderID: otherUserId, receiverID: currentUser._id }));
      }
    }
  }, [dispatch, currentUser, currentChat]);

  // Update local messages when currentChat messages change
  useEffect(() => {
    if (currentChat?.messages) {
      setLocalMessages([...currentChat.messages]);
    }
  }, [currentChat?.messages]);

  useEffect(() => {
    // Scroll to bottom whenever messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages]);

  const handleSendMessage = async () => {
    if (message.trim() === '' && !selectedMediaFile) return;

    if (currentUser && currentChat) {
      const otherUserId = currentChat.participants.find((p) => p._id !== currentUser._id)?._id;

      if (otherUserId) {
        dispatch(
          sendMessage({
            senderID: currentUser._id,
            receiverID: otherUserId,
            content: message.trim(),
            media: mediaPreview,
          })
        );
        setMessage('');
        setMediaPreview(undefined);
        setSelectedMediaFile(null);
      }
    }
  };

  const handleMediaSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedMediaFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => {
    setMediaPreview(undefined);
    setSelectedMediaFile(null);
  };

  const otherUser = currentChat?.participants.find((p) => p._id !== currentUser?._id);

  if (!currentChat || !otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      <div className="flex items-center p-4 border-b">
        <img
          src={otherUser.profilePic}
          alt={otherUser.username}
          className="h-10 w-10 rounded-full object-cover"
        />
        <h2 className="ml-3 text-lg font-semibold text-gray-800">{otherUser.username}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {localMessages.map((msg, index) => (
          <div
            key={msg._id || index} // Fallback to index if _id is not available (e.g., for optimistic updates)
            className={`flex ${msg.senderID === currentUser?._id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs p-3 rounded-lg ${msg.senderID === currentUser?._id
                ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}
              `}
            >
              {msg.content && <p>{msg.content}</p>}
              {msg.media && (
                <img src={msg.media} alt="Media" className="mt-2 rounded-lg max-w-full h-auto" />
              )}
              <span className={`text-xs mt-1 block ${msg.senderID === currentUser?._id ? 'text-white-600 text-right' : 'text-gray-500 text-left'}`}>
                {format(new Date(msg.timestamp), 'h:mm a')}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {mediaPreview && (
        <div className="relative p-4 border-t flex justify-center items-center">
          <img src={mediaPreview} alt="Media Preview" className="max-h-24 rounded-lg" />
          <button
            onClick={removeMedia}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
          >
            X
          </button>
        </div>
      )}

      <div className="p-4 border-t flex items-center">
        <input
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          id="media-upload-input"
          onChange={handleMediaSelect}
        />
        <label htmlFor="media-upload-input" className="mr-2 cursor-pointer text-gray-600 hover:text-primary">
          {/* <MdOutlinePhotoCamera className="w-7 h-7" /> */}
          <span>📷</span> {/* Placeholder for camera icon */}
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          placeholder="Type your message..."
          className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSendMessage}
          className="ml-2 bg-primary text-white p-2 rounded-full hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {/* <IoSendSharp className="w-5 h-5" /> */}
          <span>➤</span> {/* Placeholder for send icon */}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow; 