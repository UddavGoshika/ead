// import React, { useState } from "react";
// import styles from "./WalletRecharge.module.css";

// type Status = "Pending" | "Approved" | "Rejected";

// type Request = {
//     id: string;
//     user: string;
//     amount: string;
//     method: string;
//     date: string;
//     status: Status;
// };

// const requests: Request[] = [
//     {
//         id: "REQ001",
//         user: "John Smith",
//         amount: "$100",
//         method: "Bank Transfer",
//         date: "2024-01-15",
//         status: "Pending",
//     },
//     {
//         id: "REQ002",
//         user: "Emma Johnson",
//         amount: "$50",
//         method: "Cash Deposit",
//         date: "2024-01-14",
//         status: "Approved",
//     },
//     {
//         id: "REQ003",
//         user: "Michael Brown",
//         amount: "$200",
//         method: "Bank Transfer",
//         date: "2024-01-13",
//         status: "Pending",
//     },
//     {
//         id: "REQ004",
//         user: "Sarah Davis",
//         amount: "$75",
//         method: "Cheque",
//         date: "2024-01-12",
//         status: "Rejected",
//     },
//     {
//         id: "REQ005",
//         user: "Robert Wilson",
//         amount: "$150",
//         method: "Bank Transfer",
//         date: "2024-01-11",
//         status: "Approved",
//     },
// ];

// const ManualWalletRecharge: React.FC = () => {
//     const [openMenu, setOpenMenu] = useState<string | null>(null);

//     return (
//         <div className={styles.page}>
//             {/* HEADER */}
//             <div className={styles.header}>
//                 <h2>Manual Wallet Recharge Requests</h2>
//                 <button className={styles.addBtn}>+ Add Method</button>
//             </div>

//             {/* TABLE */}
//             <div className={styles.card}>
//                 <table className={styles.table}>
//                     <thead>
//                         <tr>
//                             <th>Request ID</th>
//                             <th>User</th>
//                             <th>Amount</th>
//                             <th>Payment Method</th>
//                             <th>Submitted Date</th>
//                             <th>Proof Document</th>
//                             <th>Status</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {requests.map((r) => (
//                             <tr key={r.id}>
//                                 <td className={styles.id}>{r.id}</td>
//                                 <td>{r.user}</td>
//                                 <td className={styles.amount}>{r.amount}</td>
//                                 <td>{r.method}</td>
//                                 <td>{r.date}</td>
//                                 <td>
//                                     <button className={styles.proofBtn}>View Proof</button>
//                                 </td>
//                                 <td>
//                                     <span
//                                         className={`${styles.status} ${styles[r.status.toLowerCase()]
//                                             }`}
//                                     >
//                                         {r.status}
//                                     </span>
//                                 </td>
//                                 <td className={styles.actions}>
//                                     <button
//                                         className={styles.menuBtn}
//                                         onClick={() =>
//                                             setOpenMenu(openMenu === r.id ? null : r.id)
//                                         }
//                                     >
//                                         ⋮
//                                     </button>

//                                     {openMenu === r.id && (
//                                         <div className={styles.menu}>
//                                             {r.status === "Pending" && (
//                                                 <>
//                                                     <button className={styles.approve}>Approve</button>
//                                                     <button className={styles.reject}>Reject</button>
//                                                 </>
//                                             )}
//                                             <button className={styles.details}>Details</button>
//                                         </div>
//                                     )}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>

//             {/* BOTTOM CARDS */}
//             <div className={styles.bottomGrid}>
//                 <div className={styles.card}>
//                     <h3>Available Payment Methods</h3>
//                     <div className={styles.methods}>
//                         <div>
//                             <strong>Bank Transfer</strong>
//                             <p>Account details for manual transfers</p>
//                             <button className={styles.configBtn}>Configure</button>
//                         </div>
//                         <div>
//                             <strong>Cash Deposit</strong>
//                             <p>Physical cash deposit instructions</p>
//                             <button className={styles.configBtn}>Configure</button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className={styles.card}>
//                     <h3>Recharge Statistics</h3>
//                     <div className={styles.stats}>
//                         <div>
//                             <span className={styles.big}>$200</span>
//                             <p>Total Approved</p>
//                         </div>
//                         <div>
//                             <span className={styles.big}>2</span>
//                             <p>Pending Requests</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ManualWalletRecharge;
import React, { useState, useMemo, useCallback } from "react";
import styles from "./WalletRecharge.module.css";

