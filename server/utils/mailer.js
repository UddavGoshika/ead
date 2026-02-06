const nodemailer = require("nodemailer");

console.log("📧 Initializing Mailer");
console.log("SMTP_HOST:", process.env.SMTP_HOST || 'smtp-relay.brevo.com');
console.log("SMTP_PORT:", process.env.SMTP_PORT || 587);
console.log("SMTP_USER exists:", !!process.env.SMTP_USER);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

// 🔥 VERIFY ON STARTUP (IMPORTANT)
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
            from: `"E-Advocate" <${process.env.SMTP_USER}>`,
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
