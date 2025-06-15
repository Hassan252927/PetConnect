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
  notificationsEnabled?: boolean;
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
 * @param userId - The user ID
 * @returns A promise that resolves when the password is changed
 */
export const changePassword = (
  currentPassword: string,
  newPassword: string,
  userId: string
): Promise<void> => {
  return apiClient.post('/users/change-password', {
    currentPassword,
    newPassword,
    userId,
  });
};

/**
 * Change the current user's email
 * @param newEmail - The new email address
 * @param password - The current password for verification
 * @param userId - The user ID
 * @returns A promise that resolves to the response with updated user data
 */
export const changeEmail = (
  newEmail: string,
  password: string,
  userId: string
): Promise<{ message: string; user: User }> => {
  return apiClient.post('/users/change-email', {
    newEmail,
    password,
    userId,
  });
};

/**
 * Update notification preferences
 * @param userId - The user ID
 * @param notificationsEnabled - Whether notifications should be enabled
 * @returns A promise that resolves to the response with updated user data
 */
export const updateNotificationPreferences = (
  userId: string,
  notificationsEnabled: boolean
): Promise<{ message: string; user: User }> => {
  return apiClient.post('/users/notification-preferences', {
    userId,
    notificationsEnabled,
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

/**
 * Save a post for a user
 * @param userID - The ID of the user
 * @param postID - The ID of the post to save
 * @returns A promise that resolves to the updated user
 */
export const savePost = async (userID: string, postID: string): Promise<User> => {
  console.log('userService.savePost - Saving post:', postID, 'for user:', userID);
  try {
    const response = await apiClient.post(`/users/${userID}/savedPosts`, { postID });
    console.log('userService.savePost - Raw response:', response);
    console.log('userService.savePost - Response type:', typeof response);
    // The apiClient.post method should return response.data directly
    return response;
  } catch (error) {
    console.error('userService.savePost - Error:', error);
    throw error;
  }
};

/**
 * Unsave a post for a user
 * @param userID - The ID of the user
 * @param postID - The ID of the post to unsave
 * @returns A promise that resolves to the updated user
 */
export const unsavePost = async (userID: string, postID: string): Promise<User> => {
  console.log('userService.unsavePost - Unsaving post:', postID, 'for user:', userID);
  try {
    const response = await apiClient.delete(`/users/${userID}/savedPosts/${postID}`);
    console.log('userService.unsavePost - API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('userService.unsavePost - Error:', error);
    throw error;
  }
};

/**
 * Get saved posts for a user
 * @param userID - The ID of the user
 * @returns A promise that resolves to an array of saved posts
 */
export const getSavedPosts = async (userID: string): Promise<any[]> => {
  console.log('userService.getSavedPosts - Fetching saved posts for user:', userID);
  try {
    console.log('userService.getSavedPosts - Making API call to:', `/users/${userID}/savedPosts`);
    const response = await apiClient.get(`/users/${userID}/savedPosts`);
    console.log('userService.getSavedPosts - Raw response object:', response);
    console.log('userService.getSavedPosts - Response type:', typeof response);
    console.log('userService.getSavedPosts - Response keys:', Object.keys(response || {}));
    
    // The apiClient.get method should return response.data directly
    // So 'response' here is actually the data, not the full axios response
    const savedPosts = Array.isArray(response) ? response : [];
    console.log('userService.getSavedPosts - Processed saved posts:', savedPosts.length);
    
    if (savedPosts.length > 0) {
      console.log('userService.getSavedPosts - First post:', savedPosts[0]);
    }
    
    return savedPosts;
  } catch (error) {
    console.error('userService.getSavedPosts - Error:', error);
    // Return empty array instead of throwing error to prevent app crashes
    return [];
  }
};

const userService = {
  register,
  login,
  getCurrentUser,
  getUserById,
  updateUser,
  changePassword,
  toggleFollowUser,
  searchUsers,
  checkUsernameAvailability,
  savePost,
  unsavePost,
  getSavedPosts,
};

export default userService; 