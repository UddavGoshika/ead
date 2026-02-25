import React, { useState, useMemo, useEffect } from "react";
import styles from "./LegalDocAdmin.module.css";
import {
    Search,
    Plus,
    Filter,
    FileText,
    Eye,
    Trash2,
    ChevronDown,
    ChevronUp,
    X,
    MoreVertical,
    CheckCircle,
    Clock as ClockIcon,
    AlertCircle,
    Loader2,
    CreditCard,
    Settings,
    User,
    Calendar,
    DollarSign,
    Briefcase
} from "lucide-react";
import { toast } from "react-toastify";
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

const mockRequests: NoticeRequest[] = [
    {
        requestId: "NTC-REQ-3001",
        title: "Legal Notice for Recovery of Dues",
        category: "Financial",
        price: "₹1,200",
        grossFee: 1200,
        earned: 840,
        status: "Delivered",
        requestedBy: "Amit Jain",
        clientPhone: "+91 99988 77766",
        requestedDate: "2026-01-20",
        executionDate: "2026-01-22",
        fulfillmentSpecialist: "Adv. Rajesh Kumar",
        specialistLicense: "ADV-10023 | Delhi",
        stepsCompleted: 6,
        totalSteps: 6,
        clientNotes: "Unpaid invoice recover"
    },
    {
        requestId: "NTC-REQ-3002",
        title: "Divorce Notice",
        category: "Family",
        price: "₹2,500",
        grossFee: 2500,
        earned: 0,
        status: "Pending",
        requestedBy: "Suman Lata",
        clientPhone: "+91 88776 65544",
        requestedDate: "2026-02-01",
        fulfillmentSpecialist: "Adv. Neha Gupta",
        specialistLicense: "ADV-13456 | GJ",
        stepsCompleted: 1,
        totalSteps: 8,
        clientNotes: "Initial notice for separation"
    },
    {
        requestId: "NTC-REQ-3003",
        title: "Eviction Notice",
        category: "Property",
        price: "₹1,800",
        grossFee: 1800,
        earned: 0,
        status: "In Progress",
        requestedBy: "Rakesh Roshan",
        clientPhone: "+91 77665 54433",
        requestedDate: "2026-02-02",
        fulfillmentSpecialist: "Adv. Vikram Seth",
        specialistLicense: "ADV-15542 | KA",
        stepsCompleted: 3,
        totalSteps: 5,
        clientNotes: "Tenant not paying rent"
    },
    {
        requestId: "NTC-REQ-3004",
        title: "Defamation Notice",
        category: "Criminal/Civil",
        price: "₹3,000",
        grossFee: 3000,
        earned: 2100,
        status: "Reported",
        requestedBy: "Sunil Grover",
        clientPhone: "+91 66554 43322",
        requestedDate: "2026-01-15",
        executionDate: "2026-01-18",
        fulfillmentSpecialist: "Adv. Priya Mehta",
        specialistLicense: "ADV-11892 | MH",
        stepsCompleted: 4,
        totalSteps: 10,
        clientNotes: "Social media post defamation"
    },
    {
        requestId: "NTC-REQ-3005",
        title: "Consumer Court Notice",
        category: "Consumer",
        price: "₹1,500",
        grossFee: 1500,
        earned: 1050,
        status: "Delivered",
        requestedBy: "Pooja Hegde",
        clientPhone: "+91 99911 22233",
        requestedDate: "2026-01-28",
        executionDate: "2026-01-30",
        fulfillmentSpecialist: "Adv. Rajesh Kumar",
        specialistLicense: "ADV-10023 | Delhi",
        stepsCompleted: 6,
        totalSteps: 6,
        clientNotes: "Defective product replacement"
    },
    {
        requestId: "NTC-REQ-3006",
        title: "Section 138 Notice",
        category: "Financial",
        price: "₹2,000",
        grossFee: 2000,
        earned: 0,
        status: "Pending",
        requestedBy: "Ramesh Powar",
        clientPhone: "+91 88822 33344",
        requestedDate: "2026-02-04",
        fulfillmentSpecialist: "Adv. Neha Gupta",
        specialistLicense: "ADV-13456 | GJ",
        stepsCompleted: 1,
        totalSteps: 5,
        clientNotes: "Cheque bounce case"
    }
];

