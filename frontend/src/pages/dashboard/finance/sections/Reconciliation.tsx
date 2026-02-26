import React, { useState } from 'react';
import { RefreshCw, Search, CheckCircle, AlertTriangle, ArrowRight, Download, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const transactions = [
    { id: 'TXN-99881', date: '2024-10-24', bankDetails: 'HDFC BANK - *9901 - UPI/MOBILE/9831', amount: '₹12,400', match: 'INV-2024-0012', confidence: '98%', status: 'matched' },
    { id: 'TXN-99882', date: '2024-10-24', bankDetails: 'RAZORPAY - ADVO-FEES-CUS-12', amount: '₹3,500', match: 'INV-2024-0015', confidence: '100%', status: 'matched' },
    { id: 'TXN-99883', date: '2024-10-23', bankDetails: 'UPI - 4421990212 - UNKNOWN', amount: '₹1,200', match: null, confidence: '0%', status: 'unmatched' },
    { id: 'TXN-99884', date: '2024-10-23', bankDetails: 'ICICI - NEFT - SETTLEMENT', amount: '₹45,000', match: 'INV-2024-0009', confidence: '45%', status: 'suggestion' },
];

const Reconciliation: React.FC = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ color: '#f8fafc', margin: 0 }}>Reconciliation Assistant</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>Match bank transactions with issued invoices and receipts.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Download size={16} /> Export Audit Log
                    </button>
                    <button style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <RefreshCw size={16} /> Sync Bank Feed
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Total Unmatched</span>
                        <AlertTriangle size={18} className="text-yellow-500" />
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc' }}>14</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>₹42,300 across 4 accounts</div>
                </div>
                <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Match Accuracy</span>
                        <CheckCircle size={18} className="text-green-500" />
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc' }}>94.2%</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Last 30 days performance</div>
                </div>
            </div>

            <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', background: '#33415540', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#f8fafc' }}>Bank Transaction Log</h4>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input type="text" placeholder="Search transactions..." style={{ padding: '6px 10px 6px 34px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }} />
                    </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #334155', color: '#64748b', fontSize: '0.8rem' }}>
                            <th style={{ padding: '16px 20px' }}>DATE</th>
                            <th style={{ padding: '16px 20px' }}>BANK DESCRIPTION</th>
                            <th style={{ padding: '16px 20px' }}>AMOUNT</th>
                            <th style={{ padding: '16px 20px' }}>SUGGESTED MATCH</th>
                            <th style={{ padding: '16px 20px' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #334155', color: '#f8fafc' }}>
                                <td style={{ padding: '16px 20px', fontSize: '0.85rem' }}>{tx.date}</td>
                                <td style={{ padding: '16px 20px' }}>
                                    <div style={{ fontSize: '0.9rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tx.bankDetails}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tx.id}</div>
                                </td>
                                <td style={{ padding: '16px 20px', fontWeight: 'bold' }}>{tx.amount}</td>
                                <td style={{ padding: '16px 20px' }}>
                                    {tx.match ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '0.85rem', color: tx.status === 'matched' ? '#10b981' : '#f59e0b' }}>{tx.match}</span>
                                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#334155', borderRadius: '10px' }}>{tx.confidence}</span>
                                        </div>
                                    ) : (
                                        <span style={{ fontSize: '0.85rem', color: '#ef4444' }}>No Match Found</span>
                                    )}
                                </td>
                                <td style={{ padding: '16px 20px' }}>
                                    {tx.status === 'matched' ? (
                                        <button style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #10b981', color: '#10b981', borderRadius: '6px', fontSize: '0.8rem' }}>Unmatch</button>
                                    ) : (
                                        <button style={{ padding: '6px 12px', background: '#3b82f6', border: 'none', color: '#fff', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            Reconcile <ArrowRight size={14} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reconciliation;
