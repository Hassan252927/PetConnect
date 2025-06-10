import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { createPet, Pet } from '../../store/petSlice';
import ImageUpload from '../common/ImageUpload';
import { simulateImageUpload } from '../../services/uploadService';

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
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
      setIsUploading(true);
      setUploadError('');
      
      let finalImageUrl = image;
      
      // If we have a new image file, upload it
      if (imageFile) {
        try {
          // In a real app, use uploadImage instead of simulateImageUpload
          finalImageUrl = await simulateImageUpload(imageFile);
        } catch (error) {
          setUploadError('Failed to upload image. Please try again.');
          setIsUploading(false);
          return;
        }
      }
      
      const petData = {
        userID: currentUser._id,
        name,
        animal,
        breed,
        image: finalImageUrl || 'https://via.placeholder.com/150',
      };
      
      const resultAction = await dispatch(createPet(petData)).unwrap();
      
      if (onSuccess) {
        onSuccess(resultAction);
      }
    } catch (error) {
      console.error('Failed to create pet', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelected = (file: File, previewUrl: string) => {
    setImageFile(file);
    setImage(previewUrl);
    setUploadError('');
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
          <label className="block text-gray-700 font-medium mb-2">
            Pet Photo
          </label>
          <ImageUpload 
            onImageSelected={handleImageSelected} 
            currentImage={image}
            label="Upload Pet Photo"
          />
          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
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
            disabled={isLoading || isUploading}
            className="btn-primary"
          >
            {isLoading || isUploading ? 'Saving...' : initialData ? 'Update Pet' : 'Add Pet'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PetForm; 