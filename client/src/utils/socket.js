import { io } from 'socket.io-client';

// Connects via Vite proxy (/socket.io → localhost:3001)
// This avoids CORS issues and works in both dev and production
const socket = io({
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
