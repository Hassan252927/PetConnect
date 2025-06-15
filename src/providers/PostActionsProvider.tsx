import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { savePost, unsavePost } from '../store/userSlice';
import { likePost } from '../store/postSlice';
import { savePost as savePostService, unsavePost as unsavePostService } from '../services/userService';

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
    if (currentUser && !isInitialized) {
      console.log('PostActionsProvider - Initializing post actions');
      
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
        console.log('PostActionsProvider - Initializing saved posts:', currentUser.savedPosts);
        setSavedPosts(new Set(currentUser.savedPosts));
      }
      
      setIsInitialized(true);
    }
  }, [currentUser, feedPosts, isInitialized]);
  
  // Sync with Redux state changes (but don't override optimistic updates)
  useEffect(() => {
    if (currentUser && isInitialized) {
      console.log('PostActionsProvider - Syncing with Redux state');
      
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
          console.log('PostActionsProvider - Updating liked posts from backend');
          return backendLikedPosts;
        }
        return prev;
      });
      
      // Update saved posts from user state
      if (currentUser.savedPosts) {
        const backendSavedPosts = new Set(currentUser.savedPosts);
        
        setSavedPosts(prev => {
          const prevArray = Array.from(prev).sort();
          const backendArray = Array.from(backendSavedPosts).sort();
          
          // Only update if arrays are different
          if (JSON.stringify(prevArray) !== JSON.stringify(backendArray)) {
            console.log('PostActionsProvider - Updating saved posts from backend');
            return backendSavedPosts;
          }
          return prev;
        });
      }
    }
  }, [feedPosts, currentUser, isInitialized]);
  
  // Toggle save post status
  const toggleSavePost = useCallback((postId: string, userId: string) => {
    if (!currentUser) return;
    
    console.log('PostActionsProvider - toggleSavePost called for post:', postId, 'user:', userId);
    
    // Optimistically update the UI first
    setSavedPosts(prev => {
      const newSet = new Set(Array.from(prev));
      
      if (newSet.has(postId)) {
        console.log('PostActionsProvider - Unsaving post:', postId);
        newSet.delete(postId);
        
        // Call the API directly
        unsavePostService(userId, postId)
          .then(updatedUser => {
            console.log('PostActionsProvider - Unsave API response:', updatedUser);
            // Update Redux state
            dispatch(unsavePost(postId));
            
            // Update local state with the latest savedPosts from the API
            if (updatedUser && updatedUser.savedPosts) {
              setSavedPosts(new Set(updatedUser.savedPosts));
            }
          })
          .catch(error => {
            console.error('PostActionsProvider - Error unsaving post:', error);
            // Revert optimistic update on error
            setSavedPosts(prevSet => {
              const revertedSet = new Set(Array.from(prevSet));
              revertedSet.add(postId);
              return revertedSet;
            });
          });
      } else {
        console.log('PostActionsProvider - Saving post:', postId);
        newSet.add(postId);
        
        // Call the API directly
        savePostService(userId, postId)
          .then(updatedUser => {
            console.log('PostActionsProvider - Save API response:', updatedUser);
            // Update Redux state
            dispatch(savePost(postId));
            
            // Update local state with the latest savedPosts from the API
            if (updatedUser && updatedUser.savedPosts) {
              setSavedPosts(new Set(updatedUser.savedPosts));
            }
          })
          .catch(error => {
            console.error('PostActionsProvider - Error saving post:', error);
            // Revert optimistic update on error
            setSavedPosts(prevSet => {
              const revertedSet = new Set(Array.from(prevSet));
              revertedSet.delete(postId);
              return revertedSet;
            });
          });
      }
      
      return newSet;
    });
  }, [dispatch, currentUser]);
  
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