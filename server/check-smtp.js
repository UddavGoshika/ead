require('dotenv').config();
const nodemailer = require('nodemailer');

const testSMTP = async () => {
    console.log("---------------------------------------------------------");
    console.log("🛠️  E-ADVOCATE SMTP DIAGNOSTIC TOOL");
    console.log("---------------------------------------------------------");

    // 1. Check Credentials
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        console.error("❌ ERROR: Missing SMTP configuration in .env file.");
        console.log(`
        Required Variables:
        - SMTP_HOST (e.g. smtp.gmail.com)
        - SMTP_PORT (e.g. 465 or 587)
        - SMTP_USER (Your email address)
        - SMTP_PASS (Your App Password)
        `);
        return;
    }

    console.log(`✅ Configuration Detected:`);
    console.log(`   - Host: ${SMTP_HOST}`);
    console.log(`   - Port: ${SMTP_PORT}`);
    console.log(`   - User: ${SMTP_USER}`);
    console.log(`   - Pass: ${SMTP_PASS ? '******** (Hidden)' : 'MISSING'}`);

    // 2. Transporter
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465, // true for 465, false for 587
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });

    // 3. Verify Connection
    console.log("\n🔄 Attempting connection to SMTP Server...");
    try {
        await transporter.verify();
        console.log("✅ Connection Successful! Your SMTP server is ready.");

        // 4. Send Test Email
        console.log("\n📨 Sending test email to yourself...");
        const info = await transporter.sendMail({
            from: `"E-Advocate Test" <${SMTP_FROM || SMTP_USER}>`,
            to: SMTP_USER, // Send to self
            subject: "E-Advocate SMTP Test Configuration",
            text: "If you are reading this, your SMTP configuration is perfect! Your dashboard is ready to send secure emails.",
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #3b82f6;">SMTP Configuration Successful 🚀</h2>
                    <p>This email confirms that your E-Advocate dashboard can securely send emails via your account.</p>
                    <p><strong>Server:</strong> ${SMTP_HOST}</p>
                    <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `
        });

        console.log("✅ Test Email Sent!");
        console.log(`   - Message ID: ${info.messageId}`);
        console.log(`   - Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        console.log("\n🎉 YOU ARE ALL SET! Your staff can now send emails without knowing your password.");

    } catch (err) {
        console.error("❌ CONNECTION FAILED:");
        console.error(err.message);
        console.log("\nTroubleshooting Tips:");
        console.log("1. If using Gmail, ensure you are using an 'App Password', not your login password.");
        console.log("2. Check if 'Less Secure Apps' is enabled (legacy) or 2FA is active.");
        console.log("3. Verify the port (465 for SSL, 587 for TLS).");
    }
};

testSMTP();
