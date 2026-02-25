// import React, { useState, useMemo } from "react";
// import styles from "./LegalDocAdmin.module.css";
// import { Search, Eye, Filter, UserCircle, Briefcase, Star, CheckCircle2, Shield, MoreVertical, Trash2, Plus } from "lucide-react";
// import { MdSyncAlt } from "react-icons/md";

// interface DocumentationProvider {
//     id: string;
//     adv_id: string;
//     name: string;
//     email: string;
//     mobile: string;
//     location: string;
//     specialization: string;
//     experience: string;
//     license_id: string;
//     verified: boolean;
//     status: "Active" | "Pending" | "Blocked";
//     totalDrafts: number;
//     rating: number;
//     baseRate: string;
// }

// const mockAdminProviders: DocumentationProvider[] = [
//     {
//         id: "1",
//         adv_id: "ADV-100000",
//         name: "Rajesh Kumar",
//         email: "rajesh.k@eadvocate.in",
//         mobile: "+91 98765 43210",
//         location: "Delhi, DL",
//         specialization: "Civil & Documentation",
//         experience: "12 Years",
//         license_id: "TS/1428/5256",
//         verified: true,
//         status: "Active",
//         totalDrafts: 145,
//         rating: 4.8,
//         baseRate: "₹2,500"
//     },
//     {
//         id: "2",
//         adv_id: "ADV-100001",
//         name: "Sneha Sharma",
//         email: "sneha.s@eadvocate.in",
//         mobile: "+91 98765 43211",
//         location: "Mumbai, MH",
//         specialization: "Corporate Contracts",
//         experience: "8 Years",
//         license_id: "MH/4521/8765",
//         verified: true,
//         status: "Active",
//         totalDrafts: 89,
//         rating: 4.9,
//         baseRate: "₹3,500"
//     }
// ];

// const DocumentationProviders = () => {
//     const [searchTerm, setSearchTerm] = useState("");
//     const [selectedStatus, setSelectedStatus] = useState("All");
//     const [selectedSpec, setSelectedSpec] = useState("All");
//     const [openMenuId, setOpenMenuId] = useState<string | null>(null);

//     const specs = ["All", "Civil & Documentation", "Corporate Contracts", "Property Laws", "Family Docs"];

//     const filtered = useMemo(() => {
//         return mockAdminProviders.filter(p => {
//             const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                 p.adv_id.toLowerCase().includes(searchTerm.toLowerCase());
//             const matchesStatus = selectedStatus === "All" || p.status === selectedStatus;
//             const matchesSpec = selectedSpec === "All" || p.specialization === selectedSpec;
//             return matchesSearch && matchesStatus && matchesSpec;
//         });
//     }, [searchTerm, selectedStatus, selectedSpec]);

//     const toggleMenu = (id: string) => {
//         setOpenMenuId(openMenuId === id ? null : id);
//     };

//     // Mock calculations for columns based on user request
//     const mockStat = {
//         allIndiaSolved: 2450,
//         reportedCount: 3
//     };

//     return (
//         <div className={styles.adminPage}>
//             <div className={styles.headerArea}>
//                 <div>
//                     <h2 className={styles.title}>Legal Experts & Service Providers</h2>
//                     <p className={styles.pSub}>All over India: <strong>{mockStat.allIndiaSolved}</strong> cases solved through these specialists (Performance View)</p>
//                 </div>
//                 <div className={styles.headerActions}>
//                     <button className={styles.primaryBtn}>+ Register New Specialist</button>
//                 </div>
//             </div>

//             <div className={styles.statsRow}>
//                 <div className={styles.statCard}>
//                     <span className={styles.statLabel}>Total Service Providers</span>
//                     <span className={styles.statVal}>{mockAdminProviders.length}</span>
//                 </div>
//                 <div className={styles.statCard}>
//                     <span className={styles.statLabel}>Verified Experts</span>
//                     <span className={`${styles.statVal} ${styles.green}`}>2</span>
//                 </div>
//                 <div className={styles.statCard}>
//                     <span className={styles.statLabel}>Total Earned (Aggregate)</span>
//                     <span className={`${styles.statVal} ${styles.green}`}>₹1,24,500</span>
//                 </div>
//             </div>

//             <div className={styles.filterCard}>
//                 <div className={styles.searchRow}>
//                     <div className={styles.searchBar}>
//                         <Search size={20} />
//                         <input
//                             type="text"
//                             placeholder="Find by Name, Advocate ID, License, or Phone..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                         />
//                     </div>
//                 </div>

//                 <div className={styles.pillsGrid}>
//                     <div className={styles.pillGroup}>
//                         <label><Filter size={14} /> Account Status</label>
//                         <div className={styles.pillList}>
//                             {["All", "Active", "Pending", "Blocked"].map(s => (
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

