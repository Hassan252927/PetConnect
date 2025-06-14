import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Pet } from './petSlice';
import { 
  getFeedPosts, 
  createPost as createPostAPI, 
  toggleLikePost as toggleLikePostAPI, 
  addComment as addCommentAPI,
  deleteComment as deleteCommentAPI,
  deletePost as deletePostAPI
} from '../services/postService';
import { PayloadAction } from '@reduxjs/toolkit';

// Define types for populated user and pet objects within a post
export interface UserInPost {
  _id: string;
  username: string;
  profilePic?: string;
}

export interface PetInPost {
  _id: string;
  name: string;
}

export interface Comment {
  _id: string;
  postID: string;
  userID: string | {
    _id: string;
    username: string;
    profilePic?: string;
  };
  username?: string;
  profilePic?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  userID: string;
  username: string;
  profilePic: string;
  petID?: string;
  petName?: string;
  media?: string;
  caption: string;
  likes: string[]; // Array of userIDs who liked the post
  commentsCount: number;
  comments: Comment[];
  tags: string[];
  timestamp: string; // Changed from createdAt to timestamp
  createdAt?: string; // Add optional createdAt for backend compatibility
  updatedAt: string;
}

export interface PostState {
  feedPosts: Post[];
  userPosts: Post[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: PostState = {
  feedPosts: [],
  userPosts: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchFeedPosts = createAsyncThunk(
  'post/fetchFeedPosts',
  async ({ userID, pets }: { userID?: string; pets: Pet[] }, { rejectWithValue }) => {
    try {
      const posts = await getFeedPosts(userID);
      return posts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch feed posts');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'post/fetchUserPosts',
  async (userID: string, { rejectWithValue }) => {
    try {
      const posts = await getFeedPosts(userID);
      return posts;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user posts');
    }
  }
);

export const createPost = createAsyncThunk(
  'post/createPost',
  async (
    postData: {
      userID: string;
      username: string;
      profilePic: string;
      petID?: string;
      petName?: string;
      media?: string;
      caption: string;
      tags?: string[];
    },
    { rejectWithValue }
  ) => {
    try {
      const apiPostData = {
        userID: postData.userID,
        username: postData.username,
        profilePic: postData.profilePic,
        petID: postData.petID || '',
        petName: postData.petName || '',
        petImage: postData.media || '',
        media: postData.media || '',
        caption: postData.caption,
        animal: postData.tags?.[0] || '',
        breed: postData.tags?.[1] || ''
      };

      //('Sending to API:', apiPostData);
      const newPost = await createPostAPI(apiPostData);
      return newPost;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create post');
    }
  }
);

export const likePost = createAsyncThunk(
  'post/likePost',
  async ({ postID, userID }: { postID: string; userID: string }, { rejectWithValue }) => {
    try {
      const updatedPost = await toggleLikePostAPI(postID, userID);
      return updatedPost;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to like post');
    }
  }
);

export const addComment = createAsyncThunk(
  'post/addComment',
  async (
    { postID, userID, text }: { postID: string; userID: string; text: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedPost = await addCommentAPI(postID, userID, text);
      return updatedPost;
    } catch (error: any) {
      console.error('addComment error:', error);
      return rejectWithValue(error.message || 'Failed to add comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'post/deleteComment',
  async (
    { postID, commentID, userID }: { postID: string; commentID: string; userID: string },
    { rejectWithValue }
  ) => {
    try {
      const updatedPost = await deleteCommentAPI(postID, commentID, userID);
      return updatedPost;
    } catch (error: any) {
      console.error('deleteComment error:', error);
      return rejectWithValue(error.message || 'Failed to delete comment');
    }
  }
);

export const deletePost = createAsyncThunk(
  'post/deletePost',
  async (postID: string, { rejectWithValue }) => {
    try {
      await deletePostAPI(postID);
      return postID;
    } catch (error: any) {
      console.error('deletePost error:', error);
      return rejectWithValue(error.message || 'Failed to delete post');
    }
  }
);

// Create the post slice
const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearPosts: (state) => {
      state.feedPosts = [];
      state.userPosts = [];
      state.error = null;
    },
    updateUserProfileData: (state, action: PayloadAction<{ userId: string; profileData: { username?: string; profilePic?: string; bio?: string } }>) => {
      const { userId, profileData } = action.payload;
      
      console.log('updateUserProfileData called with:', { userId, profileData });
      console.log('Current feedPosts count:', state.feedPosts.length);
      console.log('Current userPosts count:', state.userPosts.length);
      
      let feedPostsUpdated = 0;
      let userPostsUpdated = 0;
      
      // Update user profile data in feed posts
      state.feedPosts.forEach(post => {
        if (post.userID === userId) {
          console.log('Updating feed post:', post._id, 'from username:', post.username);
          if (profileData.username !== undefined) {
            post.username = profileData.username;
          }
          if (profileData.profilePic !== undefined) {
            post.profilePic = profileData.profilePic;
          }
          feedPostsUpdated++;
          console.log('Updated to username:', post.username);
        }
        // Update user profile data in comments
        post.comments?.forEach(comment => {
          // Handle both string and object userID formats
          if (typeof comment.userID === 'string') {
            if (comment.userID === userId) {
              if (profileData.username !== undefined) {
                comment.username = profileData.username;
              }
              if (profileData.profilePic !== undefined) {
                comment.profilePic = profileData.profilePic;
              }
            }
          } else if (comment.userID && typeof comment.userID === 'object') {
            if (comment.userID._id === userId) {
              if (profileData.username !== undefined) {
                comment.userID.username = profileData.username;
              }
              if (profileData.profilePic !== undefined) {
                comment.userID.profilePic = profileData.profilePic;
              }
            }
          }
        });
      });
      
      // Update user profile data in user posts
      state.userPosts.forEach(post => {
        if (post.userID === userId) {
          console.log('Updating user post:', post._id, 'from username:', post.username);
          if (profileData.username !== undefined) {
            post.username = profileData.username;
          }
          if (profileData.profilePic !== undefined) {
            post.profilePic = profileData.profilePic;
          }
          userPostsUpdated++;
          console.log('Updated to username:', post.username);
        }
        // Update user profile data in comments
        post.comments?.forEach(comment => {
          // Handle both string and object userID formats
          if (typeof comment.userID === 'string') {
            if (comment.userID === userId) {
              if (profileData.username !== undefined) {
                comment.username = profileData.username;
              }
              if (profileData.profilePic !== undefined) {
                comment.profilePic = profileData.profilePic;
              }
            }
          } else if (comment.userID && typeof comment.userID === 'object') {
            if (comment.userID._id === userId) {
              if (profileData.username !== undefined) {
                comment.userID.username = profileData.username;
              }
              if (profileData.profilePic !== undefined) {
                comment.userID.profilePic = profileData.profilePic;
              }
            }
          }
        });
      });
      
      console.log('Profile sync complete. Updated:', feedPostsUpdated, 'feed posts,', userPostsUpdated, 'user posts');
    },
    // Simple manual sync action for immediate use
    forceUpdateUserData: (state, action: PayloadAction<{ userId: string; username: string; profilePic?: string }>) => {
      const { userId, username, profilePic } = action.payload;
      console.log('Force updating all posts for user:', userId, 'to username:', username);
      
      // Update all feed posts
      state.feedPosts.forEach(post => {
        if (post.userID === userId) {
          post.username = username;
          if (profilePic) post.profilePic = profilePic;
        }
      });
      
      // Update all user posts  
      state.userPosts.forEach(post => {
        if (post.userID === userId) {
          post.username = username;
          if (profilePic) post.profilePic = profilePic;
        }
      });
      
      console.log('Force update complete');
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch feed posts
      .addCase(fetchFeedPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedPosts = action.payload as Post[];
      })
      .addCase(fetchFeedPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = action.payload as Post[];
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create post
      .addCase(createPost.fulfilled, (state, action) => {
        const newPost = action.payload as Post;
        state.feedPosts.unshift(newPost);
        state.userPosts.unshift(newPost);
      })
      
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const updatedPost = action.payload as Post;
        const updatePostInArray = (posts: Post[]) => {
          const index = posts.findIndex(p => p._id === updatedPost._id);
          if (index !== -1) {
            posts[index] = { ...posts[index], ...updatedPost };
          }
        };
        updatePostInArray(state.feedPosts);
        updatePostInArray(state.userPosts);
      })
      
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const updatedPost = action.payload as Post;
        const updatePostInArray = (posts: Post[]) => {
          const index = posts.findIndex(p => p._id === updatedPost._id);
          if (index !== -1) {
            posts[index] = { ...posts[index], ...updatedPost };
          }
        };
        updatePostInArray(state.feedPosts);
        updatePostInArray(state.userPosts);
      })
      
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const updatedPost = action.payload as Post;
        const updatePostInArray = (posts: Post[]) => {
          const index = posts.findIndex(p => p._id === updatedPost._id);
          if (index !== -1) {
            posts[index] = { ...posts[index], ...updatedPost };
          }
        };
        updatePostInArray(state.feedPosts);
        updatePostInArray(state.userPosts);
      })
      
      // Delete post
      .addCase(deletePost.fulfilled, (state, action) => {
        const deletedPostID = action.payload as string;
        state.feedPosts = state.feedPosts.filter(post => post._id !== deletedPostID);
        state.userPosts = state.userPosts.filter(post => post._id !== deletedPostID);
      });
  },
});

// Export actions
export const { clearPosts, updateUserProfileData, forceUpdateUserData } = postSlice.actions;

export default postSlice.reducer; 