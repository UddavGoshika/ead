import React, { useState, useMemo } from "react";
import styles from "./AllStaffs.module.css";
import { Search, Plus, MoreVertical, Mail, Phone, ShieldCheck, Clock, Briefcase, Zap, BarChart3, Info, X, CheckSquare, FileText, Download, TrendingUp, Activity, File, Paperclip } from "lucide-react";
import { useEffect } from "react";
import { adminService } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import { useSocketStore } from "../../../store/useSocketStore";

type StaffStatus = "Active" | "Inactive" | "On Leave" | "Suspended";

interface Staff {
    id: string;
    staffId: string;
    name: string;
    email: string;
    mobile: string;
    role: string;
    department: string;
    status: StaffStatus;
    joinedDate: string;
    lastActive: string;
    solvedCases: number;
    pendingCases: number;
    successRate: string;
    grossAmount: string;
    netAmount: string;
    avatar?: string;
}

const ROLE_DISPLAY_MAP: Record<string, string> = {
    admin: 'Admin',
    super_admin: 'Super Admin',
    superadmin: 'Super Admin',
    manager: 'General Manager',
    teamlead: 'Team Lead',
    marketing_team_lead: 'Marketing Team Lead',
    support_team_lead: 'Support Team Lead',
    operations_team_lead: 'Operations Team Lead',
    hr: 'HR',
    telecaller: 'Telecaller',
    data_entry: 'Data Entry',
    customer_care: 'Customer Care',
    chat_support: 'Chat Support',
    live_chat: 'Live Chat',
    call_support: 'Call Support',
    personal_assistant: 'Personal Assistant',
    personal_agent: 'Personal Agent',
    marketer: 'Marketer',
    marketing_agency: 'Marketing Agency',
    legal_provider: 'Legal Advisor',
    email_support: 'Email Support',
    influencer: 'Influencer',
    verifier: 'Verifier',
    finance: 'Finance',
    support: 'Support'
};

const DEPARTMENTS = [
    {
        name: "Super Admin Hierarchy",
        color: "#ef4444",
        roles: ["Super Admin"]
    },
    {
        name: "Admin Office",
        color: "#3b82f6",
        roles: ["Admin", "Finance", "Verifier"]
    },
    {
        name: "General Management",
        color: "#a855f7",
        roles: ["General Manager"]
    },
    {
        name: "HR Department",
        color: "#f472b6",
        roles: ["HR"]
    },
    {
        name: "Marketing Department",
        color: "#fbbf24",
        roles: ["Marketing Team Lead", "Marketer", "Marketing Agency", "Influencer"]
    },
    {
        name: "Support Department",
        color: "#10b981",
        roles: ["Support Team Lead", "Call Support", "Chat Support", "Live Chat", "Email Support", "Personal Agent"]
    },
    {
        name: "Operations Department",
        color: "#22d3ee",
        roles: ["Operations Team Lead", "Telecaller", "Customer Care", "Data Entry"]
    },
    {
        name: "Executive Office",
        color: "#818cf8",
        roles: ["Personal Assistant"]
    }
];

const ALL_ROLES = ["All", ...DEPARTMENTS.flatMap(d => d.roles)];

const STATUSES = ["All", "Active", "Inactive", "On Leave", "Suspended"];

// Rich Mock Data for Work History
interface WorkAttachment {
    name: string;
    type: 'pdf' | 'doc' | 'xls' | 'img';
    size: string;
}

interface DetailedWorkLog {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    tags: string[];
    attachments: WorkAttachment[];
    isCompleted: boolean;
}