//                     <div className={styles.pillGroup}>
//                         <label><Briefcase size={14} /> Core Specialization</label>
//                         <div className={styles.pillList}>
//                             {specs.map(s => (
//                                 <button
//                                     key={s}
//                                     className={`${styles.pill} ${selectedSpec === s ? styles.activePill : ""}`}
//                                     onClick={() => setSelectedSpec(s)}
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
//                     <h3>Service Specialist Master Registry</h3>
//                     <div className={styles.tableActions}>
//                         <button className={styles.iconBtn} title="Fraud Alert & Reports"><Shield size={16} /></button>
//                     </div>
//                 </div>

//                 <div className={styles.tableWrapper}>
//                     <table className={styles.adminTable}>
//                         <thead>
//                             <tr>
//                                 <th>S.No</th>
//                                 <th>Specialist (Name/ID)</th>
//                                 <th>Email / Phone</th>
//                                 <th>Specialization / License</th>
//                                 <th>Account Status</th>
//                                 <th>Gross Profit Share</th>
//                                 <th>Total Solved (Numeric)</th>
//                                 <th>Aggregate Earned</th>
//                                 <th>Super Admin Reports</th>
//                                 <th>Reg. Date</th>
//                                 <th>Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {filtered.map((p, index) => {
//                                 const gross = parseInt(p.baseRate.replace(/[^\d]/g, ''));
//                                 const totalEarned = gross * p.totalDrafts * 0.7; // 70% share demo
//                                 const isReported = index === 0; // for demo

//                                 return (
//                                     <tr key={p.id}>
//                                         <td>{index + 1}</td>
//                                         <td>
//                                             <div className={styles.profileCell}>
//                                                 <div className={styles.avatar}>
//                                                     <UserCircle size={24} />
//                                                 </div>
//                                                 <div>
//                                                     <div className={styles.pName}>{p.name} <CheckCircle2 size={12} className={styles.verifyIcon} /></div>
//                                                     <div className={styles.pSub}>{p.adv_id}</div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className={styles.credCell}>
//                                                 <div className={styles.pName}>{p.email}</div>
//                                                 <div className={styles.pSub}>{p.mobile}</div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <div className={styles.credCell}>
//                                                 <div className={styles.pName}>{p.specialization}</div>
//                                                 <div className={styles.pSub}>Lic: {p.license_id} | {p.location}</div>
//                                             </div>
//                                         </td>
//                                         <td>
//                                             <span className={`${styles.statusBadge} ${styles[p.status.toLowerCase()]}`}>
//                                                 {p.status}
//                                             </span>
//                                         </td>
//                                         <td><span className={styles.rateHighlight}>₹{gross.toLocaleString()} (30/70 Split)</span></td>
//                                         <td>
//                                             <div className={styles.credCell}>
//                                                 <div className={styles.pName} style={{ color: '#3b82f6' }}>{p.totalDrafts} Cases</div>
//                                                 <div className={styles.pSub}>Fulfillment Score: 9.8</div>
//                                             </div>
//                                         </td>
//                                         <td><span className={styles.rateHighlight} style={{ color: '#10b981' }}>₹{totalEarned.toLocaleString()}</span></td>
//                                         <td>
//                                             {isReported ? (
//                                                 <div className={styles.credCell}>
//                                                     <span className={`${styles.severityTag} ${styles.high}`}>Reported (2)</span>
//                                                     <div className={styles.pSub}>Verified Fraud Attempt</div>
//                                                 </div>
//                                             ) : (
//                                                 <span className={`${styles.pSub}`}>Clean Service Hist.</span>
//                                             )}
//                                         </td>
//                                         <td>{index === 0 ? "2024-01-20" : "2024-01-15"}</td>
//                                         <td>
//                                             <div className={styles.rowActions} style={{ position: 'relative' }}>
//                                                 <button className={styles.actionIcon} title="View Profile"><Eye size={16} /></button>
//                                                 <button
//                                                     className={styles.actionIcon}
//                                                     style={{ color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '4px 10px' }}
//                                                     onClick={() => toggleMenu(p.id)}
//                                                 >
//                                                     Manage
//                                                 </button>
//                                                 <button className={styles.actionIcon} title="Delete Member" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>

//                                                 {openMenuId === p.id && (
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
//                                                         minWidth: '220px',
//                                                         display: 'flex',
//                                                         flexDirection: 'column',
//                                                         gap: '8px'
//                                                     }}>
//                                                         <button className={styles.actionIcon} style={{ justifyContent: 'flex-start', width: '100%', fontSize: '0.8rem' }}>
//                                                             <MdSyncAlt size={14} style={{ marginRight: '8px' }} /> Login as Specialist
//                                                         </button>
//                                                         <button className={styles.actionIcon} style={{ justifyContent: 'flex-start', width: '100%', fontSize: '0.8rem', color: '#f59e0b' }}>
//                                                             <Shield size={14} style={{ marginRight: '8px' }} /> Block Specialist
//                                                         </button>
//                                                         <button className={styles.actionIcon} style={{ justifyContent: 'flex-start', width: '100%', fontSize: '0.8rem' }}>
//                                                             <Plus size={14} style={{ marginRight: '8px', transform: 'rotate(45deg)' }} /> Edit Metadata
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

