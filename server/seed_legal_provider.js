const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');

const seedLegalProvider = async () => {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(process.env.MONGODB_URI);

        const email = 'advisor@gmail.com';
        const password = 'advisor123';

        // Remove existing if any
        await User.deleteOne({ email });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            email,
            password: hashedPassword,
            role: 'legal_provider',
            status: 'Active', // Set to Active so it can login
            plan: 'Pro',
            isPremium: true
        });

        await Advocate.create({
            userId: user._id,
            unique_id: 'TP-EAD-PADV77777',
            name: 'Vikram Malhotra',
            firstName: 'Vikram',
            lastName: 'Malhotra',
            email,
            mobile: '9888776655',
            gender: 'Male',
            verified: true,
            practice: {
                specialization: 'Legal Consultant',
                experience: '10 Years',
                court: 'Supreme Court'
            },
            location: {
                city: 'New Delhi',
                state: 'Delhi',
                country: 'India'
            }
        });

        console.log("✅ Legal Advisor Account Created!");
        console.log("Email: " + email);
        console.log("Password: " + password);
        process.exit();
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
};

seedLegalProvider();
