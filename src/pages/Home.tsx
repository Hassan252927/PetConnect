import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchPosts, Post, setCurrentPost } from '../store/postSlice';
import { fetchUserPets } from '../store/petSlice';
import Layout from '../components/layout/Layout';
import PostCard from '../components/post/PostCard';
import PostForm from '../components/post/PostForm';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.user);
  const { feedPosts, isLoading, error } = useAppSelector((state) => state.post);
  const { pets } = useAppSelector((state) => state.pet);
  
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  useEffect(() => {
    dispatch(fetchPosts());
    
    if (currentUser) {
      dispatch(fetchUserPets(currentUser._id));
    }
  }, [dispatch, currentUser]);
  
  const handleViewPost = (post: Post) => {
    dispatch(setCurrentPost(post));
    navigate(`/posts/${post._id}`);
  };
  
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {currentUser && (
            <div className="mb-6">
              {!showCreatePost ? (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full bg-white rounded-lg shadow-md p-4 text-left flex items-center text-gray-600 hover:bg-gray-50"
                >
                  <img
                    src={currentUser.profilePic}
                    alt={currentUser.username}
                    className="h-10 w-10 rounded-full object-cover mr-3"
                  />
                  <span>Share a moment with your pet...</span>
                </button>
              ) : (
                <PostForm
                  onSuccess={() => setShowCreatePost(false)}
                  onCancel={() => setShowCreatePost(false)}
                />
              )}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-500">Loading posts...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {error}
            </div>
          ) : feedPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet!</h3>
              <p className="text-gray-600 mb-6">
                Be the first to share a moment with your pet or follow other pet owners to see their posts.
              </p>
              {currentUser && (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="btn-primary"
                >
                  Create Your First Post
                </button>
              )}
            </div>
          ) : (
            <div>
              {feedPosts.map((post) => (
                <PostCard key={post._id} post={post} onView={handleViewPost} />
              ))}
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Discover Pets</h3>
            <div className="space-y-2">
              <button className="w-full py-2 px-4 rounded-md text-left hover:bg-gray-50">
                🐶 Dogs
              </button>
              <button className="w-full py-2 px-4 rounded-md text-left hover:bg-gray-50">
                🐱 Cats
              </button>
              <button className="w-full py-2 px-4 rounded-md text-left hover:bg-gray-50">
                🐰 Rabbits
              </button>
              <button className="w-full py-2 px-4 rounded-md text-left hover:bg-gray-50">
                🐦 Birds
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="w-full text-primary hover:text-opacity-80 text-center mt-2"
              >
                See More
              </button>
            </div>
          </div>
          
          {currentUser && pets.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Pets</h3>
              <div className="space-y-4">
                {pets.slice(0, 3).map((pet) => (
                  <div key={pet._id} className="flex items-center">
                    <img
                      src={pet.image}
                      alt={pet.name}
                      className="h-12 w-12 rounded-full object-cover mr-3"
                    />
                    <div>
                      <h4 className="font-medium text-gray-800">{pet.name}</h4>
                      <p className="text-sm text-gray-600">
                        {pet.animal}, {pet.breed}
                      </p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => navigate('/pets')}
                  className="w-full text-primary hover:text-opacity-80 text-center mt-2"
                >
                  View All Pets
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Home; 