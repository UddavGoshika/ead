import React, { useState } from 'react';
import { Plus, Filter, Search, CheckCircle, XCircle, FileText } from 'lucide-react';
import styles from './FinanceSections.module.css';

const Expenses: React.FC = () => {
    const [activeTab, setActiveTab] = useState('pending');

    const mockExpenses = [
        { id: 'EXP-1045', employee: 'John Doe', category: 'Travel', amount: '$450.00', date: '2023-10-25', status: 'Pending' },
        { id: 'EXP-1046', employee: 'Jane Smith', category: 'Software', amount: '$120.00', date: '2023-10-26', status: 'Approved' },
        { id: 'EXP-1047', employee: 'Mike Johnson', category: 'Office Supplies', amount: '$45.50', date: '2023-10-22', status: 'Rejected' },
        { id: 'EXP-1048', employee: 'Sarah Williams', category: 'Marketing', amount: '$1,200.00', date: '2023-10-28', status: 'Pending' },
    ];

    const filteredExpenses = mockExpenses.filter(exp =>
        activeTab === 'all' ||
        (activeTab === 'pending' && exp.status === 'Pending') ||
        (activeTab === 'resolved' && exp.status !== 'Pending')
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Approved': return { color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' };
            case 'Pending': return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' };
            case 'Rejected': return { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' };
            default: return {};
        }
    };

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Expense Management</h2>
                    <p className={styles.sectionSubtitle}>Review, approve, and reimburse employee expenses.</p>
                </div>
                <button className={styles.primaryBtn}>
                    <Plus size={16} /> Submit Expense
                </button>
            </div>

            <div className={styles.tabsContainer}>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('pending')}
                >
                    Pending Approvals
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'resolved' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('resolved')}
                >
                    Resolved
                </button>
                <button
                    className={`${styles.tabBtn} ${activeTab === 'all' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Expenses
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Expense ID</th>
                                <th>Employee</th>
                                <th>Category</th>
                                <th>Date Submitted</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Receipt</th>
                                {activeTab === 'pending' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map(exp => (
                                <tr key={exp.id}>
                                    <td className={styles.highlightCell}>{exp.id}</td>
                                    <td>{exp.employee}</td>
                                    <td>{exp.category}</td>
                                    <td className={styles.dateCell}>{exp.date}</td>
                                    <td className={styles.amountCell}>{exp.amount}</td>
                                    <td>
                                        <span className={styles.statusBadge} style={getStatusStyle(exp.status)}>
                                            {exp.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.iconBtnInfo} title="View Receipt">
                                            <FileText size={16} />
                                        </button>
                                    </td>
                                    {activeTab === 'pending' && (
                                        <td>
                                            <div className={styles.actionRow}>
                                                <button className={styles.iconBtnSuccess} title="Approve"><CheckCircle size={18} /></button>
                                                <button className={styles.iconBtnDanger} title="Reject"><XCircle size={18} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredExpenses.length === 0 && (
                        <div className={styles.emptyState}>No expenses found in this view.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Expenses;
