import { useState, useEffect, useRef } from "react";
import styles from './premser.module.css';
import axios from 'axios';
import QRCode from 'react-qr-code';
import {
    CreditCard,
    Smartphone,
    Receipt,
    ArrowRight,
    QrCode,
    Check,
    Star,
    Shield,
    Zap,
    Cpu,
    Globe,
    Clock,
    X,
    Lock
} from 'lucide-react';
import { PaymentManager } from '../../services/payment/PaymentManager';
import type { PaymentGateway } from '../../types/payment';
import { useAuth } from '../../context/AuthContext';

type PlanKey = "free" | "lite" | "pro" | "ultra";
type TierKey = "silver" | "gold" | "platinum";

type MembershipPlan = {
    title: string;
    icon: any;
    description: string;
    features: string[];
};

const membershipPlans: Record<PlanKey, MembershipPlan> = {
    free: {
        title: "Free Access",
        icon: <Star size={24} />,
        description: "Explore the platform with basic features and public access.",
        features: [
            "Basic Search Visibility",
            "Public Profile Access",
            "Send Case Interest (Limited)",
            "Community Support Access",
            "Mobile Web View",
            "Legal Resource Library"
        ],
    },
    lite: {
        title: "Pro Lite",
        icon: <Zap size={24} />,
        description: "Essential premium features for growing legal careers.",
        features: [
            "Search Visibility Boost (Basic)",
            "Instant Message Access",
            "Enhanced Profile Badge",
            "Standard Case Interest Posting",
            "Mobile App Access",
            "Email Support"
        ],
    },
    pro: {
        title: "Pro",
        icon: <Shield size={24} />,
        description: "Advanced tools for established legal professionals.",
        features: [
            "Top-of-Search Priority Placement",
            "Featured Profile Listing",
            "Profile Visitor Analytics",
            "Direct Super Interest Access",
            "Unlimited Case Interests",
            "Voice & Video Call Support",
            "24/7 Priority Support"
        ],
    },
    ultra: {
        title: "Ultra Pro Luxury",
        icon: <Cpu size={24} />,
        description: "The ultimate privilege. Elite status and unparalleled tools.",
        features: [
            "Exclusive 'Ultra' Verification Badge",
            "Global Network Visibility",
            "Personalized AI Legal Assistant",
            "Dedicated Relationship Manager",
            "Unlimited Super Interests",
            "Priority Access to High-Value Cases",
            "Exclusive Industry Networking Events",
            "Advanced CRM Integration"
        ],
    },
};

const PLAN_PRICES: Record<PlanKey, Record<TierKey, number>> = {
    free: { silver: 0, gold: 0, platinum: 0 },
    lite: { silver: 500, gold: 1000, platinum: 1500 },
    pro: { silver: 5000, gold: 10000, platinum: 15000 },
    ultra: { silver: 25000, gold: 35000, platinum: 50000 }
};

