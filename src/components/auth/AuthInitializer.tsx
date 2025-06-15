import React, { useEffect } from 'react';
import { useAppDispatch } from '../../hooks/useRedux';
import { checkAuth } from '../../store/userSlice';

const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check for stored authentication on app startup
    dispatch(checkAuth());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthInitializer; 