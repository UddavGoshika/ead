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
        course: String, // Added
        university: String,
        college: String,
        gradYear: Number,
        enrollmentYear: Number, // Added
        enrollmentNo: String,
        certificatePath: String
    },
    practice: {
        court: String,
        experience: String,
        specialization: String,
        subSpecialization: String, // Added
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
        pincode: String,
        officeAddress: String, // Added
        permanentAddress: String // Added
    },
    career: {
        bio: String,
        firm: String, // Added
        position: String, // Added
        workType: String, // Added
        languages: String,
        skills: String
    },
    availability: {
        days: [String],
        timeSlots: [String],
        consultationFee: Number
    },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    signaturePath: String, // File upload
    legalDocumentation: [String], // Added to track doc services
    legalHelp: {
        featuredServices: [String]
    },
    interests: [{ type: String }],
    superInterests: [{ type: String }],
    shortlists: [{ type: String }],
    rejectionReason: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Advocate', AdvocateSchema);
