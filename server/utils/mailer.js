const nodemailer = require('nodemailer');

console.log('--- Initializing Mailer ---');
console.log('SMTP Config:', {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    user: process.env.SMTP_USER ? 'Present' : 'MISSING',
    pass: process.env.SMTP_PASS ? 'Present' : 'MISSING'
});

const isGmail = (process.env.SMTP_HOST || '').includes('gmail');

const transporter = nodemailer.createTransport(
    isGmail
        ? {
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        }
        : {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        }
);

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"E-Advocate" <${process.env.SMTP_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log('Email sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error('Email send error:', err);
        return { success: false, error: err.message };
    }
};

module.exports = { sendEmail };
