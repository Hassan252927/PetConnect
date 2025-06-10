import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post, likePost, unlikePost, addComment } from '../../store/postSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { savePost, unsavePost } from '../../store/userSlice';
import { ExtendedPost } from '../../types/post';

interface PostCardProps {
  post: Post | ExtendedPost;
  onView?: (post: Post | ExtendedPost) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onView }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isLiked = currentUser && post.likes.includes(currentUser._id);
  const isSaved = currentUser && currentUser.savedPosts.includes(post._id);

  const handleLikeToggle = () => {
    if (!currentUser) return;
    
    if (isLiked) {
      dispatch(unlikePost({ postId: post._id, userId: currentUser._id }));
    } else {
      dispatch(likePost({ postId: post._id, userId: currentUser._id }));
    }
  };

  const handleSaveToggle = () => {
    if (!currentUser) return;
    
    if (isSaved) {
      dispatch(unsavePost(post._id));
    } else {
      dispatch(savePost(post._id));
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !comment.trim()) return;
    
    dispatch(
      addComment({
        postID: post._id,
        userID: currentUser._id,
        username: currentUser.username,
        profilePic: currentUser.profilePic,
        content: comment.trim(),
      })
    );
    
    setComment('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={post.userProfilePic}
            alt={post.username}
            className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-primary transition-transform duration-200 hover:scale-110"
          />
          <div>
            <Link to={`/profile/${post.userID}`} className="font-medium text-gray-800 hover:text-primary transition-colors duration-200">
              {post.username}
            </Link>
            <div className="flex items-center text-gray-500 text-sm">
              <span className="mr-2">{formatDate(post.timestamp)}</span>
              <span>•</span>
              <Link to={`/pets/${post.petID}`} className="ml-2 hover:text-primary transition-colors duration-200">
                {post.petName}
              </Link>
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
        onClick={() => onView && onView(post)}
      >
        <img
          src={post.media}
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
              className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-600'} hover:text-opacity-80 transition-transform active:scale-90`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 mr-1 ${isLiked ? 'animate-heartBeat' : ''}`}
                fill={isLiked ? 'currentColor' : 'none'}
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
              <span>{post.likes.length}</span>
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
              <span>{post.comments.length}</span>
            </button>
            
            <button className="flex items-center text-gray-600 hover:text-primary transition-colors duration-200 active:scale-90">
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
          </div>
          
            <button
              onClick={handleSaveToggle}
            className={`text-gray-600 hover:text-primary ${isSaved ? 'text-primary' : ''} transition-all duration-200 hover:-translate-y-1 active:scale-90`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill={isSaved ? 'currentColor' : 'none'}
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
            </button>
        </div>
        
        <div>
          <p className="text-gray-800">
            <span className="font-medium">{post.petName}</span> {post.caption}
          </p>
          <div className="mt-2 text-sm text-gray-600">
            <span 
              className="mr-2 bg-gray-100 px-2 py-1 rounded-md inline-block transition-all hover:bg-gray-200 hover:scale-105 hover:shadow-sm"
            >
              {post.animal}
            </span>
            <span 
              className="bg-gray-100 px-2 py-1 rounded-md inline-block transition-all hover:bg-gray-200 hover:scale-105 hover:shadow-sm"
            >
              {post.breed}
            </span>
          </div>
        </div>
        
        {showComments && (
          <div 
            className="mt-4 border-t border-gray-100 pt-4 animate-slideDown"
          >
            <h4 className="font-medium text-gray-800 mb-2">Comments</h4>
            
            {post.comments.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {post.comments.map((comment) => (
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
                          {formatDate(comment.timestamp)}
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
};

export default PostCard; 