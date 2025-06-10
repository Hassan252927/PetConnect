import apiClient from './apiClient';
import { Post } from '../store/postSlice';

// Interface for creating a new post
export interface CreatePostRequest {
  petID: string;
  userID: string;
  petName: string;
  petImage: string;
  username: string;
  userProfilePic: string;
  media: string;
  caption: string;
  animal: string;
  breed: string;
}

// Interface for updating a post
export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  postID: string;
}

/**
 * Get feed posts (all posts or for a specific user)
 * @param userID - Optional user ID to get posts for a specific user
 * @returns A promise that resolves to an array of posts
 */
export const getFeedPosts = (userID?: string): Promise<Post[]> => {
  const endpoint = userID ? `/posts/user/${userID}` : '/posts';
  return apiClient.get(endpoint);
};

/**
 * Get a post by ID
 * @param postID - The ID of the post
 * @returns A promise that resolves to the post
 */
export const getPostById = (postID: string): Promise<Post> => {
  return apiClient.get(`/posts/${postID}`);
};

/**
 * Create a new post
 * @param postData - The data for the new post
 * @returns A promise that resolves to the created post
 */
export const createPost = (postData: CreatePostRequest): Promise<Post> => {
  return apiClient.post('/posts', postData);
};

/**
 * Update a post
 * @param postData - The data to update the post with
 * @returns A promise that resolves to the updated post
 */
export const updatePost = (postData: UpdatePostRequest): Promise<Post> => {
  return apiClient.put(`/posts/${postData.postID}`, postData);
};

/**
 * Delete a post
 * @param postID - The ID of the post to delete
 * @returns A promise that resolves when the post is deleted
 */
export const deletePost = (postID: string): Promise<void> => {
  return apiClient.delete(`/posts/${postID}`);
};

/**
 * Like or unlike a post
 * @param postID - The ID of the post
 * @param userID - The ID of the user liking/unliking the post
 * @returns A promise that resolves to the updated post
 */
export const toggleLikePost = (postID: string, userID: string): Promise<Post> => {
  return apiClient.post(`/posts/${postID}/like`, { userID });
};

/**
 * Add a comment to a post
 * @param postID - The ID of the post
 * @param userID - The ID of the user adding the comment
 * @param text - The comment text
 * @returns A promise that resolves to the updated post
 */
export const addComment = (
  postID: string,
  userID: string,
  text: string
): Promise<Post> => {
  return apiClient.post(`/posts/${postID}/comments`, { userID, text });
};

/**
 * Delete a comment from a post
 * @param postID - The ID of the post
 * @param commentID - The ID of the comment to delete
 * @returns A promise that resolves to the updated post
 */
export const deleteComment = (postID: string, commentID: string): Promise<Post> => {
  return apiClient.delete(`/posts/${postID}/comments/${commentID}`);
};

/**
 * Search for posts based on criteria
 * @param query - The search query
 * @param filters - Optional filters to apply
 * @returns A promise that resolves to an array of posts
 */
export const searchPosts = (
  query: string,
  filters?: {
    animalType?: string;
    breed?: string;
  }
): Promise<Post[]> => {
  return apiClient.get('/posts/search', {
    params: {
      query,
      ...filters,
    },
  });
};

export default {
  getFeedPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  addComment,
  deleteComment,
  searchPosts,
}; 