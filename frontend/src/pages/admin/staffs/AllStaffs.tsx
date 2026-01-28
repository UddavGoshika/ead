import React, { useState, useMemo } from "react";
import styles from "./AllStaffs.module.css";
import { Search, Plus, MoreVertical, Mail, Phone, ShieldCheck, Clock, Briefcase, Zap, BarChart3, Info, X } from "lucide-react";

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
    // New Analytics Columns
    solvedCases: number;
    pendingCases: number;
    successRate: string;
    grossAmount: string;
    netAmount: string;
    avatar?: string;
}

const ALL_ROLES = [
    "All", "Super Admin", "Manager", "Team Lead", "HR",
    "Telecallers", "Data Entry", "Customer Care Support",
    "Chat Support", "Live Chat Support", "Call Support",
    "Personal Assistant Support", "Marketers"
];

const STATUSES = ["All", "Active", "Inactive", "On Leave", "Suspended"];

const MOCK_STAFF: Staff[] = [
    {
        id: "1",
        staffId: "STF-1001",
        name: "Arjun Sharma",
        email: "arjun.sharma@enterprise.com",
        mobile: "+91 98765 43210",
        role: "Super Admin",
        department: "Administration",
        status: "Active",
        joinedDate: "2023-01-15",
        lastActive: "Now",
        solvedCases: 450,
        pendingCases: 12,
        successRate: "98%",
        grossAmount: "₹2,50,000",
        netAmount: "₹2,10,000"
    },
    {
        id: "2",
        staffId: "STF-1005",
        name: "Priya Das",
        email: "priya.das@enterprise.com",
        mobile: "+91 87654 32109",
        role: "HR",
        department: "Human Resources",
        status: "Active",
        joinedDate: "2023-03-10",
        lastActive: "2 hours ago",
        solvedCases: 120,
        pendingCases: 5,
        successRate: "95%",
        grossAmount: "₹1,20,000",
        netAmount: "₹1,05,000"
    },
    {
        id: "3",
        staffId: "STF-1201",
        name: "Rohan Varma",
        email: "rohan.v@enterprise.com",
        mobile: "+91 76543 21098",
        role: "Telecallers",
        department: "Sales",
        status: "Inactive",
        joinedDate: "2023-11-20",
        lastActive: "Yesterday",
        solvedCases: 850,
        pendingCases: 45,
        successRate: "92%",
        grossAmount: "₹85,000",
        netAmount: "₹72,000"
    },
    {
        id: "4",
        staffId: "STF-1305",
        name: "Sneha Roy",
        email: "sneha.roy@support.com",
        mobile: "+91 95555 44444",
        role: "Live Chat Support",
        department: "Customer Service",
        status: "Active",
        joinedDate: "2024-01-05",
        lastActive: "5 mins ago",
        solvedCases: 320,
        pendingCases: 8,
        successRate: "97%",
        grossAmount: "₹65,000",
        netAmount: "₹58,000"
    },
    {
        id: "5",
        staffId: "STF-1402",
        name: "Vikram Singh",
        email: "vikram.s@enterprise.com",
        mobile: "+91 91111 22222",
        role: "Data Entry",
        department: "Operations",
        status: "On Leave",
        joinedDate: "2023-08-12",
        lastActive: "3 days ago",
        solvedCases: 1500,
        pendingCases: 120,
        successRate: "90%",
        grossAmount: "₹45,000",
        netAmount: "₹38,000"
    }
];

const AllStaffs: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const filteredStaff = useMemo(() => {
        return MOCK_STAFF.filter(staff => {
            const matchesSearch =
                staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staff.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                staff.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = selectedRole === "All" || staff.role === selectedRole;
            const matchesStatus = selectedStatus === "All" || staff.status === selectedStatus;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [searchTerm, selectedRole, selectedStatus]);

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
                        <label><Briefcase size={14} /> Filter by Role</label>
                        <div className={styles.roleGrid}>
                            {ALL_ROLES.map(role => (
                                <div
                                    key={role}
                                    className={`${styles.roleBlock} ${selectedRole === role ? styles.activeRole : ""}`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    <span className={styles.roleName}>{role}</span>
                                    <span className={styles.roleCount}>
                                        {role === "All" ? MOCK_STAFF.length : MOCK_STAFF.filter(s => s.role === role).length}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
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
                    </div>
                </div>
            </div>

            {/* STAFF TABLE */}
            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Employee / ID</th>
                                <th>Channels</th>
                                <th>Position / Role</th>
                                <th>Analytics (Solved/Pend)</th>
                                <th>Success Rate</th>
                                <th>Gross (Lakhs)</th>
                                <th>Net Rec.</th>
                                <th>Joined / Activity</th>
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
                                        <div className={styles.contactInfo}>
                                            <span className={styles.infoRow}><Mail size={12} /> {staff.email}</span>
                                            <span className={styles.infoRow}><Phone size={12} /> {staff.mobile}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.stacked}>
                                            <span className={styles.roleBadge}>{staff.role}</span>
                                            <span className={styles.deptText}>{staff.department}</span>
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
                                        <div className={styles.joinedCol}>
                                            <span className={styles.secondaryText}>{staff.joinedDate}</span>
                                            <span className={styles.activityPulse}><Clock size={10} /> {staff.lastActive}</span>
                                        </div>
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
                                                <button onClick={() => alert("Editing " + staff.name)}><Info size={14} /> Profile Intelligence</button>
                                                <button onClick={() => alert("Viewing " + staff.name)}><ShieldCheck size={14} /> Access Dossier</button>
                                                <button className={styles.deleteBtn} onClick={() => alert("Suspending " + staff.name)}><X size={14} /> Deactivate</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
                        <form className={styles.registrationForm} onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Full Legal Name</label>
                                    <input type="text" placeholder="e.g. Rahul Verma" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Professional Email</label>
                                    <input type="email" placeholder="rahul.v@enterprise.com" required />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Mobile Number</label>
                                    <input type="tel" placeholder="+91 00000 00000" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Assigned Department</label>
                                    <select>
                                        <option>Sales</option>
                                        <option>Customer Service</option>
                                        <option>Human Resources</option>
                                        <option>Operations</option>
                                        <option>Technical</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Operational Designation</label>
                                    <select>
                                        {ALL_ROLES.filter(r => r !== "All").map(r => (
                                            <option key={r}>{r}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Industry Experience</label>
                                    <input type="text" placeholder="e.g. 3 Years" />
                                </div>
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Complete Registration</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllStaffs;
