import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface Pet {
  _id: string;
  userID: string;
  name: string;
  animal: string;
  breed: string;
  image: string;
  posts: string[];
}

interface PetState {
  pets: Pet[];
  currentPet: Pet | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: PetState = {
  pets: [],
  currentPet: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserPets = createAsyncThunk(
  'pet/fetchUserPets',
  async (userId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      // const response = await axios.get(`/api/pets/user/${userId}`);
      
      // Simulated data
      return [
        {
          _id: 'pet1',
          userID: userId,
          name: 'Buddy',
          animal: 'Dog',
          breed: 'Labrador',
          image: 'https://via.placeholder.com/150',
          posts: ['post1', 'post2'],
        },
        {
          _id: 'pet2',
          userID: userId,
          name: 'Whiskers',
          animal: 'Cat',
          breed: 'Siamese',
          image: 'https://via.placeholder.com/150',
          posts: ['post3'],
        },
      ];
    } catch (error) {
      return rejectWithValue('Failed to fetch pets. Please try again.');
    }
  }
);

export const createPet = createAsyncThunk(
  'pet/createPet',
  async (
    petData: { userID: string; name: string; animal: string; breed: string; image: string },
    { rejectWithValue }
  ) => {
    try {
      // Simulate API call
      // const response = await axios.post('/api/pets', petData);
      
      // Simulated response
      return {
        _id: `pet${Date.now()}`,
        userID: petData.userID,
        name: petData.name,
        animal: petData.animal,
        breed: petData.breed,
        image: petData.image,
        posts: [],
      };
    } catch (error) {
      return rejectWithValue('Failed to create pet. Please try again.');
    }
  }
);

export const fetchPetById = createAsyncThunk(
  'pet/fetchPetById',
  async (petId: string, { rejectWithValue }) => {
    try {
      // Simulate API call
      // const response = await axios.get(`/api/pets/${petId}`);
      
      // Simulated response
      return {
        _id: petId,
        userID: 'user1',
        name: 'Rex',
        animal: 'Dog',
        breed: 'German Shepherd',
        image: 'https://via.placeholder.com/150',
        posts: ['post1', 'post4'],
      };
    } catch (error) {
      return rejectWithValue('Failed to fetch pet details. Please try again.');
    }
  }
);

// Slice
const petSlice = createSlice({
  name: 'pet',
  initialState,
  reducers: {
    setCurrentPet: (state, action: PayloadAction<Pet>) => {
      state.currentPet = action.payload;
    },
    clearCurrentPet: (state) => {
      state.currentPet = null;
    },
    addPostToPet: (state, action: PayloadAction<{ petId: string; postId: string }>) => {
      const { petId, postId } = action.payload;
      const pet = state.pets.find((pet) => pet._id === petId);
      if (pet) {
        pet.posts.push(postId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user pets
      .addCase(fetchUserPets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pets = action.payload;
      })
      .addCase(fetchUserPets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create pet
      .addCase(createPet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pets.push(action.payload);
      })
      .addCase(createPet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch pet by ID
      .addCase(fetchPetById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPetById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPet = action.payload;
      })
      .addCase(fetchPetById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentPet, clearCurrentPet, addPostToPet } = petSlice.actions;
export default petSlice.reducer; 