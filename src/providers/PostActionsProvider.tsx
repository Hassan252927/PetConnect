import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAppDispatch } from '../hooks/useRedux';
import { savePost, unsavePost } from '../store/userSlice';
import { likePost } from '../store/postSlice';

// Define the context type
interface PostActionsContextType {
  savedPosts: Set<string>;
  likedPosts: Set<string>;
  toggleSavePost: (postId: string, userId: string) => void;
  toggleLikePost: (postId: string, userId: string) => void;
  isSaved: (postId: string) => boolean;
  isLiked: (postId: string) => boolean;
}

// Create the context with a default value
const PostActionsContext = createContext<PostActionsContextType>({
  savedPosts: new Set(),
  likedPosts: new Set(),
  toggleSavePost: () => {},
  toggleLikePost: () => {},
  isSaved: () => false,
  isLiked: () => false,
});

// Custom hook to use the post actions context
export const usePostActions = () => useContext(PostActionsContext);

interface PostActionsProviderProps {
  children: React.ReactNode;
  initialSavedPosts?: string[];
  initialLikedPosts?: string[];
}

export const PostActionsProvider: React.FC<PostActionsProviderProps> = ({ 
  children, 
  initialSavedPosts = [], 
  initialLikedPosts = [] 
}) => {
  const dispatch = useAppDispatch();
  
  // Use Sets for O(1) lookups
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set(initialSavedPosts));
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set(initialLikedPosts));
  
  // Toggle save post status
  const toggleSavePost = useCallback((postId: string, userId: string) => {
    setSavedPosts(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(postId)) {
        newSet.delete(postId);
        dispatch(unsavePost(postId));
      } else {
        newSet.add(postId);
        dispatch(savePost(postId));
      }
      
      return newSet;
    });
  }, [dispatch]);
  
  // Toggle like post status
  const toggleLikePost = useCallback((postId: string, userId: string) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      
      // Dispatch the like action to Redux
      dispatch(likePost({ postID: postId, userID: userId }));
      
      return newSet;
    });
  }, [dispatch]);
  
  // Check if a post is saved
  const isSaved = useCallback((postId: string) => {
    return savedPosts.has(postId);
  }, [savedPosts]);
  
  // Check if a post is liked
  const isLiked = useCallback((postId: string) => {
    return likedPosts.has(postId);
  }, [likedPosts]);
  
  // Context value
  const value = {
    savedPosts,
    likedPosts,
    toggleSavePost,
    toggleLikePost,
    isSaved,
    isLiked,
  };
  
  return (
    <PostActionsContext.Provider value={value}>
      {children}
    </PostActionsContext.Provider>
  );
}; 