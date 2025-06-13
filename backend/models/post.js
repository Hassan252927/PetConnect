const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true },
  profilePic: { type: String },
  petID: { type: Schema.Types.ObjectId, ref: 'Pet' },
  petName: { type: String },
  media: { type: String },
  caption: { type: String, required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  commentsCount: { type: Number, default: 0 },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
postSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Post', postSchema);
