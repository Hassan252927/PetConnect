import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchFeedPosts } from '../store/postSlice';
import { fetchUserPets } from '../store/petSlice';
import Layout from '../components/layout/Layout';
import PostCard from '../components/post/PostCard';
import PostForm from '../components/post/PostForm';
import SearchBar from '../components/search/SearchBar';
import FilterPanel, { FilterOptions } from '../components/search/FilterPanel';

import { TestimonialsSection, HowItWorksSection } from '../components/landing';

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
  const [activeTab, setActiveTab] = useState<'latest' | 'trending'>('latest');
  
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchUserPets(currentUser._id));
    }
  }, [dispatch, currentUser]);

  // Separate effect to fetch posts when pets are loaded
  useEffect(() => {
    if (currentUser && pets.length > 0) {
      dispatch(fetchFeedPosts({ pets }));
    }
  }, [dispatch, currentUser, pets]);
  
  // Apply filters and search to posts using useMemo to prevent unnecessary recalculations
  const filteredPosts = useMemo(() => {
    let filtered = [...feedPosts];
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.petName && post.petName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply animal type filter by checking the pet's animal type
    if (activeFilters.animalType) {
      filtered = filtered.filter(post => {
        // Check if the post has a populated petID with animal type
        if (post.petID && typeof post.petID === 'object' && 'animal' in post.petID) {
          return post.petID.animal.toLowerCase() === activeFilters.animalType.toLowerCase();
        }
        
        // Fallback: check tags if pet data is not populated
        if (post.tags && post.tags.length > 0) {
          return post.tags.some(tag => 
            tag.toLowerCase() === activeFilters.animalType.toLowerCase()
          );
        }
        
        return false;
      });
    }
    
    // Apply breed filter by checking the pet's breed
    if (activeFilters.breed) {
      filtered = filtered.filter(post => {
        // Check if the post has a populated petID with breed
        if (post.petID && typeof post.petID === 'object' && 'breed' in post.petID) {
          return post.petID.breed.toLowerCase() === activeFilters.breed.toLowerCase();
        }
        
        // Fallback: check tags if pet data is not populated
        if (post.tags && post.tags.length > 1) {
          return post.tags.some(tag => 
            tag.toLowerCase() === activeFilters.breed.toLowerCase()
          );
        }
        
        return false;
      });
    }
    
    // Sort based on active tab
    if (activeTab === 'trending') {
      // Sort by engagement score (likes + comments)
      filtered.sort((a, b) => {
        const aEngagement = (a.likes?.length || 0) + (a.commentsCount || 0);
        const bEngagement = (b.likes?.length || 0) + (b.commentsCount || 0);
        return bEngagement - aEngagement;
      });
    } else if (activeTab === 'latest') {
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    
    return filtered;
  }, [feedPosts, searchQuery, activeFilters, activeTab]);
  
  const handleViewPost = useCallback((post: typeof feedPosts[0]) => {
    navigate(`/posts/${post._id}`);
  }, [navigate]);
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);
  
  const handleApplyFilters = useCallback((filters: FilterOptions) => {
    setActiveFilters(filters);
    setShowFilters(false);
  }, []);

  // Featured pet stats
  const featuredStats = useMemo(() => [
    { label: 'Pet Owners', value: '8,500+', icon: '👤', color: 'bg-blue-100 text-blue-800' },
    { label: 'Pets', value: '12,000+', icon: '🐾', color: 'bg-purple-100 text-purple-800' },
    { label: 'Posts', value: '35,000+', icon: '📸', color: 'bg-pink-100 text-pink-800' },
    { label: 'Communities', value: '150+', icon: '🏠', color: 'bg-green-100 text-green-800' },
  ], []);
  
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
      
      {/* Add new landing page components when user is not logged in */}
      {!currentUser && (
        <>
          <HowItWorksSection />
          <TestimonialsSection />
        </>
      )}
      
      {/* Search and Filters */}
      {currentUser && (
        <div className="mb-8">
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
              className="w-full md:w-auto whitespace-nowrap px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-all duration-200 hover:shadow"
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
            
            <button
              onClick={() => setShowCreatePost(true)}
              className="w-full md:w-auto whitespace-nowrap px-4 py-2 bg-primary text-white rounded-lg flex items-center justify-center hover:bg-opacity-90 transition-all duration-200 hover:shadow"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Post
            </button>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 animate-slideDown">
              <FilterPanel 
                onApplyFilters={handleApplyFilters} 
                initialFilters={activeFilters}
              />
            </div>
          )}
          
          {/* Create Post Modal */}
          {showCreatePost && (
            <PostForm 
              onSuccess={() => setShowCreatePost(false)} 
              onCancel={() => setShowCreatePost(false)} 
            />
          )}
        </div>
      )}
      
      {/* Main Content */}
      {currentUser && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Feed */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md p-2 mb-6 flex">
              <button
                className={`flex-1 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === 'latest'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('latest')}
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Latest
                </div>
              </button>
              <button
                className={`flex-1 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                  activeTab === 'trending'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab('trending')}
              >
                <div className="flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Trending
                </div>
              </button>
            </div>
            
            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <p className="font-medium">Error loading posts</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => dispatch(fetchFeedPosts({ pets: pets.length > 0 ? pets : [] }))}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}
            
            {/* Posts List */}
            {!isLoading && !error && (
              <div className="space-y-6">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => (
                    <div key={post._id} className="relative">
                      {/* Trending Badge */}
                      {activeTab === 'trending' && index < 3 && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                            </svg>
                            #{index + 1}
                          </div>
                        </div>
                      )}
                      
                      {/* Engagement Score for Trending */}
                      {activeTab === 'trending' && (
                        <div className="absolute top-4 left-4 z-10">
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 shadow-sm">
                            <div className="flex items-center space-x-2 text-xs">
                              <div className="flex items-center text-red-500">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                </svg>
                                {post.likes?.length || 0}
                              </div>
                              <span className="text-gray-400">+</span>
                              <div className="flex items-center text-blue-500">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {post.commentsCount || 0}
                              </div>
                              <span className="text-gray-500 font-medium">
                                = {(post.likes?.length || 0) + (post.commentsCount || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <PostCard
                        post={post}
                        onViewPost={() => handleViewPost(post)}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">No posts found</p>
                    {searchQuery || Object.values(activeFilters).some(val => val !== '') ? (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setActiveFilters({
                            animalType: '',
                            breed: '',
                            age: '',
                            size: '',
                            gender: '',
                            location: ''
                          });
                        }}
                        className="mt-2 text-primary hover:text-primary-dark underline"
                      >
                        Clear filters
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowCreatePost(true)}
                        className="mt-2 text-primary hover:text-primary-dark underline"
                      >
                        Create your first post
                      </button>
                    )}
                  </div>
                )}
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
                    {pets.slice(0, 3).map((pet: any) => (
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
            
            {/* Trending Posts Info */}
            {activeTab === 'trending' && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-accent to-green-500 p-4 text-white">
                  <h3 className="text-lg font-semibold">🔥 Most Engaging Posts</h3>
                  <p className="text-sm opacity-90 mt-1">Sorted by likes + comments</p>
                </div>
                <div className="p-4">
                  <div className="text-sm text-gray-600">
                    <p className="mb-2">Posts are ranked by total engagement:</p>
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        Likes
                      </div>
                      <span>+</span>
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Comments
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Trending Topics Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
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
      )}
    </Layout>
  );
};

export default React.memo(Home); 