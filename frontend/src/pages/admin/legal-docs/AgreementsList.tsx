// import React, { useState, useMemo } from "react";
// import styles from "./LegalDocAdmin.module.css";
// import { Search, Plus, Filter, FileText, CheckCircle2, MoreVertical, Eye, Trash2, Clock, Shield } from "lucide-react";
// import { MdSyncAlt } from "react-icons/md";

// interface LegalDoc {
//     id: string;
//     title: string;
//     category: string;
//     price: string;
//     timeline: string;
//     status: "Active" | "Draft";
//     lastUpdated: string;
// }

// const mockAgreements: LegalDoc[] = [
//     {
//         id: "1",
//         title: "Non-Disclosure Agreement (NDA)",
//         category: "Corporate",
//         price: "₹1,500",
//         timeline: "24 Hours",
//         status: "Active",
//         lastUpdated: "2024-01-28"
//     },
//     {
//         id: "2",
//         title: "Service Level Agreement (SLA)",
//         category: "IT/Tech",
//         price: "₹4,500",
//         timeline: "3 Days",
//         status: "Active",
//         lastUpdated: "2024-01-25"
//     },
//     {
//         id: "3",
//         title: "Partnership Deed",
//         category: "Legal Entity",
//         price: "₹5,000",
//         timeline: "2 Days",
//         status: "Draft",
//         lastUpdated: "2024-01-30"
//     }
// ];

// const AgreementsList = () => {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedStatus, setSelectedStatus] = useState("All");
//     const [openMenuId, setOpenMenuId] = useState<string | null>(null);

//     const filtered = useMemo(() => {
//         return mockAgreements.filter(d => {
//             const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase());
//             const matchesStatus = selectedStatus === "All" || d.status === selectedStatus;
//             return matchesSearch && matchesStatus;
//         });
//     }, [searchTerm, selectedStatus]);

//     const toggleMenu = (id: string) => {
//         setOpenMenuId(openMenuId === id ? null : id);
//     };

//     return (
//         <div className={styles.adminPage}>
//             <div className={styles.headerArea}>
//                 <div>
//                     <h2 className={styles.title}>Agreement Service Management</h2>
//                     <p className={styles.pSub}>All over India: <strong>1,240</strong> agreements fulfilled (Production Rate: 98.2%)</p>
//                 </div>
//                 <div className={styles.headerActions}>
//                     <button className={styles.primaryBtn}><Plus size={18} /> Configure New Template</button>
//                 </div>
//             </div>

//             <div className={styles.filterCard}>
//                 <div className={styles.searchRow}>
//                     <div className={styles.searchBar}>
//                         <Search size={20} />
//                         <input
//                             type="text"
//                             placeholder="Find by Case ID, Client Name, or specialist..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                         />
//                     </div>
//                 </div>

//                 <div className={styles.pillsGrid} style={{ gridTemplateColumns: "1fr" }}>
//                     <div className={styles.pillGroup}>
//                         <label><Filter size={14} /> Fulfillment Status</label>
//                         <div className={styles.pillList}>
//                             {["All", "Active", "Draft", "Completed", "Reported"].map(s => (
//                                 <button
//                                     key={s}
//                                     className={`${styles.pill} ${selectedStatus === s ? styles.activePill : ""}`}
//                                     onClick={() => setSelectedStatus(s)}
//                                 >
//                                     {s}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className={styles.tableCard}>
//                 <div className={styles.tableHeader}>
//                     <h3>Agreement Execution Tracker (India Level)</h3>
//                 </div>

//                 <div className={styles.tableWrapper}>
//                     <table className={styles.adminTable}>
//                         <thead>
//                             <tr>
//                                 <th>S.No</th>
//                                 <th>Case / Template ID</th>
//                                 <th>Used By (Client)</th>
//                                 <th>Who Solved (Specialist)</th>
//                                 <th>Spec / License</th>
//                                 <th>Status / Log</th>
//                                 <th>Solved Count (Numeric)</th>
//                                 <th>Total Earned</th>
//                                 <th>Reported Logs</th>
//                                 <th>Reg. Date</th>
//                                 <th>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {filtered.map((doc, index) => {
//                                 const gross = parseInt(doc.price.replace(/[^\d]/g, ''));
//                                 const earned = gross * 0.7; // Example calc
//                                 const isReported = index === 2;

