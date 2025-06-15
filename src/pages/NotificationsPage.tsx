import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { 
  Notification, 
  markAsRead, 
  markAllAsRead, 
  fetchNotifications,
  fetchUnreadCount 
} from '../store/notificationSlice';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { notifications, isLoading, unreadCount } = useAppSelector((state) => state.notification);
  const { currentUser } = useAppSelector((state) => state.user);
  
  const [filter, setFilter] = useState<'all' | 'unread' | 'likes' | 'comments'>('all');

  // Fetch notifications on component mount
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchNotifications(currentUser._id));
      dispatch(fetchUnreadCount(currentUser._id));
    }
  }, [currentUser, dispatch]);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'likes':
        return notification.type === 'like';
      case 'comments':
        return notification.type === 'comment';
      default:
        return true;
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification._id));
    }
    navigate(`/posts/${notification.postID}`);
  };

  const handleMarkAllAsRead = () => {
    if (currentUser && unreadCount > 0) {
      dispatch(markAllAsRead(currentUser._id));
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: 'like' | 'comment') => {
    if (type === 'like') {
      return (
        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Notifications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Stay updated with your pet community activities
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="mt-4 sm:mt-0 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-200 font-medium"
            >
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'likes', label: 'Likes', count: notifications.filter(n => n.type === 'like').length },
            { key: 'comments', label: 'Comments', count: notifications.filter(n => n.type === 'comment').length }
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-200 ${
                filter === key
                  ? 'text-primary border-b-2 border-primary bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {label} {count > 0 && (
                <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                  filter === key 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {filter === 'all' ? 'No notifications yet' : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filter === 'all' 
                  ? "When people interact with your posts, you'll see notifications here."
                  : `You don't have any ${filter} notifications at the moment.`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Profile Picture */}
                    <div className="flex-shrink-0">
                      <img
                        src={notification.senderProfilePic || '/default-profile.png'}
                        alt={notification.senderUsername}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      />
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-semibold">{notification.senderUsername}</span>
                            {' '}
                            {notification.type === 'like' ? 'liked your post' : 'commented on your post'}
                          </p>
                          
                          {notification.type === 'comment' && notification.content && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                              "{notification.content}"
                            </p>
                          )}
                          
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </p>
                        </div>

                        {/* Notification Icon */}
                        <div className="flex items-center space-x-2 ml-4">
                          {getNotificationIcon(notification.type)}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Post Thumbnail */}
                    {notification.postImage && (
                      <div className="flex-shrink-0">
                        <img
                          src={notification.postImage}
                          alt="Post"
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More Button (for future pagination) */}
        {filteredNotifications.length > 0 && filteredNotifications.length >= 20 && (
          <div className="text-center mt-6">
            <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 font-medium">
              Load More Notifications
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage; 