import React, { useState, useEffect } from 'react';
import styles from './ReferralDashboard.module.css';
import {
    Users,
    IndianRupee,
    ArrowUpRight,
    Wallet,
    Copy,
    CheckCircle,
    Search,
    Filter,
    ArrowDownLeft,
    Share2,
    Briefcase,
    Calendar,
    ExternalLink,
    PieChart,
    LogOut,
    Bell,
    User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { referralService } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const ReferralDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('referrals');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawSubmitting, setWithdrawSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, referralsRes] = await Promise.all([
                referralService.getStats(),
                referralService.getReferrals()
            ]);

            if (statsRes.data.success) setStats(statsRes.data.stats);
            if (referralsRes.data.success) setReferrals(referralsRes.data.referrals);
        } catch (err) {
            console.error("Dashboard error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const copyCode = () => {
        navigator.clipboard.writeText(stats?.referralCode || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!withdrawAmount || isNaN(Number(withdrawAmount))) return;

        try {
            setWithdrawSubmitting(true);
            const res = await referralService.withdraw({ amount: Number(withdrawAmount) });
            if (res.data.success) {
                alert("Withdrawal request submitted successfully!");
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                fetchData();
            }
        } catch (err: any) {
            alert(err.response?.data?.error || "Withdrawal failed");
        } finally {
            setWithdrawSubmitting(false);
        }
    };

    if (loading) return <div className={styles.loader}>Loading Dashboard...</div>;

    const summaryCards = [
        { title: 'Total Referrals', value: stats?.totalReferrals || 0, icon: <Users />, color: '#3b82f6', change: '+12%' },
        { title: 'Total Earned', value: `₹${stats?.totalEarned?.toLocaleString()}`, icon: <IndianRupee />, color: '#10b981', change: '+₹4500' },
        { title: 'Wallet Balance', value: `₹${stats?.walletBalance?.toLocaleString()}`, icon: <Wallet />, color: '#facc15', action: true },
        { title: 'Total Withdrawn', value: `₹${stats?.totalWithdrawn?.toLocaleString()}`, icon: <ArrowUpRight />, color: '#f43f5e' }
    ];

    return (
        <div className={styles.container}>
            {/* TOP BAR */}
            <header className={styles.topBar}>
                <div className={styles.userInfo}>
                    <div className={styles.avatar}><User size={24} /></div>
                    <div>
                        <h2>{user?.name}</h2>
                        <span className={styles.roleBadge}>{user?.role?.toUpperCase()}</span>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.notifBtn}><Bell size={20} /></button>
                    <button className={styles.logoutBtn} onClick={logout}><LogOut size={20} /> Logout</button>
                </div>
            </header>

            <div className={styles.mainLayout}>
                {/* LEFT CONTENT */}
                <div className={styles.primaryContent}>
                    {/* STATS GRID */}
                    <div className={styles.statsGrid}>
                        {summaryCards.map((card, i) => (
                            <motion.div
                                key={card.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={styles.statCard}
                            >
                                <div className={styles.statIcon} style={{ color: card.color }}>
                                    {card.icon}
                                </div>
                                <div className={styles.statInfo}>
                                    <span className={styles.statTitle}>{card.title}</span>
                                    <h3 className={styles.statValue}>{card.value}</h3>
                                    {card.action ? (
                                        <button className={styles.withdrawLink} onClick={() => setShowWithdrawModal(true)}>Withdraw Funds</button>
                                    ) : (
                                        <span className={styles.statChange}>{card.change}</span>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* REFERRAL LINK SECTION */}
                    <div className={styles.referralHero}>
                        <div className={styles.heroText}>
                            <h3>Invite your network</h3>
                            <p>Share your code and earn high-tier commissions on every successful subscription.</p>
                            <div className={styles.codeBox}>
                                <code>{stats?.referralCode}</code>
                                <button onClick={copyCode}>
                                    {copied ? <CheckCircle size={18} color="#10b981" /> : <Copy size={18} />}
                                    {copied ? 'Copied' : 'Copy Code'}
                                </button>
                                <button className={styles.shareBtn}><Share2 size={18} /> Share</button>
                            </div>
                        </div>
                        <div className={styles.heroVisual}>
                            <PieChart size={120} color="#3b82f6" opacity={0.5} />
                        </div>
                    </div>

                    {/* TABS & TABLE */}
                    <div className={styles.tableCard}>
                        <div className={styles.tabs}>
                            <button
                                className={activeTab === 'referrals' ? styles.activeTab : ''}
                                onClick={() => setActiveTab('referrals')}
                            >
                                <Users size={16} /> My Referrals
                            </button>
                            <button
                                className={activeTab === 'earnings' ? styles.activeTab : ''}
                                onClick={() => setActiveTab('earnings')}
                            >
                                <IndianRupee size={16} /> Earning History
                            </button>
                        </div>

                        <div className={styles.tableToolbar}>
                            <div className={styles.searchBox}>
                                <Search size={18} />
                                <input type="text" placeholder="Search referrals..." />
                            </div>
                            <button className={styles.filterBtn}><Filter size={18} /> Filter</button>
                        </div>

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Referee Details</th>
                                        <th>Joined On</th>
                                        <th>Total Paid</th>
                                        <th>My Earnings</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referrals.length > 0 ? referrals.map((ref) => (
                                        <tr key={ref.id}>
                                            <td>
                                                <div className={styles.userCell}>
                                                    <div className={styles.userAvatar}>{ref.referee.name.charAt(0)}</div>
                                                    <div>
                                                        <div className={styles.userName}>{ref.referee.name}</div>
                                                        <div className={styles.userSub}>{ref.referee.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.dateCell}>
                                                    <Calendar size={14} />
                                                    {new Date(ref.referee.joinedAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className={styles.boldText}>₹{ref.totalPaid.toLocaleString()}</td>
                                            <td className={styles.earnedText}>+₹{ref.myEarnings.toLocaleString()}</td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[ref.status.toLowerCase()]}`}>
                                                    {ref.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className={styles.emptyTable}>No referrals found yet. Start sharing your link!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR (Quick Actions/Payouts) */}
                <div className={styles.secondaryContent}>
                    <div className={styles.payoutCard}>
                        <h4>Quick Payouts</h4>
                        <p>Funds generally reach your bank account within 24-48 hours.</p>
                        <div className={styles.bankPreview}>
                            <Briefcase size={20} />
                            <div>
                                <strong>HDFC Bank ****4592</strong>
                                <span>Charlie Smith (Primary)</span>
                            </div>
                        </div>
                        <button className={styles.actionBtn} onClick={() => setShowWithdrawModal(true)}>Request Withdrawal</button>
                    </div>

                    <div className={styles.supportCard}>
                        <h4>Need Assistance?</h4>
                        <p>Our referral managers are available 24/7 to help you optimize your growth.</p>
                        <button className={styles.outlineBtn}>Contact Manager</button>
                    </div>
                </div>
            </div>

            {/* WITHDRAW MODAL */}
            {showWithdrawModal && (
                <div className={styles.modalOverlay}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={styles.modal}
                    >
                        <div className={styles.modalHeader}>
                            <h3>Withdraw Funds</h3>
                            <button onClick={() => setShowWithdrawModal(false)}><X /></button>
                        </div>
                        <form onSubmit={handleWithdraw}>
                            <div className={styles.inputGroup}>
                                <label>Amount to Withdraw (₹)</label>
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    max={stats?.walletBalance}
                                />
                                <span className={styles.availableHint}>Available: ₹{stats?.walletBalance}</span>
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" onClick={() => setShowWithdrawModal(false)}>Cancel</button>
                                <button type="submit" disabled={withdrawSubmitting}>
                                    {withdrawSubmitting ? 'Processing...' : 'Confirm Withdrawal'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ReferralDashboard;

const X = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);
