import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4hMhXWkPofwFqJfaYovEHU3ucDP3uI7c",
  authDomain: "peer-to-peer-44de3.firebaseapp.com",
  projectId: "peer-to-peer-44de3",
  storageBucket: "peer-to-peer-44de3.firebasestorage.app",
  messagingSenderId: "411555659636",
  appId: "1:411555659636:web:c599414ae0430a2572f621",
  measurementId: "G-QTZ8GFD8JS",
  databaseURL: "https://peer-to-peer-44de3-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const app = express();
const httpServer = createServer(app);

// Configure CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: corsOptions
});

// Store connected peers
const connectedPeers = new Map<string, Socket>();

// File upload endpoint
app.post('/api/upload', cors(corsOptions), upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Received upload request');
    
    if (!req.file) {
      console.error('No file in request');
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    const file = req.file;
    const path = req.body.path || `uploads/${Date.now()}_${file.originalname}`;

    console.log('Uploading to path:', path);

    // Create a storage reference
    const storageRef = ref(storage, path);

    // Upload the file
    const metadata = {
      contentType: file.mimetype,
      cacheControl: 'public,max-age=300',
    };

    console.log('Starting Firebase upload');
    const uploadResult = await uploadBytes(storageRef, file.buffer, metadata);
    console.log('File uploaded to Firebase');

    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('Download URL obtained:', downloadURL);

    res.json({ url: downloadURL });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

interface SignalingData {
  target: string;
  offer?: RTCSessionDescriptionInit;
  answer?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('offer', (data: SignalingData) => {
    socket.to(data.target).emit('offer', {
      offer: data.offer,
      from: socket.id
    });
  });

  socket.on('answer', (data: SignalingData) => {
    socket.to(data.target).emit('answer', {
      answer: data.answer,
      from: socket.id
    });
  });

  socket.on('ice-candidate', (data: SignalingData) => {
    socket.to(data.target).emit('ice-candidate', {
      candidate: data.candidate,
      from: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    connectedPeers.delete(socket.id);
  });
});

const PORT = 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});