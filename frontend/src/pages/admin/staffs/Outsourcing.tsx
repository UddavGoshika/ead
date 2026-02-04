import React, { useState, useMemo } from "react";
import styles from "./Outsourcing.module.css";
import {
    Shield, Headphones, Search, Mail, Phone,
    MoreVertical, FileText, BarChart3,
    Layers, Plus, Star, Info, X, Globe, ShieldCheck,
    Mic, MousePointer2, UserCheck, Briefcase, FileSpreadsheet, Download, CheckCircle, AlertCircle, Calendar
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { adminService } from "../../../services/api";
import { useEffect } from "react";

type StaffStatus = "Active" | "Inactive" | "Suspended";
type AssetCategory = "vendor" | "strategic";

interface OutsourcedStaff {
    id: string;
    staffId: string;
    vendor: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
    level: string;
    status: StaffStatus;
    joinedDate: string;
    lastActive: string;
    solvedCases: number;
    pendingCases: number;
    successRate: string;
    grossAmount: string;
    netAmount: string;
    currentProject?: string;
}

interface AssetGroup {
    id: string;
    name: string;
    icon: LucideIcon;
    count: number;
    color: string;
    category: AssetCategory;
}

// MOCK DATA FOR REPORTING VIEW
interface ReportItem {
    id: string;
    period: string;
    dateRange: string;
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
    deliverables: string;
    efficiency: string;
    status: 'Verified' | 'Pending Review' | 'Flagged';
    file: string;
    detailedData: {
        // Lead Details
        date: string;
        source: string;
        assignedBPO: string;
        // Client Info
        clientName: string;
        clientMobile: string;
        clientCity: string;
        // Legal Requirement
        category: string;
        problem: string;
        // Lead Quality
        qualityGenuine: string;
        qualityUrgency: string;
        qualityBudgetLine: string;
        // Advocate Mapping
        advocateType: string;
        advocateStatus: string; // Assigned / Pending
        // Lead Status
        leadStatus: string; // New / Qualified / Converted / Closed
    }[];
}

const MOCK_REPORTS: ReportItem[] = [
    // WEEKLY REPORTS
    {
        id: "1", period: "Week 06 - 2024", dateRange: "Feb 05 - Feb 11", frequency: "weekly",
        deliverables: "850 Calls, 42 Leads Generated", efficiency: "94%", status: "Verified", file: "Week06_Report.xlsx",
        detailedData: [
            {
                date: "Feb 11", source: "Facebook Ads", assignedBPO: "Tele-Connect",
                clientName: "Rajesh Kumar", clientMobile: "+91 9876543210", clientCity: "Hyderabad",
                category: "Property Dispute", problem: "Ancestral land encroachment by neighbors.",
                qualityGenuine: "Verified", qualityUrgency: "High", qualityBudgetLine: "50k - 1L",
                advocateType: "Civil Defense", advocateStatus: "Assigned",
                leadStatus: "Converted"
            },
            {
                date: "Feb 10", source: "Google Search", assignedBPO: "Tele-Connect",
                clientName: "Priya Sharma", clientMobile: "+91 9876543211", clientCity: "Bangalore",
                category: "Divorce", problem: "Mutual consent divorce with child custody.",
                qualityGenuine: "Verified", qualityUrgency: "Medium", qualityBudgetLine: "30k - 50k",
                advocateType: "Family Law", advocateStatus: "Pending",
                leadStatus: "Qualified"
            }
        ]
    },
    {
        id: "2", period: "Week 05 - 2024", dateRange: "Jan 29 - Feb 04", frequency: "weekly",
        deliverables: "810 Calls, 38 Leads Generated", efficiency: "92%", status: "Verified", file: "Week05_Report.xlsx",
        detailedData: [
            {
                date: "Feb 04", source: "Direct Call", assignedBPO: "Hub-Staffing",
                clientName: "Siddharth Jain", clientMobile: "+91 9876543220", clientCity: "Delhi",
                category: "Criminal", problem: "Bail application for relative in fraud case.",
                qualityGenuine: "Verified", qualityUrgency: "Critical", qualityBudgetLine: "1L+",
                advocateType: "Criminal Defense", advocateStatus: "Assigned",
                leadStatus: "Converted"
            }
        ]
    },
    { id: "3", period: "Week 04 - 2024", dateRange: "Jan 22 - Jan 28", frequency: "weekly", deliverables: "790 Calls, 35 Leads Generated", efficiency: "90%", status: "Verified", file: "Week04_Report.xlsx", detailedData: [] },
    { id: "4", period: "Sprint 3 - 2024", dateRange: "Jan 29 - Feb 11", frequency: "biweekly", deliverables: "Sprint Target Met, 80 Leads", efficiency: "95%", status: "Verified", file: "Sprint3_Review.pdf", detailedData: [] },
    { id: "5", period: "Sprint 2 - 2024", dateRange: "Jan 15 - Jan 28", frequency: "biweekly", deliverables: "Sprint Target Missed (92%)", efficiency: "88%", status: "Flagged", file: "Sprint2_Review.pdf", detailedData: [] },
    { id: "6", period: "January 2024", dateRange: "Jan 01 - Jan 31", frequency: "monthly", deliverables: "3,200 Calls, 150 Conversions", efficiency: "93%", status: "Verified", file: "Jan24_Summary.pdf", detailedData: [] },
    { id: "7", period: "December 2023", dateRange: "Dec 01 - Dec 31", frequency: "monthly", deliverables: "2,900 Calls, 142 Conversions", efficiency: "91%", status: "Verified", file: "Dec23_Summary.pdf", detailedData: [] },
    { id: "8", period: "Q4 2023", dateRange: "Oct 01 - Dec 31", frequency: "quarterly", deliverables: "Q4 Targets Exceeded by 15%", efficiency: "96%", status: "Verified", file: "Q4_2023_Analysis.pptx", detailedData: [] },
];

const MOCK_PROJECTS = [
    "Global Tech Support",
    "Fintech Lead Gen Campaign",
    "Medical Data Entry Q1",
    "Legal Compliance Audit",
    "E-commerce Customer Care"
];

const INITIAL_ASSET_GROUPS: AssetGroup[] = [
    { id: "all", name: "All Assets", icon: Layers, count: 45, color: "#10b981", category: "vendor" },
    { id: "bpo", name: "BPO Shared Desk", icon: Headphones, count: 25, color: "#3b82f6", category: "vendor" },
    { id: "data", name: "External Data Entry", icon: MousePointer2, count: 12, color: "#6366f1", category: "vendor" },
    { id: "voice", name: "Voice Operations", icon: Mic, count: 8, color: "#f59e0b", category: "vendor" },
    { id: "legal", name: "Legal Auditors", icon: Shield, count: 4, color: "#ef4444", category: "strategic" },
    { id: "consult", name: "Strategic Consultants", icon: Briefcase, count: 6, color: "#8b5cf6", category: "strategic" },
    { id: "vet", name: "Vetting Specialists", icon: UserCheck, count: 5, color: "#ec4899", category: "strategic" },
];

const MOCK_OUTSOURCED: OutsourcedStaff[] = [
    {
        id: "1", staffId: "VND-2001", vendor: "Elite Global BPO", name: "Jessica Miller",
        email: "jessica.m@elitebpo.com", mobile: "+1 202 555 0123", role: "BPO Shared Desk",
        level: "Senior", status: "Active", joinedDate: "2023-11-15", lastActive: "Now",
        solvedCases: 1250, pendingCases: 34, successRate: "96%", grossAmount: "₹45,000", netAmount: "₹38,000",
        currentProject: "Fintech Lead Gen Campaign"
    },
    {
        id: "2", staffId: "VND-2005", vendor: "Support Desk Inc", name: "Mark Anthony",
        email: "mark.a@supportdesk.in", mobile: "+91 99887 76655", role: "Voice Operations",
        level: "L3", status: "Active", joinedDate: "2023-12-01", lastActive: "15 mins ago",
        solvedCases: 890, pendingCases: 12, successRate: "94%", grossAmount: "₹32,000", netAmount: "₹28,500",
        currentProject: "Global Tech Support"
    },
    {
        id: "3", staffId: "CONS-401", vendor: "Independent", name: "Dr. Sarah Chen",
        email: "sarah.c@consultant.io", mobile: "+1 415 555 9876", role: "Strategic Consultants",
        level: "Partner", status: "Active", joinedDate: "2024-01-10", lastActive: "2 hours ago",
        solvedCases: 45, pendingCases: 2, successRate: "99%", grossAmount: "₹2,50,000", netAmount: "₹2,25,000"
    }
];

const Outsourcing: React.FC = () => {
    const [assetGroups] = useState<AssetGroup[]>(INITIAL_ASSET_GROUPS);
    const [selectedAssetId, setSelectedAssetId] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Feature State
    const [staffForAllocation, setStaffForAllocation] = useState<OutsourcedStaff | null>(null);
    const [staffForReports, setStaffForReports] = useState<OutsourcedStaff | null>(null);
    const [selectedProject, setSelectedProject] = useState("");
    const [reportFilter, setReportFilter] = useState("weekly"); // weekly, biweekly, monthly, quarterly
    const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

    // Backend derived State
    const [outsourcedStaff, setOutsourcedStaff] = useState<OutsourcedStaff[]>([]);
    const [reportsData, setReportsData] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Onboarding Form State
    const [onboardForm, setOnboardForm] = useState({
        fullName: "",
        vendor: "",
        email: "",
        role: "Global BPO Desk",
        domain: "",
        loginId: "",
        password: ""
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await adminService.getStaff();
            if (data.success) {
                const mapped = data.staff.map((s: any) => ({
                    id: s.id,
                    staffId: s.profile.staffId || `STF-${s.id.slice(-4)}`,
                    vendor: s.profile.vendor || 'N/A',
                    name: s.profile.fullName || s.email.split('@')[0],
                    email: s.email,
                    mobile: s.profile.mobile || 'N/A',
                    role: s.role,
                    level: s.profile.level || 'Junior',
                    status: (s.status === 'Active' ? 'Active' : s.status === 'Blocked' ? 'Suspended' : 'Inactive') as StaffStatus,
                    joinedDate: new Date(s.profile.joinedDate || s.createdAt).toLocaleDateString(),
                    lastActive: 'Now',
                    solvedCases: s.profile.solvedCases || 0,
                    pendingCases: s.profile.pendingCases || 0,
                    successRate: s.profile.successRate || '0%',
                    grossAmount: `₹${(s.profile.grossAmount || 0).toLocaleString()}`,
                    netAmount: `₹${(s.profile.netAmount || 0).toLocaleString()}`,
                    currentProject: s.profile.currentProject
                }));
                setOutsourcedStaff(mapped);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleFetchReports = async (staff: OutsourcedStaff) => {
        try {
            const { data } = await adminService.getStaffReports(staff.id);
            if (data.success) {
                const mappedReports = await Promise.all(data.reports.map(async (r: any) => {
                    const leadsRes = await adminService.getReportLeads(r._id);
                    return {
                        id: r._id,
                        period: r.period,
                        dateRange: r.dateRange,
                        frequency: r.frequency,
                        deliverables: r.deliverables,
                        efficiency: r.efficiency,
                        status: r.status,
                        file: r.fileUrl,
                        detailedData: leadsRes.data.success ? leadsRes.data.leads.map((l: any) => ({
                            date: new Date(l.date).toLocaleDateString(),
                            source: l.source,
                            assignedBPO: l.assignedBPO,
                            clientName: l.clientName,
                            clientMobile: l.clientMobile,
                            clientCity: l.clientCity,
                            category: l.category,
                            problem: l.problem,
                            qualityGenuine: l.qualityGenuine,
                            qualityUrgency: l.qualityUrgency,
                            qualityBudgetLine: l.qualityBudgetLine,
                            advocateType: l.advocateType,
                            advocateStatus: l.advocateStatus,
                            leadStatus: l.leadStatus
                        })) : []
                    };
                }));
                setReportsData(mappedReports.length > 0 ? mappedReports : MOCK_REPORTS);
                setStaffForReports(staff);
            }
        } catch (err) {
            console.error("Reports fetch error:", err);
            setReportsData(MOCK_REPORTS);
            setStaffForReports(staff);
        }
    };

    const handleOnboard = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await adminService.onboardStaff({
                email: onboardForm.email,
                fullName: onboardForm.fullName,
                loginId: onboardForm.loginId || `STF-${Math.floor(Math.random() * 9000) + 1000}`,
                tempPassword: onboardForm.password || "Staff@123",
                role: 'SUPPORT',
                department: 'Customer Service',
                vendor: onboardForm.vendor,
                level: 'Junior'
            });

            if (res.data.success) {
                alert("Staff member authorized successfully!");
                setIsAddModalOpen(false);
                fetchData();
            }
        } catch (err: any) {
            alert(err.response?.data?.error || "Error onboarding staff");
        }
    };

    const handleAllocateSaveLocal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!staffForAllocation) return;
        try {
            const res = await adminService.allocateProject(staffForAllocation.id, selectedProject);
            if (res.data.success) {
                alert(`Project ${selectedProject} allocated to ${staffForAllocation.name}`);
                setStaffForAllocation(null);
                fetchData();
            }
        } catch (err) {
            alert("Error allocating project");
        }
    };

    const activeGroup = useMemo(() =>
        assetGroups.find(g => g.id === selectedAssetId),
        [selectedAssetId, assetGroups]);

    const filteredStaff = useMemo(() => {
        return outsourcedStaff.filter(staff => {
            const matchesSearch =
                staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staff.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staff.vendor.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole =
                selectedAssetId === "all" ||
                staff.role.toLowerCase() === activeGroup?.name.toLowerCase();

            return matchesSearch && matchesRole;
        });
    }, [searchTerm, selectedAssetId, activeGroup, outsourcedStaff]);

    const filteredReports = useMemo(() => {
        return reportsData.filter(i => i.frequency === reportFilter);
    }, [reportFilter, reportsData]);

    // handleAllocateSave removed (using handleAllocateSaveLocal defined earlier)

    const handleDownloadReport = (filename: string) => {
        const mockContent = "ReportID,Period,Deliverables,Efficiency\n...";
        const blob = new Blob([mockContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Operational Outsourcing Hub</h1>
                    <p>Orchestrate external vendors and strategic consulting assets.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.exportBtn} onClick={() => alert("Vendor audit export started...")}>
                        <FileText size={18} /> Export Performance
                    </button>
                    <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} /> Add Strategic Asset
                    </button>
                </div>
            </header>

            {/* VENDOR GROUPS */}
            <div className={styles.roleGridSection}>
                <div className={styles.sectionLabel}>
                    <Globe size={14} /> Global Vendor Platforms
                </div>
                <div className={styles.grid}>
                    {assetGroups.filter(r => r.category === "vendor").map(role => (
                        <div
                            key={role.id}
                            className={`${styles.roleCard} ${selectedAssetId === role.id ? styles.activeCard : ""}`}
                            onClick={() => setSelectedAssetId(role.id)}
                            style={{ "--brand-color": role.color } as any}
                        >
                            <div className={styles.cardIcon}>
                                <role.icon size={22} />
                            </div>
                            <div className={styles.cardInfo}>
                                <span className={styles.roleName}>{role.name}</span>
                                <span className={styles.statValue}>
                                    {role.id === "all" ? outsourcedStaff.length : outsourcedStaff.filter(s => s.role.toLowerCase() === role.name.toLowerCase() || (role.id === 'bpo' && s.role === 'SUPPORT')).length}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* STRATEGIC PARTNERS */}
            <div className={styles.roleGridSection}>
                <div className={`${styles.sectionLabel} ${styles.premium}`}>
                    <Star size={14} /> Strategic Consulting Assets
                </div>
                <div className={styles.grid}>
                    {assetGroups.filter(r => r.category === "strategic").map(role => (
                        <div
                            key={role.id}
                            className={`${styles.roleCard} ${selectedAssetId === role.id ? styles.activeCard : ""}`}
                            onClick={() => setSelectedAssetId(role.id)}
                            style={{ "--brand-color": role.color } as any}
                        >
                            <div className={styles.cardIcon}>
                                <role.icon size={22} />
                            </div>
                            <div className={styles.cardInfo}>
                                <span className={styles.roleName}>{role.name}</span>
                                <span className={styles.statValue}>
                                    {outsourcedStaff.filter(s => s.role.toLowerCase() === role.name.toLowerCase()).length}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* DATA SECTION */}
            <div className={styles.dataCard}>
                <div className={styles.dataHeader}>
                    <div className={styles.dataTitle}>
                        <h2>{activeGroup?.name} Directory</h2>
                        <span className={styles.countBadge}>{filteredStaff.length} External Personnel Active</span>
                    </div>
                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Identify vendor asset or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Personnel Identity</th>
                                <th>Allocated Project</th>
                                <th>Vendor / Channel</th>
                                <th>Performance</th>
                                <th>Gross Settlement</th>
                                <th>Net Rec.</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStaff.map((staff, index) => (
                                <tr key={staff.id}>
                                    <td><span className={styles.secondaryText}>{index + 1}</span></td>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatar} style={{ background: "linear-gradient(135deg, #10b981, #0ea5e9)" }}>
                                                {staff.name.charAt(0)}
                                            </div>
                                            <div className={styles.stacked}>
                                                <span className={styles.primaryText}>{staff.name}</span>
                                                <span className={styles.idText}>{staff.staffId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {staff.currentProject ? (
                                            <span className={styles.projectBadge}>{staff.currentProject}</span>
                                        ) : (
                                            <span style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}>Unassigned</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.contactInfo}>
                                            <span className={styles.vendorBox} style={{ color: "#0ea5e9", fontWeight: 800 }}>
                                                {staff.vendor}
                                            </span>
                                            <span className={styles.infoRow}>{staff.role}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.analyticsCell}>
                                            <span className={styles.solvedText}>{staff.solvedCases} Solved</span>
                                            <div className={styles.successRateBox} style={{ marginTop: '4px' }}>
                                                <BarChart3 size={12} /> {staff.successRate}
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={styles.grossText}>{staff.grossAmount}</span></td>
                                    <td><span className={styles.netText}>{staff.netAmount}</span></td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[staff.status.toLowerCase()]}`}>
                                            {staff.status}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button className={styles.dots} onClick={() => setOpenMenu(openMenu === staff.id ? null : staff.id)}>
                                            <MoreVertical size={16} />
                                        </button>
                                        {openMenu === staff.id && (
                                            <div className={styles.menu}>
                                                <button onClick={() => { setStaffForAllocation(staff); setOpenMenu(null); }}>
                                                    <Briefcase size={14} /> Allocate Project
                                                </button>
                                                <button onClick={() => { handleFetchReports(staff); setOpenMenu(null); }}>
                                                    <FileSpreadsheet size={14} /> Performance Reports
                                                </button>
                                                <button onClick={() => alert("Vendor audit")}><Info size={14} /> Audit Log</button>
                                                <button className={styles.deleteBtn} onClick={() => alert("Termination access")}><X size={14} /> Terminate</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* PROJECT ALLOCATION MODAL */}
            {staffForAllocation && (
                <div className={styles.modalOverlay} onClick={() => setStaffForAllocation(null)}>
                    <div className={styles.modalContent} style={{ width: '500px', height: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Allocate Project</h2>
                            <button className={styles.closeBtn} onClick={() => setStaffForAllocation(null)}>&times;</button>
                        </div>
                        <form className={styles.registrationForm} onSubmit={handleAllocateSaveLocal}>
                            <p style={{ color: '#94a3b8', marginBottom: '24px' }}>
                                Assign a dedicated campaign or project to <strong style={{ color: '#fff' }}>{staffForAllocation.name}</strong>.
                            </p>
                            <div className={styles.formGroup}>
                                <label>Select Project / Campaign</label>
                                <select
                                    className={styles.select}
                                    onChange={(e) => setSelectedProject(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Project --</option>
                                    {MOCK_PROJECTS.map(p => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Allocation Duration</label>
                                <div className={styles.formRow}>
                                    <input type="date" className={styles.input} required />
                                    <input type="date" className={styles.input} required />
                                </div>
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setStaffForAllocation(null)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Confirm Allocation</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* REPORTS / STATEMENT MODAL */}
            {staffForReports && (
                <div className={styles.modalOverlay} onClick={() => setStaffForReports(null)}>
                    <div className={styles.reportModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className={styles.avatar} style={{ width: '48px', height: '48px', fontSize: '20px' }}>
                                    {staffForReports.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px' }}>Performance & Deliverables</h2>
                                    <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>
                                        Vendor: <span style={{ color: '#fff', fontWeight: 600 }}>{staffForReports.vendor}</span> • ID: <span style={{ fontFamily: 'monospace' }}>{staffForReports.staffId}</span>
                                    </p>
                                </div>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setStaffForReports(null)}>&times;</button>
                        </div>

                        <div className={styles.reportContent}>
                            {/* STATEMENT HEADER & FILTERS */}
                            <div className={styles.statementHeader}>
                                <div className={styles.accountSummary}>
                                    <div className={styles.summaryItem}>
                                        <span className={styles.summaryLabel}>Overall Efficiency</span>
                                        <span className={styles.summaryValue} style={{ color: '#10b981' }}>94%</span>
                                    </div>
                                    <div className={styles.summaryItem}>
                                        <span className={styles.summaryLabel}>Total Reports</span>
                                        <span className={styles.summaryValue}>24</span>
                                    </div>
                                </div>

                                <div className={styles.filterBar}>
                                    <div
                                        className={`${styles.filterTab} ${reportFilter === 'weekly' ? styles.active : ''}`}
                                        onClick={() => setReportFilter('weekly')}
                                    >
                                        Weekly
                                    </div>
                                    <div
                                        className={`${styles.filterTab} ${reportFilter === 'biweekly' ? styles.active : ''}`}
                                        onClick={() => setReportFilter('biweekly')}
                                    >
                                        Bi-Weekly
                                    </div>
                                    <div
                                        className={`${styles.filterTab} ${reportFilter === 'monthly' ? styles.active : ''}`}
                                        onClick={() => setReportFilter('monthly')}
                                    >
                                        Monthly
                                    </div>
                                    <div
                                        className={`${styles.filterTab} ${reportFilter === 'quarterly' ? styles.active : ''}`}
                                        onClick={() => setReportFilter('quarterly')}
                                    >
                                        Quarterly
                                    </div>
                                </div>
                            </div>

                            {/* REPORT TABLE */}
                            <div className={styles.tableWrapper}>
                                <table className={styles.statementTable}>
                                    <thead>
                                        <tr>
                                            <th>Report Period</th>
                                            <th>Date Range</th>
                                            <th>Deliverables Summary</th>
                                            <th>Efficiency</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Download</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredReports.length > 0 ? (
                                            filteredReports.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <span style={{ color: '#fff', fontWeight: 600, fontSize: '13px' }}>{item.period}</span>
                                                    </td>
                                                    <td className={styles.dateText}>{item.dateRange}</td>
                                                    <td className={styles.descColumn}>
                                                        <span className={styles.mainDesc} style={{ fontSize: '13px' }}>{item.deliverables}</span>
                                                    </td>
                                                    <td>
                                                        <div className={styles.successRateBox} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', fontSize: '12px' }}>
                                                            <BarChart3 size={12} /> {item.efficiency}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: item.status === 'Verified' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                                                            {item.status === 'Verified' ? <CheckCircle size={12} /> : <AlertCircle size={12} />} {item.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button
                                                            className={styles.downloadAction}
                                                            title="Open Report"
                                                            onClick={() => setSelectedReport(item)}
                                                            style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, color: '#3b82f6' }}
                                                        >
                                                            Open Report
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                                    <img src="https://illustrations.popsy.co/amber/surr-no-comments.svg" alt="No data" style={{ width: '100px', opacity: 0.5, marginBottom: '16px' }} />
                                                    <p>No reports found for this period filter.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* REPORT VIEWER MODAL */}
            {selectedReport && (
                <div className={styles.modalOverlay} onClick={() => setSelectedReport(null)}>
                    <div className={styles.reportModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FileSpreadsheet size={24} color="#fff" />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '20px', margin: 0 }}>{selectedReport.period}</h2>
                                    <p style={{ color: '#64748b', margin: 0, fontSize: '13px' }}>
                                        {selectedReport.dateRange} • {selectedReport.frequency.charAt(0).toUpperCase() + selectedReport.frequency.slice(1)} Report
                                    </p>
                                </div>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setSelectedReport(null)}>&times;</button>
                        </div>

                        <div className={styles.reportContent}>
                            {/* REPORT OVERVIEW */}
                            <div style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px'
                            }}>
                                <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>
                                    Report Overview
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Efficiency Score</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <BarChart3 size={16} color="#3b82f6" />
                                            <span style={{ color: '#3b82f6', fontSize: '20px', fontWeight: 700 }}>{selectedReport.efficiency}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Status</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                            {selectedReport.status === 'Verified' ? <CheckCircle size={16} color="#10b981" /> : <AlertCircle size={16} color="#f59e0b" />}
                                            <span style={{ color: selectedReport.status === 'Verified' ? '#10b981' : '#f59e0b', fontSize: '14px', fontWeight: 600 }}>
                                                {selectedReport.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Report Type</span>
                                        <span style={{
                                            color: '#fff',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            padding: '4px 12px',
                                            borderRadius: '6px',
                                            display: 'inline-block',
                                            marginTop: '4px'
                                        }}>
                                            {selectedReport.frequency.charAt(0).toUpperCase() + selectedReport.frequency.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* DELIVERABLES SECTION */}
                            <div style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px'
                            }}>
                                <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>
                                    Deliverables Summary
                                </h3>
                                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                                    {selectedReport.deliverables}
                                </p>
                            </div>

                            {/* PERFORMANCE METRICS */}
                            <div style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px'
                            }}>
                                <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>
                                    Performance Metrics
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <div style={{
                                        background: 'rgba(59, 130, 246, 0.05)',
                                        border: '1px solid rgba(59, 130, 246, 0.1)',
                                        borderRadius: '12px',
                                        padding: '16px'
                                    }}>
                                        <span style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                            Total Activities
                                        </span>
                                        <span style={{ color: '#3b82f6', fontSize: '24px', fontWeight: 700 }}>
                                            {selectedReport.deliverables.match(/\d+/)?.[0] || 'N/A'}
                                        </span>
                                    </div>
                                    <div style={{
                                        background: 'rgba(16, 185, 129, 0.05)',
                                        border: '1px solid rgba(16, 185, 129, 0.1)',
                                        borderRadius: '12px',
                                        padding: '16px'
                                    }}>
                                        <span style={{ color: '#64748b', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
                                            Success Rate
                                        </span>
                                        <span style={{ color: '#10b981', fontSize: '24px', fontWeight: 700 }}>
                                            {selectedReport.efficiency}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* DETAILED DATA TABLE */}
                            <div style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '24px'
                            }}>
                                <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '16px', fontWeight: 600 }}>
                                    Leads Breakdown
                                </h3>
                                <div style={{
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                                }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(59, 130, 246, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Lead Details</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Client Info</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Legal Requirement</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Lead Quality</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Advocate Mapping</th>
                                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Lead Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedReport.detailedData.map((row, index) => (
                                                <tr
                                                    key={index}
                                                    style={{
                                                        borderBottom: index < selectedReport.detailedData.length - 1 ? '1px solid rgba(255, 255, 255, 0.03)' : 'none',
                                                        transition: 'background 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {/* Lead Details */}
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{row.date}</div>
                                                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>Src: {row.source}</div>
                                                        <div style={{ color: '#3b82f6', fontSize: '11px', fontWeight: 500 }}>BPO: {row.assignedBPO}</div>
                                                    </td>

                                                    {/* Client Info */}
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{row.clientName}</div>
                                                        <div style={{ color: '#64748b', fontSize: '11px' }}>{row.clientMobile}</div>
                                                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>{row.clientCity}</div>
                                                    </td>

                                                    {/* Legal Requirement */}
                                                    <td style={{ padding: '12px 16px', maxWidth: '200px' }}>
                                                        <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>{row.category}</div>
                                                        <div style={{ color: '#cbd5e1', fontSize: '11px', lineHeight: '1.4', marginTop: '2px' }}>{row.problem}</div>
                                                    </td>

                                                    {/* Lead Quality */}
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ display: 'flex', gap: '4px', marginBottom: '2px' }}>
                                                            <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1px 4px', borderRadius: '3px' }}>{row.qualityGenuine}</span>
                                                            <span style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1px 4px', borderRadius: '3px' }}>{row.qualityUrgency}</span>
                                                        </div>
                                                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>Budget: {row.qualityBudgetLine}</div>
                                                    </td>

                                                    {/* Advocate Mapping */}
                                                    <td style={{ padding: '12px 16px' }}>
                                                        <div style={{ color: '#8b5cf6', fontSize: '12px', fontWeight: 600 }}>{row.advocateType}</div>
                                                        <div style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            fontSize: '10px',
                                                            color: row.advocateStatus === 'Assigned' ? '#10b981' : '#f59e0b',
                                                            marginTop: '2px'
                                                        }}>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                                                            {row.advocateStatus}
                                                        </div>
                                                    </td>

                                                    {/* Lead Status */}
                                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                        <span style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '6px',
                                                            fontSize: '11px',
                                                            fontWeight: 600,
                                                            background: row.leadStatus === 'Converted' ? 'rgba(16, 185, 129, 0.1)' : row.leadStatus === 'Qualified' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                                            color: row.leadStatus === 'Converted' ? '#10b981' : row.leadStatus === 'Qualified' ? '#3b82f6' : '#94a3b8',
                                                            border: '1px solid rgba(255,255,255,0.05)'
                                                        }}>
                                                            {row.leadStatus}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* ACTION BUTTONS */}
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => setSelectedReport(null)}
                                >
                                    Close
                                </button>
                                <button
                                    className={styles.submitBtn}
                                    onClick={() => handleDownloadReport(selectedReport.file)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                >
                                    <Download size={16} />
                                    Download Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD ASSET MODAL (Original) */}

            {isAddModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Authorize External Asset</h2>
                            <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>&times;</button>
                        </div>
                        <form className={styles.registrationForm} onSubmit={handleOnboard}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Asset Full Name</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        placeholder="e.g. Maria Gonzalez"
                                        value={onboardForm.fullName}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Vendor Entity / Independent</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        placeholder="e.g. Teleperformance"
                                        value={onboardForm.vendor}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, vendor: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Operational Channel (Email)</label>
                                    <input
                                        className={styles.input}
                                        type="email"
                                        placeholder="work@vendor.com"
                                        value={onboardForm.email}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Primary Assignment</label>
                                    <select
                                        className={styles.select}
                                        value={onboardForm.role}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, role: e.target.value })}
                                    >
                                        <option>Global BPO Desk</option>
                                        <option>Technical Consulting</option>
                                        <option>Legal Vetting</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Desired Login ID</label>
                                    <input
                                        className={styles.input}
                                        type="text"
                                        placeholder="maria.g"
                                        value={onboardForm.loginId}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, loginId: e.target.value })}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Temporary Password</label>
                                    <input
                                        className={styles.input}
                                        type="password"
                                        placeholder="Keep it secure"
                                        value={onboardForm.password}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Specialist Domain</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Define the strategic domain for this partner..."
                                    value={onboardForm.domain}
                                    onChange={(e) => setOnboardForm({ ...onboardForm, domain: e.target.value })}
                                ></textarea>
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>Discard</button>
                                <button type="submit" className={styles.submitBtn}>Authorize Access</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Outsourcing;
