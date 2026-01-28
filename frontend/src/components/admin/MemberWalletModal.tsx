import React, { useState } from 'react';
import { X, Wallet, ArrowUpRight, ArrowDownLeft, Plus, Minus, History } from 'lucide-react';
import styles from './MemberWalletModal.module.css';

interface Member {
    id: string;
    name: string;
    coins: number;
}

interface Props {
    member: Member | null;
    onClose: () => void;
    onUpdateBalance: (id: string, amount: number, type: 'add' | 'deduct') => void;
}

const mockHistory = [
    { id: 1, type: 'add', amount: 500, reason: 'Manual Admin Credit', date: '2026-01-20' },
    { id: 2, type: 'deduct', amount: 50, reason: 'Advocate Profile Visit', date: '2026-01-18' },
    { id: 3, type: 'add', amount: 200, reason: 'Package Bonus (Gold)', date: '2026-01-15' },
];

const MemberWalletModal: React.FC<Props> = ({ member, onClose, onUpdateBalance }) => {
    const [amount, setAmount] = useState<number>(0);
    const currentBalance = member?.coins || 0;

    if (!member) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Wallet Management</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                <div className={styles.content}>
                    <div className={styles.balanceCard}>
                        <div className={styles.balanceInfo}>
                            <Wallet size={32} color="#f5c842" />
                            <div>
                                <label>Current Balance</label>
                                <h3>{currentBalance} Coins</h3>
                            </div>
                        </div>
                    </div>

                    <div className={styles.adjustmentSection}>
                        <h4>Adjust Balance</h4>
                        <div className={styles.adjustInputWrap}>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(Number(e.target.value))}
                                placeholder="Enter amount..."
                            />
                            <div className={styles.adjustBtns}>
                                <button
                                    className={styles.addBtn}
                                    onClick={() => { onUpdateBalance(member.id, amount, 'add'); setAmount(0); }}
                                >
                                    <Plus size={18} /> Add
                                </button>
                                <button
                                    className={styles.deductBtn}
                                    onClick={() => { onUpdateBalance(member.id, amount, 'deduct'); setAmount(0); }}
                                >
                                    <Minus size={18} /> Deduct
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.historySection}>
                        <div className={styles.sectionHeader}>
                            <History size={18} />
                            <h4>Recent Transactions</h4>
                        </div>
                        <div className={styles.historyList}>
                            {mockHistory.map(item => (
                                <div key={item.id} className={styles.historyItem}>
                                    <div className={styles.historyIcon}>
                                        {item.type === 'add' ?
                                            <ArrowUpRight size={18} color="#10b981" /> :
                                            <ArrowDownLeft size={18} color="#ef4444" />
                                        }
                                    </div>
                                    <div className={styles.historyText}>
                                        <p>{item.reason}</p>
                                        <span>{item.date}</span>
                                    </div>
                                    <div className={`${styles.historyAmount} ${item.type === 'add' ? styles.plus : styles.minus}`}>
                                        {item.type === 'add' ? '+' : '-'}{item.amount}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberWalletModal;
