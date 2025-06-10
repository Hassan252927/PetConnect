import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useRedux';

const ProtectedRoute: React.FC = () => {
  const { currentUser } = useAppSelector((state) => state.user);
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute; 