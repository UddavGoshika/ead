import React from 'react';
import {
    Zap,
    MessageCircle,
    Star,
    TrendingUp,
    Coins,
    ShieldCheck,
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    Activity as ActivityIcon,
    History
} from 'lucide-react';
import usePackageRestrictions from '../../../hooks/usePackageRestrictions';
import { useAuth } from '../../../context/AuthContext';
import { interactionService } from '../../../services/interactionService';
import styles from './PlanOverview.module.css';

const PlanOverview: React.FC = () => {
    const { user } = useAuth();
    const { features, packageName } = usePackageRestrictions();
    const [statsData, setStatsData] = React.useState<any>(null);
    const [activities, setActivities] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchData = async () => {
            if (user?.id) {
                try {
                    const [stats, history] = await Promise.all([
                        interactionService.getActivityStats(String(user.id)),
                        interactionService.getAllActivities(String(user.id))
                    ]);
                    setStatsData(stats);
                    setActivities(history.slice(0, 5)); // Show last 5
                } catch (err) {
                    console.error("Failed to fetch subscription data", err);
                }
            }
        };
        fetchData();
    }, [user?.id]);

    const coinsAvailable = user?.coins || 0;
    const planType = user?.planType || 'Free';
    const planTier = user?.planTier || (user?.plan?.includes('Silver') ? 'Silver' : user?.plan?.includes('Gold') ? 'Gold' : user?.plan?.includes('Platinum') ? 'Platinum' : '');
    const fullPlanLabel = planTier ? `${planType} - ${planTier}` : user?.plan || 'Free';

    const stats = [
        {
            label: 'Interests Sent',
            val: statsData?.sent || 0,
            icon: TrendingUp,
            color: '#10b981',
            spent: (statsData?.sent || 0) * 1
        },
        {
            label: 'Super Interests',
            val: statsData?.sent || 0,
            icon: Star,
            color: '#facc15',
            spent: (statsData?.sent || 0) * 2
        },
        {
            label: 'Contact Unlocks',
            val: activities.filter(a => a.type === 'view_contact').length,
            icon: ShieldCheck,
            color: '#8b5cf6',
            spent: activities.filter(a => a.type === 'view_contact').length * 1
        },
        {
            label: 'Chat Unlocks',
            val: activities.filter(a => a.type === 'chat').length,
            icon: MessageCircle,
            color: '#3b82f6',
            spent: activities.filter(a => a.type === 'chat').length * 1
        }
    ];

    const benefits = [
        "Unmasked Featured Profiles",
        "Direct Messaging Access",
        "Advanced Search Filters",
        "Priority Profile Support",
        "Higher Trust Rating Badge",
        "Access to Legal Research Tools"
    ];

    const handleActivateDemo = async () => {
        try {
            const response = await fetch('/api/auth/activate-demo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `user-token-${user?.id}`
                },
                body: JSON.stringify({ userId: user?.id })
            });
            const data = await response.json();
            if (data.success) {
                alert('Temporary – 1 Day Trial Activated Successfully!');
                window.location.reload();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <div className={styles.titleInfo}>
                    <h1>My Subscription</h1>
                    <p>Manage your intelligence plan and token utilization</p>
                </div>
                {!user?.isPremium && !user?.demoUsed && (
                    <button className={styles.upgradeBtn} style={{ background: '#facc15', color: '#000' }} onClick={handleActivateDemo}>
                        <Zap size={18} />
                        <span>Activate 1-Day Trial</span>
                    </button>
                )}
                <button className={styles.upgradeBtn}>
                    <ArrowUpRight size={18} />
                    <span>Upgrade Plan</span>
                </button>
            </div>

            <div className={styles.subscriptionGrid}>
                {/* Left Column: Wallet & Current Plan (Rule 16) */}
                <div className={styles.leftCol}>
                    <div className={styles.glassCard}>
                        <div className={styles.cardHeader}>
                            <Zap size={20} color="#d4af37" />
                            <span>Current Plan: <span style={{ color: '#d4af37', fontWeight: 700 }}>{fullPlanLabel}</span></span>
                        </div>

                        <div className={styles.walletDisplay}>
                            <div className={styles.coinCount}>
                                <Coins size={32} color="#fbbf24" />
                                <span>{coinsAvailable}</span>
                            </div>
                            <p className={styles.subtext}>Tokens remaining in your account</p>
                        </div>

                        <div className={styles.limitsList}>
                            <div className={styles.limitItem}>
                                <span>Plan Type</span>
                                <b>{planType}</b>
                            </div>
                            <div className={styles.limitItem}>
                                <span>Sub-Package</span>
                                <b style={{ color: '#facc15' }}>{planTier || 'Standard'}</b>
                            </div>
                            <div className={styles.limitItem}>
                                <span>Total Tokens Received</span>
                                <b>{user?.coinsReceived || 0}</b>
                            </div>
                            <div className={styles.limitItem}>
                                <span>Tokens Used</span>
                                <b>{user?.coinsUsed || 0}</b>
                            </div>
                            <div className={styles.limitItem}>
                                <span>Remaining Tokens</span>
                                <b style={{ color: '#10b981' }}>{coinsAvailable}</b>
                            </div>
                            {user?.premiumExpiry && (
                                <div className={styles.limitItem}>
                                    <span>Plan Expiry</span>
                                    <b style={{ color: '#ef4444' }}>
                                        {new Date(user.premiumExpiry).toLocaleDateString()}
                                    </b>
                                </div>
                            )}
                            {user?.demoExpiry && (
                                <div className={styles.limitItem}>
                                    <span>Trial Expiry (12 Hrs)</span>
                                    <b style={{ color: '#ef4444' }}>
                                        {new Date(user.demoExpiry).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </b>
                                </div>
                            )}
                        </div>

                        <div className={styles.benefitSection}>
                            <h4>Included Benefits</h4>
                            <div className={styles.benefitGrid}>
                                {benefits.map((b, i) => (
                                    <div key={i} className={styles.benefitItem}>
                                        <CheckCircle2 size={14} color="#10b981" />
                                        <span>{b}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Statistics & Ledger */}
                <div className={styles.rightCol}>
                    <div className={styles.glassCard}>
                        <div className={styles.cardHeader}>
                            <TrendingUp size={20} color="#3b82f6" />
                            <span>Token Consumption Stats</span>
                        </div>

                        <div className={styles.statsRow}>
                            {stats.map((s, i) => (
                                <div key={i} className={styles.compactStat}>
                                    <div className={styles.statDot} style={{ backgroundColor: s.color }}></div>
                                    <span className={styles.compactLabel}>{s.label}</span>
                                    <span className={styles.compactVal}>{s.val}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.ledgerSection}>
                            <div className={styles.ledgerHeader}>
                                <div className={styles.headerLeft}>
                                    <History size={18} />
                                    <h4>Intelligence Ledger</h4>
                                </div>
                                <span>Usage History</span>
                            </div>

                            <div className={styles.ledgerList}>
                                {activities.length > 0 ? activities.map((act, i) => (
                                    <div key={i} className={styles.ledgerItem}>
                                        <div className={styles.ledgerIcon}>
                                            <ActivityIcon size={16} />
                                        </div>
                                        <div className={styles.ledgerInfo}>
                                            <b>{act.type.charAt(0).toUpperCase() + act.type.slice(1)}</b>
                                            <span>{act.partnerName || 'Platform Service'}</span>
                                        </div>
                                        <div className={styles.ledgerCost}>
                                            {act.metadata?.cost ? `-${act.metadata.cost} Tokens` : '0 Tokens'}
                                        </div>
                                    </div>
                                )) : (
                                    <div className={styles.emptyLedger}>No token consumption history</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanOverview;