const NoticesList = () => {
    const [requests, setRequests] = useState<NoticeRequest[]>(mockRequests);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSeverity, setSelectedSeverity] = useState("All");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [modalFilter, setModalFilter] = useState<"all" | "served" | "pending" | "reported" | null>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<NoticeRequest | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [newNotice, setNewNotice] = useState({
        title: "",
        category: "Standard",
        price: "",
        timeline: "24 Hours",
        description: ""
    });

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/admin/legal-requests", {
                params: { type: "Notice" }
            });
            if (res.data.success) {
                setRequests(prev => [...mockRequests, ...(res.data.requests || [])]);
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

    const toggleMenu = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleAction = (type: 'view' | 'manage' | 'delete' | 'payment', req: NoticeRequest) => {
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
                    <button className={styles.primaryBtn} onClick={() => setIsConfigModalOpen(true)}>
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
                    <FileText size={32} color="#3b82f6" />
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
                    <ClockIcon size={32} color="#f59e0b" />
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
                            <AlertCircle size={14} /> Severity
                        </label>
                        <div className={styles.pillList}>
                            {["All", "High", "Medium", "Standard"].map((s) => (
                                <button
                                    key={s}
                                    className={`${styles.pill} ${selectedSeverity === s ? styles.activePill : ""} `}
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
                                                    <div className={`${styles.avatar} ${styles.noticeIcon} `}>
                                                        <FileText size={20} />
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
                                                        className={`${styles.statusBadge} ${styles[doc.status.toLowerCase()]} `}
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
                                                        <span className={`${styles.severityTag} ${styles.high} `}>
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
                                                    <button
                                                        className={styles.actionIcon}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleMenu(doc.requestId);
                                                        }}
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>

                                                    {openMenuId === doc.requestId && (
                                                        <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                                                            <div className={styles.menuDivider}>Actions</div>
                                                            <button onClick={() => handleAction('view', doc)}>
                                                                <Eye size={14} /> View Case
                                                            </button>
                                                            <button onClick={() => handleAction('manage', doc)}>
                                                                <Settings size={14} /> Manage
                                                            </button>
                                                            <button onClick={() => handleAction('payment', doc)}>
                                                                <CreditCard size={14} /> Payment
                                                            </button>
                                                            <div className={styles.menuDivider}>Danger</div>
                                                            <button
                                                                onClick={() => handleAction('delete', doc)}
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
            {/* Configuration Modal */}
            {isConfigModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h3>Configure New Notice Template</h3>
                            <button onClick={() => setIsConfigModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody} style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Notice Title</label>
                                    <input
                                        type="text"
                                        className={styles.modalInput}
                                        placeholder="e.g. Legal Notice for Recovery"
                                        value={newNotice.title}
                                        onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Category</label>
                                        <select
                                            className={styles.modalInput}
                                            value={newNotice.category}
                                            onChange={(e) => setNewNotice({ ...newNotice, category: e.target.value })}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                        >
                                            <option>Standard</option>
                                            <option>Urgent</option>
                                            <option>Financial</option>
                                            <option>Property</option>
                                            <option>Family</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Fulfillment (₹)</label>
                                        <input
                                            type="number"
                                            className={styles.modalInput}
                                            placeholder="1200"
                                            value={newNotice.price}
                                            onChange={(e) => setNewNotice({ ...newNotice, price: e.target.value })}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Description</label>
                                    <textarea
                                        className={styles.modalInput}
                                        placeholder="Briefly describe what this notice covers..."
                                        value={newNotice.description}
                                        onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', minHeight: '80px', resize: 'vertical' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter} style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setIsConfigModalOpen(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8' }}>Cancel</button>
                            <button
                                onClick={() => {
                                    alert("Notice Template Created Successfully!");
                                    setIsConfigModalOpen(false);
                                }}
                                className={styles.primaryBtn}
                            >
                                Create Notice
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
                            <h2>Notice Details: {selectedRequest.requestId}</h2>
                            <button className={styles.closeBtn} onClick={() => setIsViewModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.profileHero}>
                                    <div className={styles.largeAvatar}><FileText size={40} /></div>
                                    <div className={styles.heroInfo}>
                                        <h3>{selectedRequest.title}</h3>
                                        <p>{selectedRequest.category}</p>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <span className={`${styles.statusBadge} ${styles[selectedRequest.status.toLowerCase().replace(' ', '')]} `}>
                                            {selectedRequest.status}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label><User size={14} /> Sender / Client</label>
                                        <p>{selectedRequest.requestedBy}</p>
                                        <div className={styles.pSub}>{selectedRequest.clientPhone}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label><Briefcase size={14} /> Serving Specialist</label>
                                        <p>{selectedRequest.fulfillmentSpecialist}</p>
                                        <div className={styles.pSub}>{selectedRequest.specialistLicense}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label><Calendar size={14} /> Dates</label>
                                        <p>Requested: {selectedRequest.requestedDate}</p>
                                        <div className={styles.pSub}>Executed: {selectedRequest.executionDate || "—"}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label><DollarSign size={14} /> Financials</label>
                                        <p>Gross Fee: {selectedRequest.price}</p>
                                        <div className={styles.pSub}>Platform Earned: ₹{selectedRequest.earned.toLocaleString()}</div>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <label>Client Narrative / Reason</label>
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
                            <h2>Manage Notice</h2>
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
                                        <option>In Progress</option>
                                        <option>Drafted</option>
                                        <option>Served</option>
                                        <option>Delivered</option>
                                        <option>Reported</option>
                                    </select>
                                </div>
                                <button className={styles.primaryBtn} onClick={() => { toast.success("Notice updated"); setIsManageModalOpen(false) }}>
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
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>{selectedRequest.price}</div>
                                <p style={{ color: '#64748b' }}>Status: Payment Successful</p>
                                <div style={{ marginTop: '24px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span>Transaction ID:</span>
                                        <span style={{ color: '#fff' }}>NTX_77211022</span>
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

export default NoticesList;