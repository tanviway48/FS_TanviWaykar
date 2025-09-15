import React, { useState } from 'react';
import TripForm from './components/TripForm';
import ChatModal from './components/ChatModal.jsx';

export default function App() {
  // a demo token for local testing: server provides token in real flow
  const [token, setToken] = useState('');
  const [matchId, setMatchId] = useState(null);

  return (
    <div style={{ padding: 20 }}>
      <h1>Student Commute Optimizer — Demo</h1>
      <p>
        For quick testing, set a JWT token (from your server) below. Otherwise the TripForm will not be authorized.
      </p>
      <div style={{ marginBottom: 12 }}>
        <input placeholder="Paste JWT token here" value={token} onChange={(e)=>setToken(e.target.value)} style={{ width: '60%' }} />
      </div>

      <TripForm token={token} onShowMatch={(mId)=>setMatchId(mId)} />
      {matchId && <div style={{ marginTop: 20 }}>
        <h3>Chat (match: {matchId})</h3>
        <ChatModal token={token} matchId={matchId} />
      </div>}
    </div>
  );
}
