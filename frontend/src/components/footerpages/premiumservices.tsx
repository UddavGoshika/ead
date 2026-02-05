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
    Lock,
    ShieldCheck,
    Gem,
    Crown
} from 'lucide-react';
import { PaymentManager } from '../../services/payment/PaymentManager';
import type { PaymentGateway } from '../../types/payment';
import { useAuth } from '../../context/AuthContext';

// Backend Package Interface
interface BackendTier {
    _id?: string;
    name: string;
    price: number;
    coins: number | "unlimited";
    support?: string;
    active: boolean;
    features?: string[];
    badgeColor?: string;
    glowColor?: string;
    popular?: boolean;
}

interface BackendPackage {
    _id?: string;
    memberType: "advocate" | "client";
    name: string; // This is the category name
    description?: string;
    icon?: string;
    gradient?: string;
    tiers: BackendTier[];
    featured?: boolean;
    sortOrder?: number;
}

type MembershipPlan = {
    title: string;
    icon: any;
    description: string;
    features: string[];
    tiers: {
        name: string;
        price: number;
        active: boolean;
        badgeColor?: string;
        glowColor?: string;
    }[];
};

// Icon mapping helper
const getIconComponent = (iconName?: string) => {
    switch (iconName?.toLowerCase()) {
        case "zap": return <Zap size={24} />;
        case "shield-check": return <ShieldCheck size={24} />;
        case "crown": return <Crown size={24} />;
        case "gem": return <Gem size={24} />;
        case "shield": return <Shield size={24} />;
        case "cpu": return <Cpu size={24} />;
        default: return <Star size={24} />;
    }
};

