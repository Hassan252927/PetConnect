const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'comment'],
    required: true
  },
  senderID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  postID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  commentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    required: false // Only for comment notifications
  },
  content: {
    type: String,
    required: false // For comment notifications, store the comment text
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userID: 1, createdAt: -1 });
notificationSchema.index({ userID: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema); 