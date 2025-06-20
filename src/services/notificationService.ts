import apiClient from './apiClient';

export interface Notification {
  _id: string;
  userID: string;
  type: 'like' | 'comment';
  senderID: string;
  senderUsername: string;
  senderProfilePic: string;
  postID: string;
  postImage?: string;
  content?: string;
  read: boolean;
  createdAt: string;
}

// Get notifications for a user
export const getNotifications = async (userID: string, page = 1, limit = 20): Promise<Notification[]> => {
  try {
    console.log('Fetching notifications for user:', userID);
    const data = await apiClient.get(`/notifications/${userID}?page=${page}&limit=${limit}`);
    console.log('Notifications response:', data);
    
    // Handle case where data is undefined
    if (!data) {
      console.log('No notifications data received, returning empty array');
      return [];
    }
    
    // Ensure data is an array
    const notifications = Array.isArray(data) ? data : [];
    return notifications;
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    console.error('Error details:', error.response?.data);
    if (error.response?.status === 404) {
      return []; // Return empty array if no notifications found
    }
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
};

// Get unread notification count
export const getUnreadCount = async (userID: string): Promise<number> => {
  try {
    console.log('Fetching unread count for user:', userID);
    const data = await apiClient.get(`/notifications/${userID}/unread-count`);
    console.log('Unread count response:', data);
    
    // Handle case where data is undefined
    if (!data) {
      console.log('No unread count data received, returning 0');
      return 0;
    }
    
    return data?.unreadCount || 0;
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    console.error('Error details:', error.response?.data);
    if (error.response?.status === 404) {
      return 0; // Return 0 if no notifications found
    }
    // Return 0 instead of throwing to prevent app crashes
    return 0;
  }
};

// Mark notification as read
export const markAsRead = async (notificationID: string): Promise<void> => {
  try {
    await apiClient.put(`/notifications/${notificationID}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async (userID: string): Promise<void> => {
  try {
    await apiClient.put(`/notifications/${userID}/read-all`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Create notification (used internally by like/comment actions)
export const createNotification = async (notificationData: {
  userID: string;
  type: 'like' | 'comment';
  senderID: string;
  postID: string;
  commentID?: string;
  content?: string;
}): Promise<Notification> => {
  try {
    const data = await apiClient.post('/notifications', notificationData);
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Delete notification (for unlike actions)
export const deleteNotification = async (notificationData: {
  userID: string;
  type: 'like' | 'comment';
  senderID: string;
  postID: string;
}): Promise<void> => {
  try {
    await apiClient.delete('/notifications', { data: notificationData });
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}; 