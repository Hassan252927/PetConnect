import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import LoginComponent from '../components/auth/Login';

const Login: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  
  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return <LoginComponent />;
};

export default Login; 