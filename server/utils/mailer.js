const https = require('https');

/**
 * PRODUCTION-GRADE BREVO API MAILER (Using Built-in HTTPS)
 * This replaces legacy SMTP because SMTP (Port 587) often times out in cloud environments like Railway.
 * This version uses Node's built-in 'https' module to avoid needing extra dependencies like axios.
 */

console.log("📧 Initializing Brevo API Mailer System...");

const API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SMTP_FROM || 'info.eadvocateservices@gmail.com';

// DEBUG: Log if key is found (only log first 5 chars for safety)
if (!API_KEY) {
    console.error("❌ ERROR: No API Key found in environment variables!");
} else {
    console.log(`✅ API Key detected (Starts with: ${API_KEY.substring(0, 10)}...)`);
}

const sendEmail = async (to, subject, text, html) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            sender: { name: "E-Advocate Services", email: SENDER_EMAIL },
            to: [{ email: to }],
            subject: subject,
            textContent: text || subject, // Fallback if text is missing
            htmlContent: html || text || subject
        });

        const options = {
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': API_KEY,
                'content-type': 'application/json',
                'Content-Length': data.length
            }
        };

        console.log(`Sending email via Brevo API (HTTPS) to: ${to}`);

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => { responseBody += chunk; });
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    const parsed = JSON.parse(responseBody);
                    console.log("✅ Email sent via API. ID:", parsed.messageId);
                    resolve({ success: true, messageId: parsed.messageId });
                } else {
                    console.error("❌ Brevo API Error Status:", res.statusCode);
                    console.error("❌ Brevo API Error Body:", responseBody);
                    resolve({ success: false, error: `Brevo API returned status ${res.statusCode}` });
                }
            });
        });

        req.on('error', (err) => {
            console.error("❌ HTTPS Request Error:", err.message);
            resolve({ success: false, error: err.message });
        });

        req.write(data);
        req.end();
    });
};

module.exports = { sendEmail };
