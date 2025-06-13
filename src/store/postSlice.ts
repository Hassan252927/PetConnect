import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Pet } from './petSlice';
import { 
  getFeedPosts, 
  getPostById, 
  createPost as createPostAPI, 
  updatePost as updatePostAPI, 
  deletePost as deletePostAPI, 
  toggleLikePost as toggleLikePostAPI, 
  addComment as addCommentAPI, 
  deleteComment as deleteCommentAPI 
} from '../services/postService';

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
  timestamp: string; // Changed from createdAt to timestamp
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
      timestamp: new Date(Date.now() - 86400000 * (1 + Math.random() * 7)).toISOString(),
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
      timestamp: new Date(Date.now() - 86400000 * (1 + Math.random() * 14)).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * (1 + Math.random() * 14)).toISOString(),
    });
  }
  
  // Sort by creation date (newest first)
  return mockPosts.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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

      console.log('Sending to API:', apiPostData);
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
      return rejectWithValue(error.message || 'Failed to add comment');
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
      .addCase(createPost.fulfilled, (state, action) => {
        state.feedPosts.unshift(action.payload);
        state.userPosts.unshift(action.payload);
      })
      
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const updatePostInArray = (posts: Post[]) => {
          const index = posts.findIndex(p => p._id === updatedPost._id);
          if (index !== -1) {
            posts[index] = updatedPost;
          }
        };
        updatePostInArray(state.feedPosts);
        updatePostInArray(state.userPosts);
      })
      
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const updatePostInArray = (posts: Post[]) => {
          const index = posts.findIndex(p => p._id === updatedPost._id);
          if (index !== -1) {
            posts[index] = updatedPost;
          }
        };
        updatePostInArray(state.feedPosts);
        updatePostInArray(state.userPosts);
      });
  },
});

export default postSlice.reducer; 