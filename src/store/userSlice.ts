import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { login as loginService, register as registerService, User as UserModel, updateUser as updateUserService, UpdateUserRequest, savePost as savePostService, unsavePost as unsavePostService } from '../services/userService';
import { 
  setAuthToken, 
  removeAuthToken,
  setStoredUser,
  initializeAuth
} from '../services/authService';


// Types
export type User = UserModel;

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}

// Initialize state from localStorage
const { user: storedUser } = initializeAuth();

const initialState: UserState = {
  currentUser: storedUser,
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

// Check auth thunk - verify stored token is still valid
export const checkAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const { token, user } = initializeAuth();
      
      if (!token || !user) {
        return null;
      }
      
      // For now, just return the cached user without server verification
      // This prevents logout on page reload due to network issues
      // TODO: Implement proper token refresh mechanism
      console.log('Using cached authentication:', { user: user.username, hasToken: !!token });
      return user;
      
      // Uncomment below for server-side token verification
      /*
      try {
        const response = await apiClient.post('/auth/verify-token');
        return response.user || user;
      } catch (verifyError) {
        console.warn('Token verification failed:', verifyError);
        // Only clear token if it's definitely invalid (401)
        if ((verifyError as any)?.status === 401) {
          removeAuthToken();
          return null;
        }
        // For network errors, keep the user logged in
        return user;
      }
      */
    } catch (error: any) {
      console.error('Auth initialization failed:', error);
      return rejectWithValue(error.message || 'Authentication check failed');
    }
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

// Save post async thunk
export const savePostAsync = createAsyncThunk(
  'user/savePost',
  async ({ userID, postID }: { userID: string; postID: string }, { rejectWithValue }) => {
    try {
      console.log('savePostAsync - Calling API to save post:', postID, 'for user:', userID);
      const updatedUser = await savePostService(userID, postID);
      console.log('savePostAsync - API response:', updatedUser);
      return { user: updatedUser, postID };
    } catch (error: any) {
      console.error('savePostAsync - Error:', error);
      return rejectWithValue(error.message || 'Failed to save post');
    }
  }
);

// Unsave post async thunk
export const unsavePostAsync = createAsyncThunk(
  'user/unsavePost',
  async ({ userID, postID }: { userID: string; postID: string }, { rejectWithValue }) => {
    try {
      console.log('unsavePostAsync - Calling API to unsave post:', postID, 'for user:', userID);
      const updatedUser = await unsavePostService(userID, postID);
      console.log('unsavePostAsync - API response:', updatedUser);
      return { user: updatedUser, postID };
    } catch (error: any) {
      console.error('unsavePostAsync - Error:', error);
      return rejectWithValue(error.message || 'Failed to unsave post');
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
    // Direct user update action for settings changes
    updateUserData: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      setStoredUser(action.payload);
    },
    savePost: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        console.log('userSlice - Saving post to Redux state:', action.payload);
        
        // Check if the post is already saved to avoid duplicates
        if (!state.currentUser.savedPosts.includes(action.payload)) {
          state.currentUser.savedPosts.push(action.payload);
          
          // Update stored user to maintain persistence
          setStoredUser(state.currentUser);
          
          console.log('userSlice - Updated savedPosts:', state.currentUser.savedPosts);
        } else {
          console.log('userSlice - Post already saved, skipping:', action.payload);
        }
      }
    },
    unsavePost: (state, action: PayloadAction<string>) => {
      if (state.currentUser) {
        console.log('userSlice - Unsaving post from Redux state:', action.payload);
        
        state.currentUser.savedPosts = state.currentUser.savedPosts.filter(
          (postId) => postId !== action.payload
        );
        
        // Update stored user to maintain persistence
        setStoredUser(state.currentUser);
        
        console.log('userSlice - Updated savedPosts:', state.currentUser.savedPosts);
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
      })
      
      // Save Post
      .addCase(savePostAsync.fulfilled, (state, action) => {
        if (state.currentUser) {
          state.currentUser = action.payload.user;
        }
      })
      .addCase(savePostAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Unsave Post
      .addCase(unsavePostAsync.fulfilled, (state, action) => {
        if (state.currentUser) {
          state.currentUser = action.payload.user;
        }
      })
      .addCase(unsavePostAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// Export the slice's actions and reducer
export const { bypassLogin, savePost, unsavePost, updateUserProfile, updateUserData } = userSlice.actions;
export default userSlice.reducer; 