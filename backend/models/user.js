const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  profilePic: { type: String },
  savedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' }]
});

module.exports = mongoose.model('User', userSchema);
