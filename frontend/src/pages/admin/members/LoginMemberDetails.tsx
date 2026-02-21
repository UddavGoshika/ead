
import React, { useState, useEffect } from "react";
import styles from "./LoginMemberDetails.module.css";
import axios from "axios";
import { Loader2, Search, Key, Eye, EyeOff, UserCircle, X, Edit2, Save, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";
import { formatImageUrl } from "../../../utils/imageHelper";
import { useAuth } from "../../../context/AuthContext";

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
    loginId?: string;
}

const LoginMemberDetails: React.FC = () => {
    const [members, setMembers] = useState<LoginDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMember, setSelectedMember] = useState<LoginDetail | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<LoginDetail>>({});
    const { impersonate } = useAuth();

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
                    photo: formatImageUrl(m.avatar),
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
                    showPassword: false,
                    loginId: m.loginId
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

    const handleImpersonate = (member: LoginDetail) => {
        if (window.confirm(`You are about to log in as ${member.name}. Your admin session will be temporarily replaced. Proceed?`)) {
            impersonate({
                id: member.id,
                name: member.name,
                role: member.role as any,
                email: member.email,
                unique_id: member.uniqueId
            } as any);
        }
    };

    const handleViewDetails = (member: LoginDetail) => {
        setSelectedMember(member);
        setEditData(member);
        setIsEditing(false);
    };

    const handleUpdateMember = async () => {
        if (!selectedMember) return;
        try {
            setLoading(true);
            const res = await axios.put(`/api/admin/members/${selectedMember.id}`, editData);
            if (res.data.success) {
                toast.success("Member updated successfully");
                setSelectedMember(null);
                fetchLoginDetails();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const handleViewPublicProfile = (member: LoginDetail) => {
        const url = `/profile/${member.uniqueId}`;
        window.open(url, '_blank');
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
                        <option value="legal_provider">Legal Provider</option>
                        <option value="manager">Manager</option>
                        <option value="teamlead">Team Lead</option>
                        <option value="telecaller">Telecaller</option>
                        <option value="hr">HR</option>
                        <option value="marketer">Marketer</option>
                    </select>

                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="All">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Blocked">Blocked</option>
                        <option value="Deactivated">Deactivated</option>
                        <option value="Rejected">Rejected</option>
                    </select>

                    <select value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
                        <option value="All">All Plans</option>
                        <option value="Free">Free</option>
                        <option value="Premium">Premium</option>
                    </select>
                </div>
            </div>

            {loading && !selectedMember ? (
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
                                        <img
                                            src={member.photo}
                                            alt={member.name}
                                            className={styles.avatar}
                                            onError={(e) => {
                                                e.currentTarget.src = "/avatar_placeholder.png";
                                                e.currentTarget.onerror = null;
                                            }}
                                        />
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
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleViewDetails(member)}
                                            >
                                                View/Edit
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                style={{ background: '#3b82f6', color: '#fff' }}
                                                onClick={() => handleViewPublicProfile(member)}
                                            >
                                                <ExternalLink size={14} style={{ marginRight: '4px' }} /> Open
                                            </button>
                                            <button
                                                className={styles.actionBtn}
                                                style={{ background: '#facc15', color: '#000' }}
                                                onClick={() => handleImpersonate(member)}
                                            >
                                                <UserCircle size={14} style={{ marginRight: '4px' }} /> Login
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Member Details Modal */}
            {selectedMember && (
                <div className={styles.modalOverlay} onClick={() => setSelectedMember(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{isEditing ? "Edit Member Profile" : "Member Profile Details"}</h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className={styles.closeBtn} onClick={() => setSelectedMember(null)}><X size={24} /></button>
                            </div>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.profileSection}>
                                    <div className={styles.avatarWrapper}>
                                        <img src={selectedMember.photo} alt={selectedMember.name} className={styles.largeAvatar} />
                                        {!isEditing && (
                                            <button
                                                className={styles.externalBtn}
                                                onClick={() => handleViewPublicProfile(selectedMember)}
                                                title="View Public Profile"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                        )}
                                    </div>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            className={styles.editInput}
                                            value={editData.name}
                                            onChange={e => setEditData({ ...editData, name: e.target.value })}
                                        />
                                    ) : (
                                        <h3>{selectedMember.name}</h3>
                                    )}
                                    <span className={styles.idBadge}>{selectedMember.uniqueId}</span>
                                </div>
                                <div className={styles.infoSection}>
                                    <div className={styles.infoGroup}>
                                        <label>Email Address</label>
                                        {isEditing ? (
                                            <input type="email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} className={styles.editInput} />
                                        ) : (
                                            <p>{selectedMember.email}</p>
                                        )}
                                    </div>
                                    <div className={styles.infoGroup}>
                                        <label>Phone Number</label>
                                        {isEditing ? (
                                            <input type="text" value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className={styles.editInput} />
                                        ) : (
                                            <p>{selectedMember.phone}</p>
                                        )}
                                    </div>
                                    <div className={styles.infoGroup}>
                                        <label>Custom Login ID</label>
                                        {isEditing ? (
                                            <input type="text" value={editData.loginId || ''} onChange={e => setEditData({ ...editData, loginId: e.target.value })} className={styles.editInput} placeholder="Assign a custom Login ID" />
                                        ) : (
                                            <p>{selectedMember.loginId || 'Not Assigned'}</p>
                                        )}
                                    </div>
                                    <div className={styles.infoGroup}>
                                        <label>Current Role</label>
                                        {isEditing ? (
                                            <select value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })} className={styles.editSelect}>
                                                <option value="advocate">Advocate</option>
                                                <option value="client">Client</option>
                                                <option value="legal_provider">Legal Provider</option>
                                                <option value="manager">Manager</option>
                                                <option value="teamlead">Team Lead</option>
                                                <option value="telecaller">Telecaller</option>
                                                <option value="hr">HR</option>
                                                <option value="marketer">Marketer</option>
                                            </select>
                                        ) : (
                                            <p style={{ textTransform: 'capitalize' }}>{selectedMember.role.replace('_', ' ')}</p>
                                        )}
                                    </div>
                                    <div className={styles.infoGroup}>
                                        <label>Account Status</label>
                                        {isEditing ? (
                                            <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })} className={styles.editSelect}>
                                                <option value="Active">Active</option>
                                                <option value="Pending">Pending</option>
                                                <option value="Blocked">Blocked</option>
                                                <option value="Deactivated">Deactivated</option>
                                                <option value="Rejected">Rejected</option>
                                            </select>
                                        ) : (
                                            <p className={`${styles.statusBadge} ${styles[selectedMember.status.toLowerCase()]}`}>{selectedMember.status}</p>
                                        )}
                                    </div>
                                    <div className={styles.infoGroup}>
                                        <label>Subscription Plan</label>
                                        {isEditing ? (
                                            <select value={editData.plan} onChange={e => setEditData({ ...editData, plan: e.target.value })} className={styles.editSelect}>
                                                <option value="Free">Free</option>
                                                <option value="Pro Lite">Pro Lite</option>
                                                <option value="Pro">Pro</option>
                                                <option value="Ultra Pro">Ultra Pro</option>
                                            </select>
                                        ) : (
                                            <p className={`${styles.planBadge} ${selectedMember.isPremium ? styles.premium : styles.free}`}>{selectedMember.plan}</p>
                                        )}
                                    </div>
                                    {!isEditing && (
                                        <div className={styles.infoGroup}>
                                            <label>Last Login Activity</label>
                                            <p>{selectedMember.lastLogin}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            {isEditing ? (
                                <>
                                    <button className={styles.secondaryBtn} onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button className={styles.saveBtn} onClick={handleUpdateMember} disabled={loading}>
                                        {loading ? <Loader2 className={styles.spinner} size={16} /> : <Save size={16} style={{ marginRight: '8px' }} />}
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className={styles.secondaryBtn} onClick={() => setSelectedMember(null)}>Close</button>
                                    <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                                        <Edit2 size={16} style={{ marginRight: '8px' }} />
                                        Edit Details
                                    </button>
                                    <button className={styles.primaryBtn} onClick={() => handleImpersonate(selectedMember)}>Login as {selectedMember.name}</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoginMemberDetails;
