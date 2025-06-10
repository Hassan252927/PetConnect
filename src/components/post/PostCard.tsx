import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Post, likePost, unlikePost, addComment } from '../../store/postSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { savePost, unsavePost } from '../../store/userSlice';

interface PostCardProps {
  post: Post;
  onView?: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onView }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center">
          <img
            src={post.userProfilePic}
            alt={post.username}
            className="h-10 w-10 rounded-full object-cover mr-3"
          />
          <div>
            <Link to={`/profile/${post.userID}`} className="font-medium text-gray-800 hover:text-primary">
              {post.username}
            </Link>
            <div className="flex items-center text-gray-500 text-sm">
              <span className="mr-2">{formatDate(post.timestamp)}</span>
              <span>•</span>
              <Link to={`/pets/${post.petID}`} className="ml-2 hover:text-primary">
                {post.petName}
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative pb-[56.25%]">
        <img
          src={post.media}
          alt={post.caption}
          className="absolute h-full w-full object-cover cursor-pointer"
          onClick={() => onView && onView(post)}
        />
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center ${isLiked ? 'text-red-500' : 'text-gray-600'} hover:text-opacity-80`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-1"
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
              className="flex items-center text-gray-600 hover:text-primary"
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
          </div>
          
          <div className="flex items-center">
            <button
              onClick={handleSaveToggle}
              className={`text-gray-600 hover:text-primary ${isSaved ? 'text-primary' : ''}`}
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
        </div>
        
        <div>
          <p className="text-gray-800">
            <span className="font-medium">{post.petName}</span> {post.caption}
          </p>
          <div className="mt-2 text-sm text-gray-600">
            <span className="mr-2 bg-gray-100 px-2 py-1 rounded-md">{post.animal}</span>
            <span className="bg-gray-100 px-2 py-1 rounded-md">{post.breed}</span>
          </div>
        </div>
        
        {showComments && (
          <div className="mt-4 border-t border-gray-100 pt-4">
            <h4 className="font-medium text-gray-800 mb-2">Comments</h4>
            
            {post.comments.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {post.comments.map((comment) => (
                  <div key={comment._id} className="flex items-start">
                    <img
                      src={comment.profilePic}
                      alt={comment.username}
                      className="h-8 w-8 rounded-full object-cover mr-2"
                    />
                    <div className="bg-gray-100 rounded-lg px-3 py-2 flex-grow">
                      <div className="flex justify-between items-start">
                        <Link to={`/profile/${comment.userID}`} className="font-medium text-gray-800 hover:text-primary">
                          {comment.username}
                        </Link>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            )}
            
            {currentUser && (
              <form onSubmit={handleAddComment} className="mt-4 flex">
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-opacity-90 disabled:opacity-50"
                >
                  Post
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard; 