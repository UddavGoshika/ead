const nodemailer = require('nodemailer');

// SPECIFIC MAILER FOR SUPPORT ONLY
const sendSupportEmail = async (to, subject, text, html, attachments = []) => {
    // READ CREDENTIALS
    const user = process.env.SMTP_FROM || 'info.eadvocateservices@gmail.com';
    let pass = process.env.smtp_pass || process.env.SMTP_PASS;

    if (pass) {
        // Remove spaces often included in App Passwords (abcd efgh -> abcdefgh)
        pass = pass.replace(/\s+/g, '');
    }

    console.log(`[Support Mailer] Config: User=${user}, PassLength=${pass ? pass.length : 0}`);

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Use SSL
        auth: {
            user: user,
            pass: pass
        }
    });

    try {
        console.log(`[Support Mailer] Sending to ${to} via Gmail SMTP...`);
        const info = await transporter.sendMail({
            from: `"E-Advocate Support" <${user}>`, // Detailed sender name
            to: to,
            subject: subject,
            text: text,
            html: html || `<p>${text}</p>`,
            attachments: attachments
        });

        console.log(`[Support Mailer] Sent! ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("[Support Mailer] Failed:", error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendSupportEmail };
