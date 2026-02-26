import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
import styles from "./ContactQueries.module.css";
import {
    Search, Download as ExportIcon,
    Mail, Phone, Calendar,
    User, MessageSquare, CheckCircle, Clock,
    RotateCcw, Shield, ExternalLink, Send,
    AlertCircle, Globe, Smartphone, MoreVertical,
    Trash2, AlertTriangle, UserPlus, Info
} from "lucide-react";

type QueryStatus = "New" | "In Progress" | "Resolved";
type Priority = "Low" | "Medium" | "High" | "Urgent";
type Source = "Website" | "App" | "Email" | "WhatsApp";

type Query = {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: string;
    subject: string;
    status: QueryStatus;
    priority: Priority;
    source: Source;
    created: string;
    lastActive: string;
    assignedTo: string;
    message: string;
};

const staffList = ["Amit Khanna", "Sneha Reddy", "Robert D'Souza", "Priya Menon", "Vikram Malhotra"];


const ContactQueries: React.FC = () => {
    const [queries, setQueries] = useState<Query[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await axios.get('/api/admin/contacts');
                if (res.data.success) {
                    const mapped: Query[] = res.data.contacts.map((c: any) => ({
                        id: c._id,
                        name: c.name || 'Unknown User',
                        email: c.email || '',
                        phone: c.phone || '',
                        type: 'Inquiry',
                        subject: c.subject || 'General Contact',
                        status: 'New',
                        priority: 'Medium',
                        source: (c.source as Source) || 'Website',
                        created: new Date(c.createdAt).toLocaleDateString(),
                        lastActive: 'Just now',
                        assignedTo: '',
                        message: c.message || 'No content'
                    }));
                    setQueries(mapped);
                }
            } catch (err) {
                console.error("Error fetching contacts:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"All" | QueryStatus>("All");
    const [priorityFilter, setPriorityFilter] = useState<"All" | Priority>("All");
    const [sourceFilter, setSourceFilter] = useState<"All" | Source>("All");
    const [typeFilter, setTypeFilter] = useState<"All" | string>("All");
    const [assignedFilter, setAssignedFilter] = useState<"All" | "Assigned" | "Unassigned">("All");

    const [assigningId, setAssigningId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const filteredQueries = useMemo(() => {
        return queries.filter(q => {
            const matchesSearch =
                q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                q.subject.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === "All" || q.status === statusFilter;
            const matchesPriority = priorityFilter === "All" || q.priority === priorityFilter;
            const matchesSource = sourceFilter === "All" || q.source === sourceFilter;
            const matchesType = typeFilter === "All" || q.type === typeFilter;
            const matchesAssigned =
                assignedFilter === "All" ||
                (assignedFilter === "Assigned" && q.assignedTo) ||
                (assignedFilter === "Unassigned" && !q.assignedTo);

            return matchesSearch && matchesStatus && matchesPriority && matchesSource && matchesType && matchesAssigned;
        });
    }, [queries, searchTerm, statusFilter, priorityFilter, sourceFilter, typeFilter, assignedFilter]);

    const handleAssign = (queryId: string, staff: string) => {
        setQueries(prev =>
            prev.map(q =>
                q.id === queryId ? { ...q, assignedTo: staff, status: "In Progress" } : q
            )
        );
        setAssigningId(null);
    };

    const handleUpdateStatus = (queryId: string, newStatus: QueryStatus) => {
        setQueries(prev =>
            prev.map(q => q.id === queryId ? { ...q, status: newStatus } : q)
        );
        if (selectedQuery?.id === queryId) {
            setSelectedQuery(prev => prev ? { ...prev, status: newStatus } : null);
        }
    };

    const StatusBadge = ({ status }: { status: QueryStatus }) => {
        switch (status) {
            case "New": return <span className={`${styles.badge} ${styles.new}`}>New</span>;
            case "In Progress": return <span className={`${styles.badge} ${styles.inProgress}`}>Active</span>;
            case "Resolved": return <span className={`${styles.badge} ${styles.resolved}`}>Resolved</span>;
            default: return null;
        }
    };

    const PriorityBadge = ({ priority }: { priority: Priority }) => {
        const priorityClass = priority.toLowerCase();
        return (
            <span className={`${styles.pBadge} ${styles[priorityClass]}`}>
                <AlertCircle size={10} /> {priority}
            </span>
        );
    };

    const SourceIcon = ({ source }: { source: Source }) => {
        switch (source) {
            case "Website": return <span title="Website"><Globe size={14} /></span>;
            case "App": return <span title="Mobile App"><Smartphone size={14} /></span>;
            case "Email": return <span title="Email"><Mail size={14} /></span>;
            case "WhatsApp": return <span title="WhatsApp"><MessageSquare size={14} /></span>;
            default: return null;
        }
    };

    return (
        <div className={styles.wrapper}>
            <header className={styles.pageHeader}>
                <div className={styles.headerInfo}>
                    <h1>Omnichannel Support Management</h1>
                    <p>Track customer interactions across App, Web, and Social platforms.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.exportBtn}>
                        <ExportIcon size={18} /> Export CSV
                    </button>
                    <button className={styles.premiumBtn}>
                        <Shield size={18} /> Security Audit
                    </button>
                </div>
            </header>

            {/* EXPANDED ANALYTICS */}
            <div className={styles.analyticsRow}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                        <AlertTriangle size={20} />
                    </div>
                    <div className={styles.statData}>
                        <h3>{queries.filter(q => q.priority === "Urgent").length}</h3>
                        <p>Urgent Cases</p>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <CheckCircle size={20} />
                    </div>
                    <div className={styles.statData}>
                        <h3>{queries.filter(q => q.priority === "Urgent").length}</h3>
                        <p>Solved Cases</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                        <Clock size={20} />
                    </div>
                    <div className={styles.statData}>
                        <h3>{queries.filter(q => q.status === "New").length}</h3>
                        <p>New (Pending)</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                        <CheckCircle size={20} />
                    </div>
                    <div className={styles.statData}>
                        <h3>{Math.round((queries.filter(q => q.status === "Resolved").length / queries.length) * 100)}%</h3>
                        <p>Resolution Rate</p>
                    </div>
                </div>
            </div>

            {/* QUICK VIEW GRIDS */}
            <div className={styles.gridsWrapper}>
                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#ef4444" }} /> Urgent Pending Inquiries</h3>
                        <button onClick={() => setStatusFilter("New")}>View All</button>
                    </div>
                    <div className={styles.statusGrid}>
                        {queries.filter(q => q.status !== "Resolved").slice(0, 4).map(q => (
                            <div key={q.id} className={styles.queryCard} onClick={() => setSelectedQuery(q)}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardAvatar}>{q.name.charAt(0)}</div>
                                    <PriorityBadge priority={q.priority} />
                                </div>
                                <div className={styles.cardBody}>
                                    <strong>{q.name}</strong>
                                    <p>{q.subject}</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>{q.lastActive}</span>
                                    <SourceIcon source={q.source} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.gridContainer}>
                    <div className={styles.gridHeader}>
                        <h3><div className={styles.dot} style={{ background: "#22c55e" }} /> Recently Solved Cases</h3>
                        <button onClick={() => setStatusFilter("Resolved")}>View History</button>
                    </div>
                    <div className={styles.statusGrid}>
                        {queries.filter(q => q.status === "Resolved").slice(0, 4).map(q => (
                            <div key={q.id} className={styles.queryCard} onClick={() => setSelectedQuery(q)}>
                                <div className={styles.cardTop}>
                                    <div className={styles.cardAvatar} style={{ background: "rgba(34, 197, 94, 0.2)", color: "#22c55e" }}>{q.name.charAt(0)}</div>
                                    <span className={styles.solvedMarker}><CheckCircle size={10} /> Solved</span>
                                </div>
                                <div className={styles.cardBody}>
                                    <strong>{q.name}</strong>
                                    <p>{q.subject}</p>
                                </div>
                                <div className={styles.cardFooter}>
                                    <span>{q.created}</span>
                                    <SourceIcon source={q.source} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ADVANCED FILTER SECTION */}
            <div className={styles.filterSection}>
                <div className={styles.filterTop}>
                    <div className={styles.searchBar}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search Customer name, ID, or subject..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.quickFilters}>
                        <select
                            className={styles.filterSelect}
                            value={sourceFilter}
                            onChange={(e) => setSourceFilter(e.target.value as any)}
                        >
                            <option value="All">All Sources</option>
                            <option value="Website">Website</option>
                            <option value="App">App</option>
                            <option value="Email">Email</option>
                            <option value="WhatsApp">WhatsApp</option>
                        </select>
                        <select
                            className={styles.filterSelect}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="All">All Categories</option>
                            <option value="Bug Report">Bug Report</option>
                            <option value="Account Problem">Account Problem</option>
                            <option value="General Inquiry">General Inquiry</option>
                        </select>
                    </div>
                </div>

                <div className={styles.pillsContainer}>
                    <div className={styles.pillGroup}>
                        <span className={styles.label}>Live Status</span>
                        <div className={styles.pills}>
                            {["All", "New", "In Progress", "Resolved"].map(s => (
                                <button
                                    key={s}
                                    className={`${styles.pill} ${statusFilter === s ? styles.activePill : ""}`}
                                    onClick={() => setStatusFilter(s as any)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.pillGroup}>
                        <span className={styles.label}>Priority Level</span>
                        <div className={styles.pills}>
                            {["All", "Low", "Medium", "High", "Urgent"].map(p => (
                                <button
                                    key={p}
                                    className={`${styles.pill} ${priorityFilter === p ? styles.activePill : ""}`}
                                    onClick={() => setPriorityFilter(p as any)}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.pillGroup}>
                        <span className={styles.label}>Ownership</span>
                        <div className={styles.pills}>
                            {["All", "Assigned", "Unassigned"].map(a => (
                                <button
                                    key={a}
                                    className={`${styles.pill} ${assignedFilter === a ? styles.activePill : ""}`}
                                    onClick={() => setAssignedFilter(a as any)}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* DATA TABLE */}
            <div className={styles.mainCard}>
                <div className={styles.tableScroll}>
                    {loading ? (
                        <div className={styles.emptyContainer}>
                            <RotateCcw className={styles.spin} size={48} />
                            <h3>Fetching Inquiries...</h3>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Client Profile</th>
                                    <th>Case Inquiry</th>
                                    <th>Channel</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Activity</th>
                                    <th>Assignment</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQueries.map((q, idx) => (
                                    <tr key={q.id}>
                                        <td><span className={styles.idText}>{idx + 1}</span></td>
                                        <td>
                                            <div className={styles.clientCell}>
                                                <div className={styles.avatarMini}>{q.name.charAt(0)}</div>
                                                <div className={styles.clientInfo}>
                                                    <strong>{q.name}</strong>
                                                    <span>{q.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.caseCell}>
                                                <p>{q.subject}</p>
                                                <small>{q.id} • {q.type}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.sourceBox}>
                                                <SourceIcon source={q.source} />
                                                <span>{q.source}</span>
                                            </div>
                                        </td>
                                        <td><PriorityBadge priority={q.priority} /></td>
                                        <td><StatusBadge status={q.status} /></td>
                                        <td>
                                            <div className={styles.activityCell}>
                                                <strong>{q.lastActive}</strong>
                                                <span>since {q.created}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {q.assignedTo ? (
                                                <div className={styles.agentTag}>
                                                    <User size={12} /> {q.assignedTo}
                                                </div>
                                            ) : assigningId === q.id ? (
                                                <select
                                                    className={styles.miniSelect}
                                                    onChange={(e) => handleAssign(q.id, e.target.value)}
                                                    autoFocus
                                                >
                                                    <option value="">Choose Agent</option>
                                                    {staffList.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            ) : (
                                                <button className={styles.claimBtn} onClick={() => setAssigningId(q.id)}>
                                                    <UserPlus size={12} /> Claim
                                                </button>
                                            )}
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div className={styles.actionToolbar}>
                                                {q.status === "Resolved" ? (
                                                    <button
                                                        className={styles.actionReopen}
                                                        onClick={() => handleUpdateStatus(q.id, "In Progress")}
                                                    >
                                                        <RotateCcw size={14} /> <span>Reopen</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        className={styles.actionResolve}
                                                        onClick={() => handleUpdateStatus(q.id, "Resolved")}
                                                    >
                                                        <CheckCircle size={14} /> <span>Close</span>
                                                    </button>
                                                )}

                                                <button className={styles.iconBtn} onClick={() => setSelectedQuery(q)}>
                                                    <ExternalLink size={16} />👁
                                                </button>

                                                <div className={styles.moreActions}>
                                                    <button
                                                        className={styles.iconBtn}
                                                        onClick={() => setOpenMenuId(openMenuId === q.id ? null : q.id)}
                                                    >
                                                        <MoreVertical size={16} />⋮
                                                    </button>
                                                    {openMenuId === q.id && (
                                                        <div className={styles.dropdownMenu}>
                                                            <button><Info size={14} /> View History</button>
                                                            <button><Send size={14} /> Escalate</button>
                                                            <button className={styles.spam}><AlertTriangle size={14} /> Mark Spam</button>
                                                            <button className={styles.delete}><Trash2 size={14} /> Delete</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {filteredQueries.length === 0 && (
                    <div className={styles.emptyContainer}>
                        <Shield size={64} />
                        <h3>Clean Desk Policy Active</h3>
                        <p>No unresolved inquiries match these filter settings.</p>
                        <button className={styles.resetBtn} onClick={() => {
                            setSearchTerm("");
                            setStatusFilter("All");
                            setPriorityFilter("All");
                            setSourceFilter("All");
                            setTypeFilter("All");
                        }}>Reset Filters</button>
                    </div>
                )}
            </div>

            {/* DETAIL MODAL */}
            {selectedQuery && (
                <div className={styles.glassOverlay} onClick={() => setSelectedQuery(null)}>
                    <div className={styles.luxuryModal} onClick={e => e.stopPropagation()}>
                        <header className={styles.modalHeader}>
                            <div className={styles.titleArea}>
                                <div className={styles.iconBadge}><MessageSquare size={24} /></div>
                                <div>
                                    <h3>Ticket Control Center</h3>
                                    <p>{selectedQuery.id} • Assigned to {selectedQuery.assignedTo || "Pool"}</p>
                                </div>
                            </div>
                            <button className={styles.closeModal} onClick={() => setSelectedQuery(null)}>&times;</button>
                        </header>

                        <div className={styles.modalBody}>
                            <div className={styles.gridSection}>
                                <div className={styles.infoBlock}>
                                    <label>Client Intelligence</label>
                                    <div className={styles.cardInfo}>
                                        <p><User size={14} /> {selectedQuery.name}</p>
                                        <p><Mail size={14} /> {selectedQuery.email}</p>
                                        <p><Phone size={14} /> {selectedQuery.phone}</p>
                                        <p><Globe size={14} /> Origin: {selectedQuery.source}</p>
                                    </div>
                                </div>
                                <div className={styles.infoBlock}>
                                    <label>Case Management</label>
                                    <div className={styles.cardInfo}>
                                        <div className={styles.statusRow}>
                                            <StatusBadge status={selectedQuery.status} />
                                            <PriorityBadge priority={selectedQuery.priority} />
                                        </div>
                                        <p><Calendar size={14} /> Opened: {selectedQuery.created}</p>
                                        <p><Clock size={14} /> Last Activity: {selectedQuery.lastActive}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.messageContent}>
                                <label>Interaction Subject</label>
                                <h4>{selectedQuery.subject}</h4>
                                <label>Client Transcript</label>
                                <div className={styles.chatBubble}>
                                    {selectedQuery.message}
                                </div>
                            </div>
                        </div>

                        <footer className={styles.modalFooter}>
                            <div className={styles.footerLeft}>
                                {selectedQuery.status === "Resolved" ? (
                                    <button className={styles.reopenAction} onClick={() => handleUpdateStatus(selectedQuery.id, "In Progress")}>
                                        <RotateCcw size={16} /> Reopen Ticket
                                    </button>
                                ) : (
                                    <button className={styles.resolveAction} onClick={() => handleUpdateStatus(selectedQuery.id, "Resolved")}>
                                        <CheckCircle size={16} /> Finalize Case
                                    </button>
                                )}
                            </div>
                            <div className={styles.footerRight}>
                                <button className={styles.secondaryAction}>Transfer</button>
                                <button className={styles.primaryAction}>
                                    <Send size={16} /> Compose Reply
                                </button>
                            </div>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactQueries;
