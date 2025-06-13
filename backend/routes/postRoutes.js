const express = require('express');
const router = express.Router();
const Post = require('../models/post');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userID', 'username profilePic')
      .populate('petID', 'name animal breed')
      .sort({ timestamp: -1 });
    
    console.log('GET /posts - Populated posts sent:', JSON.stringify(posts, null, 2));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get posts by user ID
router.get('/user/:userID', async (req, res) => {
  try {
    const { userID } = req.params;
    const posts = await Post.find({ userID })
      .populate('userID', 'username profilePic')
      .populate('petID', 'name animal breed')
      .sort({ timestamp: -1 });
    
    if (!posts || posts.length === 0) {
      return res.status(404).json({ 
        message: `No posts found for user ${userID}` 
      });
    }
    
    console.log('GET /posts/user/:userID - Populated posts sent:', JSON.stringify(posts, null, 2));
    res.json(posts);
  } catch (err) {
    res.status(500).json({ 
      error: 'Error fetching user posts',
      details: err.message 
    });
  }
});

// Get a specific post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userID', 'username profilePic')
      .populate('petID', 'name animal breed');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    console.log('GET /posts/:id - Populated post sent:', JSON.stringify(post, null, 2));
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  try {
    console.log('POST /posts - Received request body:', JSON.stringify(req.body, null, 2));
    
    const newPostData = {
      userID: req.body.userID,
      username: req.body.username,
      profilePic: req.body.profilePic,
      petID: req.body.petID,
      petName: req.body.petName,
      media: req.body.media,
      caption: req.body.caption,
      tags: req.body.tags,
    };
    
    console.log('POST /posts - Transformed data:', JSON.stringify(newPostData, null, 2));
    
    const post = new Post(newPostData);
    
    // Validate the post before saving
    const validationError = post.validateSync();
    if (validationError) {
      console.error('POST /posts - Validation error:', validationError);
      return res.status(400).json({ 
        error: 'Validation error', 
        details: validationError.message,
        errors: validationError.errors 
      });
    }
    
    await post.save();
    console.log('POST /posts - Successfully created post:', post._id);
    res.status(201).json(post);
  } catch (err) {
    console.error('POST /posts - Error:', err);
    res.status(400).json({ 
      error: err.message,
      details: err.errors || err.stack
    });
  }
});

// Update a post
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedPost) return res.status(404).json({ message: 'Post not found' });
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a post
router.delete('/:id', async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like a post
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userID = req.body.userID;

    if (!post.likes.includes(userID)) {
      post.likes.push(userID);
      await post.save();
    }

    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Unlike a post
router.post('/:id/unlike', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const userID = req.body.userID;

    post.likes = post.likes.filter(id => id.toString() !== userID);
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
