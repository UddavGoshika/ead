import React, { useState, useMemo, useEffect } from "react";
import styles from "./ActiveTickets.module.css";
import axios from "axios";
import { Loader2, X, MessageSquare, Clock, User, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";

type TicketStatus = "Open" | "In Progress" | "Solved";

type Ticket = {
    id: string;
    _id?: string;
    subject: string;
    user: string;
    category: string;
    priority: "Low" | "Medium" | "High";
    status: TicketStatus;
    assignedTo: string;
    created: string;
    messages?: { sender: string, text: string, timestamp: string }[];
};

interface TicketDetailModalProps {
    ticket: Ticket;
    onClose: () => void;
    onResolve: (id: string) => Promise<void>;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ ticket, onClose, onResolve }) => {
    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>Ticket Detail: {ticket.id}</h3>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.modalInfoGrid}>
                        <div className={styles.infoBox}>
                            <label><User size={14} /> User</label>
                            <span>{ticket.user}</span>
                        </div>
                        <div className={styles.infoBox}>
                            <label><MessageSquare size={14} /> Subject</label>
                            <span>{ticket.subject}</span>
                        </div>
                        <div className={styles.infoBox}>
                            <label><ShieldAlert size={14} /> Priority</label>
                            <span className={`${styles.badge} ${styles[ticket.priority.toLowerCase()]}`}>{ticket.priority}</span>
                        </div>
                        <div className={styles.infoBox}>
                            <label><Clock size={14} /> Created</label>
                            <span>{ticket.created}</span>
                        </div>
                    </div>

                    <div className={styles.chatSection}>
                        <h4><MessageSquare size={16} /> Conversation History</h4>
                        <div className={styles.chatContainer}>
                            {ticket.messages && ticket.messages.length > 0 ? (
                                ticket.messages.map((msg, i) => (
                                    <div key={i} className={`${styles.chatMsg} ${msg.sender === 'Admin' ? styles.adminMsg : styles.userMsg}`}>
                                        <div className={styles.msgHeader}>
                                            <strong>{msg.sender}</strong>
                                            <small>{new Date(msg.timestamp).toLocaleString()}</small>
                                        </div>
                                        <p>{msg.text}</p>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noMsgs}>No messages found for this ticket.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.modalFooter}>
                    <button className={styles.cancelBtn} onClick={onClose}>Close</button>
                    {ticket.status !== 'Solved' && (
                        <button
                            className={styles.modalResolveBtn}
                            onClick={() => {
                                onResolve(ticket._id || ticket.id);
                                onClose();
                            }}
                        >
                            <CheckCircle2 size={16} /> Mark as Resolved
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const agents: string[] = ["Agent 1", "Agent 2", "Agent 3", "Agent 4", "Agent 5"];

const Tickets: React.FC = () => {
    const [tab, setTab] = useState<"active" | "solved">("active");
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignments, setSelectedAssignments] = useState<Record<string, string>>({});
    const [search, setSearch] = useState("");
    const [filterPriority, setFilterPriority] = useState<"All" | "High" | "Medium" | "Low">("All");
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/admin/tickets`);
            if (res.data.success) {
                setTickets(res.data.tickets);
            }
        } catch (err) {
            console.error("Error fetching tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const activeTickets = tickets.filter(t => t.status !== "Solved");
    const solvedTickets = tickets.filter(t => t.status === "Solved");
    const rawData = tab === "active" ? activeTickets : solvedTickets;

    const priorityFiltered = useMemo(() => {
        if (filterPriority === "All") return rawData;
        return rawData.filter(t => t.priority === filterPriority);
    }, [filterPriority, rawData]);

    // 🔥 GLOBAL FILTER LOGIC
    const filteredData = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) return priorityFiltered;

        return priorityFiltered.filter((t) =>
            t.id.toLowerCase().includes(query) ||
            t.subject.toLowerCase().includes(query) ||
            t.user.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query) ||
            t.priority.toLowerCase().includes(query) ||
            t.status.toLowerCase().includes(query) ||
            t.assignedTo.toLowerCase().includes(query)
        );
    }, [search, priorityFiltered]);

    const handleAssign = async (ticketId: string) => {
        const newAgent = selectedAssignments[ticketId];
        if (newAgent) {
            try {
                const res = await axios.patch(`/api/admin/tickets/${ticketId}`, {
                    assignedTo: newAgent,
                    status: "In Progress" // Auto set to In Progress when assigned
                });
                if (res.data.success) {
                    setTickets(prev => prev.map(t => (t._id === ticketId || t.id === ticketId) ? { ...t, assignedTo: newAgent, status: "In Progress" } : t));
                    alert(`Ticket ${ticketId} successfully assigned to ${newAgent} and moved to In Progress.`);
                    setSelectedAssignments(prev => {
                        const { [ticketId]: _, ...rest } = prev;
                        return rest;
                    });
                }
            } catch (err) {
                alert("Error assigning ticket");
            }
        }
    };

    const handleResolve = async (ticketId: string) => {
        try {
            const res = await axios.patch(`/api/admin/tickets/${ticketId}`, { status: "Solved" });
            if (res.data.success) {
                setTickets(prev => prev.map(t => (t._id === ticketId || t.id === ticketId) ? { ...t, status: "Solved" } : t));
                alert("Ticket resolved successfully!");
            }
        } catch (err) {
            alert("Error resolving ticket");
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Loader2 className={styles.spinner} />
                <p>Loading database tickets...</p>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* HEADER */}
            <div className={styles.header}>
                <h2>{tab === "active" ? "Active Tickets" : "Solved Tickets"}</h2>

                <div className={styles.tabs}>
                    <span
                        className={tab === "active" ? styles.activeTab : ""}
                        onClick={() => setTab("active")}
                    >
                        Active ({activeTickets.length})
                    </span>
                    <span
                        className={tab === "solved" ? styles.activeTab : ""}
                        onClick={() => setTab("solved")}
                    >
                        Solved ({solvedTickets.length})
                    </span>
                </div>
            </div>

            {/* PRIORITY FILTERS (ROLE-STYLE) */}
            <div className={styles.filterBarSecondary}>
                <div className={styles.filterGroup}>
                    {(["All", "High", "Medium", "Low"] as const).map(p => (
                        <button
                            key={p}
                            className={`${styles.filterTab} ${filterPriority === p ? styles.activeTab : ""}`}
                            onClick={() => setFilterPriority(p)}
                        >
                            {p === "All" ? "All Priorities" : `${p} Priority`}
                        </button>
                    ))}
                </div>
            </div>

            {/* 🔍 FILTER BAR */}
            <div className={styles.filterBar}>
                <input
                    type="text"
                    placeholder="Search by ID, user, issue, category, agent, status..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={styles.searchInput}
                />

                <button
                    className={styles.searchBtn}
                    onClick={() => setSearch(search.trim())}
                >
                    Search
                </button>

                {search && (
                    <button
                        className={styles.clearBtn}
                        onClick={() => setSearch("")}
                    >
                        Clear
                    </button>
                )}
            </div>


            {/* TABLE */}
            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Subject</th>
                            <th>User</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Assigned To</th>
                            <th>Created</th>
                            {tab === "active" && <th>Actions</th>}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={9} className={styles.noData}>
                                    No tickets found
                                </td>
                            </tr>
                        )}

                        {filteredData.map((t) => {
                            const selectedAgent =
                                selectedAssignments[t.id] || t.assignedTo;

                            return (
                                <tr key={t.id}>
                                    <td className={styles.ticketId}>{t.id}</td>

                                    <td>
                                        <strong>{t.subject}</strong>
                                        <small className={styles.subText}>
                                            Ref: {t.created || (t._id ? new Date(parseInt(t._id.substring(0, 8), 16) * 1000).toLocaleDateString() : 'N/A')}
                                        </small>
                                    </td>

                                    <td>{t.user}</td>
                                    <td>{t.category}</td>

                                    <td>
                                        <span
                                            className={`${styles.badge} ${styles[t.priority.toLowerCase()]}`}
                                        >
                                            {t.priority}
                                        </span>
                                    </td>

                                    <td>
                                        <span
                                            className={`${styles.badge} ${t.status === "Solved"
                                                ? styles.solved
                                                : t.status === "Open"
                                                    ? styles.open
                                                    : styles.inProgress
                                                }`}
                                        >
                                            {t.status}
                                        </span>
                                    </td>

                                    <td>
                                        {tab === "active" ? (
                                            <div className={styles.assignContainer}>
                                                <select
                                                    value={selectedAgent}
                                                    onChange={(e) =>
                                                        setSelectedAssignments((prev) => ({
                                                            ...prev,
                                                            [t.id]: e.target.value,
                                                        }))
                                                    }
                                                    className={styles.agentDropdown}
                                                >
                                                    {agents.map((agent) => (
                                                        <option key={agent} value={agent}>
                                                            {agent}
                                                        </option>
                                                    ))}
                                                </select>

                                                <button
                                                    className={styles.assign}
                                                    onClick={() => handleAssign(t.id)}
                                                    disabled={selectedAgent === t.assignedTo}
                                                >
                                                    Assign
                                                </button>
                                            </div>
                                        ) : (
                                            t.assignedTo
                                        )}
                                    </td>

                                    <td>{t.created || (t._id ? new Date(parseInt(t._id.substring(0, 8), 16) * 1000).toLocaleDateString() : 'N/A')}</td>

                                    {tab === "active" && (
                                        <td className={styles.actions}>
                                            <button
                                                className={styles.view}
                                                onClick={() => setSelectedTicket(t)}
                                            >
                                                View
                                            </button>
                                            <button
                                                className={styles.resolve}
                                                onClick={() => handleResolve(t._id || t.id)}
                                            >
                                                Resolve
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {selectedTicket && (
                <TicketDetailModal
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                    onResolve={handleResolve}
                />
            )}
        </div>
    );
};

export default Tickets;
