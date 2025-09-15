require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const tripsRouter = require('./routes/trips');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// simple auth middleware for REST (expects Authorization: Bearer <token>)
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Missing auth' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// mount routes (trips route expects auth middleware on join operations)
app.use('/api/trips', authMiddleware, tripsRouter);

// health
app.get('/health', (req, res) => res.json({ ok: true }));

// connect to mongo
mongoose.connect(process.env.MONGO_URI, { })
  .then(() => console.log('Mongo connected'))
  .catch(err => { console.error('Mongo connect error', err); process.exit(1); });

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Socket auth middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('auth required'));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.sub;
    next();
  } catch (err) { next(new Error('auth error')); }
});

io.on('connection', socket => {
  console.log('socket connected', socket.id, 'user', socket.userId);

  socket.on('joinMatch', (matchId) => {
    socket.join(`match:${matchId}`);
  });

  socket.on('message', async ({ matchId, body }) => {
    try {
      const msg = await Message.create({ matchId, senderId: socket.userId, body });
      io.to(`match:${matchId}`).emit('message', {
        id: msg._id, senderId: msg.senderId, body: msg.body, createdAt: msg.createdAt
      });
    } catch (err) {
      console.error('message save error', err);
      socket.emit('error', 'message send failed');
    }
  });

  socket.on('disconnect', () => {
    // presence handling could go here
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
