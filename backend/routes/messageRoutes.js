const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const User = require('../models/user');
// const auth = require('../middleware/auth'); // REMOVED: auth middleware import is commented out and not needed for current testing

// Send a message
router.post('/send', /* auth, */ async (req, res) => {
  try {
    const { receiverID, content } = req.body;
    // For testing without auth, senderID must be explicitly sent from frontend or hardcoded here
    // For now, let's assume req.user._id is not available due to auth bypass
    // You might need to adjust your frontend to send senderID if auth is bypassed entirely
    const senderID = req.user ? req.user._id : '684aed0c424a48b470f5cf59'; // TEMP: Use a hardcoded senderID if auth is bypassed

    // Validate receiver exists
    const receiver = await User.findById(receiverID);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: 'Message content cannot exceed 500 characters' });
    }

    const message = new Message({
      senderID,
      receiverID,
      content: content.trim()
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get all messages for a user
router.get('/:userId', /* auth, */ async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log(`Received request for userId: ${userId}`); // Log received userId

    // First, verify the user exists
    const user = await User.findById(userId);
    if (!user) {
      console.log(`User with ID ${userId} not found in database.`); // Log if user is not found
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`Found user: ${user.username} with ID: ${user._id}`); // Log if user is found

    // Fetch messages with proper population
    const messages = await Message.find({
      $or: [{ senderID: userId }, { receiverID: userId }],
      isDeleted: false,
    })
      .sort({ timestamp: -1 })
      .populate('senderID', 'username profilePic')
      .populate('receiverID', 'username profilePic')
      .lean(); // Use lean() for better performance

    if (!messages || messages.length === 0) {
      return res.json([]); // Return empty array if no messages
    }

    const chatsMap = new Map();

    for (const message of messages) {
      // Ensure message has required populated fields
      if (!message.senderID || !message.receiverID) {
        console.warn('Skipping message due to missing sender or receiver:', message);
        continue;
      }

      const otherParticipantId = message.senderID._id.toString() === userId
        ? message.receiverID._id.toString()
        : message.senderID._id.toString();

      if (!chatsMap.has(otherParticipantId)) {
        const otherUser = message.senderID._id.toString() === userId
          ? message.receiverID
          : message.senderID;

        // Ensure otherUser has required fields
        if (!otherUser || !otherUser.username || !otherUser.profilePic) {
          console.warn('Skipping chat due to malformed otherUser:', otherUser);
          continue;
        }

        chatsMap.set(otherParticipantId, {
          _id: otherParticipantId,
          participants: [
            { 
              _id: user._id, 
              username: user.username, 
              profilePic: user.profilePic 
            },
            { 
              _id: otherUser._id, 
              username: otherUser.username, 
              profilePic: otherUser.profilePic 
            }
          ],
          messages: [],
          lastMessage: null,
          unreadCount: 0,
        });
      }

      const chat = chatsMap.get(otherParticipantId);
      if (!chat) continue; // Skip if chat wasn't created

      // Set last message
      if (!chat.lastMessage) {
        chat.lastMessage = {
          _id: message._id,
          senderID: message.senderID._id,
          receiverID: message.receiverID._id,
          content: message.content,
          timestamp: message.timestamp,
          isRead: message.isRead,
          isDeleted: message.isDeleted
        };
      }

      // Calculate unread count
      if (message.receiverID._id.toString() === userId && !message.isRead) {
        chat.unreadCount++;
      }
    }

    // Convert map values to an array of chats
    const chats = Array.from(chatsMap.values());

    console.log("Backend sending chats:", JSON.stringify(chats, null, 2));

    res.json(chats);
  } catch (error) {
    console.error('Error in GET /messages/:userId:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// Get conversation thread between two users
router.get('/thread/:user1/:user2', /* auth, */ async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    // Verify user is part of the conversation (skip check if auth is bypassed for testing)
    // const currentUserId = req.user._id.toString();
    // if (currentUserId !== user1 && currentUserId !== user2) {
    //   return res.status(403).json({ message: 'Unauthorized access' });
    // }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderID: user1, receiverID: user2 },
        { senderID: user2, receiverID: user1 }
      ],
      isDeleted: false
    })
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .populate('senderID', 'username profilePic')
    .populate('receiverID', 'username profilePic');

    const total = await Message.countDocuments({
      $or: [
        { senderID: user1, receiverID: user2 },
        { senderID: user2, receiverID: user1 }
      ],
      isDeleted: false
    });

    res.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total
      }
    });
  } catch (error) {
    console.error('Error fetching thread:', error);
    res.status(500).json({ message: 'Error fetching conversation thread' });
  }
});

// Mark messages as read
router.patch('/mark-read', /* auth, */ async (req, res) => {
  try {
    const { senderID } = req.body;
    const receiverID = req.user ? req.user._id : '684aed0c424a48b470f5cf59'; // TEMP: Use hardcoded receiverID if auth is bypassed

    const result = await Message.updateMany(
      {
        senderID,
        receiverID,
        isRead: false
      },
      {
        $set: { isRead: true }
      }
    );

    res.json({ message: 'Messages marked as read', updatedCount: result.nModified });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

// Get unread message count
router.get('/unread/count', /* auth, */ async (req, res) => {
  try {
    const userId = req.user ? req.user._id : '684aed0c424a48b470f5cf59'; // TEMP: Use hardcoded userId if auth is bypassed

    const count = await Message.countDocuments({
      receiverID: userId,
      isRead: false,
      isDeleted: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread message count' });
  }
});

module.exports = router; 