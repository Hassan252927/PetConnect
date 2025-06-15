const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownerID: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // For compatibility
  name: { type: String, required: true },
  animal: { type: String, required: true },
  breed: { type: String },
  age: { type: Number },
  gender: { type: String },
  weight: { type: Number },
  image: { type: String },
  description: { type: String },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Pet', petSchema);