const Preservices: React.FC = () => {
    const [packages, setPackages] = useState<Record<string, MembershipPlan>>({});
    const [packageKeys, setPackageKeys] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("");
    const [selectedTier, setSelectedTier] = useState<string | null>(null);
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | ''>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [upiUrl, setUpiUrl] = useState<string | null>(null);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer
    const [loading, setLoading] = useState(true);
    const { user, isLoggedIn, openAuthModal } = useAuth();
    const timerRef = useRef<any>(null);

    // Fetch packages from API
    useEffect(() => {
        const fetchPackages = async () => {
            try {
                setLoading(true);
                const memberType = user?.role === 'client' ? 'client' : 'advocate';
                const response = await axios.get(`/api/admin/packages?memberType=${memberType}`);

                if (response.data.success && response.data.packages.length > 0) {
                    const backendPackages: BackendPackage[] = response.data.packages;

                    // Map backend packages to UI structure
                    const mappedPackages: Record<string, MembershipPlan> = {};
                    const keys: string[] = [];

                    backendPackages
                        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                        .forEach((pkg) => {
                            const key = pkg.name.toLowerCase().replace(/\s+/g, '-');
                            keys.push(key);

                            // Get active tiers only
                            const activeTiers = pkg.tiers
                                .filter(tier => tier.active)
                                .map(tier => ({
                                    name: tier.name,
                                    price: tier.price,
                                    active: tier.active,
                                    badgeColor: tier.badgeColor,
                                    glowColor: tier.glowColor
                                }));

                            mappedPackages[key] = {
                                title: pkg.name,
                                icon: getIconComponent(pkg.icon),
                                description: pkg.description || "Premium package features",
                                features: pkg.tiers[0]?.features || [
                                    "Enhanced Profile",
                                    "Priority Support",
                                    "Advanced Features"
                                ],
                                tiers: activeTiers
                            };
                        });

                    setPackages(mappedPackages);
                    setPackageKeys(keys);
                    if (keys.length > 0 && !activeCategory) {
                        setActiveCategory(keys[0]);
                    }
                } else {
                    // Fallback to default if no packages found
                    console.warn('No packages found, using defaults');
                    setPackages({});
                    setPackageKeys([]);
                }
            } catch (error) {
                console.error('Error fetching packages:', error);
                // Set empty state on error
                setPackages({});
                setPackageKeys([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPackages();
    }, [user?.role]);

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

    const handleTierSelect = (tier: string) => {
        setSelectedTier(tier);
        setUpiUrl(null);
        setTimeLeft(300);
    };

    const [coupon, setCoupon] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedCode, setAppliedCode] = useState<string | null>(null);

    const getCurrentPackage = () => packages[activeCategory];
    const getCurrentTier = () => {
        const pkg = getCurrentPackage();
        return pkg?.tiers.find(t => t.name === selectedTier);
    };

    // Price Breakdown Logic
    const basePrice = getCurrentTier()?.price || 0;
    const discountAmount = basePrice * (discount / 100);
    const afterDiscount = basePrice - discountAmount;

    // Tax & Fees
    const cgst = afterDiscount * 0.09;
    const sgst = afterDiscount * 0.09;
    const subTotalWithTax = afterDiscount + cgst + sgst;

    // Convenience Fee (1.8% on total value)
    const convFee = subTotalWithTax * 0.018;

    const finalTotal = subTotalWithTax + convFee;

    // Allow logic to use base price for display if needed, but we use detailed variables now.
    const price = basePrice;

    const handleBuyNow = async () => {
        if (!isLoggedIn) { alert("Please login to proceed."); return; }
        if (!selectedTier) { alert("Please select a tier."); return; }
        if (activeCategory === "free") { alert("Free plan is already available."); return; }
        if (!selectedGateway) { alert("Please select a payment method."); return; }

        setIsProcessing(true);
        try {
            const currentPkg = getCurrentPackage();
            const result = await PaymentManager.getInstance().processPayment(
                selectedGateway,
                `${activeCategory}_${selectedTier}`,
                Math.round(finalTotal),
                'INR',
                {
                    planTitle: `${currentPkg?.title || activeCategory} (${selectedTier.toUpperCase()})`,
                    userName: user?.name,
                    userEmail: user?.email,
                    breakdown: {
                        base: basePrice,
                        discount: discountAmount,
                        cgst,
                        sgst,
                        convFee,
                        total: finalTotal
                    }
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

    if (loading) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ textAlign: 'center', padding: '100px 20px', color: '#fff' }}>
                    <Clock size={48} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '20px' }}>Loading Premium Packages...</p>
                </div>
            </div>
        );
    }

    if (packageKeys.length === 0) {
        return (
            <div className={styles.pageContainer}>
                <div style={{ textAlign: 'center', padding: '100px 20px', color: '#fff' }}>
                    <Shield size={48} />
                    <p style={{ marginTop: '20px' }}>No packages available at the moment.</p>
                </div>
            </div>
        );
    }

    const currentPkg = getCurrentPackage();

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
                            <p>Complete your upgrade to <strong>{currentPkg?.title || activeCategory} ({selectedTier})</strong></p>
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

            <div className={styles.premiumHeader}>
                <div className={styles.premiumBadge}>
                    <Crown size={16} className={styles.crownIcon} />
                    <span>ELITE INFRASTRUCTURE</span>
                </div>
                <h1 className={styles.title}>Premium Ecosystem</h1>
                <p className={styles.subtitle}>Navigate through our futuristic membership tiers designed for total dominance.</p>
            </div>

            {/* Futuristic Tab Bar */}
            <div className={styles.tabContainer}>
                {packageKeys.map((cat) => (
                    <button
                        key={cat}
                        className={`${styles.planTab} ${activeCategory === cat ? styles.activeTab : ''}`}
                        onClick={() => {
                            setActiveCategory(cat);
                            setSelectedTier(null); // Reset tier when switching category
                        }}
                    >
                        {packages[cat]?.icon}
                        <span>{packages[cat]?.title}</span>
                    </button>
                ))}
            </div>

            <div className={styles.membershipWrapper}>
                <div className={styles.activeTierDisplay}>
                    <div className={styles.categoryInfo}>
                        <h2 className={styles.categoryHeading}>{currentPkg?.title}</h2>
                        <p className={styles.categoryDesc}>{currentPkg?.description}</p>
                    </div>

                    <div className={styles.tiersContainer}>
                        {currentPkg?.tiers.map((tier) => (
                            <div
                                key={tier.name}
                                className={`${styles.tierCard} ${selectedTier === tier.name ? styles.selectedTier : ''}`}
                                onClick={() => handleTierSelect(tier.name)}
                                style={{
                                    '--tier-color': tier.badgeColor || '#3b82f6',
                                    '--tier-glow': tier.glowColor || 'rgba(59, 130, 246, 0.2)'
                                } as React.CSSProperties}
                            >
                                <div className={styles.tierHeader}>
                                    <span className={styles.tierName} style={{ color: tier.badgeColor }}>{tier.name}</span>
                                    <div className={styles.tierPriceContainer}>
                                        <span className={styles.currency}>₹</span>
                                        <span className={styles.tierPrice}>
                                            {(!isLoggedIn && activeCategory !== 'free') ? '***' : tier.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                                <div className={`${styles.benefitList} ${(!isLoggedIn && activeCategory !== 'free') ? styles.lockedBenefitList : ''}`} onClick={() => !isLoggedIn && openAuthModal('login')}>
                                    {currentPkg?.features.map((feature: string, idx: number) => (
                                        <div key={idx} className={styles.featureItem}>
                                            <Check size={14} className={styles.checkIcon} />
                                            <span className={(!isLoggedIn && activeCategory !== 'free') ? styles.blurredText : ''}>
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                    {(!isLoggedIn && activeCategory !== 'free') && (
                                        <div className={styles.centralLockOverlay}>
                                            <Lock size={32} />
                                        </div>
                                    )}
                                </div>
                                <button className={styles.selectBtn}>
                                    {selectedTier === tier.name ? 'SELECTED' : 'SELECT TIER'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.loginPanel}>
                    {!isLoggedIn ? (
                        <div className={styles.summaryContent}>
                            <div className={styles.summaryHeader}>
                                <span className={styles.summaryLabel}>
                                    {activeCategory === 'free' ? 'Standard Access' : 'Elite Access Required'}
                                </span>
                                <h1 className={styles.planTitleSummary}>{currentPkg?.title}</h1>
                                {selectedTier && (
                                    <div className={styles.tierBadgeContainer}>
                                        <span className={styles.tierBadge}>{selectedTier}</span>
                                        <Shield size={18} className={styles.platinumIcon} />
                                    </div>
                                )}
                            </div>

                            <div className={styles.pricePanel}>
                                <div className={styles.priceRow}>
                                    <span>{activeCategory === 'free' ? 'Entry Cost' : (selectedTier ? 'Tier Investment' : 'Plans Starting From')}</span>
                                    <span className={styles.totalAmount}>
                                        {activeCategory === 'free' ? 'FREE' : (!isLoggedIn ? '₹***' : `₹${(selectedTier ? price : (currentPkg?.tiers[0]?.price || 0)).toLocaleString()}`)}
                                    </span>
                                </div>
                                <div className={styles.priceRow}>
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        {activeCategory === 'free' ? 'Login to activate features' : 'Login to unlock payment protocols'}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.lockedFeaturesNotice}>
                                <Lock size={24} color="#facc15" style={{ marginBottom: '15px' }} />
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                    Authenticate your account to access the {activeCategory.toUpperCase()} gateway and activate your premium legal membership.
                                </p>
                            </div>

                            <button
                                className={styles.buyBtn}
                                onClick={() => openAuthModal('login')}
                                style={{ marginTop: '30px' }}
                            >
                                {activeCategory === 'free' ? <Check size={20} /> : <Lock size={20} />}
                                <span>{activeCategory === 'free' ? 'LOGIN TO GET STARTED' : 'LOGIN TO UPGRADE'}</span>
                            </button>
                        </div>
                    ) : (!selectedTier) ? (
                        <div className={styles.noSelection}>
                            <div className={styles.luxuryIcon}><Star size={48} /></div>
                            <h3>Futuristic Checkout</h3>
                            <p>Select a tier to activate the summary and initialize secure payment protocols.</p>
                        </div>
                    ) : (
                        <div className={styles.summaryContent}>
                            <div className={styles.summaryHeader}>
                                <span className={styles.summaryLabel}>Package Summary</span>
                                <h1 className={styles.planTitleSummary}>{currentPkg?.title}</h1>
                                <div className={styles.tierBadgeContainer}>
                                    <span className={styles.tierBadge}>{selectedTier}</span>
                                    <Shield size={18} className={styles.platinumIcon} />
                                </div>
                            </div>

                            {/* Coupon Section */}
                            <div className={styles.couponSection} style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter Coupon Code"
                                        value={coupon}
                                        onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: '#fff',
                                            outline: 'none',
                                            fontSize: '0.9rem'
                                        }}
                                        disabled={!!appliedCode}
                                    />
                                    <button
                                        onClick={() => {
                                            if (coupon === 'WELCOME10') {
                                                setAppliedCode(coupon);
                                                setDiscount(10);
                                                alert('Coupon Applied! 10% Discount.');
                                            } else if (coupon === 'EADVOCATE20') {
                                                setAppliedCode(coupon);
                                                setDiscount(20);
                                                alert('Coupon Applied! 20% Discount.');
                                            } else {
                                                alert('Invalid Coupon Code');
                                            }
                                        }}
                                        style={{
                                            padding: '0 20px',
                                            borderRadius: '12px',
                                            background: appliedCode ? '#10b981' : '#facc15',
                                            border: 'none',
                                            color: appliedCode ? '#fff' : '#000',
                                            fontWeight: 'bold',
                                            cursor: appliedCode ? 'default' : 'pointer'
                                        }}
                                        disabled={!!appliedCode}
                                    >
                                        {appliedCode ? 'APPLIED' : 'APPLY'}
                                    </button>
                                </div>
                                {appliedCode && (
                                    <p style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '8px' }}>
                                        Discount Applied: {discount}% OFF
                                    </p>
                                )}
                            </div>

                            <div className={styles.pricePanel}>
                                <div className={styles.priceRow}>
                                    <span>Base Price</span>
                                    <span style={{ fontWeight: 800 }}>₹{price.toLocaleString()}</span>
                                </div>

                                {appliedCode && (
                                    <div className={styles.priceRow}>
                                        <span style={{ color: '#10b981' }}>Discount ({discount}%)</span>
                                        <span style={{ color: '#10b981' }}>- ₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className={styles.priceRow}>
                                    <span>CGST (9%)</span>
                                    <span>₹{cgst.toFixed(2)}</span>
                                </div>
                                <div className={styles.priceRow}>
                                    <span>SGST (9%)</span>
                                    <span>₹{sgst.toFixed(2)}</span>
                                </div>
                                <div className={styles.priceRow}>
                                    <span>
                                        {selectedGateway === 'cashfree' ? 'Platform Fee (2%)' : 'Convenience Fee (1.8%)'}
                                    </span>
                                    <span>₹{(subTotalWithTax * (selectedGateway === 'cashfree' ? 0.02 : 0.018)).toFixed(2)}</span>
                                </div>

                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '15px 0' }}></div>

                                <div className={styles.priceRow}>
                                    <span style={{ color: '#fff' }}>Total Payable</span>
                                    <span className={styles.totalAmount} style={{ fontSize: '1.8rem' }}>
                                        ₹{Math.round(subTotalWithTax + (subTotalWithTax * (selectedGateway === 'cashfree' ? 0.02 : 0.018))).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.paymentSection}>
                                <label className={styles.sectionLabel}>Secure Gateways</label>
                                <div className={styles.gatewayGrid}>
                                    {['razorpay', 'paytm', 'stripe', 'upi', 'invoice', 'cashfree'].map(gw => (
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
                                            {gw === 'cashfree' && <Zap size={18} />}
                                            <span>{gw}</span>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className={styles.buyBtn}
                                    onClick={async () => {
                                        if (!isLoggedIn) { alert("Please login to proceed."); return; }
                                        if (!selectedTier) { alert("Please select a tier."); return; }
                                        if (activeCategory === "free") { alert("Free plan is already available."); return; }
                                        if (!selectedGateway) { alert("Please select a payment method."); return; }

                                        setIsProcessing(true);
                                        try {
                                            const currentPkg = getCurrentPackage();
                                            const feeFactor = selectedGateway === 'cashfree' ? 0.02 : 0.018;
                                            const finalCalc = subTotalWithTax + (subTotalWithTax * feeFactor);

                                            const result = await PaymentManager.getInstance().processPayment(
                                                selectedGateway,
                                                `${activeCategory}_${selectedTier}`,
                                                Math.round(finalCalc),
                                                'INR',
                                                {
                                                    planTitle: `${currentPkg?.title || activeCategory} (${selectedTier.toUpperCase()})`,
                                                    userName: user?.name,
                                                    userEmail: user?.email,
                                                    breakdown: {
                                                        base: basePrice,
                                                        discount: discountAmount,
                                                        cgst,
                                                        sgst,
                                                        convFee: subTotalWithTax * feeFactor,
                                                        total: finalCalc
                                                    }
                                                }
                                            );

                                            if (result.success) {
                                                if (selectedGateway === 'upi' && result.metadata?.upiUrl) {
                                                    setUpiUrl(result.metadata.upiUrl);
                                                    setCurrentOrderId(result.orderId);
                                                    setTimeLeft(300); // Start 5 min timer
                                                } else if (selectedGateway === 'cashfree') {
                                                    console.log("Redirecting to Cashfree...");
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
                                    }}
                                    disabled={isProcessing || activeCategory === 'free'}
                                >
                                    {isProcessing ? 'CONNECTING...' : (
                                        activeCategory === 'free' ? 'ALREADY ACTIVE' : (
                                            <>
                                                <span>PAY SECURELY • ₹{Math.round(subTotalWithTax + (subTotalWithTax * (selectedGateway === 'cashfree' ? 0.02 : 0.018))).toLocaleString()}</span>
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
