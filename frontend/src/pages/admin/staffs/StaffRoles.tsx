import React, { useState, useMemo } from "react";
import styles from "./StaffRoles.module.css";
import {
    Shield, Headphones, MessageSquare, PhoneCall,
    UserCheck, Briefcase, Search, Mail, Phone,
    Clock, MoreVertical, FileText, Zap, BarChart3,
    Layers, HeartHandshake, Mic, MousePointer2,
    Plus, Gem, Star, Info, X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type StaffStatus = "Active" | "Inactive" | "On Leave" | "Suspended";
type RoleCategory = "system" | "premium";

interface StaffMember {
    id: string;
    staffId: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
    level: string;
    status: StaffStatus;
    joinedDate: string;
    lastActive: string;
    assignedTasks: number;
    completionRate: string;
    // New Analytics
    solvedCases: number;
    pendingCases: number;
    successRate: string;
    grossAmount: string;
    netAmount: string;
}

interface RoleGroup {
    id: string;
    name: string;
    icon: LucideIcon;
    count: number;
    color: string;
    category: RoleCategory;
}

const INITIAL_ROLE_GROUPS: RoleGroup[] = [
    { id: "all", name: "All Roles", icon: Layers, count: 124, color: "#3b82f6", category: "system" },
    { id: "admin", name: "Super Admin", icon: Shield, count: 1, color: "#ef4444", category: "system" },
    { id: "manager", name: "Manager", icon: Briefcase, count: 5, color: "#f59e0b", category: "system" },
    { id: "hr", name: "HR", icon: UserCheck, count: 3, color: "#ec4899", category: "system" },
    { id: "teamlead", name: "Team Lead", icon: Zap, count: 12, color: "#8b5cf6", category: "system" },
    { id: "tele", name: "Telecallers", icon: Mic, count: 25, color: "#10b981", category: "system" },
    { id: "market", name: "Marketers", icon: Layers, count: 20, color: "#10b981", category: "system" },
    { id: "data", name: "Data Entry", icon: MousePointer2, count: 8, color: "#6366f1", category: "system" },
    { id: "care", name: "Customer Care", icon: Headphones, count: 15, color: "#3b82f6", category: "system" },

    // PREMIUM GROUPS
    { id: "chat", name: "Chat Support", icon: MessageSquare, count: 10, color: "#06b6d4", category: "premium" },
    { id: "live", name: "Live Chat Support", icon: Star, count: 6, color: "#facc15", category: "premium" },
    { id: "call", name: "Call Support", icon: PhoneCall, count: 12, color: "#f97316", category: "premium" },
    { id: "pa", name: "Personal Agent", icon: HeartHandshake, count: 4, color: "#ec4899", category: "premium" },
];

const MOCK_STAFF: StaffMember[] = [
    {
        id: "1", staffId: "STF-101", name: "Amit Khanna", email: "amit.k@legal.com", mobile: "+91 98765 43210",
        role: "Super Admin", level: "L10", status: "Active", joinedDate: "2023-01-01", lastActive: "Now",
        assignedTasks: 120, completionRate: "98%",
        solvedCases: 450, pendingCases: 12, successRate: "98%", grossAmount: "₹2,50,000", netAmount: "₹2,10,000"
    },
    {
        id: "2", staffId: "STF-252", name: "Sneha Reddy", email: "sneha.r@support.com", mobile: "+91 87654 32109",
        role: "Live Chat Support", level: "L3", status: "Active", joinedDate: "2023-11-15", lastActive: "2 mins ago",
        assignedTasks: 840, completionRate: "95%",
        solvedCases: 320, pendingCases: 8, successRate: "97%", grossAmount: "₹65,000", netAmount: "₹58,000"
    },
    {
        id: "3", staffId: "STF-441", name: "Robert D'Souza", email: "robert.d@help.in", mobile: "+91 76543 21098",
        role: "Customer Care", level: "L4", status: "Active", joinedDate: "2023-08-20", lastActive: "15 mins ago",
        assignedTasks: 520, completionRate: "92%",
        solvedCases: 120, pendingCases: 5, successRate: "95%", grossAmount: "₹1,20,000", netAmount: "₹1,05,000"
    },
    {
        id: "4", staffId: "STF-882", name: "Priya Menon", email: "priya.m@hr.com", mobile: "+91 91111 22222",
        role: "HR", level: "L7", status: "On Leave", joinedDate: "2023-05-10", lastActive: "Yesterday",
        assignedTasks: 45, completionRate: "100%",
        solvedCases: 850, pendingCases: 45, successRate: "92%", grossAmount: "₹85,000", netAmount: "₹72,000"
    },
    {
        id: "5", staffId: "STF-331", name: "Vikram Malhotra", email: "vikram.m@sales.com", mobile: "+91 95555 44444",
        role: "Telecallers", level: "L2", status: "Inactive", joinedDate: "2023-12-01", lastActive: "3 days ago",
        assignedTasks: 1200, completionRate: "88%",
        solvedCases: 1500, pendingCases: 120, successRate: "90%", grossAmount: "₹45,000", netAmount: "₹38,000"
    }
];

const StaffRoles: React.FC = () => {
    const [roleGroups, setRoleGroups] = useState<RoleGroup[]>(INITIAL_ROLE_GROUPS);
    const [selectedRoleId, setSelectedRoleId] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);

    // Form State
    const [newRole, setNewRole] = useState({
        name: "",
        category: "system" as RoleCategory,
        level: "L1",
        color: "#3b82f6",
        description: ""
    });

    const activeRole = useMemo(() =>
        roleGroups.find(g => g.id === selectedRoleId),
        [selectedRoleId, roleGroups]);

    const filteredMembers = useMemo(() => {
        return MOCK_STAFF.filter(member => {
            const matchesSearch =
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRole =
                selectedRoleId === "all" ||
                member.role.toLowerCase() === activeRole?.name.toLowerCase();

            return matchesSearch && matchesRole;
        });
    }, [searchTerm, selectedRoleId, activeRole]);

    const handleAddRole = (e: React.FormEvent) => {
        e.preventDefault();
        const id = newRole.name.toLowerCase().replace(/\s+/g, '-');
        const newGroup: RoleGroup = {
            id,
            name: newRole.name,
            icon: newRole.category === "premium" ? Gem : Briefcase,
            count: 0,
            color: newRole.color,
            category: newRole.category
        };
        setRoleGroups(prev => [...prev, newGroup]);
        setIsAddRoleModalOpen(false);
        setNewRole({ name: "", category: "system", level: "L1", color: "#3b82f6", description: "" });
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Omnichannel Staff Architecture</h1>
                    <p>Orchestrate your workforce across system and premium support layers.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.exportBtn} onClick={() => alert("Audit log export started...")}>
                        <FileText size={18} /> Export Results
                    </button>
                    <button className={styles.addRoleBtn} onClick={() => setIsAddRoleModalOpen(true)}>
                        <Plus size={18} /> New Performance Role
                    </button>
                </div>
            </header>

            {/* SYSTEM GROUPS */}
            <div className={styles.roleGridSection}>
                <div className={styles.sectionLabel}>
                    <Shield size={14} /> System Operational Groups
                </div>
                <div className={styles.grid}>
                    {roleGroups.filter(r => r.category === "system").map(role => (
                        <div
                            key={role.id}
                            className={`${styles.roleCard} ${selectedRoleId === role.id ? styles.activeCard : ""}`}
                            onClick={() => setSelectedRoleId(role.id)}
                            style={{ "--brand-color": role.color } as any}
                        >
                            <div className={styles.cardIcon}>
                                <role.icon size={22} />
                            </div>
                            <div className={styles.cardInfo}>
                                <span className={styles.roleName}>{role.name}</span>
                                <span className={styles.roleCount}>{role.count} Members</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* PREMIUM GROUPS */}
            <div className={styles.roleGridSection}>
                <div className={`${styles.sectionLabel} ${styles.premium}`}>
                    <Gem size={14} /> Premium Package Support Layers
                </div>
                <div className={styles.grid}>
                    {roleGroups.filter(r => r.category === "premium").map(role => (
                        <div
                            key={role.id}
                            className={`${styles.roleCard} ${selectedRoleId === role.id ? styles.activeCard : ""}`}
                            onClick={() => setSelectedRoleId(role.id)}
                            style={{ "--brand-color": role.color } as any}
                        >
                            <div className={styles.cardIcon}>
                                <role.icon size={22} />
                            </div>
                            <div className={styles.cardInfo}>
                                <span className={styles.roleName}>{role.name}</span>
                                <span className={styles.roleCount}>{role.count} Members</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MEMBER DATA SECTION */}
            <div className={styles.dataCard}>
                <div className={styles.dataHeader}>
                    <div className={styles.dataTitle}>
                        <h2>{activeRole?.name} Staff Directory</h2>
                        <span className={styles.countBadge}>{filteredMembers.length} Specialized Personnel</span>
                    </div>
                    <div className={styles.searchBox}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Identify specific agent ID or name..."
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
                                <th>Agent Intelligence</th>
                                <th>Channels</th>
                                <th>Position / Role</th>
                                <th>Analytics (Solved/Pend)</th>
                                <th>Success Rate</th>
                                <th>Gross (Lakhs)</th>
                                <th>Net Rec.</th>
                                <th>Joined / Activity</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((m, index) => (
                                <tr key={m.id}>
                                    <td><span className={styles.secondaryText}>{index + 1}</span></td>
                                    <td>
                                        <div className={styles.memberCell}>
                                            <div className={styles.avatar}>{m.name.charAt(0)}</div>
                                            <div className={styles.stacked}>
                                                <span className={styles.primaryText}>{m.name}</span>
                                                <span className={styles.idText}>{m.staffId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.contactCell}>
                                            <span className={styles.infoRow}><Mail size={12} /> {m.email}</span>
                                            <span className={styles.infoRow}><Phone size={12} /> {m.mobile}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.stacked}>
                                            <span className={styles.designationBadge}>{m.role}</span>
                                            <span className={styles.levelText}>{m.level}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.analyticsCell}>
                                            <span className={styles.solvedText}>{m.solvedCases} Solved</span>
                                            <span className={styles.pendingText}>{m.pendingCases} Pending</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.successRateBox}>
                                            <BarChart3 size={14} /> {m.successRate}
                                        </div>
                                    </td>
                                    <td><span className={styles.grossText}>{m.grossAmount}</span></td>
                                    <td><span className={styles.netText}>{m.netAmount}</span></td>
                                    <td>
                                        <div className={styles.joinedCol}>
                                            <span className={styles.secondaryText}>{m.joinedDate}</span>
                                            <span className={styles.activityPulse}><Clock size={10} /> {m.lastActive}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[m.status.toLowerCase().replace(" ", "")]}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button className={styles.dots} onClick={() => setOpenMenu(openMenu === m.id ? null : m.id)}>
                                            <MoreVertical size={16} />
                                        </button>
                                        {openMenu === m.id && (
                                            <div className={styles.menu}>
                                                <button onClick={() => alert("Permissions for " + m.name)}><Shield size={14} /> Security Access</button>
                                                <button onClick={() => alert("Details for " + m.name)}><Info size={14} /> View Dossier</button>
                                                <button className={styles.actionBlock} onClick={() => alert("Suspending " + m.name)}><X size={14} /> Restrict Agent</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD ROLE MODAL */}
            {isAddRoleModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsAddRoleModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Define New Operational Role</h2>
                            <button className={styles.closeBtn} onClick={() => setIsAddRoleModalOpen(false)}>&times;</button>
                        </div>
                        <form className={styles.form} onSubmit={handleAddRole}>
                            <div className={styles.formGroup}>
                                <label>Role Nomenclature</label>
                                <input
                                    className={styles.input}
                                    type="text"
                                    placeholder="e.g. Senior Premium Agent"
                                    required
                                    value={newRole.name}
                                    onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                                />
                            </div>

                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Role Architecture</label>
                                    <select
                                        className={styles.select}
                                        value={newRole.category}
                                        onChange={e => setNewRole({ ...newRole, category: e.target.value as RoleCategory })}
                                    >
                                        <option value="system">System Operational</option>
                                        <option value="premium">Premium Package</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Access Tier</label>
                                    <select
                                        className={styles.select}
                                        value={newRole.level}
                                        onChange={e => setNewRole({ ...newRole, level: e.target.value })}
                                    >
                                        {[...Array(10)].map((_, i) => (
                                            <option key={i} value={`L${i + 1}`}>Level {i + 1} Access</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Brand Presence Color</label>
                                <div className={styles.colorPicker}>
                                    {["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"].map(c => (
                                        <div
                                            key={c}
                                            className={`${styles.colorOption} ${newRole.color === c ? styles.active : ""}`}
                                            style={{ background: c, color: c }}
                                            onClick={() => setNewRole({ ...newRole, color: c })}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Strategic Responsibilities</label>
                                <textarea
                                    className={styles.textarea}
                                    placeholder="Briefly define the scope of this role..."
                                    rows={3}
                                    value={newRole.description}
                                    onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                                />
                            </div>

                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsAddRoleModalOpen(false)}>Discard</button>
                                <button type="submit" className={styles.submitBtn}>Initialize Role</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffRoles;
