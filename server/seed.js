const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Advocate = require('./models/Advocate');
const Client = require('./models/Client');

const seedData = async () => {
    try {
        console.log("Connecting to Database...");
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Clear existing data
        console.log("Clearing existing data...");
        await User.deleteMany({});
        await Advocate.deleteMany({});
        await Client.deleteMany({});

        // 1. Create ADMIN
        console.log("Creating Admin...");
        const adminHash = await bcrypt.hash('admin123', 10);
        await User.create({
            email: 'admin@gmail.com',
            password: adminHash,
            role: 'admin'
        });

        // 2. Create ADVOCATES
        console.log("Creating Advocates...");
        const advocateHash = await bcrypt.hash('advocate123', 10);

        const advocatesData = [
            {
                firstName: 'Rajesh',
                lastName: 'Kumar',
                email: 'advocate1@gmail.com',
                specialization: 'Criminal Lawyer',
                experience: '15 Years',
                location: { city: 'Hyderabad', state: 'Telangana', country: 'India' }
            },
            {
                firstName: 'Priya',
                lastName: 'Sharma',
                email: 'advocate2@gmail.com',
                specialization: 'Family Lawyer',
                experience: '8 Years',
                location: { city: 'Delhi', state: 'Delhi', country: 'India' }
            },
            {
                firstName: 'Vikram',
                lastName: 'Reddy',
                email: 'advocate3@gmail.com',
                specialization: 'Corporate Lawyer',
                experience: '12 Years',
                location: { city: 'Bangalore', state: 'Karnataka', country: 'India' }
            }
        ];

        for (let i = 0; i < advocatesData.length; i++) {
            const adv = advocatesData[i];
            // Create User entry
            const user = await User.create({
                email: adv.email,
                password: advocateHash,
                role: 'advocate'
            });

            // Create Advocate Profile
            await Advocate.create({
                userId: user._id,
                unique_id: `TP-EAD-ADV${10000 + i}`,
                name: `${adv.firstName} ${adv.lastName}`,
                firstName: adv.firstName,
                lastName: adv.lastName,
                email: adv.email,
                mobile: '9876543210',
                gender: 'Male',
                dob: new Date('1985-01-01'),
                practice: {
                    specialization: adv.specialization,
                    experience: adv.experience,
                    court: 'High Court',
                    barState: adv.location.state,
                    barAssociation: 'Bar Council of ' + adv.location.state
                },
                location: adv.location,
                career: {
                    bio: `Experienced ${adv.specialization} with ${adv.experience} of practice.`,
                    languages: 'English, Hindi, Telugu',
                    skills: 'Legal Drafting, Litigation, Advisory'
                },
                availability: {
                    consultationFee: 2000,
                    days: ['Monday', 'Tuesday', 'Friday'],
                    timeSlots: ['10:00 AM - 1:00 PM', '4:00 PM - 7:00 PM']
                },
                verified: true
            });
        }

        // 3. Create CLIENTS
        console.log("Creating Clients...");
        const clientHash = await bcrypt.hash('client123', 10);

        const clientUsers = [
            { email: 'client@gmail.com', name: 'John Doe' },
            { email: 'suresh@gmail.com', name: 'Suresh Raina' }
        ];

        for (const cl of clientUsers) {
            const user = await User.create({
                email: cl.email,
                password: clientHash,
                role: 'client'
            });

            await Client.create({
                userId: user._id,
                unique_id: `TP-EAD-CL${10000 + clientUsers.indexOf(cl)}`,
                firstName: cl.name.split(' ')[0],
                lastName: cl.name.split(' ')[1] || '',
                email: cl.email,
                mobile: '9988776655',
                address: {
                    city: 'Hyderabad',
                    state: 'Telangana',
                    country: 'India',
                    pincode: '500001'
                }
            });
        }

        console.log("✅ Data Seeding Completed Successfully!");
        process.exit();

    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
