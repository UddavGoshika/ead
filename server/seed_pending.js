const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');

const seedPendingMember = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eadvocate');
        console.log('Connected to DB...');

        const email = 'mock.advocate@example.com';
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('User already exists, deleting to re-seed...');
            await Advocate.findOneAndDelete({ userId: existingUser._id });
            await User.findByIdAndDelete(existingUser._id);
        }

        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        const user = new User({
            email,
            password,
            role: 'advocate',
            status: 'Pending'
        });
        await user.save();

        const advocate = new Advocate({
            userId: user._id,
            name: "Adv. Rajesh Kumar",
            firstName: "Rajesh",
            lastName: "Kumar",
            gender: "Male",
            dob: new Date("1985-06-15"),
            mobile: "+91 98765 43210",
            email: email,
            idProofType: "Aadhar",
            education: {
                degree: "LLB",
                university: "Delhi University",
                college: "Faculty of Law",
                gradYear: 2008,
                enrollmentNo: "D/1234/2008",
                certificatePath: "uploads/docs/llb_cert.pdf"
            },
            practice: {
                court: "Supreme Court of India",
                experience: "12 Years",
                specialization: "Criminal Law, Civil Law",
                barState: "Delhi",
                barAssociation: "Delhi Bar Council",
                licensePath: "uploads/docs/bar_license.jpg"
            },
            idProof: {
                docType: "Aadhar",
                docPath: "uploads/docs/aadhar.jpg"
            },
            location: {
                country: "India",
                state: "Delhi",
                city: "New Delhi",
                pincode: "110001"
            },
            career: {
                bio: "Experienced advocate specializing in complex civil disputes and criminal defense with a track record of over 500 successful cases.",
                languages: "English, Hindi, Punjabi",
                skills: "Litigation, Negotiation, Legal Research"
            },
            availability: {
                days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                timeSlots: ["10:00 AM - 01:00 PM", "04:00 PM - 07:00 PM"],
                consultationFee: 1500
            },
            signaturePath: "uploads/docs/sig_rajesh.png"
        });

        await advocate.save();
        console.log('Sample Pending Member Seeded ✅');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
};

seedPendingMember();
