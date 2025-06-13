import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { addComment, likePost } from '../store/postSlice';
import { savePost, unsavePost } from '../store/userSlice';

const PostDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Redux state
  const { feedPosts } = useAppSelector((state) => state.post);
  const { currentUser } = useAppSelector((state) => state.user);
  const { pets } = useAppSelector((state) => state.pet);
  
  // Local state
  const [post, setPost] = useState<any>(null);
  const [pet, setPet] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Find the post in Redux store
    const foundPost = feedPosts.find(p => p._id === id);
    
    if (foundPost) {
      setPost(foundPost);
      
      // Find associated pet if petID exists
      if (foundPost.petID) {
        const foundPet = pets.find(p => p._id === foundPost.petID);
        if (foundPet) {
          setPet(foundPet);
        }
      }
      
      setIsLoading(false);
    } else {
      setError('Post not found');
      setIsLoading(false);
    }
  }, [id, feedPosts, pets]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      await dispatch(
        addComment({
          postID: post._id,
          userID: currentUser._id,
          text: newComment.trim(),
        })
      );
      setNewComment('');
    } catch (error) {
      setError('Error posting comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeToggle = async () => {
    if (!currentUser) return;
    
    try {
      await dispatch(likePost({ postID: post._id, userID: currentUser._id }));
    } catch (error) {
      setError('Error toggling like');
    }
  };

  const handleSaveToggle = async () => {
    if (!currentUser) return;
    
    try {
      const isSaved = currentUser.savedPosts?.includes(post._id);
      
      if (isSaved) {
        await dispatch(unsavePost(post._id));
      } else {
        await dispatch(savePost(post._id));
      }
    } catch (error) {
      setError('Error toggling save');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-gray-500 dark:text-gray-400">Loading post details...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-5xl mb-4">📸</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Post not found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't find the post you're looking for.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  const isLiked = currentUser && post.likes.includes(currentUser._id);
  const isSaved = currentUser && currentUser.savedPosts?.includes(post._id);
  const isOwner = currentUser && post.userID === currentUser._id;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Post Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src={post.profilePic}
              alt={post.username}
              className="h-12 w-12 rounded-full object-cover mr-4 border-2 border-primary"
            />
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-white">{post.username}</h3>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span>{formatDate(post.createdAt)}</span>
                {pet && (
                  <>
                    <span className="mx-2">•</span>
                    <button 
                      onClick={() => navigate(`/pets/${pet._id}`)}
                      className="text-primary hover:underline"
                    >
                      {pet.name}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/posts/${post._id}/edit`)}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>
        
        {/* Post Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6">
          {post.media && (
            <div className="relative w-full" style={{ maxHeight: '70vh' }}>
              <img
                src={post.media}
                alt={post.caption}
                className="w-full object-contain max-h-[70vh]"
              />
            </div>
          )}
          
          <div className="p-4 md:p-6">
            <div className="mb-6">
              <p className="text-gray-800 dark:text-white text-lg whitespace-pre-line mb-4">{post.caption}</p>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLikeToggle}
                  className={`flex items-center space-x-1 ${
                    isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                  } hover:text-opacity-80 transition-all duration-200`}
                >
                  <svg
                    className={`w-6 h-6 ${isLiked ? 'fill-current' : 'stroke-current fill-none'}`}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
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
                  className="flex items-center space-x-1 text-gray-500 dark:text-gray-400"
                  onClick={() => document.getElementById('comment-input')?.focus()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 stroke-current fill-none"
                    viewBox="0 0 24 24"
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
                
                <button className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 stroke-current fill-none"
                    viewBox="0 0 24 24"
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
                className={`${
                  isSaved ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                } hover:text-opacity-80 transition-all duration-200`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-6 w-6 ${isSaved ? 'fill-current' : 'stroke-current fill-none'}`}
                  viewBox="0 0 24 24"
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
            
            {/* Comments */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                Comments {post.comments.length > 0 && `(${post.comments.length})`}
              </h3>
              
              {/* Comment Form */}
              {currentUser && (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex items-start space-x-3">
                    <img
                      src={currentUser.profilePic}
                      alt={currentUser.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex-grow">
                      <textarea
                        id="comment-input"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                        rows={2}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={isSubmitting || !newComment.trim()}
                          className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all duration-200"
                        >
                          {isSubmitting ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
              
              {/* Comments List */}
              {post.comments.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No comments yet. Be the first to share your thoughts!
                </div>
              ) : (
                <div className="space-y-4">
                  {post.comments.map((comment: any) => (
                    <div key={comment._id} className="flex items-start space-x-3">
                      <img
                        src={comment.profilePic}
                        alt={comment.username}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="flex-grow bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-800 dark:text-white">{comment.username}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
          
          {pet && (
            <button
              onClick={() => navigate(`/pets/${pet._id}`)}
              className="flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              View {pet.name}'s Profile
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PostDetailPage; 