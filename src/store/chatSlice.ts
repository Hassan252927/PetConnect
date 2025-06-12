import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message, getUserChats, getChatMessages, sendNewMessage, markAsRead } from '../services/chatService';

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
  async (userId: string, { rejectWithValue }) => {
    try {
      return await getUserChats(userId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch chats. Please try again.');
    }
  }
);

export const fetchChatMessages = createAsyncThunk(
  'chat/fetchChatMessages',
  async (chatId: string, { rejectWithValue }) => {
    try {
      const messages = await getChatMessages(chatId);
      return { chatId, messages };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages. Please try again.');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    messageData: {
      chatID: string;
      sender: string;
      senderName: string;
      senderProfilePic: string;
      content: string;
    },
    { rejectWithValue }
  ) => {
    try {
      return await sendNewMessage(messageData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message. Please try again.');
    }
  }
);

export const createChat = createAsyncThunk(
  'chat/createChat',
  async (
    chatData: {
      currentUser: {
        userID: string;
        username: string;
        profilePic: string;
      };
      otherUser: {
        userID: string;
        username: string;
        profilePic: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      // Simulate API call
      // const response = await axios.post('/api/chats', {
      //   users: [chatData.currentUser, chatData.otherUser],
      // });
      
      // Simulated response
      return {
        _id: `chat${Date.now()}`,
        users: [chatData.currentUser, chatData.otherUser],
        lastMessage: null,
        messages: [],
        unreadCount: 0,
      };
    } catch (error) {
      return rejectWithValue('Failed to create chat. Please try again.');
    }
  }
);

export const markMessagesAsRead = createAsyncThunk(
  'chat/markMessagesAsRead',
  async ({ chatId, userId }: { chatId: string; userId: string }, { rejectWithValue }) => {
    try {
      await markAsRead(chatId, userId);
      return chatId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark messages as read. Please try again.');
    }
  }
);

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<Chat>) => {
      state.currentChat = action.payload;
    },
    clearCurrentChat: (state) => {
      state.currentChat = null;
    },
    addMessageToChat: (state, action: PayloadAction<Message>) => {
      const { chatID } = action.payload;
      const chat = state.chats.find((c) => c._id === chatID);
      
      if (chat) {
        chat.messages.push(action.payload);
        chat.lastMessage = action.payload;
        if (action.payload.sender !== 'user1') { // Assuming 'user1' is the current user
          chat.unreadCount += 1;
        }
      }
      
      if (state.currentChat && state.currentChat._id === chatID) {
        state.currentChat.messages.push(action.payload);
        state.currentChat.lastMessage = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user chats
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
        state.error = action.payload as string;
      })
      
      // Fetch chat messages
      .addCase(fetchChatMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { chatId, messages } = action.payload;
        
        const chat = state.chats.find((c) => c._id === chatId);
        if (chat) {
          chat.messages = messages;
        }
        
        if (state.currentChat && state.currentChat._id === chatId) {
          state.currentChat.messages = messages;
        }
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        const message = action.payload;
        const { chatID } = message;
        
        const chat = state.chats.find((c) => c._id === chatID);
        if (chat) {
          chat.messages.push(message);
          chat.lastMessage = message;
        }
        
        if (state.currentChat && state.currentChat._id === chatID) {
          state.currentChat.messages.push(message);
          state.currentChat.lastMessage = message;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create chat
      .addCase(createChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createChat.fulfilled, (state, action) => {
        state.isLoading = false;
        state.chats.push(action.payload);
        state.currentChat = action.payload;
      })
      .addCase(createChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Mark messages as read
      .addCase(markMessagesAsRead.fulfilled, (state, action) => {
        const chatId = action.payload;
        
        const chat = state.chats.find((c) => c._id === chatId);
        if (chat) {
          chat.unreadCount = 0;
          chat.messages.forEach((message) => {
            message.isRead = true;
          });
        }
        
        if (state.currentChat && state.currentChat._id === chatId) {
          state.currentChat.unreadCount = 0;
          state.currentChat.messages.forEach((message) => {
            message.isRead = true;
          });
        }
      });
  },
});

export const { setCurrentChat, clearCurrentChat, addMessageToChat } = chatSlice.actions;
export default chatSlice.reducer; 