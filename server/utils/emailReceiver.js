const imps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const Ticket = require('../models/Ticket');
const User = require('../models/User'); // Optional usage if we want to link user
require('dotenv').config();

const config = {
    imap: {
        user: process.env.SMTP_FROM || 'info.eadvocateservices@gmail.com',
        password: (process.env.smtp_pass || process.env.SMTP_PASS || '').replace(/\s+/g, ''),
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: {
            rejectUnauthorized: false,
            servername: 'imap.gmail.com'
        },
        authTimeout: 30000
    }
};

let isSyncing = false;

const syncEmails = async () => {
    const logs = [];
    const addLog = (msg) => {
        logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
        console.log(`[EmailSync] ${msg}`);
    };

    if (isSyncing) {
        addLog("⏳ Segment: Check Concurrency -> Sync already in progress, skipping.");
        return { success: true, count: 0, message: 'Sync in progress', logs };
    }
    isSyncing = true;
    addLog("📨 Segment: Initialization -> Starting IMAP sync process...");

    let connection;
    let newMessagesCount = 0;

    try {
        addLog(`📨 Segment: Connection -> Attempting to connect to ${config.imap.host}...`);
        connection = await imps.connect(config);
        addLog("✅ Segment: Connection -> Established successfully.");

        // Discovery of folder names (Gmail has different names based on account settings)
        const boxList = await connection.getBoxes();
        const availableFolders = [];

        const flattenBoxes = (boxes, prefix = '') => {
            for (const key in boxes) {
                const fullPath = prefix + key;
                availableFolders.push(fullPath);
                if (boxes[key].children) {
                    flattenBoxes(boxes[key].children, fullPath + boxes[key].delimiter);
                }
            }
        };
        flattenBoxes(boxList);
        addLog(`🔎 Segment: Folder Discovery -> Found ${availableFolders.length} folders.`);

        // Target folders: Look for Inbox and Sent
        const targetInbox = availableFolders.find(f => f.toUpperCase() === 'INBOX') || 'INBOX';
        const targetSent = availableFolders.find(f => f.includes('Sent')) || '[Gmail]/Sent Mail';

        const foldersToScan = [targetInbox, targetSent];
        addLog(`📂 Segment: Folder Selection -> Scanning folders: ${foldersToScan.join(', ')}`);

        for (const folder of foldersToScan) {
            try {
                addLog(`📂 Segment: Box Access -> Opening folder: ${folder}`);
                await connection.openBox(folder);

                const lookbackDays = 7; // Increased lookback for reliability
                const sinceDate = new Date();
                sinceDate.setDate(sinceDate.getDate() - lookbackDays);

                addLog(`🔎 Segment: Search -> Searching for emails since ${sinceDate.toDateString()}...`);
                const searchCriteria = [['SINCE', sinceDate]];
                const fetchOptions = { bodies: ['HEADER', 'TEXT', ''], markSeen: false };

                const messages = await connection.search(searchCriteria, fetchOptions);
                addLog(`📩 Segment: Search Result -> Found ${messages.length} total messages in ${folder}.`);

                for (const item of messages) {
                    const all = item.parts.find(part => part.which === '');
                    const parsed = await simpleParser(all.body);

                    const fromEmail = parsed.from?.value?.[0]?.address || 'unknown@email.com';
                    const fromName = parsed.from?.value?.[0]?.name || fromEmail.split('@')[0];
                    const subject = parsed.subject || '(No Subject)';
                    const messageId = parsed.messageId;
                    const fullBody = parsed.text || '(No Content)';

                    addLog(`📄 Segment: Processing -> Subject: "${subject.substring(0, 30)}..." from ${fromEmail}`);

                    // FLEXIBLE FILTER: Try to match existing or create new for support
                    const ticketMatch = subject.match(/TKT-(\d+)/);
                    let ticket = null;

                    if (ticketMatch) {
                        const tId = `TKT-${ticketMatch[1]}`;
                        ticket = await Ticket.findOne({ id: tId });
                    }

                    // If no TKT tag or ticket not found by ID, match by user email
                    if (!ticket && fromEmail.toLowerCase() !== config.imap.user.toLowerCase()) {
                        ticket = await Ticket.findOne({ user: fromEmail }).sort({ createdAt: -1 });
                    }

                    // IF STILL NO TICKET -> CREATE NEW (for incoming emails only)
                    if (!ticket && fromEmail.toLowerCase() !== config.imap.user.toLowerCase()) {
                        const count = await Ticket.countDocuments();
                        const newId = `TKT-${10000 + count + 1}`;
                        addLog(`✨ Segment: New Ticket -> Creating ${newId} for ${fromEmail}`);
                        ticket = await Ticket.create({
                            id: newId,
                            subject: subject,
                            user: fromEmail,
                            category: 'Email Inquiry',
                            status: 'Open',
                            folder: 'Inbox',
                            messages: []
                        });
                    }

                    if (!ticket) {
                        // Skip if it's our own outgoing mail with no thread
                        continue;
                    }

                    // DUPLICATE CHECK
                    const isDuplicate = await Ticket.findOne({ "messages.messageId": messageId });
                    if (isDuplicate) {
                        // addLog(`⏭️ Segment: Duplicate -> Skipping messageId: ${messageId}`);
                        continue;
                    }

                    const newMessage = {
                        sender: fromName,
                        text: fullBody,
                        messageId: messageId,
                        timestamp: parsed.date || new Date()
                    };

                    addLog(`➕ Segment: Append -> Adding message to ${ticket.id}`);
                    ticket.messages.push(newMessage);

                    // Logic for status/unread
                    if (folder === targetInbox && fromEmail.toLowerCase() !== config.imap.user.toLowerCase()) {
                        ticket.status = 'New Reply';
                        ticket.hasUnread = true;
                        ticket.folder = 'Inbox';
                    }

                    ticket.updatedAt = new Date();
                    await ticket.save();
                    newMessagesCount++;
                }
            } catch (err) {
                addLog(`❌ Segment: Error -> Failed processing folder ${folder}: ${err.message}`);
            }
        }

        addLog(`🏁 Segment: Finalization -> Sync Complete. ${newMessagesCount} messages updated.`);
        return { success: true, count: newMessagesCount, logs };

    } catch (err) {
        addLog(`🛑 Segment: Critical Error -> IMAP Failure: ${err.message}`);
        return { success: false, error: err.message, logs };
    } finally {
        isSyncing = false;
        if (connection) connection.end();
        addLog("🔌 Segment: Cleanup -> Connection closed.");
    }
};

module.exports = { syncEmails };
