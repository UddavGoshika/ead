import React, { useState, useMemo, useEffect } from "react";
import styles from "./LegalDocAdmin.module.css";
import {
    Search,
    Plus,
    Filter,
    Scale,
    ShieldAlert,
    Eye,
    Trash2,
    ChevronDown,
    ChevronUp,
    X,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { MdSyncAlt } from "react-icons/md";
import axios from "axios";

interface NoticeRequest {
    _id?: string;
    requestId: string;
    title: string;
    category: string;
    price: string;
    grossFee: number;
    earned: number;
    status: string;
    requestedBy: string;
    clientPhone: string;
    requestedDate: string;
    executionDate?: string;
    fulfillmentSpecialist: string;
    specialistLicense: string;
    stepsCompleted: number;
    totalSteps: number;
    clientNotes?: string;
    // Specifics for notices can be mapped or added to model if critical
    // For now mapping general LegalRequest fields
}

const NoticesList = () => {
    const [requests, setRequests] = useState<NoticeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState("All");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [modalFilter, setModalFilter] = useState<"all" | "served" | "pending" | "reported" | null>(null);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/admin/legal-requests", {
                params: { type: "Notice" }
            });
            if (res.data.success) {
                setRequests(res.data.requests);
            }
        } catch (err: any) {
            console.error("Error fetching notices:", err);
            setError(err.message || "Failed to fetch notices");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filtered = useMemo(() => {
        return requests.filter((n) => {
            const matchesSearch =
                n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                n.fulfillmentSpecialist.toLowerCase().includes(searchTerm.toLowerCase());
            // const matchesSeverity = selectedSeverity === "All" || n.severity === selectedSeverity; // Removed severity mock
            return matchesSearch;
        });
    }, [searchTerm, selectedSeverity, requests]);

    const summary = useMemo(() => {
        const total = requests.length;
        const served = requests.filter((n) => ["Executed", "Delivered"].includes(n.status)).length;
        const pending = requests.filter((n) => ["Pending", "In Progress"].includes(n.status)).length;
        const reported = requests.filter((n) => n.status === "Reported").length;
        return { total, served, pending, reported };
    }, [requests]);

    const modalData = useMemo(() => {
        if (!modalFilter) return [];
        switch (modalFilter) {
            case "served":
                return requests.filter((n) => ["Executed", "Delivered"].includes(n.status));
            case "pending":
                return requests.filter((n) => ["Pending", "In Progress"].includes(n.status));
            case "reported":
                return requests.filter((n) => n.status === "Reported");
            default:
                return requests;
        }
    }, [modalFilter, requests]);

    const modalTitle = modalFilter
        ? `${modalFilter.charAt(0).toUpperCase() + modalFilter.slice(1)} Notices`
        : "All Legal Notices";

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    if (loading) {
        return (
            <div className={styles.adminPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '12px', color: '#94a3b8' }}>Loading Notices...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.adminPage}>
                <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px', color: '#ef4444', textAlign: 'center' }}>
                    <p>Error: {error}</p>
                    <button onClick={fetchRequests} className={styles.primaryBtn} style={{ marginTop: '12px' }}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminPage}>
            {/* Header */}
            <div className={styles.headerArea}>
                <div>
                    <h2 className={styles.title}>Legal Notice Serving Tracker</h2>
                    <p className={styles.pSub}>
                        All over India – <strong>{summary.total}</strong> notices requested •
                        Success Rate: <strong>96.8%</strong> • As of February 01, 2026
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.primaryBtn}>
                        <Plus size={18} /> Configure New Notice
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                    margin: "24px 0",
                }}
            >
                <div className={styles.summaryCard} onClick={() => setModalFilter("all")}>
                    <Scale size={32} color="#3b82f6" />
                    <div>
                        <h4>Total Notices</h4>
                        <p className={styles.summaryNumber}>{summary.total}</p>
                    </div>
                </div>

                <div className={styles.summaryCard} onClick={() => setModalFilter("served")}>
                    <CheckCircle size={32} color="#10b981" />
                    <div>
                        <h4>Issued / Served</h4>
                        <p className={styles.summaryNumber} style={{ color: "#10b981" }}>
                            {summary.served}
                        </p>
                    </div>
                </div>

                <div className={styles.summaryCard} onClick={() => setModalFilter("pending")}>
                    <Clock size={32} color="#f59e0b" />
                    <div>
                        <h4>Pending</h4>
                        <p className={styles.summaryNumber} style={{ color: "#f59e0b" }}>
                            {summary.pending}
                        </p>
                    </div>
                </div>

                <div className={styles.summaryCard} onClick={() => setModalFilter("reported")}>
                    <AlertCircle size={32} color="#ef4444" />
                    <div>
                        <h4>Reported / Flagged</h4>
                        <p className={styles.summaryNumber} style={{ color: "#ef4444" }}>
                            {summary.reported}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.filterCard}>
                <div className={styles.searchRow}>
                    <div className={styles.searchBar}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by Case ID, Recipient, or Advocate..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.pillsGrid}>
                    <div className={styles.pillGroup}>
                        <label>
                            <ShieldAlert size={14} /> Severity
                        </label>
                        <div className={styles.pillList}>
                            {["All", "High", "Medium", "Standard"].map((s) => (
                                <button
                                    key={s}
                                    className={`${styles.pill} ${selectedSeverity === s ? styles.activePill : ""}`}
                                    onClick={() => setSelectedSeverity(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table – original columns preserved */}
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <h3>Serving Registry: Enforcements (India Level)</h3>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Case / Notice ID</th>
                                <th>Client (Used By)</th>
                                <th>Served By (Advocate)</th>
                                <th>Spec / License</th>
                                <th>Status / Step (Numeric)</th>
                                <th>Gross Fee</th>
                                <th>Total Earned</th>
                                <th>Reported Details</th>
                                <th>Reg. Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((doc, index) => {
                                const isExpanded = expandedId === doc.requestId;
                                const gross = doc.grossFee;
                                const earned = doc.earned;

                                return (
                                    <React.Fragment key={doc.requestId}>
                                        <tr
                                            onClick={() => toggleExpand(doc.requestId)}
                                            style={{
                                                cursor: "pointer",
                                                background: isExpanded ? "#1e293b" : "transparent",
                                            }}
                                        >
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className={styles.profileCell}>
                                                    <div className={`${styles.avatar} ${styles.noticeIcon}`}>
                                                        <Scale size={20} />
                                                    </div>
                                                    <div>
                                                        <div className={styles.pName}>{doc.title}</div>
                                                        <div className={styles.pSub}>ID: {doc.requestId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <div className={styles.pName}>{doc.requestedBy}</div>
                                                    <div className={styles.pSub}>{doc.clientPhone}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <div className={styles.pName}>{doc.fulfillmentSpecialist}</div>
                                                    <div className={styles.pSub}>{doc.specialistLicense}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <div className={styles.pName}>{doc.category}</div>
                                                    <div className={styles.pSub}>LIC: {doc.specialistLicense.split('|')[1]?.trim() || 'N/A'}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <span
                                                        className={`${styles.statusBadge} ${styles[doc.status.toLowerCase()]}`}
                                                    >
                                                        {doc.status}
                                                    </span>
                                                    <div className={styles.pSub} style={{ marginTop: "4px" }}>
                                                        {doc.stepsCompleted}/{doc.totalSteps} Steps
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.rateHighlight}>₹{gross.toLocaleString()}</span>
                                            </td>
                                            <td>
                                                <span className={styles.rateHighlight} style={{ color: "#10b981" }}>
                                                    ₹{earned.toLocaleString()}
                                                </span>
                                            </td>
                                            <td>
                                                {doc.status === 'Reported' ? (
                                                    <div className={styles.credCell}>
                                                        <span className={`${styles.severityTag} ${styles.high}`}>
                                                            Flagged
                                                        </span>
                                                        <div className={styles.pSub} style={{ color: "#ef4444" }}>
                                                            Check Reports
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className={styles.pSub}>On Track</span>
                                                )}
                                            </td>
                                            <td>{doc.requestedDate}</td>
                                            <td>
                                                <div className={styles.rowActions}>
                                                    <button className={styles.actionIcon} title="View Case">
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        className={styles.actionIcon}
                                                        style={{
                                                            color: "#3b82f6",
                                                            border: "1px solid rgba(59, 130, 246, 0.2)",
                                                            padding: "4px 10px",
                                                        }}
                                                    >
                                                        Manage
                                                    </button>
                                                    <button
                                                        className={styles.actionIcon}
                                                        title="Delete Record"
                                                        style={{ color: "#ef4444" }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>

                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={11}>
                                                    <div
                                                        style={{
                                                            padding: "12px 32px",
                                                            background: "#0f172a",
                                                            borderRadius: "8px",
                                                            margin: "8px 0",
                                                        }}
                                                    >
                                                        <strong>Client Notes:</strong> {doc.clientNotes || "—"}<br />
                                                        <strong>Delivery Method:</strong> Speed Post (Default)<br />
                                                        <strong>Expected Completion:</strong> {doc.executionDate || "TBD"}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {modalFilter && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.75)",
                        zIndex: 2000,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                    }}
                >
                    <div
                        style={{
                            background: "#0f172a",
                            borderRadius: "12px",
                            width: "96%",
                            maxWidth: "1600px",
                            height: "92vh",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <div
                            style={{
                                padding: "16px 24px",
                                borderBottom: "1px solid #334155",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <h2 style={{ margin: 0 }}>{modalTitle}</h2>
                            <button onClick={() => setModalFilter(null)}>
                                <X size={28} color="#94a3b8" />
                            </button>
                        </div>

                        <div style={{ overflow: "auto", flex: 1, padding: "16px 24px" }}>
                            <table className={styles.adminTable}>
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Notice / Case</th>
                                        <th>Client</th>
                                        <th>Advocate</th>
                                        <th>Status</th>
                                        <th>Fee</th>
                                        <th>Earned</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalData.map((doc, idx) => (
                                        <tr key={doc.requestId}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                <div className={styles.pName}>{doc.title}</div>
                                                <div className={styles.pSub}>{doc.requestId}</div>
                                            </td>
                                            <td>
                                                <div className={styles.pName}>{doc.requestedBy}</div>
                                                <div className={styles.pSub}>{doc.clientPhone}</div>
                                            </td>
                                            <td>
                                                <div className={styles.pName}>{doc.fulfillmentSpecialist}</div>
                                                <div className={styles.pSub}>{doc.specialistLicense}</div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    color: ["Executed", "Delivered", "Served"].includes(doc.status) ? "#10b981" :
                                                        ["Pending", "In Progress"].includes(doc.status) ? "#f59e0b" : "#ef4444"
                                                }}>
                                                    {doc.status}
                                                </span>
                                            </td>
                                            <td>₹{doc.grossFee.toLocaleString()}</td>
                                            <td>₹{doc.earned.toLocaleString()}</td>
                                            <td>{doc.requestedDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoticesList;