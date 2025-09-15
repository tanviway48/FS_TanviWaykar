const Trip = require('../models/Trip');

function samplePoints([lng1, lat1], [lng2, lat2], n = 8) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push([lng1 + t * (lng2 - lng1), lat1 + t * (lat2 - lat1)]);
  }
  return pts;
}

function haversineMeters([lng1, lat1], [lng2, lat2]) {
  const R = 6371000;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function timeScore(tA, tB, windowMinutes = 30) {
  const diffMin = Math.abs((new Date(tA) - new Date(tB)) / 60000);
  return Math.max(0, 1 - diffMin / windowMinutes);
}

async function findCandidates(trip, opts = { sampleN: 10, corridorRadius: 1000, timeWindowMin: 20 }) {
  const { sampleN, corridorRadius, timeWindowMin } = opts;
  const samples = samplePoints(trip.origin.coordinates, trip.destination.coordinates, sampleN);
  const startMin = new Date(new Date(trip.startTime) - timeWindowMin * 60000);
  const startMax = new Date(new Date(trip.startTime) + timeWindowMin * 60000);

  const candidatesMap = new Map();

  for (const p of samples) {
    const nearTrips = await Trip.find({
      _id: { $ne: trip._id },
      startTime: { $gte: startMin, $lte: startMax },
      $or: [
        { origin: { $near: { $geometry: { type: 'Point', coordinates: p }, $maxDistance: corridorRadius } } },
        { destination: { $near: { $geometry: { type: 'Point', coordinates: p }, $maxDistance: corridorRadius } } }
      ]
    }).limit(50).lean();
    for (const t of nearTrips) candidatesMap.set(String(t._id), t);
  }

  const candidates = Array.from(candidatesMap.values());

  const scored = candidates.map((c) => {
    const ts = timeScore(trip.startTime, c.startTime, 30);
    const originDist = haversineMeters(trip.origin.coordinates, c.origin.coordinates);
    const destDist = haversineMeters(trip.destination.coordinates, c.destination.coordinates);
    const originScore = Math.max(0, 1 - originDist / 5000);
    const destScore = Math.max(0, 1 - destDist / 5000);
    const overlapScore = (originScore + destScore) / 2;
    const seatsBonus = (trip.seatsOffered > 0 || c.seatsOffered > 0) ? 0.1 : 0;
    const score = 0.4 * ts + 0.5 * overlapScore + seatsBonus;
    return { trip: c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 20);
}

module.exports = { findCandidates };
