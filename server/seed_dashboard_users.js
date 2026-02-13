const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');
const Client = require('./models/Client');

// Sample Data Arrays
const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Ahmedabad'];
const LAW_SPECIALIZATIONS = ['Criminal Lawyer', 'Civil Lawyer', 'Family Lawyer', 'Corporate Lawyer', 'Property Lawyer', 'Divorce Lawyer', 'Cyber Lawyer', 'Constitutional Lawyer', 'Tax Lawyer', 'Labor Lawyer'];
const NAMES_FIRST = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Neel', 'Rohan', 'Aiden', 'Ananya', 'Diya', 'Sana', 'Aadhya', 'Kiara'];
const NAMES_LAST = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhatia', 'Saxena', 'Mehta', 'Chopra', 'Singh', 'Kapoor', 'Reddy', 'Nair', 'Patel', 'Joshi', 'Rao', 'Iyer', 'Menon', 'Pillai', 'Gowda', 'Das'];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomMobile = () => '9' + Math.floor(100000000 + Math.random() * 900000000).toString();

const seedDashboardUsers = async () => {
    try {
        console.log("Connecting to Database...");
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Note: Using a common password for all for easy testing
        const commonPasswordHash = await bcrypt.hash('password123', 10);

        // ---------------------------------------------------------
        // 1. Create 5 Free Clients
        // ---------------------------------------------------------
        console.log("\n--- Creating 5 Free Clients ---");
        for (let i = 1; i <= 5; i++) {
            const firstName = getRandom(NAMES_FIRST);
            const lastName = getRandom(NAMES_LAST);
            const email = `free.client.${i}@example.com`;

            const user = await User.create({
                email,
                password: commonPasswordHash,
                role: 'client',
                status: 'Active',
                plan: 'Free',
                planType: 'Free',
                planTier: null,
                isPremium: false,
                coins: 0
            });

            await Client.create({
                userId: user._id,
                unique_id: `TP-EAD-CLI-FREE-${1000 + i}`,
                firstName,
                lastName,
                email,
                mobile: getRandomMobile(),
                gender: 'Male',
                dob: new Date('1995-01-01'),
                address: {
                    city: getRandom(CITIES),
                    state: 'India',
                    country: 'India'
                },
                legalHelp: {
                    category: 'Legal Consultation',
                    issueDescription: 'Need advice on property dispute.'
                }
            });
            console.log(`Created Free Client: ${email}`);
        }

        // ---------------------------------------------------------
        // 2. Create 5 Pro Silver Clients
        // ---------------------------------------------------------
        console.log("\n--- Creating 5 Pro Silver Clients ---");
        for (let i = 1; i <= 5; i++) {
            const firstName = getRandom(NAMES_FIRST);
            const lastName = getRandom(NAMES_LAST);
            const email = `silver.client.${i}@example.com`;

            const user = await User.create({
                email,
                password: commonPasswordHash,
                role: 'client',
                status: 'Active',
                plan: 'Pro Silver',
                planType: 'Pro',
                planTier: 'Silver',
                isPremium: true,
                coins: 50
            });

            await Client.create({
                userId: user._id,
                unique_id: `TP-EAD-CLI-SLV-${2000 + i}`,
                firstName,
                lastName,
                email,
                mobile: getRandomMobile(),
                gender: 'Female',
                dob: new Date('1992-05-15'),
                address: {
                    city: getRandom(CITIES),
                    state: 'India',
                    country: 'India'
                },
                legalHelp: {
                    category: 'Corporate Legal',
                    issueDescription: 'Need help with company registration.'
                }
            });
            console.log(`Created Pro Silver Client: ${email}`);
        }

        // ---------------------------------------------------------
        // 3. Create 5 Free Advocates
        // ---------------------------------------------------------
        console.log("\n--- Creating 5 Free Advocates ---");
        for (let i = 1; i <= 5; i++) {
            const firstName = getRandom(NAMES_FIRST);
            const lastName = getRandom(NAMES_LAST);
            const email = `free.advocate.${i}@example.com`;
            const specialization = getRandom(LAW_SPECIALIZATIONS);
            const city = getRandom(CITIES);

            const user = await User.create({
                email,
                password: commonPasswordHash,
                role: 'advocate',
                status: 'Active',
                plan: 'Free',
                planType: 'Free',
                planTier: null,
                isPremium: false,
                coins: 0
            });

            await Advocate.create({
                userId: user._id,
                unique_id: `TP-EAD-ADV-FREE-${3000 + i}`,
                name: `${firstName} ${lastName}`,
                firstName,
                lastName,
                email,
                mobile: getRandomMobile(),
                gender: 'Male',
                dob: new Date('1988-08-20'),
                practice: {
                    specialization: specialization,
                    subSpecialization: 'General',
                    experience: '3 Years',
                    court: 'District Court',
                    barState: 'Delhi',
                    barAssociation: 'Bar Council of Delhi'
                },
                location: {
                    city: city,
                    state: 'Delhi',
                    country: 'India'
                },
                career: {
                    bio: `Advocate specializing in ${specialization}.`,
                    languages: 'English, Hindi',
                    skills: 'Legal Research, Drafting'
                },
                availability: {
                    consultationFee: 500,
                    days: ['Monday', 'Wednesday', 'Friday'],
                    timeSlots: ['10:00 AM - 12:00 PM']
                },
                verified: true
            });
            console.log(`Created Free Advocate: ${email}`);
        }

        // ---------------------------------------------------------
        // 4. Create 5 Pro Silver Advocates
        // ---------------------------------------------------------
        console.log("\n--- Creating 5 Pro Silver Advocates ---");
        for (let i = 1; i <= 5; i++) {
            const firstName = getRandom(NAMES_FIRST);
            const lastName = getRandom(NAMES_LAST);
            const email = `silver.advocate.${i}@example.com`;
            const specialization = getRandom(LAW_SPECIALIZATIONS);
            const city = getRandom(CITIES);

            const user = await User.create({
                email,
                password: commonPasswordHash,
                role: 'advocate',
                status: 'Active',
                plan: 'Pro Silver',
                planType: 'Pro',
                planTier: 'Silver',
                isPremium: true,
                coins: 100
            });

            await Advocate.create({
                userId: user._id,
                unique_id: `TP-EAD-ADV-SLV-${4000 + i}`,
                name: `${firstName} ${lastName}`,
                firstName,
                lastName,
                email,
                mobile: getRandomMobile(),
                gender: 'Female',
                dob: new Date('1985-12-10'),
                practice: {
                    specialization: specialization,
                    subSpecialization: 'Advanced',
                    experience: '10 Years',
                    court: 'High Court',
                    barState: 'Maharashtra',
                    barAssociation: 'Bar Council of Maharashtra'
                },
                location: {
                    city: city,
                    state: 'Maharashtra',
                    country: 'India'
                },
                career: {
                    bio: `Senior ${specialization} with over 10 years of experience.`,
                    languages: 'English, Hindi, Marathi',
                    skills: 'Litigation, Corporate Advisory, Arbitration'
                },
                availability: {
                    consultationFee: 2000,
                    days: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
                    timeSlots: ['2:00 PM - 6:00 PM']
                },
                verified: true
            });
            console.log(`Created Pro Silver Advocate: ${email}`);
        }

        console.log("\n✅ Successfully added 20 new dashboard users!");
        process.exit();

    } catch (error) {
        console.error("❌ Error seeding dashboard users:", error);
        process.exit(1);
    }
};

seedDashboardUsers();
