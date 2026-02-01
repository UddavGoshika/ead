const mongoose = require('mongoose');
require('dotenv').config();
const LegalRequest = require('./models/LegalRequest');

const seedLegalRequests = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding legal requests...");

        await LegalRequest.deleteMany({});

        const requests = [
            // AFFIDAVITS
            {
                requestId: "AFF-REQ-1001",
                type: "Affidavit",
                title: "Name Change Affidavit",
                category: "Identity",
                price: "₹800",
                grossFee: 800,
                earned: 520,
                status: "Delivered",
                requestedBy: "Rahul Mehra",
                clientPhone: "+91 98210 56789",
                requestedDate: "2026-01-15",
                executionDate: "2026-01-16",
                fulfillmentSpecialist: "Sneha Sharma",
                specialistLicense: "ADV-99201 | MH",
                stepsCompleted: 5,
                totalSteps: 5,
                requiredStamp: "₹20",
                clientNotes: "Urgent - passport renewal",
                lastUpdated: "2026-01-16"
            },
            {
                requestId: "AFF-REQ-1002",
                type: "Affidavit",
                title: "Address Proof Affidavit",
                category: "Residence",
                price: "₹600",
                grossFee: 600,
                earned: 0,
                status: "Pending",
                requestedBy: "Priya Malhotra",
                clientPhone: "+91 98765 43210",
                requestedDate: "2026-01-28",
                fulfillmentSpecialist: "Sneha Sharma",
                specialistLicense: "ADV-99201 | MH",
                stepsCompleted: 1,
                totalSteps: 5,
                requiredStamp: "₹10",
                clientNotes: "For new bank account",
                lastUpdated: "2026-01-28"
            },
            {
                requestId: "AFF-REQ-1003",
                type: "Affidavit",
                title: "Name Change Affidavit",
                category: "Identity",
                price: "₹800",
                grossFee: 800,
                earned: 520,
                status: "Reported",
                requestedBy: "Vikram Singh",
                clientPhone: "+91 81234 56789",
                requestedDate: "2026-01-10",
                executionDate: "2026-01-12",
                fulfillmentSpecialist: "Sneha Sharma",
                specialistLicense: "ADV-99201 | MH",
                stepsCompleted: 4,
                totalSteps: 5,
                requiredStamp: "₹20",
                reportedLogs: "Client reported signature mismatch",
                clientNotes: "Post-marriage name change",
                lastUpdated: "2026-01-12"
            },

            // AGREEMENTS
            {
                requestId: "AGR-REQ-2001",
                type: "Agreement",
                title: "Non-Disclosure Agreement (NDA)",
                category: "Corporate",
                price: "₹1,500",
                grossFee: 1500,
                earned: 1050,
                status: "Completed",
                requestedBy: "Rahul Sharma",
                clientPhone: "+91 99880 11223",
                requestedDate: "2026-01-20",
                completionDate: "2026-01-21",
                fulfillmentSpecialist: "Adv. Rajesh Kumar",
                specialistLicense: "ADV-10023 | Delhi",
                stepsCompleted: 14,
                totalSteps: 14,
                clientNotes: "For new startup investor meeting",
                lastUpdated: "2026-01-21"
            },
            {
                requestId: "AGR-REQ-2002",
                type: "Agreement",
                title: "Service Level Agreement (SLA)",
                category: "IT/Tech",
                price: "₹4,500",
                grossFee: 4500,
                earned: 0,
                status: "Pending",
                requestedBy: "Anita Verma",
                clientPhone: "+91 88776 55443",
                requestedDate: "2026-01-29",
                fulfillmentSpecialist: "Adv. Priya Mehta",
                specialistLicense: "ADV-11892 | MH",
                stepsCompleted: 4,
                totalSteps: 18,
                clientNotes: "Cloud service provider contract",
                lastUpdated: "2026-01-30"
            },

            // NOTICES
            {
                requestId: "NTC-REQ-3001",
                type: "Notice",
                title: "Cheque Bounce Notice (Sec 138)",
                category: "Recovery",
                price: "₹1,200",
                grossFee: 1200,
                earned: 840,
                status: "Executed",
                requestedBy: "Sunil Grover",
                clientPhone: "+91 97766 55443",
                requestedDate: "2026-01-22",
                executionDate: "2026-01-24",
                fulfillmentSpecialist: "Adv. Meera Reddy",
                specialistLicense: "ADV-15421 | KA",
                stepsCompleted: 10,
                totalSteps: 10,
                clientNotes: "Amount: ₹5 Lakhs",
                lastUpdated: "2026-01-24"
            }
        ];

        await LegalRequest.insertMany(requests);
        console.log("✅ Seeded Legal Requests successfully!");
        process.exit();
    } catch (err) {
        console.error("❌ Error seeding legal requests:", err);
        process.exit(1);
    }
};

seedLegalRequests();
