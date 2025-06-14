const mongoose = require('mongoose');
const Message = require('./models/message');
const User = require('./models/user');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petconnect';

async function seedMessages() {
  try {
    await mongoose.connect(MONGO_URI);
    //('Connected to MongoDB');

    // Get the test users
    const user1 = await User.findOne({ username: 'testuser1' });
    const user2 = await User.findOne({ username: 'testuser2' });

    if (!user1 || !user2) {
      console.error('Test users not found. Please run seedUsers.js first.');
      process.exit(1);
    }

    // Clear existing messages
    await Message.deleteMany({});

    // Create test messages
    const messages = [
      {
        senderID: user1._id,
        receiverID: user2._id,
        content: 'Hey there! How are you?',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        isRead: true
      },
      {
        senderID: user2._id,
        receiverID: user1._id,
        content: 'Hi! I\'m good, thanks for asking. How about you?',
        timestamp: new Date(Date.now() - 3500000), // 58 minutes ago
        isRead: true
      },
      {
        senderID: user1._id,
        receiverID: user2._id,
        content: 'I\'m doing great! Just wanted to chat about pets.',
        timestamp: new Date(Date.now() - 3400000), // 56 minutes ago
        isRead: true
      },
      {
        senderID: user2._id,
        receiverID: user1._id,
        content: 'Sure! I love talking about pets. What kind do you have?',
        timestamp: new Date(Date.now() - 3300000), // 55 minutes ago
        isRead: false
      }
    ];

    await Message.insertMany(messages);
    //('Test messages seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding messages:', error);
    process.exit(1);
  }
}

seedMessages(); 