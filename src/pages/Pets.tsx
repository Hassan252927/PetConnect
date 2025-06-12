import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { fetchUserPets, Pet } from '../store/petSlice';
import Layout from '../components/layout/Layout';
import PetCard from '../components/pet/PetCard';
import PetForm from '../components/pet/PetForm';
import SearchBar from '../components/search/SearchBar';
import FilterPanel, { FilterOptions } from '../components/search/FilterPanel';

const Pets: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { currentUser } = useAppSelector((state) => state.user);
  const { pets, isLoading, error } = useAppSelector((state) => state.pet);
  
  const [showAddPet, setShowAddPet] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    animalType: '',
    breed: '',
    age: '',
    size: '',
    gender: '',
    location: ''
  });
  
  // Filtered pets
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchUserPets(currentUser._id));
    } else {
      navigate('/login');
    }
  }, [dispatch, currentUser, navigate]);
  
  // Apply filters and search to pets
  useEffect(() => {
    let filtered = [...pets];
    
    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(pet => 
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.animal.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply animal type filter
    if (activeFilters.animalType) {
      filtered = filtered.filter(pet => pet.animal === activeFilters.animalType);
    }
    
    // Apply breed filter
    if (activeFilters.breed) {
      filtered = filtered.filter(pet => pet.breed === activeFilters.breed);
    }
    
    // Apply age filter
    if (activeFilters.age && activeFilters.age !== '') {
      // Convert string age to number for comparison
      const ageNum = parseInt(activeFilters.age, 10);
      if (!isNaN(ageNum)) {
        filtered = filtered.filter(pet => pet.age === ageNum);
      }
    }
    
    // Apply gender filter (if available in pet data)
    if (activeFilters.gender) {
      filtered = filtered.filter(pet => pet.gender === activeFilters.gender);
    }
    
    setFilteredPets(filtered);
  }, [pets, searchQuery, activeFilters]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleApplyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    setShowFilters(false);
  };
  
  return (
    <Layout>
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Your Pets</h1>
        <button
          onClick={() => setShowAddPet(!showAddPet)}
          className="btn-primary"
        >
          {showAddPet ? 'Cancel' : 'Add New Pet'}
        </button>
      </div>
      
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:flex-grow">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search by name, breed, or animal type..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full md:w-auto whitespace-nowrap px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {Object.values(activeFilters).some(val => val !== '') && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-primary text-white text-xs rounded-full">
                ✓
              </span>
            )}
          </button>
        </div>
        {showFilters && (
          <div className="mt-4">
            <FilterPanel onApplyFilters={handleApplyFilters} initialFilters={activeFilters} />
          </div>
        )}
      </div>
      
      {showAddPet && (
        <div className="mb-8">
          <PetForm onSuccess={() => setShowAddPet(false)} onCancel={() => setShowAddPet(false)} />
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading pets...</div>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-md">
          {error}
        </div>
      ) : filteredPets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            {searchQuery || Object.values(activeFilters).some(val => val !== '')
              ? "No pets match your search criteria"
              : "No pets added yet!"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {searchQuery || Object.values(activeFilters).some(val => val !== '')
              ? "Try adjusting your filters or search query"
              : "Add your furry, feathery, or scaly friends to share their moments with the community."}
          </p>
          {!searchQuery && !Object.values(activeFilters).some(val => val !== '') && (
          <button
            onClick={() => setShowAddPet(true)}
            className="btn-primary"
          >
            Add Your First Pet
          </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPets.map((pet) => (
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