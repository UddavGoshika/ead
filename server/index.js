const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { startRejectionReminders } = require('./utils/rejectionReminders');

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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startRejectionReminders();
});
