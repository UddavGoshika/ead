import React, { useState } from 'react';
import { Search, Filter, Plus, FileText, Download, Check, Clock, AlertTriangle } from 'lucide-react';
import styles from './FinanceSections.module.css';

const InvoiceList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const mockInvoices = [
        { id: 'INV-2023-089', client: 'Acme Corp', date: '2023-10-25', amount: '$4,500.00', status: 'Paid' },
        { id: 'INV-2023-090', client: 'Global Tech', date: '2023-10-26', amount: '$1,250.00', status: 'Pending' },
        { id: 'INV-2023-091', client: 'Smith & Co Legal', date: '2023-10-20', amount: '$8,900.00', status: 'Overdue' },
        { id: 'INV-2023-092', client: 'NextGen Solutions', date: '2023-10-28', amount: '$3,200.00', status: 'Draft' },
        { id: 'INV-2023-093', client: 'Alpha Industries', date: '2023-10-27', amount: '$6,750.00', status: 'Paid' },
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Paid': return { color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' };
            case 'Pending': return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' };
            case 'Overdue': return { color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' };
            case 'Draft': return { color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)', border: '1px solid rgba(148, 163, 184, 0.2)' };
            default: return {};
        }
    };

    const filteredInvoices = mockInvoices.filter(inv => {
        const matchesSearch = inv.client.toLowerCase().includes(searchTerm.toLowerCase()) || inv.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || inv.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Invoices & Payments</h2>
                    <p className={styles.sectionSubtitle}>Manage client billing, track payments and generate PDF invoices.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.secondaryBtn}>
                        <Download size={16} /> Export CSV
                    </button>
                    <button className={styles.primaryBtn}>
                        <Plus size={16} /> New Invoice
                    </button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                        <FileText size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Total Outstanding</h4>
                        <p>$13,350.00</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                        <Check size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Paid this Month</h4>
                        <p>$42,800.00</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                        <AlertTriangle size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Overdue Amount</h4>
                        <p>$8,900.00</p>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Recent Invoices</h3>
                    <div className={styles.filtersRow}>
                        <div className={styles.searchBox}>
                            <Search size={16} className={styles.icon} />
                            <input
                                type="text"
                                placeholder="Search client or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterBox}>
                            <Filter size={16} className={styles.icon} />
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                <option value="All">All Status</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                                <option value="Draft">Draft</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Invoice ID</th>
                                <th>Client Name</th>
                                <th>Date Issued</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map(invoice => (
                                <tr key={invoice.id}>
                                    <td className={styles.highlightCell}>{invoice.id}</td>
                                    <td>{invoice.client}</td>
                                    <td className={styles.dateCell}><Clock size={14} /> {invoice.date}</td>
                                    <td className={styles.amountCell}>{invoice.amount}</td>
                                    <td>
                                        <span className={styles.statusBadge} style={getStatusStyle(invoice.status)}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionLinks}>
                                            <button className={styles.textLink}>View</button>
                                            <button className={styles.textLink}>Download PDF</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredInvoices.length === 0 && (
                        <div className={styles.emptyState}>No invoices found matching criteria.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoiceList;
