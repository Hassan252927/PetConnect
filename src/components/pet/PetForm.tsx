import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { createPet, Pet } from '../../store/petSlice';

interface PetFormProps {
  initialData?: Partial<Pet>;
  onSuccess?: (pet: Pet) => void;
  onCancel?: () => void;
}

const animalTypes = [
  'Dog',
  'Cat',
  'Bird',
  'Rabbit',
  'Hamster',
  'Guinea Pig',
  'Fish',
  'Turtle',
  'Other',
];

// Some example breeds for common animal types
const breedsByAnimal: Record<string, string[]> = {
  Dog: [
    'Labrador Retriever',
    'German Shepherd',
    'Bulldog',
    'Poodle',
    'Beagle',
    'Rottweiler',
    'Yorkshire Terrier',
    'Boxer',
    'Dachshund',
    'Shih Tzu',
    'Mixed',
    'Other',
  ],
  Cat: [
    'Persian',
    'Maine Coon',
    'Siamese',
    'Ragdoll',
    'British Shorthair',
    'Sphynx',
    'Bengal',
    'Abyssinian',
    'Scottish Fold',
    'Birman',
    'Mixed',
    'Other',
  ],
  Bird: [
    'Canary',
    'Parakeet',
    'Cockatiel',
    'Lovebird',
    'Finch',
    'Parrot',
    'Macaw',
    'Budgerigar',
    'Cockatoo',
    'Other',
  ],
  Rabbit: [
    'Holland Lop',
    'Mini Rex',
    'Netherland Dwarf',
    'Dutch',
    'Flemish Giant',
    'Lionhead',
    'Mixed',
    'Other',
  ],
  Other: ['Other'],
};

const PetForm: React.FC<PetFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { isLoading, error } = useAppSelector((state) => state.pet);

  const [name, setName] = useState(initialData?.name || '');
  const [animal, setAnimal] = useState(initialData?.animal || '');
  const [breed, setBreed] = useState(initialData?.breed || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [availableBreeds, setAvailableBreeds] = useState<string[]>([]);

  useEffect(() => {
    if (animal && breedsByAnimal[animal]) {
      setAvailableBreeds(breedsByAnimal[animal]);
      if (!breedsByAnimal[animal].includes(breed)) {
        setBreed('');
      }
    } else {
      setAvailableBreeds([]);
    }
  }, [animal, breed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) return;
    
    try {
      const petData = {
        userID: currentUser._id,
        name,
        animal,
        breed,
        image: image || 'https://via.placeholder.com/150',
      };
      
      const resultAction = await dispatch(createPet(petData)).unwrap();
      
      if (onSuccess) {
        onSuccess(resultAction);
      }
    } catch (error) {
      console.error('Failed to create pet', error);
    }
  };

  // For a real app, implement an image upload functionality
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload the file to a server and get the URL
      // For this example, we'll use a placeholder
      setImage('https://via.placeholder.com/150');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {initialData ? 'Edit Pet' : 'Add a New Pet'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
            Pet Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="animal" className="block text-gray-700 font-medium mb-2">
            Animal Type
          </label>
          <select
            id="animal"
            value={animal}
            onChange={(e) => setAnimal(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select animal type</option>
            {animalTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="breed" className="block text-gray-700 font-medium mb-2">
            Breed
          </label>
          <select
            id="breed"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            required
            disabled={!animal}
          >
            <option value="">Select breed</option>
            {availableBreeds.map((breed) => (
              <option key={breed} value={breed}>
                {breed}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label htmlFor="image" className="block text-gray-700 font-medium mb-2">
            Pet Photo
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {image && (
            <div className="mt-2">
              <img src={image} alt="Preview" className="h-32 w-32 object-cover rounded-md" />
            </div>
          )}
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? 'Saving...' : initialData ? 'Update Pet' : 'Add Pet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PetForm; 