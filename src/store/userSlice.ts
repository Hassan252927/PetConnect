import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface User {
  _id: string;
  username: string;
  email: string;
  profilePic: string;
  savedPosts: string[];
  pets: string[];
}

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // For now, we'll simulate an API call
      // In a real app, this would call your backend API
      // const response = await axios.post('/api/auth/login', { email, password });
      
      // Simulating successful login
      return {
        _id: '1',
        username: 'testuser',
        email,
        profilePic: 'https://via.placeholder.com/150',
        savedPosts: [],
        pets: [],
      };
    } catch (error) {
      return rejectWithValue('Login failed. Please check your credentials.');
    }
  }
);

export const register = createAsyncThunk(
  'user/register',
  async (
    { username, email, password, hasPet }: 
    { username: string; email: string; password: string; hasPet: boolean },
    { rejectWithValue }
  ) => {
    try {
      // Simulate API call
      // const response = await axios.post('/api/auth/register', { username, email, password, hasPet });
      
      // Simulating successful registration
      return {
        _id: '1',
        username,
        email,
        profilePic: 'https://via.placeholder.com/150',
        savedPosts: [],
        pets: [],
      };
    } catch (error) {
      return rejectWithValue('Registration failed. Please try again.');
    }
  }
);

export const logout = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call to logout
      // await axios.post('/api/auth/logout');
      return null;
    } catch (error) {
      return rejectWithValue('Logout failed. Please try again.');
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    savePost: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.savedPosts.push(action.payload);
      }
    },
    unsavePost: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        state.currentUser.savedPosts = state.currentUser.savedPosts.filter(
          (postId) => postId !== action.payload
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
      });
  },
});

export const { savePost, unsavePost } = userSlice.actions;
export default userSlice.reducer; 