const MOCK_DETAILED_LOGS: DetailedWorkLog[] = [
    {
        id: 1,
        title: "Enterprise Client Onboarding - Tech Solutions Ltd",
        description: "Conducted a comprehensive 2-hour onboarding session with the client's technical team. Configured their primary dashboard, set up 50+ user accounts, and provided training on the analytics module. Client expressed high satisfaction with the customization provided.",
        date: "Feb 09, 2024",
        time: "10:00 AM",
        duration: "2h 15m",
        tags: ["Onboarding", "Client Meeting", "Configuration"],
        attachments: [
            { name: "Onboarding_Checklist.pdf", type: "pdf", size: "1.2 MB" },
            { name: "Meeting_Notes_TechSol.docx", type: "doc", size: "45 KB" }
        ],
        isCompleted: true
    },
    {
        id: 2,
        title: "Database Optimization & Clean-up",
        description: "Performed routine maintenance on the customer query database. Identified and merged 150+ duplicate records. improved query response time by approximately 15%. Generated a report on data integrity issues found during the process.",
        date: "Feb 08, 2024",
        time: "02:30 PM",
        duration: "1h 45m",
        tags: ["Maintenance", "Database", "Internal Task"],
        attachments: [
            { name: "Optimization_Report_Feb.xls", type: "xls", size: "2.4 MB" }
        ],
        isCompleted: true
    },
    {
        id: 3,
        title: "Resolved Payment Gateway Error #9921",
        description: "Investigated a reported issue where users from the EMEA region were facing transaction failures. Traced the issue to a timeout configuration in the API gateway. Applied a hotfix and verified successful transactions in the staging environment before deploying to production.",
        date: "Feb 08, 2024",
        time: "11:15 AM",
        duration: "45m",
        tags: ["Bug Fix", "Critical", "Payments"],
        attachments: [],
        isCompleted: true
    },
    {
        id: 4,
        title: "Drafting Weekly Performance Review",
        description: "Collated performance metrics for the support team. Analyzed ticket resolution times and customer feedback scores. Drafted the initial executive summary for the Monday morning leadership sync.",
        date: "Feb 07, 2024",
        time: "04:00 PM",
        duration: "1h 00m",
        tags: ["Reporting", "Management", "Draft"],
        attachments: [
            { name: "Weekly_Metrics_Draft_v1.pdf", type: "pdf", size: "3.1 MB" }
        ],
        isCompleted: true
    }
];

