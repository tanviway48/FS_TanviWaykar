import React, { useState } from "react";

export default function TripForm({ onSubmit }) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ origin, destination, time });
    }
    setOrigin("");
    setDestination("");
    setTime("");
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h2>Create Trip</h2>

      <div className="form-group">
        <label>Origin</label>
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder="Enter origin"
          required
        />
      </div>

      <div className="form-group">
        <label>Destination</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Enter destination"
          required
        />
      </div>

      <div className="form-group">
        <label>Time</label>
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="primary">
        Save Trip
      </button>
    </form>
  );
}
