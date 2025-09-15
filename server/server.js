require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');

const tripsRouter = require('./routes/trips');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// simple health route
app.get('/health', (req, res) => res.json({ ok: true }));

// mount API (no auth for demo MVP)
app.use('/api/trips', tripsRouter);

// connect mongo
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_commute_optimizer')
  .then(() => console.log('Mongo connected'))
  .catch(err => { console.error('Mongo connect error', err); process.exit(1); });

const server = http.createServer(app);

// socket.io for chat
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('joinMatch', (matchId) => {
    socket.join(`match:${matchId}`);
  });

  socket.on('message', async ({ matchId, body, sender }) => {
    try {
      const msg = await Message.create({ matchId, senderId: sender || null, body });
      io.to(`match:${matchId}`).emit('message', {
        id: msg._id, senderId: msg.senderId, body: msg.body, createdAt: msg.createdAt
      });
    } catch (err) {
      console.error('message save error', err);
      socket.emit('error', 'message save failed');
    }
  });

  socket.on('disconnect', () => {});
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
