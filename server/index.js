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

// Request Logger for Production Debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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
const relationshipRoutes = require('./routes/relationships');

app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/advocate', advocateRoutes);
app.use('/api/advocates', advocateRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);
const caseRoutes = require('./routes/cases');
const callRoutes = require('./routes/calls');
const pageRoutes = require('./routes/pages');
app.use('/api/cases', caseRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/pages', pageRoutes);

const manualPaymentRoutes = require('./routes/manualPayments');
const supportRoutes = require('./routes/support');
const referralRoutes = require('./routes/referral');

app.use('/api/manual-payments', manualPaymentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/referral', referralRoutes);

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

const userSockets = new Map(); // userId -> socketId
const agentOnlineStatus = new Map(); // userId -> {status, lastSeen}
const typingStates = new Map(); // sessionId -> Set of userIds typing

// Expose io and sockets to app
app.set('io', io);
app.set('userSockets', userSockets);

// Socket.IO Connection Handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('register', (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // --- AGENT & DASHBOARD HANDLERS ---
    socket.on('support:agent-online', ({ userId, status }) => {
        agentOnlineStatus.set(userId, { status, lastSeen: Date.now() });
        broadcastAgentMetrics();
    });

    socket.on('support:get-metrics', () => {
        socket.emit('support:metrics-update', calculateMetrics());
    });

    const broadcastAgentMetrics = () => {
        const metrics = calculateMetrics();
        io.emit('support:metrics-update', metrics);
    };

    const calculateMetrics = () => {
        const onlineAgents = Array.from(agentOnlineStatus.values()).filter(a => a.status === 'online').length;
        return {
            onlineAgents,
            activeChats: 0, // In a real app, count from DB or memory
            totalWaitTime: 0,
            avgWaitTime: "45s",
            serverStatus: 'healthy',
            timestamp: Date.now()
        };
    };

    // --- CHAT LIVE WORKSPACE HANDLERS ---
    socket.on('support:typing-start', ({ sessionId, userId, userName }) => {
        if (!typingStates.has(sessionId)) typingStates.set(sessionId, new Set());
        typingStates.get(sessionId).add(userId);

        socket.to(sessionId).emit('support:typing-update', {
            sessionId,
            isTyping: true,
            userId,
            userName
        });
    });

    socket.on('support:typing-stop', ({ sessionId, userId }) => {
        if (typingStates.has(sessionId)) {
            typingStates.get(sessionId).delete(userId);
        }
        socket.to(sessionId).emit('support:typing-update', {
            sessionId,
            isTyping: false,
            userId
        });
    });

    socket.on('support:join-room', (sessionId) => {
        socket.join(sessionId);
        console.log(`Socket ${socket.id} joined chat room: ${sessionId}`);
    });

    socket.on('support:leave-room', (sessionId) => {
        socket.leave(sessionId);
    });

    // --- CALL HANDLERS ---
    socket.on('call-user', ({ to, offer, from, type, callerInfo }) => {
        const targetSocketId = userSockets.get(to);
        if (targetSocketId) {
            io.to(targetSocketId).emit('incoming-call', { from, offer, type, callerInfo });
            socket.emit('ringing');
        } else {
            socket.emit('user-offline');
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
        let disconnectedUserId = null;
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                disconnectedUserId = userId;
                userSockets.delete(userId);
                break;
            }
        }
        if (disconnectedUserId) {
            agentOnlineStatus.delete(disconnectedUserId);
            broadcastAgentMetrics();
        }
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startRejectionReminders();
});
