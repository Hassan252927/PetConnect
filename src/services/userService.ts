import apiClient from './apiClient';

// Define User interface directly here to avoid import issues
export interface User {
  _id: string;
  username: string;
  email: string;
  profilePic: string;
  bio?: string;
  savedPosts: string[];
  pets: string[];
}

// Interface for user login
export interface LoginRequest {
  email: string;
  password: string;
}

// Interface for user registration
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  profilePic?: string;
}

// Interface for updating a user
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  profilePic?: string;
  bio?: string;
}

// Interface for auth response from API
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Register a new user
 * @param userData - The user registration data
 * @returns A promise that resolves to the auth response
 */
export const register = (userData: RegisterRequest): Promise<AuthResponse> => {
  return apiClient.post('/users/register', userData);
};

/**
 * Login a user
 * @param credentials - The user credentials
 * @returns A promise that resolves to the auth response
 */
export const login = (credentials: LoginRequest): Promise<AuthResponse> => {
  // Transform email to identifier for backend compatibility
  const loginData = {
    identifier: credentials.email,
    password: credentials.password
  };
  return apiClient.post('/users/login', loginData);
};

/**
 * Get the current user's profile
 * @returns A promise that resolves to the user
 */
export const getCurrentUser = (): Promise<User> => {
  return apiClient.get('/users/me');
};

/**
 * Get a user by ID
 * @param userID - The ID of the user
 * @returns A promise that resolves to the user
 */
export const getUserById = (userID: string): Promise<User> => {
  return apiClient.get(`/users/${userID}`);
};

/**
 * Update a user's profile by ID
 * @param userID - The ID of the user to update
 * @param userData - The data to update the user with
 * @returns A promise that resolves to the updated user
 */
export const updateUser = (userID: string, userData: UpdateUserRequest): Promise<User> => {
  return apiClient.put(`/users/${userID}`, userData);
};

/**
 * Update the current user's profile (legacy method)
 * @param userData - The data to update the user with
 * @returns A promise that resolves to the updated user
 */
export const updateCurrentUser = (userData: UpdateUserRequest): Promise<User> => {
  // This method is deprecated since we don't have /users/me endpoint
  return apiClient.put('/users/me', userData);
};

/**
 * Change the current user's password
 * @param currentPassword - The current password
 * @param newPassword - The new password
 * @returns A promise that resolves when the password is changed
 */
export const changePassword = (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  return apiClient.post('/users/change-password', {
    currentPassword,
    newPassword,
  });
};

/**
 * Follow or unfollow a user
 * @param userID - The ID of the user to follow/unfollow
 * @returns A promise that resolves to the updated user
 */
export const toggleFollowUser = (userID: string): Promise<User> => {
  return apiClient.post(`/users/${userID}/follow`);
};

/**
 * Search for users
 * @param query - The search query
 * @returns A promise that resolves to an array of users
 */
export const searchUsers = (query: string): Promise<User[]> => {
  return apiClient.get('/users/search', {
    params: { query },
  });
};

/**
 * Check if a username is available
 * @param username - The username to check
 * @param excludeUserId - Optional user ID to exclude from the check (for profile updates)
 * @returns A promise that resolves to availability status
 */
export const checkUsernameAvailability = (
  username: string, 
  excludeUserId?: string
): Promise<{ available: boolean; message: string }> => {
  const url = `/users/check/username/${encodeURIComponent(username)}`;
  const params = excludeUserId ? { excludeUserId } : {};
  return apiClient.get(url, { params });
};

export default {
  register,
  login,
  getCurrentUser,
  getUserById,
  updateUser,
  changePassword,
  toggleFollowUser,
  searchUsers,
  checkUsernameAvailability,
}; 