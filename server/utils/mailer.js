const https = require('https');
const nodemailer = require('nodemailer');

/**
 * HYBRID MAILER SYSTEM
 * 1. TRADITIONAL SMTP: If SMTP_HOST is provided, use nodemailer (best for Gmail, Outlook, Private SMTP).
 * 2. BREVO API: If no SMTP_HOST but BREVO_API_KEY is found, use Brevo's HTTP API (best for cloud/Railway).
 */

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT || 587;
const SMTP_USER = process.env.SMTP_USER || process.env.SMTP_MAIL;
const SMTP_PASS = process.env.SMTP_PASS || process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SMTP_FROM || 'info.eadvocateservices@gmail.com';

console.log("📧 Initializing Hybrid Mailer System...");

// Feature: SMTP Transport Setup
let smtpTransport = null;
if (SMTP_HOST) {
    console.log(`📡 SMTP Mode Detected: ${SMTP_HOST}:${SMTP_PORT}`);
    smtpTransport = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT == 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS
        }
    });
} else {
    console.log("☁️ API Mode Detected: No SMTP_HOST found, falling back to Brevo API.");
}

const sendEmail = async (to, subject, text, html) => {
    // 1. SMTP PATH
    // 1. SMTP PATH
    if (smtpTransport) {
        try {
            console.log(`📤 Sending SMTP email to: ${to} via ${SMTP_HOST}`);
            const info = await smtpTransport.sendMail({
                from: `"E-Advocate Services" <${SENDER_EMAIL}>`,
                to,
                subject,
                text,
                html: html || `<p>${text}</p>`
            });
            console.log("✅ SMTP Email sent. MsgId:", info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (err) {
            console.error("❌ SMTP Error:", err.message);
            console.log("⚠️ Switching to Brevo API Fallback due to SMTP failure...");
            // Do NOT return here. Let it fall through to API method logic below.
        }
    }

    // 2. BREVO API PATH
    return new Promise((resolve) => {
        const API_KEY = process.env.BREVO_API_KEY || process.env.SMTP_PASS;

        if (!API_KEY) {
            console.error("❌ ERROR: No SMTP_HOST and no API Key found! Cannot send email.");
            return resolve({ success: false, error: "Configuration Missing: Please set SMTP_HOST or BREVO_API_KEY" });
        }

        const data = JSON.stringify({
            sender: { name: "E-Advocate Services", email: SENDER_EMAIL },
            to: [{ email: to.trim() }],
            subject: subject,
            textContent: text || subject,
            htmlContent: html || `<p>${text || subject}</p>`
        });

        const options = {
            hostname: 'api.brevo.com',
            port: 443,
            path: '/v3/smtp/email',
            method: 'POST',
            timeout: 10000, // 10 second timeout
            headers: {
                'accept': 'application/json',
                'api-key': API_KEY,
                'content-type': 'application/json',
                'User-Agent': 'E-Advocate-Server/1.0',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => responseBody += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseBody);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log("✅ API Email sent. ID:", parsed.messageId);
                        resolve({ success: true, messageId: parsed.messageId });
                    } else {
                        console.error(`❌ Brevo API ${res.statusCode}:`, responseBody);
                        resolve({ success: false, error: `API Error ${res.statusCode}`, details: responseBody });
                    }
                } catch (e) {
                    resolve({ success: false, error: "Response Parse Error", raw: responseBody });
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            console.error("❌ Brevo API Request Timeout");
            resolve({ success: false, error: "Connection Timeout (Brevo API)" });
        });

        req.on('error', (err) => {
            console.error("❌ HTTPS Request Error:", err.message);
            resolve({ success: false, error: `Connection Error: ${err.message}` });
        });

        req.write(data);
        req.end();
    });
};

module.exports = { sendEmail };
