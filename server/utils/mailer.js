const nodemailer = require("nodemailer");

console.log("📧 Initializing Mailer");
console.log("SMTP_HOST:", process.env.SMTP_HOST);
console.log("SMTP_PORT:", process.env.SMTP_PORT);
console.log("SMTP_USER:", process.env.SMTP_USER); // should be "apikey"

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // REQUIRED for Brevo (587)
    auth: {
        user: process.env.SMTP_USER, // apikey
        pass: process.env.SMTP_PASS, // xsmtpsib-...
    },
});

// ✅ VERIFY ON STARTUP
(async () => {
    try {
        await transporter.verify();
        console.log("✅ SMTP connection verified");
    } catch (err) {
        console.error("❌ SMTP verification failed:", err);
    }
})();

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"E-Advocate Services" <info.eadvocateservices@gmail.com>`, // MUST be verified
            to,
            subject,
            text,
            html,
        });

        console.log("✅ Email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error("❌ Email send error:", err);
        return { success: false, error: err.message };
    }
};

module.exports = { sendEmail };
