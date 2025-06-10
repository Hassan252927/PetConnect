import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pets from './pages/Pets';
import Chat from './pages/Chat';
import AIChat from './pages/AIChat';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import FloatingChatButton from './components/chat/FloatingChatButton';

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/pets" element={<Pets />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/ai-assistant" element={<AIChat />} />
          </Route>
        </Routes>
        
        {/* Global floating AI chat button */}
        <FloatingChatButton />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
