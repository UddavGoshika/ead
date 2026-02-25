




import React, { useState, useMemo, useEffect } from "react";
import styles from "./LegalDocAdmin.module.css";
import {
    Search,
    Plus,
    Filter,
    ClipboardCheck,
    FileText,
    Eye,
    Trash2,
    ChevronDown,
    ChevronUp,
    User,
    X,
    MoreVertical,
    CheckCircle,
    AlertCircle,
    Clock as ClockIcon,
    Loader2,
    CreditCard,
    Settings,
    Calendar,
    DollarSign,
    Briefcase
} from "lucide-react";
import { MdSyncAlt } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

interface AffidavitRequest {
    _id?: string;
    requestId: string;
    affidavitId: string;
    title: string;
    type: string;
    price: string;
    timeline: string;
    status: "Pending" | "In Progress" | "Executed" | "Delivered" | "Reported" | "Rejected" | "Drafting" | "Notarizing";
    requiredStamp: string;
    stampValue?: string;
    requestedBy: string;
    clientPhone: string;
    requestedDate: string;
    executionDate?: string;
    fulfillmentSpecialist: string;
    specialistLicense: string;
    stepsCompleted: number;
    totalSteps: number;
    grossFee: number;
    earned: number;
    reportedLogs?: string;
    clientNotes?: string;
}

const mockRequests: AffidavitRequest[] = [
    {
        requestId: "AFF-REQ-1001",
        affidavitId: "1",
        title: "Name Change Affidavit",
        type: "Identity",
        price: "₹800",
        timeline: "12 Hours",
        status: "Delivered",
        requiredStamp: "₹20",
        requestedBy: "Rahul Mehra",
        clientPhone: "+91 98210 56789",
        requestedDate: "2026-01-15",
        executionDate: "2026-01-16",
        fulfillmentSpecialist: "Sneha Sharma",
        specialistLicense: "ADV-99201 | MH",
        stepsCompleted: 5,
        totalSteps: 5,
        grossFee: 800,
        earned: 520,
        reportedLogs: "",
        clientNotes: "Urgent - passport renewal",
    },
    {
        requestId: "AFF-REQ-1002",
        affidavitId: "2",
        title: "Address Proof Affidavit",
        type: "Residence",
        price: "₹600",
        timeline: "6 Hours",
        status: "Pending",
        requiredStamp: "₹10",
        requestedBy: "Priya Malhotra",
        clientPhone: "+91 98765 43210",
        requestedDate: "2026-01-28",
        fulfillmentSpecialist: "Sneha Sharma",
        specialistLicense: "ADV-99201 | MH",
        stepsCompleted: 1,
        totalSteps: 5,
        grossFee: 600,
        earned: 0,
        reportedLogs: "",
        clientNotes: "For new bank account",
    },
    {
        requestId: "AFF-REQ-1003",
        affidavitId: "1",
        title: "Name Change Affidavit",
        type: "Identity",
        price: "₹800",
        timeline: "12 Hours",
        status: "Reported",
        requiredStamp: "₹20",
        requestedBy: "Vikram Singh",
        clientPhone: "+91 81234 56789",
        requestedDate: "2026-01-10",
        executionDate: "2026-01-12",
        fulfillmentSpecialist: "Sneha Sharma",
        specialistLicense: "ADV-99201 | MH",
        stepsCompleted: 4,
        totalSteps: 5,
        grossFee: 800,
        earned: 520,
        reportedLogs: "Client reported signature mismatch",
        clientNotes: "Post-marriage name change",
    },
    {
        requestId: "AFF-REQ-1004",
        affidavitId: "3",
        title: "Anti-Ragging Affidavit",
        type: "Education",
        price: "₹400",
        timeline: "2 Hours",
        status: "Executed",
        requiredStamp: "₹10",
        requestedBy: "Ananya Roy",
        clientPhone: "+91 93321 09876",
        requestedDate: "2026-01-30",
        executionDate: "2026-01-31",
        fulfillmentSpecialist: "Sneha Sharma",
        specialistLicense: "ADV-99201 | MH",
        stepsCompleted: 4,
        totalSteps: 5,
        grossFee: 400,
        earned: 260,
        reportedLogs: "",
        clientNotes: "For college admission",
    },
    {
        requestId: "AFF-REQ-1005",
        affidavitId: "4",
        title: "Self-Declaration of Income",
        type: "Financial",
        price: "₹500",
        timeline: "24 Hours",
        status: "In Progress",
        requiredStamp: "₹20",
        requestedBy: "Manish Pandey",
        clientPhone: "+91 94432 11223",
        requestedDate: "2026-02-02",
        fulfillmentSpecialist: "Adv. Rajesh Kumar",
        specialistLicense: "ADV-10023 | Delhi",
        stepsCompleted: 2,
        totalSteps: 4,
        grossFee: 500,
        earned: 0,
        reportedLogs: "",
        clientNotes: "For scholarship application",
    },
    {
        requestId: "AFF-REQ-1006",
        affidavitId: "5",
        title: "Heirship Affidavit",
        type: "Property",
        price: "₹1,200",
        timeline: "48 Hours",
        status: "Pending",
        requiredStamp: "₹100",
        requestedBy: "Geeta Devi",
        clientPhone: "+91 88877 66554",
        requestedDate: "2026-02-03",
        fulfillmentSpecialist: "Sneha Sharma",
        specialistLicense: "ADV-99201 | MH",
        stepsCompleted: 1,
        totalSteps: 8,
        grossFee: 1200,
        earned: 0,
        reportedLogs: "",
        clientNotes: "Property transfer after demise",
    }
];

