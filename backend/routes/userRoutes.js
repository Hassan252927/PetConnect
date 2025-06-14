const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const Message = require('../models/message');

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().populate('pets savedPosts');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a specific user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('pets savedPosts');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check username availability
router.get('/check/username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { excludeUserId } = req.query; // Optional: exclude a specific user ID (for profile updates)
    
    // Basic username validation
    if (!username || username.length < 3) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username must be at least 3 characters long' 
      });
    }
    
    if (username.length > 30) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username cannot exceed 30 characters' 
      });
    }
    
    // Check for valid characters (alphanumeric, underscore, dot)
    const usernameRegex = /^[a-zA-Z0-9._]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ 
        available: false, 
        message: 'Username can only contain letters, numbers, dots, and underscores' 
      });
    }
    
    // Check if username is taken
    const query = { username: username.toLowerCase() };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    
    const existingUser = await User.findOne(query);
    
    if (existingUser) {
      return res.json({ 
        available: false, 
        message: 'Username is already taken' 
      });
    }
    
    res.json({ 
      available: true, 
      message: 'Username is available' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user info
router.put('/:id', async (req, res) => {
  try {
    console.log('Updating user:', req.params.id);
    console.log('Update data:', req.body);
    
    const userId = req.params.id;
    const updateData = req.body;
    
    // Get the current user data to check if username is changing
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const oldUsername = currentUser.username;
    const newUsername = updateData.username;
    const isUsernameChanging = newUsername && newUsername !== oldUsername;
    
    console.log('Username changing:', isUsernameChanging, 'from', oldUsername, 'to', newUsername);
    
    // If username is changing, check if the new username is already taken
    if (isUsernameChanging) {
      const existingUser = await User.findOne({ 
        username: newUsername,
        _id: { $ne: userId } // Exclude current user from the check
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username is already taken. Please choose a different username.',
          field: 'username'
        });
      }
      
      console.log('Username is available:', newUsername);
    }
    
    // Update the user document
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    // If username is changing, update it across all related collections
    if (isUsernameChanging) {
      console.log('Updating username across all collections...');
      
      try {
        // Update username in all posts by this user
        const postUpdateResult = await Post.updateMany(
          { userID: userId },
          { 
            $set: { 
              username: newUsername,
              ...(updateData.profilePic && { profilePic: updateData.profilePic })
            }
          }
        );
        console.log('Updated posts:', postUpdateResult.modifiedCount);
        
        // Note: Comments are referenced by userID and populated, so they don't store username directly
        // The username will be fetched from the User document when populated
        
        // If you have any other collections that store username directly, update them here
        // For example, if messages stored username (they don't in current schema):
        // await Message.updateMany(
        //   { senderID: userId },
        //   { $set: { senderUsername: newUsername } }
        // );
        
        console.log('Username synchronization completed successfully');
        
      } catch (syncError) {
        console.error('Error synchronizing username across collections:', syncError);
        // Don't fail the entire request if sync fails, but log the error
        // The user update was successful, sync can be retried later
      }
    }
    
    console.log('Updated user profilePic:', updatedUser.profilePic);
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      if (err.keyPattern && err.keyPattern.username) {
        return res.status(400).json({ 
          message: 'Username is already taken. Please choose a different username.',
          field: 'username'
        });
      } else if (err.keyPattern && err.keyPattern.email) {
        return res.status(400).json({ 
          message: 'Email is already registered. Please use a different email.',
          field: 'email'
        });
      }
    }
    
    res.status(400).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a saved post to user
router.post('/:id/savedPosts', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.savedPosts.push(req.body.postID);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a saved post from user
router.delete('/:id/savedPosts/:postID', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.savedPosts = user.savedPosts.filter(pid => pid.toString() !== req.params.postID);
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
