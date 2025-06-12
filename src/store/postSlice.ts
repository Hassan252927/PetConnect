import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Pet } from './petSlice';

// Define types for post-related data
export interface Comment {
  _id: string;
  postID: string;
  userID: string;
  username: string;
  profilePic: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface PostState {
  feedPosts: Post[];
  userPosts: Post[];
  isLoading: boolean;
  error: string | null;
}

// Generate mock post data
const generateMockPosts = (currentUserID: string, pets: Pet[]): Post[] => {
  // Create a mix of the current user's posts and others
  const mockUsernames = ['jane_doe', 'pet_lover', 'animal_friend', 'doggo_fan'];
  const mockProfilePics = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  ];
  
  const petMedia = [
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1536590158209-e9d615d525e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  ];
  
  const mockPosts: Post[] = [];
  
  // Add some posts from the current user with their pets
  pets.forEach((pet, index) => {
    mockPosts.push({
      _id: `post_user_${index}`,
      userID: currentUserID,
      username: 'You',
      profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      petID: pet._id,
      petName: pet.name,
      media: pet.image || petMedia[index % petMedia.length],
      caption: `This is my amazing ${pet.animal.toLowerCase()}, ${pet.name}! #pet #${pet.animal.toLowerCase()} #cute`,
      likes: [
        `user_${Math.floor(Math.random() * 100)}`,
        `user_${Math.floor(Math.random() * 100)}`,
      ],
      commentsCount: 2,
      comments: [
        {
          _id: `comment_${index}_1`,
          postID: `post_user_${index}`,
          userID: `user_${Math.floor(Math.random() * 100)}`,
          username: mockUsernames[Math.floor(Math.random() * mockUsernames.length)],
          profilePic: mockProfilePics[Math.floor(Math.random() * mockProfilePics.length)],
          content: 'So adorable! 😍',
          createdAt: new Date(Date.now() - 3600000 * Math.random() * 24).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * Math.random() * 24).toISOString(),
        },
        {
          _id: `comment_${index}_2`,
          postID: `post_user_${index}`,
          userID: `user_${Math.floor(Math.random() * 100)}`,
          username: mockUsernames[Math.floor(Math.random() * mockUsernames.length)],
          profilePic: mockProfilePics[Math.floor(Math.random() * mockProfilePics.length)],
          content: `I love ${pet.name}! Such a cutie.`,
          createdAt: new Date(Date.now() - 3600000 * Math.random() * 24).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * Math.random() * 24).toISOString(),
        },
      ],
      tags: ['pet', pet.animal.toLowerCase(), 'cute'],
      createdAt: new Date(Date.now() - 86400000 * (1 + Math.random() * 7)).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * (1 + Math.random() * 7)).toISOString(),
    });
  });
  
  // Add some posts from other users
  for (let i = 0; i < 5; i++) {
    const randomUserIndex = Math.floor(Math.random() * mockUsernames.length);
    mockPosts.push({
      _id: `post_other_${i}`,
      userID: `user_${Math.floor(Math.random() * 100)}`,
      username: mockUsernames[randomUserIndex],
      profilePic: mockProfilePics[randomUserIndex % mockProfilePics.length],
      media: petMedia[i % petMedia.length],
      caption: `My pet is the best! #${i % 2 === 0 ? 'dog' : 'cat'} #petsofinstagram`,
      likes: [
        ...(Math.random() > 0.5 ? [currentUserID] : []),
        `user_${Math.floor(Math.random() * 100)}`,
        `user_${Math.floor(Math.random() * 100)}`,
      ],
      commentsCount: 1,
      comments: [
        {
          _id: `comment_other_${i}`,
          postID: `post_other_${i}`,
          userID: `user_${Math.floor(Math.random() * 100)}`,
          username: mockUsernames[Math.floor(Math.random() * mockUsernames.length)],
          profilePic: mockProfilePics[Math.floor(Math.random() * mockProfilePics.length)],
          content: 'What a beautiful pet!',
          createdAt: new Date(Date.now() - 3600000 * Math.random() * 24).toISOString(),
          updatedAt: new Date(Date.now() - 3600000 * Math.random() * 24).toISOString(),
        },
      ],
      tags: [i % 2 === 0 ? 'dog' : 'cat', 'petsofinstagram'],
      createdAt: new Date(Date.now() - 86400000 * (1 + Math.random() * 14)).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * (1 + Math.random() * 14)).toISOString(),
    });
  }
  
  // Sort by creation date (newest first)
  return mockPosts.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

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
  async ({ userID, pets }: { userID: string; pets: Pet[] }, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await apiClient.get('/posts/feed');
      
      // For now, we'll use mock data
      return generateMockPosts(userID, pets);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch feed posts');
    }
  }
);