const AffidavitsList = () => {
    const [requests, setRequests] = useState<AffidavitRequest[]>(mockRequests);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("All");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [modalFilter, setModalFilter] = useState<"all" | "pending" | "completed" | "reported" | null>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<AffidavitRequest | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [newAffidavit, setNewAffidavit] = useState({
        title: "",
        type: "General",
        price: "",
        stampValue: "₹100",
        fulfillmentTimeline: "24 Hours"
    });

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/admin/legal-requests", {
                params: { type: "Affidavit" }
            });
            if (res.data.success) {
                setRequests([...mockRequests, ...(res.data.requests || [])]);
            }
        } catch (err: any) {
            console.error("Error fetching affidavits:", err);
            setError(err.message || "Failed to fetch affidavits");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const toggleMenu = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleAction = (type: 'view' | 'manage' | 'delete' | 'payment', req: AffidavitRequest) => {
        setOpenMenuId(null);
        setSelectedRequest(req);
        if (type === 'view') setIsViewModalOpen(true);
        if (type === 'manage') setIsManageModalOpen(true);
        if (type === 'payment') setIsPaymentModalOpen(true);
        if (type === 'delete') {
            if (window.confirm("Are you sure you want to delete this record?")) {
                toast.success("Record deleted successfully (Mock)");
                setRequests(requests.filter(r => r.requestId !== req.requestId));
            }
        }
    };

    const filteredMain = useMemo(() => {
        return requests.filter((r) => {
            const matchesSearch =
                r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.requestId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = selectedType === "All" || r.type === selectedType;
            return matchesSearch && matchesType;
        });
    }, [searchTerm, selectedType, requests]);

    const summary = useMemo(() => {
        const total = requests.length;
        const pending = requests.filter((r) =>
            ["Pending", "In Progress"].includes(r.status),
        ).length;
        const completed = requests.filter((r) =>
            ["Executed", "Delivered"].includes(r.status),
        ).length;
        const reported = requests.filter(
            (r) => r.status === "Reported" || !!r.reportedLogs,
        ).length;
        return { total, pending, completed, reported };
    }, [requests]);

    const modalData = useMemo(() => {
        if (!modalFilter) return [];
        switch (modalFilter) {
            case "pending":
                return requests.filter((r) =>
                    ["Pending", "In Progress"].includes(r.status),
                );
            case "completed":
                return requests.filter((r) =>
                    ["Executed", "Delivered"].includes(r.status),
                );
            case "reported":
                return requests.filter(
                    (r) => r.status === "Reported" || !!r.reportedLogs,
                );
            default:
                return requests;
        }
    }, [modalFilter, requests]);

    const modalTitle = modalFilter
        ? `${modalFilter.charAt(0).toUpperCase() + modalFilter.slice(1)} Affidavits`
        : "All Affidavit Requests";

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    if (loading) {
        return (
            <div className={styles.adminPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '12px', color: '#94a3b8' }}>Loading Affidavits...</p>
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
                    <h2 className={styles.title}>Affidavit Execution Management</h2>
                    <p className={styles.pSub}>
                        All over India – as of <strong>February 01, 2026</strong>
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.primaryBtn} onClick={() => setIsConfigModalOpen(true)}>
                        <Plus size={18} /> New Affidavit Request
                    </button>
                </div>
            </div>

            {/* Summary Cards – Clickable */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                    margin: "24px 0",
                }}
            >
                <div
                    className={styles.summaryCard}
                    onClick={() => setModalFilter("all")}
                >
                    <ClipboardCheck size={32} color="#3b82f6" />
                    <div>
                        <h4>Total Requested</h4>
                        <p className={styles.summaryNumber}>{summary.total}</p>
                    </div>
                </div>

                <div
                    className={styles.summaryCard}
                    onClick={() => setModalFilter("completed")}
                >
                    <CheckCircle size={32} color="#10b981" />
                    <div>
                        <h4>Completed</h4>
                        <p className={styles.summaryNumber} style={{ color: "#10b981" }}>
                            {summary.completed}
                        </p>
                    </div>
                </div>

                <div
                    className={styles.summaryCard}
                    onClick={() => setModalFilter("pending")}
                >
                    <ClockIcon size={32} color="#f59e0b" />
                    <div>
                        <h4>Pending</h4>
                        <p className={styles.summaryNumber} style={{ color: "#f59e0b" }}>
                            {summary.pending}
                        </p>
                    </div>
                </div>

                <div
                    className={styles.summaryCard}
                    onClick={() => setModalFilter("reported")}
                >
                    <AlertCircle size={32} color="#ef4444" />
                    <div>
                        <h4>Reported / Issue</h4>
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
                            placeholder="Find by Case ID, Client, or Specialist..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.pillsGrid} style={{ gridTemplateColumns: "1fr" }}>
                    <div className={styles.pillGroup}>
                        <label>
                            <Filter size={14} /> Affidavit Fulfillment Group
                        </label>
                        <div className={styles.pillList}>
                            {["All", "Identity", "Residence", "Education", "Reported"].map(
                                (s) => (
                                    <button
                                        key={s}
                                        className={`${styles.pill} ${selectedType === s ? styles.activePill : ""
                                            } `}
                                        onClick={() => setSelectedType(s)}
                                    >
                                        {s}
                                    </button>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Detailed Table – your original columns preserved */}
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <h3>Fulfillment Tracker: Affidavits (Pan India)</h3>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Affidavit / Case ID</th>
                                <th>Requestor (Client)</th>
                                <th>Fulfillment (Specialist)</th>
                                <th>License / Status</th>
                                <th>Steps (Numeric)</th>
                                <th>Gross Fee</th>
                                <th>Total Earned</th>
                                <th>Reported Logs</th>
                                <th>Reg. Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMain.map((req, index) => {
                                const isExpanded = expandedId === req.requestId;
                                const gross = req.grossFee;
                                const isReported = !!req.reportedLogs;

                                return (
                                    <React.Fragment key={req.requestId}>
                                        <tr
                                            onClick={() => toggleExpand(req.requestId)}
                                            style={{
                                                cursor: "pointer",
                                                background: isExpanded ? "#1e293b" : "transparent",
                                            }}
                                        >
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className={styles.profileCell}>
                                                    <div
                                                        className={`${styles.avatar} ${styles.affIcon} `}
                                                    >
                                                        <ClipboardCheck size={20} />
                                                    </div>
                                                    <div>
                                                        <div className={styles.pName}>{req.title}</div>
                                                        <div className={styles.pSub}>
                                                            ID: {req.requestId} • {req.type}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <div className={styles.pName}>{req.requestedBy}</div>
                                                    <div className={styles.pSub}>{req.clientPhone}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <div className={styles.pName}>
                                                        {req.fulfillmentSpecialist}
                                                    </div>
                                                    <div className={styles.pSub}>
                                                        {req.specialistLicense}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <div className={styles.pSub}>
                                                        LIC: {req.specialistLicense.split("|")[1]?.trim() || "N/A"}
                                                    </div>
                                                    <span
                                                        className={`${styles.statusBadge} ${styles[req.status
                                                            .toLowerCase()
                                                            .replace(/\s+/g, "")]
                                                            } `}
                                                        style={{ marginTop: "4px" }}
                                                    >
                                                        {req.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <div
                                                        className={styles.pName}
                                                        style={{ color: "#3b82f6" }}
                                                    >
                                                        {req.stepsCompleted}/{req.totalSteps}
                                                    </div>
                                                    <div className={styles.pSub}>
                                                        {req.executionDate ? "Delivered" : "In Progress"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.rateHighlight}>
                                                    ₹{gross.toLocaleString()}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={styles.rateHighlight}
                                                    style={{ color: "#10b981" }}
                                                >
                                                    ₹{req.earned.toLocaleString()}
                                                </span>
                                            </td>
                                            <td>
                                                {isReported ? (
                                                    <div className={styles.credCell}>
                                                        <span
                                                            className={`${styles.severityTag} ${styles.medium} `}
                                                        >
                                                            Issue Reported
                                                        </span>
                                                        <div
                                                            className={styles.pSub}
                                                            style={{ color: "#f59e0b" }}
                                                        >
                                                            {req.reportedLogs?.substring(0, 25)}...
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className={styles.pSub}>No issues</span>
                                                )}
                                            </td>
                                            <td>{req.requestedDate}</td>
                                            <td>
                                                <div className={styles.rowActions}>
                                                    <button
                                                        className={styles.actionIcon}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleMenu(req.requestId);
                                                        }}
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>

                                                    {openMenuId === req.requestId && (
                                                        <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                                                            <div className={styles.menuDivider}>Actions</div>
                                                            <button onClick={() => handleAction('view', req)}>
                                                                <Eye size={14} /> View Case
                                                            </button>
                                                            <button onClick={() => handleAction('manage', req)}>
                                                                <Settings size={14} /> Manage
                                                            </button>
                                                            <button onClick={() => handleAction('payment', req)}>
                                                                <CreditCard size={14} /> Payment
                                                            </button>
                                                            <div className={styles.menuDivider}>Danger</div>
                                                            <button
                                                                onClick={() => handleAction('delete', req)}
                                                                style={{ color: '#ef4444' }}
                                                            >
                                                                <Trash2 size={14} /> Delete Record
                                                            </button>
                                                        </div>
                                                    )}
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
                                                        <strong>Client Notes:</strong>{" "}
                                                        {req.clientNotes || "—"}
                                                        <br />
                                                        <strong>Timeline Target:</strong> {req.timeline}
                                                        <br />
                                                        <strong>Stamp Paper Value:</strong>{" "}
                                                        {req.requiredStamp}
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

            {/* Modal – Full table view for selected category */}
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
                            maxHeight: "92vh",
                            overflow: "hidden",
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
                                background: "#0f172a",
                            }}
                        >
                            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>{modalTitle}</h2>
                            <button
                                onClick={() => setModalFilter(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#94a3b8",
                                    cursor: "pointer",
                                }}
                            >
                                <X size={28} />
                            </button>
                        </div>

                        <div style={{ overflow: "auto", flex: 1, padding: "16px 24px" }}>
                            <table className={styles.adminTable} style={{ width: "100%" }}>
                                <thead>
                                    <tr>
                                        <th>S.No</th>
                                        <th>Affidavit / Case ID</th>
                                        <th>Requestor (Client)</th>
                                        <th>Fulfillment (Specialist)</th>
                                        <th>Status</th>
                                        <th>Steps</th>
                                        <th>Gross Fee</th>
                                        <th>Earned</th>
                                        <th>Reported</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modalData.map((req, idx) => (
                                        <tr key={req.requestId}>
                                            <td>{idx + 1}</td>
                                            <td>
                                                <div className={styles.pName}>{req.title}</div>
                                                <div className={styles.pSub}>{req.requestId}</div>
                                            </td>
                                            <td>
                                                <div className={styles.pName}>{req.requestedBy}</div>
                                                <div className={styles.pSub}>{req.clientPhone}</div>
                                            </td>
                                            <td>
                                                <div className={styles.pName}>
                                                    {req.fulfillmentSpecialist}
                                                </div>
                                                <div className={styles.pSub}>
                                                    {req.specialistLicense}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    style={{
                                                        color:
                                                            req.status === "Delivered" ||
                                                                req.status === "Executed"
                                                                ? "#10b981"
                                                                : req.status === "Pending"
                                                                    ? "#f59e0b"
                                                                    : "#ef4444",
                                                    }}
                                                >
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td>
                                                {req.stepsCompleted}/{req.totalSteps}
                                            </td>
                                            <td>₹{req.grossFee.toLocaleString()}</td>
                                            <td>₹{req.earned.toLocaleString()}</td>
                                            <td>
                                                {req.reportedLogs ? (
                                                    <span style={{ color: "#ef4444" }}>
                                                        Yes – {req.reportedLogs.substring(0, 30)}...
                                                    </span>
                                                ) : (
                                                    "No"
                                                )}
                                            </td>
                                            <td>{req.requestedDate}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {modalData.length === 0 && (
                                <div
                                    style={{
                                        textAlign: "center",
                                        padding: "60px 0",
                                        color: "#94a3b8",
                                    }}
                                >
                                    No requests found in this category.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Configuration Modal */}
            {isConfigModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h3>Configure New Affidavit Type</h3>
                            <button onClick={() => setIsConfigModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody} style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Affidavit Title</label>
                                    <input
                                        type="text"
                                        className={styles.modalInput}
                                        placeholder="e.g. Identity Proof Affidavit"
                                        value={newAffidavit.title}
                                        onChange={(e) => setNewAffidavit({ ...newAffidavit, title: e.target.value })}
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Type / Group</label>
                                        <select
                                            className={styles.modalInput}
                                            value={newAffidavit.type}
                                            onChange={(e) => setNewAffidavit({ ...newAffidavit, type: e.target.value })}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                        >
                                            <option>Identity</option>
                                            <option>Residence</option>
                                            <option>Education</option>
                                            <option>Financial</option>
                                            <option>Property</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Estimated Cost (₹)</label>
                                        <input
                                            type="number"
                                            className={styles.modalInput}
                                            placeholder="800"
                                            value={newAffidavit.price}
                                            onChange={(e) => setNewAffidavit({ ...newAffidavit, price: e.target.value })}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Stamp Value</label>
                                        <select
                                            className={styles.modalInput}
                                            value={newAffidavit.stampValue}
                                            onChange={(e) => setNewAffidavit({ ...newAffidavit, stampValue: e.target.value })}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                        >
                                            <option>₹10</option>
                                            <option>₹20</option>
                                            <option>₹50</option>
                                            <option>₹100</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Fulfillment Target</label>
                                        <select
                                            className={styles.modalInput}
                                            value={newAffidavit.fulfillmentTimeline}
                                            onChange={(e) => setNewAffidavit({ ...newAffidavit, fulfillmentTimeline: e.target.value })}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                        >
                                            <option>6 Hours</option>
                                            <option>12 Hours</option>
                                            <option>24 Hours</option>
                                            <option>48 Hours</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalField}>
                            <label>Price Coverage (Gross Fee)</label>
                            <input
                                type="text"
                                placeholder="e.g. ₹1,200"
                                className={styles.modalInput}
                                value={newAffidavit.price}
                                onChange={(e) => setNewAffidavit({ ...newAffidavit, price: e.target.value })}
                            />
                        </div>
                        <div className={styles.modalFooter} style={{ marginTop: '20px' }}>
                            <button onClick={() => setIsConfigModalOpen(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8' }}>Cancel</button>
                            <button
                                onClick={() => {
                                    alert("Service Configured Successfully!");
                                    setIsConfigModalOpen(false);
                                }}
                                className={styles.primaryBtn}
                            >
                                Add Service
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && selectedRequest && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Affidavit Details: {selectedRequest.requestId}</h2>
                            <button className={styles.closeBtn} onClick={() => setIsViewModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.profileHero}>
                                    <div className={styles.largeAvatar}><FileText size={40} /></div>
                                    <div className={styles.heroInfo}>
                                        <h3>{selectedRequest.title}</h3>
                                        <p>{selectedRequest.type}</p>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <span className={`${styles.statusBadge} ${styles[selectedRequest.status?.toLowerCase().replace(' ', '') || 'pending']} `}>
                                            {selectedRequest.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label><User size={14} /> Deponent / Client</label>
                                        <p>{selectedRequest.requestedBy}</p>
                                        <div className={styles.pSub}>{selectedRequest.clientPhone}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label><Briefcase size={14} /> Fulfillment Specialist</label>
                                        <p>{selectedRequest.fulfillmentSpecialist}</p>
                                        <div className={styles.pSub}>{selectedRequest.specialistLicense}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label><Calendar size={14} /> Dates</label>
                                        <p>Requested: {selectedRequest.requestedDate}</p>
                                        <div className={styles.pSub}>Delivered: {selectedRequest.executionDate || "—"}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label><DollarSign size={14} /> Financials</label>
                                        <p>Total Fee: ₹{selectedRequest.grossFee.toLocaleString()}</p>
                                        <div className={styles.pSub}>Stamp Value: {selectedRequest.stampValue}</div>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Client Notes</label>
                                    <p style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                                        {selectedRequest.clientNotes || "No notes provided"}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.secondaryBtn} onClick={() => setIsViewModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Modal Mock */}
            {isManageModalOpen && selectedRequest && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '450px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Manage Affidavit</h2>
                            <button className={styles.closeBtn} onClick={() => setIsManageModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div>
                                    <label style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Update Status</label>
                                    <select
                                        className={styles.modalInput}
                                        defaultValue={selectedRequest.status}
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', padding: '12px', borderRadius: '8px', color: '#fff', marginTop: '8px' }}
                                    >
                                        <option>Pending</option>
                                        <option>Drafting</option>
                                        <option>Notarizing</option>
                                        <option>Delivered</option>
                                        <option>Reported</option>
                                    </select>
                                </div>
                                <button className={styles.primaryBtn} onClick={() => { toast.success("Affidavit updated"); setIsManageModalOpen(false) }}>
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal Mock */}
            {isPaymentModalOpen && selectedRequest && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Payment Log</h2>
                            <button className={styles.closeBtn} onClick={() => setIsPaymentModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>₹{selectedRequest.grossFee.toLocaleString()}</div>
                                <p style={{ color: '#64748b' }}>Status: Payment Successful</p>
                                <div style={{ marginTop: '24px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span>Transaction ID:</span>
                                        <span style={{ color: '#fff' }}>AFX_11223344</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Date:</span>
                                        <span style={{ color: '#fff' }}>{selectedRequest.requestedDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.primaryBtn} onClick={() => setIsPaymentModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AffidavitsList;