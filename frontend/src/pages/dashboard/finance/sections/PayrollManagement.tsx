import React from 'react';
import { DollarSign, Download, Calendar, Users, Briefcase } from 'lucide-react';
import styles from './FinanceSections.module.css';

const PayrollManagement: React.FC = () => {
    const mockPayroll = [
        { id: '1', department: 'Executive', headcount: 4, grossPay: '$45,000.00', taxes: '$9,000.00', netPay: '$36,000.00' },
        { id: '2', department: 'Engineering', headcount: 12, grossPay: '$95,000.00', taxes: '$19,000.00', netPay: '$76,000.00' },
        { id: '3', department: 'Support', headcount: 25, grossPay: '$80,000.00', taxes: '$12,000.00', netPay: '$68,000.00' },
        { id: '4', department: 'Sales & Marketing', headcount: 8, grossPay: '$55,000.00', taxes: '$11,000.00', netPay: '$44,000.00' },
    ];

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Payroll Management</h2>
                    <p className={styles.sectionSubtitle}>October 2023 Payroll Cycle (Status: Pending Review)</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.secondaryBtn}>
                        <Download size={16} /> Export Register
                    </button>
                    <button className={styles.primaryBtn}>
                        Run Payroll
                    </button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                        <DollarSign size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Total Gross Payroll</h4>
                        <p>$275,000.00</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)' }}>
                        <Briefcase size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Total Taxes & Deductions</h4>
                        <p>$51,000.00</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                        <Users size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Employees Paid</h4>
                        <p>49</p>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Department Breakdown</h3>
                    <span className={styles.dateLabel}><Calendar size={14} /> cycle ending Oct 31, 2023</span>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Department</th>
                                <th>Headcount</th>
                                <th>Gross Pay</th>
                                <th>Taxes & Deductions</th>
                                <th>Net Pay</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockPayroll.map(dept => (
                                <tr key={dept.id}>
                                    <td className={styles.highlightCell}>{dept.department}</td>
                                    <td>{dept.headcount}</td>
                                    <td className={styles.amountCell}>{dept.grossPay}</td>
                                    <td className={styles.amountCell} style={{ color: '#ef4444' }}>{dept.taxes}</td>
                                    <td className={styles.amountCell} style={{ color: '#10b981', fontWeight: 600 }}>{dept.netPay}</td>
                                    <td>
                                        <button className={styles.textLink}>View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', fontWeight: 600 }}>
                                <td style={{ padding: '16px 20px', color: '#f8fafc' }}>Total</td>
                                <td style={{ padding: '16px 20px' }}>49</td>
                                <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>$275,000.00</td>
                                <td style={{ padding: '16px 20px', color: '#ef4444' }}>$51,000.00</td>
                                <td style={{ padding: '16px 20px', color: '#10b981' }}>$224,000.00</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PayrollManagement;
