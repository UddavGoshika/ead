const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { syncEmails } = require('./utils/emailReceiver');

const testIMAP = async () => {
    console.log("---------------------------------------");
    console.log("🛠️  Testing IMAP Email Receiver");
    console.log("---------------------------------------");

    // Test Sync
    const result = await syncEmails();

    if (result.success) {
        console.log("✅ Sync Successful!");
        console.log(`📥 Count: ${result.count}`);
    } else {
        console.error("❌ Sync Failed:", result.error);
    }
};

testIMAP();
