import React, { useState } from "react";
import styles from "./WalletWithdraw.module.css";
import { CheckCircle, XCircle, MoreVertical, Zap, Eye, FileText, Search } from "lucide-react";

type Status = "Pending" | "Approved" | "Rejected";

type Request = {
    id: string;
    user: string;
    userId: string;
    email: string;
    mobile: string;
    amount: number;
    method: string;
    account: string;
    date: string;
    status: Status;
    txnDate?: string;
};

const initialRequests: Request[] = [
    {
        id: "WDR001",
        user: "John Smith",
        userId: "USR-8821",
        email: "john@example.com",
        mobile: "+91 98765 43210",
        amount: 5000,
        method: "UPI / Bank",
        account: "john@okhdfc",
        date: "2024-01-15",
        status: "Pending"
    },
    {
        id: "WDR002",
        user: "Emma Johnson",
        userId: "USR-4412",
        email: "emma.j@gmail.com",
        mobile: "+91 87654 32109",
        amount: 7500,
        method: "Bank Transfer",
        account: "****1234",
        date: "2024-01-14",
        status: "Approved",
        txnDate: "2024-01-14 18:30"
    },
    {
        id: "WDR003",
        user: "Michael Brown",
        userId: "USR-9901",
        email: "mike.b@law.in",
        mobile: "+91 76543 21098",
        amount: 10000,
        method: "Wallet Credit",
        account: "Internal Wallet",
        date: "2024-01-13",
        status: "Rejected"
    },
];

const WithdrawalRequests: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>(initialRequests);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
    const [userTypeFilter, setUserTypeFilter] = useState<"All" | "Advocate" | "Client">("All");
    const [methodFilter, setMethodFilter] = useState<string>("All");
    const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

    const filteredRequests = React.useMemo(() => {
        let result = requests.filter(r => {
            const matchesSearch =
                r.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.id.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "All" || r.status === statusFilter;
            const matchesMethod = methodFilter === "All" || r.method.includes(methodFilter);
            // Simulating user type since it's not in the mock data yet
            const matchesUserType = userTypeFilter === "All";

            return matchesSearch && matchesStatus && matchesMethod && matchesUserType;
        });

        return result.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortBy === "newest" ? dateB - dateA : dateA - dateB;
        });
    }, [requests, searchTerm, statusFilter, userTypeFilter, methodFilter, sortBy]);

    const handleAction = (id: string, newStatus: Status) => {
        setRequests(requests.map(r => r.id === id ? {
            ...r,
            status: newStatus,
            txnDate: newStatus === "Approved" ? new Date().toISOString().slice(0, 16).replace('T', ' ') : r.txnDate
        } : r));
        setOpenMenu(null);
        alert(`Request ${id} has been ${newStatus.toLowerCase()}.`);
    };

    const handleBulkProcess = () => {
        const pendingCount = requests.filter(r => r.status === "Pending").length;
        if (pendingCount === 0) return alert("No pending requests.");
        if (window.confirm(`Approve all ${pendingCount} pending requests?`)) {
            setRequests(requests.map(r => r.status === "Pending" ? {
                ...r,
                status: "Approved",
                txnDate: new Date().toISOString().slice(0, 16).replace('T', ' ')
            } : r));
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <div>
                    <h1>Wallet Withdrawal Requests</h1>
                    <p>Manage payout requests with full transaction history.</p>
                </div>
                <button className={styles.bulkBtn} onClick={handleBulkProcess}>
                    <Zap size={18} /> Bulk Approve Pending
                </button>
            </div>

            <div className={styles.filterBar}>
                <div className={styles.searchContainer}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search User, ID, or Request ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterGroups}>
                    <div className={styles.filterSet}>
                        <label>User Type</label>
                        <div className={styles.pills}>
                            {["All", "Advocate", "Client"].map(t => (
                                <button
                                    key={t}
                                    className={`${styles.pill} ${userTypeFilter === t ? styles.active : ""}`}
                                    onClick={() => setUserTypeFilter(t as any)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.filterSet}>
                        <label>Status</label>
                        <div className={styles.pills}>
                            {["All", "Pending", "Approved", "Rejected"].map(s => (
                                <button
                                    key={s}
                                    className={`${styles.pill} ${statusFilter === s ? styles.active : ""}`}
                                    onClick={() => setStatusFilter(s as any)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.filterSet}>
                        <label>Method</label>
                        <select className={styles.select} value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
                            <option value="All">All Methods</option>
                            <option value="UPI">UPI / Bank</option>
                            <option value="Bank">Bank Transfer</option>
                            <option value="Wallet">Wallet Credit</option>
                        </select>
                    </div>
                    <div className={styles.filterSet}>
                        <label>Sort By</label>
                        <select className={styles.select} value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>User / ID</th>
                                <th>Mail / MobileNo</th>
                                <th>Request ID</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Account Info</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Txn Date</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredRequests.map((r, index) => (
                                <tr key={r.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className={styles.stackedCell}>
                                            <span className={styles.primaryText}>{r.user}</span>
                                            <span className={styles.secondaryText}>{r.userId}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.stackedCell}>
                                            <span className={styles.primaryText}>{r.email}</span>
                                            <span className={styles.secondaryText}>{r.mobile}</span>
                                        </div>
                                    </td>
                                    <td className={styles.requestId}>{r.id}</td>
                                    <td className={styles.amount}>₹{r.amount}</td>
                                    <td>{r.method}</td>
                                    <td className={styles.mono}>{r.account}</td>
                                    <td><span className={styles.secondaryText}>{r.date}</span></td>
                                    <td>
                                        <span className={`${styles.status} ${styles[r.status.toLowerCase()]}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={styles.secondaryText}>{r.txnDate || "---"}</span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button className={styles.dots} onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)}>
                                            <MoreVertical size={16} />
                                        </button>
                                        {openMenu === r.id && (
                                            <div className={styles.menu}>
                                                {r.status === "Pending" && (
                                                    <>
                                                        <button className={styles.approve} onClick={() => handleAction(r.id, "Approved")}>
                                                            <CheckCircle size={14} /> Approve
                                                        </button>
                                                        <button className={styles.reject} onClick={() => handleAction(r.id, "Rejected")}>
                                                            <XCircle size={14} /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                <button className={styles.view} onClick={() => alert("Report generated for " + r.id)}>
                                                    <FileText size={14} /> Report
                                                </button>
                                                <button className={styles.view} onClick={() => alert("Viewing " + r.id)}>
                                                    <Eye size={14} /> View
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WithdrawalRequests;
