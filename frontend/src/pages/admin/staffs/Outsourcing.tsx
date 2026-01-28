import React, { useState, useMemo } from "react";
import styles from "./Outsourcing.module.css";
import {
    Shield, Headphones, Search, Mail, Phone,
    MoreVertical, FileText, BarChart3,
    Layers, Plus, Star, Info, X, Globe, ShieldCheck,
    Mic, MousePointer2, UserCheck, Briefcase
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

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
}

interface AssetGroup {
    id: string;
    name: string;
    icon: LucideIcon;
    count: number;
    color: string;
    category: AssetCategory;
}

const INITIAL_ASSET_GROUPS: AssetGroup[] = [
    { id: "all", name: "All Assets", icon: Layers, count: 45, color: "#10b981", category: "vendor" },
    { id: "bpo", name: "BPO Shared Desk", icon: Headphones, count: 25, color: "#3b82f6", category: "vendor" },
    { id: "data", name: "External Data Entry", icon: MousePointer2, count: 12, color: "#6366f1", category: "vendor" },
    { id: "voice", name: "Voice Operations", icon: Mic, count: 8, color: "#f59e0b", category: "vendor" },

    // STRATEGIC PARTNERS
    { id: "legal", name: "Legal Auditors", icon: Shield, count: 4, color: "#ef4444", category: "strategic" },
    { id: "consult", name: "Strategic Consultants", icon: Briefcase, count: 6, color: "#8b5cf6", category: "strategic" },
    { id: "vet", name: "Vetting Specialists", icon: UserCheck, count: 5, color: "#ec4899", category: "strategic" },
];

const MOCK_OUTSOURCED: OutsourcedStaff[] = [
    {
        id: "1", staffId: "VND-2001", vendor: "Elite Global BPO", name: "Jessica Miller",
        email: "jessica.m@elitebpo.com", mobile: "+1 202 555 0123", role: "BPO Shared Desk",
        level: "Senior", status: "Active", joinedDate: "2023-11-15", lastActive: "Now",
        solvedCases: 1250, pendingCases: 34, successRate: "96%", grossAmount: "₹45,000", netAmount: "₹38,000"
    },
    {
        id: "2", staffId: "VND-2005", vendor: "Support Desk Inc", name: "Mark Anthony",
        email: "mark.a@supportdesk.in", mobile: "+91 99887 76655", role: "Voice Operations",
        level: "L3", status: "Active", joinedDate: "2023-12-01", lastActive: "15 mins ago",
        solvedCases: 890, pendingCases: 12, successRate: "94%", grossAmount: "₹32,000", netAmount: "₹28,500"
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

    const activeGroup = useMemo(() =>
        assetGroups.find(g => g.id === selectedAssetId),
        [selectedAssetId, assetGroups]);

    const filteredStaff = useMemo(() => {
        return MOCK_OUTSOURCED.filter(staff => {
            const matchesSearch =
                staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staff.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staff.vendor.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole =
                selectedAssetId === "all" ||
                staff.role.toLowerCase() === activeGroup?.name.toLowerCase();

            return matchesSearch && matchesRole;
        });
    }, [searchTerm, selectedAssetId, activeGroup]);

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
                                <span className={styles.roleCount}>{role.count} Personnel</span>
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
                                <span className={styles.roleCount}>{role.count} Specialists</span>
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
                                <th>Platform / Vendor</th>
                                <th>Channels</th>
                                <th>Assignment</th>
                                <th>Case Analytics</th>
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
                                        <div className={styles.vendorBox} style={{ color: "#0ea5e9", fontWeight: 800 }}>
                                            <Globe size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> {staff.vendor}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.contactInfo}>
                                            <span className={styles.infoRow}><Mail size={12} /> {staff.email}</span>
                                            <span className={styles.infoRow}><Phone size={12} /> {staff.mobile}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.stacked}>
                                            <span className={styles.roleBadge} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>{staff.role}</span>
                                            <span className={styles.idText}>{staff.level} Access</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.analyticsCell}>
                                            <span className={styles.solvedText}>{staff.solvedCases} Solved</span>
                                            <span className={styles.pendingText}>{staff.pendingCases} Pending</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.successRateBox}>
                                            <BarChart3 size={14} /> {staff.successRate}
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
                                                <button onClick={() => alert("Vendor audit")}><Info size={14} /> Vendor Audit</button>
                                                <button onClick={() => alert("Security logs")}><ShieldCheck size={14} /> Security Log</button>
                                                <button className={styles.deleteBtn} onClick={() => alert("Termination access")}><X size={14} /> Revoke Access</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD ASSET MODAL */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Authorize External Asset</h2>
                            <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>&times;</button>
                        </div>
                        <form className={styles.registrationForm} onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Asset Full Name</label>
                                    <input className={styles.input} type="text" placeholder="e.g. Maria Gonzalez" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Vendor Entity / Independent</label>
                                    <input className={styles.input} type="text" placeholder="e.g. Teleperformance" required />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Operational Channel</label>
                                    <input className={styles.input} type="email" placeholder="work@vendor.com" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Primary Assignment</label>
                                    <select className={styles.select}>
                                        <option>Global BPO Desk</option>
                                        <option>Technical Consulting</option>
                                        <option>Legal Vetting</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Specialist Domain</label>
                                <textarea className={styles.textarea} placeholder="Define the strategic domain for this partner..."></textarea>
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
