import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
  };
  message: string;
  timestamp: string;
}

interface Chat {
  _id: string;
  users: {
    _id: string;
    username: string;
  }[];
  messages: Message[];
}

const ChatDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await axios.get(`/api/chats/${id}`);
        setChat(response.data);
      } catch (error) {
        setError('Error fetching chat');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChat();
    // Set up polling for new messages
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/chats/${id}/messages`, {
        message: newMessage
      });
      setChat(response.data);
      setNewMessage('');
    } catch (error) {
      setError('Error sending message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!chat) {
    return <div className="flex justify-center items-center h-screen">Chat not found</div>;
  }

  const otherUser = chat.users.find(user => user._id !== 'current-user-id');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gray-100 px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold">
              Chat with {otherUser?.username}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-700"
            >
              Back to Chats
            </button>
          </div>
        </div>

        <div className="h-[600px] overflow-y-auto p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {chat.messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender._id === 'current-user-id'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.sender._id === 'current-user-id'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-sm font-semibold mb-1">
                    {message.sender.username}
                  </div>
                  <p>{message.message}</p>
                  <div className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="border-t p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isSubmitting || !newMessage.trim()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatDetailPage; 