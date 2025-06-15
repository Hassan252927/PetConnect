import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Check if dark mode is enabled in localStorage
const getInitialDarkMode = (): boolean => {
  // Default to light mode
  if (typeof window === 'undefined') return false;
  
  const savedMode = localStorage.getItem('darkMode');
  return savedMode === 'true';
};

// Get initial font size from localStorage
const getInitialFontSize = (): 'small' | 'medium' | 'large' => {
  if (typeof window === 'undefined') return 'medium';
  
  const savedFontSize = localStorage.getItem('fontSize');
  if (savedFontSize === 'small' || savedFontSize === 'medium' || savedFontSize === 'large') {
    return savedFontSize;
  }
  return 'medium';
};

// Get initial notifications setting from localStorage
const getInitialNotifications = (): boolean => {
  if (typeof window === 'undefined') return true;
  
  const savedNotifications = localStorage.getItem('notifications');
  return savedNotifications !== 'false'; // Default to true if not set
};

interface SettingsState {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
}

const initialState: SettingsState = {
  darkMode: getInitialDarkMode(),
  fontSize: getInitialFontSize(),
  notifications: getInitialNotifications(),
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.fontSize = action.payload;
      localStorage.setItem('fontSize', action.payload);
    },
    toggleNotifications: (state) => {
      state.notifications = !state.notifications;
      localStorage.setItem('notifications', state.notifications.toString());
    },
    setNotifications: (state, action: PayloadAction<boolean>) => {
      state.notifications = action.payload;
      localStorage.setItem('notifications', action.payload.toString());
    },
  },
});

export const { toggleDarkMode, setDarkMode, setFontSize, toggleNotifications, setNotifications } = settingsSlice.actions;
export default settingsSlice.reducer; 