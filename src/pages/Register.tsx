import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../hooks/useRedux';
import RegisterComponent from '../components/auth/Register';

const Register: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  
  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return <RegisterComponent />;
};

export default Register; 