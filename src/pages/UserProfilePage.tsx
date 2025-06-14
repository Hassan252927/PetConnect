import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  pets: {
    _id: string;
    name: string;
    breed: string;
    image: string;
  }[];
  savedPosts: {
    _id: string;
    title: string;
    content: string;
    image: string;
    timestamp: string;
  }[];
}

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${id}`);
        setUser(response.data);
      } catch (error) {
        setError('Error fetching user profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">User not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-6">
            {user.profilePicture && (
              <img
                src={user.profilePicture}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
              {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Pets</h2>
            {user.pets.length === 0 ? (
              <p className="text-gray-500">No pets yet</p>
            ) : (
              <div className="space-y-4">
                {user.pets.map((pet) => (
                  <div
                    key={pet._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/pets/${pet._id}`)}
                  >
                    {pet.image && (
                      <div className="relative h-48">
                        <img
                          src={pet.image}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{pet.name}</h3>
                      <p className="text-gray-600">{pet.breed}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
            {user.savedPosts.length === 0 ? (
              <p className="text-gray-500">No posts yet</p>
            ) : (
              <div className="space-y-4">
                {user.savedPosts.map((post) => (
                  <div
                    key={post._id}
                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => navigate(`/posts/${post._id}`)}
                  >
                    <div className="relative h-48">
                      <img
                        src={post.image || 'https://via.placeholder.com/400x300'}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{post.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {new Date(post.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 mt-2">
                        {post.content.substring(0, 100)}...
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage; 