const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/user');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petconnect';

const seedUsers = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    //('✅ MongoDB connected for user seeding');

    // Clear existing users (optional, for a clean seed)
    await User.deleteMany({});
    //('Cleared existing users.');

    // Create test users
    const passwordHash1 = await bcrypt.hash('password123', 10);
    const passwordHash2 = await bcrypt.hash('password123', 10);

    const user1 = new User({
      _id: '684c38a66e0a72eb81a6d61d',
      username: 'testuser1',
      email: 'test1@example.com',
      passwordHash: passwordHash1,
      profilePic: 'https://res.cloudinary.com/dvf40qifz/image/upload/v1709737070/default_profile_pic.png',
    });
    await user1.save();
    //(`Created user: ${user1.username} with ID: ${user1._id}`);

    const user2 = new User({
      _id: '684c38a66e0a72eb81a6d61f',
      username: 'testuser2',
      email: 'test2@example.com',
      passwordHash: passwordHash2,
      profilePic: 'https://res.cloudinary.com/dvf40qifz/image/upload/v1709737070/default_profile_pic.png',
    });
    await user2.save();
    //(`Created user: ${user2.username} with ID: ${user2._id}`);

    //('User seeding complete!');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    //('MongoDB disconnected.');
  }
};

seedUsers(); 