import React, { useState, useEffect, useRef } from "react";
import styles from "./MemberTable.module.css";
import axios from "axios";
import { Loader2, Users, ShieldCheck, ShieldAlert, XCircle, RefreshCw, Download, Upload, RotateCcw } from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";
import MemberDetailModal from "./MemberDetailModal";
import MemberEditModal from "./MemberEditModal";
import MemberVerificationModal from "./MemberVerificationModal";
import MemberPackageModal from "./MemberPackageModal";
import MemberWalletModal from "./MemberWalletModal";
import { BulkAddModal } from './BulkAddModal';
import { useAuth } from "../../context/AuthContext";
import { getFeaturesFromPlan } from "../../config/completePackageConfig";

export type MemberStatus = "Active" | "Deactivated" | "Blocked" | "Pending" | "Deleted";
export type MemberContext = 'all' | 'free' | 'premium' | 'approved' | 'pending' | 'blocked' | 'deactivated' | 'deleted' | 'reported';

export interface Member {
    id: string; // Updated to string for MongoDB ID
    code: string;
    role: "Advocate" | "Client";
    name: string;
    email?: string;
    phone: string;
    location?: string;
    gender: string;
    verified: boolean;
    verificationStatus?: "Pending" | "Verified" | "Rejected" | "Resubmitted"; // New
    reported: number;
    view?: number;
    plan: string;
    coins: number;
    since: string;
    createdAt?: string; // Original timestamp from DB
    status: MemberStatus;
    image: string;

    // Location Fields
    country?: string;
    state?: string;
    city?: string;
    pincode?: string;

    // Advocate Fields
    barCouncil?: string;
    experience?: string | number;
    specialization?: string;
    courtType?: string;
    practiceArea?: string;
    officeCity?: string;

    // Client Fields
    caseType?: string;
    subscriptionType?: string;
    consultationMode?: string;
    preferredLanguage?: string;

    // Ultra Pro Fields
    supportType?: string;
    idProofType?: string;
}

interface MemberTableProps {
    title: string;
    initialMembers?: Member[];
    defaultStatus?: string;
    context?: MemberContext;
    initialRole?: "All" | "Advocate" | "Client";
    initialVerifiedFilter?: "All" | "Verified" | "Unverified" | "Rejected" | "Resubmitted";
}

