import React, { useState, useMemo } from "react";
import styles from "./ReferralUsers.module.css";
import { Search, Filter, UserCircle, Briefcase, IndianRupee, PieChart, FileText, MoreVertical, CheckCircle, XCircle, ShieldCheck, Zap, Activity } from "lucide-react";

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
    level: string;
    // NEW IMPORTANT COLUMNS
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

const ROLES = ["All", "Our Staff", "Teamleads", "Managers", "Influencers", "Marketing Roles", "Marketing Agencies", "Freelance Marketers", "Digital Partners", "Legal Consultants"];
const STATUSES = ["All", "Active", "Pending", "Blocked"];

const ReferralUserAdmin: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState("All");
    const [selectedStatus, setSelectedStatus] = useState("All");
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const filteredUsers = useMemo(() => {
        return MOCK_USERS.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = selectedRole === "All" || user.role === selectedRole;
            const matchesStatus = selectedStatus === "All" || user.status === selectedStatus;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [searchTerm, selectedRole, selectedStatus]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1>Referral User Analytics & Management</h1>
                    <p>Advanced filtering and detailed tracking for all referral roles.</p>
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
                        <button className={styles.reportBtn} onClick={() => alert("Global Audit Report Generated")}>
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
                                        {role === "All" ? 165 : (MOCK_USERS.filter(u => u.role === role).length || Math.floor(Math.random() * 20))}
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
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ReferralUserAdmin;
