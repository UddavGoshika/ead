import React, { useState } from 'react';
import { Search, Filter, Tag, Paperclip, Clock, AlertCircle } from 'lucide-react';
import styles from './SupportSections.module.css';

const TicketMonitor: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState('All');

    const mockTickets = [
        { id: 'TKT-8902', subject: 'System downtime issue', priority: 'Urgent', status: 'Open', assignee: 'Unassigned', created: '15m ago', sla: 'Breached' },
        { id: 'TKT-8901', subject: 'Cannot reset password', priority: 'High', status: 'In Progress', assignee: 'Alice S.', created: '1h ago', sla: 'At Risk' },
        { id: 'TKT-8900', subject: 'Billing discrepancy on invoice #104', priority: 'Medium', status: 'Open', assignee: 'Bob J.', created: '3h ago', sla: 'Normal' },
        { id: 'TKT-8899', subject: 'Feature request for new dashboard', priority: 'Low', status: 'Resolved', assignee: 'Diana W.', created: '1d ago', sla: 'Met' },
        { id: 'TKT-8898', subject: 'API integration failing randomly', priority: 'High', status: 'Open', assignee: 'Unassigned', created: '4h ago', sla: 'Normal' },
    ];

    const getPriorityStyle = (priority: string) => {
        switch (priority) {
            case 'Urgent': return { color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' };
            case 'High': return { color: '#f97316', fontWeight: 500 };
            case 'Medium': return { color: '#3b82f6' };
            case 'Low': return { color: '#94a3b8' };
            default: return {};
        }
    };

    const getSlaBadge = (sla: string) => {
        switch (sla) {
            case 'Breached': return <span className={styles.slaBadgeBreach}>SLA Breached</span>;
            case 'At Risk': return <span className={styles.slaBadgeRisk}>SLA At Risk</span>;
            case 'Normal': return <span className={styles.slaBadgeNormal}>Normal</span>;
            case 'Met': return <span className={styles.slaBadgeMet}>SLA Met</span>;
            default: return null;
        }
    };

    const filteredTickets = mockTickets.filter(tkt => {
        const matchesSearch = tkt.subject.toLowerCase().includes(searchTerm.toLowerCase()) || tkt.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPriority = filterPriority === 'All' || tkt.priority === filterPriority;
        return matchesSearch && matchesPriority;
    });

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Ticket Monitor & Triage</h2>
                    <p className={styles.sectionSubtitle}>View, filter, and assign incoming support requests.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.secondaryBtn}>
                        <Filter size={16} /> Advanced Filters
                    </button>
                    <button className={styles.primaryBtn}>
                        Create Ticket
                    </button>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.filtersRow}>
                        <div className={styles.searchBox}>
                            <Search size={16} className={styles.icon} />
                            <input
                                type="text"
                                placeholder="Search tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterBox}>
                            <Filter size={16} className={styles.icon} />
                            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
                                <option value="All">All Priorities</option>
                                <option value="Urgent">Urgent</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Subject & Details</th>
                                <th>Priority</th>
                                <th>Status / Assignee</th>
                                <th>SLA Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTickets.map(ticket => (
                                <tr key={ticket.id} style={ticket.priority === 'Urgent' ? { background: 'rgba(239, 68, 68, 0.02)' } : {}}>
                                    <td className={styles.highlightCell}>{ticket.id}</td>
                                    <td>
                                        <div className={styles.ticketSubjectContainer}>
                                            <span className={styles.ticketSubject}>{ticket.subject}</span>
                                            <div className={styles.ticketMeta}>
                                                <span className={styles.metaItem}><Clock size={12} /> {ticket.created}</span>
                                                {ticket.id === 'TKT-8900' && <span className={styles.metaItem}><Paperclip size={12} /> 2</span>}
                                                {ticket.id === 'TKT-8902' && <span className={styles.metaItem}><Tag size={12} /> billing, critical</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={getPriorityStyle(ticket.priority)}>
                                            {ticket.priority === 'Urgent' && <AlertCircle size={14} />} {ticket.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.assigneeContainer}>
                                            <span className={styles.statusText}>{ticket.status}</span>
                                            <span className={ticket.assignee === 'Unassigned' ? styles.unassigned : styles.assigneeInfo}>
                                                {ticket.assignee}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{getSlaBadge(ticket.sla)}</td>
                                    <td>
                                        <button className={styles.actionBtn}>Open Triage</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredTickets.length === 0 && (
                        <div className={styles.emptyState}>No tickets found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TicketMonitor;
