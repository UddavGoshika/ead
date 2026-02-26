import React, { useState, useMemo, useEffect } from "react";
import styles from "./ReferralUsers.module.css";
import { Search, Filter, UserCircle, Briefcase, IndianRupee, PieChart, FileText, MoreVertical, CheckCircle, XCircle, ShieldCheck, Zap, Activity, UserPlus, X, Mail, Phone as PhoneIcon, Key, Hash, Percent } from "lucide-react";
import { referralService } from "../../../services/api";
import { motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";

type UserStatus = "Active" | "Blocked" | "Pending";
type KYCStatus = "Verified" | "Pending" | "Unverified";

interface ReferralUser {
    id: string;
    name: string;
    userId: string;
    email: string;
    phone: string;
    paymentType: string;
    joiningFee: string;
    role: string;
    totalEarned: string;
    withdrawn: string;
    pending: string;
    joiningDetails: string;
    status: UserStatus;
    level?: string;
    referralCode: string;
    commissionType: "Percentage" | "Fixed";
    kycStatus: KYCStatus;
    lastActivity: string;
}

const MOCK_USERS: ReferralUser[] = [
    {
        id: "1",
        name: "Adv. Rajesh Kumar",
        userId: "ADV-00101",
        email: "rajesh.kumar@law.com",
        phone: "+91 91234 56789",
        paymentType: "Online UPI",
        joiningFee: "₹1,500",
        role: "Teamleads",
        totalEarned: "₹25,000",
        withdrawn: "₹15,000",
        pending: "₹10,000",
        joiningDetails: "2024-01-05 via Ref-882",
        status: "Active",
        level: "Level 2",
        referralCode: "RAJESH25",
        commissionType: "Percentage",
        kycStatus: "Verified",
        lastActivity: "2 mins ago"
    },
    {
        id: "2",
        name: "Sarah Jenkins",
        userId: "MKT-00521",
        email: "sarah.j@growth.io",
        phone: "+91 82233 44556",
        paymentType: "Bank Transfer",
        joiningFee: "₹0 (Free)",
        role: "Influencers",
        totalEarned: "₹45,200",
        withdrawn: "₹40,000",
        pending: "₹5,200",
        joiningDetails: "2023-11-12 via Admin",
        status: "Active",
        level: "Level 1",
        referralCode: "SARAHGROW",
        commissionType: "Percentage",
        kycStatus: "Verified",
        lastActivity: "1 hour ago"
    },
    {
        id: "3",
        name: "Amit Patel",
        userId: "STF-00992",
        email: "amit.p@firm.com",
        phone: "+91 71122 33445",
        paymentType: "Wallet Settlement",
        joiningFee: "₹2,000",
        role: "Our Staff",
        totalEarned: "₹12,000",
        withdrawn: "₹8,000",
        pending: "₹4,000",
        joiningDetails: "2024-01-20 Direct",
        status: "Pending",
        level: "Level 3",
        referralCode: "AMITOFFICE",
        commissionType: "Fixed",
        kycStatus: "Pending",
        lastActivity: "Yesterday"
    },
    {
        id: "4",
        name: "Vikas Media Agency",
        userId: "AGC-771",
        email: "contact@vikasmedia.com",
        phone: "+91 98888 77777",
        paymentType: "Bank Transfer",
        joiningFee: "₹5,000",
        role: "Marketing Agencies",
        totalEarned: "₹1,20,000",
        withdrawn: "₹90,000",
        pending: "₹30,000",
        joiningDetails: "2023-09-15 via Admin",
        status: "Active",
        level: "Custom",
        referralCode: "VIKASPRO",
        commissionType: "Percentage",
        kycStatus: "Verified",
        lastActivity: "5 mins ago"
    },
    {
        id: "5",
        name: "Priya Marketing",
        userId: "MKT-221",
        email: "priya@marketing.in",
        phone: "+91 95555 44444",
        paymentType: "Online UPI",
        joiningFee: "₹500",
        role: "Freelance Marketers",
        totalEarned: "₹8,500",
        withdrawn: "₹2,000",
        pending: "₹6,500",
        joiningDetails: "2024-01-22 via Ref-101",
        status: "Active",
        level: "Level 1",
        referralCode: "PRIYA10",
        commissionType: "Percentage",
        kycStatus: "Unverified",
        lastActivity: "3 days ago"
    }
];

const ROLES = ["All", "referral", "Marketer", "Influencer", "Marketing_Agency", "Teamlead", "Manager", "Email_Support", "Call_Support", "Data_Entry"];
const STATUSES = ["All", "Active", "Pending", "Blocked"];

const ReferralUserAdmin: React.FC = () => {
    const { impersonate } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [users, setUsers] = useState<ReferralUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        loginId: "",
        password: "",
        role: "Marketer",
        department: "",
        percentage: "",
        referralCode: ""
    });

    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await referralService.getUsers();
            if (res.data.success) {
                // Map backend user to ReferralUser type
                const mapped: ReferralUser[] = res.data.users.map((u: any) => ({
                    id: u.id,
                    name: u.name,
                    userId: u.userId,
                    email: u.email,
                    phone: u.phone,
                    role: u.role,
                    totalEarned: `₹${u.totalEarned.toLocaleString()}`,
                    withdrawn: `₹${u.withdrawn.toLocaleString()}`,
                    pending: `₹${u.pending.toLocaleString()}`,
                    status: (u.status as any) || "Active",
                    referralCode: u.myReferralCode || "N/A",
                    commissionType: "Percentage",
                    kycStatus: "Verified",
                    lastActivity: "Recently",
                    joiningDetails: new Date(u.createdAt).toLocaleDateString(),
                    paymentType: "Internal",
                    joiningFee: "₹0"
                }));
                setUsers(mapped);
            }
        } catch (err) {
            console.error("Failed to fetch referral users", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOnboard = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const res = await referralService.onboardUser(formData);
            if (res.data.success) {
                alert("Referral user registered successfully!");
                setShowModal(false);
                setFormData({
                    name: "",
                    firstName: "",
                    lastName: "",
                    email: "",
                    phone: "",
                    loginId: "",
                    password: "",
                    role: "Marketer",
                    department: "",
                    percentage: "",
                    referralCode: ""
                });
                fetchUsers();
            }
        } catch (err: any) {
            alert(err.response?.data?.error || "Registration failed");
        } finally {
            setSubmitting(false);
        }
    };

    const generateCode = () => {
        const code = "REF-" + Math.floor(1000 + Math.random() * 9000);
        setFormData({ ...formData, referralCode: code });
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const roleVal = user.role?.toLowerCase() || "";
            const matchesRole = selectedRole === "All" ||
                roleVal === selectedRole.toLowerCase() ||
                roleVal.includes(selectedRole.toLowerCase().split('_')[0]);
            const matchesStatus = selectedStatus === "All" || user.status === selectedStatus;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [searchTerm, selectedRole, selectedStatus, users]);

    const downloadReport = () => {
        if (users.length === 0) return alert("No data to export");

        const headers = ["Name", "User ID", "Email", "Phone", "Role", "Referral Code", "Status", "Joined", "Total Earned", "Withdrawn", "Pending"];
        const rows = users.map(u => [
            u.name, u.userId, u.email, u.phone, u.role, u.referralCode, u.status, u.joiningDetails,
            u.totalEarned, u.withdrawn, u.pending
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `Referral_Users_Report_${new Date().toISOString().split('T')[0]}.csv`);
        a.click();
    };

    const getCount = (role: string) => {
        if (role === "All") return users.length;
        const lowerRole = role.toLowerCase();
        return users.filter(u => {
            const uRole = u.role?.toLowerCase() || "";
            return uRole === lowerRole || uRole.includes(lowerRole.split('_')[0].split(' ')[0]);
        }).length;
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>Referral User Analytics & Management</h1>
                        <p>Advanced filtering and detailed tracking for all referral roles.</p>
                    </div>
                    <button className={styles.onboardBtn} onClick={() => setShowModal(true)}>
                        <UserPlus size={18} /> Add Referral User
                    </button>
                </div>
            </header>

            {/* SELECTABLE FILTER GRID */}
            <div className={styles.filterCard}>
                <div className={styles.searchRow}>
                    <div className={styles.searchBar}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Find by Name, ID, or Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.bulkActions}>
                        <button className={styles.reportBtn} onClick={downloadReport}>
                            <PieChart size={18} /> Global Report
                        </button>
                    </div>
                </div>

                <div className={styles.selectableGrid}>
                    <div className={styles.filterGroup}>
                        <label><Briefcase size={14} /> Role-wise filtering</label>
                        <div className={styles.pills}>
                            {ROLES.map(role => (
                                <div
                                    key={role}
                                    className={`${styles.filterBlock} ${selectedRole === role ? styles.active : ""}`}
                                    onClick={() => setSelectedRole(role)}
                                >
                                    <span className={styles.blockLabel}>{role}</span>
                                    <span className={styles.blockCount}>
                                        {getCount(role)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label><Zap size={14} /> Status Overview</label>
                        <div className={styles.pills}>
                            {STATUSES.map(status => (
                                <div
                                    key={status}
                                    className={`${styles.statusBlock} ${selectedStatus === status ? styles.activeStatus : ""} ${styles[status.toLowerCase()]}`}
                                    onClick={() => setSelectedStatus(status)}
                                >
                                    {status}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* USER TABLE */}
            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Name / ID</th>
                                <th>Email / Phone</th>
                                <th>Ref. Code</th>
                                <th>KYC</th>
                                <th>Role</th>
                                <th>Comm. Type</th>
                                <th>Joined</th>
                                <th>Joined Fee</th>
                                <th>Earned</th>
                                <th>Paid</th>
                                <th>Pending</th>
                                <th>Last Active</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className={styles.stackedCell}>
                                            <span className={styles.primaryText}>{user.name}</span>
                                            <span className={styles.secondaryText}>{user.userId}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.stackedCell}>
                                            <span className={styles.primaryText}>{user.email}</span>
                                            <span className={styles.secondaryText}>{user.phone}</span>
                                        </div>
                                    </td>
                                    <td><span className={styles.codeText}>{user.referralCode}</span></td>
                                    <td>
                                        <span className={`${styles.kycBadge} ${styles[user.kycStatus.toLowerCase()]}`}>
                                            {user.kycStatus === "Verified" ? <ShieldCheck size={12} /> : null}
                                            {user.kycStatus}
                                        </span>
                                    </td>
                                    <td><span className={styles.roleBadge}>{user.role}</span></td>
                                    <td><span className={styles.secondaryText}>{user.commissionType}</span></td>
                                    <td>
                                        <div className={styles.stackedCell}>
                                            <span className={styles.secondaryText}>{user.joiningDetails.split(' ')[0]}</span>
                                            <span className={styles.secondaryText} style={{ fontSize: '10px' }}>{user.paymentType}</span>
                                        </div>
                                    </td>
                                    <td><span className={styles.moneyText}>{user.joiningFee}</span></td>
                                    <td className={styles.earnedText}>{user.totalEarned}</td>
                                    <td className={styles.withdrawnText}>{user.withdrawn}</td>
                                    <td className={styles.pendingText}>{user.pending}</td>
                                    <td>
                                        <div className={styles.activityCell}>
                                            <Activity size={12} className={styles.activityIcon} />
                                            <span className={styles.secondaryText}>{user.lastActivity}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[user.status.toLowerCase()]}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button className={styles.dots} onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}>
                                            <MoreVertical size={16} />
                                        </button>
                                        {openMenu === user.id && (
                                            <div className={styles.menu}>
                                                <button onClick={() => alert("Report for " + user.name + " downloaded")}>
                                                    <FileText size={14} /> Report
                                                </button>
                                                <button onClick={() => alert("Viewing hierarchy for " + user.name)}>
                                                    <PieChart size={14} /> Hierarchy
                                                </button>
                                                <button onClick={() => alert("KYC Details for " + user.name)}>
                                                    <ShieldCheck size={14} /> KYC Doc
                                                </button>
                                                <button onClick={() => impersonate({ id: user.id || user.userId, name: user.name, email: user.email, role: 'USER' as any, unique_id: user.userId })}>
                                                    <Key size={14} /> Login As
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ONBOARD MODAL */}
            {showModal && (
                <div className={styles.modalOverlay}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.modalContent}
                    >
                        <div className={styles.modalHeader}>
                            <h2><UserPlus /> Register New Referral User</h2>
                            <button className={styles.closeBtn} onClick={() => setShowModal(false)}><X />X</button>
                        </div>

                        <form onSubmit={handleOnboard} className={styles.onboardForm}>
                            <div className={styles.formGrid}>
                                <div className={styles.inputGroup}>
                                    <label>first Name</label>
                                    <div className={styles.inputWrapper}>
                                        <UserCircle size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter name"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        />
                                    </div>
                                </div>


                                <div className={styles.inputGroup}>
                                    <label>last Name</label>
                                    <div className={styles.inputWrapper}>
                                        <UserCircle size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Enter name"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Email Address</label>
                                    <div className={styles.inputWrapper}>
                                        <Mail size={18} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="Email for login"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Phone Number</label>
                                    <div className={styles.inputWrapper}>
                                        <PhoneIcon size={18} />
                                        <input
                                            type="text"
                                            placeholder="+91..."
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Department</label>
                                    <div className={styles.inputWrapper}>
                                        <Briefcase size={18} />
                                        <select
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        >
                                            <option value="">Select Department</option>
                                            <option value="Legal">Legal</option>
                                            <option value="Accounting">Accounting</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Sales">Sales</option>
                                        </select>
                                    </div>
                                </div>



                                <div className={styles.inputGroup}>
                                    <label>Role</label>
                                    <div className={styles.inputWrapper}>
                                        <Briefcase size={18} />
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="referral">Referral Person</option>
                                            <option value="Marketer">Marketer</option>
                                            <option value="Influencer">Influencer</option>
                                            <option value="Marketing_Agency">Marketing Agency</option>
                                            <option value="Teamlead">Team Lead</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Email_Support">Email Support</option>
                                            <option value="Call_Support">Call Support</option>
                                            <option value="Data_Entry">Data Entry</option>
                                        </select>
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Login ID (Unique)</label>
                                    <div className={styles.inputWrapper}>
                                        <Key size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. MKT-001"
                                            value={formData.loginId}
                                            onChange={(e) => setFormData({ ...formData, loginId: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label> Password</label>
                                    <div className={styles.inputWrapper}>
                                        <ShieldCheck size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Assign a password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className={styles.inputGroup}>
                                    <label>Referral Code</label>
                                    <div className={styles.inputWrapper}>
                                        <Hash size={18} />
                                        <input
                                            type="text"
                                            placeholder="Custom or generate"
                                            value={formData.referralCode}
                                            onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                                        />
                                        <button type="button" onClick={generateCode} className={styles.genBtn}>Gen</button>
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label>Percentage</label>
                                    <div className={styles.inputWrapper}>
                                        <Percent size={18} />
                                        <input
                                            required
                                            type="number"
                                            placeholder="Enter percentage"
                                            value={formData.percentage}
                                            onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                                        />
                                    </div>
                                </div>


                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" disabled={submitting} className={styles.submitBtn}>
                                    {submitting ? "Registering..." : "Register Referral User"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ReferralUserAdmin;
