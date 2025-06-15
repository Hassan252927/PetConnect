import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { createPost, fetchFeedPosts } from '../../store/postSlice';
import { Pet, createPet } from '../../store/petSlice';
import ImageUpload from '../common/ImageUpload';
import { uploadImage } from '../../services/uploadService';

interface PostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PostForm: React.FC<PostFormProps> = ({ onSuccess, onCancel }) => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { pets } = useAppSelector((state) => state.pet);
  const { isLoading: isPostLoading, error: postError } = useAppSelector((state) => state.post);
  
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [petImage, setPetImage] = useState<string>('');
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [createPetMode, setCreatePetMode] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetAnimal, setNewPetAnimal] = useState('');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetImageFile, setNewPetImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // ... existing code ...
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to create a post');
      return;
    }
    
    if (!selectedPet) {
      setError('Please select a pet for your post');
      return;
    }
    
    if (!caption.trim()) {
      setError('Please add a caption to your post');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError('');
      setError(null);
      
      let finalMediaUrl = media;
      
      // If we have a new media file, upload it
      if (mediaFile) {
        try {
                  finalMediaUrl = await uploadImage(mediaFile, 'post');
        } catch (error) {
          setUploadError('Failed to upload media. Please try again.');
          setIsUploading(false);
          return;
        }
      }
      
      // Ensure the payload consistently uses 'profilePic'
      const postData = {
        userID: currentUser._id,
        username: currentUser.username,
        profilePic: currentUser.profilePic,
        petID: selectedPet._id,
        petName: selectedPet.name,
        media: finalMediaUrl || '',
        caption: caption.trim(),
        tags: [selectedPet.animal.toLowerCase(), selectedPet.breed.toLowerCase(), 'pet']
      };
      
      // Log the payload for debugging
      //('Creating post with data:', postData);
      
      // Create the post
      await dispatch(createPost(postData)).unwrap();
      
      // Fetch updated feed posts after successful creation
      await dispatch(fetchFeedPosts({ userID: currentUser._id, pets: [] }));
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Failed to create post:', error);
      
      // Handle specific error cases
      if (error.errors) {
        // Handle validation errors from the backend
        const errorMessages = Object.entries(error.errors as Record<string, string[]>)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('\n');
        setError(errorMessages);
      } else if (error.details) {
        // Show detailed error message from backend
        setError(`${error.message}\n${error.details}`);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to create post. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleMediaSelected = (file: File, previewUrl: string) => {
    setMediaFile(file);
    setMedia(previewUrl);
    setUploadError('');
  };
  
  const handlePetImageSelected = (file: File, previewUrl: string) => {
    setNewPetImageFile(file);
    setPetImage(previewUrl);
  };
  
  // List of animal types for the dropdown
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
    Other: ['Other'],
  };
  
  // Get breeds based on selected animal
  const getBreeds = (animal: string) => {
    return breedsByAnimal[animal] || ['Other'];
  };
  
  const handleAddNewPet = async () => {
    if (!currentUser) return;
    
    try {
      setIsUploading(true);
      
      let petImageUrl = '';
      
      // If we have a new image file, upload it
      if (newPetImageFile) {
        try {
          petImageUrl = await uploadImage(newPetImageFile, 'pet');
        } catch (error) {
          setUploadError('Failed to upload pet image. Please try again.');
          setIsUploading(false);
          return;
        }
      }
      
      const petData = {
        ownerID: currentUser._id,
        name: newPetName,
        animal: newPetAnimal,
        breed: newPetBreed,
        image: petImageUrl,
        description: '',
      };
      
      const newPet = await dispatch(createPet(petData)).unwrap();
      setSelectedPet(newPet);
      setCreatePetMode(false);
    } catch (error) {
      console.error('Failed to add pet', error);
      setUploadError('Failed to add pet. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create a Post</h2>
      
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
            {error}
          </div>
        )}
        
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600">
            {uploadError}
          </div>
        )}
        
        {!createPetMode ? (
          <div className="mb-4">
            <label htmlFor="pet" className="block text-gray-700 font-medium mb-2">
              Select Pet
            </label>
            <div className="flex items-center space-x-2">
              <select
                id="pet"
                value={selectedPet?._id || ''}
                onChange={(e) => {
                  const pet = pets.find((p: Pet) => p._id === e.target.value);
                  setSelectedPet(pet || null);
                }}
                className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required={!createPetMode}
              >
                <option value="">Select a pet</option>
                {pets.map((pet: Pet) => (
                  <option key={pet._id} value={pet._id}>
                    {pet.name} ({pet.animal} - {pet.breed})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCreatePetMode(true)}
                className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-opacity-90"
              >
                Add New Pet
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Add New Pet</h3>
              <button
                type="button"
                onClick={() => setCreatePetMode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="petName" className="block text-gray-700 font-medium mb-2">
                  Pet Name
                </label>
                <input
                  type="text"
                  id="petName"
                  value={newPetName}
                  onChange={(e) => setNewPetName(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required={createPetMode}
                />
              </div>
              
              <div>
                <label htmlFor="animal" className="block text-gray-700 font-medium mb-2">
                  Animal Type
                </label>
                <select
                  id="animal"
                  value={newPetAnimal}
                  onChange={(e) => {
                    setNewPetAnimal(e.target.value);
                    setNewPetBreed('');
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required={createPetMode}
                >
                  <option value="">Select animal type</option>
                  {animalTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="breed" className="block text-gray-700 font-medium mb-2">
                  Breed
                </label>
                <select
                  id="breed"
                  value={newPetBreed}
                  onChange={(e) => setNewPetBreed(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  required={createPetMode}
                  disabled={!newPetAnimal}
                >
                  <option value="">Select breed</option>
                  {newPetAnimal &&
                    getBreeds(newPetAnimal).map((breed) => (
                      <option key={breed} value={breed}>
                        {breed}
                      </option>
                    ))}
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Pet Photo
                </label>
                <ImageUpload
                  onImageSelected={handlePetImageSelected}
                  label="Upload Pet Photo"
                />
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAddNewPet}
              disabled={!newPetName || !newPetAnimal || !newPetBreed || isUploading}
              className="mt-4 btn-secondary"
            >
              {isUploading ? 'Adding...' : 'Add Pet'}
            </button>
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Photo/Video
          </label>
          <ImageUpload
            onImageSelected={handleMediaSelected}
            label="Upload Photo/Video"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="caption" className="block text-gray-700 font-medium mb-2">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Write a caption..."
            required
          ></textarea>
        </div>
        
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
            disabled={isPostLoading || isUploading || !selectedPet || !media || !caption.trim()}
            className="btn-primary"
          >
            {isPostLoading || isUploading ? 'Posting...' : 'Share Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm; 



