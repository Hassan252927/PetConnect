import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/useRedux';
import { Notification, markAsRead, markAllAsRead } from '../../store/notificationSlice';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

// Format time ago without date-fns
const formatTimeAgo = (date: string) => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
};

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { notifications, isLoading } = useAppSelector((state) => state.notification);
  
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  // Handle clicking outside the dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && !target.closest('#notification-dropdown')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);
  
  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    dispatch(markAsRead(notification._id));
    navigate(`/posts/${notification.postID}`);
    onClose();
  };
  
  // Mark all as read
  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      id="notification-dropdown"
      className="absolute right-0 mt-2 w-80 max-h-[500px] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-10 border border-gray-100 dark:border-gray-700 animate-fadeIn"
    >
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="text-xs text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors"
        >
          Mark all as read
        </button>
      </div>
      
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center">
            <div className="text-3xl mb-2">🔔</div>
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <div className="flex items-start">
                <img
                  src={notification.senderProfilePic}
                  alt={notification.senderUsername}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 dark:text-white">
                    <span className="font-medium">{notification.senderUsername}</span>{' '}
                    {notification.type === 'like' ? 'liked your post' : 'commented on your post'}
                    {notification.type === 'comment' && notification.content && (
                      <span className="block text-gray-500 dark:text-gray-400 mt-1">
                        "{notification.content}"
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
                {notification.postImage && (
                  <div className="ml-2 flex-shrink-0">
                    <img
                      src={notification.postImage}
                      alt="Post"
                      className="w-12 h-12 object-cover rounded"
                    />
                  </div>
                )}
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full ml-2 mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={() => navigate('/profile/me/notifications')}
          className="text-xs text-center w-full text-primary hover:text-primary-dark dark:hover:text-primary-light transition-colors"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown; 