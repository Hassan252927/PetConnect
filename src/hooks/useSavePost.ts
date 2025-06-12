import { useState, useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { savePost, unsavePost } from '../store/userSlice';

/**
 * Custom hook to handle post saving functionality
 * This hook isolates the save post state and actions to prevent unnecessary re-renders
 */
export const useSavePost = (postId: string) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.user.currentUser);
  
  // Local state to track if post is saved
  const [isSaved, setIsSaved] = useState(false);
  
  // Initialize saved state
  useEffect(() => {
    if (currentUser && currentUser.savedPosts) {
      setIsSaved(currentUser.savedPosts.includes(postId));
    }
  }, [currentUser, postId]);
  
  // Toggle save/unsave
  const toggleSave = useCallback(() => {
    if (!currentUser) return;
    
    // Optimistically update UI
    setIsSaved(prev => !prev);
    
    // Dispatch action
    if (isSaved) {
      dispatch(unsavePost(postId));
    } else {
      dispatch(savePost(postId));
    }
  }, [currentUser, dispatch, postId, isSaved]);
  
  return { isSaved, toggleSave };
}; 