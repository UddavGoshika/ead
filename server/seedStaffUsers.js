
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const StaffProfile = require('./models/StaffProfile');
require('dotenv').config();

const seedStaff = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const staffData = [
            {
                name: 'Riya Sharma',
                email: 'riya.sharma@eadvocate.com',
                loginId: 'TELE-001',
                role: 'telecaller',
                department: 'Sales',
                mobile: '9876543210'
            },
            {
                name: 'Amit Patel',
                email: 'amit.patel@eadvocate.com',
                loginId: 'MGR-001',
                role: 'manager',
                department: 'Operations',
                mobile: '8765432109'
            },
            {
                name: 'Sarah Lee',
                email: 'sarah.lee@eadvocate.com',
                loginId: 'SUP-001',
                role: 'support',
                department: 'Customer Service',
                mobile: '7654321098'
            }
        ];

        for (const staff of staffData) {
            // Check if user exists
            let user = await User.findOne({ email: staff.email });
            if (user) {
                console.log(`User ${staff.email} already exists, skipping...`);
                continue;
            }

            const hashedPassword = await bcrypt.hash('staff123', 10);

            user = new User({
                email: staff.email,
                password: hashedPassword,
                role: staff.role,
                status: 'Active',
                plan: 'Staff'
            });
            await user.save();

            const profile = new StaffProfile({
                userId: user._id,
                staffId: staff.loginId,
                email: staff.email, // Ensure email is in profile for lookup
                fullName: staff.name,
                department: staff.department,
                mobile: staff.mobile,
                level: 'Mid-Senior',
                joinedDate: new Date(),
                performance: {
                    rating: 4.5,
                    tasksCompleted: 0
                }
            });
            await profile.save();

            console.log(`Created staff: ${staff.name} (${staff.role})`);
        }

        console.log('Seeding complete');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedStaff();
