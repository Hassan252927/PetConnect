import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Post } from './postSlice';

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

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

// Generate mock notifications
const generateMockNotifications = (userID: string, posts: Post[]): Notification[] => {
  const mockNotifications: Notification[] = [];
  
  // Filter only user's posts
  const userPosts = posts.filter(post => post.userID === userID);
  
  // Generate like notifications
  userPosts.forEach(post => {
    // Generate a notification for each like on the post
    post.likes.forEach((likerID, index) => {
      // Skip if the liker is the post owner
      if (likerID === userID) return;
      
      // Use some mock data for the liker
      const mockLikers = [
        { username: 'pet_lover', profilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { username: 'animal_friend', profilePic: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
        { username: 'doggo_fan', profilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' },
      ];
      
      const likerInfo = mockLikers[index % mockLikers.length];
      
      mockNotifications.push({
        _id: `notification_like_${post._id}_${index}`,
        userID,
        type: 'like',
        senderID: likerID,
        senderUsername: likerInfo.username,
        senderProfilePic: likerInfo.profilePic,
        postID: post._id,
        postImage: post.media,
        read: Math.random() > 0.7, // 30% chance of being unread
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 5).toISOString(), // Within last 5 days
      });
    });
    
    // Generate comment notifications
    post.comments.forEach((comment, index) => {
      // Skip if the commenter is the post owner
      if (comment.userID === userID) return;
      
      mockNotifications.push({
        _id: `notification_comment_${comment._id}`,
        userID,
        type: 'comment',
        senderID: comment.userID,
        senderUsername: comment.username,
        senderProfilePic: comment.profilePic,
        postID: post._id,
        postImage: post.media,
        content: comment.content.length > 30 ? `${comment.content.substring(0, 30)}...` : comment.content,
        read: Math.random() > 0.7, // 30% chance of being unread
        createdAt: comment.createdAt,
      });
    });
  });
  
  // Sort by creation date (newest first)
  return mockNotifications.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchNotifications',
  async ({ userID, posts }: { userID: string; posts: Post[] }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await apiClient.get('/notifications');
      
      // For now, we'll use mock data
      return generateMockNotifications(userID, posts);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationID: string, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // await apiClient.put(`/notifications/${notificationID}/read`);
      
      // For now, we'll just return the ID
      return notificationID;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // await apiClient.put('/notifications/read-all');
      
      // For now, we'll just return true
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark all notifications as read');
    }
  }
);

// Create the notification slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n: Notification) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationIndex = state.notifications.findIndex(n => n._id === action.payload);
        if (notificationIndex !== -1) {
          state.notifications[notificationIndex].read = true;
          state.unreadCount = state.notifications.filter(n => !n.read).length;
        }
      })
      
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer; 