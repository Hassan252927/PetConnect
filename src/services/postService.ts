import apiClient from './apiClient';
import { Post } from '../store/postSlice';

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
export const createPost = (postData: any): Promise<Post> => {
  //('postService.createPost - Request payload:', JSON.stringify(postData, null, 2));
  return apiClient.post('/posts', postData);
};

/**
 * Update a post
 * @param postID - The ID of the post to update
 * @param postData - The updated data for the post
 * @returns A promise that resolves to the updated post
 */
export const updatePost = (postID: string, postData: Partial<Post>): Promise<Post> => {
  return apiClient.put(`/posts/${postID}`, postData);
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
 * Toggle like/unlike a post (Instagram-style)
 * @param postID - The ID of the post to like/unlike
 * @param userID - The ID of the user liking/unliking the post
 * @returns A promise that resolves to the updated post
 */
export const toggleLikePost = (postID: string, userID: string): Promise<Post> => {
  return apiClient.post(`/posts/${postID}/like`, { userID });
};

/**
 * Add a comment to a post
 * @param postID - The ID of the post to comment on
 * @param userID - The ID of the user adding the comment
 * @param content - The content of the comment
 * @returns A promise that resolves to the updated post
 */
export const addComment = (postID: string, userID: string, content: string): Promise<Post> => {
  return apiClient.post(`/posts/${postID}/comment`, { userID, content });
};

/**
 * Delete a comment
 * @param postID - The ID of the post the comment belongs to
 * @param commentID - The ID of the comment to delete
 * @param userID - The ID of the user deleting the comment
 * @returns A promise that resolves to the updated post
 */
export const deleteComment = (postID: string, commentID: string, userID: string): Promise<Post> => {
  return apiClient.delete(`/posts/${postID}/comment/${commentID}`, { data: { userID } });
};

/**
 * Search posts by tags or content
 * @param query - The search query
 * @returns A promise that resolves to an array of matching posts
 */
export const searchPosts = (query: string): Promise<Post[]> => {
  return apiClient.get(`/posts/search?q=${encodeURIComponent(query)}`);
};

// Default export for convenience
const postService = {
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

export default postService; 