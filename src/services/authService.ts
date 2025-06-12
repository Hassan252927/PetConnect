import apiClient from './apiClient';
import { User } from './userService';

// In-memory token storage (no localStorage)
let authToken: string | null = null;
let currentUser: User | null = null;

/**
 * Set the authentication token in memory and configure the API client
 */
export const setAuthToken = (token: string): void => {
  authToken = token;
  apiClient.setAuthToken(token);
};

/**
 * Remove the authentication token from memory and the API client
 */
export const removeAuthToken = (): void => {
  authToken = null;
  currentUser = null;
  apiClient.setAuthToken(null);
};

/**
 * Get the authentication token from memory
 */
export const getAuthToken = (): string | null => {
  return authToken;
};

/**
 * Store the user in memory
 */
export const setStoredUser = (user: User): void => {
  currentUser = user;
};

/**
 * Get the stored user from memory
 */
export const getStoredUser = (): User | null => {
  return currentUser;
};

/**
 * Check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!authToken;
};

/**
 * Initialize the auth state (now a no-op since we don't use localStorage)
 */
export const initializeAuth = (): void => {
  // No-op as we're not persisting auth state anymore
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