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
    }
};

module.exports = auth;
