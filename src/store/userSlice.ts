import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login as loginService, register as registerService, User as UserModel, updateUser as updateUserService, UpdateUserRequest } from '../services/userService';
import { 
  setAuthToken, 
  removeAuthToken,
  setStoredUser
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

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userID, userData }: { userID: string; userData: UpdateUserRequest }, { rejectWithValue }) => {
    try {
      const updatedUser = await updateUserService(userID, userData);
      
      console.log('Profile update completed on server:', updatedUser.username);
      
      // Server now handles comprehensive username synchronization across all collections
      // No need for client-side Redux synchronization
      
      return updatedUser;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile');
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Bypass login for development
    bypassLogin: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isLoading = false;
      state.error = null;
      // Store the token and user for the session
      setAuthToken('dev-token');
      setStoredUser(action.payload);
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
        // Update stored user to maintain persistence
        setStoredUser(state.currentUser);
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
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        // Update stored user to maintain persistence
        setStoredUser(action.payload);
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { bypassLogin, savePost, unsavePost, updateUserProfile } = userSlice.actions;
export default userSlice.reducer; 