//                                 return (
//                                     <tr key={doc.id}>
//                                         <td>{index + 1}</td>
//                                         <td>
//                                             <div className={styles.profileCell}>
//                                                 <div className={`${styles.avatar} ${styles.docIcon}`}>
//                                                     <FileText size={20} />
//                                                 </div>
//                                                 <div>
//                                                     <div className={styles.pName}>{doc.title}</div>
//                                                     <div className={styles.pSub}>ID: CASE-{doc.id}009</div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className={styles.credCell}>
//                                                 <div className={styles.pName}>Rahul Sharma</div>
//                                                 <div className={styles.pSub}>+91 99880 11223</div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className={styles.credCell}>
//                                                 <div className={styles.pName}>Adv. Rajesh Kumar</div>
//                                                 <div className={styles.pSub}>ADV-10023 | Delhi</div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className={styles.credCell}>
//                                                 <div className={styles.pName}>Corporate Law</div>
//                                                 <div className={styles.pSub}>LIC: DL/4421/22</div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className={styles.credCell}>
//                                                 <span className={`${styles.statusBadge} ${styles[doc.status.toLowerCase()]}`}>
//                                                     {doc.status}
//                                                 </span>
//                                                 <div className={styles.pSub} style={{ marginTop: '4px' }}>{doc.lastUpdated}</div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className={styles.credCell}>
//                                                 <div className={styles.pName} style={{ color: '#3b82f6' }}>12/14 Steps</div>
//                                                 <div className={styles.pSub}>2 Pending Cycles</div>
//                                             </div>
//                                         </td>
//                                         <td><span className={styles.rateHighlight} style={{ color: '#10b981' }}>₹{earned.toLocaleString()}</span></td>
//                                         <td>
//                                             {isReported ? (
//                                                 <div className={styles.credCell}>
//                                                     <span className={`${styles.severityTag} ${styles.high}`}>Reported</span>
//                                                     <div className={styles.pSub}>Client: Delay in drafting</div>
//                                                 </div>
//                                             ) : (
//                                                 <span className={styles.pSub}>Clean</span>
//                                             )}
//                                         </td>
//                                         <td>{doc.lastUpdated}</td>
//                                         <td>
//                                             <div className={styles.rowActions} style={{ position: 'relative' }}>
//                                                 <button className={styles.actionIcon} title="Quick View"><Eye size={16} /></button>
//                                                 <button
//                                                     className={styles.actionIcon}
//                                                     style={{ color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '4px 10px' }}
//                                                     onClick={() => toggleMenu(doc.id)}
//                                                 >
//                                                     Manage
//                                                 </button>
//                                                 <button className={styles.actionIcon} title="Delete Record" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>

//                                                 {openMenuId === doc.id && (
//                                                     <div style={{
//                                                         position: 'absolute',
//                                                         bottom: '100%',
//                                                         right: 0,
//                                                         background: '#0f172a',
//                                                         border: '1px solid rgba(255,255,255,0.1)',
//                                                         borderRadius: '12px',
//                                                         padding: '10px',
//                                                         zIndex: 100,
//                                                         boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
//                                                         minWidth: '200px',
//                                                         display: 'flex',
//                                                         flexDirection: 'column',
//                                                         gap: '8px'
//                                                     }}>
//                                                         <button className={styles.actionIcon} style={{ justifyContent: 'flex-start', width: '100%', fontSize: '0.8rem' }}>
//                                                             <MdSyncAlt size={14} style={{ marginRight: '8px' }} /> Login as Specialist
//                                                         </button>
//                                                         <button className={styles.actionIcon} style={{ justifyContent: 'flex-start', width: '100%', fontSize: '0.8rem', color: '#f59e0b' }}>
//                                                             <Shield size={14} style={{ marginRight: '8px' }} /> Block specialist
//                                                         </button>
//                                                         <button className={styles.actionIcon} style={{ justifyContent: 'flex-start', width: '100%', fontSize: '0.8rem' }}>
//                                                             <Plus size={14} style={{ marginRight: '8px', transform: 'rotate(45deg)' }} /> Edit Details
//                                                         </button>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 );
//                             })}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AgreementsList;




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
import { MdSyncAlt } from "react-icons/md";
import { toast } from "react-toastify";
import axios from "axios";