const AllStaffs: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedStaffForHistory, setSelectedStaffForHistory] = useState<Staff | null>(null);
    const { impersonate } = useAuth();
    const { socket } = useSocketStore();

    // Backend State
    const [staffList, setStaffList] = useState<Staff[]>([]);
    const [workLogs, setWorkLogs] = useState<DetailedWorkLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchingLogs, setFetchingLogs] = useState(false);

    // Onboarding Form State
    const [onboardForm, setOnboardForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        mobile: "",
        department: "",
        designation: "",
        role: "",
        loginId: "",
        password: "",
        previousCompany: "",
        experienceYears: "",
        experienceLevel: ""
    });

    useEffect(() => {
        fetchStaff();

        if (socket) {
            socket.on('staff:updated', () => {
                console.log("[Staff] Real-time update received");
                fetchStaff();
            });
        }

        return () => {
            if (socket) socket.off('staff:updated');
        };
    }, [socket]);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const { data } = await adminService.getStaff();
            if (data.success) {
                const mapped = data.staff.map((s: any) => {
                    const r = (s.role || '').toLowerCase().replace(/-/g, '_');
                    const roleDisplay = ROLE_DISPLAY_MAP[r] || (s.role ? s.role.charAt(0).toUpperCase() + s.role.slice(1).toLowerCase().replace(/_/g, ' ') : 'Staff');
                    return {
                        id: String(s.id || s._id),
                        staffId: (s.profile && s.profile.staffId) || `STF-${String(s.id || s._id).slice(-4)}`,
                        name: s.name || (s.profile && s.profile.fullName) || s.email?.split('@')[0] || 'Staff',
                        email: s.email,
                        mobile: (s.profile && s.profile.mobile) || 'N/A',
                        role: roleDisplay,
                        department: (s.profile && s.profile.department) || 'N/A',
                        status: (s.status === 'Active' ? 'Active' : s.status === 'Blocked' ? 'Suspended' : s.status === 'Pending' ? 'Inactive' : (s.status || 'Active')) as StaffStatus,
                        joinedDate: (s.profile && s.profile.joinedDate) ? new Date(s.profile.joinedDate).toLocaleDateString() : new Date(s.createdAt).toLocaleDateString(),
                        lastActive: 'Now',
                        solvedCases: (s.profile && s.profile.solvedCases) || 0,
                        pendingCases: (s.profile && s.profile.pendingCases) || 0,
                        successRate: (s.profile && s.profile.successRate) || '0%',
                        grossAmount: `₹${((s.profile && s.profile.grossAmount) || 0).toLocaleString()}`,
                        netAmount: `₹${((s.profile && s.profile.netAmount) || 0).toLocaleString()}`
                    };
                });
                setStaffList(mapped);
            }
        } catch (err) {
            console.error("Fetch staff error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOnboard = async (e: React.FormEvent) => {
        e.preventDefault();

        const roleMapping: { [key: string]: string } = {
            "Telecaller": "telecaller",
            "Data Entry": "data_entry",
            "Customer Care": "customer_care",
            "Chat Support": "chat_support",
            "Live Chat": "live_chat",
            "Call Support": "call_support",
            "Personal Assistant": "personal_assistant",
            "Marketer": "marketer",
            "General Manager": "manager",
            "Team Lead": "teamlead",
            "Marketing Team Lead": "marketing_team_lead",
            "Support Team Lead": "support_team_lead",
            "Operations Team Lead": "operations_team_lead",
            "Super Admin": "admin",
            "HR": "hr",
            "Email Support": "email_support",
            "Influencer": "influencer",
            "Marketing Agency": "marketing_agency",
            "Verifier": "verifier",
            "Finance": "finance",
            "Support": "support",
            "Personal Agent": "personal_agent"
        };

        const backendRole = roleMapping[onboardForm.role] || (onboardForm.role || "").toLowerCase().replace(/\s+/g, '_');

        try {
            const res = await adminService.onboardStaff({
                email: onboardForm.email,
                fullName: `${onboardForm.firstName} ${onboardForm.lastName}`,
                loginId: onboardForm.loginId || `STF-${Math.floor(Math.random() * 8999) + 1000}`,
                tempPassword: onboardForm.password || "Staff@123",
                role: backendRole,
                department: onboardForm.department,
                phone: onboardForm.mobile,
                level: onboardForm.experienceLevel || "Junior"
            });

            if (res.data.success) {
                alert("Personnel onboarded successfully!");
                setIsAddModalOpen(false);
                fetchStaff();
            }
        } catch (err: any) {
            alert(err.response?.data?.error || "Error onboarding staff");
        }
    };

    const filteredStaff = useMemo(() => {
        return staffList.filter(staff => {
            const matchesSearch =
                staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staff.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staff.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = selectedRole === "All" || staff.role === selectedRole;
            const matchesStatus = selectedStatus === "All" || staff.status === selectedStatus;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [searchTerm, selectedRole, selectedStatus, staffList]);

    const handleViewWorkHistory = async (staff: Staff, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedStaffForHistory(staff);
        setOpenMenu(null);
        setFetchingLogs(true);
        try {
            const { data } = await adminService.getStaffWorkLogs(staff.id);
            if (data.success) {
                const mappedLogs: DetailedWorkLog[] = data.logs.map((log: any) => ({
                    id: log._id,
                    title: log.title,
                    description: log.description,
                    date: new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
                    time: new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                    duration: log.duration || 'N/A',
                    tags: log.tags || [],
                    attachments: [], // We can add file support later if needed
                    isCompleted: true
                }));
                setWorkLogs(mappedLogs);
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setFetchingLogs(false);
        }
    };

    const handleImpersonate = (staff: Staff) => {
        if (window.confirm(`You are about to log in as ${staff.name}. Your admin session will be temporarily replaced. Proceed?`)) {
            impersonate({
                id: staff.id,
                name: staff.name,
                role: staff.role.toLowerCase().replace(/\s+/g, '_') as any,
                email: staff.email,
                unique_id: staff.staffId
            });
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await adminService.updateMemberStatus(id, newStatus);
            if (res.data.success) {
                alert(`Staff status updated to ${newStatus}`);
                fetchStaff();
            }
        } catch (err) {
            console.error("Status update error:", err);
            alert("Failed to update status");
        }
    };

    const handleDownload = (file: WorkAttachment, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card clicks if any

        // Simulating a direct download for the mock files
        // In production, this would use a real URL: window.open(file.url, '_blank');
        const mockContent = `Content for ${file.name}\nGenerated at ${new Date().toISOString()}`;
        const blob = new Blob([mockContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <h1>Staff Management Console</h1>
                    <p>Overview of all administrative and support personnel.</p>
                </div>
                <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} /> Add New Staff
                </button>
            </header>

            {/* NEAT FILTER GRID SECTION */}
            <div className={styles.filterCard}>
                <div className={styles.searchRow}>
                    <div className={styles.searchContainer}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by Employee Name, ID, or Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.gridFilters}>
                    <div className={styles.filterGroup}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <label><Briefcase size={14} /> Organization Hierarchy</label>
                            <div
                                className={`${styles.roleBlockSmall} ${selectedRole === "All" ? styles.activeRole : ""}`}
                                onClick={() => setSelectedRole("All")}
                                style={{ minWidth: '160px' }}
                            >
                                <span className={styles.roleNameSmall}>Complete Workforce</span>
                                <span className={styles.roleCountSmall}>{staffList.length}</span>
                            </div>
                        </div>

                        <div className={styles.hierarchyContainer}>
                            {DEPARTMENTS.map(dept => (
                                <div key={dept.name} className={styles.deptSection} style={{ borderTop: `2px solid ${dept.color}` }}>
                                    <h4 className={styles.deptHeading} style={{ color: dept.color }}>{dept.name}</h4>
                                    <div className={styles.roleSubGrid}>
                                        {dept.roles.map(role => (
                                            <div
                                                key={role}
                                                className={`${styles.roleBlockSmall} ${selectedRole === role ? styles.activeRole : ""}`}
                                                onClick={() => setSelectedRole(role)}
                                            >
                                                <span className={styles.roleNameSmall}>{role}</span>
                                                <span className={styles.roleCountSmall}>
                                                    {staffList.filter(s => s.role === role).length}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGroup} style={{ borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '32px' }}>
                        <label><Zap size={14} /> Filter by Status</label>
                        <div className={styles.statusGrid}>
                            {STATUSES.map(status => (
                                <div
                                    key={status}
                                    className={`${styles.statusBlock} ${selectedStatus === status ? styles.activeStatus : ""} ${styles[status.toLowerCase().replace(" ", "")]}`}
                                    onClick={() => setSelectedStatus(status)}
                                >
                                    {status}
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 'auto', padding: '24px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '16px', border: '1px dashed rgba(59, 130, 246, 0.2)' }}>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '8px' }}>Staff Insight</div>
                            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
                                Use the organizational hierarchy to filter staff by department and specific specialized roles.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* STAFF TABLE */}
            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    {loading ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Synchronizing Personnel Records...</div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Personnel Identity</th>
                                    <th>Contact Information</th>
                                    <th>Position / Role</th>
                                    <th style={{ textAlign: "center" }}>Solved</th>
                                    <th style={{ textAlign: "center" }}>Pending</th>
                                    <th style={{ textAlign: "center" }}>Performance</th>
                                    <th>Net Earnings</th>
                                    <th>Joined Date</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredStaff.map((staff, index) => (
                                    <tr key={staff.id}>
                                        <td><span className={styles.secondaryText}>{index + 1}</span></td>
                                        <td>
                                            <div className={styles.userInfo}>
                                                <div className={styles.avatar}>
                                                    {staff.name.charAt(0)}
                                                </div>
                                                <div className={styles.stacked}>
                                                    <span className={styles.primaryText}>{staff.name}</span>
                                                    <span className={styles.idText}>{staff.staffId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.stacked}>
                                                <span className={styles.mobileText}>{staff.mobile}</span>
                                                <span className={styles.emailText}>{staff.email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.stacked}>
                                                <span className={styles.roleBadge}>{staff.role}</span>
                                                <span className={styles.deptText}>{staff.department}</span>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <span className={styles.solvedCount}>{staff.solvedCases}</span>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <span className={styles.pendingCount}>{staff.pendingCases}</span>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <div className={styles.successRateBox} style={{ margin: "0 auto" }}>
                                                {staff.successRate}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.netText}>{staff.netAmount}</span>
                                        </td>
                                        <td>
                                            <span className={styles.secondaryText}>{staff.joinedDate}</span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[staff.status.toLowerCase().replace(" ", "")]}`}>
                                                {staff.status}
                                            </span>
                                        </td>
                                        <td className={styles.actions}>
                                            <button
                                                className={styles.dots}
                                                onClick={() => setOpenMenu(openMenu === staff.id ? null : staff.id)}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {openMenu === staff.id && (
                                                <div className={styles.menu}>
                                                    <button onClick={(e) => handleViewWorkHistory(staff, e)}>
                                                        <Clock size={14} /> Work History
                                                    </button>
                                                    <button onClick={() => handleImpersonate(staff)}>
                                                        <ShieldCheck size={14} /> Log in as Member
                                                    </button>
                                                    <button onClick={() => alert("Profile Intelligence feature coming soon for " + staff.name)}><Info size={14} /> Profile Intelligence</button>
                                                    <button onClick={() => alert("Dossier review feature coming soon for " + staff.name)}><ShieldCheck size={14} /> Access Dossier</button>
                                                    <button className={styles.deleteBtn} onClick={() => handleUpdateStatus(staff.id, "Blocked")}><X size={14} /> Deactivate</button>
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

            {/* ADD STAFF MODAL */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Onboard New Personnel</h2>
                            <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>&times;</button>
                        </div>
                        <form className={styles.registrationForm} onSubmit={handleOnboard}>

                            {/* Row 1 */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Rahul"
                                        value={onboardForm.firstName}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, firstName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Verma"
                                        value={onboardForm.lastName}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Professional Email</label>
                                    <input
                                        type="email"
                                        placeholder="rahul.v@enterprise.com"
                                        value={onboardForm.email}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Mobile Number</label>
                                    <input
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={onboardForm.mobile}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, mobile: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 3 */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Assigned Department</label>
                                    <select
                                        value={onboardForm.department}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, department: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Customer Service">Customer Service</option>
                                        <option value="Human Resources">Human Resources</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Technical">Technical</option>
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Assigned Designation</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Senior Executive"
                                        value={onboardForm.designation}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, designation: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* New Row for Role */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>System Role Mapping</label>
                                    <select
                                        value={onboardForm.role}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, role: e.target.value })}
                                        required
                                    >
                                        <option value="">Select System Role</option>
                                        {ALL_ROLES.filter(r => r !== "All").map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Row 4 */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Assigned Login ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. STF-2024-X"
                                        value={onboardForm.loginId}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, loginId: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="Minimum 8 characters"
                                        value={onboardForm.password}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, password: e.target.value })}
                                        required
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            {/* Row 5 */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Previous Company</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. TCS, Infosys, HCL"
                                        value={onboardForm.previousCompany}
                                        onChange={(e) => setOnboardForm({ ...onboardForm, previousCompany: e.target.value })}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Experience</label>
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <input
                                            type="number"
                                            placeholder="Years"
                                            min="0"
                                            value={onboardForm.experienceYears}
                                            onChange={(e) => setOnboardForm({ ...onboardForm, experienceYears: e.target.value })}
                                            style={{ flex: 1 }}
                                        />
                                        <select
                                            value={onboardForm.experienceLevel}
                                            onChange={(e) => setOnboardForm({ ...onboardForm, experienceLevel: e.target.value })}
                                            style={{ flex: 1 }}
                                        >
                                            <option value="">Level</option>
                                            <option value="Fresher">Fresher</option>
                                            <option value="Junior">Junior</option>
                                            <option value="Mid-Level">Mid-Level</option>
                                            <option value="Senior">Senior</option>
                                            <option value="Lead">Lead</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={styles.formActions}>
                                <button
                                    type="button"
                                    className={styles.cancelBtn}
                                    onClick={() => setIsAddModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className={styles.submitBtn}>
                                    Complete Registration
                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            )}

            {/* WORK HISTORY MODAL - ULTRA PREMIUM REDESIGN */}
            {selectedStaffForHistory && (
                <div className={styles.modalOverlay} onClick={() => setSelectedStaffForHistory(null)}>
                    <div className={styles.workHistoryModal} onClick={e => e.stopPropagation()}>
                        {/* HEADER */}
                        <div className={styles.modalHeader}>
                            <div>
                                <h2>Work Activity Log</h2>
                                <p style={{ color: '#94a3b8', margin: 0, marginTop: '4px' }}>
                                    Detailed Analysis for <span style={{ color: '#fff', fontWeight: 700 }}>{selectedStaffForHistory.name}</span>
                                </p>
                            </div>
                            <button className={styles.closeBtn} onClick={() => setSelectedStaffForHistory(null)}>&times;</button>
                        </div>

                        {/* STATS RIBBON - NEW */}
                        <div className={styles.statsRow}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Weekly Efficiency</span>
                                <div className={styles.statValue}>
                                    96.5% <span className={styles.statTrend}><TrendingUp size={10} /> +2.4%</span>
                                </div>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Tasks Completed</span>
                                <div className={styles.statValue}>
                                    42 <span className={styles.statTrend}><CheckSquare size={10} /> This Week</span>
                                </div>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Total Hours Logged</span>
                                <div className={styles.statValue}>
                                    38h 15m <span className={styles.statTrend}><Activity size={10} /> Active</span>
                                </div>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Client Rating</span>
                                <div className={styles.statValue}>
                                    4.9/5 <span className={styles.statTrend}><Zap size={10} /> Top Rated</span>
                                </div>
                            </div>
                        </div>

                        {/* WORK LOGS CONTENT */}
                        <div className={styles.workLogContainer}>
                            {fetchingLogs ? (
                                <div className={styles.loaderContainer}><Clock className={styles.spin} /> Analysing Logs...</div>
                            ) : workLogs.length === 0 ? (
                                <div className={styles.emptyLogs}>No active logs recorded for this terminal session.</div>
                            ) : (
                                workLogs.map((log) => (
                                    <div key={log.id} className={styles.logItem}>
                                        {/* TIMELINE LEFT */}
                                        <div className={styles.logTime}>
                                            <span className={styles.logDate}>{log.date}</span>
                                            <span className={styles.logHour}>{log.time}</span>
                                        </div>

                                        {/* MAIN CONTENT CARD */}
                                        <div className={styles.logContentCard}>
                                            <div className={styles.cardHeader}>
                                                <div className={styles.logTitle}>{log.title}</div>
                                                <div className={styles.durationBadge}>
                                                    <Clock size={12} /> {log.duration}
                                                </div>
                                            </div>

                                            <div className={styles.logDesc}>
                                                {log.description}
                                            </div>

                                            {/* METADATA GRID: FILES & TAGS */}
                                            <div className={styles.metaGrid}>
                                                {/* LEFT: TAGS */}
                                                <div>
                                                    <span className={styles.sectionLabel}>Skills & Tags</span>
                                                    <div className={styles.tagsList}>
                                                        {log.tags.map(tag => (
                                                            <span key={tag} className={styles.skillTag}>{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* RIGHT: FILES */}
                                                {log.attachments.length > 0 && (
                                                    <div>
                                                        <span className={styles.sectionLabel}>Attached Files & Proofs</span>
                                                        <div className={styles.filesGrid}>
                                                            {log.attachments.map((file, idx) => (
                                                                <div key={idx} className={`${styles.fileCard} ${styles[file.type]}`} onClick={(e) => handleDownload(file, e)}>
                                                                    {file.type === 'pdf' ? <FileText size={16} className={styles.fileIcon} /> :
                                                                        file.type === 'doc' ? <File size={16} className={styles.fileIcon} /> :
                                                                            <Paperclip size={16} className={styles.fileIcon} />}
                                                                    <span className={styles.fileName}>{file.name}</span>
                                                                    <Download size={14} className={styles.downloadIcon} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.downloadBtn} onClick={() => alert("Downloading Full Detailed Report...")}>
                                <Download size={16} style={{ marginRight: '8px' }} /> Export Comprehensive Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllStaffs;
