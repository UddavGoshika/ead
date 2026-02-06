const mongoose = require('mongoose');
const CommissionRule = require('./models/CommissionRule');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

const initialRules = [
    {
        level: "Level 1",
        role: "Our Staff",
        type: "Percentage",
        value: "2.5%",
        condition: "referred person buy a package then only he get money",
        status: "Active",
    },
    {
        level: "Level 2",
        role: "Teamleads",
        type: "Percentage",
        value: "5%",
        condition: "referred person buy a package then to get money",
        status: "Active",
    },
    {
        level: "Level 3",
        role: "Managers",
        type: "Percentage",
        value: "7.5%",
        condition: "referred person buy a package then only he get money",
        status: "Active",
    },
    {
        level: "Level 4",
        role: "Influencers",
        type: "Percentage",
        value: "5-10%",
        condition: "referred person buy a package then only he get money",
        status: "Active",
    },
    {
        level: "Level 5",
        role: "Marketing Roles",
        type: "Percentage",
        value: "5-10%",
        condition: "referred person buy a package then only he get money",
        status: "Active",
    },
    {
        level: "Marketing Agencies", // Custom name used in mock
        role: "Marketing Agencies",
        type: "Percentage",
        value: "5-15%",
        condition: "referred person buy a package then only he get money",
        status: "Active",
    },
];

const seedRules = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment");
        }
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        // Clear existing rules to avoid duplicates during seed
        await CommissionRule.deleteMany({});

        await CommissionRule.insertMany(initialRules);
        console.log("Successfully seeded referral commission rules!");

        process.exit();
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedRules();
