import React, { useState } from "react";
import styles from "./ReferralEarnings.module.css";
import { Download, Filter, Eye, ChevronRight, X, Calendar } from "lucide-react";

type ReportRow = {
    month: string;
    totalReferrals: number;
    successfulReferrals: number;
    totalCommission: string;
    paidCommission: string;
    pendingCommission: string;
};

const extendedReportData: ReportRow[] = [
    { month: "Jan 2024", totalReferrals: 12, successfulReferrals: 8, totalCommission: "₹18,500", paidCommission: "₹15,000", pendingCommission: "₹3,500" },
    { month: "Feb 2023", totalReferrals: 13, successfulReferrals: 6, totalCommission: "₹14,800", paidCommission: "₹12,000", pendingCommission: "₹2,800" },
    { month: "Mar 2023", totalReferrals: 18, successfulReferrals: 10, totalCommission: "₹25,000", paidCommission: "₹22,000", pendingCommission: "₹3,000" },
    { month: "Apr 2023", totalReferrals: 6, successfulReferrals: 2, totalCommission: "₹4,200", paidCommission: "₹4,000", pendingCommission: "₹200" },
    { month: "May 2023", totalReferrals: 11, successfulReferrals: 5, totalCommission: "₹10,500", paidCommission: "₹10,000", pendingCommission: "₹500" },
    { month: "Jun 2023", totalReferrals: 22, successfulReferrals: 15, totalCommission: "₹35,000", paidCommission: "₹30,000", pendingCommission: "₹5,000" },
    { month: "Jul 2023", totalReferrals: 9, successfulReferrals: 4, totalCommission: "₹8,900", paidCommission: "₹8,000", pendingCommission: "₹900" },
    { month: "Aug 2023", totalReferrals: 15, successfulReferrals: 7, totalCommission: "₹14,200", paidCommission: "₹14,000", pendingCommission: "₹200" },
    { month: "Sep 2023", totalReferrals: 20, successfulReferrals: 12, totalCommission: "₹30,000", paidCommission: "₹25,000", pendingCommission: "₹5,000" },
    { month: "Oct 2023", totalReferrals: 8, successfulReferrals: 3, totalCommission: "₹5,600", paidCommission: "₹5,000", pendingCommission: "₹600" },
    { month: "Nov 2023", totalReferrals: 14, successfulReferrals: 9, totalCommission: "₹22,100", paidCommission: "₹20,000", pendingCommission: "₹2,100" },
    { month: "Dec 2023", totalReferrals: 17, successfulReferrals: 6, totalCommission: "₹12,400", paidCommission: "₹10,000", pendingCommission: "₹2,400" },
];

const ReferralEarningsReport: React.FC = () => {
    const [selectedRange, setSelectedRange] = useState("Last 12 Months");
    const [selectedRow, setSelectedRow] = useState<ReportRow | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            alert("Referral Earnings Report exported successfully (CSV)!");
            setIsExporting(false);
        }, 1500);
    };

    const getFilteredData = () => {
        const sortedData = [...extendedReportData].sort((a, b) => {
            const dateA = new Date(a.month.replace(' ', ' 1, '));
            const dateB = new Date(b.month.replace(' ', ' 1, '));
            return dateB.getTime() - dateA.getTime();
        });

        if (selectedRange === "Last 30 Days") return sortedData.slice(0, 1);
        if (selectedRange === "Last 3 Months") return sortedData.slice(0, 3);
        if (selectedRange === "Last 6 Months") return sortedData.slice(0, 6);
        if (selectedRange === "Last 12 Months") return sortedData.slice(0, 12);
        return sortedData; // All Time
    };

    const filteredData = getFilteredData();

    return (
        <div className={styles.wrapper}>
            <div className={styles.topHeader}>
                <div>
                    <h1>Referral Earnings Analytics</h1>
                    <p>Comprehensive breakdown of commissions earned through the referral program.</p>
                </div>

                <div className={styles.headerActions}>
                    <button className={styles.exportBtn} onClick={handleExport} disabled={isExporting}>
                        <Download size={18} /> {isExporting ? "Exporting..." : "Export Report"}
                    </button>
                    <div className={styles.selectWrapper}>
                        <Calendar size={18} className={styles.selectIcon} />
                        <select
                            className={styles.select}
                            value={selectedRange}
                            onChange={(e) => setSelectedRange(e.target.value)}
                        >
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                            <option>Last 6 Months</option>
                            <option>Last 12 Months</option>
                            <option>All Time</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.summaryGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statInfo}>
                        <span>Total Revenue</span>
                        <h3>₹2,16,500</h3>
                    </div>
                    <div className={`${styles.trend} ${styles.up}`}>+12.5%</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statInfo}>
                        <span>Paid Out</span>
                        <h3 className={styles.paidText}>₹1,75,000</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statInfo}>
                        <span>Pending Payout</span>
                        <h3 className={styles.pendingText}>₹41,500</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statInfo}>
                        <span>Total Active Referrals</span>
                        <h3>165</h3>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2>Monthly Breakdown (Jan - Dec)</h2>
                    <div className={styles.rangeInfo}>Showing: {selectedRange}</div>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Month period</th>
                                <th>Total Signups</th>
                                <th>Conversions</th>
                                <th>Commission</th>
                                <th>Paid</th>
                                <th>Remaining</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredData.map((row, index) => (
                                <tr key={index}>
                                    <td className={styles.month}>{row.month}</td>
                                    <td>{row.totalReferrals}</td>
                                    <td>
                                        <div className={styles.successBarWrapper}>
                                            <span>{row.successfulReferrals}</span>
                                            <div className={styles.successBar}>
                                                <div
                                                    className={styles.successProgress}
                                                    style={{ width: `${(row.successfulReferrals / row.totalReferrals) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={styles.money}>{row.totalCommission}</td>
                                    <td className={`${styles.money} ${styles.paidGreen}`}>{row.paidCommission}</td>
                                    <td className={`${styles.money} ${styles.pendingOrange}`}>{row.pendingCommission}</td>
                                    <td>
                                        <button className={styles.detailsBtn} onClick={() => setSelectedRow(row)}>
                                            View Details <ChevronRight size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRow && (
                <div className={styles.modalOverlay} onClick={() => setSelectedRow(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Details for {selectedRow.month}</h3>
                            <button className={styles.closeBtn} onClick={() => setSelectedRow(null)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.detailItem}>
                                    <label>Total Referral Attempts</label>
                                    <span>{selectedRow.totalReferrals}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Successful Conversions</label>
                                    <span>{selectedRow.successfulReferrals}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Conversion Rate</label>
                                    <span>{((selectedRow.successfulReferrals / selectedRow.totalReferrals) * 100).toFixed(1)}%</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Total Earned</label>
                                    <span className={styles.money}>{selectedRow.totalCommission}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Amount Settled</label>
                                    <span className={styles.paidGreen}>{selectedRow.paidCommission}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label>Balance Pending</label>
                                    <span className={styles.pendingOrange}>{selectedRow.pendingCommission}</span>
                                </div>
                            </div>
                            <div className={styles.note}>
                                <p>* Settlements for this period are processed within the first 5 working days of the following month.</p>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.closeActionBtn} onClick={() => setSelectedRow(null)}>Close</button>
                            <button className={styles.printActionBtn} onClick={() => window.print()}>Print Statement</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralEarningsReport;
