<<<<<<< HEAD
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'No authentication token provided' });
        }

        const token = authHeader.replace('Bearer ', '');

        // Simple mock token logic matching auth.js
        if (token.startsWith('user-token-')) {
            const userId = token.split('user-token-')[1];
            const user = await User.findById(userId);
            if (!user) throw new Error();

            req.user = { id: user._id, role: user.role, email: user.email }; // Normalize req.user.id
            req.token = token;
            next();
        } else if (token === 'mock-token-admin') {
            req.user = { id: '65a001', role: 'admin', email: 'admin@gmail.com' };
            req.token = token;
            next();
        } else {
            res.status(401).json({ success: false, error: 'Invalid token' });
        }
    } catch (error) {
        res.status(401).json({ success: false, error: 'Please authenticate' });
=======
const mongoose = require('mongoose');
const User = require('../models/User');

const auth = async (req, res, next) => {
    let token = req.headers.authorization || req.headers['x-auth-token'];

    // Debugging Log
    // console.log(`[AUTH] Received Token: ${token}`);

    if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

    try {
        // Handle "Bearer " prefix if present
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trim();
        }

        // Clean legacy double prefixes
        if (token.startsWith('user-token-user-token-')) {
            token = token.replace('user-token-user-token-', 'user-token-');
        }

        // Mock Token Handling
        if (token.startsWith('mock-token-')) {
            const mockId = token.split('mock-token-')[1];
            req.user = {
                id: mockId,
                role: mockId === 'admin' ? 'admin' : (mockId === 'client' ? 'client' : 'advocate'),
                email: `${mockId}@gmail.com`
            };
            return next();
        }

        // Real User Token Handling
        if (token.startsWith('user-token-')) {
            const userId = token.split('user-token-')[1];

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.error(`[AUTH] Invalid ObjectId: ${userId}`);
                return res.status(401).json({ error: 'Invalid token format (bad ID)' });
            }

            const user = await User.findById(userId);
            if (!user) {
                console.error(`[AUTH] User not found for ID: ${userId}`);
                return res.status(401).json({ error: 'User not found' });
            }

            req.user = user;
            return next();
        }

        // console.error(`[AUTH] Token did not match any known pattern: ${token}`);
        res.status(401).json({ error: 'Invalid token pattern' });
    } catch (err) {
        console.error("Auth Middleware Error:", err);
        res.status(401).json({ error: 'Token is not valid' });
>>>>>>> 1d75c825403bec99c6b4a6faba396c177aea5604
    }
};

module.exports = auth;
