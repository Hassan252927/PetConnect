import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login as loginService, register as registerService, User as UserModel } from '../services/userService';
import { 
  setAuthToken, 
  removeAuthToken,
  setStoredUser,
  getStoredUser
} from '../services/authService';

// Types
export type User = UserModel;

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state (no longer reading from localStorage)
const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }: { email: string; password: string; rememberMe?: boolean }, { rejectWithValue }) => {
    try {
      // Call the login service
      const response = await loginService({ email, password });
      
      // Store the token and user in memory only
      setAuthToken(response.token);
      setStoredUser(response.user);
      
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed. Please check your credentials.');
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
      // Call the register service
      const response = await registerService({ username, email, password });
      
      // Store the token and user in memory only
      setAuthToken(response.token);
      setStoredUser(response.user);
      
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed. Please try again.');
    }
  }
);

export const logout = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Remove token and user from memory
      removeAuthToken();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed. Please try again.');
    }
  }
);

// Check auth thunk is now simpler (no localStorage checks)
export const checkAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    // In our new implementation, this always returns null since we don't persist
    return null;
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Temporary direct login for testing without server
    directLogin: (state) => {
      // Mock user data that matches the User interface
      const mockUser: User = {
        _id: 'user123',
        username: 'testuser',
        email: 'test@example.com',
        profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
        savedPosts: [],
        pets: ['pet1', 'pet2']
      };
      
      state.currentUser = mockUser;
      state.isLoading = false;
      state.error = null;
      
      // Set token in memory
      setAuthToken('mock-token-for-testing');
      setStoredUser(mockUser);
    },
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
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
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
      })
      
      // Check Auth
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.currentUser = action.payload;
      });
  },
});

export const { savePost, unsavePost, updateUserProfile, directLogin } = userSlice.actions;
export default userSlice.reducer; 