const MemberActions: React.FC<{
    member: Member,
    onDelete: (id: string) => void,
    onStatusUpdate: (id: string, s: MemberStatus) => void,
    onView: (member: Member) => void,
    onEdit: (member: Member) => void,
    onVerify: (member: Member) => void,
    onPackage: (member: Member) => void,
    onWallet: (member: Member) => void,
    onImpersonate: (member: Member) => void,
    context?: MemberContext
}> = ({ member, onDelete, onStatusUpdate, onView, onEdit, onVerify, onPackage, onWallet, onImpersonate, context = 'all' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const close = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        return () => document.removeEventListener("mousedown", close);
    }, []);

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${member.name}?`)) {
            try {
                const res = await axios.delete(`/api/admin/members/${member.id}`);
                if (res.data.success) {
                    onDelete(member.id);
                }
            } catch (err) {
                alert("Error deleting member");
            }
        }
    };

    const handleUpdateStatus = async (newStatus: MemberStatus) => {
        try {
            const res = await axios.patch(`/api/admin/members/${member.id}/status`, { status: newStatus });
            if (res.data.success) {
                onStatusUpdate(member.id, newStatus);
            }
        } catch (err) {
            alert("Error updating status");
        }
    };

    const handleRestore = async () => {
        try {
            const res = await axios.patch(`/api/admin/members/${member.id}/restore`);
            if (res.data.success) {
                onStatusUpdate(member.id, "Active");
                alert("Member restored successfully");
            }
        } catch (err) {
            alert("Error restoring member");
        }
    };

    const handlePermanentDelete = async () => {
        if (window.confirm(`CRITICAL: Are you sure you want to PERMANENTLY delete ${member.name}? This action cannot be undone.`)) {
            try {
                const res = await axios.delete(`/api/admin/members/${member.id}/permanent`);
                if (res.data.success) {
                    onDelete(member.id);
                }
            } catch (err) {
                alert("Error in permanent deletion");
            }
        }
    };

    return (
        <div className={styles.actions} ref={ref}>
            <button className={styles.kebab} onClick={() => setOpen(!open)}>
                ⋮
            </button>

            {open && (
                <div className={styles.menu}>
                    <button onClick={() => { setOpen(false); onView(member); }}>View Profile</button>

                    {/* Primary Context Actions */}
                    {context === 'blocked' && (
                        <button className={styles.primaryAction} onClick={() => { setOpen(false); handleUpdateStatus("Active"); }}>Unblock Member</button>
                    )}
                    {context === 'free' && (
                        <button className={styles.primaryAction} onClick={() => { setOpen(false); onPackage(member); }}>Upgrade to Pro</button>
                    )}
                    {member.status === 'Pending' && (
                        <button className={styles.primaryAction} onClick={() => {
                            if (window.confirm(`Quick approve ${member.name}?`)) {
                                setOpen(false);
                                onVerify(member); // Opens modal, or I could call a separate fast-verify
                            }
                        }}>Quick Review & Approve</button>
                    )}
                    <button onClick={() => { setOpen(false); onVerify(member); }}>Review Full Verification</button>
                    {context === 'deactivated' && (
                        <button className={styles.primaryAction} onClick={() => { setOpen(false); handleUpdateStatus("Active"); }}>Activate Account</button>
                    )}
                    {context === 'reported' && (
                        <button className={styles.primaryAction} onClick={() => { setOpen(false); onView(member); }}>Review Reports</button>
                    )}

                    <div className={styles.divider}></div>

                    <button onClick={() => { setOpen(false); onEdit(member); }}>Edit Details</button>

                    {member.status === 'Blocked' ? (
                        <button onClick={() => { setOpen(false); handleUpdateStatus("Active"); }}>Unblock Member</button>
                    ) : (
                        <button onClick={() => { setOpen(false); handleUpdateStatus("Blocked"); }}>Block Member</button>
                    )}

                    {member.status === 'Deactivated' ? (
                        <button onClick={() => { setOpen(false); handleUpdateStatus("Active"); }}>Activate Account</button>
                    ) : (
                        <button onClick={() => { setOpen(false); handleUpdateStatus("Deactivated"); }}>Deactivate Account</button>
                    )}

                    <button onClick={() => { setOpen(false); onPackage(member); }}>Manage Package</button>
                    <button onClick={() => { setOpen(false); onWallet(member); }}>Wallet Balance</button>
                    <button onClick={() => { setOpen(false); onImpersonate(member); }}>Log in as Member</button>

                    {member.status === 'Deleted' ? (
                        <>
                            <button className={styles.primaryAction} style={{ color: '#10b981' }} onClick={() => { setOpen(false); handleRestore(); }}>Restore Member</button>
                            <button className={styles.delete} onClick={() => { setOpen(false); handlePermanentDelete(); }}>Delete Permanently</button>
                        </>
                    ) : (
                        <button className={styles.delete} onClick={() => { setOpen(false); handleDelete(); }}>Delete Member</button>
                    )}
                </div>
            )}
        </div>
    );
};

const MemberTable: React.FC<MemberTableProps> = ({ title, initialMembers, defaultStatus, context, initialRole, initialVerifiedFilter }) => {
    const { openAdvocateReg, openClientReg, impersonate } = useAuth();
    const [members, setMembers] = useState<Member[]>(initialMembers || []);
    const [loading, setLoading] = useState(!initialMembers);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>(defaultStatus || "All");
    const [filterCategory, setFilterCategory] = useState<string>("All"); // Use as Package Filter
    const [filterLevel, setFilterLevel] = useState<string>("All");
    const [activeRole, setActiveRole] = useState<"Advocate" | "Client" | "All">(initialRole || "All");
    const [filterVerified, setFilterVerified] = useState<"All" | "Verified" | "Unverified" | "Rejected" | "Resubmitted">(initialVerifiedFilter || "All");
    const [filterRegDate, setFilterRegDate] = useState<string>("All"); // Today, Last 7 Days, Last 30 Days, Custom
    const [filterLocation, setFilterLocation] = useState({ country: "All", state: "All", city: "All", pincode: "" });
    const [sortBy, setSortBy] = useState<string>("newest");
    const [filterGender, setFilterGender] = useState<string>("All");
    const [filterReported, setFilterReported] = useState<string>("All"); // All, 0, 1-5, 5+
    const [filterIdProofType, setFilterIdProofType] = useState<string>("All");

    // Advocate-Only Filters
    const [advFilter, setAdvFilter] = useState({
        barCouncil: "",
        experience: "All",
        specialization: "All",
        courtType: "All",
        practiceArea: "All",
        officeCity: ""
    });

    // Client-Only Filters
    const [clientFilter, setClientFilter] = useState({
        caseType: "All",
        subscriptionType: "All",
        consultationMode: "All",
        preferredLanguage: "All"
    });

    // Ultra Pro Filters
    const [ultraFilter, setUltraFilter] = useState({ supportType: "All" });

    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [activeModal, setActiveModal] = useState<'view' | 'edit' | 'verify' | 'package' | 'wallet' | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const handleAction = async (member: Member, modal: 'view' | 'edit' | 'verify' | 'package' | 'wallet') => {
        if (modal === 'view' || modal === 'verify') {
            try {
                const res = await axios.get(`/api/admin/members/${member.id}`);
                if (res.data.success) {
                    // Combine user and profile data safely
                    const apiData = res.data.member;
                    const fullMember = {
                        ...member,
                        ...(apiData.user || {}),
                        ...(apiData.profile || {}),
                        documents: apiData.documents || [],
                        id: apiData.user?._id || member.id // Maintain consistent ID
                    };
                    setSelectedMember(fullMember);
                } else {
                    setSelectedMember(member);
                }
            } catch (err) {
                console.error("Error fetching member details:", err);
                setSelectedMember(member);
            }
        } else {
            setSelectedMember(member);
        }
        setActiveModal(modal);
    };

    const handleImpersonate = (member: Member) => {
        if (window.confirm(`You are about to log in as ${member.name}. Your admin session will be temporarily replaced. Proceed?`)) {
            impersonate({
                id: member.id,
                name: member.name,
                role: member.role as any,
                email: member.email || 'impersonated@example.com',
                unique_id: member.code
            });
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredMembers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredMembers.map(m => m.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected members?`)) {
            try {
                const res = await axios.post('/api/admin/members/bulk-delete', { ids: selectedIds });
                if (res.data.success) {
                    setMembers(prev => prev.filter(m => !selectedIds.includes(m.id)));
                    setSelectedIds([]);
                    alert("Bulk delete successful");
                }
            } catch (err) {
                alert("Error in bulk delete");
            }
        }
    };

    const fetchMembers = async () => {
        try {
            setLoading(true);
            // Pass context for strict server-side filtering
            const res = await axios.get('/api/admin/members', { params: { context } });
            if (res.data.success) {
                const mapped: Member[] = res.data.members.map((m: any) => {
                    const role = (m.role || "").toLowerCase();
                    return {
                        id: m.id,
                        code: m.unique_id || (role === 'advocate' ? `TP-EAD-ADV${m.id.slice(-5)}` : `TP-EAD-CL${m.id.slice(-5)}`),
                        role: role === 'advocate' ? 'Advocate' : 'Client',
                        name: m.name || 'Anonymous',
                        email: m.email,
                        phone: m.phone || 'N/A',
                        location: m.location || 'N/A',
                        gender: m.gender || 'N/A',
                        verified: m.verified,
                        reported: m.reported || 0,
                        view: 0,
                        plan: m.plan || 'Free',
                        coins: m.coins || 0,
                        since: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A',
                        createdAt: m.createdAt,
                        status: m.status || 'Active',
                        image: m.avatar || '/avatar_placeholder.png',
                        idProofType: m.idProofType // Map this if available
                    };
                });
                setMembers(mapped);
            }
        } catch (err) {
            console.error("Error fetching members:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!initialMembers) {
            fetchMembers();
        }
    }, [initialMembers]);


    useEffect(() => {
        if (title === "Free Members") {
            setFilterCategory("Free");
        }
    }, [title]);

    const filteredMembers = members.filter((m) => {
        // Simple search (Name, Code, Phone, Email, UserID)
        const matchesSearch =
            (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.phone || "").includes(searchTerm) ||
            (m.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.id || "").toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === "All" || m.status === filterStatus;
        const matchesRole = activeRole === "All" || m.role === activeRole;
        const matchesGender = filterGender === "All" || m.gender === filterGender;

        // Reported Filter
        let matchesReported = true;
        if (filterReported !== "All") {
            const count = m.reported || 0;
            if (filterReported === "0") matchesReported = count === 0;
            else if (filterReported === "1-5") matchesReported = count >= 1 && count <= 5;
            else if (filterReported === "5+") matchesReported = count > 5;
        }

        const matchesIdProofType = filterIdProofType === "All" || (m.idProofType === filterIdProofType);

        // Verification Status
        const matchesVerified =
            filterVerified === "All" ||
            (filterVerified === "Verified" && m.verified) ||
            (filterVerified === "Unverified" && (!m.verified || m.verificationStatus === "Resubmitted")) ||
            (filterVerified === "Rejected" && m.verificationStatus === "Rejected") ||
            (filterVerified === "Resubmitted" && m.verificationStatus === "Resubmitted");

        // Plan/Package Filter
        let matchesPlan = true;
        if (filterCategory !== "All" || filterLevel !== "All") {
            const plan = (m.plan || "Free").toLowerCase();
            const normalizedPlan = plan.toLowerCase();

            const categoryMatch =
                filterCategory === "All" ||
                (filterCategory === "Free" && (normalizedPlan === "free" || normalizedPlan === "")) ||
                (filterCategory === "Pro Lite" && normalizedPlan.includes("lite")) ||
                (filterCategory === "Pro" && normalizedPlan.includes("pro") && !normalizedPlan.includes("lite") && !normalizedPlan.includes("ultra")) ||
                (filterCategory === "Ultra Pro" && normalizedPlan.includes("ultra"));

            const levelMatch = filterLevel === "All" || plan.includes(filterLevel.toLowerCase());
            matchesPlan = categoryMatch && levelMatch;
        }

        // Date Filter
        let matchesDate = true;
        if (filterRegDate !== "All" && m.createdAt) {
            const date = new Date(m.createdAt);
            const now = new Date();
            if (filterRegDate === "Today") {
                matchesDate = date.toDateString() === now.toDateString();
            } else if (filterRegDate === "Last 7 Days") {
                const weekAgo = new Date(now.setDate(now.getDate() - 7));
                matchesDate = date >= weekAgo;
            } else if (filterRegDate === "Last 30 Days") {
                const monthAgo = new Date(now.setDate(now.getDate() - 30));
                matchesDate = date >= monthAgo;
            }
        }

        // Location Filter
        const matchesLocation =
            (filterLocation.country === "All" || m.country === filterLocation.country) &&
            (filterLocation.state === "All" || m.state === filterLocation.state) &&
            (filterLocation.city === "All" || m.city === filterLocation.city) &&
            (filterLocation.pincode === "" || (m.pincode || "").includes(filterLocation.pincode));

        // Advocate-Only Filters
        let matchesAdv = true;
        if (activeRole === "Advocate") {
            matchesAdv =
                (advFilter.barCouncil === "" || (m.barCouncil || "").includes(advFilter.barCouncil)) &&
                (advFilter.experience === "All" || String(m.experience) === advFilter.experience) &&
                (advFilter.specialization === "All" || m.specialization === advFilter.specialization) &&
                (advFilter.courtType === "All" || m.courtType === advFilter.courtType) &&
                (advFilter.practiceArea === "All" || m.practiceArea === advFilter.practiceArea) &&
                (advFilter.officeCity === "" || (m.officeCity || "").toLowerCase().includes(advFilter.officeCity.toLowerCase()));
        }

        // Client-Only Filters
        let matchesClient = true;
        if (activeRole === "Client") {
            matchesClient =
                (clientFilter.caseType === "All" || m.caseType === clientFilter.caseType) &&
                (clientFilter.subscriptionType === "All" || m.subscriptionType === clientFilter.subscriptionType) &&
                (clientFilter.consultationMode === "All" || m.consultationMode === clientFilter.consultationMode) &&
                (clientFilter.preferredLanguage === "All" || m.preferredLanguage === clientFilter.preferredLanguage);
        }

        // Ultra Pro Filters
        let matchesUltra = true;
        if (filterCategory === "Ultra Pro") {
            matchesUltra = ultraFilter.supportType === "All" || m.supportType === ultraFilter.supportType;
        }

        // Context-Based Overrides
        let matchesContext = true;
        if (context === 'free') {
            matchesContext = (m.plan || 'Free').toLowerCase() === 'free';
        } else if (context === 'premium') {
            matchesContext = (m.plan || 'Free').toLowerCase() !== 'free';
        } else if (context === 'approved') {
            matchesContext = m.verified === true;
        } else if (context === 'pending') {
            matchesContext = !m.verified && m.status !== 'Blocked' && m.status !== 'Deactivated' && m.status !== 'Deleted';
        } else if (context === 'deactivated') {
            matchesContext = m.status === 'Deactivated';
        } else if (context === 'blocked') {
            matchesContext = m.status === 'Blocked';
        } else if (context === 'deleted') {
            matchesContext = m.status === 'Deleted';
        } else if (context === 'reported') {
            matchesContext = m.reported > 0;
        }

        return matchesSearch && matchesStatus && matchesRole && matchesPlan && matchesVerified &&
            matchesDate && matchesLocation && matchesAdv && matchesClient && matchesUltra &&
            matchesGender && matchesReported && matchesIdProofType && matchesContext;
    });

    const sortedMembers = [...filteredMembers].sort((a, b) => {
        if (sortBy === "a-z") return (a.name || "").localeCompare(b.name || "");
        if (sortBy === "z-a") return (b.name || "").localeCompare(a.name || "");
        if (sortBy === "oldest") return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        // Price sort is tricky as we don't have price field in Member, but we can mock it by package order
        if (sortBy === "low-high" || sortBy === "high-low") {
            const pkgs: Record<string, number> = { "Free": 0, "Pro Lite": 1, "Pro": 2, "Ultra Pro": 3 };
            const diff = pkgs[a.plan || "Free"] - pkgs[b.plan || "Free"];
            return sortBy === "low-high" ? diff : -diff;
        }
        return 0;
    });

    const handleExport = () => {
        const csv = [
            ["ID", "Code", "Name", "Phone", "Gender", "Plan", "Status", "Since"],
            ...filteredMembers.map(m => [m.id, m.code, m.name, m.phone, m.gender, m.plan, m.status, m.since])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImport = () => {
        alert("Import functionality would open a file picker and process CSV/Excel data.");
    };

    const handleDeleteMember = (id: string) => {
        setMembers(prev => prev.filter(m => m.id !== id));
    };

    const handleUpdateMemberStatus = (id: string, newStatus: MemberStatus) => {
        setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className={styles.spinner} />
                <p>Loading member data...</p>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <AdminPageHeader
                title={title}
                onSearch={(query, role) => {
                    setSearchTerm(query);
                    const mappedRole = role === 'advocate' ? 'Advocate' : role === 'client' ? 'Client' : 'All';
                    setActiveRole(mappedRole as any);
                }}
                onAddClick={(role) => {
                    if (role === 'advocate') openAdvocateReg();
                    else openClientReg();
                }}
                placeholder="Search by name, code or phone..."
            />

            <div className={styles.headerActionsSecondary}>
                {/* VERIFICATION STATUS & ACTIONS ROW (MATCHING IMAGE) */}
                <div className={styles.statusActionRow}>
                    <div className={styles.verificationFilters}>
                        <button
                            className={`${styles.filterBtn} ${filterVerified === 'All' ? styles.activeAll : ''}`}
                            onClick={() => setFilterVerified('All')}
                        >
                            All Members
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filterVerified === 'Verified' ? styles.activeVerified : ''}`}
                            onClick={() => setFilterVerified('Verified')}
                        >
                            <ShieldCheck size={16} /> Verified
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filterVerified === 'Unverified' ? styles.activeUnverified : ''}`}
                            onClick={() => setFilterVerified('Unverified')}
                        >
                            <ShieldAlert size={16} /> Unverified
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filterVerified === 'Rejected' ? styles.activeRejected : ''}`}
                            onClick={() => setFilterVerified('Rejected')}
                        >
                            <XCircle size={16} /> Rejected
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filterVerified === 'Resubmitted' ? styles.activeResubmitted : ''}`}
                            onClick={() => setFilterVerified('Resubmitted')}
                        >
                            <RefreshCw size={16} /> Resubmitted
                        </button>
                    </div>

                    <div className={styles.actionGridRowMini}>
                        {selectedIds.length > 0 && (
                            <button className={styles.deleteBtnBulkMini} onClick={handleBulkDelete}>
                                Delete ({selectedIds.length})
                            </button>
                        )}
                        <button className={styles.miniGridBtn} onClick={handleImport}>
                            <Upload size={14} /> <span>Import</span>
                        </button>
                        <button className={styles.miniGridBtn} onClick={handleExport}>
                            <Download size={14} /> <span>Export</span>
                        </button>
                        <button className={`${styles.miniGridBtn} ${styles.greenBtn}`} onClick={() => setIsBulkAddOpen(true)}>
                            <Users size={14} />
                            <span>Bulk Add</span>
                        </button>
                        <button
                            className={`${styles.miniGridBtn} ${styles.resetBtnMini}`}
                            onClick={() => {
                                setSearchTerm("");
                                setFilterStatus(defaultStatus || "All");
                                setFilterCategory("All");
                                setFilterLevel("All");
                                setActiveRole("All");
                                setFilterVerified("All");
                                setFilterRegDate("All");
                                setFilterLocation({ country: "All", state: "All", city: "All", pincode: "" });
                                setSortBy("newest");
                                setFilterGender("All");
                                setFilterReported("All");
                                setFilterIdProofType("All");
                                setAdvFilter({ barCouncil: "", experience: "All", specialization: "All", courtType: "All", practiceArea: "All", officeCity: "" });
                                setClientFilter({ caseType: "All", subscriptionType: "All", consultationMode: "All", preferredLanguage: "All" });
                                setUltraFilter({ supportType: "All" });
                            }}
                        >
                            <RotateCcw size={14} />
                            <span>Reset All</span>
                        </button>
                    </div>
                </div>

                {/* SELECTABLE BLOCKS FOR PACKAGES (PREVIOUS STYLE RESTORED) */}
                {title !== "Free Members" && (
                    <div className={styles.packageBlockFilters}>
                        {[
                            { name: 'Free', sub: 'Basic Access', levels: [] },
                            { name: 'Pro Lite', sub: 'Standard Premium', levels: ['Silver', 'Gold', 'Platinum'] },
                            { name: 'Pro', sub: 'Advanced Features', levels: ['Silver', 'Gold', 'Platinum'] },
                            { name: 'Ultra Pro', sub: 'Executive Support', levels: ['Silver', 'Gold', 'Platinum'] }
                        ].filter(pkg => !(context === 'premium' && pkg.name === 'Free')).map(pkg => (
                            <div key={pkg.name} className={`${styles.packageBlock} ${filterCategory === pkg.name ? styles.active : ''}`}>
                                <div
                                    className={styles.blockTitle}
                                    onClick={() => {
                                        setFilterCategory(pkg.name);
                                        setFilterLevel('All');
                                    }}
                                >
                                    {pkg.name}
                                    <div className={styles.blockSub}>{pkg.sub}</div>
                                </div>
                                {pkg.levels.length > 0 && (
                                    <div className={styles.levelGrid}>
                                        {pkg.levels.map(lvl => (
                                            <button
                                                key={lvl}
                                                className={`${styles.levelMiniBtn} ${filterCategory === pkg.name && filterLevel === lvl ? styles.active : ''}`}
                                                onClick={() => {
                                                    setFilterCategory(pkg.name);
                                                    setFilterLevel(lvl);
                                                }}
                                            >
                                                {lvl.split(' ')[0]}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* UNIFIED FILTER GRID (COMPACT) */}
                <div className={styles.unifiedFilterGrid}>
                    <div className={styles.chipSection}>
                        <label>Sort By</label>
                        <div className={styles.chipGroup}>
                            {[
                                { id: 'newest', label: 'Newest' },
                                { id: 'oldest', label: 'Oldest' },
                                { id: 'a-z', label: 'A-Z' },
                                { id: 'z-a', label: 'Z-A' },
                                { id: 'low-high', label: 'Price ↑' },
                                { id: 'high-low', label: 'Price ↓' }
                            ].map(s => (
                                <button key={s.id} className={`${styles.chip} ${sortBy === s.id ? styles.active : ''}`} onClick={() => setSortBy(s.id)}>{s.label}</button>
                            ))}
                        </div>
                    </div>

                    {(!defaultStatus || defaultStatus === "All") && (
                        <div className={styles.chipSection}>
                            <label>Account Status</label>
                            <div className={styles.chipGroup}>
                                {['All', 'Active', 'Pending', 'Blocked', 'Reported'].map(s => (
                                    <button key={s} className={`${styles.chip} ${filterStatus === s ? styles.active : ''}`} onClick={() => setFilterStatus(s)}>{s === 'Active' ? 'Approved' : s}</button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.chipSection}>
                        <label>Reg. Period</label>
                        <div className={styles.chipGroup}>
                            {['All', 'Today', 'Last 7 Days', 'Last 30 Days'].map(d => (
                                <button key={d} className={`${styles.chip} ${filterRegDate === d ? styles.active : ''}`} onClick={() => setFilterRegDate(d)}>{d === 'All' ? 'All Time' : d.replace('Last ', '')}</button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.chipSection}>
                        <label>Gender</label>
                        <div className={styles.chipGroup}>
                            {['All', 'Male', 'Female', 'Other'].map(g => (
                                <button key={g} className={`${styles.chip} ${filterGender === g ? styles.active : ''}`} onClick={() => setFilterGender(g)}>{g}</button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.chipSection}>
                        <label>Reports</label>
                        <div className={styles.chipGroup}>
                            {['All', '0', '1-5', '5+'].map(r => (
                                <button key={r} className={`${styles.chip} ${filterReported === r ? styles.active : ''}`} onClick={() => setFilterReported(r)}>{r === 'All' ? 'Any' : r}</button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.chipSection}>
                        <label>ID Proof Type</label>
                        <div className={styles.chipGroup}>
                            {['All', 'Aadhar', 'PAN', 'Passport', 'Voter ID'].map(t => (
                                <button key={t} className={`${styles.chip} ${filterIdProofType === t ? styles.active : ''}`} onClick={() => setFilterIdProofType(t)}>{t}</button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.chipSectionWide}>
                        <label>Location Details</label>
                        <div className={styles.inputComboCompact}>
                            <select value={filterLocation.country} onChange={(e) => setFilterLocation({ ...filterLocation, country: e.target.value })}>
                                <option value="All">All Countries</option>
                                <option value="India">India</option>
                                <option value="USA">USA</option>
                            </select>
                            <input placeholder="State" value={filterLocation.state !== 'All' ? filterLocation.state : ''} onChange={(e) => setFilterLocation({ ...filterLocation, state: e.target.value || 'All' })} />
                            <input placeholder="City" value={filterLocation.city !== 'All' ? filterLocation.city : ''} onChange={(e) => setFilterLocation({ ...filterLocation, city: e.target.value || 'All' })} />
                            <input placeholder="Pincode" value={filterLocation.pincode} onChange={(e) => setFilterLocation({ ...filterLocation, pincode: e.target.value })} />
                        </div>
                    </div>
                </div>

                {/* SPECIALIZED FILTERS (CHIP STYLE) */}
                {(activeRole === "Advocate" || activeRole === "Client" || filterCategory === "Ultra Pro") && (
                    <div className={styles.specialChipRow}>
                        {activeRole === "Advocate" && (
                            <>
                                <div className={styles.chipSection}>
                                    <label>Experience</label>
                                    <div className={styles.chipGroup}>
                                        {['All', '1', '5', '10', '20'].map(e => (
                                            <button key={e} className={`${styles.miniChip} ${advFilter.experience === e ? styles.active : ''}`} onClick={() => setAdvFilter({ ...advFilter, experience: e })}>{e === 'All' ? 'Any' : `${e}+ Yr`}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.chipSection}>
                                    <label>Court Type</label>
                                    <div className={styles.chipGroup}>
                                        {['All', 'Supreme', 'High', 'District'].map(c => (
                                            <button key={c} className={`${styles.miniChip} ${advFilter.courtType === c ? styles.active : ''}`} onClick={() => setAdvFilter({ ...advFilter, courtType: c })}>{c}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.chipSection}>
                                    <label>Specialization</label>
                                    <div className={styles.chipGroup}>
                                        {['All', 'Criminal', 'Civil', 'Corporate', 'Family'].map(s => (
                                            <button key={s} className={`${styles.miniChip} ${advFilter.specialization === s ? styles.active : ''}`} onClick={() => setAdvFilter({ ...advFilter, specialization: s })}>{s}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.chipSection}>
                                    <label>Advocate Details</label>
                                    <div className={styles.inputCombo}>
                                        <input placeholder="Bar ID..." value={advFilter.barCouncil} onChange={(e) => setAdvFilter({ ...advFilter, barCouncil: e.target.value })} />
                                        <input placeholder="City..." value={advFilter.officeCity} onChange={(e) => setAdvFilter({ ...advFilter, officeCity: e.target.value })} />
                                    </div>
                                </div>
                            </>
                        )}
                        {activeRole === "Client" && (
                            <>
                                <div className={styles.chipSection}>
                                    <label>Case Type</label>
                                    <div className={styles.chipGroup}>
                                        {['All', 'Civil', 'Criminal', 'Corporate'].map(c => (
                                            <button key={c} className={`${styles.miniChip} ${clientFilter.caseType === c ? styles.active : ''}`} onClick={() => setClientFilter({ ...clientFilter, caseType: c })}>{c}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.chipSection}>
                                    <label>Cons. Mode</label>
                                    <div className={styles.chipGroup}>
                                        {['All', 'Online', 'Offline'].map(m => (
                                            <button key={m} className={`${styles.miniChip} ${clientFilter.consultationMode === m ? styles.active : ''}`} onClick={() => setClientFilter({ ...clientFilter, consultationMode: m })}>{m}</button>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.chipSection}>
                                    <label>Language</label>
                                    <div className={styles.chipGroup}>
                                        {['All', 'English', 'Hindi', 'Spanish'].map(l => (
                                            <button key={l} className={`${styles.miniChip} ${clientFilter.preferredLanguage === l ? styles.active : ''}`} onClick={() => setClientFilter({ ...clientFilter, preferredLanguage: l })}>{l}</button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                        {filterCategory === "Ultra Pro" && (
                            <div className={styles.chipSection}>
                                <label>Premium Support</label>
                                <div className={styles.chipGroup}>
                                    {['All', 'Chat', 'Call', 'Agent'].map(s => (
                                        <button key={s} className={`${styles.miniChip} ${ultraFilter.supportType === s ? styles.active : ''}`} onClick={() => setUltraFilter({ supportType: s })}>{s === 'All' ? 'All' : `${s} Tier`}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === sortedMembers.length && sortedMembers.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>Name / ID</th>
                            <th>Email / Phone</th>
                            <th>Location</th>
                            <th>Gender</th>
                            <th>Verification Status</th>
                            <th>Reported</th>
                            <th>Plan/Subplan</th>
                            {context !== 'free' && <th>Price</th>}
                            <th>Since</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sortedMembers.map((m) => (
                            <tr key={m.id} className={selectedIds.includes(m.id) ? styles.selectedRow : ""}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(m.id)}
                                        onChange={() => toggleSelect(m.id)}
                                    />
                                </td>
                                <td>
                                    <div className={styles.nameCell}>
                                        <img src={m.image} alt={m.name} className={styles.avatar} />
                                        <div>
                                            <strong>{m.name}</strong>
                                            <div className={styles.idCode}>{m.code}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.mailPhone}>
                                        <div>{m.email || "N/A"}</div>
                                        <div className={styles.phone}>{m.phone}</div>
                                    </div>
                                </td>
                                <td>
                                    {typeof m.location === 'object' && m.location !== null
                                        ? Object.values(m.location).filter(v => v && typeof v !== 'object').join(", ")
                                        : (m.location || "N/A")
                                    }
                                </td>
                                <td>{m.gender}</td>
                                <td>
                                    {m.verified ? (
                                        <button
                                            className={styles.viewActionBtn}
                                            onClick={() => handleAction(m, 'verify')}
                                        >
                                            View Details
                                        </button>
                                    ) : (
                                        <button
                                            className={styles.verifyActionBtn}
                                            onClick={() => handleAction(m, 'verify')}
                                        >
                                            Verify Member
                                        </button>
                                    )}
                                </td>
                                <td>{m.reported}</td>

                                <td>
                                    <div className={styles.planCell}>
                                        {(() => {
                                            const p = m.plan || "Free";
                                            if (p === "Free" || p === "") return <span className={styles.standardPlan}>Free</span>;

                                            const isPremium = p.toLowerCase().includes("pro") || p.toLowerCase().includes("ultra");

                                            return (
                                                <div className={isPremium ? styles.premiumPlan : styles.standardPlan}>
                                                    {p}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </td>

                                {context !== 'free' && (
                                    <td>
                                        {(() => {
                                            const plan = m.plan || "Free";
                                            const isFree = plan.toLowerCase() === "free" || plan === "";

                                            if (isFree) {
                                                return <span className={styles.freePrice}>₹0</span>;
                                            }

                                            try {
                                                const features = getFeaturesFromPlan(plan);
                                                const price = features.price;

                                                return (
                                                    <div className={styles.priceCell}>
                                                        <span className={styles.priceAmount}>₹{price.toLocaleString('en-IN')}</span>
                                                    </div>
                                                );
                                            } catch (err) {
                                                return <span className={styles.priceError}>N/A</span>;
                                            }
                                        })()}
                                    </td>
                                )}
                                <td>{m.since}</td>

                                <td>
                                    <span className={`${styles.statusBadge} ${styles[m.status.toLowerCase()]}`}>
                                        {m.status}
                                    </span>
                                </td>
                                <td>
                                    <MemberActions
                                        member={m}
                                        onDelete={handleDeleteMember}
                                        onStatusUpdate={handleUpdateMemberStatus}
                                        onView={(m) => handleAction(m, 'view')}
                                        onEdit={(m) => handleAction(m, 'edit')}
                                        onVerify={(m) => handleAction(m, 'verify')}
                                        onPackage={(m) => handleAction(m, 'package')}
                                        onWallet={(m) => handleAction(m, 'wallet')}
                                        onImpersonate={handleImpersonate}
                                        context={context}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sortedMembers.length === 0 && (
                    <div className={styles.noData}>No members found matching your criteria.</div>
                )}
            </div>

            {
                selectedMember && activeModal === 'view' && (
                    <MemberDetailModal member={selectedMember} onClose={() => setActiveModal(null)} />
                )
            }
            {
                selectedMember && activeModal === 'edit' && (
                    <MemberEditModal
                        member={selectedMember}
                        onClose={() => setActiveModal(null)}
                        onSave={(updated) => {
                            setMembers(prev => prev.map(m => m.id === updated.id ? {
                                ...m,
                                ...updated,
                                role: updated.role === 'Advocate' ? 'Advocate' : 'Client'
                            } : m));
                            setActiveModal(null);
                        }}
                    />
                )
            }
            {
                selectedMember && activeModal === 'verify' && (
                    <MemberVerificationModal
                        member={selectedMember}
                        onClose={() => setActiveModal(null)}
                        isActionLoading={isActionLoading}
                        onVerify={async (id, status, remarks) => {
                            setIsActionLoading(true);
                            try {
                                const res = await axios.patch(`/api/admin/members/${id}/verify`, {
                                    verified: status,
                                    remarks: remarks || ""
                                });
                                if (res.data.success) {
                                    await fetchMembers(); // Refresh full list from server
                                    setActiveModal(null);
                                }
                            } catch (err) {
                                alert("Error updating verification status");
                            } finally {
                                setIsActionLoading(false);
                            }
                        }}
                    />
                )
            }
            {
                selectedMember && activeModal === 'package' && (
                    <MemberPackageModal
                        member={selectedMember}
                        onClose={() => setActiveModal(null)}
                        onUpdatePlan={async (id, newPlan) => {
                            try {
                                const res = await axios.patch(`/api/admin/members/${id}/package`, { plan: newPlan });
                                if (res.data.success) {
                                    setMembers(prev => prev.map(m => m.id === id ? { ...m, plan: newPlan } : m));
                                    setActiveModal(null);
                                }
                            } catch (err) {
                                alert("Error updating plan");
                            }
                        }}
                    />
                )
            }
            {
                selectedMember && activeModal === 'wallet' && (
                    <MemberWalletModal
                        member={selectedMember}
                        onClose={() => setActiveModal(null)}
                        onUpdateBalance={async (id, amount, type) => {
                            try {
                                const res = await axios.patch(`/api/admin/members/${id}/wallet`, { amount, type });
                                if (res.data.success) {
                                    alert(`${type === 'add' ? 'Added' : 'Deducted'} ${amount} coins successfully`);
                                    setMembers(prev => prev.map(m => {
                                        if (m.id === id) {
                                            const newCoins = type === 'add' ? (m.coins + amount) : Math.max(0, m.coins - amount);
                                            return { ...m, coins: newCoins };
                                        }
                                        return m;
                                    }));
                                    setActiveModal(null);
                                }
                            } catch (err) {
                                alert("Error updating wallet balance");
                            }
                        }}
                    />
                )
            }

            {
                isBulkAddOpen && (
                    <BulkAddModal
                        onClose={() => setIsBulkAddOpen(false)}
                        onSuccess={(newMembers: Member[]) => {
                            setMembers(prev => [...newMembers, ...prev]);
                            setIsBulkAddOpen(false);
                        }}
                    />
                )
            }
        </div >
    );
};

export default MemberTable;







