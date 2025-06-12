import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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
  createdAt: string;
  updatedAt: string;
}

export interface PetState {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
}

// Generate mock pet data
const generateMockPets = (ownerID: string): Pet[] => [
  {
    _id: 'pet1',
    name: 'Buddy',
    animal: 'Dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'Male',
    weight: 65,
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Friendly and energetic golden retriever who loves to play fetch.',
    ownerID,
    createdAt: new Date(Date.now() - 7776000000).toISOString(), // 90 days ago
    updatedAt: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
  },
  {
    _id: 'pet2',
    name: 'Whiskers',
    animal: 'Cat',
    breed: 'Persian',
    age: 5,
    gender: 'Female',
    weight: 10,
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Lazy and affectionate Persian cat who loves to nap in sunny spots.',
    ownerID,
    createdAt: new Date(Date.now() - 15552000000).toISOString(), // 180 days ago
    updatedAt: new Date(Date.now() - 1728000000).toISOString(), // 20 days ago
  },
];

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
      // In a real app, this would be an API call
      // const response = await apiClient.get(`/users/${userID}/pets`);
      
      // For now, we'll use mock data
      return generateMockPets(userID);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pets');
    }
  }
);

export const createPet = createAsyncThunk(
  'pet/createPet',
  async (petData: Omit<Pet, '_id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      // In a real app, this would be an API call
      // const response = await apiClient.post('/pets', petData);
      
      // For now, we'll simulate creating a pet
      const newPet: Pet = {
        _id: `pet_${Date.now()}`,
        ...petData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
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
    { rejectWithValue, getState }
  ) => {
    try {
      // In a real app, this would be an API call
      // const response = await apiClient.put(`/pets/${petID}`, petData);
      
      // For now, we'll simulate updating a pet
      const state = getState() as { pet: PetState };
      const existingPet = state.pet.pets.find(pet => pet._id === petID);
      
      if (!existingPet) {
        throw new Error('Pet not found');
      }
      
      const updatedPet: Pet = {
        ...existingPet,
        ...petData,
        updatedAt: new Date().toISOString(),
      };
      
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
      // In a real app, this would be an API call
      // await apiClient.delete(`/pets/${petID}`);
      
      // For now, we'll just return the ID to remove from state
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