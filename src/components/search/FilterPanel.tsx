import React, { useState } from 'react';

export interface FilterOptions {
  animalType: string;
  breed: string;
  age: string;
  size: string;
  gender: string;
  location: string;
}

interface FilterPanelProps {
  onApplyFilters: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  onApplyFilters,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    animalType: initialFilters.animalType || '',
    breed: initialFilters.breed || '',
    age: initialFilters.age || '',
    size: initialFilters.size || '',
    gender: initialFilters.gender || '',
    location: initialFilters.location || ''
  });

  const [expandedSections, setExpandedSections] = useState({
    animalType: true,
    breed: false,
    characteristics: false,
    location: false
  });

  // Pre-defined options for select inputs
  const animalTypes = ['Dog', 'Cat', 'Bird', 'Fish', 'Small & Furry', 'Reptile', 'Horse', 'Barnyard'];
  
  const breedOptions = {
    'Dog': ['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'French Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier', 'Boxer', 'Dachshund'],
    'Cat': ['Domestic Shorthair', 'Maine Coon', 'Persian', 'Siamese', 'Ragdoll', 'Bengal', 'Sphynx', 'British Shorthair', 'Abyssinian', 'Scottish Fold'],
    'Bird': ['Parakeet', 'Cockatiel', 'Canary', 'Lovebird', 'Finch', 'Macaw', 'Conure', 'African Grey', 'Cockatoo', 'Dove'],
    'Fish': ['Goldfish', 'Betta', 'Guppy', 'Tetra', 'Angelfish', 'Molly', 'Discus', 'Platy', 'Cichlid', 'Catfish'],
    'Small & Furry': ['Hamster', 'Guinea Pig', 'Rabbit', 'Rat', 'Mouse', 'Ferret', 'Gerbil', 'Chinchilla', 'Hedgehog', 'Sugar Glider'],
    'Reptile': ['Bearded Dragon', 'Gecko', 'Snake', 'Turtle', 'Iguana', 'Chameleon', 'Tortoise', 'Boa', 'Ball Python', 'Corn Snake'],
    'Horse': ['Quarter Horse', 'Thoroughbred', 'Arabian', 'Appaloosa', 'Morgan', 'Andalusian', 'Friesian', 'Clydesdale', 'Paint', 'Shetland Pony'],
    'Barnyard': ['Pig', 'Goat', 'Sheep', 'Chicken', 'Duck', 'Cow', 'Donkey', 'Llama', 'Alpaca', 'Turkey']
  };
  
  const ageOptions = ['Baby', 'Young', 'Adult', 'Senior'];
  const sizeOptions = ['Small', 'Medium', 'Large', 'Extra Large'];
  const genderOptions = ['Male', 'Female'];

  const handleExpandSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    // If changing animal type, reset breed
    if (key === 'animalType') {
      setFilters({
        ...filters,
        [key]: value,
        breed: ''
      });
    } else {
      setFilters({
        ...filters,
        [key]: value
      });
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const handleResetFilters = () => {
    setFilters({
      animalType: '',
      breed: '',
      age: '',
      size: '',
      gender: '',
      location: ''
    });
  };

  // Get current breeds based on selected animal type
  const currentBreeds = filters.animalType ? breedOptions[filters.animalType as keyof typeof breedOptions] || [] : [];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Pets</h2>
      
      {/* Animal Type Section */}
      <div className="mb-4 border-b border-gray-200 pb-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => handleExpandSection('animalType')}>
          <h3 className="font-medium text-gray-700">Animal Type</h3>
          <div className={`transform transition-transform duration-300 ${expandedSections.animalType ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {expandedSections.animalType && (
          <div className="mt-3 grid grid-cols-2 gap-2 animate-fadeIn">
            {animalTypes.map(type => (
              <button
                key={type}
                onClick={() => handleFilterChange('animalType', type)}
                className={`px-3 py-2 rounded-md text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                  filters.animalType === type 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Breed Section */}
      <div className="mb-4 border-b border-gray-200 pb-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => handleExpandSection('breed')}>
          <h3 className="font-medium text-gray-700">Breed</h3>
          <div className={`transform transition-transform duration-300 ${expandedSections.breed ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {expandedSections.breed && (
          <div className="mt-3 animate-fadeIn">
            {filters.animalType ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                  {currentBreeds.map(breed => (
                    <button
                      key={breed}
                      onClick={() => handleFilterChange('breed', breed)}
                      className={`px-3 py-2 rounded-md text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                        filters.breed === breed 
                          ? 'bg-primary text-white' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {breed}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">Please select an animal type first</p>
            )}
          </div>
        )}
      </div>
      
      {/* Characteristics Section */}
      <div className="mb-4 border-b border-gray-200 pb-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => handleExpandSection('characteristics')}>
          <h3 className="font-medium text-gray-700">Characteristics</h3>
          <div className={`transform transition-transform duration-300 ${expandedSections.characteristics ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {expandedSections.characteristics && (
          <div className="mt-3 space-y-4 animate-fadeIn">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <div className="grid grid-cols-2 gap-2">
                {ageOptions.map(age => (
                  <button
                    key={age}
                    onClick={() => handleFilterChange('age', age)}
                    className={`px-3 py-2 rounded-md text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                      filters.age === age 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <div className="grid grid-cols-2 gap-2">
                {sizeOptions.map(size => (
                  <button
                    key={size}
                    onClick={() => handleFilterChange('size', size)}
                    className={`px-3 py-2 rounded-md text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                      filters.size === size 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <div className="grid grid-cols-2 gap-2">
                {genderOptions.map(gender => (
                  <button
                    key={gender}
                    onClick={() => handleFilterChange('gender', gender)}
                    className={`px-3 py-2 rounded-md text-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${
                      filters.gender === gender 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Location Section */}
      <div className="mb-4 border-b border-gray-200 pb-3">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => handleExpandSection('location')}>
          <h3 className="font-medium text-gray-700">Location</h3>
          <div className={`transform transition-transform duration-300 ${expandedSections.location ? 'rotate-180' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {expandedSections.location && (
          <div className="mt-3 animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code or City</label>
            <input
              type="text"
              placeholder="Enter zip code or city"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:shadow"
            />
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleResetFilters}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1 active:scale-95"
        >
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </span>
        </button>
        
        <button
          onClick={handleApplyFilters}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-1 active:scale-95"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel; 