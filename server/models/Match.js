const mongoose = require('mongoose');
const { Schema } = mongoose;

const matchSchema = new Schema({
  tripA: { type: Schema.Types.ObjectId, ref: 'Trip' },
  tripB: { type: Schema.Types.ObjectId, ref: 'Trip' },
  score: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