type Status = "Pending" | "Approved" | "Rejected";

type Request = {
    id: string;
    user: string;
    amount: string;
    method: string;
    date: string;
    status: Status;
    notes?: string;
};

const initialRequests: Request[] = [
    {
        id: "REQ001",
        user: "John Smith",
        amount: "$100",
        method: "Bank Transfer",
        date: "2024-01-15",
        status: "Pending",
        notes: "Payment screenshot attached",
    },
    {
        id: "REQ002",
        user: "Emma Johnson",
        amount: "$50",
        method: "Cash Deposit",
        date: "2024-01-14",
        status: "Approved",
        notes: "Verified cash deposit",
    },
    {
        id: "REQ003",
        user: "Michael Brown",
        amount: "$200",
        method: "Bank Transfer",
        date: "2024-01-13",
        status: "Pending",
    },
    {
        id: "REQ004",
        user: "Sarah Davis",
        amount: "$75",
        method: "Cheque",
        date: "2024-01-12",
        status: "Rejected",
        notes: "Cheque bounced",
    },
    {
        id: "REQ005",
        user: "Robert Wilson",
        amount: "$150",
        method: "Bank Transfer",
        date: "2024-01-11",
        status: "Approved",
    },
    {
        id: "REQ006",
        user: "Olivia Taylor",
        amount: "$300",
        method: "UPI",
        date: "2024-01-10",
        status: "Pending",
    },
    {
        id: "REQ007",
        user: "James Anderson",
        amount: "$120",
        method: "PayPal",
        date: "2024-01-09",
        status: "Approved",
    },
    {
        id: "REQ008",
        user: "Sophia Martinez",
        amount: "$80",
        method: "Cash Deposit",
        date: "2024-01-08",
        status: "Rejected",
    },
    {
        id: "REQ009",
        user: "William Thomas",
        amount: "$250",
        method: "Bank Transfer",
        date: "2024-01-07",
        status: "Pending",
    },
    {
        id: "REQ010",
        user: "Isabella Garcia",
        amount: "$90",
        method: "UPI",
        date: "2024-01-06",
        status: "Approved",
    },
    {
        id: "REQ011",
        user: "Liam Rodriguez",
        amount: "$175",
        method: "Cheque",
        date: "2024-01-05",
        status: "Pending",
    },
    {
        id: "REQ012",
        user: "Mia Hernandez",
        amount: "$60",
        method: "PayPal",
        date: "2024-01-04",
        status: "Approved",
    },
    {
        id: "REQ013",
        user: "Noah Lopez",
        amount: "$400",
        method: "Bank Transfer",
        date: "2024-01-03",
        status: "Rejected",
    },
    {
        id: "REQ014",
        user: "Ava Gonzalez",
        amount: "$220",
        method: "Cash Deposit",
        date: "2024-01-02",
        status: "Pending",
    },
    {
        id: "REQ015",
        user: "Lucas Lee",
        amount: "$130",
        method: "UPI",
        date: "2024-01-01",
        status: "Approved",
    },
];

