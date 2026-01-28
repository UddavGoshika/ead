import React, { useState, useMemo } from "react";
import styles from "./SupportCategory.module.css";
import {
    Folder, Clock, ChevronDown, ChevronRight,
    Plus, MoreVertical, Search, AlertCircle, CheckCircle2,
    ExternalLink, X
} from "lucide-react";

type TicketStatus = "Open" | "In-Progress" | "Resolved" | "Closed";
type Priority = "High" | "Medium" | "Low";

interface CategoryTicket {
    id: string;
    subject: string;
    user: string;
    userType: "Advocate" | "Client";
    priority: Priority;
    status: TicketStatus;
    lastActivity: string;
    assignedAgent: string;
}

interface Category {
    id: string;
    name: string;
    description: string;
    totalTickets: number;
    activeTickets: number;
    resolvedTickets: number;
    pendingTickets: number; // New explicit pending
    agentsCount: number;
    allocatedCapacity: number; // New allocated
    workingAgents: number; // New working
    leaveAgents: number; // New on leave
    returnBacklog: number; // New still on leave/return backlog
    sla: string;
    status: "Active" | "Inactive";
    sector: "Advocate" | "Client" | "Universal"; // New Sector field
    tickets: CategoryTicket[];
}

const MOCK_CATEGORIES: Category[] = [
    {
        id: "cat-1",
        name: "Technical Support",
        description: "Hardware, software, and integration issues",
        totalTickets: 156,
        activeTickets: 45,
        resolvedTickets: 111,
        pendingTickets: 32,
        agentsCount: 8,
        allocatedCapacity: 12,
        workingAgents: 6,
        leaveAgents: 2,
        returnBacklog: 1,
        sla: "4 hours",
        status: "Active",
        sector: "Universal",
        tickets: [
            { id: "TIC-8821", subject: "Server instance not responding in Region-East", user: "John Doe", userType: "Client", priority: "High", status: "Open", lastActivity: "10 mins ago", assignedAgent: "Agent Alpha" },
            { id: "TIC-8765", subject: "API Integration error 403 on production", user: "Sarah Smith", userType: "Advocate", priority: "High", status: "In-Progress", lastActivity: "1 hour ago", assignedAgent: "Agent Beta" },
            { id: "TIC-7754", subject: "Mobile App loading delay on iOS 17", user: "Mike Ross", userType: "Client", priority: "Medium", status: "Open", lastActivity: "3 hours ago", assignedAgent: "Agent Gamma" }
        ]
    },
    {
        id: "cat-2",
        name: "Billing & Finance",
        description: "Payments, invoices, and refund requests",
        totalTickets: 89,
        activeTickets: 32,
        resolvedTickets: 57,
        pendingTickets: 18,
        agentsCount: 4,
        allocatedCapacity: 6,
        workingAgents: 3,
        leaveAgents: 1,
        returnBacklog: 0,
        sla: "24 hours",
        status: "Active",
        sector: "Client",
        tickets: [
            { id: "TIC-9912", subject: "Double charge on monthly subscription", user: "Alice Wonder", userType: "Client", priority: "Medium", status: "Open", lastActivity: "30 mins ago", assignedAgent: "Finance Pro" }
        ]
    }
];

