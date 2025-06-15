import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Post, addComment, deleteComment, Comment as PostComment } from '../../store/postSlice';
import { useAppDispatch } from '../../hooks/useRedux';
import { ExtendedPost } from '../../types/post';
import { useShallowEqualSelector } from '../../hooks/useShallowEqualSelector';
import { usePostActions } from '../../providers/PostActionsProvider';
import { getPetById } from '../../services/petService';
import { fetchUnreadCount } from '../../store/notificationSlice';

interface PostCardProps {
  post: Post | ExtendedPost;
  onViewPost?: (post: Post | ExtendedPost) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onViewPost }) => {

  const dispatch = useAppDispatch();
  
  const currentUser = useShallowEqualSelector((state) => state.user.currentUser);
  
  const { isSaved, isLiked, toggleSavePost, toggleLikePost } = usePostActions();
  
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [localComments, setLocalComments] = useState<PostComment[]>(post.comments || []);
  const shareOptionsRef = useRef<HTMLDivElement>(null);
  
  const [fetchedPetName, setFetchedPetName] = useState<string | null>(null);

  // Update local state when post changes (from Redux updates)
  useEffect(() => {
    setLikesCount(post.likes?.length || 0);
    setLocalComments(post.comments || []);
  }, [post.likes, post.comments]);

  // Debug: Track username changes
  useEffect(() => {
    console.log('PostCard - Post username changed to:', post.username, 'for post:', post._id);
  }, [post.username, post._id]);

  // Debug: Track when entire post object changes
  useEffect(() => {
    console.log('PostCard - Post object changed:', {
      id: post._id,
      username: post.username,
      profilePic: post.profilePic
    });
  }, [post]);

  useEffect(() => {
    let petIdToFetch: string | null = null;

    if (post.petID) {
      if (typeof post.petID === 'object' && post.petID !== null && '_id' in post.petID && typeof (post.petID as any)._id === 'string') {
        petIdToFetch = (post.petID as any)._id;
      } else if (typeof post.petID === 'string') {
        petIdToFetch = post.petID;
      }
    }

    if (petIdToFetch && !post.petName) {
      const fetchPetDetails = async () => {
        try {
          const pet = await getPetById(petIdToFetch as string);
          if (pet && pet.name) {
            setFetchedPetName(pet.name);
          }
        } catch (error) {
          console.error('Error fetching pet details:', error);
          setFetchedPetName('No Pet Info');
        }
      };
      fetchPetDetails();
    }
  }, [post.petID, post.petName]);

  const handleLikeToggle = useCallback(async () => {
    if (!currentUser) return;
    
    // Optimistically update likes count for immediate UI feedback
    const isCurrentlyLiked = isLiked(post._id);
    setLikesCount(prev => isCurrentlyLiked ? prev - 1 : prev + 1);
    
    await toggleLikePost(post._id, currentUser._id);

    // Refresh notification count after liking
    dispatch(fetchUnreadCount(currentUser._id));
  }, [currentUser, toggleLikePost, post._id, isLiked, dispatch]);

  const handleSaveToggle = useCallback(() => {
    if (!currentUser) {
      console.log('PostCard - Cannot save: No current user');
      return;
    }
    
    console.log('PostCard - Toggling save status for post:', post._id);
    console.log('PostCard - User:', currentUser._id);
    console.log('PostCard - Current saved status:', isSaved(post._id) ? 'Saved' : 'Not saved');
    console.log('PostCard - Current user savedPosts:', currentUser.savedPosts);
    
    toggleSavePost(post._id, currentUser._id);
  }, [currentUser, toggleSavePost, post._id, isSaved]);

  const handleAddComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !comment.trim()) return;
    
    // Optimistically add comment to local state for immediate UI feedback
    const tempComment: PostComment = {
      _id: `temp_${Date.now()}`,
      postID: post._id,
      userID: { 
        _id: currentUser._id, 
        username: currentUser.username, 
        profilePic: currentUser.profilePic 
      },
      username: currentUser.username,
      profilePic: currentUser.profilePic,
      content: comment.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLocalComments(prev => [...prev, tempComment]);
    
    // Dispatch to Redux which will sync with backend
    await dispatch(
      addComment({
        postID: post._id,
        userID: currentUser._id,
        text: comment.trim(),
      })
    );

    // Refresh notification count after commenting
    dispatch(fetchUnreadCount(currentUser._id));
    
    setComment('');
  }, [comment, currentUser, dispatch, post._id]);

  const handleDeleteComment = useCallback(async (commentID: string) => {
    if (!currentUser) return;
    
    try {
      // Optimistically remove comment from local state for immediate UI feedback
      setLocalComments(prev => prev.filter(c => c._id !== commentID));
      
      // Dispatch to Redux which will sync with backend
      await dispatch(deleteComment({ 
        postID: post._id, 
        commentID, 
        userID: currentUser._id 
      }));
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Revert optimistic update on error
      setLocalComments(post.comments || []);
    }
  }, [currentUser, dispatch, post._id, post.comments]);

  const handleShare = useCallback((platform: string) => {
    const postUrl = `${window.location.origin}/posts/${post._id}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://api.whatsapp.com/send?text=Check out this pet post: ${encodeURIComponent(postUrl)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=Check out this adorable pet post!`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(postUrl)
          .then(() => {
            alert('Link copied to clipboard!');
          })
          .catch(err => {
            console.error('Could not copy text: ', err);
          });
        break;
      default:
        break;
    }
    
    setShowShareOptions(false);
  }, [post._id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareOptionsRef.current && !shareOptionsRef.current.contains(event.target as Node)) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const postIsLiked = isLiked(post._id);
  const postIsSaved = isSaved(post._id);

  const displayUsername = post.username || 'Unknown User';
  const displayProfilePic = post.profilePic;
  const displayPetName = fetchedPetName || post.petName || 'No Pet Info';
  const displayTimestamp = post.timestamp || post.createdAt ? 
    new Date(post.timestamp || post.createdAt!).toLocaleString() : 'Invalid Date';

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden mb-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-soft-lg hover:-translate-y-1 dark:shadow-gray-900/30"
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center">
        <div className="flex items-center flex-grow">
          <div className="relative mr-3">
            <img
              src={displayProfilePic}
              alt={displayUsername}
              className="h-12 w-12 rounded-full object-cover border-2 border-primary shadow-sm transition-transform duration-200 hover:scale-110"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
          </div>
          <div>
            <Link to={`/profile/${post.userID}`} className="font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-400 transition-colors duration-200">
              {displayUsername}
            </Link>
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
              <span className="mr-2">{displayTimestamp}</span>
              <span>•</span>
              {post.petID ? (
                <Link to={`/pets/${post.petID}`} className="ml-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200 font-medium">
                  {displayPetName}
                </Link>
              ) : (
                <span className="ml-2 text-gray-500 dark:text-gray-400">{displayPetName}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div
        className="relative pb-[56.25%] overflow-hidden cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onViewPost && onViewPost(post)}
      >
        <img
          src={post.media || ''}
          alt={post.caption}
          className={`absolute h-full w-full object-cover transition-transform duration-500 ${isHovered ? 'scale-105' : ''}`}
        />
        {isHovered && (
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center animate-fadeIn"
          >
            <span className="text-white font-medium px-6 py-3 rounded-full bg-black/50 backdrop-blur-sm shadow-lg transform transition-transform duration-300 group-hover:scale-110">
              View Details
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 dark:text-gray-200">
        {post.caption && (
          <p className="mb-4 text-gray-800 dark:text-gray-200">{post.caption}</p>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center space-x-2 ${postIsLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'} hover:opacity-80 transition-all duration-200 active:scale-90`}
              aria-label={postIsLiked ? "Unlike post" : "Like post"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 ${postIsLiked ? 'animate-heartBeat fill-current' : ''}`}
                fill={postIsLiked ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="font-medium">{likesCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 transition-all duration-200 active:scale-90"
              aria-label={showComments ? "Hide comments" : "Show comments"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span className="font-medium">{localComments.length}</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-400 transition-all duration-200 active:scale-90"
                aria-label="Share post"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                <span className="font-medium">Share</span>
              </button>
              
              {showShareOptions && (
                <div 
                  ref={shareOptionsRef}
                  className="absolute left-0 bottom-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-soft dark:shadow-gray-900/30 p-3 z-10 min-w-[200px] animate-slideUp border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex flex-col space-y-1">
                    <button 
                      onClick={() => handleShare('whatsapp')}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span className="w-8 h-8 mr-3 flex items-center justify-center text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/30 rounded-full">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.127 18.12c-.282.401-.837.682-1.478.696-1.013.03-1.876-.328-2.685-.638-1.264-.483-2.415-1.238-3.365-2.144-1.868-1.77-3.24-4.018-3.5-6.575-.087-.858.184-1.724.909-2.272.279-.21.563-.276.856-.276h.915c.333.014.635.19.817.507.204.357.432.954.562 1.366.08.254.033.504-.124.77-.16.271-.369.489-.631.676-.104.074-.152.173-.088.299.459.92 1.087 1.747 1.947 2.357.374.266.746.553 1.174.731.145.06.277.01.371-.084.217-.212.45-.4.646-.635.19-.229.403-.298.677-.191.269.108.558.235.835.374.257.13.512.275.729.463.293.255.406.61.376.981-.064.756-.27 1.142-.535 1.432z" />
                        </svg>
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">WhatsApp</span>
                    </button>
                    
                    <button 
                      onClick={() => handleShare('facebook')}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span className="w-8 h-8 mr-3 flex items-center justify-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">Facebook</span>
                    </button>
                    
                    <button 
                      onClick={() => handleShare('twitter')}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span className="w-8 h-8 mr-3 flex items-center justify-center text-blue-400 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">Twitter</span>
                    </button>
                    
                    <button 
                      onClick={() => handleShare('copy')}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <span className="w-8 h-8 mr-3 flex items-center justify-center text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-200">Copy Link</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleSaveToggle}
            className={`flex items-center space-x-2 ${
              postIsSaved ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'
            } hover:opacity-80 transition-all duration-200 active:scale-90`}
            aria-label={postIsSaved ? "Unsave post" : "Save post"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill={postIsSaved ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <span className="font-medium">{postIsSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
        
        {showComments && (
          <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
            <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Comments</h4>
            
            {currentUser && (
              <form onSubmit={handleAddComment} className="mb-4 flex">
                <img
                  src={currentUser.profilePic || 'https://via.placeholder.com/40'}
                  alt={currentUser.username}
                  className="h-8 w-8 rounded-full object-cover mr-2"
                />
                <div className="flex-grow relative">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-2 pr-16 bg-gray-100 dark:bg-gray-700 border-0 rounded-full focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 focus:outline-none text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim()}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-1.5 ${
                      comment.trim() 
                        ? 'bg-primary text-white hover:bg-primary-600 dark:hover:bg-primary-700' 
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    } transition-colors duration-200`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </form>
            )}
            
            <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
              {localComments.length > 0 ? (
                localComments.map((comment) => {
                  // Handle both populated and unpopulated comment user data
                  const commentUser = comment.userID;
                  const commentUsername = (typeof commentUser === 'object' && commentUser !== null && 'username' in commentUser)
                    ? commentUser.username 
                    : comment.username || 'Unknown User';
                  const commentProfilePic = (typeof commentUser === 'object' && commentUser !== null && 'profilePic' in commentUser)
                    ? commentUser.profilePic 
                    : comment.profilePic;
                  const commentUserID = (typeof commentUser === 'object' && commentUser !== null && '_id' in commentUser)
                    ? commentUser._id 
                    : commentUser;

                  // Check if current user owns this comment
                  const isCommentOwner = currentUser && commentUserID === currentUser._id;

                  return (
                    <div 
                      key={comment._id} 
                      className="flex items-start animate-fadeIn"
                    >
                      {commentProfilePic && (
                        <img
                          src={commentProfilePic}
                          alt={commentUsername}
                          className="h-8 w-8 rounded-full object-cover mr-2 border border-gray-200 dark:border-gray-700"
                        />
                      )}
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2 flex-grow">
                        <div className="flex justify-between items-start">
                          <Link to={`/profile/${commentUserID}`} className="font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-400 transition-colors duration-200">
                            {commentUsername}
                          </Link>
                          
                          {/* Show delete button only for comments by current user */}
                          {currentUser && (currentUser._id === commentUserID || currentUser._id === post.userID) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-gray-400 hover:text-red-500 ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              aria-label="Delete comment"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">{comment.content}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard; 