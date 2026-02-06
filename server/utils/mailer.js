const https = require('https');

/**
 * PRODUCTION-GRADE BREVO API MAILER (Using Built-in HTTPS)
 * This replaces legacy SMTP because SMTP (Port 587) often times out in cloud environments like Railway.
 * This version uses Node's built-in 'https' module to avoid needing extra dependencies like axios.
 * Enhanced with full logging and guards at every step to pinpoint exact errors.
 */

console.log("📧 Initializing Brevo API Mailer System...");

// Step 1: Load environment variables with guards
const API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SMTP_FROM || 'info.eadvocateservices@gmail.com';

if (!API_KEY) {
    console.error("❌ ERROR: No API Key found in environment variables! Cannot proceed.");
    // We can't send emails without key, but we'll allow the module to export for other uses if needed.
} else {
    console.log(`✅ API Key detected (Starts with: ${API_KEY.substring(0, 10)}...)`);
}

if (!SENDER_EMAIL) {
    console.error("❌ ERROR: No SENDER_EMAIL found! Using default but this may cause issues.");
} else {
    console.log(`✅ Sender email set to: ${SENDER_EMAIL}`);
}

const sendEmail = async (to, subject, text, html) => {
    return new Promise((resolve, reject) => {
        // Step 2: Validate input parameters with guards and logs
        console.log("🔍 Validating input parameters...");
        if (!to || typeof to !== 'string' || !to.includes('@')) {
            const errorMsg = "❌ Invalid or missing 'to' email address.";
            console.error(errorMsg, { providedTo: to });
            return resolve({ success: false, error: errorMsg });
        }
        console.log(`✅ 'to' validated: ${to}`);

        if (!subject || typeof subject !== 'string') {
            const errorMsg = "❌ Invalid or missing 'subject'.";
            console.error(errorMsg, { providedSubject: subject });
            return resolve({ success: false, error: errorMsg });
        }
        console.log(`✅ 'subject' validated: ${subject}`);

        if (!text && !html) {
            const errorMsg = "❌ Both 'text' and 'html' are missing. At least one is required.";
            console.error(errorMsg);
            return resolve({ success: false, error: errorMsg });
        }
        console.log(`✅ Content validated: text=${!!text}, html=${!!html}`);

        // Step 3: Prepare payload with logs
        console.log("🛠 Preparing JSON payload...");
        const data = JSON.stringify({
            sender: { name: "E-Advocate Services", email: SENDER_EMAIL },
            to: [{ email: to.trim() }],
            subject: subject,
            textContent: text || subject,
            htmlContent: html || `<p>${text || subject}</p>`
        });
        console.log("✅ Payload prepared:", data); // Log full payload for debugging

        // Step 4: Set up HTTPS options with guards
        console.log("🔌 Setting up HTTPS request options...");
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
        console.log("✅ Options set:", JSON.stringify(options, null, 2)); // Log options (hide full API key if needed)

        // Step 5: Initiate HTTPS request
        console.log(`📤 Sending email via Brevo API to: ${to}`);
        const req = https.request(options, (res) => {
            console.log(`📥 Received response status: ${res.statusCode}`);
            let responseBody = '';

            // Step 6: Collect response data
            res.on('data', (chunk) => {
                responseBody += chunk;
                console.log("📄 Received data chunk:", chunk.toString()); // Log chunks for full visibility
            });

            // Step 7: Handle end of response
            res.on('end', () => {
                console.log("🏁 Response ended. Full body:", responseBody);
                try {
                    const parsed = JSON.parse(responseBody);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log("✅ Email sent successfully. ID:", parsed.messageId);
                        resolve({ success: true, messageId: parsed.messageId });
                    } else {
                        const errorMsg = `❌ Brevo API returned status ${res.statusCode}. Details: ${responseBody}`;
                        console.error(errorMsg);
                        resolve({ success: false, error: errorMsg, responseBody });
                    }
                } catch (parseError) {
                    const errorMsg = `❌ Failed to parse Brevo response: ${parseError.message}. Raw body: ${responseBody}`;
                    console.error(errorMsg);
                    resolve({ success: false, error: errorMsg, responseBody });
                }
            });
        });

        // Step 8: Handle request errors
        req.on('error', (err) => {
            const errorMsg = `❌ HTTPS Request Error: ${err.message}`;
            console.error(errorMsg, err);
            resolve({ success: false, error: errorMsg });
        });

        // Step 9: Write data and end request
        console.log("🚀 Writing payload to request...");
        req.write(data);
        req.end();
        console.log("✅ Request sent.");
    });
};

module.exports = { sendEmail };