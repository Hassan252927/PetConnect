import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as notificationService from '../services/notificationService';

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
  async (userID: string, { rejectWithValue }) => {
    try {
      const notifications = await notificationService.getNotifications(userID);
      return notifications;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (userID: string, { rejectWithValue }) => {
    try {
      const unreadCount = await notificationService.getUnreadCount(userID);
      return unreadCount;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch unread count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationID: string, { rejectWithValue }) => {
    try {
      await notificationService.markAsRead(notificationID);
      return notificationID;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notification/markAllAsRead',
  async (userID: string, { rejectWithValue }) => {
    try {
      await notificationService.markAllAsRead(userID);
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
  reducers: {
    // Add a new notification (for real-time updates)
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    // Remove a notification (for unlike actions)
    removeNotification: (state, action: PayloadAction<{ postID: string; senderID: string; type: 'like' | 'comment' }>) => {
      const { postID, senderID, type } = action.payload;
      const index = state.notifications.findIndex(
        n => n.postID === postID && n.senderID === senderID && n.type === type
      );
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount -= 1;
        }
        state.notifications.splice(index, 1);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload || [];
        state.unreadCount = (action.payload || []).filter((n: Notification) => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.notifications = [];
        state.unreadCount = 0;
      })
      
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload || 0;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.error = action.payload as string;
        state.unreadCount = 0;
      })
      
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notificationIndex = state.notifications.findIndex(n => n._id === action.payload);
        if (notificationIndex !== -1) {
          state.notifications[notificationIndex].read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
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

export const { addNotification, removeNotification } = notificationSlice.actions;
export default notificationSlice.reducer; 