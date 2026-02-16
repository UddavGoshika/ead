# 📧 Secure SMTP Configuration Guide for E-Advocate

Your **E-Advocate Production Dashboard** is designed to send secure emails to your website users (Advocates, Clients, Members) **without exposing your main company email credentials** to your staff.

---

## 🔒 Security Architecture
1.  **Staff Login**: Your support team logs into the dashboard with their own credentials.
2.  **No Shared Password**: They *never* see your Gmail/Outlook password. It is hidden securely on the server.
3.  **Role-Based Access**: Only admins and authorized staff can access the "Emailing" module.
4.  **Audit Logs**: Every email sent is logged in the system audit trail.

---

## 🛠️ Configuration Steps

To enable the email system, you must add your SMTP details to the `.env` file in the `server` folder.

### 1. Open Configuration File
Locate the `.env` file in:
`c:\Users\Charlie\Videos\eadvocate\Eadvocate\server\.env`

### 2. Add SMTP Credentials (GMAIL Example)
If you use Gmail or Google Workspace, you must generate an **App Password**. Do not use your regular login password.

**How to get an App Password:**
1.  Go to your Google Account > Security.
2.  Under "Signing in to Google," select **2-Step Verification** (must be ON).
3.  Scroll to the bottom and select **App passwords**.
4.  Select "Mail" and "Other (Custom name)" -> Name it "E-Advocate".
5.  Copy the generated 16-character password (e.g., `abcd efgh ijkl mnop`).

**Paste into `.env`:**
```env
# SERVER PORT
PORT=5000

# MONGODB CONNECTION
MONGO_URI=mongodb+srv://...

# ----------------------------------------
# 📧 SECURE SMTP CONFIGURATION
# ----------------------------------------
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-company-email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop  <-- Paste your 16-char App Password here
SMTP_FROM=support@yourdomain.com
# ----------------------------------------
```

### 3. Verify Connection
To ensure everything is working correctly without logging into the dashboard, run this simple test:

1.  Open your terminal in the `server` folder:
    ```bash
    cd server
    node check-smtp.js
    ```
2.  If successful, you will see `✅ Connection Successful!` and receive a test email in your inbox.

---

## 🛡️ "My Staff Can Only See Website User Emails?"

**YES.**

-   **Incoming Queries**: The "Inbox" in the dashboard *only* shows messages submitted through your website's **Contact Forms** and **Report Forms**. It does *not* show random emails sent directly to your Gmail account (like bills, personal emails, or spam). This keeps your inbox private.
-   **Outgoing Replies**: When staff reply to a ticket, the email is sent *from* your company address, but the staff member only interacts with the ticket interface.

**This setup ensures total separation between your personal inbox and the support workflow.**
