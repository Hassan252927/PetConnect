import React from 'react';
import { Link } from 'react-router-dom';
import { Pet } from '../../store/petSlice';

interface PetCardProps {
  pet: Pet;
  onClick?: () => void;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onClick }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="relative pb-3/4">
        <img
          src={pet.image}
          alt={pet.name}
          className="absolute h-full w-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{pet.name}</h3>
        <div className="mt-2 flex items-center text-gray-600 text-sm">
          <span className="mr-2">{pet.animal}</span>
          <span>•</span>
          <span className="ml-2">{pet.breed}</span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <Link
            to={`/pets/${pet._id}`}
            className="text-primary hover:text-opacity-80"
            onClick={(e) => e.stopPropagation()}
          >
            View Profile
          </Link>
          <span className="text-gray-500 text-sm">
            {pet.description ? 'Has description' : 'No description'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PetCard; 