import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import ThemeProvider from './context/ThemeProvider';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pets from './pages/Pets';
import Chat from './pages/Chat';
import AIChat from './pages/AIChat';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import Settings from './pages/Settings';
import PetDetailPage from './pages/PetDetailPage';
import PostDetailPage from './pages/PostDetailPage';
import EditPetPage from './pages/EditPetPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import FloatingChatButton from './components/chat/FloatingChatButton';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />}/>
            <Route path="/explore" element={<ExplorePage />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/pets" element={<Pets />} />
              <Route path="/pets/:id" element={<PetDetailPage />} />
              <Route path="/pets/:id/edit" element={<EditPetPage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/ai-assistant" element={<AIChat />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
          
          {/* Global floating AI chat button */}
          <FloatingChatButton />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
