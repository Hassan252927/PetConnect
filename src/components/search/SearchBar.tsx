import React, { useState, useRef, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  recentSearches?: string[];
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = 'Search...', 
  recentSearches = []
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowRecentSearches(false);
    }
  };

  const handleSearchItemClick = (searchTerm: string) => {
    setQuery(searchTerm);
    onSearch(searchTerm);
    setShowRecentSearches(false);
  };

  // Close recent searches dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowRecentSearches(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sample suggested searches for demo purposes
  const suggestedSearches = [
    "Golden Retrievers",
    "Cat toys",
    "Puppy training",
    "Bird feeders"
  ];

  return (
    <div ref={searchContainerRef} className="w-full relative">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <div 
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isFocused ? 'animate-wiggle' : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          <input
            ref={searchInputRef}
            type="text"
            className={`w-full pl-10 pr-14 py-3 rounded-full border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm transition-all duration-200 dark:bg-gray-700 dark:text-white ${isFocused ? 'scale-102' : ''}`}
            placeholder={placeholder}
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowRecentSearches(true);
            }}
            onBlur={() => {
              setIsFocused(false);
              // Don't hide suggestions immediately to allow clicking on them
              setTimeout(() => {
                if (document.activeElement !== searchInputRef.current) {
                  setShowRecentSearches(false);
                }
              }, 200);
            }}
          />
          
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!query.trim()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
          
          {query && (
            <button
              type="button"
              className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-transform duration-200 hover:scale-110 active:scale-95"
              onClick={() => setQuery('')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </form>
      
      {showRecentSearches && (
        <div 
          className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-fadeIn"
        >
          {recentSearches && recentSearches.length > 0 && (
            <div className="mb-2">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 mb-1">Recent Searches</h3>
              <ul>
                {recentSearches.map((search, index) => (
                  <li key={`recent-${index}`}>
                    <div
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-transform duration-200 hover:translate-x-1"
                      onClick={() => handleSearchItemClick(search)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">{search}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div>
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-4 mb-1">Suggested Searches</h3>
            <ul>
              {suggestedSearches.map((search, index) => (
                <li key={`suggested-${index}`}>
                  <div
                    className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-transform duration-200 hover:translate-x-1"
                    onClick={() => handleSearchItemClick(search)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-400 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{search}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 