const ManualWalletRecharge: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>(initialRequests);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<Status | "All">("All");
    const [methodFilter, setMethodFilter] = useState<string>("All");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [sortBy, setSortBy] = useState<"date" | "amount" | "id">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Modals
    const [showProofModal, setShowProofModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showAddRequestModal, setShowAddRequestModal] = useState(false);
    const [showAddMethodModal, setShowAddMethodModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
    const [bulkIds, setBulkIds] = useState<string[]>([]);

    // New Request Form State
    const [newRequest, setNewRequest] = useState({
        user: "",
        amount: "",
        method: "Bank Transfer",
        notes: "",
    });

    // New Method Form State
    const [newMethod, setNewMethod] = useState({
        name: "",
        details: "",
    });

    const handleAddRequest = (e: React.FormEvent) => {
        e.preventDefault();
        const request: Request = {
            id: `REQ${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
            user: newRequest.user,
            amount: `$${newRequest.amount}`,
            method: newRequest.method,
            date: new Date().toISOString().split("T")[0],
            status: "Pending",
            notes: newRequest.notes,
        };
        setRequests([request, ...requests]);
        setShowAddRequestModal(false);
        setNewRequest({ user: "", amount: "", method: "Bank Transfer", notes: "" });
    };

    const handleAddMethod = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`New payment method "${newMethod.name}" added successfully!`);
        setShowAddMethodModal(false);
        setNewMethod({ name: "", details: "" });
    };

    const uniqueMethods = useMemo(() => {
        return Array.from(new Set(requests.map((r) => r.method)));
    }, [requests]);

    const filteredAndSortedRequests = useMemo(() => {
        let filtered = requests.filter((r) => {
            const matchesSearch =
                !searchTerm ||
                r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.user.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "All" || r.status === statusFilter;
            const matchesMethod = methodFilter === "All" || r.method === methodFilter;

            let matchesDate = true;
            if (dateFrom && r.date < dateFrom) matchesDate = false;
            if (dateTo && r.date > dateTo) matchesDate = false;

            const amountNum = parseFloat(r.amount.replace("$", ""));
            let matchesAmount = true;
            if (minAmount && amountNum < parseFloat(minAmount)) matchesAmount = false;
            if (maxAmount && amountNum > parseFloat(maxAmount)) matchesAmount = false;

            return matchesSearch && matchesStatus && matchesMethod && matchesDate && matchesAmount;
        });

        filtered.sort((a, b) => {
            let valA: any;
            let valB: any;

            if (sortBy === "date") {
                valA = new Date(a.date).getTime();
                valB = new Date(b.date).getTime();
            } else if (sortBy === "amount") {
                valA = parseFloat(a.amount.replace("$", ""));
                valB = parseFloat(b.amount.replace("$", ""));
            } else {
                valA = a.id;
                valB = b.id;
            }

            if (valA < valB) return sortOrder === "asc" ? -1 : 1;
            if (valA > valB) return sortOrder === "asc" ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [requests, searchTerm, statusFilter, methodFilter, dateFrom, dateTo, minAmount, maxAmount, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredAndSortedRequests.length / pageSize);
    const currentPageRequests = filteredAndSortedRequests.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const isAllSelected = filteredAndSortedRequests.length > 0 &&
        filteredAndSortedRequests.every((r) => selectedIds.includes(r.id));

    const toggleSelectAll = useCallback(() => {
        if (isAllSelected) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredAndSortedRequests.map((r) => r.id));
        }
    }, [isAllSelected, filteredAndSortedRequests]);

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
        );
    }, []);

    const updateStatus = useCallback((ids: string[], newStatus: Status) => {
        setRequests((prev) =>
            prev.map((r) =>
                ids.includes(r.id) ? { ...r, status: newStatus } : r
            )
        );
    }, []);

    const handleConfirmAction = () => {
        if (!confirmAction) return;
        const idsToUpdate = bulkIds.length > 0 ? bulkIds : selectedRequest ? [selectedRequest.id] : [];
        if (idsToUpdate.length === 0) return;

        updateStatus(idsToUpdate, confirmAction === "approve" ? "Approved" : "Rejected");

        setShowConfirmModal(false);
        setConfirmAction(null);
        setSelectedRequest(null);
        setBulkIds([]);
        setSelectedIds([]);
    };

    const handleApprove = (r: Request) => {
        setSelectedRequest(r);
        setConfirmAction("approve");
        setShowConfirmModal(true);
    };

    const handleReject = (r: Request) => {
        setSelectedRequest(r);
        setConfirmAction("reject");
        setShowConfirmModal(true);
    };

    const handleBulkApprove = () => {
        if (selectedIds.length === 0) return;
        setBulkIds(selectedIds);
        setConfirmAction("approve");
        setShowConfirmModal(true);
    };

    const handleBulkReject = () => {
        if (selectedIds.length === 0) return;
        setBulkIds(selectedIds);
        setConfirmAction("reject");
        setShowConfirmModal(true);
    };

    const openDetails = (r: Request) => {
        setSelectedRequest(r);
        setShowDetailsModal(true);
    };

    const openProof = (r: Request) => {
        setSelectedRequest(r);
        setShowProofModal(true);
    };

    const exportCSV = () => {
        const headers = ["Request ID", "User", "Amount", "Method", "Date", "Status"];
        const rows = filteredAndSortedRequests.map((r) => [
            r.id,
            `"${r.user}"`,
            r.amount,
            r.method,
            r.date,
            r.status,
        ]);
        const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `wallet_recharges_${new Date().toISOString().split("T")[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Statistics
    const stats = useMemo(() => {
        const approved = requests.filter((r) => r.status === "Approved");
        const pendingCount = requests.filter((r) => r.status === "Pending").length;
        const rejectedCount = requests.filter((r) => r.status === "Rejected").length;
        const totalApprovedAmount = approved.reduce((sum, r) => sum + parseFloat(r.amount.replace("$", "")), 0);
        const totalRequests = requests.length;
        const approvalRate = totalRequests > 0 ? Math.round((approved.length / totalRequests) * 100) : 0;

        return {
            totalApprovedAmount: `$${totalApprovedAmount}`,
            pendingCount,
            rejectedCount,
            totalRequests,
            approvalRate,
        };
    }, [requests]);

    const statusCounts = useMemo(() => {
        const approved = requests.filter((r) => r.status === "Approved").length;
        const pending = requests.filter((r) => r.status === "Pending").length;
        const rejected = requests.filter((r) => r.status === "Rejected").length;
        const max = Math.max(approved, pending, rejected) || 1;
        return { approved, pending, rejected, max };
    }, [requests]);

    return (
        <div className={styles.page}>
            {/* HEADER */}
            <div className={styles.header}>
                <div>
                    <h2>Manual Wallet Recharge Dashboard</h2>
                    <p className={styles.subtitle}>Advanced request management system</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.exportBtn} onClick={exportCSV}>
                        Export CSV
                    </button>
                    <button className={styles.addBtn} onClick={() => setShowAddRequestModal(true)}>+ Add New Request</button>
                    <button className={styles.addBtn} onClick={() => setShowAddMethodModal(true)}>+ Add Payment Method</button>
                </div>
            </div>

            {/* SEARCH & FILTERS */}
            <div className={styles.filters}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search by ID or User..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as Status | "All")}
                    className={styles.filterSelect}
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                </select>

                <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="All">All Methods</option>
                    {uniqueMethods.map((m) => (
                        <option key={m} value={m}>
                            {m}
                        </option>
                    ))}
                </select>

                <div className={styles.dateRange}>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className={styles.dateInput}
                    />
                    <span>to</span>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className={styles.dateInput}
                    />
                </div>

                <div className={styles.amountRange}>
                    <input
                        type="number"
                        placeholder="Min $"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className={styles.amountInput}
                    />
                    <span>-</span>
                    <input
                        type="number"
                        placeholder="Max $"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className={styles.amountInput}
                    />
                </div>

                <div className={styles.sortContainer}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as "date" | "amount" | "id")}
                        className={styles.filterSelect}
                    >
                        <option value="date">Sort by Date</option>
                        <option value="amount">Sort by Amount</option>
                        <option value="id">Sort by ID</option>
                    </select>
                    <button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className={styles.sortToggle}
                    >
                        {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                    </button>
                </div>

                <button
                    onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("All");
                        setMethodFilter("All");
                        setDateFrom("");
                        setDateTo("");
                        setMinAmount("");
                        setMaxAmount("");
                        setSelectedIds([]);
                    }}
                    className={styles.clearBtn}
                >
                    Clear Filters
                </button>
            </div>

            {/* BULK ACTIONS */}
            {selectedIds.length > 0 && (
                <div className={styles.bulkActions}>
                    <span>{selectedIds.length} selected</span>
                    <button onClick={handleBulkApprove} className={styles.bulkApprove}>
                        Approve Selected
                    </button>
                    <button onClick={handleBulkReject} className={styles.bulkReject}>
                        Reject Selected
                    </button>
                </div>
            )}

            {/* TABLE */}
            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th onClick={() => setSortBy("id")}>Request ID</th>
                            <th>User</th>
                            <th onClick={() => setSortBy("amount")}>Amount</th>
                            <th>Payment Method</th>
                            <th onClick={() => setSortBy("date")}>Submitted Date</th>
                            <th>Proof Document</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPageRequests.map((r) => (
                            <tr key={r.id} className={selectedIds.includes(r.id) ? styles.selectedRow : ""}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(r.id)}
                                        onChange={() => toggleSelect(r.id)}
                                    />
                                </td>
                                <td className={styles.id}>{r.id}</td>
                                <td>{r.user}</td>
                                <td className={styles.amount}>{r.amount}</td>
                                <td>{r.method}</td>
                                <td>{r.date}</td>
                                <td>
                                    <button
                                        className={styles.proofBtn}
                                        onClick={() => openProof(r)}
                                    >
                                        View Proof
                                    </button>
                                </td>
                                <td>
                                    <span className={`${styles.status} ${styles[r.status.toLowerCase()]}`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className={styles.actions}>
                                    <button
                                        className={styles.menuBtn}
                                        onClick={() => setOpenMenuId(openMenuId === r.id ? null : r.id)}
                                    >
                                        ⋮
                                    </button>
                                    {openMenuId === r.id && (
                                        <div className={styles.menu}>
                                            {r.status === "Pending" && (
                                                <>
                                                    <button
                                                        className={styles.approve}
                                                        onClick={() => handleApprove(r)}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        className={styles.reject}
                                                        onClick={() => handleReject(r)}
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                className={styles.details}
                                                onClick={() => openDetails(r)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* PAGINATION */}
                <div className={styles.pagination}>
                    <div>
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, filteredAndSortedRequests.length)} of{" "}
                        {filteredAndSortedRequests.length} requests
                    </div>
                    <div className={styles.paginationControls}>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className={styles.pageSizeSelect}
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            ← Prev
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>

            {/* BOTTOM STATS & CHARTS */}
            <div className={styles.bottomGrid}>
                {/* Payment Methods */}
                <div className={styles.card}>
                    <h3>Available Payment Methods</h3>
                    <div className={styles.methods}>
                        <div className={styles.methodItem}>
                            <strong>Bank Transfer</strong>
                            <p>Account: XXXXXXXX • IFSC: ABCD01234</p>
                            <button className={styles.configBtn}>Configure</button>
                        </div>
                        <div className={styles.methodItem}>
                            <strong>Cash Deposit</strong>
                            <p>Branch: Main • Timing: 9AM-5PM</p>
                            <button className={styles.configBtn}>Configure</button>
                        </div>
                        <div className={styles.methodItem}>
                            <strong>UPI</strong>
                            <p>QR Code Enabled • UPI ID: recharge@bank</p>
                            <button className={styles.configBtn}>Configure</button>
                        </div>
                        <div className={styles.methodItem}>
                            <strong>PayPal</strong>
                            <p>PayPal Business Account Linked</p>
                            <button className={styles.configBtn}>Configure</button>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className={styles.card}>
                    <h3>Recharge Statistics</h3>
                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.big}>{stats.totalApprovedAmount}</span>
                            <p>Total Approved</p>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.big}>{stats.pendingCount}</span>
                            <p>Pending</p>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.big}>{stats.rejectedCount}</span>
                            <p>Rejected</p>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.big}>{stats.approvalRate}%</span>
                            <p>Approval Rate</p>
                            <div className={styles.progressBar}>
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${stats.approvalRate}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Status Distribution */}
                    <div className={styles.distribution}>
                        <h4>Status Distribution</h4>
                        <div className={styles.barContainer}>
                            <div className={styles.barLabel}>Approved</div>
                            <div className={styles.bar}>
                                <div
                                    className={`${styles.barFill} ${styles.approvedBar}`}
                                    style={{ width: `${(statusCounts.approved / statusCounts.max) * 100}%` }}
                                ></div>
                                <span>{statusCounts.approved}</span>
                            </div>
                        </div>
                        <div className={styles.barContainer}>
                            <div className={styles.barLabel}>Pending</div>
                            <div className={styles.bar}>
                                <div
                                    className={`${styles.barFill} ${styles.pendingBar}`}
                                    style={{ width: `${(statusCounts.pending / statusCounts.max) * 100}%` }}
                                ></div>
                                <span>{statusCounts.pending}</span>
                            </div>
                        </div>
                        <div className={styles.barContainer}>
                            <div className={styles.barLabel}>Rejected</div>
                            <div className={styles.bar}>
                                <div
                                    className={`${styles.barFill} ${styles.rejectedBar}`}
                                    style={{ width: `${(statusCounts.rejected / statusCounts.max) * 100}%` }}
                                ></div>
                                <span>{statusCounts.rejected}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PROOF MODAL */}
            {showProofModal && selectedRequest && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Proof Document - {selectedRequest.id}</h3>
                        <div className={styles.proofPreview}>
                            <img
                                src="https://via.placeholder.com/600x400/1e2937/64748b?text=Transaction+Proof+Screenshot"
                                alt="Proof"
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowProofModal(false)}>Close</button>
                            <button>Download Proof</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAILS MODAL */}
            {showDetailsModal && selectedRequest && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Request Details - {selectedRequest.id}</h3>
                        <div className={styles.detailsContent}>
                            <p><strong>User:</strong> {selectedRequest.user}</p>
                            <p><strong>Amount:</strong> {selectedRequest.amount}</p>
                            <p><strong>Method:</strong> {selectedRequest.method}</p>
                            <p><strong>Date:</strong> {selectedRequest.date}</p>
                            <p><strong>Status:</strong> {selectedRequest.status}</p>
                            {selectedRequest.notes && (
                                <p><strong>Notes:</strong> {selectedRequest.notes}</p>
                            )}
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowDetailsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM MODAL */}
            {showConfirmModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3>Confirm Action</h3>
                        <p>
                            {bulkIds.length > 0
                                ? `Are you sure you want to ${confirmAction} ${bulkIds.length} selected requests?`
                                : `Are you sure you want to ${confirmAction} the request for ${selectedRequest?.user}?`}
                        </p>
                        <div className={styles.modalActions}>
                            <button onClick={() => setShowConfirmModal(false)}>Cancel</button>
                            <button
                                className={confirmAction === "approve" ? styles.approve : styles.reject}
                                onClick={handleConfirmAction}
                            >
                                {confirmAction === "approve" ? "Approve" : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD NEW REQUEST MODAL */}
            {showAddRequestModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>Add New Recharge Request</h3>
                        <form onSubmit={handleAddRequest}>
                            <div className={styles.formGroup}>
                                <label>User Name / ID</label>
                                <input
                                    type="text"
                                    required
                                    className={styles.formInput}
                                    value={newRequest.user}
                                    onChange={(e) => setNewRequest({ ...newRequest, user: e.target.value })}
                                    placeholder="Enter user name or ID"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Amount ($)</label>
                                <input
                                    type="number"
                                    required
                                    className={styles.formInput}
                                    value={newRequest.amount}
                                    onChange={(e) => setNewRequest({ ...newRequest, amount: e.target.value })}
                                    placeholder="e.g. 100"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Payment Method</label>
                                <select
                                    className={styles.formSelect}
                                    value={newRequest.method}
                                    onChange={(e) => setNewRequest({ ...newRequest, method: e.target.value })}
                                >
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="UPI">UPI</option>
                                    <option value="PayPal">PayPal</option>
                                    <option value="Cash Deposit">Cash Deposit</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Notes</label>
                                <textarea
                                    className={styles.formTextarea}
                                    value={newRequest.notes}
                                    onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                                    placeholder="Any additional details..."
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowAddRequestModal(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Create Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ADD PAYMENT METHOD MODAL */}
            {showAddMethodModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>Add Payment Method</h3>
                        <form onSubmit={handleAddMethod}>
                            <div className={styles.formGroup}>
                                <label>Method Name</label>
                                <input
                                    type="text"
                                    required
                                    className={styles.formInput}
                                    value={newMethod.name}
                                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                                    placeholder="e.g. Google Pay, Crypto"
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Payment Details / Instructions</label>
                                <textarea
                                    required
                                    className={styles.formTextarea}
                                    value={newMethod.details}
                                    onChange={(e) => setNewMethod({ ...newMethod, details: e.target.value })}
                                    placeholder="Enter bank details, UPI ID, or instructions..."
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" onClick={() => setShowAddMethodModal(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Add Method</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManualWalletRecharge;