interface AgreementRequest {
    _id?: string;
    requestId: string;
    agreementId: string;
    title: string;
    category: string;
    price: string;
    timeline: string;
    status: "Pending" | "In Progress" | "Review" | "Completed" | "Reported" | "Rejected";
    requestedBy: string;           // Client
    clientPhone: string;
    requestedDate: string;
    completionDate?: string;
    specialist: string;            // Who Solved
    specialistLicense: string;
    specField: string;             // e.g. Corporate Law
    licenseNo: string;
    stepsCompleted: number;
    totalSteps: number;
    grossFee: number;
    earned: number;                // Platform earn (70%)
    reportedLogs?: string;
    clientNotes?: string;
    lastUpdated: string;
}

const mockRequests: AgreementRequest[] = [
    {
        requestId: "AGR-REQ-2001",
        agreementId: "1",
        title: "Non-Disclosure Agreement (NDA)",
        category: "Corporate",
        price: "₹1,500",
        timeline: "24 Hours",
        status: "Completed",
        requestedBy: "Rahul Sharma",
        clientPhone: "+91 99880 11223",
        requestedDate: "2026-01-20",
        completionDate: "2026-01-21",
        specialist: "Adv. Rajesh Kumar",
        specialistLicense: "ADV-10023 | Delhi",
        specField: "Corporate Law",
        licenseNo: "DL/4421/22",
        stepsCompleted: 14,
        totalSteps: 14,
        grossFee: 1500,
        earned: Math.round(1500 * 0.7),
        reportedLogs: "",
        clientNotes: "For new startup investor meeting",
        lastUpdated: "2026-01-21",
    },
    {
        requestId: "AGR-REQ-2002",
        agreementId: "2",
        title: "Service Level Agreement (SLA)",
        category: "IT/Tech",
        price: "₹4,500",
        timeline: "3 Days",
        status: "Pending",
        requestedBy: "Anita Verma",
        clientPhone: "+91 88776 55443",
        requestedDate: "2026-01-29",
        completionDate: undefined,
        specialist: "Adv. Priya Mehta",
        specialistLicense: "ADV-11892 | MH",
        specField: "IT Contracts",
        licenseNo: "MH/7789/21",
        stepsCompleted: 4,
        totalSteps: 18,
        grossFee: 4500,
        earned: 0,
        reportedLogs: "",
        clientNotes: "Cloud service provider contract",
        lastUpdated: "2026-01-30",
    },
    {
        requestId: "AGR-REQ-2003",
        agreementId: "1",
        title: "Non-Disclosure Agreement (NDA)",
        category: "Corporate",
        price: "₹1,500",
        timeline: "24 Hours",
        status: "Reported",
        requestedBy: "Karan Singh",
        clientPhone: "+91 76543 21098",
        requestedDate: "2026-01-15",
        completionDate: "2026-01-18",
        specialist: "Adv. Rajesh Kumar",
        specialistLicense: "ADV-10023 | Delhi",
        specField: "Corporate Law",
        licenseNo: "DL/4421/22",
        stepsCompleted: 12,
        totalSteps: 14,
        grossFee: 1500,
        earned: Math.round(1500 * 0.7),
        reportedLogs: "Client: Too many revision cycles – delay reported",
        clientNotes: "Employee NDA for new hires",
        lastUpdated: "2026-01-25",
    },
    {
        requestId: "AGR-REQ-2004",
        agreementId: "3",
        title: "Partnership Deed",
        category: "Legal Entity",
        price: "₹5,000",
        timeline: "2 Days",
        status: "In Progress",
        requestedBy: "Meera Joshi",
        clientPhone: "+91 91234 56789",
        requestedDate: "2026-01-27",
        completionDate: undefined,
        specialist: "Adv. Neha Gupta",
        specialistLicense: "ADV-13456 | GJ",
        specField: "Business Law",
        licenseNo: "GJ/3210/20",
        stepsCompleted: 8,
        totalSteps: 16,
        grossFee: 5000,
        earned: Math.round(5000 * 0.4),
        reportedLogs: "",
        clientNotes: "50-50 partnership for retail business",
        lastUpdated: "2026-01-31",
    },
    {
        requestId: "AGR-REQ-2005",
        agreementId: "4",
        title: "Commercial Lease Agreement",
        category: "Property",
        price: "₹3,500",
        timeline: "48 Hours",
        status: "Review",
        requestedBy: "Sanjay Singhania",
        clientPhone: "+91 98877 66554",
        requestedDate: "2026-02-01",
        completionDate: undefined,
        specialist: "Adv. Vikram Seth",
        specialistLicense: "ADV-15542 | KA",
        specField: "Property Law",
        licenseNo: "KA/8821/19",
        stepsCompleted: 12,
        totalSteps: 15,
        grossFee: 3500,
        earned: 0,
        reportedLogs: "",
        clientNotes: "Office space lease in Bangalore",
        lastUpdated: "2026-02-02",
    },
    {
        requestId: "AGR-REQ-2006",
        agreementId: "5",
        title: "Vendor Service Agreement",
        category: "Corporate",
        price: "₹2,500",
        timeline: "24 Hours",
        status: "Rejected",
        requestedBy: "Kavita Rao",
        clientPhone: "+91 91122 33445",
        requestedDate: "2026-01-25",
        completionDate: undefined,
        specialist: "Adv. Rajesh Kumar",
        specialistLicense: "ADV-10023 | Delhi",
        specField: "Corporate Law",
        licenseNo: "DL/4421/22",
        stepsCompleted: 2,
        totalSteps: 14,
        grossFee: 2500,
        earned: 0,
        reportedLogs: "Specialist rejected due to conflict of interest",
        clientNotes: "Software delivery contract",
        lastUpdated: "2026-01-26",
    },
    {
        requestId: "AGR-REQ-2007",
        agreementId: "1",
        title: "Non-Disclosure Agreement (NDA)",
        category: "Corporate",
        price: "₹1,500",
        timeline: "24 Hours",
        status: "Completed",
        requestedBy: "Amitabh Shah",
        clientPhone: "+91 90000 11111",
        requestedDate: "2026-01-10",
        completionDate: "2026-01-11",
        specialist: "Adv. Priya Mehta",
        specialistLicense: "ADV-11892 | MH",
        specField: "IT Contracts",
        licenseNo: "MH/7789/21",
        stepsCompleted: 14,
        totalSteps: 14,
        grossFee: 1500,
        earned: 1050,
        reportedLogs: "",
        clientNotes: "Standard NDA",
        lastUpdated: "2026-01-11",
    }
];

