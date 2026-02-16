import React, { useState, useEffect } from 'react';
import styles from './WalletHistory.module.css';
import axios from 'axios';
import {
    Search,
    Gift,
    ArrowLeft,
    Plus,
    Minus,
    Settings2,
    X,
    ShieldCheck,
    TrendingUp,
    Zap,
    CreditCard,
    Smartphone,
    Building2,
    Receipt,
    QrCode
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { PaymentManager } from '../../../services/payment/PaymentManager';
import type { PaymentGatewayConfig, PaymentGateway } from '../../../types/payment';
import { useAuth } from '../../../context/AuthContext';
import { walletService } from '../../../services/api';

interface Transaction {
    id: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string;
    status: 'Completed' | 'Pending' | 'Failed';
    method: string;
    category: 'Recharge' | 'Legal Fee' | 'Membership' | 'Reward' | 'Withdrawal';
}

interface BankAccount {
    id: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
    isPrimary: boolean;
    holderName: string;
    cardType: 'VISA' | 'Mastercard';
}

const WalletHistory: React.FC<{ backToHome?: () => void }> = ({ backToHome }) => {
    const [activeTab, setActiveTab] = useState<'history' | 'insights' | 'bank' | 'kyc' | 'bills' | 'settings'>('history');
    const [searchTerm, setSearchTerm] = useState('');

    const [addAmount, setAddAmount] = useState("");
    const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | ''>('');
    const [enabledGateways, setEnabledGateways] = useState<PaymentGatewayConfig[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [upiUrl, setUpiUrl] = useState<string | null>(null);
    const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
    const { user } = useAuth(); // Removed refreshUser

    useEffect(() => {
        const loadGateways = async () => {
            const allGateways = await PaymentManager.getInstance().getEnabledGateways();
            // Filter to ONLY allow Razorpay and Cashfree as per user request
            const activeGateways = allGateways.filter(g => ['razorpay', 'cashfree'].includes(g.gateway));
            setEnabledGateways(activeGateways);
            if (activeGateways.length > 0) {
                setSelectedGateway(activeGateways[0].gateway as PaymentGateway);
            }
        };
        loadGateways();
        fetchRealWalletData();
    }, []);

    const [promoCode, setPromoCode] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const [cards, setCards] = useState<any[]>([]);
    const [banksList, setBanksList] = useState<any[]>([]);

    const fetchRealWalletData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [balanceRes, txRes, bankRes, cardRes] = await Promise.all([
                axios.get('/api/payments/balance', { headers: { Authorization: token || '' } }),
                axios.get('/api/payments/my-transactions', { headers: { Authorization: token || '' } }),
                axios.get('/api/payments/bank-accounts', { headers: { Authorization: token || '' } }),
                axios.get('/api/payments/cards', { headers: { Authorization: token || '' } })
            ]);

            if (balanceRes.data.success) setBalance(balanceRes.data.balance);
            if (bankRes.data.success) setBanksList(bankRes.data.bankAccounts);
            if (cardRes.data.success) setCards(cardRes.data.cards);

            if (txRes.data.success) {
                const mapped: Transaction[] = txRes.data.transactions.map((t: any) => {
                    const status = t.status.toLowerCase();
                    const isCredit = status === 'success' || status === 'completed' || status === 'pending_verification';

                    return {
                        id: t.orderId.split('_').pop() || t.orderId,
                        type: isCredit ? 'credit' : 'debit',
                        amount: t.amount,
                        description: t.packageId || 'Wallet Operation',
                        date: new Date(t.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                        status: t.status.replace(/_/g, ' ').charAt(0).toUpperCase() + t.status.replace(/_/g, ' ').slice(1),
                        method: t.gateway.toUpperCase(),
                        category: t.packageId && t.packageId.includes('wallet') ? 'Recharge' : 'Membership'
                    };
                });
                setTransactions(mapped);
            }
        } catch (err) {
            console.error("Wallet Fetch Error:", err);
        }
    };


    // UI States
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showLinkMethod, setShowLinkMethod] = useState(false);
    const [linkMethodType, setLinkMethodType] = useState<'bank' | 'card' | null>(null);

    const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', ifsc: '', holderName: '', isPrimary: false });
    const [newCard, setNewCard] = useState({ cardNum: '', cardType: 'VISA', expiry: '', holderName: '' });

    const [withdrawStep, setWithdrawalStep] = useState(1);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawError, setWithdrawError] = useState('');

    const [balance, setBalance] = useState(user?.walletBalance || 0); // Init from user
    const [rewardPoints, setRewardPoints] = useState(user?.coins || 0);

    // Sync balance if user updates
    useEffect(() => {
        if (user) {
            setBalance(user.walletBalance || 0);
            setRewardPoints(user.coins || 0);
        }
    }, [user]);

    const [banks] = useState<BankAccount[]>([
        { id: '1', bankName: 'State Bank of India', accountNumber: '****6789', ifsc: 'SBIN0001234', isPrimary: true, holderName: 'ALEX DOE', cardType: 'VISA' },
        { id: '2', bankName: 'HDFC Priority', accountNumber: '****4321', ifsc: 'HDFC0005678', isPrimary: false, holderName: 'ALEX DOE', cardType: 'Mastercard' }
    ]);

    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Insights Chart Simulation
    const chartData = [40, 70, 45, 90, 65, 80, 50]; // Monday to Sunday

    // Helper to calculate totals
    const calculateTotalPayable = (base: number) => {
        const cgst = base * 0.09;
        const sgst = base * 0.09;
        const feePercent = selectedGateway === 'cashfree' ? 0.02 : 0.003;
        const convFee = base * feePercent;
        return base + cgst + sgst + convFee;
    };

    const handleWithdraw = async () => {
        const amt = parseFloat(withdrawAmount);
        if (!amt || amt < 1000) {
            setWithdrawError('Minimum withdrawal is ₹1,000.');
            return;
        }
        if (amt > balance) {
            setWithdrawError('Insufficient balance in your account.');
            return;
        }

        try {
            const primaryBank = banksList.find(b => b.isPrimary) || banksList[0];
            if (!primaryBank) {
                setWithdrawError('Please link a bank account first.');
                return;
            }
            const response = await walletService.withdraw({ amount: amt, bankDetails: primaryBank });
            if (response.data.success) {
                setWithdrawalStep(2);
                setWithdrawError('');
                setBalance(response.data.balance); // Update local balance
                fetchRealWalletData(); // Refresh history
            }
        } catch (err: any) {
            setWithdrawError(err.response?.data?.error || 'Withdrawal request failed');
        }
    };

    const handleRedeemPromo = async () => {
        if (!promoCode) return;
        setPromoLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/payments/redeem-promo', { code: promoCode }, {
                headers: { Authorization: token || '' }
            });
            if (res.data.success) {
                alert(res.data.message);
                setPromoCode('');
                fetchRealWalletData();
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to redeem code");
        } finally {
            setPromoLoading(false);
        }
    };

    const handleAddBank = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/payments/bank-accounts', newBank, {
                headers: { Authorization: token || '' }
            });
            if (res.data.success) {
                setBanksList(res.data.bankAccounts);
                setShowLinkMethod(false);
                setLinkMethodType(null);
                setNewBank({ bankName: '', accountNumber: '', ifsc: '', holderName: '', isPrimary: false });
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to add bank account");
        }
    };

    const handleAddCard = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/payments/cards', newCard, {
                headers: { Authorization: token || '' }
            });
            if (res.data.success) {
                setCards(res.data.cards);
                setShowLinkMethod(false);
                setLinkMethodType(null);
                setNewCard({ cardNum: '', cardType: 'VISA', expiry: '', holderName: '' });
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to add card");
        }
    };

    const handleDeleteBank = async (id: string) => {
        if (!window.confirm("Delete this bank account?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`/api/payments/bank-accounts/${id}`, {
                headers: { Authorization: token || '' }
            });
            if (res.data.success) setBanksList(res.data.bankAccounts);
        } catch (err) { alert("Delete failed"); }
    };

    const handleDeleteCard = async (id: string) => {
        if (!window.confirm("Delete this card?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`/api/payments/cards/${id}`, {
                headers: { Authorization: token || '' }
            });
            if (res.data.success) setCards(res.data.cards);
        } catch (err) { alert("Delete failed"); }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    {backToHome && <button onClick={backToHome} className={styles.backBtn}><ArrowLeft size={20} /></button>}
                    <h2>Wallet & History</h2>
                </div>
                <div className={styles.balanceSection}>
                    <div className={styles.secureBadgeRow}>
                        <div className={styles.secureBadge}><ShieldCheck size={14} /> 256-BIT SSL SECURE</div>
                        <div className={styles.secureBadge}><CreditCard size={14} /> PCI-DSS COMPLIANT</div>
                    </div>
                    <div className={styles.balanceInfo}>
                        <span>AVAILABLE LIQUIDITY</span>
                        <h3>₹ {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                    </div>
                    <div className={styles.balanceActions}>
                        <button className={styles.addBtn} onClick={() => setShowAddMoney(true)}><Plus size={18} /> Add Funds</button>
                        <button className={styles.withdrawBtn} onClick={() => setShowWithdraw(true)}><Minus size={18} /> Payout</button>
                    </div>
                </div>
            </div>

            {/* ... navigation tabs ... */}
            <nav className={styles.tabs}>
                {['history', 'insights', 'bank', 'bills', 'kyc', 'settings'].map(tab => (
                    <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`} onClick={() => setActiveTab(tab as any)}>
                        {tab.replace(/^\w/, c => c.toUpperCase())}
                    </button>
                ))}
            </nav>

            {activeTab === 'history' && (
                <div className={styles.historyPortal}>
                    <div className={styles.topGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statIconCircle} style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}><TrendingUp size={24} /></div>
                            <div><span>Inflow (Month)</span><h3>₹ 64,000</h3></div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statIconCircle} style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}><Zap size={24} /></div>
                            <div><span>Advocate Coins</span><h3>{rewardPoints} pts</h3></div>
                        </div>
                        <div className={styles.promoCard}>
                            <div className={styles.promoHeader}><Gift size={18} /> <span>Redeem Promo</span></div>
                            <div className={styles.promoInputGroup}>
                                <input
                                    type="text"
                                    placeholder="Code"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                />
                                <button onClick={handleRedeemPromo} disabled={promoLoading}>
                                    {promoLoading ? '...' : 'Apply'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.historyContainer}>
                        <div className={styles.controls}>
                            <div className={styles.searchBox}>
                                <Search size={18} />
                                <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead><tr><th>REFERENCE</th><th>DESCRIPTION</th><th>CATEGORY</th><th>STATUS</th><th>VALUE</th></tr></thead>
                                <tbody>
                                    {transactions.map((txn) => (
                                        <tr key={txn.id}>
                                            <td className={styles.txnId}>{txn.id}</td>
                                            <td><b>{txn.description}</b><br /><small>{txn.date}</small></td>
                                            <td>{txn.category}</td>
                                            <td><span className={`${styles.statusBadge} ${styles[txn.status.toLowerCase()]}`}>{txn.status}</span></td>
                                            <td className={`${styles.amount} ${txn.type === 'credit' ? styles.positive : styles.negative}`}>₹{txn.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'insights' && (
                <div className={styles.insightCard}>
                    <h3>Weekly Spending Velocity</h3>
                    <div className={styles.chartContainer}>
                        {chartData.map((h, i) => (
                            <div key={i} className={styles.bar} style={{ height: `${h}%` }}>
                                <span className={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'bank' && (
                <div className={styles.bankGrid}>
                    {banksList.length > 0 ? banksList.map(bank => (
                        <div key={bank._id} className={styles.realBankCard}>
                            <div className={styles.cardChip}></div>
                            <div className={styles.bankNameLabel}>{bank.bankName}</div>
                            <div className={styles.cardNum}>{bank.accountNumber}</div>
                            <p>{bank.holderName}</p>
                            {bank.isPrimary && <div className={styles.primaryBadge}>PRIMARY</div>}
                            <button className={styles.deleteMini} onClick={() => handleDeleteBank(bank._id)}><X size={12} /></button>
                        </div>
                    )) : (
                        <div style={{ padding: '20px', color: '#94a3b8' }}>No banks linked. Link one for payouts.</div>
                    )}

                    {cards.map(card => (
                        <div key={card._id} className={`${styles.realBankCard} ${styles.creditCard}`}>
                            <div className={styles.cardChip}></div>
                            <div className={styles.bankNameLabel}>{card.cardType || 'Credit Card'}</div>
                            <div className={styles.cardNum}>{card.cardNum}</div>
                            <p>{card.holderName}</p>
                            <button className={styles.deleteMini} onClick={() => handleDeleteCard(card._id)}><X size={12} /></button>
                        </div>
                    ))}

                    <button className={styles.addBankCard} onClick={() => setShowLinkMethod(true)}>
                        <Plus size={32} /><span>Link Method</span>
                    </button>
                </div>
            )}

            {activeTab === 'bills' && (
                <div className={styles.billList}>
                    {[
                        { name: 'Professional Insurance', due: '15 Feb', amt: 2400 },
                        { name: 'Library Fee', due: '02 Mar', amt: 800 }
                    ].map((bill, i) => (
                        <div key={i} className={styles.billItem}>
                            <div><h4>{bill.name}</h4><p>Due: {bill.due}</p></div>
                            <strong>₹{bill.amt}</strong>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'kyc' && (
                <div className={styles.kycPremium}>
                    <ShieldCheck size={48} color="#facc15" />
                    <h2>Level 3 Verified</h2>
                    <p>Trust Score: 98.4%</p>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className={styles.settingsGrid}>
                    <div className={styles.settingsCard}>
                        <h3>Privacy</h3>
                        <p>Mask sensitive financial data on main dashboard.</p>
                        <Settings2 />
                    </div>
                </div>
            )}

            {showAddMoney && (
                <div className={styles.modalOverlay} onClick={() => setShowAddMoney(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>

                        {/* HEADER */}
                        <div className={styles.modalHeader}>
                            <div>
                                <h3>Add Funds</h3>
                                <p className={styles.modalSubtext}>Top-up wallet balance via secure payment gateway</p>
                            </div>
                            <X className={styles.closeIcon} onClick={() => setShowAddMoney(false)} />
                        </div>

                        {/* BODY */}
                        <div className={styles.modalBody}>
                            <div className={styles.addMoneyForm}>

                                {/* AMOUNT INPUT */}
                                <div className={styles.inputGroup}>
                                    <label>Amount</label>
                                    <div className={styles.amountInputWrapper}>
                                        <span className={styles.currency}>₹</span>
                                        <input
                                            type="number"
                                            placeholder="Enter amount"
                                            value={addAmount}
                                            onChange={(e) => setAddAmount(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* QUICK AMOUNTS */}
                                <div className={styles.quickAmounts}>
                                    {[500, 1000, 5000, 10000].map(v => (
                                        <button
                                            key={v}
                                            className={styles.amountChip}
                                            onClick={() => setAddAmount(String(v))}
                                        >
                                            ₹{v}
                                        </button>
                                    ))}
                                </div>

                                {/* PAYMENT METHOD SELECTION */}
                                <div className={styles.upiMethods}>
                                    <label>Choose Payment Method</label>
                                    <div className={styles.methodGrid}>
                                        {['razorpay', 'cashfree'].map(gw => (
                                            <button
                                                key={gw}
                                                className={`${styles.methodBtn} ${selectedGateway === gw ? styles.activeMethod : ""}`}
                                                onClick={() => setSelectedGateway(gw as PaymentGateway)}
                                                disabled={isProcessing}
                                            >
                                                {gw === 'razorpay' && <CreditCard size={18} />}
                                                {gw === 'cashfree' && <Zap size={18} />}
                                                <span style={{ textTransform: 'capitalize' }}>{gw}</span>
                                            </button>
                                        ))}
                                        {/* Placeholders for others */}
                                        {['paytm', 'stripe', 'upi'].map(gw => (
                                            <button
                                                key={gw}
                                                className={styles.methodBtn}
                                                disabled={true}
                                                style={{ opacity: 0.4, cursor: 'not-allowed' }}
                                            >
                                                <X size={14} />
                                                <span style={{ textTransform: 'capitalize' }}>{gw}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* TAX SUMMARY SECTION */}
                                {addAmount && parseFloat(addAmount) > 0 && (
                                    <div className={styles.taxSummary}>
                                        <div className={styles.taxRow}>
                                            <span>Base Amount</span>
                                            <span>₹{parseFloat(addAmount).toFixed(2)}</span>
                                        </div>
                                        <div className={styles.taxRow}>
                                            <span>CGST (9%)</span>
                                            <span>+ ₹{(parseFloat(addAmount) * 0.09).toFixed(2)}</span>
                                        </div>
                                        <div className={styles.taxRow}>
                                            <span>SGST (9%)</span>
                                            <span>+ ₹{(parseFloat(addAmount) * 0.09).toFixed(2)}</span>
                                        </div>
                                        <div className={styles.taxRow}>
                                            <span>
                                                {selectedGateway === 'cashfree' ? 'Platform Fee (2%)' : 'Convenience Fee (0.3%)'}
                                            </span>
                                            <span>
                                                + ₹{(parseFloat(addAmount) * (selectedGateway === 'cashfree' ? 0.02 : 0.003)).toFixed(2)}
                                            </span>
                                        </div>
                                        <div className={`${styles.taxRow} ${styles.totalRow}`}>
                                            <span>Total Payable</span>
                                            <span>
                                                ₹{(
                                                    parseFloat(addAmount) +
                                                    (parseFloat(addAmount) * 0.09) +
                                                    (parseFloat(addAmount) * 0.09) +
                                                    (parseFloat(addAmount) * (selectedGateway === 'cashfree' ? 0.02 : 0.003))
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {upiUrl ? (
                                    <div className={styles.qrStep}>
                                        <div className={styles.qrBox}>
                                            <QRCode value={upiUrl} size={180} bgColor="#fff" fgColor="#000" />
                                        </div>
                                        <p className={styles.securityNote}>Scan this QR code with any UPI app (GPay, PhonePe, Paytm) to pay ₹{addAmount}</p>
                                        <div className={styles.qrActions}>
                                            <button
                                                className={styles.primaryBtn}
                                                style={{ width: '100%' }}
                                                onClick={async () => {
                                                    setIsProcessing(true);
                                                    try {
                                                        const token = localStorage.getItem('token');
                                                        const response = await axios.post('/api/payments/verify', {
                                                            orderId: currentOrderId,
                                                            paymentId: 'upi_' + Math.random().toString(36).substring(7),
                                                            gateway: 'upi'
                                                        }, {
                                                            headers: { Authorization: token || '' }
                                                        });

                                                        if (response?.data?.success) {
                                                            alert("Payment request received. Your balance will be updated after Admin Approval.");
                                                            setUpiUrl(null);
                                                            setCurrentOrderId(null);
                                                            setShowAddMoney(false);
                                                            fetchRealWalletData();
                                                        } else {
                                                            alert("Verification failed: " + (response?.data?.message || "Unknown error"));
                                                        }
                                                    } catch (err: any) {
                                                        alert("Error verifying payment: " + err.message);
                                                    } finally {
                                                        setIsProcessing(false);
                                                    }
                                                }}
                                            >
                                                Verify Payment
                                            </button>
                                            <button className={styles.cancelBtn} onClick={() => setUpiUrl(null)}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        className={styles.confirmWithdraw}
                                        disabled={!addAmount || !selectedGateway || isProcessing}
                                        onClick={async () => {
                                            if (!selectedGateway || !addAmount) return;

                                            setIsProcessing(true);
                                            try {
                                                // Calculate full amount for payment gateway
                                                const baseVal = Number(addAmount);
                                                // Dynamic Fee Calculation
                                                const feePercent = selectedGateway === 'cashfree' ? 0.02 : 0.003;
                                                const totalVal = baseVal + (baseVal * 0.09) + (baseVal * 0.09) + (baseVal * feePercent);

                                                const result = await PaymentManager.getInstance().processPayment(
                                                    selectedGateway,
                                                    'wallet_recharge',
                                                    totalVal, // Send TOTAL amount to gateway
                                                    'INR',
                                                    {
                                                        userName: user?.name,
                                                        userEmail: user?.email,
                                                        userPhone: (user as any)?.phone || (user as any)?.mobile || '',
                                                        description: `Wallet Recharge: ₹${baseVal} + Taxes`
                                                    }
                                                );

                                                if (result.success) {
                                                    if (selectedGateway === 'upi' && result.metadata?.upiUrl) {
                                                        setUpiUrl(result.metadata.upiUrl);
                                                        setCurrentOrderId(result.orderId);
                                                    } else if (selectedGateway === 'cashfree') {
                                                        // Cashfree adapter handles redirect. 
                                                        // We just wait or show a 'Redirecting' state if needed.
                                                        console.log("Redirecting to Cashfree...");
                                                    } else {
                                                        alert(result.message || "Recharge request sent! Awaiting Admin Approval.");
                                                        setShowAddMoney(false);

                                                        // Refresh transaction history
                                                        fetchRealWalletData();
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
                                    >
                                        {isProcessing ? 'Processing...' : 'Proceed to Pay'}
                                    </button>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {
                showWithdraw && (
                    <div className={styles.modalOverlay} onClick={() => setShowWithdraw(false)}>
                        <div className={styles.modal} onClick={e => e.stopPropagation()}>

                            {/* HEADER */}
                            <div className={styles.modalHeader}>
                                <div>
                                    <h3>Authorize Payout</h3>
                                    <p className={styles.modalSubtext}>Review and authorize this withdrawal request</p>
                                </div>
                                <X className={styles.closeIcon} onClick={() => setShowWithdraw(false)} />
                            </div>

                            {/* BODY */}
                            <div className={styles.modalBody}>

                                {withdrawStep === 1 ? (
                                    <div className={styles.withdrawForm}>

                                        {/* USER INFO */}
                                        <div className={styles.userSummary}>
                                            <div>
                                                <label>User</label>
                                                <span>Rohan Mehta (ADV-001)</span>
                                            </div>
                                            <div>
                                                <label>Available Balance</label>
                                                <span className={styles.balanceText}>₹12,000</span>
                                            </div>
                                        </div>

                                        {/* AMOUNT INPUT */}
                                        <div className={styles.inputGroup}>
                                            <label>Withdrawal Amount</label>
                                            <div className={styles.amountInputWrapper}>
                                                <span className={styles.currency}>₹</span>
                                                <input
                                                    type="number"
                                                    placeholder="Enter amount"
                                                    value={withdrawAmount}
                                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* ERROR */}
                                        {withdrawError && (
                                            <div className={styles.errorBox}>
                                                {withdrawError}
                                            </div>
                                        )}

                                        {/* ACTION */}
                                        <button
                                            className={styles.confirmWithdraw}
                                            onClick={handleWithdraw}
                                        >
                                            🔐 Authorize Payout
                                        </button>

                                        <p className={styles.securityNote}>
                                            This will send an authorization request to the payout gateway.
                                        </p>
                                    </div>
                                ) : (
                                    <div className={styles.successStep}>

                                        <div className={styles.successIcon}>✔</div>

                                        <h4>Authorization Sent</h4>
                                        <p>
                                            The payout request has been securely sent to the payment gateway.
                                            You’ll be notified once it is processed.
                                        </p>

                                        <div className={styles.modalActions}>
                                            <button
                                                className={styles.primaryBtn}
                                                onClick={() => {
                                                    setShowWithdraw(false);
                                                    setWithdrawalStep(1);
                                                }}
                                            >
                                                Close
                                            </button>
                                        </div>

                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                )
            }

            {showLinkMethod && (
                <div className={styles.modalOverlay} onClick={() => setShowLinkMethod(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div>
                                <h3>Link New Method</h3>
                                <p className={styles.modalSubtext}>Securely add a bank account or credit/debit card</p>
                            </div>
                            <X className={styles.closeIcon} onClick={() => setShowLinkMethod(false)} />
                        </div>

                        <div className={styles.modalBody}>
                            {!linkMethodType ? (
                                <div className={styles.methodTypeGrid}>
                                    <button onClick={() => setLinkMethodType('bank')} className={styles.typeBtn}>
                                        <Building2 size={32} />
                                        <span>Bank Account</span>
                                    </button>
                                    <button onClick={() => setLinkMethodType('card')} className={styles.typeBtn}>
                                        <CreditCard size={32} />
                                        <span>Saved Card</span>
                                    </button>
                                </div>
                            ) : linkMethodType === 'bank' ? (
                                <div className={styles.addMethodForm}>
                                    <div className={styles.inputGroup}><label>Bank Name</label><input value={newBank.bankName} onChange={e => setNewBank({ ...newBank, bankName: e.target.value })} placeholder="e.g. HDFC Bank" /></div>
                                    <div className={styles.inputGroup}><label>Account Number</label><input value={newBank.accountNumber} onChange={e => setNewBank({ ...newBank, accountNumber: e.target.value })} placeholder="XXXX XXXX XXXX" /></div>
                                    <div className={styles.inputGroup}><label>IFSC Code</label><input value={newBank.ifsc} onChange={e => setNewBank({ ...newBank, ifsc: e.target.value.toUpperCase() })} placeholder="HDFC0001234" /></div>
                                    <div className={styles.inputGroup}><label>Account Holder</label><input value={newBank.holderName} onChange={e => setNewBank({ ...newBank, holderName: e.target.value })} placeholder="Full Name" /></div>
                                    <button className={styles.primaryBtn} onClick={handleAddBank}>Add Bank Account</button>
                                    <button className={styles.cancelLink} onClick={() => setLinkMethodType(null)}>Back</button>
                                </div>
                            ) : (
                                <div className={styles.addMethodForm}>
                                    <div className={styles.inputGroup}><label>Card Number</label><input value={newCard.cardNum} onChange={e => setNewCard({ ...newCard, cardNum: e.target.value })} placeholder="4111 1111 1111 1111" /></div>
                                    <div className={styles.inputGroup}><label>Card Type</label>
                                        <select value={newCard.cardType} onChange={e => setNewCard({ ...newCard, cardType: e.target.value as any })}>
                                            <option>VISA</option>
                                            <option>Mastercard</option>
                                            <option>Rupay</option>
                                        </select>
                                    </div>
                                    <div className={styles.inputGroup}><label>Expiry (MM/YY)</label><input value={newCard.expiry} onChange={e => setNewCard({ ...newCard, expiry: e.target.value })} placeholder="12/28" /></div>
                                    <div className={styles.inputGroup}><label>Card Holder</label><input value={newCard.holderName} onChange={e => setNewCard({ ...newCard, holderName: e.target.value })} placeholder="Full Name" /></div>
                                    <button className={styles.primaryBtn} onClick={handleAddCard}>Save Card</button>
                                    <button className={styles.cancelLink} onClick={() => setLinkMethodType(null)}>Back</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default WalletHistory;
