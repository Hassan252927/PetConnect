import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
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
}

export const PostActionsProvider: React.FC<PostActionsProviderProps> = ({ 
  children
}) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { feedPosts } = useAppSelector((state) => state.post);
  
  // Use Sets for O(1) lookups
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize liked and saved posts based on current data (only once)
  useEffect(() => {
    if (currentUser && feedPosts.length > 0 && !isInitialized) {
      // Initialize liked posts based on current user's likes in the posts
      const userLikedPosts = new Set<string>();
      feedPosts.forEach(post => {
        if (post.likes && post.likes.includes(currentUser._id)) {
          userLikedPosts.add(post._id);
        }
      });
      setLikedPosts(userLikedPosts);
      
      // Initialize saved posts from user's savedPosts array
      if (currentUser.savedPosts) {
        setSavedPosts(new Set(currentUser.savedPosts));
      }
      
      setIsInitialized(true);
    }
  }, [currentUser, feedPosts, isInitialized]);
  
  // Sync with Redux state changes (but don't override optimistic updates)
  useEffect(() => {
    if (currentUser && feedPosts.length > 0 && isInitialized) {
      // Only update if there are actual changes from the backend
      const backendLikedPosts = new Set<string>();
      feedPosts.forEach(post => {
        if (post.likes && post.likes.includes(currentUser._id)) {
          backendLikedPosts.add(post._id);
        }
      });
      
      // Only update if the backend state is different from our current state
      // This prevents overriding optimistic updates
      setLikedPosts(prev => {
        const prevArray = Array.from(prev).sort();
        const backendArray = Array.from(backendLikedPosts).sort();
        
        // Only update if arrays are different
        if (JSON.stringify(prevArray) !== JSON.stringify(backendArray)) {
          return backendLikedPosts;
        }
        return prev;
      });
    }
  }, [feedPosts, currentUser, isInitialized]);
  
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
  
  // Toggle like post status with backend sync
  const toggleLikePost = useCallback((postId: string, userId: string) => {
    // Optimistically update the UI first
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      
      return newSet;
    });
    
    // Then sync with backend
    dispatch(likePost({ postID: postId, userID: userId }));
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