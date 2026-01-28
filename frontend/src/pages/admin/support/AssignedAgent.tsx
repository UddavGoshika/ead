import React, { useState, useMemo } from "react";
import styles from "./AssignedAgent.module.css";
import {
    Search, Plus, MoreVertical, Clock,
    Zap, BarChart3, Info, X, Filter,
    Users, Briefcase, Star, Award, Globe
} from "lucide-react";

type AgentStatus = "Active" | "Away" | "Inactive";
type Performance = "Elite" | "Standard" | "Developing";

interface SupportAgent {
    id: string;
    agentId: string;
    name: string;
    email: string;
    mobile: string;
    specialization: string;
    tier: Performance;
    solvedTickets: number;
    pendingTickets: number;
    avgResponse: string;
    efficiency: string;
    status: AgentStatus;
    lastActive: string;
    userTypes: ("Advocate" | "Client")[];
}

const MOCK_AGENTS: SupportAgent[] = [
    {
        id: "1",
        agentId: "AGT-7701",
        name: "Vikram Malhotra",
        email: "vikram.m@support.com",
        mobile: "+91 91234 56789",
        specialization: "Technical Support",
        tier: "Elite",
        solvedTickets: 1240,
        pendingTickets: 5,
        avgResponse: "12m",
        efficiency: "99.2%",
        status: "Active",
        lastActive: "Now",
        userTypes: ["Advocate", "Client"]
    },
    {
        id: "2",
        agentId: "AGT-7705",
        name: "Sneha Reddy",
        email: "sneha.r@support.com",
        mobile: "+91 88776 55443",
        specialization: "Billing & Finance",
        tier: "Standard",
        solvedTickets: 850,
        pendingTickets: 12,
        avgResponse: "45m",
        efficiency: "94.5%",
        status: "Active",
        lastActive: "15 mins ago",
        userTypes: ["Client"]
    },
    {
        id: "3",
        agentId: "AGT-7712",
        name: "Marcus Aurelius",
        email: "marcus.a@support.com",
        mobile: "+1 202 555 0199",
        specialization: "Legal Vetting",
        tier: "Elite",
        solvedTickets: 420,
        pendingTickets: 2,
        avgResponse: "2h",
        efficiency: "98.8%",
        status: "Away",
        lastActive: "2 hours ago",
        userTypes: ["Advocate"]
    }
];

