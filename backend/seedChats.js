const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./models/user');
const Chat = require('./models/chat');
const Message = require('./models/message');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petconnect';

const seedChats = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected for seeding');

    // Clear existing chats and messages (optional, for a clean seed)
    await Chat.deleteMany({});
    await Message.deleteMany({});
    console.log('Cleared existing chats and messages.');

    // IMPORTANT: Replace these with actual user IDs from your database
    // If you don't have users, you might need to create them first or seed them.
    const user1Id = new mongoose.Types.ObjectId('684aed0c424a48b470f5cf59'); // User ID from the provided image
    const user2Id = new mongoose.Types.ObjectId('684c2e1fd172bf27bcbd4871'); // One of the previously generated test user IDs

    // You might want to verify these users exist or create them:
    // const user1 = await User.findById(user1Id);
    // const user2 = await User.findById(user2Id);
    // if (!user1 || !user2) {
    //   console.error('One or both placeholder users not found. Please ensure they exist.');
    //   console.log('Creating dummy users for seeding purposes...');
    //   const dummyUser1 = await User.create({ username: 'ChatUser1', email: 'chat1@example.com', password: 'password123' });
    //   const dummyUser2 = await User.create({ username: 'ChatUser2', email: 'chat2@example.com', password: 'password123' });
    //   user1Id = dummyUser1._id;
    //   user2Id = dummyUser2._id;
    //   console.log('Dummy users created.');
    // }

    // Create a new chat
    let chat = new Chat({
      participants: [user1Id, user2Id],
      messages: [], // Messages will be added as separate documents
      unreadCount: 0,
      lastMessage: null,
    });
    chat = await chat.save();
    console.log(`Created chat with ID: ${chat._id}`);

    // Create messages for the chat
    const message1 = new Message({
      senderID: user1Id,
      receiverID: user2Id,
      content: 'Hey! How are you?',
      timestamp: new Date(Date.now() - 60000),
      isRead: true,
    });
    await message1.save();

    const message2 = new Message({
      senderID: user2Id,
      receiverID: user1Id,
      content: "I'm good, thanks! How about you?",
      timestamp: new Date(Date.now() - 30000),
      isRead: false,
    });
    await message2.save();

    const message3 = new Message({
      senderID: user1Id,
      receiverID: user2Id,
      content: "I'm doing great! Just wanted to chat.",
      timestamp: new Date(),
      isRead: false,
    });
    await message3.save();

    // Update the chat with the latest message and unread count
    chat.lastMessage = message3._id; // Store reference to the last message
    chat.unreadCount = 1; // Assuming message3 is unread by user2
    await chat.save();
    console.log('Messages added and chat updated.');

    console.log('Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

seedChats(); 