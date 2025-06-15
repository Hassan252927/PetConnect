import apiClient from './apiClient';
import { User } from './userService';

// Storage keys
const TOKEN_KEY = 'petconnect_auth_token';
const USER_KEY = 'petconnect_user';

// In-memory cache for performance
let authToken: string | null = null;
let currentUser: User | null = null;

/**
 * Set the authentication token in localStorage and memory, configure the API client
 */
export const setAuthToken = (token: string): void => {
  authToken = token;
  localStorage.setItem(TOKEN_KEY, token);
  apiClient.setAuthToken(token);
};

/**
 * Remove the authentication token from localStorage, memory and the API client
 */
export const removeAuthToken = (): void => {
  authToken = null;
  currentUser = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  apiClient.setAuthToken(null);
};

/**
 * Get the authentication token from memory or localStorage
 */
export const getAuthToken = (): string | null => {
  if (authToken) {
    return authToken;
  }
  
  // Try to get from localStorage
  const storedToken = localStorage.getItem(TOKEN_KEY);
  if (storedToken) {
    authToken = storedToken;
    apiClient.setAuthToken(storedToken);
    return storedToken;
  }
  
  return null;
};

/**
 * Store the user in localStorage and memory
 */
export const setStoredUser = (user: User): void => {
  console.log('authService - Storing user:', user);
  console.log('authService - User savedPosts:', user.savedPosts);
  
  currentUser = user;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Get the stored user from memory or localStorage
 */
export const getStoredUser = (): User | null => {
  if (currentUser) {
    return currentUser;
  }
  
  // Try to get from localStorage
  const storedUser = localStorage.getItem(USER_KEY);
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser);
      return currentUser;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      localStorage.removeItem(USER_KEY);
    }
  }
  
  return null;
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Initialize the auth state from localStorage
 */
export const initializeAuth = (): { token: string | null; user: User | null } => {
  const token = getAuthToken();
  const user = getStoredUser();
  
  if (token && user) {
    // Set up API client with token
    apiClient.setAuthToken(token);
  }
  
  return { token, user };
};

export default {
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  setStoredUser,
  getStoredUser,
  isAuthenticated,
  initializeAuth,
}; 