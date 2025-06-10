import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchPosts, Post, setCurrentPost } from '../store/postSlice';
import { fetchUserPets } from '../store/petSlice';
import Layout from '../components/layout/Layout';
import PostCard from '../components/post/PostCard';
import PostForm from '../components/post/PostForm';
import SearchBar from '../components/search/SearchBar';
import FilterPanel, { FilterOptions } from '../components/search/FilterPanel';
import { ExtendedPost, asPost } from '../types/post';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.user);
  const { feedPosts, isLoading, error } = useAppSelector((state) => state.post);
  const { pets } = useAppSelector((state) => state.pet);
  
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    animalType: '',
    breed: '',
    age: '',
    size: '',
    gender: '',
    location: ''
  });
  
  // Filtered posts
  const [filteredPosts, setFilteredPosts] = useState<ExtendedPost[]>([]);
  const [activeTab, setActiveTab] = useState('latest');
  
  useEffect(() => {
    dispatch(fetchPosts());
    
    if (currentUser) {
      dispatch(fetchUserPets(currentUser._id));
    }
  }, [dispatch, currentUser]);
  
  // Apply filters and search to posts
  useEffect(() => {
    // Cast feedPosts to ExtendedPost[] to satisfy TypeScript
    const postsWithExtendedInfo = feedPosts as unknown as ExtendedPost[];
    let filtered = [...postsWithExtendedInfo];
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.petName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply animal type filter
    if (activeFilters.animalType) {
      filtered = filtered.filter(post => 
        post.animal === activeFilters.animalType
      );
    }
    
    // Apply breed filter
    if (activeFilters.breed) {
      filtered = filtered.filter(post => 
        post.breed === activeFilters.breed
      );
    }
    
    // Sort based on active tab
    if (activeTab === 'trending') {
      filtered.sort((a, b) => b.likes.length - a.likes.length);
    } else if (activeTab === 'latest') {
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    
    setFilteredPosts(filtered);
  }, [feedPosts, searchQuery, activeFilters, activeTab]);
  
  const handleViewPost = (post: Post | ExtendedPost) => {
    dispatch(setCurrentPost(post as Post));
    navigate(`/posts/${post._id}`);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    setShowFilters(false);
  };

  // Featured pet stats
  const featuredStats = [
    { label: 'Pet Owners', value: '8,500+', icon: '👤', color: 'bg-blue-100 text-blue-800' },
    { label: 'Pets', value: '12,000+', icon: '🐾', color: 'bg-purple-100 text-purple-800' },
    { label: 'Posts', value: '35,000+', icon: '📸', color: 'bg-pink-100 text-pink-800' },
    { label: 'Communities', value: '150+', icon: '🏠', color: 'bg-green-100 text-green-800' },
  ];

  // Quick nav items
  const quickNavItems = [
    { label: 'Find Pet Care', icon: '🏥', color: 'from-blue-500 to-blue-700', onClick: () => navigate('/services') },
    { label: 'Pet Adoption', icon: '🏠', color: 'from-orange-500 to-orange-700', onClick: () => navigate('/adoption') },
    { label: 'Training', icon: '🦮', color: 'from-green-500 to-green-700', onClick: () => navigate('/training') },
    { label: 'Pet Supplies', icon: '🛒', color: 'from-purple-500 to-purple-700', onClick: () => navigate('/supplies') },
  ];
  
  return (
    <Layout>
      {/* Hero Section */}
      {!currentUser && (
        <div className="relative -mt-8 mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-90"></div>
          <div className="container-custom relative z-10 py-16 md:py-24 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-white mb-8 md:mb-0 animate-fadeIn">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Connect with Pet Lovers Everywhere</h1>
              <p className="text-lg mb-8 opacity-90">Share moments, find advice, and join the world's most pawsome pet community.</p>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 bg-white text-primary font-semibold rounded-full hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Join Now
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className="px-6 py-3 bg-transparent text-white font-semibold rounded-full border-2 border-white hover:bg-white hover:text-primary transition-all duration-300"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 bg-white rounded-full overflow-hidden shadow-2xl border-4 border-white animate-pulse">
                  <img 
                    src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1769&q=80" 
                    alt="Cute dog" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white rounded-full overflow-hidden shadow-xl border-4 border-white animate-bounce">
                  <img 
                    src="https://images.unsplash.com/photo-1533738363-b7f9aef128ce?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
                    alt="Cute cat" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-white rounded-full overflow-hidden shadow-xl border-4 border-white animate-pulse">
                  <img 
                    src="https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1776&q=80" 
                    alt="Cute bunny" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="container-custom relative z-10 pb-6">
            <div className="bg-white rounded-xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 transform translate-y-6">
              {featuredStats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-lg transform transition-all duration-300 hover:scale-105">
                  <div className={`inline-flex items-center justify-center w-12 h-12 ${stat.color} rounded-full mb-3 text-xl`}>
                    {stat.icon}
                  </div>
                  <div className="font-bold text-2xl mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Search and Filters */}
      <div className={`mb-8 ${currentUser ? '' : 'mt-12'}`}>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:flex-grow">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search posts, pets, or users..."
              recentSearches={["Golden Retrievers", "Cat care tips", "Pet grooming"]}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto whitespace-nowrap px-4 py-2 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-all duration-200 hover:shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {Object.values(activeFilters).some(val => val !== '') && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-xs rounded-full animate-pulse">
                ✓
              </span>
            )}
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 animate-fadeIn">
            <FilterPanel onApplyFilters={handleApplyFilters} initialFilters={activeFilters} />
          </div>
        )}
      </div>
      
      {/* Quick Navigation Cards (visible to all users) */}
      {!searchQuery && !Object.values(activeFilters).some(val => val !== '') && (
        <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickNavItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`bg-gradient-to-br ${item.color} text-white rounded-xl p-6 text-center shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fadeIn`}
              style={{animationDelay: `${index * 100}ms`}}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-semibold">{item.label}</div>
            </button>
          ))}
        </div>
      )}
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Create Post */}
          {currentUser && (
            <div className="mb-6">
              {!showCreatePost ? (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full bg-white rounded-lg shadow-md p-4 text-left flex items-center text-gray-600 hover:bg-gray-50 transition-all duration-200 hover:shadow-lg"
                >
                  <img
                    src={currentUser.profilePic}
                    alt={currentUser.username}
                    className="h-10 w-10 rounded-full object-cover mr-3 border-2 border-primary"
                  />
                  <span className="text-gray-500">Share a moment with your pet...</span>
                  <div className="ml-auto flex space-x-2">
                    <span className="hidden md:inline-flex items-center text-xs text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Photo
                    </span>
                    <span className="hidden md:inline-flex items-center text-xs text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Video
                    </span>
                  </div>
                </button>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-4 mb-6 animate-fadeIn">
                <PostForm
                  onSuccess={() => setShowCreatePost(false)}
                  onCancel={() => setShowCreatePost(false)}
                />
                </div>
              )}
            </div>
          )}
          
          {/* Feed Tabs */}
          <div className="mb-6 bg-white rounded-lg shadow-md p-1 flex">
            <button
              className={`flex-1 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === 'latest'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('latest')}
            >
              Latest
            </button>
            <button
              className={`flex-1 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === 'trending'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('trending')}
            >
              Trending
            </button>
            <button
              className={`flex-1 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                activeTab === 'following'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab('following')}
            >
              Following
            </button>
          </div>
          
          {/* Posts */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-gray-500">Loading amazing pet content...</div>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow border border-red-200 animate-pulse">
              <div className="font-semibold mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Something went wrong
              </div>
              <p>{error}</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || Object.values(activeFilters).some(val => val !== '')
                  ? "No posts match your search criteria. Try adjusting your filters or search query."
                  : "Be the first to share a moment with your pet or follow other pet owners to see their posts."}
              </p>
              {currentUser && !searchQuery && !Object.values(activeFilters).some(val => val !== '') && (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  Create Your First Post
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post, index) => (
                <div key={post._id} className="animate-fadeIn" style={{animationDelay: `${index * 150}ms`}}>
                  <PostCard post={post} onView={handleViewPost} />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Discover Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-purple-600 p-4 text-white">
              <h3 className="text-lg font-semibold">Discover Pets</h3>
            </div>
            <div className="p-4">
            <div className="space-y-2">
                <button 
                  className="w-full py-2 px-4 rounded-md text-left hover:bg-gray-50 transition-all duration-200 flex items-center"
                  onClick={() => handleApplyFilters({...activeFilters, animalType: 'Dog', breed: ''})}
                >
                  <span className="text-2xl mr-3">🐶</span>
                  <span className="font-medium">Dogs</span>
                  <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">2.5K+</span>
              </button>
                <button 
                  className="w-full py-2 px-4 rounded-md text-left hover:bg-gray-50 transition-all duration-200 flex items-center"
                  onClick={() => handleApplyFilters({...activeFilters, animalType: 'Cat', breed: ''})}
                >
                  <span className="text-2xl mr-3">🐱</span>
                  <span className="font-medium">Cats</span>
                  <span className="ml-auto text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">1.8K+</span>
              </button>
                <button 
                  className="w-full py-2 px-4 rounded-md text-left hover:bg-gray-50 transition-all duration-200 flex items-center"
                  onClick={() => handleApplyFilters({...activeFilters, animalType: 'Rabbit', breed: ''})}
                >
                  <span className="text-2xl mr-3">🐰</span>
                  <span className="font-medium">Rabbits</span>
                  <span className="ml-auto text-xs bg-pink-100 text-pink-800 px-2 py-1 rounded-full">580+</span>
              </button>
                <button 
                  className="w-full py-2 px-4 rounded-md text-left hover:bg-gray-50 transition-all duration-200 flex items-center"
                  onClick={() => handleApplyFilters({...activeFilters, animalType: 'Bird', breed: ''})}
                >
                  <span className="text-2xl mr-3">🐦</span>
                  <span className="font-medium">Birds</span>
                  <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">750+</span>
                </button>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => navigate('/explore')}
                  className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                  <span>Explore More</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
              </button>
              </div>
            </div>
          </div>
          
          {/* Your Pets Section */}
          {currentUser && pets.length > 0 && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-secondary to-orange-500 p-4 text-white">
                <h3 className="text-lg font-semibold">Your Pets</h3>
              </div>
              <div className="p-4">
              <div className="space-y-4">
                {pets.slice(0, 3).map((pet) => (
                    <div key={pet._id} className="flex items-center p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer" onClick={() => navigate(`/pets/${pet._id}`)}>
                      <div className="relative">
                    <img
                      src={pet.image}
                      alt={pet.name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-secondary"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          {pet.animal === 'Dog' && <span>🐶</span>}
                          {pet.animal === 'Cat' && <span>🐱</span>}
                          {pet.animal === 'Rabbit' && <span>🐰</span>}
                          {pet.animal === 'Bird' && <span>🐦</span>}
                          {!['Dog', 'Cat', 'Rabbit', 'Bird'].includes(pet.animal) && <span>🐾</span>}
                        </div>
                      </div>
                      <div className="ml-3">
                      <h4 className="font-medium text-gray-800">{pet.name}</h4>
                      <p className="text-sm text-gray-600">
                          {pet.breed || pet.animal}
                      </p>
                    </div>
                  </div>
                ))}
                </div>
                <div className="mt-4">
                <button
                  onClick={() => navigate('/pets')}
                    className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors duration-200 flex items-center justify-center"
                >
                    <span>Manage Your Pets</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Trending Topics Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-accent to-green-500 p-4 text-white">
              <h3 className="text-lg font-semibold">Trending Topics</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 cursor-pointer transition-colors duration-200">#DogTraining</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 cursor-pointer transition-colors duration-200">#CatCare</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 cursor-pointer transition-colors duration-200">#RescuePets</span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 cursor-pointer transition-colors duration-200">#PetNutrition</span>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 cursor-pointer transition-colors duration-200">#AdoptDontShop</span>
                <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm hover:bg-pink-200 cursor-pointer transition-colors duration-200">#CuteKittens</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home; 