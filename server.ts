const express = require('express');
const cors = require('cors');
const { auth } = require('./src/firebase');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, replace with your frontend URL
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Track active rooms and users
const activeRooms = new Map(); // roomId -> Set of socket IDs
const userRoles = new Map(); // socketId -> role (student/mentor)

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a chat room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    // Add user to active rooms tracking
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    activeRooms.get(roomId).add(socket.id);
    
    // Notify all clients about updated room list
    io.emit('rooms_update', Array.from(activeRooms.keys()));
  });

  // Leave a chat room
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room: ${roomId}`);
    
    // Remove user from active rooms tracking
    if (activeRooms.has(roomId)) {
      activeRooms.get(roomId).delete(socket.id);
      
      // If room is empty, remove it
      if (activeRooms.get(roomId).size === 0) {
        activeRooms.delete(roomId);
      }
    }
    
    // Notify all clients about updated room list
    io.emit('rooms_update', Array.from(activeRooms.keys()));
  });

  // Set user role
  socket.on('set_role', (role) => {
    userRoles.set(socket.id, role);
    console.log(`User ${socket.id} set role to: ${role}`);
  });

  // Send a message
  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
    console.log(`Message sent in room ${data.roomId}: ${data.message}`);
  });

  // Handle typing status
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user_typing', {
      userId: socket.id,
      isTyping: data.isTyping
    });
  });

  // Get active rooms
  socket.on('get_rooms', () => {
    socket.emit('rooms_update', Array.from(activeRooms.keys()));
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove user from all rooms
    for (const [roomId, users] of activeRooms.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        
        // If room is empty, remove it
        if (users.size === 0) {
          activeRooms.delete(roomId);
        }
      }
    }
    
    // Remove user role
    userRoles.delete(socket.id);
    
    // Notify all clients about updated room list
    io.emit('rooms_update', Array.from(activeRooms.keys()));
  });
});

// Routes
app.get('/', (req, res) => {
  res.send('Peer-to-Peer API is running');
});

// API endpoint to get active rooms
app.get('/api/rooms', (req, res) => {
  res.json(Array.from(activeRooms.keys()));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 