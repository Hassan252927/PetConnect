import apiClient from './apiClient';
import { Pet } from '../store/petSlice';

// Interface for creating a new pet
export interface CreatePetRequest {
  userID: string;
  name: string;
  animal: string;
  breed: string;
  image: string;
}

// Interface for updating a pet
export interface UpdatePetRequest extends Partial<CreatePetRequest> {
  petID: string;
}

/**
 * Get all pets for a user
 * @param userID - The ID of the user
 * @returns A promise that resolves to an array of pets
 */
export const getUserPets = (userID: string): Promise<Pet[]> => {
  return apiClient.get(`/pets/user/${userID}`);
};

/**
 * Get a pet by ID
 * @param petID - The ID of the pet
 * @returns A promise that resolves to the pet
 */
export const getPetById = (petID: string): Promise<Pet> => {
  return apiClient.get(`/pets/${petID}`);
};

/**
 * Create a new pet
 * @param petData - The data for the new pet
 * @returns A promise that resolves to the created pet
 */
export const createPet = (petData: CreatePetRequest): Promise<Pet> => {
  return apiClient.post('/pets', petData);
};

/**
 * Update a pet
 * @param petData - The data to update the pet with
 * @returns A promise that resolves to the updated pet
 */
export const updatePet = (petData: UpdatePetRequest): Promise<Pet> => {
  return apiClient.put(`/pets/${petData.petID}`, petData);
};

/**
 * Delete a pet
 * @param petID - The ID of the pet to delete
 * @returns A promise that resolves when the pet is deleted
 */
export const deletePet = (petID: string): Promise<void> => {
  return apiClient.delete(`/pets/${petID}`);
};

/**
 * Search for pets based on criteria
 * @param query - The search query
 * @param filters - Optional filters to apply
 * @returns A promise that resolves to an array of pets
 */
export const searchPets = (
  query: string,
  filters?: {
    animalType?: string;
    breed?: string;
    age?: string;
    size?: string;
  }
): Promise<Pet[]> => {
  return apiClient.get('/pets/search', {
    params: {
      query,
      ...filters,
    },
  });
};

export default {
  getUserPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
  searchPets,
}; 