const AgreementsList = () => {
    const [requests, setRequests] = useState<AgreementRequest[]>(mockRequests);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [modalFilter, setModalFilter] = useState<"all" | "completed" | "pending" | "reported" | null>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<AgreementRequest | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        title: "",
        category: "Corporate",
        price: "",
        timeline: "24 Hours",
        description: ""
    });

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/admin/legal-requests", {
                params: { type: "Agreement" }
            });
            if (res.data.success) {
                setRequests([...mockRequests, ...(res.data.requests || [])]);
            }
        } catch (err: any) {
            console.error("Error fetching agreements:", err);
            setError(err.message || "Failed to fetch agreements");
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

    const handleAction = (type: 'view' | 'manage' | 'delete' | 'payment', req: AgreementRequest) => {
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
            const matchesStatus = selectedStatus === "All" || r.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [searchTerm, selectedStatus, requests]);

    const summary = useMemo(() => {
        const total = requests.length;
        const completed = requests.filter((r) => r.status === "Completed").length;
        const pending = requests.filter((r) =>
            ["Pending", "In Progress", "Review"].includes(r.status)
        ).length;
        const reported = requests.filter((r) => r.status === "Reported" || !!r.reportedLogs).length;
        return { total, completed, pending, reported };
    }, [requests]);

    const modalData = useMemo(() => {
        if (!modalFilter) return [];
        switch (modalFilter) {
            case "completed":
                return requests.filter((r) => r.status === "Completed");
            case "pending":
                return requests.filter((r) =>
                    ["Pending", "In Progress", "Review"].includes(r.status)
                );
            case "reported":
                return requests.filter((r) => r.status === "Reported" || !!r.reportedLogs);
            default:
                return requests;
        }
    }, [modalFilter, requests]);

    const modalTitle = modalFilter
        ? `${modalFilter.charAt(0).toUpperCase() + modalFilter.slice(1)} Agreements`
        : "All Agreement Requests";

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    if (loading) {
        return (
            <div className={styles.adminPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '12px', color: '#94a3b8' }}>Loading Agreements...</p>
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
                    <h2 className={styles.title}>Agreement Service Management</h2>
                    <p className={styles.pSub}>
                        All over India – <strong>{summary.total}</strong> agreements requested •
                        Production Rate: <strong>98.2%</strong> • As of February 01, 2026
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.primaryBtn} onClick={() => setIsConfigModalOpen(true)}>
                        <Plus size={18} /> Configure New Template
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
                <div className={styles.summaryCard} onClick={() => setModalFilter("all")}>
                    <FileText size={32} color="#3b82f6" />
                    <div>
                        <h4>Total Requested</h4>
                        <p className={styles.summaryNumber}>{summary.total}</p>
                    </div>
                </div>

                <div className={styles.summaryCard} onClick={() => setModalFilter("completed")}>
                    <CheckCircle size={32} color="#10b981" />
                    <div>
                        <h4>Completed</h4>
                        <p className={styles.summaryNumber} style={{ color: "#10b981" }}>
                            {summary.completed}
                        </p>
                    </div>
                </div>

                <div className={styles.summaryCard} onClick={() => setModalFilter("pending")}>
                    <ClockIcon size={32} color="#f59e0b" />
                    <div>
                        <h4>Pending / In Progress</h4>
                        <p className={styles.summaryNumber} style={{ color: "#f59e0b" }}>
                            {summary.pending}
                        </p>
                    </div>
                </div>

                <div className={styles.summaryCard} onClick={() => setModalFilter("reported")}>
                    <AlertCircle size={32} color="#ef4444" />
                    <div>
                        <h4>Reported Issues</h4>
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
                            placeholder="Find by Case ID, Client Name, or specialist..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.pillsGrid} style={{ gridTemplateColumns: "1fr" }}>
                    <div className={styles.pillGroup}>
                        <label>
                            <Filter size={14} /> Fulfillment Status
                        </label>
                        <div className={styles.pillList}>
                            {["All", "Active", "Pending", "In Progress", "Completed", "Reported"].map((s) => (
                                <button
                                    key={s}
                                    className={`${styles.pill} ${selectedStatus === s ? styles.activePill : ""}`}
                                    onClick={() => setSelectedStatus(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table – All original columns preserved */}
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <h3>Agreement Execution Tracker (India Level)</h3>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Case / Template ID</th>
                                <th>Used By (Client)</th>
                                <th>Who Solved (Specialist)</th>
                                <th>Spec / License</th>
                                <th>Status / Log</th>
                                <th>Solved Count (Numeric)</th>
                                <th>Total Earned</th>
                                <th>Reported Logs</th>
                                <th>Reg. Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMain.map((req, index) => {
                                const isExpanded = expandedId === req.requestId;
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
                                                    <div className={`${styles.avatar} ${styles.docIcon}`}>
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <div className={styles.pName}>{req.title}</div>
                                                        <div className={styles.pSub}>ID: {req.requestId}</div>
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
                                                    <div className={styles.pName}>{req.specialist}</div>
                                                    <div className={styles.pSub}>{req.specialistLicense}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <div className={styles.pName}>{req.specField}</div>
                                                    <div className={styles.pSub}>LIC: {req.licenseNo}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <span
                                                        className={`${styles.statusBadge} ${styles[req.status.toLowerCase().replace(/\s+/g, "")]}`}
                                                    >
                                                        {req.status}
                                                    </span>
                                                    <div className={styles.pSub} style={{ marginTop: "4px" }}>
                                                        {req.lastUpdated}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <div className={styles.pName} style={{ color: "#3b82f6" }}>
                                                        {req.stepsCompleted}/{req.totalSteps} Steps
                                                    </div>
                                                    <div className={styles.pSub}>
                                                        {req.stepsCompleted === req.totalSteps ? "Finalized" : "Cycles Pending"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.rateHighlight} style={{ color: "#10b981" }}>
                                                    ₹{req.earned.toLocaleString()}
                                                </span>
                                            </td>
                                            <td>
                                                {isReported ? (
                                                    <div className={styles.credCell}>
                                                        <span className={`${styles.severityTag} ${styles.high}`}>
                                                            Reported
                                                        </span>
                                                        <div className={styles.pSub} style={{ color: "#f59e0b" }}>
                                                            {req.reportedLogs}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className={styles.pSub}>Clean</span>
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
                                                        <strong>Client Notes:</strong> {req.clientNotes || "—"}<br />
                                                        <strong>Expected Timeline:</strong> {req.timeline}<br />
                                                        <strong>Completion Date:</strong> {req.completionDate || "Not completed yet"}
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

            {/* Modal – Full filtered view */}
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
                                        <th>Case / Template</th>
                                        <th>Client</th>
                                        <th>Specialist</th>
                                        <th>Status</th>
                                        <th>Steps</th>
                                        <th>Earned</th>
                                        <th>Requested</th>
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
                                                <div className={styles.pName}>{req.specialist}</div>
                                                <div className={styles.pSub}>{req.specialistLicense}</div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    color: req.status === "Completed" ? "#10b981" :
                                                        ["Pending", "In Progress"].includes(req.status) ? "#f59e0b" : "#ef4444"
                                                }}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td>{req.stepsCompleted}/{req.totalSteps}</td>
                                            <td>₹{req.earned.toLocaleString()}</td>
                                            <td>{req.requestedDate}</td>
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
                            <h3>Configure New Agreement Template</h3>
                            <button onClick={() => setIsConfigModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody} style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Template Title</label>
                                    <input
                                        type="text"
                                        className={styles.modalInput}
                                        placeholder="e.g. Non-Disclosure Agreement"
                                        value={newTemplate.title}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Category</label>
                                        <select
                                            className={styles.modalInput}
                                            value={newTemplate.category}
                                            onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                        >
                                            <option>Corporate</option>
                                            <option>Property</option>
                                            <option>Legal Entity</option>
                                            <option>IT/Tech</option>
                                            <option>Personal</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Base Price (₹)</label>
                                        <input
                                            type="number"
                                            className={styles.modalInput}
                                            placeholder="1500"
                                            value={newTemplate.price}
                                            onChange={(e) => setNewTemplate({ ...newTemplate, price: e.target.value })}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Standard Timeline</label>
                                    <select
                                        className={styles.modalInput}
                                        value={newTemplate.timeline}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, timeline: e.target.value })}
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                    >
                                        <option>12 Hours</option>
                                        <option>24 Hours</option>
                                        <option>48 Hours</option>
                                        <option>3-5 Days</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Description</label>
                                    <textarea
                                        className={styles.modalInput}
                                        placeholder="Describe the agreement purpose..."
                                        value={newTemplate.description}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', minHeight: '80px', resize: 'vertical' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter} style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setIsConfigModalOpen(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8' }}>Cancel</button>
                            <button
                                onClick={() => {
                                    alert("New Template Saved Successfully!");
                                    setIsConfigModalOpen(false);
                                }}
                                className={styles.primaryBtn}
                            >
                                Save Template
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
                            <h2>Case Details: {selectedRequest.requestId}</h2>
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
                                        <span className={`${styles.statusBadge} ${styles[selectedRequest.status.toLowerCase().replace(' ', '')]}`}>
                                            {selectedRequest.status}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label><User size={14} /> Client Details</label>
                                        <p>{selectedRequest.requestedBy}</p>
                                        <div className={styles.pSub}>{selectedRequest.clientPhone}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label><Briefcase size={14} /> Assigned Specialist</label>
                                        <p>{selectedRequest.specialist}</p>
                                        <div className={styles.pSub}>{selectedRequest.specialistLicense}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label><Calendar size={14} /> Dates</label>
                                        <p>Requested: {selectedRequest.requestedDate}</p>
                                        <div className={styles.pSub}>Completed: {selectedRequest.completionDate || "—"}</div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label><DollarSign size={14} /> Financials</label>
                                        <p>Gross Fee: {selectedRequest.price}</p>
                                        <div className={styles.pSub}>Platform Earned: ₹{selectedRequest.earned.toLocaleString()}</div>
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
                            <h2>Manage Case</h2>
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
                                        <option>Review</option>
                                        <option>Completed</option>
                                        <option>Reported</option>
                                        <option>Rejected</option>
                                    </select>
                                </div>
                                <button className={styles.primaryBtn} onClick={() => { toast.success("Settings updated"); setIsManageModalOpen(false) }}>
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
                            <h2>Payment History</h2>
                            <button className={styles.closeBtn} onClick={() => setIsPaymentModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981' }}>{selectedRequest.price}</div>
                                <p style={{ color: '#64748b' }}>Status: Paid via Online Banking</p>
                                <div style={{ marginTop: '24px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span>Transaction ID:</span>
                                        <span style={{ color: '#fff' }}>TXN_99812233</span>
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

export default AgreementsList;