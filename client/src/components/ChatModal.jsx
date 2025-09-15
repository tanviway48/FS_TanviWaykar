import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function ChatModal({ token, matchId }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      auth: { token },
    });
    setSocket(newSocket);

    newSocket.emit("joinMatch", matchId);

    newSocket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => newSocket.disconnect();
  }, [token, matchId]);

  const sendMessage = () => {
    if (socket && input.trim()) {
      socket.emit("message", { matchId, body: input });
      setInput("");
    }
  };

  return (
    <div className="chat-modal">
      {/* Header */}
      <div className="chat-header">Chat Room</div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`chat-bubble ${
              m.sender === "me" ? "chat-bubble-me" : "chat-bubble-other"
            }`}
          >
            {m.body}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
