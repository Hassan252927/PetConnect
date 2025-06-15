const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Comment = require('../models/comment');
const Notification = require('../models/notification');
const User = require('../models/user');

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userID', 'username profilePic')
      .populate('petID', 'name animal breed')
      .populate({
        path: 'comments',
        populate: {
          path: 'userID',
          select: 'username profilePic'
        }
      })
      .sort({ createdAt: -1 });
    
    //('GET /posts - Populated posts sent:', JSON.stringify(posts, null, 2));
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
      .populate({
        path: 'comments',
        populate: {
          path: 'userID',
          select: 'username profilePic'
        }
      })
      .sort({ createdAt: -1 });
    
    if (!posts || posts.length === 0) {
      return res.status(404).json({ 
        message: `No posts found for user ${userID}` 
      });
    }
    
    //('GET /posts/user/:userID - Populated posts sent:', JSON.stringify(posts, null, 2));
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
      .populate('petID', 'name animal breed')
      .populate({
        path: 'comments',
        populate: {
          path: 'userID',
          select: 'username profilePic'
        }
      });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    //('GET /posts/:id - Populated post sent:', JSON.stringify(post, null, 2));
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  try {
    //('POST /posts - Received request body:', JSON.stringify(req.body, null, 2));
    
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
    
    //('POST /posts - Transformed data:', JSON.stringify(newPostData, null, 2));
    
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
    //('POST /posts - Successfully created post:', post._id);
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
    if (!deletedPost) return res.status(404).json({ message: 'Post deleted successfully' });
    
    // Also delete all comments for this post
    await Comment.deleteMany({ postID: req.params.id });
    
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle like/unlike a post (Instagram-style)
router.post('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    const userID = req.body.userID;
    const hasLiked = post.likes.includes(userID);

    if (hasLiked) {
      // Unlike the post
      post.likes = post.likes.filter(id => id.toString() !== userID);
      
      // Delete the like notification
      await Notification.findOneAndDelete({
        userID: post.userID,
        type: 'like',
        senderID: userID,
        postID: post._id
      });
    } else {
      // Like the post
      post.likes.push(userID);
      
      // Create notification only if user is not liking their own post
      if (post.userID.toString() !== userID) {
        // Check if the post owner has notifications enabled
        const postOwner = await User.findById(post.userID);
        if (postOwner && postOwner.notificationsEnabled) {
          const notification = new Notification({
            userID: post.userID,
            type: 'like',
            senderID: userID,
            postID: post._id
          });
          await notification.save();
        }
      }
    }

    await post.save();
    
    // Return the updated post with populated data
    const populatedPost = await Post.findById(post._id)
      .populate('userID', 'username profilePic')
      .populate('petID', 'name animal breed')
      .populate({
        path: 'comments',
        populate: {
          path: 'userID',
          select: 'username profilePic'
        }
      });

    res.json(populatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a comment to a post
router.post('/:id/comment', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = new Comment({
      postID: req.params.id,
      userID: req.body.userID,
      content: req.body.content
    });

    await newComment.save();

    // Add comment reference to post and update comment count
    post.comments.push(newComment._id);
    post.commentsCount = post.comments.length;
    await post.save();

    // Create notification only if user is not commenting on their own post
    if (post.userID.toString() !== req.body.userID) {
      // Check if the post owner has notifications enabled
      const postOwner = await User.findById(post.userID);
      if (postOwner && postOwner.notificationsEnabled) {
        const notification = new Notification({
          userID: post.userID,
          type: 'comment',
          senderID: req.body.userID,
          postID: post._id,
          commentID: newComment._id,
          content: req.body.content.length > 30 ? `${req.body.content.substring(0, 30)}...` : req.body.content
        });
        await notification.save();
      }
    }

    // Return the updated post with populated data
    const populatedPost = await Post.findById(post._id)
      .populate('userID', 'username profilePic')
      .populate('petID', 'name animal breed')
      .populate({
        path: 'comments',
        populate: {
          path: 'userID',
          select: 'username profilePic'
        }
      });

    res.json(populatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a comment
router.delete('/:id/comment/:commentId', async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;
    const { userID } = req.body;

    // Find the comment and check if user owns it
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    if (comment.userID.toString() !== userID) {
      return res.status(403).json({ message: 'You can only delete your own comments' });
    }

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    // Delete the associated notification
    await Notification.findOneAndDelete({
      type: 'comment',
      senderID: userID,
      postID: postId,
      commentID: commentId
    });

    // Remove comment reference from post and update comment count
    const post = await Post.findById(postId);
    post.comments = post.comments.filter(id => id.toString() !== commentId);
    post.commentsCount = post.comments.length;
    await post.save();

    // Return the updated post with populated data
    const populatedPost = await Post.findById(post._id)
      .populate('userID', 'username profilePic')
      .populate('petID', 'name animal breed')
      .populate({
        path: 'comments',
        populate: {
          path: 'userID',
          select: 'username profilePic'
        }
      });

    res.json(populatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
