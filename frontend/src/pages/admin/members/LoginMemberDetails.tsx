
import React, { useState, useEffect } from "react";
import styles from "./LoginMemberDetails.module.css";
import axios from "axios";
import { Loader2, Search, Key, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

interface LoginDetail {
    id: string;
    serialNo: number;
    photo: string;
    name: string;
    uniqueId: string;
    email: string;
    phone: string;
    role: string;
    status: string;
    isPremium: boolean;
    plan: string;
    lastLogin: string;
    passwordHash: string; // Will show masked or placeholder
    showPassword?: boolean;
}

const LoginMemberDetails: React.FC = () => {
    const [members, setMembers] = useState<LoginDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Filters
    const [filterRole, setFilterRole] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [filterPlan, setFilterPlan] = useState("All");

    useEffect(() => {
        fetchLoginDetails();
    }, []);

    const fetchLoginDetails = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/members');
            if (res.data.success) {
                const mapped: LoginDetail[] = res.data.members.map((m: any, index: number) => ({
                    id: m.id,
                    serialNo: index + 1,
                    photo: m.avatar || '/avatar_placeholder.png',
                    name: m.name,
                    uniqueId: m.unique_id || m.code,
                    email: m.email,
                    phone: m.phone,
                    role: m.role,
                    status: m.status,
                    isPremium: m.plan && m.plan !== 'Free',
                    plan: m.plan || 'Free',
                    lastLogin: m.lastActionDate ? new Date(m.lastActionDate).toLocaleString() : 'N/A',
                    passwordHash: m.plainPassword || "Not Saved",
                    showPassword: false
                }));
                setMembers(mapped);
            }
        } catch (err) {
            console.error("Error fetching login details:", err);
            toast.error("Failed to fetch member details");
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordReset = async (id: string, email: string) => {
        if (window.confirm(`Send password reset link to ${email}?`)) {
            try {
                await axios.post('/api/auth/forgot-password', { email });
                toast.success(`Reset link sent to ${email}`);
            } catch (err) {
                toast.error("Failed to send reset link");
            }
        }
    };

    const togglePasswordVisibility = (id: string) => {
        setMembers(prev => prev.map(m =>
            m.id === id ? { ...m, showPassword: !m.showPassword } : m
        ));
    };

    const filteredMembers = members.filter(m => {
        const matchesSearch =
            (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.uniqueId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (m.phone || "").includes(searchTerm);

        const matchesRole = filterRole === "All" || m.role.toLowerCase() === filterRole.toLowerCase();
        const matchesStatus = filterStatus === "All" || m.status === filterStatus;
        const matchesPlan = filterPlan === "All" || (filterPlan === "Premium" ? m.isPremium : !m.isPremium);

        return matchesSearch && matchesRole && matchesStatus && matchesPlan;
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Login Member Details</h1>
                <p>Comprehensive login and profile credentials view</p>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Search by ID, Name, Email, Phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.filters}>
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                        <option value="All">All Roles</option>
                        <option value="advocate">Advocate</option>
                        <option value="client">Client</option>
                    </select>

                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Blocked">Blocked</option>
                    </select>

                    <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
                        <option value="All">All Plans</option>
                        <option value="Free">Free</option>
                        <option value="Premium">Premium</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loading}>
                    <Loader2 className={styles.spinner} />
                    <span>Loading credentials...</span>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Profile</th>
                                <th>Name / ID</th>
                                <th>Contact Credentials</th>
                                <th>Plan Details</th>
                                <th>Status</th>
                                <th>Password</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member, idx) => (
                                <tr key={member.id}>
                                    <td>#{idx + 1}</td>
                                    <td>
                                        <img src={member.photo} alt={member.name} className={styles.avatar} />
                                    </td>
                                    <td>
                                        <div className={styles.nameCell}>
                                            <span className={styles.name}>{member.name}</span>
                                            <span className={styles.idBadge}>{member.uniqueId}</span>
                                            <span className={styles.roleBadge}>{member.role}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.contactCell}>
                                            <div className={styles.email}>{member.email}</div>
                                            <div className={styles.phone}>{member.phone}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.planBadge} ${member.isPremium ? styles.premium : styles.free}`}>
                                            {member.plan}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[member.status.toLowerCase()]}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.passwordCell}>
                                            <span className={styles.passDots}>
                                                {member.showPassword ? member.passwordHash : (member.passwordHash === "Not Saved" ? "Not Saved" : "••••••••")}
                                            </span>
                                            {member.passwordHash !== "Not Saved" && (
                                                <button
                                                    className={styles.toggleBtn}
                                                    onClick={() => togglePasswordVisibility(member.id)}
                                                    title={member.showPassword ? "Hide Password" : "Show Password"}
                                                >
                                                    {member.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            )}
                                            <button
                                                className={styles.resetBtn}
                                                onClick={() => handlePasswordReset(member.id, member.email)}
                                                title="Send Password Reset Link"
                                            >
                                                <Key size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td>
                                        <button className={styles.actionBtn}>View Full</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LoginMemberDetails;