const SupportAgents: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [userTypeFilter, setUserTypeFilter] = useState<"All" | "Advocate" | "Client">("All");
    const [categoryFilter, setCategoryFilter] = useState("All");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const filteredAgents = useMemo(() => {
        return MOCK_AGENTS.filter(agent => {
            const matchesSearch =
                agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                agent.agentId.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesUserType =
                userTypeFilter === "All" || agent.userTypes.includes(userTypeFilter as any);

            const matchesCategory =
                categoryFilter === "All" || agent.specialization === categoryFilter;

            return matchesSearch && matchesUserType && matchesCategory;
        });
    }, [searchTerm, userTypeFilter, categoryFilter]);

    return (
        <div className={styles.wrapper}>
            {/* HEADER */}
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1>Support Operations Force</h1>
                    <p>Manage specialized agents, performance tiers, and routing logic.</p>
                </div>
                <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} /> Enlist New Agent
                </button>
            </header>

            {/* ADVANCED FILTERING BAR */}
            <div className={styles.filterCard}>
                <div className={styles.filterRow}>
                    <div className={styles.searchContainer}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by Agent Intelligence ID or Name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.filterOptions}>
                    <div className={styles.filterGroup}>
                        <label>User Sector</label>
                        <div className={styles.pills}>
                            {["All", "Advocate", "Client"].map(type => (
                                <button
                                    key={type}
                                    className={`${styles.pill} ${userTypeFilter === type ? styles.active : ""} `}
                                    onClick={() => setUserTypeFilter(type as any)}
                                >
                                    {type}s
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Core Specialization</label>
                        <select
                            className={styles.select}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Technical Support">Technical Support</option>
                            <option value="Billing & Finance">Billing & Finance</option>
                            <option value="Legal Vetting">Legal Vetting</option>
                        </select>
                    </div>

                    <div className={styles.filterGroup}>
                        <label>Performance Tier</label>
                        <select className={styles.select}>
                            <option>All Tiers</option>
                            <option>Elite (95%+ Eff)</option>
                            <option>Standard</option>
                            <option>Developing</option>
                        </select>
                    </div>

                    <button className={styles.advancedBtn}>
                        <Filter size={14} /> Many More Filters
                    </button>
                </div>
            </div>

            {/* PERFORMANCE GRID - STATS */}
            <div className={styles.statsRow}>
                <div className={styles.miniStat}>
                    <Users size={16} /> <span>{MOCK_AGENTS.length} Assigned Agents</span>
                </div>
                <div className={styles.miniStat}>
                    <Zap size={16} /> <span>96.4% Avg Efficiency</span>
                </div>
                <div className={styles.miniStat}>
                    <Award size={16} /> <span>12 Elite Performers</span>
                </div>
            </div>

            {/* AGENTS TABLE */}
            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Agent Identity</th>
                                <th>Sector Focus</th>
                                <th>Specialization</th>
                                <th>SOLVED / PEND</th>
                                <th>Efficiency Index</th>
                                <th>Avg Response</th>
                                <th>Tier</th>
                                <th>Active Status</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAgents.map((agent) => (
                                <tr key={agent.id}>
                                    <td>
                                        <div className={styles.agentCell}>
                                            <div className={styles.avatar}>{agent.name.charAt(0)}</div>
                                            <div className={styles.stacked}>
                                                <span className={styles.primaryText}>{agent.name}</span>
                                                <span className={styles.idText}>{agent.agentId}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.userTypes}>
                                            {agent.userTypes.map(ut => (
                                                <span key={ut} className={`${styles.typeBadge} ${styles[ut.toLowerCase()]} `}>
                                                    {ut}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.specText}><Briefcase size={12} /> {agent.specialization}</span>
                                    </td>
                                    <td>
                                        <div className={styles.analyticsCell}>
                                            <span className={styles.solvedText}>{agent.solvedTickets} S</span>
                                            <span className={styles.pendingText}>{agent.pendingTickets} P</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.efficiencyBox}>
                                            <BarChart3 size={12} /> {agent.efficiency}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.responseTime}><Clock size={12} /> {agent.avgResponse}</span>
                                    </td>
                                    <td>
                                        <span className={`${styles.tierBadge} ${styles[agent.tier.toLowerCase()]} `}>
                                            <Star size={10} /> {agent.tier}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[agent.status.toLowerCase()]} `}>
                                            {agent.status}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button
                                            className={styles.dots}
                                            onClick={() => setOpenMenu(openMenu === agent.id ? null : agent.id)}
                                        >
                                            <MoreVertical size={16} />
                                        </button>
                                        {openMenu === agent.id && (
                                            <div className={styles.menu}>
                                                <button><Info size={14} /> Full Dossier</button>
                                                <button><Zap size={14} /> Reassign Tickets</button>
                                                <button className={styles.delete}><X size={14} /> Revoke Access</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD AGENT MODAL */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Commission Support Agent</h2>
                            <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>&times;</button>
                        </div>
                        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Agent Display Name</label>
                                    <input type="text" placeholder="e.g. Rahul Sharma" required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Enterprise Email</label>
                                    <input type="email" placeholder="rahul@enterprise.support" required />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Strategic Sector</label>
                                    <select>
                                        <option>Advocate Support</option>
                                        <option>Client Support</option>
                                        <option>Universal Routing</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Core Domain</label>
                                    <select>
                                        <option>Technical Infrastructure</option>
                                        <option>Billing & Compliance</option>
                                        <option>User Vetting</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Assigned Region</label>
                                <div className={styles.globeInput}>
                                    <Globe size={16} />
                                    <input type="text" placeholder="Global / Region Specific" />
                                </div>
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>Discard</button>
                                <button type="submit" className={styles.submitBtn}>Enlist Agent</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportAgents;
