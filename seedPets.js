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
    //('✅ MongoDB connected for seeding');

    const petsToSeed = [
      {
        _id: '674c38a66e0a72eb81a6d620', // Valid 24-character ObjectId
        userID: '684c38a66e0a72eb81a6d61d', // testuser1 from seedUsers.js
        name: 'Buddy',
        animal: 'Dog',
        breed: 'Labrador',
        image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
      {
        _id: '674c38a66e0a72eb81a6d621', // Valid 24-character ObjectId
        userID: '684c38a66e0a72eb81a6d61d', // testuser1 from seedUsers.js
        name: 'Max',
        animal: 'Dog',
        breed: 'Golden Retriever',
        image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
      {
        _id: '674c38a66e0a72eb81a6d622', // Valid 24-character ObjectId
        userID: '684c38a66e0a72eb81a6d61f', // testuser2 from seedUsers.js
        name: 'Whiskers',
        animal: 'Cat',
        breed: 'Siamese',
        image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60'
      },
    ];

    // Remove existing pets with these IDs to prevent duplication errors
    await Pet.deleteMany({ _id: { $in: petsToSeed.map(p => p._id) } });
    //('Existing pets with specified IDs removed.');

    const insertedPets = await Pet.insertMany(petsToSeed);
    //(`Successfully seeded ${insertedPets.length} pets.`);

  } catch (err) {
    console.error('❌ Error seeding pets:', err);
  } finally {
    await mongoose.disconnect();
    //('Disconnected from MongoDB.');
  }
};

seedPets(); 