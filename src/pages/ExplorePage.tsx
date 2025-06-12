import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchFeedPosts } from '../store/postSlice';
import Layout from '../components/layout/Layout';
import PostCard from '../components/post/PostCard';
import SearchBar from '../components/search/SearchBar';
import FilterPanel, { FilterOptions } from '../components/search/FilterPanel';
import { ExtendedPost } from '../types/post';

const ExplorePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.user);
  const { feedPosts, isLoading, error } = useAppSelector((state) => state.post);
  const { pets } = useAppSelector((state) => state.pet);
  
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
  const [filteredPosts, setFilteredPosts] = useState<typeof feedPosts>([]);
  const [activeTab, setActiveTab] = useState('latest');
  
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchFeedPosts({ userID: currentUser._id, pets }));
    }
  }, [dispatch, currentUser, pets.length]);
  
  // Apply filters and search to posts
  useEffect(() => {
    let filtered = [...feedPosts];
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.petName && post.petName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply animal type filter if using tags
    if (activeFilters.animalType) {
      filtered = filtered.filter(post => 
        post.tags.includes(activeFilters.animalType.toLowerCase())
      );
    }
    
    // Sort based on active tab
    if (activeTab === 'trending') {
      filtered.sort((a, b) => b.likes.length - a.likes.length);
    } else if (activeTab === 'latest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    setFilteredPosts(filtered);
  }, [feedPosts, searchQuery, activeFilters, activeTab]);
  
  const handleViewPost = (post: typeof feedPosts[0]) => {
    navigate(`/posts/${post._id}`);
  };
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    setShowFilters(false);
  };

  // Popular pet categories
  const popularCategories = [
    { name: 'Dogs', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1548&q=80', count: '4.2k posts' },
    { name: 'Cats', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1743&q=80', count: '3.8k posts' },
    { name: 'Birds', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1550&q=80', count: '1.5k posts' },
    { name: 'Rabbits', image: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1548&q=80', count: '980 posts' },
    { name: 'Fish', image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1550&q=80', count: '870 posts' },
    { name: 'Reptiles', image: 'https://images.unsplash.com/photo-1504450874802-0ba2bcd9b5ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1548&q=80', count: '620 posts' },
  ];
  
  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Explore PetConnect</h1>
        <p className="text-gray-600 dark:text-gray-300">Discover amazing pet moments and connect with pet owners around the world</p>
      </div>

      {/* Popular Categories */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Popular Categories</h2>
          <button 
            className="text-primary hover:text-primary-dark dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
            onClick={() => setShowFilters(true)}
          >
            View All Categories
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularCategories.map((category, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              onClick={() => {
                setActiveFilters({...activeFilters, animalType: category.name});
                window.scrollTo({ top: document.getElementById('explore-feed')?.offsetTop || 0 - 100, behavior: 'smooth' });
              }}
            >
              <div className="h-32 overflow-hidden">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="font-semibold text-gray-800 dark:text-white">{category.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{category.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="mb-8" id="explore-feed">
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
            className="w-full md:w-auto whitespace-nowrap px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow dark:text-white"
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
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-xs rounded-full">
                ✓
              </span>
            )}
          </button>
        </div>
        {showFilters && (
          <div className="mt-4">
            <FilterPanel onApplyFilters={handleApplyFilters} initialFilters={activeFilters} />
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <div className="mb-6 flex border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'latest'
              ? 'text-primary border-b-2 border-primary dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('latest')}
        >
          Latest
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'trending'
              ? 'text-primary border-b-2 border-primary dark:text-blue-400 dark:border-blue-400'
              : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white'
          }`}
          onClick={() => setActiveTab('trending')}
        >
          Trending
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'following'
              ? 'text-primary border-b-2 border-primary'
              : 'text-gray-500 hover:text-gray-800'
          }`}
          onClick={() => setActiveTab('following')}
        >
          Following
        </button>
      </div>
      
      {/* Posts Display */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchQuery || Object.values(activeFilters).some(val => val !== '')
              ? "No posts match your search criteria"
              : "No posts available"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || Object.values(activeFilters).some(val => val !== '')
              ? "Try adjusting your filters or search query"
              : "Be the first to share your pet's moments with the community!"}
          </p>
          {currentUser && !searchQuery && !Object.values(activeFilters).some(val => val !== '') && (
            <button
              onClick={() => navigate('/posts/create')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Create Your First Post
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onView={handleViewPost}
            />
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {filteredPosts.length > 0 && (
        <div className="mt-8 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              1
            </button>
            <button
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-primary text-sm font-medium text-white"
              aria-current="page"
            >
              2
            </button>
            <button
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              3
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              ...
            </span>
            <button
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              8
            </button>
            <button
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              9
            </button>
            <button
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </Layout>
  );
};

export default ExplorePage; 