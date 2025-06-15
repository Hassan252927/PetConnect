import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import petService from '../services/petService';

// Define types for pet-related data
export interface Pet {
  _id: string;
  name: string;
  animal: string;
  breed: string;
  age?: number;
  gender?: string;
  weight?: number;
  image?: string;
  description?: string;
  ownerID: string;
  userID?: string; // For compatibility
  posts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PetState {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: PetState = {
  pets: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserPets = createAsyncThunk(
  'pet/fetchUserPets',
  async (userID: string, { rejectWithValue }) => {
    try {
      const pets = await petService.getUserPets(userID);
      return pets;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pets');
    }
  }
);

export const createPet = createAsyncThunk(
  'pet/createPet',
  async (petData: Omit<Pet, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const createPetRequest = {
        userID: petData.ownerID,
        name: petData.name,
        animal: petData.animal,
        breed: petData.breed,
        image: petData.image || '',
      };
      
      const newPet = await petService.createPet(createPetRequest);
      return newPet;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create pet');
    }
  }
);

export const updatePet = createAsyncThunk(
  'pet/updatePet',
  async (
    { petID, petData }: { petID: string; petData: Partial<Pet> },
    { rejectWithValue }
  ) => {
    try {
      const updatePetRequest = {
        petID,
        userID: petData.ownerID,
        name: petData.name,
        animal: petData.animal,
        breed: petData.breed,
        image: petData.image,
      };
      
      const updatedPet = await petService.updatePet(updatePetRequest);
      return updatedPet;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update pet');
    }
  }
);

export const deletePet = createAsyncThunk(
  'pet/deletePet',
  async (petID: string, { rejectWithValue }) => {
    try {
      await petService.deletePet(petID);
      return petID;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete pet');
    }
  }
);

// Create the pet slice
const petSlice = createSlice({
  name: 'pet',
  initialState,
  reducers: {},
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
      
      // Update pet
      .addCase(updatePet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePet.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.pets.findIndex(pet => pet._id === action.payload._id);
        if (index !== -1) {
          state.pets[index] = action.payload;
        }
      })
      .addCase(updatePet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete pet
      .addCase(deletePet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePet.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pets = state.pets.filter(pet => pet._id !== action.payload);
      })
      .addCase(deletePet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default petSlice.reducer; 