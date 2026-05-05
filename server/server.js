import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import authRouter from './auth/router.js';
import tripsRouter from './trips/router.js';
import usersRouter from './users/router.js';

const app = express();
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/users', usersRouter);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// In-memory store: { [roomId]: [{ id, sender, text, time }] }
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({ roomId }) => {
    socket.join(roomId);
    socket.emit('history', rooms[roomId] || []);
  });

  socket.on('send_message', ({ roomId, sender, text }) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msg = { id: Date.now(), sender, text, time };

    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(msg);

    io.to(roomId).emit('receive_message', msg);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on http://localhost:${PORT}`);
});
