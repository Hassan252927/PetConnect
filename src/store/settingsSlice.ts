import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Check if dark mode is enabled in localStorage
const getInitialDarkMode = (): boolean => {
  // Default to light mode
  if (typeof window === 'undefined') return false;
  
  const savedMode = localStorage.getItem('darkMode');
  return savedMode === 'true';
};

interface SettingsState {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  notifications: boolean;
}

const initialState: SettingsState = {
  darkMode: getInitialDarkMode(),
  fontSize: 'medium',
  notifications: true,
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
  },
});

export const { toggleDarkMode, setDarkMode, setFontSize, toggleNotifications } = settingsSlice.actions;
export default settingsSlice.reducer; 