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
        authTimeout: 10000,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
    }
};

const syncEmails = async () => {
    console.log("📨 Syncing Emails via IMAP (Filtered & Thorough)...");
    let connection;
    let newMessagesCount = 0;

    try {
        connection = await imps.connect(config);

        // GMAIL Specific folders. May vary by locale, but these are standard for English Gmail.
        const folders = ['INBOX', '[Gmail]/Sent Mail'];

        for (const folder of folders) {
            try {
                await connection.openBox(folder);
                console.log(`🔎 Scanning folder: ${folder}`);

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                const searchCriteria = [['SINCE', yesterday]];
                const fetchOptions = { bodies: ['HEADER', 'TEXT', ''], markSeen: false };

                const messages = await connection.search(searchCriteria, fetchOptions);

                for (const item of messages) {
                    const all = item.parts.find(part => part.which === '');
                    const parsed = await simpleParser(all.body);

                    const fromEmail = parsed.from.value[0].address;
                    const fromName = parsed.from.value[0].name || fromEmail.split('@')[0];
                    const subject = parsed.subject || '(No Subject)';
                    const messageId = parsed.messageId;
                    const fullBody = parsed.text || '(No Content)';

                    // STRICT FILTER: Only pull if it has TKT- tag or matches an active ticket
                    // This prevents personal emails in the same inbox from being pulled.
                    const ticketMatch = subject.match(/TKT-(\d+)/);
                    let ticket = null;

                    if (ticketMatch) {
                        const tId = `TKT-${ticketMatch[1]}`;
                        ticket = await Ticket.findOne({ id: tId });
                    }

                    // If no TKT tag, check if it's an ongoing thread from a known user
                    if (!ticket && fromEmail.toLowerCase() !== config.imap.user.toLowerCase()) {
                        ticket = await Ticket.findOne({
                            user: fromEmail,
                            status: { $in: ['Open', 'In Progress', 'New Reply'] }
                        });
                    }

                    // IF STILL NO TICKET AND NO TKT TAG -> IGNORE (Prevents personal mail clutter)
                    if (!ticket && !ticketMatch) {
                        // console.log(`     -> Skipping unrelated email: ${subject}`);
                        continue;
                    }

                    // 1. DUPLICATE CHECK
                    const isDuplicate = await Ticket.findOne({ "messages.messageId": messageId });
                    if (isDuplicate) continue;

                    const newMessage = {
                        sender: fromName,
                        text: fullBody, // Send full body to frontend for smart parsing
                        messageId: messageId,
                        timestamp: parsed.date || new Date()
                    };

                    if (ticket) {
                        console.log(`     -> Appending to Ticket ${ticket.id} (${folder})`);
                        ticket.messages.push(newMessage);
                        // Only change status to New Reply if it's an incoming email (INBOX)
                        if (folder === 'INBOX' && fromEmail.toLowerCase() !== config.imap.user.toLowerCase()) {
                            ticket.status = 'New Reply';
                            ticket.hasUnread = true;
                        }
                        ticket.updatedAt = new Date();
                        await ticket.save();
                    } else if (ticketMatch) {
                        // This case happens if the ticket was deleted or is the first time we see it but it has a tag?
                        // Usually unlikely, but we skip starting new tickets without an active thread or explicit tag
                    }
                    newMessagesCount++;
                }
            } catch (err) {
                console.warn(`Could not open folder ${folder}:`, err.message);
            }
        }

        console.log(`✅ Sync Complete. ${newMessagesCount} messages updated.`);
        return { success: true, count: newMessagesCount };

    } catch (err) {
        console.error("❌ IMAP Error:", err);
        return { success: false, error: err.message };
    } finally {
        if (connection) connection.end();
    }
};

module.exports = { syncEmails };