// export default DocumentationProviders;




import React, { useState, useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./LegalDocAdmin.module.css";
import {
    Search,
    Eye,
    Filter,
    UserCircle,
    Briefcase,
    Star,
    CheckCircle2,
    Shield,
    Trash2,
    Plus,
    ClipboardCheck,
    Clock,
    AlertCircle,
    CheckCircle,
    X,
    ChevronDown,
    ChevronUp,
    ArrowUpDown,
    Ban,
    Edit,
    UserCheck,
    Loader2,
    LogIn,
    MoreVertical,
    ShieldAlert,
    ShieldCheck
} from "lucide-react";
import { MdSyncAlt } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";

interface DocumentationProvider {
    id: string;
    adv_id: string;
    name: string;
    email: string;
    mobile: string;
    location: string;
    specialization: string;
    experience: string;
    license_id: string;
    verified: boolean;
    status: "Active" | "Pending" | "Blocked" | "Deactivated" | "Deleted" | "Suspended";
    totalDrafts: number;
    rating: number;
    baseRate: string;
    joinDate: string; // added for sorting & display
    legalDocumentation: string[]; // added for service filtering
}

const mockAdminProviders: DocumentationProvider[] = [
    {
        id: "1",
        adv_id: "ADV-100000",
        name: "Rajesh Kumar",
        email: "rajesh.k@eadvocate.in",
        mobile: "+91 98765 43210",
        location: "Delhi, DL",
        specialization: "Civil & Documentation",
        experience: "12 Years",
        license_id: "TS/1428/5256",
        verified: true,
        status: "Active",
        totalDrafts: 145,
        rating: 4.8,
        baseRate: "₹2,500",
        joinDate: "2024-01-20",
        legalDocumentation: ["agreements", "notices"]
    },
    {
        id: "2",
        adv_id: "ADV-100001",
        name: "Sneha Sharma",
        email: "sneha.s@eadvocate.in",
        mobile: "+91 98765 43211",
        location: "Mumbai, MH",
        specialization: "Corporate Contracts",
        experience: "8 Years",
        license_id: "MH/4521/8765",
        verified: true,
        status: "Active",
        totalDrafts: 89,
        rating: 4.9,
        baseRate: "₹3,500",
        joinDate: "2024-01-15",
        legalDocumentation: ["affidavits", "legal-docs"]
    },
    {
        id: "3",
        adv_id: "ADV-100002",
        name: "Amit Patel",
        email: "amit.p@eadvocate.in",
        mobile: "+91 98765 43212",
        location: "Ahmedabad, GJ",
        specialization: "Property Laws",
        experience: "15 Years",
        license_id: "GJ/6612/4412",
        verified: true,
        status: "Blocked",
        totalDrafts: 210,
        rating: 4.5,
        baseRate: "₹3,000",
        joinDate: "2023-11-20",
        legalDocumentation: ["agreements", "legal-docs"]
    },
    {
        id: "4",
        adv_id: "ADV-100003",
        name: "Priyanka Chopra",
        email: "priyanka.c@eadvocate.in",
        mobile: "+91 98765 43213",
        location: "Chandigarh, CH",
        specialization: "Family Docs",
        experience: "5 Years",
        license_id: "CH/2145/6678",
        verified: false,
        status: "Pending",
        totalDrafts: 15,
        rating: 3.8,
        baseRate: "₹1,200",
        joinDate: "2024-02-15",
        legalDocumentation: ["affidavits"]
    },
    {
        id: "5",
        adv_id: "ADV-100004",
        name: "Arjun Singh",
        email: "arjun.s@eadvocate.in",
        mobile: "+91 98765 43214",
        location: "Jaipur, RJ",
        specialization: "Criminal Law",
        experience: "10 Years",
        license_id: "RJ/9981/1234",
        verified: true,
        status: "Deactivated",
        totalDrafts: 120,
        rating: 4.2,
        baseRate: "₹2,800",
        joinDate: "2023-08-10",
        legalDocumentation: ["notices"]
    },
    {
        id: "6",
        adv_id: "ADV-100005",
        name: "Komal Gupta",
        email: "komal.g@eadvocate.in",
        mobile: "+91 98765 43215",
        location: "Kolkata, WB",
        specialization: "Intellectual Property",
        experience: "7 Years",
        license_id: "WB/3342/9901",
        verified: true,
        status: "Deleted",
        totalDrafts: 45,
        rating: 4.6,
        baseRate: "₹4,000",
        joinDate: "2023-05-05",
        legalDocumentation: ["agreements", "notices", "legal-docs"]
    },
    {
        id: "7",
        adv_id: "ADV-100006",
        name: "Suresh Raina",
        email: "suresh.r@eadvocate.in",
        mobile: "+91 98765 43216",
        location: "Chennai, TN",
        specialization: "Corporate Contracts",
        experience: "9 Years",
        license_id: "TN/7765/1122",
        verified: true,
        status: "Active",
        totalDrafts: 88,
        rating: 4.7,
        baseRate: "₹3,200",
        joinDate: "2024-01-10",
        legalDocumentation: ["agreements", "affidavits"]
    },
    {
        id: "8",
        adv_id: "ADV-100007",
        name: "Vikram Sarabhai",
        email: "vikram.s@eadvocate.in",
        mobile: "+91 98765 43217",
        location: "Ahmedabad, GJ",
        specialization: "Space Law",
        experience: "25 Years",
        license_id: "GJ/1122/3344",
        verified: true,
        status: "Suspended",
        totalDrafts: 500,
        rating: 4.9,
        baseRate: "₹10,000",
        joinDate: "2022-10-10",
        legalDocumentation: ["agreements", "legal-docs"]
    }
];

type SortKey = "name" | "rating" | "totalDrafts" | "earned" | null;
type SortDirection = "asc" | "desc";


const DocumentationProviders = () => {
    const [providers, setProviders] = useState<DocumentationProvider[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { statusFilter } = useParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<"All" | "Active" | "Pending" | "Blocked" | "Deactivated" | "Deleted" | "Suspended">("All");
    const [selectedSpec, setSelectedSpec] = useState("All");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [sortKey, setSortKey] = useState<SortKey>(null);
    const [sortDir, setSortDir] = useState<SortDirection>("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [modalFilter, setModalFilter] = useState<"all" | "active" | "pending" | "blocked" | "deactivated" | "deleted" | "suspended" | null>(null);
    const [selectedService, setSelectedService] = useState("All");
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<DocumentationProvider | null>(null);
    const { impersonate, openLegalProviderReg } = useAuth();

    const serviceTypes = [
        { id: "All", label: "All" },
        { id: "agreements", label: "Agreements" },
        { id: "affidavits", label: "Affidavits" },
        { id: "notices", label: "Notices" },
        { id: "legal-docs", label: "Legal Doc Services" }
    ];

    const specs = ["All", "Civil & Documentation", "Corporate Contracts", "Property Laws", "Family Docs", "Criminal Law", "Intellectual Property"];

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/admin/members", {
                params: { role: "legal_provider", context: selectedStatus.toLowerCase(), t: Date.now() }
            });

            if (res.data.success) {
                const mapped: DocumentationProvider[] = res.data.members
                    .filter((m: any) => m.role === 'legal_provider')
                    .map((m: any) => {
                        const userId = m.id || m._id;
                        // Use actual status from backend, fallback to determined
                        let status = m.status || "Pending";
                        if (m.verified && status === "Pending") status = "Active";

                        return {
                            id: userId,
                            adv_id: m.unique_id || `SP-${String(userId).slice(-6).toUpperCase()}`,
                            name: m.name || "Unknown Specialist",
                            email: m.email || "N/A",
                            mobile: m.phone || "N/A",
                            location: m.officeCity || m.city || "India",
                            specialization: m.specialization || "General Practice",
                            experience: m.experience ? `${m.experience} Years` : "N/A",
                            license_id: m.barCouncil || "N/A",
                            verified: m.verified || false,
                            status: status as any,
                            totalDrafts: Math.floor(Math.random() * 50), // Mock data for now as backend doesn't track this yet
                            rating: 4.0 + Math.random(), // Mock rating
                            baseRate: "₹2,500", // Default base rate
                            estimatedEarnings: Math.floor(Math.random() * 100000),
                            joinDate: m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                            legalDocumentation: m.legalDocumentation || []
                        };
                    });
                setProviders(mapped);
            }
        } catch (err: any) {
            console.error("Error fetching providers:", err);
            setError("Failed to load providers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (statusFilter) {
            const filterMap: Record<string, any> = {
                'blocked': 'Blocked',
                'deactivated': 'Deactivated',
                'deleted': 'Deleted',
                'pending': 'Pending',
                'active': 'Active',
                'suspended': 'Suspended'
            };
            setSelectedStatus(filterMap[statusFilter] || 'All');
        } else {
            setSelectedStatus('All');
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchProviders();
    }, [selectedStatus]);

    // ────────────────────────────────────────────────
    // Filtering + Sorting + Pagination
    // ────────────────────────────────────────────────
    const processedData = useMemo(() => {
        let result = [...providers];

        // Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(term) ||
                    p.adv_id.toLowerCase().includes(term) ||
                    p.license_id.toLowerCase().includes(term) ||
                    p.email.toLowerCase().includes(term)
            );
        }

        // Status filter
        if (selectedStatus !== "All") {
            result = result.filter((p) => p.status === selectedStatus);
        }

        // Specialization filter
        if (selectedSpec !== "All") {
            result = result.filter((p) => p.specialization === selectedSpec);
        }

        // Service Type filter
        if (selectedService !== "All") {
            result = result.filter((p) => p.legalDocumentation?.includes(selectedService));
        }

        // Sorting
        if (sortKey) {
            result.sort((a, b) => {
                let aVal: any, bVal: any;

                if (sortKey === "name") {
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                } else if (sortKey === "rating") {
                    aVal = a.rating;
                    bVal = b.rating;
                } else if (sortKey === "totalDrafts") {
                    aVal = a.totalDrafts;
                    bVal = b.totalDrafts;
                } else if (sortKey === "earned") {
                    const ga = parseInt(a.baseRate.replace(/[^\d]/g, ""), 10) || 0;
                    const gb = parseInt(b.baseRate.replace(/[^\d]/g, ""), 10) || 0;
                    aVal = Math.round(ga * a.totalDrafts * 0.7);
                    bVal = Math.round(gb * b.totalDrafts * 0.7);
                }

                if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
                if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [providers, searchTerm, selectedStatus, selectedSpec, selectedService, sortKey, sortDir]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return processedData.slice(start, start + pageSize);
    }, [processedData, currentPage, pageSize]);

    const totalPages = Math.ceil(processedData.length / pageSize);

    const summary = useMemo(() => {
        const total = providers.length;
        const active = providers.filter((p) => p.status === "Active").length;
        const pending = providers.filter((p) => p.status === "Pending").length;
        const blocked = providers.filter(p => p.status === 'Blocked').length;
        const deactivated = providers.filter(p => p.status === 'Deactivated').length;
        const deleted = providers.filter(p => p.status === 'Deleted').length;
        const suspended = providers.filter(p => p.status === 'Suspended').length;

        // Service Counts
        const serviceCounts = {
            All: total,
            agreements: providers.filter(p => p.legalDocumentation?.includes('agreements')).length,
            affidavits: providers.filter(p => p.legalDocumentation?.includes('affidavits')).length,
            notices: providers.filter(p => p.legalDocumentation?.includes('notices')).length,
            'legal-docs': providers.filter(p => p.legalDocumentation?.includes('legal-docs')).length
        };

        return { total, active, pending, blocked, deactivated, deleted, suspended, serviceCounts };
    }, [providers]);

    const modalData = useMemo(() => {
        if (!modalFilter) return [];
        switch (modalFilter) {
            case "active":
                return providers.filter((p) => p.status === "Active");
            case "pending":
                return providers.filter((p) => p.status === "Pending");
            case "blocked":
                return providers.filter((p) => p.status === "Blocked");
            case "deactivated":
                return providers.filter((p) => p.status === "Deactivated");
            case "deleted":
                return providers.filter((p) => p.status === "Deleted");
            case "suspended":
                return providers.filter((p) => p.status === "Suspended");
            default:
                return providers; // all
        }
    }, [modalFilter, providers]);
    // ────────────────────────────────────────────────
    // Handlers
    // ────────────────────────────────────────────────
    const toggleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const getSortIcon = (key: SortKey) => {
        if (sortKey !== key) return <ArrowUpDown size={14} />;
        return sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    const toggleMenu = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        if (!window.confirm(`Are you sure you want to change status to ${status}?`)) return;
        try {
            const res = await axios.patch(`/api/admin/members/${id}/status`, { status });
            if (res.data.success) {
                toast.success(`Status updated to ${status}`);
                fetchProviders();
                setOpenMenuId(null);
            }
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const handleVerify = async (id: string, verified: boolean) => {
        const action = verified ? "Verify" : "Unverify";
        if (!window.confirm(`Are you sure you want to ${action} this provider?`)) return;
        try {
            const res = await axios.patch(`/api/admin/members/${id}/verify`, { verified });
            if (res.data.success) {
                toast.success(`Provider ${verified ? 'verified' : 'unverified'}`);
                fetchProviders();
                setOpenMenuId(null);
            }
        } catch (err) {
            toast.error("Failed to update verification status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this member? This action cannot be undone.")) return;
        try {
            const res = await axios.patch(`/api/admin/members/${id}/status`, { status: "Deleted" });
            if (res.data.success) {
                toast.success("Member deleted");
                fetchProviders();
                setOpenMenuId(null);
            }
        } catch (err) {
            toast.error("Failed to delete member");
        }
    };

    const handleImpersonate = (p: any) => {
        if (window.confirm(`You are about to log in as ${p.name}. Proceed?`)) {
            impersonate({
                id: p.id,
                name: p.name,
                role: 'legal_provider',
                email: p.email,
                unique_id: p.adv_id
            } as any);
        }
    };

    const handleViewDetails = (p: any) => {
        setSelectedProvider(p);
        setOpenMenuId(null);
    };

    if (loading) {
        return (
            <div className={styles.adminPage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 className={styles.spinner} style={{ animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '12px', color: '#94a3b8' }}>Loading Service Providers...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.adminPage}>
                <div style={{ padding: '24px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '12px', color: '#ef4444', textAlign: 'center' }}>
                    <p>Error: {error}</p>
                    <button onClick={fetchProviders} className={styles.primaryBtn} style={{ marginTop: '12px' }}>Try Again</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.adminPage}>
            {/* Header */}
            <div className={styles.headerArea}>
                <div>
                    <h2 className={styles.title}>Legal Experts & Service Providers</h2>
                    <p className={styles.pSub}>
                        Pan-India Registry – as of <strong>February 01, 2026</strong>
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.primaryBtn} onClick={openLegalProviderReg}>
                        <Plus size={18} /> Register New Specialist
                    </button>
                </div>
            </div>

            {/* Clickable Summary Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "16px",
                    margin: "24px 0",
                }}
            >
                <div className={styles.summaryCard} onClick={() => setModalFilter("all")}>
                    <ClipboardCheck size={32} color="#3b82f6" />
                    <div>
                        <h4>Total Specialists</h4>
                        <p className={styles.summaryNumber}>{summary.total}</p>
                    </div>
                </div>

                <div className={styles.summaryCard} onClick={() => setModalFilter("active")}>
                    <CheckCircle size={32} color="#10b981" />
                    <div>
                        <h4>Active</h4>
                        <p className={styles.summaryNumber} style={{ color: "#10b981" }}>
                            {summary.active}
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

                <div className={styles.summaryCard} onClick={() => setModalFilter("blocked")}>
                    <Ban size={32} color="#ef4444" />
                    <div>
                        <h4>Blocked</h4>
                        <p className={styles.summaryNumber} style={{ color: "#ef4444" }}>
                            {summary.blocked}
                        </p>
                    </div>
                </div>

                <div className={styles.summaryCard} onClick={() => setModalFilter("deactivated")}>
                    <ShieldAlert size={32} color="#f59e0b" />
                    <div>
                        <h4>Deactivated</h4>
                        <p className={styles.summaryNumber} style={{ color: "#f59e0b" }}>
                            {summary.deactivated}
                        </p>
                    </div>
                </div>

                <div className={styles.summaryCard} onClick={() => setModalFilter("deleted")}>
                    <Trash2 size={32} color="#94a3b8" />
                    <div>
                        <h4>Deleted</h4>
                        <p className={styles.summaryNumber} style={{ color: "#94a3b8" }}>
                            {summary.deleted}
                        </p>
                    </div>
                </div>

                <div className={styles.summaryCard} onClick={() => setModalFilter("suspended")}>
                    <AlertCircle size={32} color="#f59e0b" />
                    <div>
                        <h4>Suspended</h4>
                        <p className={styles.summaryNumber} style={{ color: "#f59e0b" }}>
                            {summary.suspended}
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
                            placeholder="Find by name, ID, license, email..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                <div className={styles.pillsGrid}>
                    <div className={styles.pillGroup}>
                        <label><Filter size={14} /> Status</label>
                        <div className={styles.pillList}>
                            {["All", "Active", "Pending", "Blocked", "Deactivated", "Deleted", "Suspended"].map((s) => (
                                <button
                                    key={s}
                                    className={`${styles.pill} ${selectedStatus === s ? styles.activePill : ""}`}
                                    onClick={() => {
                                        setSelectedStatus(s as any);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.pillGroup}>
                        <label><Briefcase size={14} /> Specialization</label>
                        <div className={styles.pillList}>
                            {specs.map((s) => (
                                <button
                                    key={s}
                                    className={`${styles.pill} ${selectedSpec === s ? styles.activePill : ""}`}
                                    onClick={() => {
                                        setSelectedSpec(s);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.pillGroup}>
                        <label><ClipboardCheck size={14} /> Documentation Service</label>
                        <div className={styles.pillList}>
                            {serviceTypes.map((s) => (
                                <button
                                    key={s.id}
                                    className={`${styles.pill} ${selectedService === s.id ? styles.activePill : ""}`}
                                    onClick={() => {
                                        setSelectedService(s.id);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {s.label} ({summary.serviceCounts[s.id as keyof typeof summary.serviceCounts] || 0})
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <h3>Specialist Registry</h3>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th onClick={() => toggleSort("name")} style={{ cursor: "pointer" }}>
                                    Specialist <span>{getSortIcon("name")}</span>
                                </th>
                                <th>Email / Phone</th>
                                <th>Specialization / License</th>
                                <th>Status</th>
                                <th onClick={() => toggleSort("rating")} style={{ cursor: "pointer" }}>
                                    Rating <span>{getSortIcon("rating")}</span>
                                </th>
                                <th onClick={() => toggleSort("totalDrafts")} style={{ cursor: "pointer" }}>
                                    Drafts <span>{getSortIcon("totalDrafts")}</span>
                                </th>
                                <th onClick={() => toggleSort("earned")} style={{ cursor: "pointer" }}>
                                    Est. Earnings <span>{getSortIcon("earned")}</span>
                                </th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((p, idx) => {
                                const globalIndex = (currentPage - 1) * pageSize + idx;
                                const gross = parseInt(p.baseRate.replace(/[^\d]/g, ""), 10) || 0;
                                const earned = Math.round(gross * p.totalDrafts * 0.7);
                                const isExpanded = expandedId === p.id;

                                return (
                                    <React.Fragment key={p.id}>
                                        <tr
                                            style={{ cursor: "pointer" }}
                                            onClick={() => setExpandedId(isExpanded ? null : p.id)}
                                        >
                                            <td>{globalIndex + 1}</td>
                                            <td>
                                                <div className={styles.profileCell}>
                                                    <div className={styles.avatar}>
                                                        <UserCircle size={24} />
                                                    </div>
                                                    <div>
                                                        <div className={styles.pName}>
                                                            {p.name} {p.verified && <CheckCircle2 size={12} className={styles.verifyIcon} />}
                                                        </div>
                                                        <div className={styles.pSub}>{p.adv_id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <div className={styles.pName}>{p.email}</div>
                                                    <div className={styles.pSub}>{p.mobile}</div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.credCell}>
                                                    <div className={styles.pName}>{p.specialization}</div>
                                                    <div className={styles.pSub}>
                                                        Lic: {p.license_id} • {p.location}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`${styles.statusBadge} ${styles[p.status.toLowerCase()]}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                    <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                                    <span>{p.rating}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: "#3b82f6", fontWeight: 500 }}>{p.totalDrafts}</td>
                                            <td style={{ color: "#10b981", fontWeight: 500 }}>₹{earned.toLocaleString()}</td>
                                            <td>{p.joinDate}</td>
                                            <td>
                                                <div className={styles.rowActions}>
                                                    <button
                                                        className={styles.actionIcon}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleMenu(p.id);
                                                        }}
                                                    >
                                                        <MoreVertical size={20} />
                                                    </button>

                                                    {openMenuId === p.id && (
                                                        <div
                                                            className={styles.dropdownMenu}
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <div className={styles.menuDivider}>Main Actions</div>
                                                            <button onClick={() => handleViewDetails(p)}>
                                                                <Eye size={14} /> View Details
                                                            </button>
                                                            <button onClick={() => handleImpersonate(p)}>
                                                                <LogIn size={14} /> Login as Specialist
                                                            </button>

                                                            <div className={styles.menuDivider}>Status Management</div>

                                                            {p.status === 'Blocked' ? (
                                                                <button onClick={() => handleUpdateStatus(p.id, 'Active')}>
                                                                    <UserCheck size={14} style={{ color: '#22c55e' }} /> Unblock Specialist
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    style={{ color: "#ef4444" }}
                                                                    onClick={() => handleUpdateStatus(p.id, 'Blocked')}
                                                                >
                                                                    <Ban size={14} /> Block / Suspend
                                                                </button>
                                                            )}

                                                            {p.status === 'Deactivated' ? (
                                                                <button onClick={() => handleUpdateStatus(p.id, 'Active')}>
                                                                    <CheckCircle size={14} style={{ color: '#22c55e' }} /> Activate Account
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    style={{ color: "#f59e0b" }}
                                                                    onClick={() => handleUpdateStatus(p.id, 'Deactivated')}
                                                                >
                                                                    <ShieldAlert size={14} /> Deactivate Account
                                                                </button>
                                                            )}

                                                            <div className={styles.menuDivider}>Verification</div>
                                                            <button onClick={() => handleVerify(p.id, !p.verified)}>
                                                                <ShieldCheck size={14} /> {p.verified ? 'Unverify Profile' : 'Verify Profile'}
                                                            </button>

                                                            <div className={styles.menuDivider}>Account</div>
                                                            {p.status === 'Deleted' ? (
                                                                <button onClick={() => handleUpdateStatus(p.id, 'Active')}>
                                                                    <MdSyncAlt size={14} style={{ color: '#10b981' }} /> Restore Member
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    style={{ color: "#ef4444", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "4px", paddingTop: "8px" }}
                                                                    onClick={() => handleDelete(p.id)}
                                                                >
                                                                    <Trash2 size={14} /> Delete Member
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>

                                        {isExpanded && (
                                            <tr>
                                                <td colSpan={10}>
                                                    <div style={{ padding: "12px 40px", background: "#0f172a", borderRadius: "8px" }}>
                                                        <strong>Experience:</strong> {p.experience}<br />
                                                        <strong>Base Rate:</strong> {p.baseRate} per document (70% to specialist)<br />
                                                        <strong>Joined:</strong> {p.joinDate}<br />
                                                        <strong>Location Preference:</strong> {p.location}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {processedData.length > 0 && (
                        <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                Showing {(currentPage - 1) * pageSize + 1} – {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length}
                            </div>

                            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    style={{ background: "#1e293b", color: "white", border: "1px solid #334155", padding: "6px 10px", borderRadius: "6px" }}
                                >
                                    {[5, 10, 20, 50].map((size) => (
                                        <option key={size} value={size}>
                                            {size} per page
                                        </option>
                                    ))}
                                </select>

                                <div style={{ display: "flex", gap: "8px" }}>
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                        style={{ padding: "6px 12px" }}
                                    >
                                        Prev
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                        style={{ padding: "6px 12px" }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal – Filtered list */}
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
                            maxWidth: "1400px",
                            maxHeight: "90vh",
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
                            }}
                        >
                            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
                                {modalFilter === "all" ? "All Specialists" : `${modalFilter.charAt(0).toUpperCase() + modalFilter.slice(1)} Specialists`}
                            </h2>
                            <button onClick={() => setModalFilter(null)} style={{ background: "none", border: "none", color: "#94a3b8" }}>
                                <X size={28} />
                            </button>
                        </div>

                        <div style={{ overflow: "auto", padding: "16px 24px", flex: 1 }}>
                            <table className={styles.adminTable} style={{ width: "100%" }}>
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>ID</th>
                                        <th>Specialization</th>
                                        <th>Status</th>
                                        <th>Rating</th>
                                        <th>Drafts</th>
                                        <th>Earnings</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedData
                                        .filter((p) => {
                                            if (modalFilter === "all") return true;
                                            return p.status.toLowerCase() === modalFilter;
                                        })
                                        .map((p) => {
                                            const gross = parseInt(p.baseRate.replace(/[^\d]/g, ""), 10) || 0;
                                            const earned = Math.round(gross * p.totalDrafts * 0.7);
                                            return (
                                                <tr key={p.id}>
                                                    <td>{p.name}</td>
                                                    <td>{p.adv_id}</td>
                                                    <td>{p.specialization}</td>
                                                    <td>
                                                        <span className={`${styles.statusBadge} ${styles[p.status.toLowerCase()]}`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td>{p.rating}</td>
                                                    <td>{p.totalDrafts}</td>
                                                    <td>₹{earned.toLocaleString()}</td>
                                                    <td>{p.joinDate}</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {/* Provider Details Modal */}
            {selectedProvider && (
                <div className={styles.modalOverlay} onClick={() => setSelectedProvider(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Specialist Profile Details</h2>
                            <button className={styles.closeBtn} onClick={() => setSelectedProvider(null)}>
                                <X size={28} />
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.profileHero}>
                                    <div className={styles.largeAvatar}>
                                        <UserCircle size={48} />
                                    </div>
                                    <div className={styles.heroInfo}>
                                        <h3>{selectedProvider.name}</h3>
                                        <p>{selectedProvider.adv_id}</p>
                                    </div>
                                </div>

                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <label>Email Address</label>
                                        <p>{selectedProvider.email}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Phone Number</label>
                                        <p>{selectedProvider.mobile}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Specialization</label>
                                        <p>{selectedProvider.specialization}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Experience</label>
                                        <p>{selectedProvider.experience}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>License ID</label>
                                        <p>{selectedProvider.license_id}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Location</label>
                                        <p>{selectedProvider.location}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Account Status</label>
                                        <p className={`${styles.statusBadge} ${styles[selectedProvider.status.toLowerCase()]}`}>
                                            {selectedProvider.status}
                                        </p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label>Verification</label>
                                        <p style={{ color: selectedProvider.verified ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                                            {selectedProvider.verified ? 'VERIFIED' : 'PENDING'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.secondaryBtn} onClick={() => setSelectedProvider(null)}>Close</button>
                            <button className={styles.primaryBtn} onClick={() => handleImpersonate(selectedProvider)}>
                                Login as Specialist
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentationProviders;