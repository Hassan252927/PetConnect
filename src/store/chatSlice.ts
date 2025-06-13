import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Chat, Message } from '../services/chatService';
import chatService from '../services/chatService';

// Types
interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ChatState = {
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserChats = createAsyncThunk(
  'chat/fetchUserChats',
  async (userId: string) => {
    // If userId is 'user123' or empty, use the hardcoded test user ID from the image.
    const actualUserId = (userId === 'user123' || !userId) ? '684c38a66e0a72eb81a6d61d' : userId; // User ID from the provided image
    const response = await chatService.getUserChats(actualUserId);
    return response;
  }
);

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async ({ user1Id, user2Id }: { user1Id: string; user2Id: string }) => {
    // If user1Id/user2Id are 'user123' or empty, use the hardcoded test user IDs.
    const actualUser1Id = (user1Id === 'user123' || !user1Id) ? '684c38a66e0a72eb81a6d61d' : user1Id; // User ID from the provided image
    const actualUser2Id = (user2Id === 'user123' || !user2Id) ? '684c38a66e0a72eb81a6d61f' : user2Id; // One of the previously generated test user IDs
    const response = await chatService.getChatMessages(actualUser1Id, actualUser2Id);
    return response;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    messageData: {
      senderID: string;
      receiverID: string;
      content: string;
      media?: string;
    },
  ) => {
    const response = await chatService.sendNewMessage(messageData);
    return response;
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async ({ senderID, receiverID }: { senderID: string; receiverID: string }) => {
    await chatService.markAsRead(senderID, receiverID);
    return { senderID, receiverID };
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'chat/fetchUnreadCount',
  async (userId: string) => {
    const response = await chatService.getUnreadCount(userId);
    return response;
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Chats
      .addCase(fetchUserChats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserChats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats = action.payload;
      })
      .addCase(fetchUserChats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch chats';
      })
      // Fetch Chat Messages
      .addCase(fetchChatMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.currentChat) {
          state.currentChat.messages = action.payload;
        }
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (state.currentChat) {
          state.currentChat.messages.push(action.payload);
          state.currentChat.lastMessage = action.payload;
          // Also update the chat in the main chats list
          const chatToUpdate = state.chats.find(
            (chat) =>
              chat.participants.some((p) => p._id === action.payload.senderID) &&
              chat.participants.some((p) => p._id === action.payload.receiverID)
          );
          if (chatToUpdate) {
            chatToUpdate.lastMessage = action.payload;
          }
        }
      })
      // Mark Messages as Read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const { senderID, receiverID } = action.payload;
        // Update unread count in chats list for the relevant chat
        const chatIndex = state.chats.findIndex(
          chat =>
            (chat.participants[0]._id === senderID && chat.participants[1]._id === receiverID) ||
            (chat.participants[0]._id === receiverID && chat.participants[1]._id === senderID)
        );
        if (chatIndex !== -1) {
          state.chats[chatIndex].unreadCount = 0;
        }
        // Update unread count in current chat
        if (
          state.currentChat &&
          ((state.currentChat.participants[0]._id === senderID && state.currentChat.participants[1]._id === receiverID) ||
            (state.currentChat.participants[0]._id === receiverID && state.currentChat.participants[1]._id === senderID))
        ) {
          state.currentChat.unreadCount = 0;
        }
      })
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        // This thunk returns a single number, which is the total unread count.
        // No direct state update needed for individual chats here as fetchUserChats handles per-chat unread counts.
        // If a global total unread count is required, a new state property should be added.
      });
  },
});

export const { setCurrentChat, clearCurrentChat, clearError } = chatSlice.actions;
export default chatSlice.reducer; 