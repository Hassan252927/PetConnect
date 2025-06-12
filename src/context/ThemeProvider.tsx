import React, { ReactNode, useEffect } from 'react';
import { useAppSelector } from '../hooks/useRedux';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { darkMode } = useAppSelector((state) => state.settings);
  
  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);
  
  return <>{children}</>;
};

export default ThemeProvider; 