export const fetchUserPosts = createAsyncThunk(
  'post/fetchUserPosts',
  async (userID: string, { rejectWithValue, getState }) => {
    try {
      // In a real app, this would be an API call
      // const response = await apiClient.get(`/users/${userID}/posts`);
      
      // For now, we'll filter feed posts for this user
      const state = getState() as { post: PostState };
      return state.post.feedPosts.filter(post => post.userID === userID);
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
      // In a real app, this would be an API call
      // const response = await apiClient.post('/posts', postData);
      
      // For now, we'll simulate creating a post
      const newPost: Post = {
        _id: `post_${Date.now()}`,
        ...postData,
        likes: [],
        commentsCount: 0,
        comments: [],
        tags: postData.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newPost;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create post');
    }
  }
);

export const likePost = createAsyncThunk(
  'post/likePost',
  async ({ postID, userID }: { postID: string; userID: string }, { rejectWithValue, getState }) => {
    try {
      // In a real app, this would be an API call
      // await apiClient.post(`/posts/${postID}/like`);
      
      // For now, we'll toggle the like in state
      const state = getState() as { post: PostState };
      const post = [...state.post.feedPosts, ...state.post.userPosts].find(p => p._id === postID);
      
      if (!post) {
        throw new Error('Post not found');
      }
      
      const isLiked = post.likes.includes(userID);
      
      return {
        postID,
        userID,
        isLiked, // Current state (to be toggled)
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to like post');
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
      // In a real app, this would be an API call
      // const response = await apiClient.post(`/posts/${commentData.postID}/comments`, commentData);
      
      // For now, we'll simulate adding a comment
      const newComment: Comment = {
        _id: `comment_${Date.now()}`,
        ...commentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return newComment;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add comment');
    }
  }
);

// Create the post slice
const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch feed posts
      .addCase(fetchFeedPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeedPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedPosts = action.payload;
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
        state.feedPosts.unshift(action.payload); // Add to beginning of array
        if (action.payload.userID === state.userPosts[0]?.userID) {
          state.userPosts.unshift(action.payload);
        }
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postID, userID, isLiked } = action.payload;
        
        // Update in feed posts
        const feedPost = state.feedPosts.find(post => post._id === postID);
        if (feedPost) {
          if (isLiked) {
            // Unlike
            feedPost.likes = feedPost.likes.filter(id => id !== userID);
          } else {
            // Like
            feedPost.likes.push(userID);
          }
        }
        
        // Update in user posts
        const userPost = state.userPosts.find(post => post._id === postID);
        if (userPost) {
          if (isLiked) {
            // Unlike
            userPost.likes = userPost.likes.filter(id => id !== userID);
          } else {
            // Like
            userPost.likes.push(userID);
          }
        }
      })
      
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const comment = action.payload;
        
        // Update in feed posts
        const feedPost = state.feedPosts.find(post => post._id === comment.postID);
        if (feedPost) {
          feedPost.comments.push(comment);
          feedPost.commentsCount += 1;
        }
        
        // Update in user posts
        const userPost = state.userPosts.find(post => post._id === comment.postID);
        if (userPost) {
          userPost.comments.push(comment);
          userPost.commentsCount += 1;
        }
      });
  },
});

export default postSlice.reducer; 