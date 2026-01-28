import React, { useState, useEffect } from "react";
import styles from "./admindash.module.css";
import RevenueChart from "./revenuechart";
import axios from "axios";
import { Loader2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MemberDetailModal from "../../components/admin/MemberDetailModal";
import { useAuth } from "../../context/AuthContext";

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

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [statsRes, membersRes] = await Promise.all([
                axios.get('/api/admin/stats'),
                axios.get('/api/admin/members')
            ]);

            if (statsRes.data.success) setStats(statsRes.data.stats);
            if (membersRes.data.success) setMembers(membersRes.data.members);
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
                    <RevenueChart />
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
            <section className={styles.topSection} style={{ marginTop: '0' }}>
                <div className={styles.graphCard} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#3b82f6' }}>
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Manager Permission Portal</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Configure dynamic access levels for operational managers.</p>
                        </div>
                    </div>
                    <Link to="/admin/manager-permissions" className={styles.actionButton} style={{ padding: '12px 24px', textDecoration: 'none', background: '#3b82f6', color: 'white' }}>
                        Manage Permissions
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
            {selectedMember && (
                <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />
            )}
        </div>
    );
};

export default AdminDashboard;
