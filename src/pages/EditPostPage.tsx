import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { updatePost } from '../store/postSlice';
import { getPostById } from '../services/postService';
import { fetchUserPets } from '../store/petSlice';
import Layout from '../components/layout/Layout';

interface PostFormData {
  caption: string;
  petID: string;
}

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentUser } = useAppSelector((state) => state.user);
  const { pets } = useAppSelector((state) => state.pet);
  
  const [formData, setFormData] = useState<PostFormData>({
    caption: '',
    petID: ''
  });
  const [post, setPost] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !currentUser) {
        setError('Invalid post ID or user not logged in');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch post data
        const postData = await getPostById(id);
        setPost(postData);
        
        // Get the actual user ID (handle both string and populated object)
        const postOwnerID = typeof postData.userID === 'object' && postData.userID !== null 
          ? (postData.userID as any)._id 
          : postData.userID;
        
        // Check if current user owns this post
        if (postOwnerID !== currentUser._id) {
          setError('You can only edit your own posts');
          setIsLoading(false);
          return;
        }

        // Set form data
        setFormData({
          caption: postData.caption || '',
          petID: typeof postData.petID === 'string' ? postData.petID : postData.petID?._id || ''
        });

        // Fetch user's pets if not already loaded
        if (pets.length === 0) {
          dispatch(fetchUserPets(currentUser._id));
        }
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Error loading post data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser, dispatch, pets.length]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !formData.caption.trim()) {
      setError('Caption is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await dispatch(updatePost({ 
        postID: id, 
        caption: formData.caption.trim() 
      })).unwrap();
      
      navigate(`/posts/${id}`);
    } catch (error: any) {
      setError(error.message || 'Error updating post');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Edit Post</h1>

          {post && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">Current Post</h3>
              {post.media && (
                <img 
                  src={post.media} 
                  alt="Post" 
                  className="w-full h-48 object-cover rounded-lg mb-3"
                />
              )}
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Pet: {typeof post.petID === 'object' ? post.petID?.name : post.petName || 'Unknown'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Caption
              </label>
              <textarea
                name="caption"
                value={formData.caption}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Write a caption for your post..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 focus:outline-none text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pet (Optional - for reference only)
              </label>
              <select
                name="petID"
                value={formData.petID}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 focus:outline-none text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700"
                disabled
              >
                <option value="">No pet selected</option>
                {pets.map(pet => (
                  <option key={pet._id} value={pet._id}>
                    {pet.name} ({pet.animal})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Note: Pet selection cannot be changed after post creation
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting || !formData.caption.trim()}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default EditPostPage; 