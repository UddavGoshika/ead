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
    const coinsPackage = features.monthlyCoins === 'unlimited' ? '∞' : features.monthlyCoins;

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
            spent: (statsData?.sent || 0) * 5
        },
        {
            label: 'Profiles Viewed',
            val: statsData?.visits || 0,
            icon: ShieldCheck,
            color: '#8b5cf6',
            spent: (statsData?.visits || 0) * 0.5
        },
        {
            label: 'Active Chats',
            val: statsData?.accepted || 0,
            icon: MessageCircle,
            color: '#3b82f6',
            spent: (statsData?.accepted || 0) * 3
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

    const getActionCost = (type: string) => {
        switch (type) {
            case 'superInterest': return 5;
            case 'interest': return 1;
            case 'chat': return 3;
            case 'visit': return 0.5;
            default: return 0;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.headerRow}>
                <div className={styles.titleInfo}>
                    <h1>My Subscription</h1>
                    <p>Manage your intelligence plan and credit utilization</p>
                </div>
                <button className={styles.upgradeBtn}>
                    <ArrowUpRight size={18} />
                    <span>Change Plan</span>
                </button>
            </div>

            <div className={styles.subscriptionGrid}>
                {/* Left Column: Wallet & Current Plan */}
                <div className={styles.leftCol}>
                    <div className={styles.glassCard}>
                        <div className={styles.cardHeader}>
                            <Zap size={20} color="#d4af37" />
                            <span>Plan Status: <span style={{ color: '#d4af37' }}>{packageName}</span></span>
                        </div>

                        <div className={styles.walletDisplay}>
                            <div className={styles.coinCount}>
                                <Coins size={32} color="#fbbf24" />
                                <span>{coinsAvailable}</span>
                            </div>
                            <p className={styles.subtext}>Tokens remaining in current cycle</p>
                        </div>

                        <div className={styles.limitsList}>
                            <div className={styles.limitItem}>
                                <span>Monthly Allocation</span>
                                <b>{coinsPackage} Tokens</b>
                            </div>
                            <div className={styles.limitItem}>
                                <span>Plan Expiry</span>
                                <b>28 Days Remaining</b>
                            </div>
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
                            <span>Intelligence Utilization</span>
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
                                <span>Recent Consumption</span>
                            </div>

                            <div className={styles.ledgerList}>
                                {activities.length > 0 ? activities.map((act, i) => (
                                    <div key={i} className={styles.ledgerItem}>
                                        <div className={styles.ledgerIcon}>
                                            <ActivityIcon size={16} />
                                        </div>
                                        <div className={styles.ledgerInfo}>
                                            <b>{act.type.charAt(0).toUpperCase() + act.type.slice(1)}</b>
                                            <span>{act.partnerName || 'System Action'}</span>
                                        </div>
                                        <div className={styles.ledgerCost}>
                                            -{getActionCost(act.type)}
                                        </div>
                                    </div>
                                )) : (
                                    <div className={styles.emptyLedger}>No recent intelligence consumption</div>
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
