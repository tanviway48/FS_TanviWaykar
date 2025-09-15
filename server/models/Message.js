const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
