const mongoose = require('mongoose');
const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Client = require('../models/Client');
const StaffProfile = require('../models/StaffProfile');
const { cloudinary } = require('../config/cloudinary');
require('dotenv').config();

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

const fixCloudinaryPdfs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
        console.log('Connected to MongoDB');

        // Helper function to update resource type
        const updateResourceType = async (publicId) => {
            if (!publicId) return;

            // Check if it looks like a Cloudinary ID (no slashes or just one, no full URL)
            // Or if it IS a cloudinary URL but points to image/upload
            let cleanId = publicId;

            if (publicId.includes('cloudinary.com')) {
                // Extract public ID
                // e.g. .../upload/v12345/folder/file.pdf
                const parts = publicId.split('/upload/');
                if (parts.length > 1) {
                    const afterUpload = parts[1];
                    // remove version if present
                    const versionMatch = afterUpload.match(/^v\d+\/(.*)/);
                    if (versionMatch) {
                        cleanId = versionMatch[1];
                    } else {
                        cleanId = afterUpload;
                    }
                }
            } else if (publicId.startsWith('/')) {
                cleanId = publicId.substring(1);
            }

            // Remove extension for the API call if needed, but for raw files, extension is part of ID usually?
            // Actually for 'raw', the public_id includes extension.
            // For 'image', public_id usually doesn't. 
            // BUT if we uploaded as 'auto' -> 'image', Cloudinary might have stripped extension or kept it.
            // Let's try to update access_mode to public first.

            // If it ends with PDF, try to set it to 'raw' type if possible?
            // You can't change resource_type of an existing asset easily via update.
            // You have to rename it or re-upload.
            // BUT we can update 'access_control' or 'access_mode'.

            try {
                // Try to set access_mode = public
                // We don't know if it's currently 'image' or 'raw'. Try both.

                // 1. Try as RAW
                await cloudinary.api.update(cleanId, {
                    resource_type: 'raw',
                    access_mode: 'public'
                }).then(res => console.log(`Updated RAW ${cleanId}: Public`))
                    .catch(e => {
                        // 2. Try as IMAGE
                        // If it failed, maybe it IS an image type asset
                        cloudinary.api.update(cleanId, {
                            resource_type: 'image',
                            access_mode: 'public'
                        }).then(res => console.log(`Updated IMAGE ${cleanId}: Public`))
                            .catch(err => console.log(`Failed to update ${cleanId}: ${err.message}`));
                    });

            } catch (err) {
                console.log(`Error processing ${cleanId}: ${err.message}`);
            }
        };

        // Find all users and check their documents
        const advocates = await Advocate.find({});
        const clients = await Client.find({});
        const staff = await StaffProfile.find({});

        const checkDocs = async (docs) => {
            if (!docs) return;
            for (const doc of docs) {
                if (doc.path && doc.path.toLowerCase().includes('.pdf')) {
                    console.log(`Checking PDF: ${doc.path}`);
                    await updateResourceType(doc.path);
                }
            }
        };

        for (const adv of advocates) {
            if (adv.idProof && adv.idProof.docPath && adv.idProof.docPath.includes('.pdf')) {
                await updateResourceType(adv.idProof.docPath);
            }
            if (adv.practice && adv.practice.licensePath && adv.practice.licensePath.includes('.pdf')) {
                await updateResourceType(adv.practice.licensePath);
            }
            if (adv.education && adv.education.certificatePath && adv.education.certificatePath.includes('.pdf')) {
                await updateResourceType(adv.education.certificatePath);
            }
        }

        console.log('Finished processing.');
        process.exit(0);

    } catch (err) {
        console.error('Script error:', err);
        process.exit(1);
    }
};

fixCloudinaryPdfs();
