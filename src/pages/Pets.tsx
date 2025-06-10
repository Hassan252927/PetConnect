import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchUserPets } from '../store/petSlice';
import Layout from '../components/layout/Layout';
import PetCard from '../components/pet/PetCard';
import PetForm from '../components/pet/PetForm';

const Pets: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.user);
  const { pets, isLoading, error } = useAppSelector((state) => state.pet);
  
  const [showAddPet, setShowAddPet] = useState(false);
  
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchUserPets(currentUser._id));
    } else {
      navigate('/login');
    }
  }, [dispatch, currentUser, navigate]);
  
  return (
    <Layout>
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Your Pets</h1>
        <button
          onClick={() => setShowAddPet(!showAddPet)}
          className="btn-primary"
        >
          {showAddPet ? 'Cancel' : 'Add New Pet'}
        </button>
      </div>
      
      {showAddPet && (
        <div className="mb-8">
          <PetForm onSuccess={() => setShowAddPet(false)} onCancel={() => setShowAddPet(false)} />
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading pets...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      ) : pets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No pets added yet!</h3>
          <p className="text-gray-600 mb-6">
            Add your furry, feathery, or scaly friends to share their moments with the community.
          </p>
          <button
            onClick={() => setShowAddPet(true)}
            className="btn-primary"
          >
            Add Your First Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <PetCard
              key={pet._id}
              pet={pet}
              onClick={() => navigate(`/pets/${pet._id}`)}
            />
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Pets; 