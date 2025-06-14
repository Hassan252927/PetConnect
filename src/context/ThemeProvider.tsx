import React, { ReactNode, useEffect } from 'react';
import { useAppSelector } from '../hooks/useRedux';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { darkMode, fontSize } = useAppSelector((state) => state.settings);
  
  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Apply font size class to body element
  useEffect(() => {
    // Remove all font size classes first
    document.body.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');
    
    // Add the current font size class
    document.body.classList.add(`font-size-${fontSize}`);
  }, [fontSize]);
  
  return <>{children}</>;
};

export default ThemeProvider; 