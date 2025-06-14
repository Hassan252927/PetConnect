const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');
const User = require('../models/user');
const Post = require('../models/post');

// Get notifications for a user
router.get('/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ userID })
      .populate('senderID', 'username profilePic')
      .populate('postID', 'media')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Format notifications for frontend
    const formattedNotifications = notifications.map(notification => ({
      _id: notification._id,
      userID: notification.userID,
      type: notification.type,
      senderID: notification.senderID._id,
      senderUsername: notification.senderID.username,
      senderProfilePic: notification.senderID.profilePic || '/default-profile.png',
      postID: notification.postID._id,
      postImage: notification.postID.media,
      content: notification.content,
      read: notification.read,
      createdAt: notification.createdAt
    }));

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// Get unread count for a user
router.get('/:userID/unread-count', async (req, res) => {
  try {
    const { userID } = req.params;
    const unreadCount = await Notification.countDocuments({ 
      userID, 
      read: false 
    });
    
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Error fetching unread count', unreadCount: 0 });
  }
});

// Create a notification (used internally by like/comment actions)
router.post('/', async (req, res) => {
  try {
    const { userID, type, senderID, postID, commentID, content } = req.body;

    // Don't create notification if user is liking/commenting on their own post
    if (userID === senderID) {
      return res.json({ message: 'No notification needed for own action' });
    }

    // Check if notification already exists (for likes)
    if (type === 'like') {
      const existingNotification = await Notification.findOne({
        userID,
        type: 'like',
        senderID,
        postID
      });

      if (existingNotification) {
        return res.json({ message: 'Like notification already exists' });
      }
    }

    const notification = new Notification({
      userID,
      type,
      senderID,
      postID,
      commentID,
      content
    });

    await notification.save();
    
    // Populate the notification for response
    await notification.populate('senderID', 'username profilePic');
    await notification.populate('postID', 'media');

    const formattedNotification = {
      _id: notification._id,
      userID: notification.userID,
      type: notification.type,
      senderID: notification.senderID._id,
      senderUsername: notification.senderID.username,
      senderProfilePic: notification.senderID.profilePic || '/default-profile.png',
      postID: notification.postID._id,
      postImage: notification.postID.media,
      content: notification.content,
      read: notification.read,
      createdAt: notification.createdAt
    };

    res.status(201).json(formattedNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
});

// Mark notification as read
router.put('/:notificationID/read', async (req, res) => {
  try {
    const { notificationID } = req.params;
    
    await Notification.findByIdAndUpdate(
      notificationID,
      { read: true },
      { new: true }
    );

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

// Mark all notifications as read for a user
router.put('/:userID/read-all', async (req, res) => {
  try {
    const { userID } = req.params;
    
    await Notification.updateMany(
      { userID, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
});

// Delete a notification (for unlike actions)
router.delete('/', async (req, res) => {
  try {
    const { userID, type, senderID, postID } = req.body;

    await Notification.findOneAndDelete({
      userID,
      type,
      senderID,
      postID
    });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

module.exports = router; 