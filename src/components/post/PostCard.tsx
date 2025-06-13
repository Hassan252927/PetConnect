import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import { Post, addComment } from '../../store/postSlice';
import { useAppDispatch } from '../../hooks/useRedux';
import { ExtendedPost } from '../../types/post';
import { useShallowEqualSelector } from '../../hooks/useShallowEqualSelector';
import { usePostActions } from '../../providers/PostActionsProvider';
import { getPetById } from '../../services/petService';

interface PostCardProps {
  post: Post | ExtendedPost;
  onViewPost?: (post: Post | ExtendedPost) => void;
}

const PostCard: React.FC<PostCardProps> = memo(({ post, onViewPost }) => {
  console.log('PostCard received post:', post);

  const dispatch = useAppDispatch();
  
  const currentUser = useShallowEqualSelector((state) => state.user.currentUser);
  
  const { isSaved, isLiked, toggleSavePost, toggleLikePost } = usePostActions();
  
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [localComments, setLocalComments] = useState(post.comments);
  const shareOptionsRef = useRef<HTMLDivElement>(null);
  
  const [fetchedPetName, setFetchedPetName] = useState<string | null>(null);

  useEffect(() => {
    setLocalComments(post.comments);
  }, [post.comments]);

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

  const handleLikeToggle = useCallback(() => {
    if (!currentUser) return;
    
    setLikesCount(prev => isLiked(post._id) ? prev - 1 : prev + 1);
    
    toggleLikePost(post._id, currentUser._id);
  }, [currentUser, toggleLikePost, post._id, isLiked]);

  const handleSaveToggle = useCallback(() => {
    if (!currentUser) return;
    toggleSavePost(post._id, currentUser._id);
  }, [currentUser, toggleSavePost, post._id]);

  const handleAddComment = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !comment.trim()) return;
    
    const tempComment = {
      _id: `temp_${Date.now()}`,
      postID: post._id,
      userID: currentUser._id,
      username: currentUser.username,
      profilePic: currentUser.profilePic,
      content: comment.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setLocalComments(prev => [...prev, tempComment]);
    
    dispatch(
      addComment({
        postID: post._id,
        userID: currentUser._id,
        text: comment.trim(),
      })
    );
    
    setComment('');
  }, [comment, currentUser, dispatch, post._id]);

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
  const displayProfilePic = post.profilePic || '/default-profile.png';
  const displayPetName = fetchedPetName || post.petName || 'No Pet Info';
  const displayTimestamp = post.timestamp ? new Date(post.timestamp).toLocaleString() : 'Invalid Date';

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={displayProfilePic}
            alt={displayUsername}
            className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-primary transition-transform duration-200 hover:scale-110"
          />
          <div>
            <Link to={`/profile/${post.userID}`} className="font-medium text-gray-800 hover:text-primary transition-colors duration-200">
              {displayUsername}
            </Link>
            <div className="flex items-center text-gray-500 text-sm">
              <span className="mr-2">{displayTimestamp}</span>
              <span>•</span>
              {post.petID ? (
                <Link to={`/pets/${post.petID}`} className="ml-2 hover:text-primary transition-colors duration-200">
                  {displayPetName}
                </Link>
              ) : (
                <span className="ml-2 text-gray-500">{displayPetName}</span>
              )}
            </div>
          </div>
        </div>
        <div 
          className="relative group hover:rotate-12 transition-transform duration-200"
        >
          <button className="text-gray-500 hover:text-gray-800 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div
        className="relative pb-[56.25%] overflow-hidden cursor-pointer"
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
            className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center animate-fadeIn"
          >
            <span className="text-white font-medium px-4 py-2 rounded-full bg-black bg-opacity-50">
              View Details
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center ${postIsLiked ? 'text-red-500' : 'text-gray-600'} hover:text-opacity-80 transition-transform active:scale-90`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 mr-1 ${postIsLiked ? 'animate-heartBeat' : ''}`}
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
              <span>{likesCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center text-gray-600 hover:text-primary transition-colors duration-200 active:scale-90"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-1"
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
              <span>{localComments.length}</span>
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="flex items-center text-gray-600 hover:text-primary transition-colors duration-200 active:scale-90"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-1"
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
                <span>Share</span>
              </button>
              
              {showShareOptions && (
                <div 
                  ref={shareOptionsRef}
                  className="absolute left-0 bottom-full mb-2 bg-white rounded-lg shadow-lg p-2 z-10 min-w-[180px] animate-fadeIn"
                >
                  <div className="flex flex-col space-y-1">
                    <button 
                      onClick={() => handleShare('whatsapp')}
                      className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <span className="w-6 h-6 mr-2 flex items-center justify-center text-green-600">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.127 18.12c-.282.401-.837.682-1.478.696-1.013.03-1.876-.328-2.685-.638-1.264-.483-2.415-1.238-3.365-2.144-1.868-1.77-3.24-4.018-3.5-6.575-.087-.858.184-1.724.909-2.272.279-.21.563-.276.856-.276h.915c.333.014.635.19.817.507.204.357.432.954.562 1.366.08.254.033.504-.124.77-.16.271-.369.489-.631.676-.104.074-.152.173-.088.299.459.92 1.087 1.747 1.947 2.357.374.266.746.553 1.174.731.145.06.277.01.371-.084.217-.212.45-.4.646-.635.19-.229.403-.298.677-.191.269.108.558.235.835.374.257.13.512.275.729.463.293.255.406.61.376.981-.064.756-.27 1.142-.535 1.432z" />
                        </svg>
                      </span>
                      WhatsApp
                    </button>
                    
                    <button 
                      onClick={() => handleShare('facebook')}
                      className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <span className="w-6 h-6 mr-2 flex items-center justify-center text-blue-600">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </span>
                      Facebook
                    </button>
                    
                    <button 
                      onClick={() => handleShare('twitter')}
                      className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <span className="w-6 h-6 mr-2 flex items-center justify-center text-blue-400">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </span>
                      Twitter
                    </button>
                    
                    <button 
                      onClick={() => handleShare('copy')}
                      className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <span className="w-6 h-6 mr-2 flex items-center justify-center text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      </span>
                      Copy Link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleSaveToggle}
            className={`text-gray-600 ${postIsSaved ? 'text-primary' : ''} transition-all duration-200 hover:-translate-y-1 active:scale-90`}
            aria-label={postIsSaved ? "Unsave post" : "Save post"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 ${postIsSaved ? 'animate-pulse' : ''}`}
              fill={postIsSaved ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={postIsSaved ? 0 : 2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="mb-3">
            <span className="font-medium text-gray-800">
              {post.username}
            </span>{' '}
            <span className="text-gray-700">{post.caption}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 text-xs mt-2">
            {post.tags && post.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-gray-100 px-2 py-1 rounded-md inline-block transition-all hover:bg-gray-200 hover:scale-105 hover:shadow-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
        
        {showComments && (
          <div 
            className="mt-4 border-t border-gray-100 pt-4 animate-slideDown"
          >
            <h4 className="font-medium text-gray-800 mb-2">Comments</h4>
            
            {localComments.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {localComments.map((comment) => (
                  <div 
                    key={comment._id} 
                    className="flex items-start animate-fadeIn"
                  >
                    <img
                      src={comment.profilePic}
                      alt={comment.username}
                      className="h-8 w-8 rounded-full object-cover mr-2"
                    />
                    <div className="bg-gray-100 rounded-lg px-3 py-2 flex-grow">
                      <div className="flex justify-between items-start">
                        <Link to={`/profile/${comment.userID}`} className="font-medium text-gray-800 hover:text-primary transition-colors duration-200">
                          {comment.username}
                        </Link>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            )}
            
            {currentUser && (
              <form onSubmit={handleAddComment} className="mt-3">
                <div className="flex items-center">
                  <img
                    src={currentUser.profilePic}
                    alt={currentUser.username}
                    className="h-8 w-8 rounded-full object-cover mr-2"
                  />
                <input
                  type="text"
                  value={comment}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                    className="flex-grow bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                    className="ml-2 text-primary disabled:text-gray-400 disabled:cursor-not-allowed transition-transform hover:scale-110 active:scale-90"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default PostCard; 