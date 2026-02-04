import React, { useState, useEffect, useMemo, useRef } from "react";
import { MoreVertical, Search, Filter, Download, User, Mail, Phone, Calendar, RefreshCcw, Eye, CheckCircle, History as HistoryIcon, X } from "lucide-react";
import styles from "./WalletHistory.module.css";
import type { Transaction, SortState, FilterState, SortField } from "./types";

const initialTransactions: Transaction[] = [
    {
        id: "TXN1001",
        name: "Rohan Mehta",
        userId: "ADV-001",
        email: "rohan.mehta@example.com",
        phone: "+91 98765-43210",
        role: "Advocate",
        wallet: "main",
        source: "recharge",
        plan: "Pro Gold",
        refBy: "-",
        type: "credit",
        amount: 5000,
        status: "completed",
        date: "2026-01-20",
        gateway: "razorpay",
        paymentMethod: "upi",
        notes: "Recharge for annual plan upgrade",
        ip: "103.45.67.89",
    },
    {
        id: "TXN1002",
        name: "Sunil Verma",
        userId: "CLI-042",
        email: "sunil.v@verified.in",
        phone: "+91 88221-55443",
        role: "Client",
        wallet: "main",
        source: "case_payment",
        plan: "-",
        refBy: "-",
        type: "debit",
        amount: 1500,
        status: "completed",
        date: "2026-01-21",
        gateway: "internal",
        paymentMethod: "wallet",
        notes: "Payment for case ID #8821",
        ip: "115.12.34.56",
    },
    {
        id: "TXN1003",
        name: "Arya Stark",
        userId: "ADV-109",
        email: "arya.stark@winterfell.org",
        phone: "+91 70012-33445",
        role: "Advocate",
        wallet: "referral",
        source: "referral",
        plan: "-",
        refBy: "Jon Snow",
        type: "credit",
        amount: 250,
        status: "completed",
        date: "2026-01-22",
        gateway: "system",
        paymentMethod: "referral_program",
        notes: "Bonus for successful referral",
        ip: "152.0.11.22",
    },
    {
        id: "TXN1004",
        name: "Vikram Singh",
        userId: "CLI-990",
        email: "vikram.singh@corporate.co",
        phone: "+91 99887-76655",
        role: "Client",
        wallet: "main",
        source: "recharge",
        plan: "-",
        refBy: "-",
        type: "credit",
        amount: 1000,
        status: "pending",
        date: "2026-01-23",
        gateway: "manual",
        paymentMethod: "bank_transfer",
        notes: "Awaiting bank verification",
        ip: "192.168.1.10",
    },
    {
        id: "TXN1005",
        name: "Meera Bai",
        userId: "ADV-205",
        email: "meera.b@temple.in",
        phone: "+91 91122-33445",
        role: "Advocate",
        wallet: "bonus",
        source: "promo_code",
        plan: "-",
        refBy: "-",
        type: "credit",
        amount: 500,
        status: "completed",
        date: "2026-01-24",
        gateway: "system",
        paymentMethod: "coupon",
        notes: "Republic Day Promo",
        ip: "45.67.89.01",
    }
];

const WalletHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
    const [filtered, setFiltered] = useState<Transaction[]>(initialTransactions);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sort, setSort] = useState<SortState>({ field: "date", direction: "desc" });
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        role: "all",
        type: "all",
        wallet: "all",
        source: "all",
        gateway: "all",
        method: "all",
        status: "all",
        minAmount: "",
        maxAmount: "",
        fromDate: "",
        toDate: "",
    });
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Close menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        fetchAllTransactions();
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchAllTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('/api/payments/admin/all-transactions', {
                headers: { Authorization: token || '' }
            });

            if (data.success) {
                const mapped: Transaction[] = data.transactions.map((t: any) => ({
                    id: t.orderId.split('_').pop() || t.orderId,
                    name: t.user?.name || 'End User',
                    userId: t.userId.substring(0, 8).toUpperCase(),
                    email: t.user?.email || 'N/A',
                    phone: t.metadata?.phone || 'N/A',
                    role: t.user?.role === 'client' ? 'Client' : 'Advocate',
                    wallet: t.packageId && t.packageId.includes('wallet') ? 'main' : 'premium',
                    source: t.packageId || 'Transfer',
                    plan: t.user?.plan || '-',
                    refBy: '-',
                    type: t.status === 'success' || t.status === 'completed' ? 'credit' : 'debit',
                    amount: t.amount,
                    status: t.status.toLowerCase() as any,
                    date: new Date(t.createdAt).toISOString().split('T')[0],
                    gateway: t.gateway,
                    paymentMethod: t.paymentId ? 'System' : 'Pending',
                    notes: t.message || '',
                    ip: t.metadata?.ip || 'Internal'
                }));
                setTransactions(mapped);
                setFiltered(mapped);
            }
        } catch (err) {
            console.error("Admin Ledger Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Apply filters, sorting & pagination
    const applyFilters = () => {
        setLoading(true);
        setTimeout(() => {
            let result = [...transactions];

            if (filters.search.trim()) {
                const q = filters.search.toLowerCase();
                result = result.filter(
                    (t) =>
                        t.id.toLowerCase().includes(q) ||
                        t.name.toLowerCase().includes(q) ||
                        t.userId.toLowerCase().includes(q) ||
                        t.email.toLowerCase().includes(q) ||
                        t.phone.includes(q) ||
                        (t.notes && t.notes.toLowerCase().includes(q))
                );
            }

            if (filters.role !== "all") result = result.filter((t) => t.role === filters.role);
            if (filters.type !== "all") result = result.filter((t) => t.type === filters.type);
            if (filters.wallet !== "all") result = result.filter((t) => t.wallet === filters.wallet);
            if (filters.status !== "all") result = result.filter((t) => t.status === filters.status);

            if (filters.minAmount !== "") result = result.filter((t) => t.amount >= Number(filters.minAmount));
            if (filters.maxAmount !== "") result = result.filter((t) => t.amount <= Number(filters.maxAmount));

            if (filters.fromDate) result = result.filter((t) => new Date(t.date) >= new Date(filters.fromDate));
            if (filters.toDate) {
                const to = new Date(filters.toDate);
                to.setHours(23, 59, 59);
                result = result.filter((t) => new Date(t.date) <= to);
            }

            result.sort((a, b) => {
                let valA = a[sort.field];
                let valB = b[sort.field];
                if (sort.field === "amount") {
                    const nA = Number(valA), nB = Number(valB);
                    return sort.direction === "asc" ? nA - nB : nB - nA;
                } else if (sort.field === "date") {
                    const dA = new Date(valA as string).getTime(), dB = new Date(valB as string).getTime();
                    return sort.direction === "asc" ? dA - dB : dB - dA;
                } else {
                    const sA = String(valA || "").toLowerCase(), sB = String(valB || "").toLowerCase();
                    return sort.direction === "asc" ? sA.localeCompare(sB) : sB.localeCompare(sA);
                }
            });

            setFiltered(result);
            setPage(1);
            setLoading(false);
        }, 300);
    };

    const resetFilters = () => {
        setFilters({
            search: "", role: "all", type: "all", wallet: "all", source: "all", gateway: "all", method: "all", status: "all",
            minAmount: "", maxAmount: "", fromDate: "", toDate: "",
        });
        setFiltered([...transactions]);
        setPage(1);
    };

    const handleReject = async (orderId: string) => {
        if (window.confirm("Are you sure you want to reject this transaction?")) {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.post(`/api/payments/admin/transactions/${orderId}/reject`,
                    { reason: 'Manual Rejection by Admin' },
                    { headers: { Authorization: token || '' } }
                );

                if (data.success) {
                    alert("Transaction marked as failed.");
                    fetchAllTransactions();
                }
            } catch (err) {
                alert("Action failed: Unauthorized or network error.");
            } finally {
                setLoading(false);
                setOpenMenuId(null);
                setSelectedTx(null);
            }
        }
    };

    const handleApproveAction = async (orderId: string) => {
        if (!window.confirm("Authorize this transaction and update user account?")) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`/api/payments/admin/transactions/${orderId}/verify`,
                {},
                { headers: { Authorization: token || '' } }
            );

            if (data.success) {
                alert("Transaction approved and user account updated!");
                fetchAllTransactions();
            }
        } catch (err) {
            alert("Approval failed.");
        } finally {
            setLoading(false);
            setOpenMenuId(null);
            setSelectedTx(null);
        }
    };

    const handleViewUserHistory = (userId: string) => {
        setFilters(prev => ({ ...prev, search: userId }));
        setOpenMenuId(null);
    };

    const paginatedData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page, pageSize]);

    const totalPages = Math.ceil(filtered.length / pageSize);

    const summary = useMemo(() => {
        const completed = filtered.filter((t) => t.status === "completed");
        let credit = 0, debit = 0, pending = 0;
        completed.forEach((t) => {
            if (t.type === "credit") credit += t.amount;
            else debit += t.amount;
        });
        filtered.forEach((t) => { if (t.status === "pending") pending++; });
        return {
            balance: credit - debit,
            credit,
            debit,
            pending,
        };
    }, [filtered]);

    useEffect(() => {
        applyFilters();
    }, [filters, sort, transactions]);

    return (
        <div className={styles.page}>
            <div className={styles.topHeader}>
                <h1 className={styles.pageTitle}>Wallet History</h1>
                <div className={styles.topActions}>
                    <button className={styles.iconBtn} onClick={fetchAllTransactions} title="Refresh Ledger"><RefreshCcw size={18} /></button>
                    <button className={styles.btnPrimary} onClick={() => { }}><Download size={18} /> Export Oversight</button>
                </div>
            </div>

            {/* Selectable Filters UI */}
            <div className={styles.filterSection}>
                <div className={styles.searchBar}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Live search by Name, ID, Email, Phone..."
                        value={filters.search}
                        onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
                    />
                </div>

                <div className={styles.chipRow}>
                    <div className={styles.chipGroup}>
                        <label>User Role:</label>
                        {["all", "Advocate", "Client"].map(r => (
                            <button
                                key={r}
                                className={`${styles.chip} ${filters.role === r ? styles.activeChip : ""}`}
                                onClick={() => setFilters(p => ({ ...p, role: r as any }))}
                            >
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className={styles.chipGroup}>
                        <label>Status:</label>
                        {["all", "completed", "pending", "failed"].map(s => (
                            <button
                                key={s}
                                className={`${styles.chip} ${filters.status === s ? styles.activeChip : ""}`}
                                onClick={() => setFilters(p => ({ ...p, status: s as any }))}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className={styles.chipGroup}>
                        <label>Txn Type:</label>
                        {["all", "credit", "debit"].map(t => (
                            <button
                                key={t}
                                className={`${styles.chip} ${filters.type === t ? styles.activeChip : ""}`}
                                onClick={() => setFilters(p => ({ ...p, type: t as any }))}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.advanceFilters}>
                    <div className={styles.inputGroup}>
                        <Calendar size={16} />
                        <input type="date" value={filters.fromDate} onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value }))} />
                        <span>to</span>
                        <input type="date" value={filters.toDate} onChange={e => setFilters(p => ({ ...p, toDate: e.target.value }))} />
                    </div>
                    <div className={styles.inputGroup}>
                        <span>₹</span>
                        <input type="number" placeholder="Min" value={filters.minAmount} onChange={e => setFilters(p => ({ ...p, minAmount: e.target.value ? Number(e.target.value) : "" }))} />
                        <span>-</span>
                        <input type="number" placeholder="Max" value={filters.maxAmount} onChange={e => setFilters(p => ({ ...p, maxAmount: e.target.value ? Number(e.target.value) : "" }))} />
                    </div>
                    <div className={styles.filterActionsRow}>
                        <button className={styles.btnPrimary} onClick={applyFilters}><Search size={16} /> Search Transactions</button>
                        <button className={`${styles.btnOutline} ${styles.fullClearBtn}`} onClick={resetFilters}>Clear All Filters</button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            {/* <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <label>Wallet Balance</label>
                    <div className={styles.statValue}>₹{summary.balance.toLocaleString()}</div>
                    <div className={styles.statTrend}>Live Account Balance</div>
                </div>
                <div className={styles.statCard}>
                    <label>Total Credits</label>
                    <div className={`${styles.statValue} ${styles.creditText}`}>₹{summary.credit.toLocaleString()}</div>
                    <div className={styles.statTrend}>In-flow Volume</div>
                </div>
                <div className={styles.statCard}>
                    <label>Total Debits</label>
                    <div className={`${styles.statValue} ${styles.debitText}`}>₹{summary.debit.toLocaleString()}</div>
                    <div className={styles.statTrend}>Out-flow Volume</div>
                </div>
                <div className={styles.statCard}>
                    <label>Pending Inbox</label>
                    <div className={`${styles.statValue} ${styles.pendingText}`}>{summary.pending}</div>
                    <div className={styles.statTrend}>Awaiting Action</div>
                </div>
            </div> */}

            {/* Highly Detailed Table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>User Details</th>
                            <th>Contact Info</th>
                            <th>Plan</th>
                            <th>Ref. By</th>
                            <th>Type</th>
                            <th onClick={() => setSort({ field: "date", direction: sort.direction === "asc" ? "desc" : "asc" })}>
                                Date & ID
                            </th>
                            <th>Wallet/Source</th>
                            <th>Gateway/Method</th>
                            <th onClick={() => setSort({ field: "amount", direction: sort.direction === "asc" ? "desc" : "asc" })}>
                                Amount
                            </th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginatedData.map((tx, idx) => (
                            <tr key={tx.id}>
                                {/* 1. Serial No */}
                                <td>{(page - 1) * pageSize + idx + 1}</td>

                                {/* 2. User Details */}
                                <td>
                                    <div
                                        className={styles.userCell}
                                        onClick={() => setSelectedTx(tx)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className={styles.userName}>{tx.name}</div>
                                        <div className={styles.userIdRow}>
                                            <span className={`${styles.roleTag} ${styles[tx.role.toLowerCase()]}`}>
                                                {tx.role}
                                            </span>
                                            <span className={styles.smallId}>{tx.userId}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* 3. Contact Info */}
                                <td>
                                    <div className={styles.contactCell}>
                                        <div className={styles.contactItem}>
                                            <Mail size={12} /> {tx.email}
                                        </div>
                                        <div className={styles.contactItem}>
                                            <Phone size={12} /> {tx.phone}
                                        </div>
                                    </div>
                                </td>

                                {/* 4. Plan */}
                                <td>
                                    <span className={styles.planName}>{tx.plan || "-"}</span>
                                </td>

                                {/* 5. Ref. By */}
                                <td>
                                    <span className={styles.refName}>{tx.refBy || "-"}</span>
                                </td>

                                {/* 6. Type */}
                                <td>
                                    <span className={`${styles.typeTag} ${styles[tx.type]}`}>
                                        {tx.type.toUpperCase()}
                                    </span>
                                </td>

                                {/* 7. Date & ID */}
                                <td>
                                    <div className={styles.dateCell}>
                                        <span>{tx.date}</span>
                                        <small className={styles.txnId}>{tx.id}</small>
                                    </div>
                                </td>

                                {/* 8. Wallet / Source */}
                                <td>
                                    <div className={styles.sourceCell}>
                                        <div className={styles.walletName}>{tx.wallet.toUpperCase()}</div>
                                        <div className={styles.sourceName}>{tx.source}</div>
                                    </div>
                                </td>

                                {/* 9. Gateway / Method */}
                                <td>
                                    <div className={styles.methodCell}>
                                        <div className={styles.gatewayName}>{tx.gateway}</div>
                                        <div className={styles.methodName}>{tx.paymentMethod}</div>
                                    </div>
                                </td>

                                {/* 10. Amount */}
                                <td className={`${styles.amountCell} ${styles[tx.type]}`}>
                                    {tx.type === "credit" ? "+" : "-"} ₹{tx.amount.toLocaleString()}
                                </td>

                                {/* 11. Status */}
                                <td>
                                    <span className={`${styles.statusBadge} ${styles[tx.status]}`}>
                                        {tx.status}
                                    </span>
                                </td>

                                {/* 12. Action */}
                                <td className={styles.actionCell}>
                                    <div className={styles.menuContainer}>
                                        <button
                                            className={styles.dotsBtn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === tx.id ? null : tx.id);
                                            }}
                                        >
                                            <MoreVertical size={18} />
                                        </button>

                                        {openMenuId === tx.id && (
                                            <div className={styles.dropdownMenu} ref={menuRef}>
                                                <button onClick={() => { setSelectedTx(tx); setOpenMenuId(null); }}>
                                                    <Eye size={14} /> View Manifest
                                                </button>

                                                {tx.status === "pending" && (
                                                    <>
                                                        <button
                                                            className={styles.approveMenuBtn}
                                                            onClick={() => handleApproveAction(tx.id)}
                                                        >
                                                            <CheckCircle size={14} /> Authorize
                                                        </button>
                                                        <button
                                                            className={styles.deleteMenuBtn}
                                                            onClick={() => handleReject(tx.id)}
                                                        >
                                                            <X size={14} /> Reject
                                                        </button>
                                                    </>
                                                )}

                                                <button onClick={() => handleViewUserHistory(tx.userId)}>
                                                    <HistoryIcon size={14} /> User History
                                                </button>

                                                <div className={styles.menuDivider}></div>

                                                <button className={styles.deleteMenuBtn}>
                                                    <X size={14} /> Void Entry
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
                {filtered.length === 0 && <div className={styles.emptyState}>No matching records found. Try adjusting your filters.</div>}

                <div className={styles.paginationRow}>
                    <div className={styles.paginationInfo}>
                        Showing {Math.min(filtered.length, (page - 1) * pageSize + 1)} - {Math.min(filtered.length, page * pageSize)} of {filtered.length} entries
                    </div>

                    <div className={styles.paginationControls}>
                        <button className={styles.pageBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <span className={styles.pageIndicator}>Page {page} of {Math.max(1, totalPages)}</span>
                        <button className={styles.pageBtn} disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>

                    <select className={styles.pageSizeSelect} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                        <option value={5}>5 per page</option>
                        <option value={10}>10 per page</option>
                        <option value={20}>20 per page</option>
                        <option value={50}>50 per page</option>
                    </select>
                </div>
            </div>

            {/* Improved Detail Modal */}
            {selectedTx && (
                <div className={styles.modalOverlay} onClick={() => setSelectedTx(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Transaction Manifest</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedTx(null)}><X size={20} /></button>
                        </div>
                        <div className={styles.manifestBody}>
                            <div className={styles.manifestHero}>
                                <div className={`${styles.heroAmount} ${styles[selectedTx.type]}`}>
                                    {selectedTx.type === 'credit' ? '+' : '-'} ₹{selectedTx.amount.toLocaleString()}
                                </div>
                                <span className={`${styles.heroStatus} ${styles[selectedTx.status]}`}>{selectedTx.status}</span>
                            </div>

                            <div className={styles.manifestGrid}>
                                <div className={styles.manifestItem}><label>Txn ID</label><span>{selectedTx.id}</span></div>
                                <div className={styles.manifestItem}><label>System Date</label><span>{selectedTx.date}</span></div>
                                <div className={styles.manifestItem}><label>Account Holder</label><span>{selectedTx.name} ({selectedTx.userId})</span></div>
                                <div className={styles.manifestItem}><label>Contact</label><span>{selectedTx.email}<br />{selectedTx.phone}</span></div>
                                <div className={styles.manifestItem}><label>Route</label><span>{selectedTx.gateway} / {selectedTx.paymentMethod}</span></div>
                                <div className={styles.manifestItem}><label>Destination</label><span>{selectedTx.wallet.toUpperCase()} Wallet</span></div>
                                <div className={styles.manifestItem}><label>IP Access</label><span>{selectedTx.ip}</span></div>
                                <div className={styles.manifestItem}><label>Reference</label><span>{selectedTx.source}</span></div>
                            </div>

                            <div className={styles.manifestNotes}>
                                <label>Internal Audit Notes</label>
                                <p>{selectedTx.notes || "Standard system-generated transaction entry. No additional remarks found."}</p>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            {selectedTx.status === 'pending' ? (
                                <>
                                    <button className={`${styles.btnPrimary} ${styles.modalApprove}`} onClick={() => handleApproveAction(selectedTx.id)}>Approve Transaction</button>
                                    <button className={`${styles.btnOutline} ${styles.modalReject}`} onClick={() => handleReject(selectedTx.id)}>Reject Transaction</button>
                                </>
                            ) : (
                                <>
                                    <button className={styles.btnOutline} onClick={() => window.print()}>Print Receipt</button>
                                    <button className={styles.btnPrimary} onClick={() => setSelectedTx(null)}>Acknowledged</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {loading && <div className={styles.loadingScreen}><div className={styles.loader}></div><span>Parsing Ledger...</span></div>}
        </div>
    );
};

export default WalletHistory;
