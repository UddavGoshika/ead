const User = require('../models/User');
const Advocate = require('../models/Advocate');
const Client = require('../models/Client');
const { sendEmail } = require('./mailer');

/**
 * Sends a reminder email to users who have been rejected or are pending verification.
 * Runs every 24 hours.
 */
const startRejectionReminders = () => {
    console.log('[Reminder Service] Starting rejection reminder background task...');

    // Run every 24 hours
    setInterval(async () => {
        try {
            console.log('[Reminder Service] Checking for users requiring verification reminders...');

            // Find users who are Pending and have a rejection reason
            // First, find profiles with rejectionReason
            const advocateProfiles = await Advocate.find({ rejectionReason: { $exists: true, $ne: '' }, verified: false });
            const clientProfiles = await Client.find({ rejectionReason: { $exists: true, $ne: '' } });

            const processProfiles = async (profiles, type) => {
                for (const profile of profiles) {
                    const user = await User.findById(profile.userId);
                    if (user && user.status === 'Pending') {
                        console.log(`[Reminder Service] Sending reminder to ${user.email}`);

                        const emailSubject = 'Reminder: Please Complete Your Verification';
                        const emailText = `Hello ${profile.name || 'User'},\n\nThis is a reminder to update your profile following the previous rejection. Reason for rejection was:\n\n${profile.rejectionReason}\n\nPlease click the link below to verify your details and resubmit:\nhttp://localhost:3000/dashboard\n\nThank you,\nE-Advocate Team`;

                        await sendEmail(user.email, emailSubject, emailText);
                    }
                }
            };

            await processProfiles(advocateProfiles, 'advocate');
            await processProfiles(clientProfiles, 'client');

        } catch (err) {
            console.error('[Reminder Service] Error in reminder task:', err);
        }
    }, 24 * 60 * 60 * 1000);
};

module.exports = { startRejectionReminders };
