import React, { useState, useEffect } from "react";
import styles from "./managerdash.module.css";
import RevenueChart from "../admin/revenuechart";
import axios from "axios";
import { Loader2 } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MemberDetailModal from "../../components/admin/MemberDetailModal";
import { useSettings } from "../../context/SettingsContext";

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

const ManagerDashboard: React.FC = () => {
    const { settings } = useSettings();
    const [stats, setStats] = useState(premiumStatsDefault);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const permissions = settings?.manager_permissions || {};
    const canSeeDashboard = permissions['dashboard'] !== false;
    const canSeeMembers = permissions['members'] !== false;
    const canSeeOversight = permissions['oversight'] !== false;

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
            console.error("Error fetching manager dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    if (!canSeeDashboard) {
        return (
            <div className={styles.dashboard}>
                <div className={styles.restrictedPlaceholder}>
                    <div className={styles.restrictedIcon}>🔒</div>
                    <h2>Dashboard Access Restricted</h2>
                    <p>The system administrator has disabled the main analytics section for your account.</p>
                </div>
            </div>
        );
    }

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
            <header className={styles.header}>
                <div>
                    <h1>Operations Overview</h1>
                    <p>Real-time analytics and member management for Managers.</p>
                </div>
            </header>

            <AdminPageHeader
                title="Management Console"
                onSearch={(q) => setSearch(q)}
                placeholder="Search registered members..."
            />

            {/* ================= TOP SECTION ================= */}
            <section className={styles.topSection}>
                <div className={styles.graphCard}>
                    {canSeeOversight ? (
                        <>
                            <h2>Operational Revenue Audit</h2>
                            <RevenueChart />
                        </>
                    ) : (
                        <div className={styles.restrictedWidget}>
                            <div className={styles.restrictedIcon} style={{ fontSize: '2rem' }}>📊</div>
                            <h3>Analytics Restricted</h3>
                            <p>You do not have permission to view the revenue audit data.</p>
                        </div>
                    )}
                </div>

                <div className={styles.rightStats}>
                    {canSeeMembers ? (
                        <>
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
                        </>
                    ) : (
                        <div className={styles.statBox} style={{ opacity: 0.5, textAlign: 'center' }}>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>Member stats restricted</p>
                        </div>
                    )}
                </div>
            </section>

            {/* ================= MEMBERS LIST ================= */}
            {canSeeMembers ? (
                <div className={styles.container}>
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
            ) : (
                <div className={styles.restrictedSection}>
                    <div className={styles.restrictedIcon}>👥</div>
                    <h3>Member Management Restricted</h3>
                    <p>You do not have permission to view or manage the member list.</p>
                </div>
            )}
            {selectedMember && (
                <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />
            )}
        </div>
    );
};

export default ManagerDashboard;
