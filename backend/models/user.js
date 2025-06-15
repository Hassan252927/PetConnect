const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true,
    minlength: 6
  },
  profilePic: { type: String },
  bio: { type: String },
  savedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' }]
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

// Create indexes for unique fields
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
