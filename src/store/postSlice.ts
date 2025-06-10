import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
interface Comment {
  _id: string;
  postID: string;
  userID: string;
  username: string;
  profilePic: string;
  content: string;
  timestamp: string;
}

export interface Post {
  _id: string;
  petID: string;
  userID: string;
  petName: string;
  petImage: string;
  username: string;
  userProfilePic: string;
  media: string;
  caption: string;
  likes: string[];
  comments: Comment[];
  timestamp: string;
  animal: string;
  breed: string;
}

interface PostState {
  posts: Post[];
  currentPost: Post | null;
  feedPosts: Post[];
  userPosts: Post[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: PostState = {
  posts: [],
  currentPost: null,
  feedPosts: [],
  userPosts: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchPosts = createAsyncThunk(
  'post/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      // const response = await axios.get('/api/posts');
      
      // Simulated data
      return [
        {
          _id: 'post1',
          petID: 'pet1',
          userID: 'user1',
          petName: 'Buddy',
          petImage: 'https://via.placeholder.com/150',
          username: 'john_doe',
          userProfilePic: 'https://via.placeholder.com/50',
          media: 'https://via.placeholder.com/500',
          caption: 'Buddy enjoying the park!',
          likes: ['user2', 'user3'],
          comments: [
            {
              _id: 'comment1',
              postID: 'post1',
              userID: 'user2',
              username: 'jane_smith',
              profilePic: 'https://via.placeholder.com/50',
              content: 'So cute!',
              timestamp: new Date().toISOString(),
            },
          ],
          timestamp: new Date().toISOString(),
          animal: 'Dog',
          breed: 'Labrador',
        },
        {
          _id: 'post2',
          petID: 'pet2',
          userID: 'user2',
          petName: 'Whiskers',
          petImage: 'https://via.placeholder.com/150',
          username: 'jane_smith',
          userProfilePic: 'https://via.placeholder.com/50',
          media: 'https://via.placeholder.com/500',
          caption: 'Whiskers napping in the sun',
          likes: ['user1'],
          comments: [],
          timestamp: new Date().toISOString(),
          animal: 'Cat',
          breed: 'Siamese',
        },
      ];
    } catch (error) {
      return rejectWithValue('Failed to fetch posts. Please try again.');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'post/fetchUserPosts',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      // const response = await axios.get(`/api/posts/user/${userId}`);
      
      // Simulated response
      return [
        {
          _id: 'post1',
          petID: 'pet1',
          userID: userId,
          petName: 'Buddy',
          petImage: 'https://via.placeholder.com/150',
          username: 'john_doe',
          userProfilePic: 'https://via.placeholder.com/50',
          media: 'https://via.placeholder.com/500',
          caption: 'Buddy enjoying the park!',
          likes: ['user2', 'user3'],
          comments: [
            {
              _id: 'comment1',
              postID: 'post1',
              userID: 'user2',
              username: 'jane_smith',
              profilePic: 'https://via.placeholder.com/50',
              content: 'So cute!',
              timestamp: new Date().toISOString(),
            },
          ],
          timestamp: new Date().toISOString(),
          animal: 'Dog',
          breed: 'Labrador',
        },
      ];
    } catch (error) {
      return rejectWithValue('Failed to fetch user posts. Please try again.');
    }
  }
);

export const createPost = createAsyncThunk(
  'post/createPost',
  async (
    postData: {
      petID: string;
      userID: string;
      petName: string;
      petImage: string;
      username: string;
      userProfilePic: string;
      media: string;
      caption: string;
      animal: string;
      breed: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Simulate API call
      // const response = await axios.post('/api/posts', postData);
      
      // Simulated response
      return {
        _id: `post${Date.now()}`,
        ...postData,
        likes: [],
        comments: [],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue('Failed to create post. Please try again.');
    }
  }
);

export const likePost = createAsyncThunk(
  'post/likePost',
  async ({ postId, userId }: { postId: string; userId: string }, { rejectWithValue }) => {
    try {
      // Simulate API call
      // await axios.post(`/api/posts/${postId}/like`, { userId });
      return { postId, userId };
    } catch (error) {
      return rejectWithValue('Failed to like post. Please try again.');
    }
  }
);

export const unlikePost = createAsyncThunk(
  'post/unlikePost',
  async ({ postId, userId }: { postId: string; userId: string }, { rejectWithValue }) => {
    try {
      // Simulate API call
      // await axios.post(`/api/posts/${postId}/unlike`, { userId });
      return { postId, userId };
    } catch (error) {
      return rejectWithValue('Failed to unlike post. Please try again.');
    }
  }
);

export const addComment = createAsyncThunk(
  'post/addComment',
  async (
    commentData: {
      postID: string;
      userID: string;
      username: string;
      profilePic: string;
      content: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // Simulate API call
      // const response = await axios.post(`/api/posts/${commentData.postID}/comments`, commentData);
      
      // Simulated response
      const newComment = {
        _id: `comment${Date.now()}`,
        ...commentData,
        timestamp: new Date().toISOString(),
      };
      
      return { postId: commentData.postID, comment: newComment };
    } catch (error) {
      return rejectWithValue('Failed to add comment. Please try again.');
    }
  }
);

// Slice
const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    setCurrentPost: (state, action: PayloadAction<Post>) => {
      state.currentPost = action.payload;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload;
        state.feedPosts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
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
        state.userPosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
        state.feedPosts.unshift(action.payload);
        state.userPosts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload;
        const updatePost = (post: Post) => {
          if (post._id === postId && !post.likes.includes(userId)) {
            post.likes.push(userId);
          }
        };
        
        state.posts.forEach(updatePost);
        state.feedPosts.forEach(updatePost);
        state.userPosts.forEach(updatePost);
        
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.likes.push(userId);
        }
      })
      
      // Unlike post
      .addCase(unlikePost.fulfilled, (state, action) => {
        const { postId, userId } = action.payload;
        const updatePost = (post: Post) => {
          if (post._id === postId) {
            post.likes = post.likes.filter((id) => id !== userId);
          }
        };
        
        state.posts.forEach(updatePost);
        state.feedPosts.forEach(updatePost);
        state.userPosts.forEach(updatePost);
        
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.likes = state.currentPost.likes.filter((id) => id !== userId);
        }
      })
      
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        const updatePost = (post: Post) => {
          if (post._id === postId) {
            post.comments.push(comment);
          }
        };
        
        state.posts.forEach(updatePost);
        state.feedPosts.forEach(updatePost);
        state.userPosts.forEach(updatePost);
        
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.comments.push(comment);
        }
      });
  },
});

export const { setCurrentPost, clearCurrentPost } = postSlice.actions;
export default postSlice.reducer; 