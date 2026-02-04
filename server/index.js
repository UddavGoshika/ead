const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { startRejectionReminders } = require('./utils/rejectionReminders');
const http = require('http');
const { Server } = require('socket.io');

// MongoDB Database Connection
const connectDB = require('./config/db');
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/blogs'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Serve Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/client');
const advocateRoutes = require('./routes/advocate');
const contactRoutes = require('./routes/contact');
const settingsRoutes = require('./routes/settings');
const interactionRoutes = require('./routes/interactions');
const adminRoutes = require('./routes/admin');
const blogRoutes = require('./routes/blog');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const staffRoutes = require('./routes/staff');

app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/advocate', advocateRoutes);
app.use('/api/advocates', advocateRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);
const caseRoutes = require('./routes/cases');
const callRoutes = require('./routes/calls');
app.use('/api/cases', caseRoutes);
app.use('/api/calls', callRoutes);

// SERVE FRONTEND (Production)
// If you run 'npm run build' in the frontend folder, the dist folder will be served here.
const frontendPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendPath, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('Backend is running. Frontend build not found. Run "npm run build" in the frontend folder to serve it here.');
    });
}

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});


const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Socket.IO Connection Handling
const userSockets = new Map(); // userId -> socketId

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('register', (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on('call-user', ({ to, offer, from, type }) => {
        const targetSocketId = userSockets.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('incoming-call', { from, offer, type });
        }
    });

    socket.on('answer-call', ({ to, answer }) => {
        const targetSocketId = userSockets.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('call-answered', { answer });
        }
    });

    socket.on('ice-candidate', ({ to, candidate }) => {
        const targetSocketId = userSockets.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('ice-candidate', { candidate });
        }
    });

    socket.on('hangup', ({ to }) => {
        const targetSocketId = userSockets.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('hangup');
        }
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                break;
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

// Export app for serverless
module.exports = app;

// Only listen if run directly (not imported as a module)
if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
        startRejectionReminders();
    });
}
