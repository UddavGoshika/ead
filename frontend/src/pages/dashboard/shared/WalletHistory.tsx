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
    const { user } = useAuth();

    useEffect(() => {
        const loadGateways = async () => {
            const gateways = await PaymentManager.getInstance().getEnabledGateways();
            setEnabledGateways(gateways);
        };
        loadGateways();
    }, []);


    // UI States
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [withdrawStep, setWithdrawalStep] = useState(1);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawError, setWithdrawError] = useState('');

    // Mock Business Logic Data
    const [balance] = useState(12450.00);
    const [rewardPoints] = useState(480);

    const [banks] = useState<BankAccount[]>([
        { id: '1', bankName: 'State Bank of India', accountNumber: '****6789', ifsc: 'SBIN0001234', isPrimary: true, holderName: 'ALEX DOE', cardType: 'VISA' },
        { id: '2', bankName: 'HDFC Priority', accountNumber: '****4321', ifsc: 'HDFC0005678', isPrimary: false, holderName: 'ALEX DOE', cardType: 'Mastercard' }
    ]);

    const [transactions] = useState<Transaction[]>([
        { id: 'TXN882', type: 'credit', amount: 5000, description: 'Wallet Recharge - UPI', date: '25 Jan 2026, 10:30 AM', status: 'Completed', method: 'UPI', category: 'Recharge' },
        { id: 'TXN881', type: 'debit', amount: 1500, description: 'Consultation Fee - Adv. Kapoor', date: '24 Jan 2026, 02:15 PM', status: 'Completed', method: 'Wallet', category: 'Legal Fee' },
        { id: 'TXN880', type: 'credit', amount: 200, description: 'Loyalty Cashback Reward', date: '23 Jan 2026, 09:00 AM', status: 'Completed', method: 'Promo', category: 'Reward' },
        { id: 'TXN879', type: 'debit', amount: 1200, description: 'Annual Membership Renewal', date: '22 Jan 2026, 04:45 PM', status: 'Pending', method: 'Wallet', category: 'Membership' },
    ]);

    // Insights Chart Simulation
    const chartData = [40, 70, 45, 90, 65, 80, 50]; // Monday to Sunday

    const handleWithdraw = () => {
        const amt = parseFloat(withdrawAmount);
        if (!amt || amt < 1000) {
            setWithdrawError('Minimum withdrawal is ₹1,000.');
            return;
        }
        if (amt > balance) {
            setWithdrawError('Insufficient balance in your account.');
            return;
        }
        setWithdrawalStep(2);
        setWithdrawError('');
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    {backToHome && <button onClick={backToHome} className={styles.backBtn}><ArrowLeft size={20} /></button>}
                    <h2>Wallet & History</h2>
                </div>
                <div className={styles.balanceSection}>
                    <div className={styles.balanceInfo}>
                        <span>AVAILABLE LIQUIDITY</span>
                        <h3>₹ {balance.toLocaleString('en-IN')}</h3>
                    </div>
                    <div className={styles.balanceActions}>
                        <button className={styles.addBtn} onClick={() => setShowAddMoney(true)}><Plus size={18} /> Add Funds</button>
                        <button className={styles.withdrawBtn} onClick={() => setShowWithdraw(true)}><Minus size={18} /> Payout</button>
                    </div>
                </div>
            </div>

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
                            <div className={styles.promoInputGroup}><input type="text" placeholder="Code" /><button>Apply</button></div>
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
                    {banks.map(bank => (
                        <div key={bank.id} className={styles.realBankCard}>
                            <div className={styles.cardChip}></div>
                            <div className={styles.cardNum}>{bank.accountNumber}</div>
                            <p>{bank.holderName}</p>
                            {bank.isPrimary && <div className={styles.primaryBadge}>PRIMARY</div>}
                        </div>
                    ))}
                    <button className={styles.addBankCard}><Plus size={32} /><span>Link Method</span></button>
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
                                        {enabledGateways.map(gw => (
                                            <button
                                                key={gw.gateway}
                                                className={`${styles.methodBtn} ${selectedGateway === gw.gateway ? styles.activeMethod : ""}`}
                                                onClick={() => setSelectedGateway(gw.gateway)}
                                                disabled={isProcessing}
                                            >
                                                {gw.gateway === 'razorpay' && <CreditCard size={18} />}
                                                {gw.gateway === 'paytm' && <Smartphone size={24} />}
                                                {gw.gateway === 'stripe' && <Building2 size={18} />}
                                                {gw.gateway === 'invoice' && <Receipt size={18} />}
                                                {gw.gateway === 'upi' && <QrCode size={18} />}
                                                <span style={{ textTransform: 'capitalize' }}>{gw.gateway}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

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

                                                        if (response.data.success) {
                                                            alert("Payment verified successfully! Your balance will be updated.");
                                                            setUpiUrl(null);
                                                            setCurrentOrderId(null);
                                                            setShowAddMoney(false);
                                                            // In a real app, refresh balance here
                                                            window.location.reload();
                                                        } else {
                                                            alert("Verification failed: " + response.data.message);
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
                                                const result = await PaymentManager.getInstance().processPayment(
                                                    selectedGateway,
                                                    'wallet_recharge',
                                                    Number(addAmount),
                                                    'INR',
                                                    {
                                                        userName: user?.name,
                                                        userEmail: user?.email,
                                                        description: `Wallet Recharge: ₹${addAmount}`
                                                    }
                                                );

                                                if (result.success) {
                                                    if (selectedGateway === 'upi' && result.metadata?.upiUrl) {
                                                        setUpiUrl(result.metadata.upiUrl);
                                                        setCurrentOrderId(result.orderId);
                                                    } else {
                                                        alert(result.message || "Payment completed successfully");
                                                        setShowAddMoney(false);
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
                                    >
                                        {isProcessing ? 'Processing...' : 'Proceed to Pay'}
                                    </button>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showWithdraw && (
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

            )}
        </div>
    );
};

export default WalletHistory;
