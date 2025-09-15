const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  // In MVP we keep user optional — can expand later
  email: { type: String, unique: true, sparse: true },
  publicUsername: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