const Preservices: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<PlanKey>("lite");
    const [selectedTier, setSelectedTier] = useState<TierKey | null>(null);
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | ''>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [upiUrl, setUpiUrl] = useState<string | null>(null);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
    const { user, isLoggedIn } = useAuth();
    const timerRef = useRef<any>(null);

    useEffect(() => {
        const loadGateways = async () => {
            const gateways = await PaymentManager.getInstance().getEnabledGateways();
            if (gateways.length > 0) setSelectedGateway(gateways[0].gateway);
        };
        loadGateways();
    }, []);

    // Timer Logic for UPI
    useEffect(() => {
        if (upiUrl && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setUpiUrl(null);
            alert("Payment session expired. Please try again.");
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [upiUrl, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleTierSelect = (tier: TierKey) => {
        setSelectedTier(tier);
        setUpiUrl(null);
        setTimeLeft(300);
    };

    const price = (activeCategory && selectedTier) ? PLAN_PRICES[activeCategory][selectedTier] : 0;

    const handleBuyNow = async () => {
        if (!isLoggedIn) { alert("Please login to proceed."); return; }
        if (!selectedTier) { alert("Please select a tier."); return; }
        if (activeCategory === "free") { alert("Free plan is already available."); return; }
        if (!selectedGateway) { alert("Please select a payment method."); return; }

        setIsProcessing(true);
        try {
            const result = await PaymentManager.getInstance().processPayment(
                selectedGateway,
                `${activeCategory}_${selectedTier}`,
                price,
                'INR',
                {
                    planTitle: `${membershipPlans[activeCategory].title} (${selectedTier.toUpperCase()})`,
                    userName: user?.name,
                    userEmail: user?.email,
                }
            );

            if (result.success) {
                if (selectedGateway === 'upi' && result.metadata?.upiUrl) {
                    setUpiUrl(result.metadata.upiUrl);
                    setCurrentOrderId(result.orderId);
                    setTimeLeft(300); // Start 5 min timer
                } else {
                    alert("Success! Your account has been upgraded.");
                    window.location.reload();
                }
            } else {
                alert(`Payment failed: ${result.error}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/* UPI Rich Page / Overlay */}
            {upiUrl && (
                <div className={styles.upiOverlay}>
                    <div className={styles.upiContent}>
                        <button className={styles.closeBtn} onClick={() => setUpiUrl(null)}><X size={24} /></button>
                        <div className={styles.upiHeader}>
                            <div className={styles.richIcon}><QrCode size={40} /></div>
                            <h2>Secure Payment Protocol</h2>
                            <p>Complete your upgrade to <strong>{membershipPlans[activeCategory].title} ({selectedTier})</strong></p>
                        </div>

                        <div className={styles.richQrBox}>
                            <div className={styles.qrCorner}></div>
                            <div className={styles.qrInner}>
                                <QRCode value={upiUrl} size={220} bgColor="transparent" fgColor="#fff" />
                            </div>
                            <div className={styles.qrScannerLine}></div>
                        </div>

                        <div className={styles.timerContainer}>
                            <div className={styles.timerCircle}>
                                <Clock size={20} />
                                <span className={styles.timerText}>{formatTime(timeLeft)}</span>
                            </div>
                            <p className={styles.timerHint}>Scan before timer expires for secure verification</p>
                        </div>

                        <div className={styles.upiActions}>
                            <button className={styles.richVerifyBtn} onClick={async () => {
                                setIsProcessing(true);
                                try {
                                    const token = localStorage.getItem('token');
                                    const response = await axios.post('/api/payments/verify', {
                                        orderId: currentOrderId,
                                        paymentId: 'upi_' + Math.random().toString(36).substring(7),
                                        gateway: 'upi'
                                    }, { headers: { Authorization: token || '' } });
                                    if (response.data.success) { window.location.reload(); }
                                } catch (err) { } finally { setIsProcessing(false); }
                            }}>
                                {isProcessing ? 'CONFIRMING...' : 'I HAVE PAID'}
                            </button>
                            <p className={styles.secureBadge}><Lock size={12} /> SSL SECURE 256-BIT ENCRYPTION</p>
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.headerSection}>
                <div className={styles.badge}>ELITE INFRASTRUCTURE</div>
                <h1 className={styles.title}>Premium Ecosystem</h1>
                <p className={styles.subtitle}>Navigate through our futuristic membership tiers designed for total legal dominance.</p>
            </div>

            {/* Futuristic Tab Bar */}
            <div className={styles.tabContainer}>
                {(["free", "lite", "pro", "ultra"] as const).map((cat) => (
                    <button
                        key={cat}
                        className={`${styles.planTab} ${activeCategory === cat ? styles.activeTab : ''}`}
                        onClick={() => {
                            setActiveCategory(cat);
                            setSelectedTier(null); // Reset tier when switching category
                        }}
                    >
                        {membershipPlans[cat].icon}
                        <span>{membershipPlans[cat].title}</span>
                    </button>
                ))}
            </div>

            <div className={styles.membershipWrapper}>
                <div className={styles.activeTierDisplay}>
                    <div className={styles.categoryInfo}>
                        <h2 className={styles.categoryHeading}>{membershipPlans[activeCategory].title}</h2>
                        <p className={styles.categoryDesc}>{membershipPlans[activeCategory].description}</p>
                    </div>

                    <div className={styles.tiersContainer}>
                        {(["silver", "gold", "platinum"] as const).map((tier) => (
                            <div
                                key={tier}
                                className={`${styles.tierCard} ${selectedTier === tier ? styles.selectedTier : ''}`}
                                onClick={() => handleTierSelect(tier)}
                            >
                                <div className={styles.tierHeader}>
                                    <span className={styles.tierName}>{tier}</span>
                                    <div className={styles.tierPriceContainer}>
                                        <span className={styles.currency}>₹</span>
                                        <span className={styles.tierPrice}>{PLAN_PRICES[activeCategory][tier].toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className={styles.benefitList}>
                                    {membershipPlans[activeCategory].features.map((feature, idx) => (
                                        <div key={idx} className={styles.featureItem}>
                                            <Check size={14} className={styles.checkIcon} />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className={styles.selectBtn}>
                                    {selectedTier === tier ? 'SELECTED' : 'SELECT TIER'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.loginPanel}>
                    {(!selectedTier) ? (
                        <div className={styles.noSelection}>
                            <div className={styles.luxuryIcon}><Star size={48} /></div>
                            <h3>Futuristic Checkout</h3>
                            <p>Select a tier to activate the summary and initialize secure payment protocols.</p>
                        </div>
                    ) : (
                        <div className={styles.summaryContent}>
                            <div className={styles.summaryHeader}>
                                <span className={styles.summaryLabel}>Package Summary</span>
                                <h1 className={styles.planTitleSummary}>{membershipPlans[activeCategory].title}</h1>
                                <div className={styles.tierBadgeContainer}>
                                    <span className={styles.tierBadge}>{selectedTier}</span>
                                    <Shield size={18} className={styles.platinumIcon} />
                                </div>
                            </div>

                            <div className={styles.pricePanel}>
                                <div className={styles.priceRow}>
                                    <span>Subscription Value</span>
                                    <span className={styles.totalAmount}>₹{price.toLocaleString()}</span>
                                </div>
                                <div className={styles.priceRow}>
                                    <span>Network Fee</span>
                                    <span className={styles.taxAmount}>Inclusive</span>
                                </div>
                            </div>

                            <div className={styles.paymentSection}>
                                <label className={styles.sectionLabel}>Secure Gateways</label>
                                <div className={styles.gatewayGrid}>
                                    {['razorpay', 'paytm', 'stripe', 'upi', 'invoice'].map(gw => (
                                        <button
                                            key={gw}
                                            className={`${styles.gwBtn} ${selectedGateway === gw ? styles.activeGw : ''}`}
                                            onClick={() => setSelectedGateway(gw as PaymentGateway)}
                                            disabled={isProcessing}
                                        >
                                            {gw === 'razorpay' && <CreditCard size={18} />}
                                            {gw === 'paytm' && <Smartphone size={18} />}
                                            {gw === 'stripe' && <Globe size={18} />}
                                            {gw === 'upi' && <QrCode size={18} />}
                                            {gw === 'invoice' && <Receipt size={18} />}
                                            <span>{gw}</span>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className={styles.buyBtn}
                                    onClick={handleBuyNow}
                                    disabled={isProcessing || activeCategory === 'free'}
                                >
                                    {isProcessing ? 'CONNECTING...' : (
                                        activeCategory === 'free' ? 'ALREADY ACTIVE' : (
                                            <>
                                                <span>SECURE PAYMENT • ₹{price.toLocaleString()}</span>
                                                <ArrowRight size={20} />
                                            </>
                                        )
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Preservices;
