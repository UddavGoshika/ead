const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const AuditLog = require('./models/AuditLog');
const Ticket = require('./models/Ticket');

const seedManagementData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Clear existing test management data
        await User.deleteMany({ role: { $in: ['manager', 'teamlead', 'verifier', 'finance', 'support'] } });
        await AuditLog.deleteMany({});
        await Ticket.deleteMany({});

        const hashedPassword = await bcrypt.hash('password123', 10);

        // 1. Create Manager
        await User.create({
            email: 'manager@legal.com',
            password: hashedPassword,
            role: 'manager',
            name: 'John Manager'
        });

        // 2. Create Team Lead
        await User.create({
            email: 'teamlead@legal.com',
            password: hashedPassword,
            role: 'teamlead',
            name: 'Sarah Lead'
        });

        // 3. Create Support Staff
        await User.create({
            email: 'support@legal.com',
            password: hashedPassword,
            role: 'support',
            name: 'Alex Support'
        });

        // 4. Create Audit Logs
        await AuditLog.create([
            { initiator: 'John Manager', action: 'ROLE_UPDATE', target: 'advocate@test.com', details: 'Upgraded to Professional' },
            { initiator: 'Sarah Lead', action: 'CASE_ASSIGNED', target: 'Case #10293', details: 'Assigned to Mark Advocate' },
            { initiator: 'System', action: 'SECURITY_ALERT', target: 'Unusual Login', details: 'IP: 192.168.1.1' }
        ]);

        // 5. Create Tickets
        await Ticket.create([
            { id: 'TKT-101', subject: 'Coins not credited', user: 'client@example.com', priority: 'High', status: 'Open', created: new Date().toLocaleDateString() },
            { id: 'TKT-102', subject: 'Profile verification pending', user: 'advocate@example.com', priority: 'Medium', status: 'In Progress', assignedTo: 'Sarah Lead', created: new Date().toLocaleDateString() }
        ]);

        console.log('Management seed data created successfully!');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedManagementData();
