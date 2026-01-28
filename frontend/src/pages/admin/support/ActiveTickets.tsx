import React, { useState, useMemo, useEffect } from "react";
import styles from "./ActiveTickets.module.css";
import axios from "axios";
import { Loader2 } from "lucide-react";

type TicketStatus = "Open" | "In Progress" | "Solved";

type Ticket = {
    id: string;
    subject: string;
    user: string;
    category: string;
    priority: "Low" | "Medium" | "High";
    status: TicketStatus;
    assignedTo: string;
    created: string;
};

const agents: string[] = ["Agent 1", "Agent 2", "Agent 3", "Agent 4", "Agent 5"];

const Tickets: React.FC = () => {
    const [tab, setTab] = useState<"active" | "solved">("active");
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignments, setSelectedAssignments] = useState<Record<string, string>>({});
    const [search, setSearch] = useState("");

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

    // 🔥 GLOBAL FILTER LOGIC
    const filteredData = useMemo(() => {
        const query = search.toLowerCase().trim();
        if (!query) return rawData;

        return rawData.filter((t) =>
            t.id.toLowerCase().includes(query) ||
            t.subject.toLowerCase().includes(query) ||
            t.user.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query) ||
            t.priority.toLowerCase().includes(query) ||
            t.status.toLowerCase().includes(query) ||
            t.assignedTo.toLowerCase().includes(query)
        );
    }, [search, rawData]);

    const handleAssign = async (ticketId: string) => {
        const newAgent = selectedAssignments[ticketId];
        if (newAgent) {
            try {
                const res = await axios.patch(`/api/admin/tickets/${ticketId}`, { assignedTo: newAgent });
                if (res.data.success) {
                    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedTo: newAgent } : t));
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
                setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: "Solved" } : t));
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
                                            Last update: {t.created}
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

                                    <td>{t.created}</td>

                                    {tab === "active" && (
                                        <td className={styles.actions}>
                                            <button className={styles.view}>View</button>
                                            <button
                                                className={styles.resolve}
                                                onClick={() => handleResolve(t.id)}
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
        </div>
    );
};

export default Tickets;
