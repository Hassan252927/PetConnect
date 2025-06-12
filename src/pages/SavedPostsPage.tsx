import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Post {
  _id: string;
  title: string;
  content: string;
  image: string;
  userID: {
    _id: string;
    username: string;
  };
  petID: {
    _id: string;
    name: string;
  };
  likes: string[];
  timestamp: string;
}

const SavedPostsPage: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        const response = await axios.get('/api/users/current/savedPosts');
        setPosts(response.data);
      } catch (error) {
        setError('Error fetching saved posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  const handleUnsavePost = async (postId: string) => {
    try {
      await axios.delete(`/api/users/current/savedPosts/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      setError('Error unsaving post');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Saved Posts</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No saved posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative h-48">
                  <img
                    src={post.image || 'https://via.placeholder.com/400x300'}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-600 text-sm mb-2">
                    Posted by {post.userID.username} • {new Date(post.timestamp).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700 mb-4">
                    {post.content.substring(0, 100)}...
                  </p>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => navigate(`/posts/${post._id}`)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Read More
                    </button>
                    <button
                      onClick={() => handleUnsavePost(post._id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Unsave
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPostsPage; 