const nodemailer = require("nodemailer");

/**
 * PRODUCTION READY MAILER CONFIGURATION
 * This utility uses a connection pool for better performance in production
 * and supports multiple SMTP providers (Gmail, Brevo, Outlook, etc.)
 */

console.log("📧 Initializing Mailer System...");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    // Production settings to prevent timeouts and connection drops
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    socketTimeout: 30000, // 30 seconds
    tls: {
        // Essential for cloud environments like Railway to prevent "Unauthorized" socket errors
        rejectUnauthorized: false
    }
});

// ✅ Connection Verification on Startup
(async () => {
    try {
        await transporter.verify();
        console.log("✅ SMTP connection established and verified successfully");
    } catch (err) {
        console.error("❌ SMTP configuration error:", {
            message: err.message,
            code: err.code,
            command: err.command
        });
    }
})();

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            // Ensure the Sender Name is clear and the From address matches your SMTP auth user/verified sender
            from: `"E-Advocate Services" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html,
        });

        console.log("✅ Email dispatched: %s", info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (err) {
        console.error("❌ Failed to send email:", {
            to,
            error: err.message
        });
        return { success: false, error: err.message };
    }
};

module.exports = { sendEmail };
