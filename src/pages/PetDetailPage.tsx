import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import Layout from '../components/layout/Layout';
import PostCard from '../components/post/PostCard';
import { Pet } from '../store/petSlice';
import { Post } from '../store/postSlice';

const PetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { pets } = useAppSelector((state) => state.pet);
  const { feedPosts } = useAppSelector((state) => state.post);
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [petPosts, setPetPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    // Find the pet in the Redux store
    const foundPet = pets.find(p => p._id === id);
    
    if (foundPet) {
      setPet(foundPet);
      // Find posts related to this pet
      const relatedPosts = feedPosts.filter(post => post.petID === id);
      setPetPosts(relatedPosts);
    }
    
    setIsLoading(false);
  }, [id, pets, feedPosts]);

  const handleEditPet = () => {
    navigate(`/pets/${id}/edit`);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-gray-500 dark:text-gray-400">Loading pet details...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!pet) {
    return (
      <Layout>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="text-5xl mb-4">🐾</div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Pet not found</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We couldn't find the pet you're looking for.
          </p>
          <button
            onClick={() => navigate('/pets')}
            className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
          >
            Back to My Pets
          </button>
        </div>
      </Layout>
    );
  }

  const isOwner = currentUser && pet.ownerID === currentUser._id;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
        {/* Cover/Profile Image */}
        <div className="relative h-80">
          <img
            src={pet.image || 'https://via.placeholder.com/800x400?text=No+Image'}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Back Button */}
          <button 
            onClick={() => navigate('/pets')}
            className="absolute top-4 left-4 bg-white/30 text-white p-2 rounded-full hover:bg-white/50 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          {/* Pet Type Badge */}
          <div className="absolute top-4 right-4 bg-primary/80 text-white px-4 py-1 rounded-full backdrop-blur-sm">
            {pet.animal}
          </div>
          
          {/* Name and Basic Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{pet.name}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {pet.breed}
              </span>
              {pet.age && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {pet.age} {pet.age === 1 ? 'year' : 'years'} old
                </span>
              )}
              {pet.gender && (
                <span className="flex items-center">
                  {pet.gender === 'Male' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                    </svg>
                  )}
                  {pet.gender}
                </span>
              )}
              {pet.weight && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  {pet.weight} lbs
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="p-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button
              className={`py-2 px-4 font-medium text-sm ${
                activeTab === 'about'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
              }`}
              onClick={() => setActiveTab('about')}
            >
              About
            </button>
            {isOwner && (
              <button
                onClick={handleEditPet}
                className="ml-auto py-2 px-4 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary/90 transition-all duration-200"
              >
                Edit Pet
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'posts' && (
            <>
              {petPosts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">📸</div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No posts yet</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Share some memorable moments with {pet.name}!
                  </p>
                  {isOwner && (
                    <button
                      onClick={() => navigate('/create-post')}
                      className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                    >
                      Create First Post
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {petPosts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onViewPost={(post: Post) => navigate(`/posts/${post._id}`)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">About {pet.name}</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {pet.description || `No description available for ${pet.name}.`}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Details</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Animal</span>
                      <span className="font-medium text-gray-800 dark:text-white">{pet.animal}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Breed</span>
                      <span className="font-medium text-gray-800 dark:text-white">{pet.breed}</span>
                    </li>
                    {pet.age && (
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Age</span>
                        <span className="font-medium text-gray-800 dark:text-white">{pet.age} {pet.age === 1 ? 'year' : 'years'}</span>
                      </li>
                    )}
                    {pet.gender && (
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Gender</span>
                        <span className="font-medium text-gray-800 dark:text-white">{pet.gender}</span>
                      </li>
                    )}
                    {pet.weight && (
                      <li className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Weight</span>
                        <span className="font-medium text-gray-800 dark:text-white">{pet.weight} lbs</span>
                      </li>
                    )}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Join Date</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Joined {new Date(pet.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PetDetailPage; 