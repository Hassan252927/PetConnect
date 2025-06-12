import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { fetchUserChats } from '../store/chatSlice';
import Layout from '../components/layout/Layout';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { chats } = useAppSelector((state) => state.chat);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (chats.length === 0) {
      // Load chats when user is authenticated
      dispatch(fetchUserChats(currentUser._id));
    }
  }, [currentUser, navigate, dispatch, chats.length]);
  
  if (!currentUser) {
    return null;
  }
  
  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-12rem)]">
          <div className={`${mobileView === 'chat' ? 'hidden' : ''} md:block md:col-span-1 border-r border-gray-200 p-4`}>
            <ChatList onSelectChat={() => setMobileView('chat')} />
          </div>
          
          <div className={`${mobileView === 'list' ? 'hidden' : ''} md:block md:col-span-2`}>
            <div className="h-full flex flex-col">
              <div className="md:hidden p-2 border-b border-gray-200">
                <button
                  onClick={() => setMobileView('list')}
                  className="flex items-center text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Back to Chats
                </button>
              </div>
              <div className="flex-grow">
                <ChatWindow />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Chat; 