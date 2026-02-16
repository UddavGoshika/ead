const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { sendSupportEmail } = require('./utils/supportMailer');

const testSupport = async () => {
    console.log("🛠️ Testing SUPPORT Dedicated Mailer (Gmail SMTP)...");
    console.log("   Sender:", process.env.SMTP_FROM);

    // Send to self as test
    const to = process.env.SMTP_FROM || 'info.eadvocateservices@gmail.com';

    const result = await sendSupportEmail(
        to,
        "Support Dashboard SMTP Test",
        "This is a test from the secure support dashboard mailer. It should use Gmail SMTP, NOT Brevo.",
        "<h1>Verified!</h1><p>You are receiving this via the new <strong>Support Mailer</strong> channel.</p>"
    );

    if (result.success) {
        console.log("✅ SUCCESS! Support email sent via Gmail SMTP.");
    } else {
        console.error("❌ FAILED:", result.error);
    }
};

testSupport();
