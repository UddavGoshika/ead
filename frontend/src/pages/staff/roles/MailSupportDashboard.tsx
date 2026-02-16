
import React, { useState, useEffect } from 'react';
import styles from './GmailMailbox.module.css';
import api from '../../../services/api';
import {
    Mail, RotateCcw, Send, Paperclip,
    MoreVertical, Search, Filter,
    Star, Trash2, Archive, AlertOctagon,
    Folder, Tag, Square, CheckSquare,
    ChevronLeft, ChevronRight, Inbox,
    Clock, Send as SendIcon, FileText,
    AlertCircle, MessageCircle, Info,
    Users, LayoutGrid, Reply, Forward,
    Smile, ArrowLeft, MoreHorizontal,
    Menu as MenuIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ticket {
    id: string;
    subject: string;
    user: string;
    status: string;
    createdAt: string;
    updatedAt?: string;
    messages: { sender: string; text: string; timestamp: string }[];
}

const MailSupportDashboard = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('Primary');
    const [isReplying, setIsReplying] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/support/tickets');
            if (res.data.success) {
                setTickets(res.data.tickets);
            }
        } catch (err) {
            console.error("Failed to fetch tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setLoading(true);
        try {
            const res = await api.get('/support/sync');
            if (res.data.success && res.data.count > 0) {
                fetchData();
            }
        } catch (err) {
            console.error("Sync error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(handleSync, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const handleReply = async () => {
        if (!selectedTicket || !replyText.trim()) return;
        setLoading(true);
        try {
            await api.post('/support/reply', {
                ticketId: selectedTicket.id,
                message: replyText
            });
            setReplyText('');
            setIsReplying(false);
            fetchData();
            // Refetch or update local state
            const updated = await api.get('/support/tickets');
            if (updated.data.success) {
                setTickets(updated.data.tickets);
                const stillActive = updated.data.tickets.find((t: Ticket) => t.id === selectedTicket.id);
                if (stillActive) setSelectedTicket(stillActive);
            }
        } catch (err: any) {
            alert('Reply failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const formatDateShort = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        if (date.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    };

    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
            date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredTickets = tickets.filter(t =>
        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.user.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderSidebar = () => (
        <div className={styles.sidebar}>
            <button className={styles.composeBtn}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z" fill="#4285F4" />
                    <path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z" fill="#FBBC05" clipPath="inset(0 11px 11px 0)" />
                    <path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z" fill="#34A853" clipPath="inset(11px 0 0 11px)" />
                    <path d="M20 13h-7v7h-2v-7H4v-2h7V4h2v7h7v2z" fill="#EA4335" clipPath="inset(11px 11px 0 0)" />
                </svg>
                Compose
            </button>
            <div className={`${styles.navItem} ${styles.navItemActive}`}>
                <Inbox size={20} />
                <span>Inbox</span>
                <span className={styles.navItemCount}>{tickets.length}</span>
            </div>
            <div className={styles.navItem}><Star size={20} /> Starred</div>
            <div className={styles.navItem}><Clock size={20} /> Snoozed</div>
            <div className={styles.navItem}><Tag size={20} /> Important</div>
            <div className={styles.navItem}><SendIcon size={20} /> Sent</div>
            <div className={styles.navItem}><FileText size={20} /> Drafts</div>
            <div className={styles.navItem}><AlertCircle size={20} /> Spam</div>
            <div className={styles.navItem}><Trash2 size={20} /> Bin</div>
        </div>
    );

    const renderInbox = () => (
        <div className={styles.mainContent}>
            <div className={styles.header}>
                <MenuIcon size={20} color="#444746" />
                <div className={styles.searchBar}>
                    <Search size={20} color="#444746" />
                    <input
                        placeholder="Search mail"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <LayoutGrid size={20} color="#444746" />
                </div>
            </div>

            <div className={styles.actionBar}>
                <Square size={18} />
                <RotateCcw size={18} className={loading ? styles.spin : ''} onClick={handleSync} />
                <MoreVertical size={18} />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px' }}>1-{filteredTickets.length} of {tickets.length}</span>
                    <ChevronLeft size={18} color="#dadce0" />
                    <ChevronRight size={18} color="#dadce0" />
                </div>
            </div>

            <div className={styles.tabs}>
                <div className={`${styles.tab} ${activeTab === 'Primary' ? styles.tabActive : ''}`} onClick={() => setActiveTab('Primary')}>
                    <Inbox size={18} /> Primary
                </div>
                <div className={`${styles.tab} ${activeTab === 'Promotions' ? styles.tabActive : ''}`} onClick={() => setActiveTab('Promotions')}>
                    <Tag size={18} /> Promotions
                </div>
                <div className={`${styles.tab} ${activeTab === 'Social' ? styles.tabActive : ''}`} onClick={() => setActiveTab('Social')}>
                    <Users size={18} /> Social
                </div>
                <div className={`${styles.tab} ${activeTab === 'Updates' ? styles.tabActive : ''}`} onClick={() => setActiveTab('Updates')}>
                    <Info size={18} /> Updates
                </div>
            </div>

            <div className={styles.emailList}>
                {filteredTickets.map(t => (
                    <div
                        key={t.id}
                        className={`${styles.emailItem} ${t.status === 'New Reply' || t.status === 'Open' ? styles.unread : ''}`}
                        onClick={() => setSelectedTicket(t)}
                    >
                        <Square size={18} className={styles.emailCheckbox} />
                        <Star size={18} className={styles.emailStar} />
                        <Tag size={18} className={styles.emailImportant} fill={t.status === 'New Reply' ? "#fbbc04" : "none"} stroke="#fbbc04" />
                        <div className={styles.emailSender}>{t.user}</div>
                        <div className={styles.emailSubjectContainer}>
                            <span className={styles.emailSubject}>{t.subject}</span>
                            <span className={styles.emailSnippet}>- {t.messages[t.messages.length - 1]?.text.substring(0, 100)}...</span>
                        </div>
                        <div className={styles.emailDate}>{formatDateShort(t.updatedAt || t.createdAt)}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDetail = () => {
        if (!selectedTicket) return null;
        const lastMsg = selectedTicket.messages[selectedTicket.messages.length - 1];

        return (
            <div className={styles.mainContent}>
                <div className={styles.header}>
                    <ArrowLeft size={20} color="#444746" style={{ cursor: 'pointer' }} onClick={() => setSelectedTicket(null)} />
                    <div className={styles.actionBar} style={{ border: 'none', padding: 0 }}>
                        <Archive size={18} className={styles.actionIcon} />
                        <AlertOctagon size={18} className={styles.actionIcon} />
                        <Trash2 size={18} className={styles.actionIcon} />
                        <Mail size={18} className={styles.actionIcon} />
                        <Clock size={18} className={styles.actionIcon} />
                        <CheckSquare size={18} className={styles.actionIcon} />
                        <Folder size={18} className={styles.actionIcon} />
                        <Tag size={18} className={styles.actionIcon} />
                        <MoreVertical size={18} className={styles.actionIcon} />
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px' }}>1 of {tickets.length}</span>
                        <ChevronLeft size={18} />
                        <ChevronRight size={18} />
                    </div>
                </div>

                <div className={styles.emailDetail}>
                    <div className={styles.detailContent}>
                        <h2 className={styles.detailSubject}>{selectedTicket.subject}</h2>
                        <div className={styles.detailHeader}>
                            <div className={styles.avatar}>{selectedTicket.user.charAt(0).toUpperCase()}</div>
                            <div className={styles.headerInfo}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span className={styles.senderName}>{selectedTicket.user}</span>
                                    <span className={styles.detailDate}>{formatFullDate(lastMsg?.timestamp)}</span>
                                </div>
                                <div className={styles.senderEmail}>&lt;user@eadvocate.live&gt;</div>
                            </div>
                            <Star size={18} style={{ margin: '0 16px', color: '#444746' }} />
                            <Reply size={18} style={{ color: '#444746' }} />
                            <MoreVertical size={18} style={{ color: '#444746' }} />
                        </div>

                        <div className={styles.messageBody}>
                            {lastMsg?.text}
                        </div>

                        {isReplying ? (
                            <div className={styles.replySection}>
                                <div className={styles.replyBox}>
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                        <Reply size={16} color="#444746" />
                                        <span style={{ fontSize: '14px', color: '#444746' }}>Reply to {selectedTicket.user}</span>
                                    </div>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        autoFocus
                                    />
                                    <div className={styles.replyBoxActions}>
                                        <button className={styles.sendBtn} onClick={handleReply}>Send</button>
                                        <div style={{ display: 'flex', gap: '16px', color: '#444746' }}>
                                            <Paperclip size={20} />
                                            <Smile size={20} />
                                            <Trash2 size={20} onClick={() => setIsReplying(false)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.bottomActions}>
                                <button className={styles.actionBtn} onClick={() => setIsReplying(true)}>
                                    <Reply size={18} /> Reply
                                </button>
                                <button className={styles.actionBtn} onClick={() => setIsReplying(true)}>
                                    <Reply size={18} style={{ transform: 'translateX(-4px)' }} /> Reply all
                                </button>
                                <button className={styles.actionBtn}>
                                    <Forward size={18} /> Forward
                                </button>
                                <div className={styles.actionIcon}><Smile size={20} /></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.gmailContainer}>
            {renderSidebar()}
            {selectedTicket ? renderDetail() : renderInbox()}
        </div>
    );
};

export default MailSupportDashboard;