const SupportTicketCategories: React.FC = () => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sectorFilter, setSectorFilter] = useState("All");
    const [statusFilter, setStatusFilter] = useState("All");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const filteredCategories = useMemo(() => {
        return MOCK_CATEGORIES.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesSector = sectorFilter === "All" || c.sector === sectorFilter || c.sector === "Universal";

            return matchesSearch && matchesSector;
        });
    }, [searchTerm, sectorFilter]);

    const toggleExpand = (id: string) => {
        setExpandedCategory(expandedCategory === id ? null : id);
    };

    return (
        <div className={styles.wrapper}>
            {/* HEADER */}
            <header className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1>Support Infrastructure Console</h1>
                    <p>Orchestrate high-density ticket routing and operational force analytics.</p>
                </div>
                <button className={styles.addBtn} onClick={() => setIsAddModalOpen(true)}>
                    <Plus size={18} /> Initialize Advanced Category
                </button>
            </header>

            {/* QUICK STATS */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <Folder size={20} />
                    </div>
                    <div>
                        <span className={styles.statLabel}>Active Queues</span>
                        <h3 className={styles.statValue}>{MOCK_CATEGORIES.length}</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>
                        <CheckCircle2 size={20} />
                    </div>
                    <div>
                        <span className={styles.statLabel}>Solved Tickets</span>
                        <h3 className={styles.statValue}>1,240</h3>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b" }}>
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <span className={styles.statLabel}>Pending Load</span>
                        <h3 className={styles.statValue}>56</h3>
                    </div>
                </div>
            </div>

            {/* ADVANCED FILTERING BAR */}
            <div className={styles.advancedFilterBar}>
                <div className={styles.filterSection}>
                    <label>Sector Focus</label>
                    <div className={styles.filterPills}>
                        {["All", "Advocate", "Client"].map(f => (
                            <button
                                key={f}
                                className={`${styles.filterPill} ${sectorFilter === f ? styles.activePill : ""}`}
                                onClick={() => setSectorFilter(f)}
                            >
                                {f}s
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.filterSection}>
                    <label>Operational Quick-Filter</label>
                    <div className={styles.filterPills}>
                        {["All", "Active Tickets", "Solved Tickets", "Pending Tickets"].map(f => (
                            <button
                                key={f}
                                className={`${styles.filterPill} ${statusFilter === f ? styles.activePill : ""}`}
                                onClick={() => setStatusFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.searchSection}>
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Filter by sub-sector or category naming..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* ANALYTICAL CATEGORY TABLE */}
            <div className={styles.card}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th style={{ width: "40px" }}></th>
                                <th>Category Identity</th>
                                <th>TOTAL</th>
                                <th>SOLVED</th>
                                <th>PENDING</th>
                                <th>ALLOCATED</th>
                                <th>WORKING</th>
                                <th>ON LEAVE</th>
                                <th>BACKLOG</th>
                                <th>SLA Policy</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Control</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredCategories.map((c) => (
                                <React.Fragment key={c.id}>
                                    <tr
                                        className={`${styles.categoryRow} ${expandedCategory === c.id ? styles.activeRow : ""}`}
                                        onClick={() => toggleExpand(c.id)}
                                    >
                                        <td>
                                            {expandedCategory === c.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                        </td>
                                        <td>
                                            <div className={styles.categoryCell}>
                                                <div className={styles.folderIcon}>
                                                    <Folder size={20} />
                                                </div>
                                                <div className={styles.stacked}>
                                                    <span className={styles.primaryText}>{c.name}</span>
                                                    <span className={styles.secondaryText}>{c.description}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className={styles.totalValue}>{c.totalTickets}</span></td>
                                        <td><span className={styles.solvedValue}>{c.resolvedTickets}</span></td>
                                        <td><span className={styles.pendingValue}>{c.pendingTickets}</span></td>
                                        <td><span className={styles.allocatedValue}>{c.allocatedCapacity} Seats</span></td>
                                        <td>
                                            <div className={styles.workingCell}>
                                                <div className={styles.pulseDot}></div>
                                                <span className={styles.workingValue}>{c.workingAgents} Active</span>
                                            </div>
                                        </td>
                                        <td><span className={styles.leaveValue}>{c.leaveAgents} Away</span></td>
                                        <td><span className={styles.backlogValue}>{c.returnBacklog} Resuming</span></td>
                                        <td>
                                            <span className={styles.slaBadge}><Clock size={12} /> {c.sla}</span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[c.status.toLowerCase()]}`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className={styles.actions} onClick={e => e.stopPropagation()}>
                                            <button
                                                className={styles.dots}
                                                onClick={() => setOpenMenu(openMenu === c.id ? null : c.id)}
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {openMenu === c.id && (
                                                <div className={styles.menu}>
                                                    <button><Plus size={14} /> Assign Agents</button>
                                                    <button><Clock size={14} /> Adjust SLA</button>
                                                    <button className={styles.delete}><X size={14} /> Retire Queue</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>

                                    {/* EXPANDABLE TICKET LIST */}
                                    {expandedCategory === c.id && (
                                        <tr className={styles.expansionRow}>
                                            <td colSpan={11}>
                                                <div className={styles.ticketListContainer}>
                                                    <div className={styles.ticketListHeader}>
                                                        <h4>Live Operational Pipeline: {c.name}</h4>
                                                        <button className={styles.viewAllBtn}>View Tactical Console <ExternalLink size={14} /></button>
                                                    </div>
                                                    <table className={styles.innerTable}>
                                                        <thead>
                                                            <tr>
                                                                <th>Ticket ID</th>
                                                                <th>Issue Abstract</th>
                                                                <th>Initiator</th>
                                                                <th>Priority</th>
                                                                <th>Status</th>
                                                                <th>Assigned Specialist</th>
                                                                <th>Last Interaction</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {c.tickets.map(t => (
                                                                <tr key={t.id}>
                                                                    <td><span className={styles.ticketId}>{t.id}</span></td>
                                                                    <td><span className={styles.ticketSubject}>{t.subject}</span></td>
                                                                    <td>
                                                                        <div className={styles.userCell}>
                                                                            <span className={styles.userName}>{t.user}</span>
                                                                            <span className={`${styles.userType} ${styles[t.userType.toLowerCase()]}`}>{t.userType}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className={`${styles.priorityBadge} ${styles[t.priority.toLowerCase()]}`}>
                                                                            {t.priority}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <span className={`${styles.statusDot} ${styles[t.status.toLowerCase().replace("-", "")]}`}>
                                                                            {t.status}
                                                                        </span>
                                                                    </td>
                                                                    <td><span className={styles.agentName}>{t.assignedAgent}</span></td>
                                                                    <td><span className={styles.activityTime}><Clock size={10} /> {t.lastActivity}</span></td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ADD CATEGORY MODAL */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsAddModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Initialize Advanced Support Queue</h2>
                            <button className={styles.closeBtn} onClick={() => setIsAddModalOpen(false)}>&times;</button>
                        </div>
                        <form className={styles.form} onClick={e => e.preventDefault()}>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Strategic Identifier</label>
                                    <input type="text" placeholder="e.g. VIP Portfolio Desk" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>SLA Threshold (Hours)</label>
                                    <input type="number" placeholder="2" />
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Categorical Scope Briefing</label>
                                <textarea placeholder="Define the operational boundaries and expectations for this queue..."></textarea>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Sector Targeting</label>
                                    <select>
                                        <option>Advocate Sector</option>
                                        <option>Client Sector</option>
                                        <option>Universal Access</option>
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Force Allocation</label>
                                    <input type="number" placeholder="Min agents required" />
                                </div>
                            </div>
                            <div className={styles.formActions}>
                                <button className={styles.cancelBtn} onClick={() => setIsAddModalOpen(false)}>Discard</button>
                                <button className={styles.submitBtn}>Initialize Pipeline</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportTicketCategories;
