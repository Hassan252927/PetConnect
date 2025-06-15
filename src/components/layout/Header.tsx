import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { logout } from '../../store/userSlice';
import { fetchNotifications, fetchUnreadCount } from '../../store/notificationSlice';
import NotificationDropdown from '../notifications/NotificationDropdown';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { currentUser } = useAppSelector((state) => state.user);
  const { chats } = useAppSelector((state) => state.chat);
  const { feedPosts } = useAppSelector((state) => state.post);
  const { unreadCount: notificationCount } = useAppSelector((state) => state.notification);
  const { darkMode } = useAppSelector((state) => state.settings);

  // Navbar links
  const navLinks = [
    { 
      name: 'Home', 
      path: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Explore', 
      path: '/explore',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    { 
      name: 'My Pets', 
      path: '/pets',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  const handleScroll = () => {
    if (window.scrollY > 10) {
      setIsScrolled(true);
    } else {
      setIsScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchNotifications(currentUser._id));
      dispatch(fetchUnreadCount(currentUser._id));
    }
  }, [currentUser, dispatch]);

  // Periodically refresh unread count
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      dispatch(fetchUnreadCount(currentUser._id));
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const toggleNotifications = () => {
    // Close other dropdowns
    setIsMenuOpen(false);
    // Toggle notifications
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? `${darkMode ? 'bg-gray-900/95' : 'bg-white/95'} shadow-md backdrop-blur-md py-2` 
          : `${darkMode ? 'bg-gray-900' : 'bg-white'} py-4`
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-10">
            <Link to="/" className="text-2xl font-bold flex items-center group">
              <div className="relative">
                <span className="text-3xl transition-transform duration-300 group-hover:scale-110 inline-block">🐾</span>
                <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
              </div>
              <span className="ml-2 bg-gradient-to-r from-primary to-primary-700 bg-clip-text text-transparent font-display">
                PetConnect
              </span>
            </Link>

            {currentUser && (
              <div className="hidden md:flex space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      location.pathname === link.path 
                        ? 'text-primary bg-primary-50 dark:bg-primary-900/20 font-medium shadow-sm' 
                        : 'text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <span className={location.pathname === link.path ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}>
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {currentUser ? (
            <>
              <div className="hidden md:flex items-center space-x-4">
                <div className="relative">
                  <button
                    onClick={toggleNotifications}
                    className={`relative p-2 rounded-full transition-all duration-200 ${
                      isNotificationsOpen 
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    title="Notifications"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {notificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse">
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </span>
                    )}
                  </button>
                  
                  {/* Notification Dropdown */}
                  <NotificationDropdown 
                    isOpen={isNotificationsOpen} 
                    onClose={() => setIsNotificationsOpen(false)} 
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotificationsOpen(false);
                      setIsMenuOpen(!isMenuOpen);
                    }}
                    className={`flex items-center focus:outline-none group px-3 py-2 rounded-full ${
                      isMenuOpen 
                        ? 'bg-gray-100 dark:bg-gray-800' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={currentUser.profilePic || 'https://via.placeholder.com/40'}
                        alt={currentUser.username}
                        className="h-9 w-9 rounded-full object-cover border-2 border-transparent group-hover:border-primary transition-all duration-200 shadow-sm"
                      />
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    </div>
                    <span className="ml-2 text-gray-700 dark:text-gray-200 group-hover:text-primary transition-colors duration-200">
                      {currentUser.username}
                    </span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`ml-1 h-5 w-5 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-2 z-10 border border-gray-100 dark:border-gray-700 animate-fadeIn">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{currentUser.email}</p>
                      </div>
                      
                      <Link
                        to={currentUser ? `/profile/${currentUser._id}` : '/login'}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                      
                      <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                      
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-gray-700 dark:text-gray-200 hover:text-primary p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
                  {isMobileMenuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-primary to-primary-600 text-white px-5 py-2 rounded-full hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1 font-medium"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && currentUser && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-100 dark:border-gray-800 animate-slideDown">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    location.pathname === link.path 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary font-medium' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={location.pathname === link.path ? 'text-primary' : 'text-gray-500 dark:text-gray-400'}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </Link>
              ))}
              
              <div className="border-t border-gray-100 dark:border-gray-800 my-2 pt-2">
                <Link
                  to={`/profile/${currentUser._id}`}
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative mr-3">
                    <img
                      src={currentUser.profilePic || 'https://via.placeholder.com/40'}
                      alt={currentUser.username}
                      className="h-8 w-8 rounded-full object-cover border-2 border-transparent"
                    />
                    <div className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                  </div>
                  <span>Profile</span>
                </Link>
                
                <Link
                  to="/settings"
                  className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full text-left px-4 py-3 text-gray-700 dark:text-gray-200 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 