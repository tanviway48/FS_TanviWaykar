const mongoose = require('mongoose');
const { Schema } = mongoose;

const tripSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  origin: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], required: true } }, // [lng,lat]
  destination: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], required: true } },
  startTime: { type: Date, required: true },
  maxDetourMeters: { type: Number, default: 1000 },
  seatsOffered: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
tripSchema.index({ origin: '2dsphere' });
tripSchema.index({ destination: '2dsphere' });

module.exports = mongoose.model('Trip', tripSchema);
