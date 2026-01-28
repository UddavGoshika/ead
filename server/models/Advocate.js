const mongoose = require('mongoose');

const AdvocateSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    unique_id: { type: String, unique: true },
    name: String,
    firstName: String,
    lastName: String,
    gender: String,
    dob: Date,
    mobile: String,
    email: String,
    idProofType: String,
    profilePicPath: String,
    education: {
        degree: String,
        university: String,
        college: String,
        gradYear: Number,
        enrollmentNo: String,
        certificatePath: String
    },
    practice: {
        court: String,
        experience: String,
        specialization: String,
        barState: String,
        barAssociation: String,
        licensePath: String
    },
    idProof: {
        docType: String,
        docPath: String
    },
    location: {
        country: String,
        state: String,
        city: String,
        pincode: String
    },
    career: {
        bio: String,
        languages: String,
        skills: String
    },
    availability: {
        days: [String],
        timeSlots: [String],
        consultationFee: Number
    },
    verified: { type: Boolean, default: false },
    signaturePath: String, // File upload
    interests: [{ type: String }],
    superInterests: [{ type: String }],
    shortlists: [{ type: String }],
    rejectionReason: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Advocate', AdvocateSchema);
