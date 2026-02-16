import React, { useState, useMemo, useEffect } from "react";
import styles from "./StaffRoles.module.css";
import {
    Shield, Headphones, MessageSquare, PhoneCall,
    UserCheck, Briefcase, Search, Mail, Phone,
    Clock, MoreVertical, FileText, Zap, BarChart3,
    Layers, HeartHandshake, Mic, MousePointer2,
    Plus, Gem, Star, Info, X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { adminService } from "../../../services/api";

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

const ROLE_GROUP_TEMPLATE: RoleGroup[] = [
    { id: "all", name: "All Roles", icon: Layers, count: 0, color: "#3b82f6", category: "system" },
    { id: "admin", name: "Super Admin", icon: Shield, count: 0, color: "#ef4444", category: "system" },
    { id: "manager", name: "Manager", icon: Briefcase, count: 0, color: "#f59e0b", category: "system" },
    { id: "hr", name: "HR", icon: UserCheck, count: 0, color: "#ec4899", category: "system" },
    { id: "teamlead", name: "Team Lead", icon: Zap, count: 0, color: "#8b5cf6", category: "system" },
    { id: "tele", name: "Telecallers", icon: Mic, count: 0, color: "#10b981", category: "system" },
    { id: "market", name: "Marketers", icon: Layers, count: 0, color: "#10b981", category: "system" },
    { id: "data", name: "Data Entry", icon: MousePointer2, count: 0, color: "#6366f1", category: "system" },
    { id: "care", name: "Customer Care", icon: Headphones, count: 0, color: "#3b82f6", category: "system" },
    { id: "chat", name: "Chat Support", icon: MessageSquare, count: 0, color: "#06b6d4", category: "premium" },
    { id: "live", name: "Live Chat Support", icon: Star, count: 0, color: "#facc15", category: "premium" },
    { id: "call", name: "Call Support", icon: PhoneCall, count: 0, color: "#f97316", category: "premium" },
    { id: "pa", name: "Personal Agent", icon: HeartHandshake, count: 0, color: "#ec4899", category: "premium" },
];

const roleNameToId: Record<string, string> = {
    "All Roles": "all", "Super Admin": "admin", "Manager": "manager", "HR": "hr", "Team Lead": "teamlead",
    "Telecallers": "tele", "Marketers": "market", "Data Entry": "data", "Customer Care": "care", "Customer Care Support": "care",
    "Chat Support": "chat", "Live Chat Support": "live", "Call Support": "call", "Personal Agent": "pa", "Personal Assistant Support": "pa"
};

const StaffRoles: React.FC = () => {
    const [roleGroups, setRoleGroups] = useState<RoleGroup[]>(ROLE_GROUP_TEMPLATE);
    const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoleId, setSelectedRoleId] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const { data } = await adminService.getStaff();
                if (!data.success || !data.staff) {
                    setStaffMembers([]);
                    return;
                }
                const roleToDisplay: Record<string, string> = {
                    admin: 'Super Admin', manager: 'Manager', teamlead: 'Team Lead', hr: 'HR',
                    telecaller: 'Telecallers', data_entry: 'Data Entry', customer_care: 'Customer Care',
                    chat_support: 'Chat Support', live_chat: 'Live Chat Support', call_support: 'Call Support',
                    personal_assistant: 'Personal Agent', marketer: 'Marketers'
                };
                const list: StaffMember[] = data.staff.map((s: any) => {
                    const r = (s.role || '').toLowerCase().replace(/-/g, '_');
                    const roleDisplay = roleToDisplay[r] || (s.role ? s.role.charAt(0).toUpperCase() + s.role.slice(1).replace(/_/g, ' ') : 'Staff');
                    const profile = s.profile || {};
                    const joined = profile.joinedDate || s.createdAt;
                    return {
                        id: String(s.id),
                        staffId: profile.staffId || `STF-${String(s.id).slice(-4)}`,
                        name: s.name || profile.fullName || s.email?.split('@')[0] || 'Staff',
                        email: s.email,
                        mobile: profile.mobile || 'N/A',
                        role: roleDisplay,
                        level: profile.level || 'L1',
                        status: (s.status === 'Active' ? 'Active' : s.status === 'Blocked' ? 'Suspended' : s.status === 'Pending' ? 'Inactive' : (s.status || 'Active')) as StaffStatus,
                        joinedDate: joined ? new Date(joined).toLocaleDateString() : 'N/A',
                        lastActive: 'Now',
                        assignedTasks: (profile.solvedCases || 0) + (profile.pendingCases || 0),
                        completionRate: profile.successRate || '0%',
                        solvedCases: profile.solvedCases || 0,
                        pendingCases: profile.pendingCases || 0,
                        successRate: profile.successRate || '0%',
                        grossAmount: `₹${(profile.grossAmount || 0).toLocaleString()}`,
                        netAmount: `₹${(profile.netAmount || 0).toLocaleString()}`
                    };
                });
                setStaffMembers(list);
                const counts: Record<string, number> = { all: list.length };
                ROLE_GROUP_TEMPLATE.forEach(g => { if (g.id !== 'all') counts[g.id] = 0; });
                list.forEach(m => {
                    const id = roleNameToId[m.role];
                    if (id && counts[id] !== undefined) counts[id]++;
                });
                setRoleGroups(ROLE_GROUP_TEMPLATE.map(g => ({ ...g, count: counts[g.id] ?? 0 })));
            } catch (e) {
                console.error('StaffRoles fetch', e);
                setStaffMembers([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

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
        return staffMembers.filter(member => {
            const matchesSearch =
                member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                member.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole =
                selectedRoleId === "all" ||
                (activeRole && (member.role.toLowerCase() === activeRole.name.toLowerCase() || roleNameToId[member.role] === selectedRoleId));
            return matchesSearch && matchesRole;
        });
    }, [searchTerm, selectedRoleId, activeRole, staffMembers]);

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
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading staff...</div>
                    ) : (
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
                    )}
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
