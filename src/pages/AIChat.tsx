import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import Layout from '../components/layout/Layout';
import AIAssistant from '../components/chat/AIAssistant';

const AIChat: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.user);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-[calc(100vh-12rem)]">
          <AIAssistant />
        </div>
      </div>
    </Layout>
  );
};

export default AIChat; 