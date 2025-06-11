const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  animal: { type: String, required: true },
  breed: { type: String },
  image: { type: String },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }]
});

module.exports = mongoose.model('Pet', petSchema);
