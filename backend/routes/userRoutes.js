const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment');
const Message = require('../models/message');

// Helper function to generate JWT token
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return jwt.sign(
    { userId },
    secret,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Helper function to sanitize user data (remove password)
const sanitizeUser = (user) => {
  try {
    const userObj = user.toObject ? user.toObject() : user;
    delete userObj.password;
    return userObj;
  } catch (error) {
    console.error('Error in sanitizeUser:', error);
    // Fallback: manually create clean user object
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePic: user.profilePic,
      bio: user.bio,
      savedPosts: user.savedPosts,
      pets: user.pets,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
};

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().populate('pets savedPosts');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register a new user (for frontend compatibility)
router.post('/register', [
  // Validation middleware
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9._]+$/)
    .withMessage('Username can only contain letters, numbers, dots, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${email}$`, 'i') } },
        { username: { $regex: new RegExp(`^${username}$`, 'i') } }
      ]
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({
          message: 'User with this email already exists',
          field: 'email'
        });
      } else {
        return res.status(400).json({
          message: 'Username is already taken',
          field: 'username'
        });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await newUser.save();

    // Generate JWT token
    const token = generateToken(newUser._id);

    // Return success response with token and user info
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: sanitizeUser(newUser)
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key error (fallback)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} is already taken`,
        field
      });
    }

    res.status(500).json({
      message: 'Server error during registration'
    });
  }
});

// Login user (for frontend compatibility)
router.post('/login', [
  // Validation middleware
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { identifier, password } = req.body;
    console.log('Login attempt for identifier:', identifier);

    // Find user by email or username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${identifier}$`, 'i') } },
        { username: { $regex: new RegExp(`^${identifier}$`, 'i') } }
      ]
    });

    if (!user) {
      console.log('User not found for identifier:', identifier);
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    console.log('User found:', user.username, 'ID:', user._id);

    // Verify password
    console.log('Verifying password...');
    console.log('Plain password received:', password ? 'Present' : 'UNDEFINED');
    console.log('Hashed password from DB:', user.password ? 'Present' : 'UNDEFINED');
    
    // Check if either password is undefined
    if (!password) {
      console.log('ERROR: Plain password is undefined or empty');
      return res.status(400).json({
        message: 'Password is required'
      });
    }
    
    if (!user.password) {
      console.log('ERROR: User has no password stored in database');
      return res.status(500).json({
        message: 'User account has invalid password data'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Password verification failed for user:', user.username);
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    console.log('Password verified successfully');

    // Generate JWT token
    console.log('Generating JWT token...');
    const token = generateToken(user._id);
    console.log('JWT token generated successfully');

    // Sanitize user data
    console.log('Sanitizing user data...');
    const sanitizedUser = sanitizeUser(user);
    console.log('User data sanitized successfully');

    // Return success response with token and user info
    res.json({
      message: 'Login successful',
      token,
      user: sanitizedUser
    });

  } catch (error) {
    console.error('Login error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error message:', error.message);
    
    // More specific error handling
    if (error.message && error.message.includes('JWT_SECRET')) {
      console.error('JWT_SECRET environment variable issue');
      return res.status(500).json({
        message: 'Server configuration error'
      });
    }
    
    res.status(500).json({
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create a new user (legacy endpoint)
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
    
    // Check if username is taken (case-insensitive)
    const query = { 
      username: { $regex: new RegExp(`^${username}$`, 'i') }
    };
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

// Check email availability
router.get('/check/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { excludeUserId } = req.query; // Optional: exclude a specific user ID (for profile updates)
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ 
        available: false, 
        message: 'Please provide a valid email address' 
      });
    }
    
    // Check if email is taken (case-insensitive)
    const query = { 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    
    const existingUser = await User.findOne(query);
    
    if (existingUser) {
      return res.json({ 
        available: false, 
        message: 'User with this email already exists' 
      });
    }
    
    res.json({ 
      available: true, 
      message: 'Email is available' 
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
        username: { $regex: new RegExp(`^${newUsername}$`, 'i') },
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
