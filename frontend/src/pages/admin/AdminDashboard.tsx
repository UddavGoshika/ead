import React, { useState, useEffect } from "react";
import styles from "./admindash.module.css";
import RevenueChart from "./revenuechart";
import axios from "axios";
import { Loader2, ShieldCheck, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MemberDetailModal from "../../components/admin/MemberDetailModal";
import { useAuth } from "../../context/AuthContext";
import StaffManagement from "../../components/admin/StaffManagement";

/* ================= TYPES ================= */
type MemberStatus = "Active" | "Blocked" | "Deactivated" | "Deleted";

interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
    status: MemberStatus;
    createdAt: string;
    verified: boolean;
    location: string;
    avatar?: string;
}

const premiumStatsDefault = {
    totalUsers: 0,
    totalAdvocates: 0,
    totalClients: 0,
    verifiedAdvocates: 0,
    pendingAdvocates: 0,
    activeUnits: 0,
    blockedUnits: 0,
    deactivatedUnits: 0,
    deletedUnits: 0
};

const AdminDashboard: React.FC = () => {
    // const { openAdvocateReg, openClientReg } = useAuth();
    const [stats, setStats] = useState(premiumStatsDefault);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [revenueData, setRevenueData] = useState([]); // Store chart data

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [statsRes, membersRes, revenueRes] = await Promise.all([
                axios.get('/api/admin/stats'),
                axios.get('/api/admin/members'),
                axios.get('/api/admin/revenue-chart')
            ]);

            if (statsRes.data.success) setStats(statsRes.data.stats);
            if (membersRes.data.success) setMembers(membersRes.data.members);
            if (revenueRes.data.success) setRevenueData(revenueRes.data.data);
        } catch (err) {
            console.error("Error fetching admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await axios.patch(`/api/admin/members/${id}/status`, { status: newStatus });
            if (res.data.success) {
                setMembers(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as MemberStatus } : m));
            }
        } catch (err) {
            alert("Error updating status");
        }
    };


    const filteredMembers = members.filter(m =>
        (m.name || "N/A").toLowerCase().includes(search.toLowerCase()) ||
        (m.email || "").toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className={styles.spinner} />
                <p>Loading real-time database data...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>

            {/* <AdminPageHeader
                title="Dashboard Overview"
                onSearch={(q, r) => console.log('Searching', q, 'for', r)}
                onAddClick={(role) => role === 'advocate' ? openAdvocateReg() : openClientReg()}
            /> */}

            {/* ================= TOP SECTION ================= */}
            <section className={styles.topSection}>
                <div className={styles.graphCard}>
                    <RevenueChart data={revenueData} />
                </div>

                <div className={styles.rightStats}>
                    <div className={styles.statBox}>
                        <h4>Total Advocates</h4>
                        <p>{stats.totalAdvocates}</p>
                    </div>
                    <div className={styles.statBox}>
                        <h4>Total Clients</h4>
                        <p>{stats.totalClients}</p>
                    </div>
                    <div className={styles.statBox}>
                        <h4>Total Users</h4>
                        <p>{stats.totalUsers}</p>
                    </div>
                </div>
            </section>

            {/* ================= ADMIN TOOLS ================= */}
            <section className={`${styles.topSection} ${styles.permissionSection}`}>
                <div className={`${styles.graphCard} ${styles.permissionCard}`}>
                    <div className={styles.permissionLeft}>
                        <div className={styles.permissionIcon}>
                            <ShieldCheck size={32} />
                        </div>
                        <div className={styles.permissionText}>
                            <h2>Manager Permission Portal</h2>
                            <p>Configure dynamic access levels for operational managers.</p>
                        </div>
                    </div>

                    <Link
                        to="/admin/manager-permissions"
                        className={`${styles.actionButton} ${styles.permissionBtn}`}
                    >
                        Manage Permissions
                    </Link>
                </div>

                <div className={`${styles.graphCard} ${styles.staffHubCard}`} style={{ marginLeft: '20px' }}>
                    <div className={styles.permissionLeft}>
                        <div className={styles.permissionIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <Briefcase size={32} />
                        </div>
                        <div className={styles.permissionText}>
                            <h2>Operational Staff Hub</h2>
                            <p>Access the unified outbound calling and lead management portal.</p>
                        </div>
                    </div>

                    <Link
                        to="/staff/dashboard"
                        className={`${styles.actionButton}`}
                        style={{ background: '#3b82f6' }}
                    >
                        Open Staff Hub
                    </Link>
                </div>
            </section>


            {/* ================= MEMBERS LIST ================= */}
            <div className={styles.container}>
                {/* <AdminPageHeader
                    title="Member Management"
                    onSearch={(q) => setSearch(q)} // Temporary connection to existing search
                    onAddClick={(role) => role === 'advocate' ? openAdvocateReg() : openClientReg()}
                    placeholder="Search members..."
                /> */}

                <div className={styles.summaryGrid}>
                    <div className={styles.summaryCard}>
                        <h3>Total Members</h3>
                        <p>{stats.totalUsers}</p>
                    </div>
                    <div className={styles.summaryCard}>
                        <h3>Verified Adv.</h3>
                        <p className={styles.green}>{stats.verifiedAdvocates}</p>
                    </div>
                    <div className={styles.summaryCard}>
                        <h3>Pending Adv.</h3>
                        <p className={styles.orange}>{stats.pendingAdvocates}</p>
                    </div>
                    <div className={styles.summaryCard}>
                        <h3>Active Units</h3>
                        <p className={styles.green}>{stats.activeUnits}</p>
                    </div>
                    <div className={styles.summaryCard}>
                        <h3>Blocked</h3>
                        <p className={styles.red}>{stats.blockedUnits}</p>
                    </div>
                    <div className={styles.summaryCard}>
                        <h3>Deactivated</h3>
                        <p className={styles.gray}>{stats.deactivatedUnits}</p>
                    </div>
                    <div className={styles.summaryCard}>
                        <h3>Deleted</h3>
                        <p className={styles.gray}>{stats.deletedUnits}</p>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name / Email</th>
                                <th>Role</th>
                                <th>Location</th>
                                <th>Verification</th>
                                <th>Since</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredMembers.map((m, index) => (
                                <tr key={m.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <div className={styles.nameCell}>
                                            <div className={styles.avatarPlaceholder}>{m.name?.charAt(0) || 'U'}</div>
                                            <div>
                                                <strong>{m.name || 'Anonymous'}</strong>
                                                <div className={styles.idCode}>{m.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={styles.roleBadge}>{m.role}</span></td>
                                    <td>{m.location}</td>
                                    <td>
                                        <span className={`${styles.badge} ${m.verified ? styles.approved : styles.pending}`}>
                                            {m.role?.toLowerCase() === 'advocate' ? (m.verified ? "Verified" : "Pending") : "N/A"}
                                        </span>
                                    </td>
                                    <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <select
                                            className={styles.statusSelect}
                                            value={m.status}
                                            onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Blocked">Blocked</option>
                                            <option value="Deactivated">Deactivated</option>
                                            <option value="Deleted">Deleted</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button className={styles.actionButton} onClick={() => setSelectedMember(m)}>View Detail</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= STAFF & PARTNERS SECTION ================= */}
            <StaffManagement />

            {selectedMember && (
                <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />
            )}
        </div>
    );
};

export default AdminDashboard;
