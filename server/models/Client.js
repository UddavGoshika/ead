const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    unique_id: { type: String, unique: true },
    firstName: String,
    lastName: String,
    gender: String,
    dob: Date,
    mobile: String,
    email: String,
    documentType: String,
    documentPath: String, // File upload
    profilePicPath: String,
    address: {
        country: String,
        state: String,
        city: String,
        office: String,
        permanent: String,
        pincode: String
    },
    legalHelp: {
        category: String,
        specialization: String,
        subDepartment: String,
        mode: String,
        advocateType: String,
        languages: String,
        issueDescription: String
    },
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    signaturePath: String, // File upload
    interests: [{ type: String }],
    superInterests: [{ type: String }],
    shortlists: [{ type: String }],
    rejectionReason: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Client', ClientSchema);
