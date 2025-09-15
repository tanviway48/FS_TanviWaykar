const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const Match = require('../models/Match');
const { findCandidates } = require('../utils/matching');

router.post('/', async (req, res) => {
  try {
    const { origin, destination, startTime, maxDetourMeters, seatsOffered } = req.body;
    if (!origin || !destination || !startTime) return res.status(400).json({ error: 'origin,destination,startTime required' });

    const trip = await Trip.create({ origin, destination, startTime, maxDetourMeters, seatsOffered });

    // find matches (synchronous for MVP)
    const candidates = await findCandidates(trip, { sampleN: 8, corridorRadius: trip.maxDetourMeters || 1000 });

    // persist simple Match rows (optional)
    const created = [];
    for (const c of candidates.slice(0, 5)) {
      const m = await Match.create({ tripA: trip._id, tripB: c.trip._id, score: c.score });
      created.push({ matchId: m._id, tripId: c.trip._id, score: c.score });
    }

    res.status(201).json({ tripId: trip._id, matches: created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

// simple GET all trips for demo/testing
router.get('/', async (req, res) => {
  const trips = await Trip.find().limit(100).lean();
  res.json(trips);
});

module.exports = router;
