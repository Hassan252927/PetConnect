const mongoose = require('mongoose');
const Pet = require('./backend/models/pet'); // Adjust path as needed
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petconnect';

const seedPets = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for seeding');

    const petsToSeed = [
      {
        _id: '684aed0c424a48b470f5cf5b',
        userID: '6520b72a4e9b7a4c8a2b8e0b', // Replace with a valid existing user ID from your database
        name: 'Buddy',
        animal: 'Dog',
        breed: 'Labrador',
        image: 'https://example.com/buddy.jpg' // Replace with a real image URL or placeholder
      },
      {
        _id: '6520b72a4e9b7a4c8a2b8e0c', // Corrected to a valid 24-character ObjectId
        userID: '6520b72a4e9b7a4c8a2b8e0b', // Replace with a valid existing user ID from your database
        name: 'Whiskers',
        animal: 'Cat',
        breed: 'Siamese',
        image: 'https://example.com/whiskers.jpg' // Replace with a real image URL or placeholder
      },
    ];

    // Remove existing pets with these IDs to prevent duplication errors
    await Pet.deleteMany({ _id: { $in: petsToSeed.map(p => p._id) } });
    console.log('Existing pets with specified IDs removed.');

    const insertedPets = await Pet.insertMany(petsToSeed);
    console.log(`Successfully seeded ${insertedPets.length} pets.`);

  } catch (err) {
    console.error('❌ Error seeding pets:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seedPets(); 