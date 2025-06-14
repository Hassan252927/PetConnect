import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/useRedux';
import { getUserById, User, UpdateUserRequest, checkUsernameAvailability } from '../services/userService';
import { updateProfile } from '../store/userSlice';
import { fetchUserPosts, deletePost } from '../store/postSlice';
import Layout from '../components/layout/Layout';
import ProfilePictureUpload from '../components/common/ProfilePictureUpload';
import { uploadImage } from '../services/uploadService';

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { userPosts, isLoading: postsLoading } = useAppSelector((state) => state.post);
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<UpdateUserRequest>({
    username: '',
    email: '',
    bio: '',
    profilePic: ''
  });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Username validation state
  const [usernameValidation, setUsernameValidation] = useState<{
    isChecking: boolean;
    isValid: boolean;
    message: string;
    hasChanged: boolean;
  }>({
    isChecking: false,
    isValid: true,
    message: '',
    hasChanged: false
  });

  const isOwnProfile = currentUser && id === currentUser._id;

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) {
        setError('User ID is required');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      
      try {
        const userData = await getUserById(id);
        setUser(userData);
        setFormData({
          username: userData.username,
          email: userData.email,
          bio: userData.bio || '',
          profilePic: userData.profilePic || ''
        });

        // Fetch user posts
        dispatch(fetchUserPosts(id));
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to load user profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, dispatch]);

  // Sync local user state with Redux currentUser when it changes
  useEffect(() => {
    if (isOwnProfile && currentUser && user && currentUser.profilePic !== user.profilePic) {
      //('Syncing profile picture from Redux store');
      setUser(prev => prev ? { ...prev, profilePic: currentUser.profilePic } : null);
      setFormData(prev => ({ ...prev, profilePic: currentUser.profilePic }));
    }
  }, [currentUser?.profilePic, isOwnProfile, user?.profilePic, currentUser, user]);

  // Debounced username validation
  useEffect(() => {
    const validateUsername = async () => {
      if (!formData.username || !user || formData.username === user.username) {
        setUsernameValidation({
          isChecking: false,
          isValid: true,
          message: '',
          hasChanged: false
        });
        return;
      }

      setUsernameValidation(prev => ({ ...prev, isChecking: true, hasChanged: true }));

      try {
        const result = await checkUsernameAvailability(formData.username, user._id);
        setUsernameValidation({
          isChecking: false,
          isValid: result.available,
          message: result.message,
          hasChanged: true
        });
      } catch (error) {
        setUsernameValidation({
          isChecking: false,
          isValid: false,
          message: 'Error checking username availability',
          hasChanged: true
        });
      }
    };

    const timeoutId = setTimeout(validateUsername, 500); // Debounce for 500ms
    return () => clearTimeout(timeoutId);
  }, [formData.username, user?._id, user?.username]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !isOwnProfile) {
      setError('You can only edit your own profile');
      return;
    }

    // Check username validation before submitting
    if (usernameValidation.hasChanged && !usernameValidation.isValid) {
      setError('Please fix the username error before saving');
      return;
    }

    // Don't submit while username is being checked
    if (usernameValidation.isChecking) {
      setError('Please wait while we check username availability');
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    setError('');
    
    try {
      let finalProfilePic = formData.profilePic;
      
      // If we have a new profile image file, upload it
      if (profileImageFile) {
        try {
          finalProfilePic = await uploadImage(profileImageFile, 'profile');
          console.log('Upload successful, received URL:', finalProfilePic);
        } catch (error) {
          setUploadError('Failed to upload profile picture. Please try again.');
          setIsUploading(false);
          return;
        }
      }
      
      const updatedFormData = {
        username: formData.username,
        email: formData.email,
        bio: formData.bio,
        profilePic: finalProfilePic
      };
      
      console.log('Updating profile with data:', updatedFormData);
      
      const result = await dispatch(updateProfile({ 
        userID: currentUser._id, 
        userData: updatedFormData 
      })).unwrap();
      
      console.log('Profile update result:', result);
      
      setUser(result);
      setProfileImageFile(null);
      setIsEditing(false);
      
      // Reset username validation state
      setUsernameValidation({
        isChecking: false,
        isValid: true,
        message: '',
        hasChanged: false
      });
      
    } catch (error: any) {
      console.error('Error updating user:', error);
      
      // Handle specific username error
      if (error.message && error.message.includes('Username is already taken')) {
        setUsernameValidation({
          isChecking: false,
          isValid: false,
          message: 'Username is already taken. Please choose a different username.',
          hasChanged: true
        });
        setError('Username is already taken. Please choose a different username.');
      } else {
        setError(error.message || 'Failed to update profile');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfileImageSelected = (file: File, previewUrl: string) => {
    setProfileImageFile(file);
    setFormData(prev => ({
      ...prev,
      profilePic: previewUrl
    }));
    setUploadError('');
  };

  const handleDeletePost = async (postID: string) => {
    if (!currentUser) return;
    
    const confirmDelete = window.confirm('Are you sure you want to delete this post? This action cannot be undone.');
    if (!confirmDelete) return;
    
    try {
      await dispatch(deletePost(postID)).unwrap();
    } catch (error: any) {
      console.error('Error deleting post:', error);
      setError(error.message || 'Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-gray-500">Loading profile...</span>
        </div>
      </Layout>
    );
  }

  if (error && !user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="text-5xl mb-4">😞</div>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="text-center">
            <div className="text-5xl mb-4">👤</div>
            <p className="text-gray-500">User not found</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {!isEditing ? (
            <div>
              <div className="flex items-center space-x-4 mb-6">
                {user.profilePic && (
                  <img
                    src={user.profilePic}
                    alt={user.username}
                    className="w-24 h-24 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold">{user.username}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              
              {user.bio && (
                <p className="text-gray-700 mb-6">{user.bio}</p>
              )}
              
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
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 pr-10 ${
                      usernameValidation.hasChanged
                        ? usernameValidation.isValid
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-red-300 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Enter username"
                  />
                  {/* Validation indicator */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {usernameValidation.isChecking ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : usernameValidation.hasChanged ? (
                      usernameValidation.isValid ? (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )
                    ) : null}
                  </div>
                </div>
                {/* Validation message */}
                {usernameValidation.hasChanged && usernameValidation.message && (
                  <p className={`mt-1 text-sm ${
                    usernameValidation.isValid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {usernameValidation.message}
                  </p>
                )}
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
                <label className="block text-sm font-medium text-gray-700 mb-4">Profile Picture</label>
                <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                  <ProfilePictureUpload
                    key="profile-picture-upload"
                    onImageSelected={handleProfileImageSelected}
                    currentImage={formData.profilePic}
                    size="large"
                    isUploading={isUploading}
                  />
                </div>
                {uploadError && (
                  <p className="mt-2 text-sm text-red-600 text-center">{uploadError}</p>
                )}
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isUploading}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* My Posts Section */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">
              {isOwnProfile ? 'My Posts' : `${user.username}'s Posts`}
            </h2>
            {postsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-500">Loading posts...</span>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">📸</div>
                <p className="text-gray-500 mb-4">
                  {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Create Your First Post
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userPosts.map((post: any) => (
                  <div
                    key={post._id}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Post Image */}
                    <div className="relative aspect-square">
                      {post.media && (
                        <img
                          src={post.media}
                          alt={post.caption}
                          className="w-full h-full object-cover cursor-pointer"
                          onClick={() => navigate(`/posts/${post._id}`)}
                        />
                      )}
                      {/* Post Actions Overlay */}
                      {isOwnProfile && (
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/posts/${post._id}/edit`);
                            }}
                            className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
                            title="Edit post"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePost(post._id);
                            }}
                            className="p-2 bg-white/80 hover:bg-white rounded-full shadow-md transition-colors"
                            title="Delete post"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                      {/* Post Stats Overlay */}
                      <div className="absolute bottom-2 left-2 flex items-center space-x-3 text-white text-sm">
                        <div className="flex items-center space-x-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span>{post.likes?.length || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>{post.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Post Info */}
                    <div className="p-4">
                      {post.caption && (
                        <p 
                          className="text-gray-800 dark:text-white text-sm line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => navigate(`/posts/${post._id}`)}
                        >
                          {post.caption}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{new Date(post.createdAt || post.timestamp).toLocaleDateString()}</span>
                        {post.petName && (
                          <span className="text-primary">with {post.petName}</span>
                        )}
                      </div>
                    </div>
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