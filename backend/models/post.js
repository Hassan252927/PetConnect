const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  petID: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
  userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  media: { type: String },
  caption: { type: String },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
