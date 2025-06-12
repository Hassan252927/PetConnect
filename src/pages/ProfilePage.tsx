import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { getUserById, updateUser, User, UpdateUserRequest } from '../services/userService';
import { updateUserProfile } from '../store/userSlice';
import Layout from '../components/layout/Layout';

// Extended user interface that includes bio
interface ExtendedUser extends User {
  bio?: string;
  pets: any[]; // Change to any[] to accept complex objects
  savedPosts: any[]; // Change to any[] to accept complex objects
}

// Mock data for pets
const mockPets = [
  {
    _id: 'pet1',
    name: 'Buddy',
    breed: 'Golden Retriever',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
  {
    _id: 'pet2',
    name: 'Whiskers',
    breed: 'Persian Cat',
    image: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  },
];

// Mock data for posts
const mockPosts = [
  {
    _id: 'post1',
    media: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    caption: 'Weekend adventure with my best friend!',
    username: 'petlover123',
  },
  {
    _id: 'post2',
    media: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    caption: 'Just a lazy day at home.',
    username: 'animalfriend',
  },
];

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<UpdateUserRequest>({
    username: '',
    email: '',
    bio: '',
    profilePic: ''
  });

  const isOwnProfile = currentUser && id === currentUser._id;

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        // For development, use mock data if no API is available
        let userData: User;
        
        try {
          // Try to fetch from API
          userData = await getUserById(id || '');
        } catch (apiError) {
          console.log('API not available, using mock data');
          // Fall back to mock data or current user
          if (isOwnProfile && currentUser) {
            userData = currentUser;
          } else {
            // Mock user data
            userData = {
              _id: id || '1',
              username: 'sampleuser',
              email: 'user@example.com',
              profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
              savedPosts: [],
              pets: [],
            };
          }
        }
        
        // Cast to ExtendedUser and set default values
        const extendedUser: ExtendedUser = {
          ...userData,
          bio: 'Pet lover and animal enthusiast. I enjoy long walks with my dog and taking photos of wildlife.',
        };

        // Add mock data for development
        extendedUser.pets = mockPets;
        extendedUser.savedPosts = mockPosts;
        
        setUser(extendedUser);
        setFormData({
          username: userData.username,
          email: userData.email,
          bio: extendedUser.bio || '',
          profilePic: userData.profilePic || ''
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id, currentUser, isOwnProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let updatedUser;
      
      try {
        // Try to update via API
        updatedUser = await updateUser(formData);
      } catch (apiError) {
        console.log('API not available, using mock update');
        // Mock update for development
        updatedUser = {
          ...user!,
          ...formData
        };
        
        // If it's the current user, update the Redux store
        if (isOwnProfile) {
          dispatch(updateUserProfile(formData));
        }
      }
      
      // Update the local user state, maintaining the bio from the form
      setUser({
        ...updatedUser,
        bio: formData.bio
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update profile');
    }
  };

  if (isLoading) {
    return <Layout><div className="flex justify-center items-center h-screen">Loading...</div></Layout>;
  }

  if (error) {
    return <Layout><div className="flex justify-center items-center h-screen text-red-500">{error}</div></Layout>;
  }

  if (!user) {
    return <Layout><div className="flex justify-center items-center h-screen">User not found</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          {!isEditing ? (
            <div>
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={user.profilePic || 'https://via.placeholder.com/150'}
                  alt={user.username}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">{user.bio || 'No bio yet'}</p>
              
              {isOwnProfile && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Edit Profile
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Picture URL</label>
                <input
                  type="text"
                  name="profilePic"
                  value={formData.profilePic}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Pets</h2>
            {user.pets.length === 0 ? (
              <p className="text-gray-500">No pets added yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.pets.map((pet: any) => (
                  <div
                    key={pet._id}
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md"
                    onClick={() => navigate(`/pets/${pet._id}`)}
                  >
                    <img
                      src={pet.image || 'https://via.placeholder.com/150'}
                      alt={pet.name}
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <h3 className="font-semibold">{pet.name}</h3>
                    <p className="text-sm text-gray-600">{pet.breed}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Saved Posts</h2>
            {user.savedPosts.length === 0 ? (
              <p className="text-gray-500">No saved posts yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.savedPosts.map((post: any) => (
                  <div
                    key={post._id}
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md"
                    onClick={() => navigate(`/posts/${post._id}`)}
                  >
                    <img
                      src={post.media || 'https://via.placeholder.com/150'}
                      alt="Post"
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <h3 className="font-semibold">{post.caption?.substring(0, 30) || 'No caption'}</h3>
                    <p className="text-sm text-gray-600">Posted by {post.username}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage; 