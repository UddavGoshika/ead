import React, { useState, useEffect } from 'react';
import styles from './ReferAndEarn.module.css';
import {
    Gift, Copy, Share2, Users, IndianRupee,
    ArrowRight, CheckCircle, Tag, Timer,
    Zap, Star, Award, Lock, Unlock, X, Shield
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { referralService } from '../../../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const ReferAndEarn: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [offers, setOffers] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

    // Modal states
    const [selectedOffer, setSelectedOffer] = useState<any>(null);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [modalCopied, setModalCopied] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, offersRes, historyRes] = await Promise.all([
                    referralService.getStats(),
                    referralService.getOffers(),
                    referralService.getOffersHistory()
                ]);
                if (statsRes.data.success) setStats(statsRes.data.stats);
                if (offersRes.data.success) setOffers(offersRes.data.offers);
                if (historyRes.data.success) setHistory(historyRes.data.offers);
            } catch (err) {
                console.error('Failed to fetch referral data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const copyToClipboard = (text: string, isFromModal = false) => {
        navigator.clipboard.writeText(text);
        if (isFromModal) {
            setModalCopied(true);
            setTimeout(() => setModalCopied(false), 2000);
            // Lock back logic: The user asked "once ti will again locked" after copy
            // But usually we want them to see it. If I lock it instantly it's annoying.
            // I'll lock it after 3 seconds or when modal closes.
            setTimeout(() => setIsUnlocked(false), 3000);
        } else {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleUseNow = (offer: any) => {
        setSelectedOffer(offer);
        setIsUnlocked(false);
    };

    const referralCode = stats?.referralCode || user?.myReferralCode || 'REF-EA-XXXX';

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1>Refer & Earn Rewards</h1>
                    <p>Invite your friends and colleagues to E-Advocate and earn rewards for every successful signup.</p>
                </motion.div>
            </header>

            <div className={styles.statsGrid}>
                {[
                    { label: 'Total Referrals', value: stats?.totalReferrals || 0, icon: <Users />, color: '#3b82f6' },
                    { label: 'Total Earned', value: `₹${stats?.totalEarned || 0}`, icon: <IndianRupee />, color: '#10b981' },
                    { label: 'Pending Rewards', value: `₹${(stats?.totalEarned || 0) - (stats?.totalWithdrawn || 0)}`, icon: <Timer />, color: '#facc15' },
                    { label: 'Referral Level', value: 'Level 1', icon: <Award />, color: '#8b5cf6' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        className={styles.statCard}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <div className={styles.statIcon} style={{ background: `${stat.color}15`, color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className={styles.statInfo}>
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className={styles.mainGrid}>
                <motion.div
                    className={styles.referCard}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className={styles.cardHeader}>
                        <Gift className={styles.giftIcon} />
                        <h2>Your Referral Code</h2>
                    </div>
                    <div className={styles.codeBox}>
                        <code>{referralCode}</code>
                        <button onClick={() => copyToClipboard(referralCode)} className={styles.copyBtn}>
                            {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                            <span>{copied ? 'Copied' : 'Copy Code'}</span>
                        </button>
                    </div>
                    <p className={styles.hint}>Share this code with others to earn rewards when they register.</p>

                    <div className={styles.steps}>
                        <div className={styles.step}>
                            <div className={styles.stepNum}>1</div>
                            <p>Share code with friends</p>
                        </div>
                        <ArrowRight size={16} className={styles.stepArrow} />
                        <div className={styles.step}>
                            <div className={styles.stepNum}>2</div>
                            <p>They signup using code</p>
                        </div>
                        <ArrowRight size={16} className={styles.stepArrow} />
                        <div className={styles.step}>
                            <div className={styles.stepNum}>3</div>
                            <p>You earn rewards!</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.offersSection}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <div className={styles.sectionHeader}>
                        <h2>Offers & Cashback</h2>
                        <div className={styles.tabGroup}>
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'active' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('active')}
                            >
                                Active
                            </button>
                            <button
                                className={`${styles.tabBtn} ${activeTab === 'history' ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab('history')}
                            >
                                History
                            </button>
                        </div>
                    </div>

                    <div className={styles.offersList}>
                        {activeTab === 'active' ? (
                            offers.length > 0 ? offers.map((offer, i) => (
                                <div key={i} className={styles.offerCard}>
                                    <div className={styles.offerBadge}>{offer.category}</div>
                                    <div className={styles.offerContent}>
                                        <div className={styles.offerIcon}>
                                            {offer.category === 'Cashback' ? <IndianRupee /> : <Tag />}
                                        </div>
                                        <div className={styles.offerDetails}>
                                            <h3>{offer.title}</h3>
                                            <p>{offer.description || `Get ${offer.discountValue}${offer.discountType === 'Percentage' ? '%' : ' INR'} reward.`}</p>
                                            <div className={styles.offerMeta}>
                                                <span><Lock size={12} style={{ marginRight: 4 }} /> Code Locked</span>
                                                {offer.minPurchase > 0 && <span>Min. Spend: ₹{offer.minPurchase}</span>}
                                            </div>
                                        </div>
                                        <button className={styles.applyBtn} onClick={() => handleUseNow(offer)}>Use Now</button>
                                    </div>
                                </div>
                            )) : (
                                <div className={styles.emptyOffers}>
                                    <Gift size={40} />
                                    <p>No active offers found.</p>
                                </div>
                            )
                        ) : (
                            history.length > 0 ? history.map((offer, i) => (
                                <div key={i} className={styles.offerCard} style={{ opacity: 0.7 }}>
                                    <div className={styles.offerBadge} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}>USED</div>
                                    <div className={styles.offerContent}>
                                        <div className={styles.offerIcon} style={{ color: '#10b981' }}>
                                            <CheckCircle />
                                        </div>
                                        <div className={styles.offerDetails}>
                                            <h3>{offer.title}</h3>
                                            <p>Used on membership upgrade.</p>
                                            <div className={styles.offerMeta}>
                                                <span>Code: {offer.code}</span>
                                                <span>Value: {offer.discountValue}{offer.discountType === 'Percentage' ? '%' : ' INR'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className={styles.emptyOffers}>
                                    <Timer size={40} />
                                    <p>No used offers in your history yet.</p>
                                </div>
                            )
                        )}
                    </div>
                </motion.div>
            </div>

            {/* UNLOCK MODAL */}
            <AnimatePresence>
                {selectedOffer && (
                    <div className={styles.modalOverlay} onClick={() => setSelectedOffer(null)}>
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button className={styles.closeBtn} onClick={() => setSelectedOffer(null)}><X size={20} /></button>

                            <div className={styles.modalHeader}>
                                <h2>Complete Unlock</h2>
                                <p>Unlock the code to use it during checkout. It will only expire after a successful payment.</p>
                            </div>

                            <div className={styles.unlockBox}>
                                {isUnlocked ? (
                                    <div className={styles.unlockedContent}>
                                        <div className={styles.unlockedCode}>{selectedOffer.code}</div>
                                        <button
                                            className={styles.copyCodeBtn}
                                            onClick={() => copyToClipboard(selectedOffer.code, true)}
                                        >
                                            {modalCopied ? <CheckCircle size={20} /> : <Copy size={20} />}
                                            {modalCopied ? 'COPIED!' : 'COPY CODE'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className={styles.lockedContent}>
                                        <div className={styles.lockedText}>XXXX-XXXX</div>
                                        <button className={styles.unlockBtn} onClick={() => setIsUnlocked(true)}>
                                            <Unlock size={20} /> UNLOCK NOW
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', justifyContent: 'center' }}>
                                <Shield size={14} /> <span>Verified Ecosystem Coupon Logic</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReferAndEarn;
