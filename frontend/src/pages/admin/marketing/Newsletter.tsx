import React, { useState, useEffect } from 'react';
import styles from './Newsletter.module.css';

// ============================================
// INTERFACES & TYPES
// ============================================

interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'manager' | 'employee';
    avatar?: string;
    department: string;
    joinDate: string;
    lastActive: string;
}

interface EmailRecord {
    id: string;
    sentBy: string;
    sentByName: string;
    sentTo: string;
    clientName: string;
    subject: string;
    content: string;
    category: 'promotional' | 'support' | 'query' | 'follow-up' | 'newsletter';
    status: 'sent' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'draft';
    timestamp: string;
    attachments?: string[];
    scheduledFor?: string;
    openedAt?: string;
    clickedAt?: string;
    notes?: string;
    feedback?: string;
    isEditable: boolean;
    version: number;
}

interface Client {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    status: 'active' | 'inactive' | 'lead' | 'customer';
    lastContacted?: string;
    totalEmails: number;
    tags: string[];
    createdAt: string;
}

interface Task {
    id: string;
    assignedTo: string;
    assignedByName: string;
    assignedBy: string;
    title: string;
    description: string;
    relatedEmail?: string;
    relatedClient?: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in-progress' | 'completed' | 'reviewed';
    dueDate: string;
    createdAt: string;
    completedAt?: string;
    notes?: string;
    isLocked: boolean;
}

interface ActivityLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    details: string;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
}

interface DashboardStats {
    totalEmailsToday: number;
    totalEmailsThisWeek: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    pendingTasks: number;
    completedTasks: number;
    activeClients: number;
    responseTime: string;
}

// ============================================
// MOCK DATA
// ============================================

const currentUser: User = {
    id: 'usr_001',
    name: 'Alex Johnson',
    email: 'alex.j@eadvocate.com',
    role: 'employee',
    department: 'Email Marketing',
    joinDate: '2025-01-15',
    lastActive: new Date().toISOString(),
};

const mockEmployees: User[] = [
    { id: 'usr_001', name: 'Alex Johnson', email: 'alex.j@eadvocate.com', role: 'employee', department: 'Email Marketing', joinDate: '2025-01-15', lastActive: new Date().toISOString() },
    { id: 'usr_002', name: 'Sarah Chen', email: 'sarah.c@eadvocate.com', role: 'employee', department: 'Client Support', joinDate: '2025-02-01', lastActive: new Date().toISOString() },
    { id: 'usr_003', name: 'Mike Rodriguez', email: 'mike.r@eadvocate.com', role: 'employee', department: 'Sales Outreach', joinDate: '2025-01-20', lastActive: new Date().toISOString() },
    { id: 'usr_004', name: 'Emma Watson', email: 'emma.w@eadvocate.com', role: 'manager', department: 'Email Operations', joinDate: '2024-11-10', lastActive: new Date().toISOString() },
    { id: 'usr_005', name: 'David Kim', email: 'david.k@eadvocate.com', role: 'admin', department: 'IT & Security', joinDate: '2024-10-05', lastActive: new Date().toISOString() },
];

const mockClients: Client[] = [
    { id: 'cli_001', name: 'John Smith', email: 'john.smith@techcorp.com', phone: '+1-555-0123', company: 'TechCorp Inc.', status: 'customer', lastContacted: '2026-02-12T10:30:00Z', totalEmails: 8, tags: ['enterprise', 'priority'], createdAt: '2025-12-01T00:00:00Z' },
    { id: 'cli_002', name: 'Priya Patel', email: 'priya.p@healthplus.org', phone: '+1-555-0456', company: 'HealthPlus Org', status: 'customer', lastContacted: '2026-02-13T09:15:00Z', totalEmails: 12, tags: ['healthcare', 'newsletter'], createdAt: '2025-11-15T00:00:00Z' },
    { id: 'cli_003', name: 'Robert Chen', email: 'robert.c@innovate.io', phone: '+1-555-0789', company: 'Innovate IO', status: 'lead', lastContacted: '2026-02-10T14:20:00Z', totalEmails: 3, tags: ['tech', 'trial'], createdAt: '2026-02-01T00:00:00Z' },
    { id: 'cli_004', name: 'Lisa Wong', email: 'lisa.w@globaledu.edu', phone: '+1-555-0321', company: 'Global Education', status: 'customer', lastContacted: '2026-02-11T11:45:00Z', totalEmails: 15, tags: ['education', 'bulk'], createdAt: '2025-09-20T00:00:00Z' },
    { id: 'cli_005', name: 'James Wilson', email: 'james.w@startup.co', phone: '+1-555-0654', company: 'Startup Co.', status: 'active', lastContacted: '2026-02-13T08:00:00Z', totalEmails: 5, tags: ['startup', 'follow-up'], createdAt: '2026-01-10T00:00:00Z' },
];

const mockEmails: EmailRecord[] = [
    { id: 'eml_001', sentBy: 'usr_001', sentByName: 'Alex Johnson', sentTo: 'john.smith@techcorp.com', clientName: 'John Smith', subject: 'Enterprise Solution Overview', content: 'Dear John, we would like to present our enterprise solution...', category: 'promotional', status: 'opened', timestamp: '2026-02-13T09:30:00Z', openedAt: '2026-02-13T10:15:00Z', isEditable: false, version: 1, notes: 'Client showed interest' },
    { id: 'eml_002', sentBy: 'usr_002', sentByName: 'Sarah Chen', sentTo: 'priya.p@healthplus.org', clientName: 'Priya Patel', subject: 'Support Ticket #4421 Update', content: 'Your issue has been resolved. Here are the details...', category: 'support', status: 'clicked', timestamp: '2026-02-13T08:45:00Z', openedAt: '2026-02-13T09:00:00Z', clickedAt: '2026-02-13T09:05:00Z', isEditable: false, version: 1, feedback: 'Client satisfied' },
    { id: 'eml_003', sentBy: 'usr_003', sentByName: 'Mike Rodriguez', sentTo: 'robert.c@innovate.io', clientName: 'Robert Chen', subject: 'Follow-up on Product Demo', content: 'Thanks for attending our demo. Here are the next steps...', category: 'follow-up', status: 'sent', timestamp: '2026-02-12T16:20:00Z', isEditable: false, version: 1 },
    { id: 'eml_004', sentBy: 'usr_001', sentByName: 'Alex Johnson', sentTo: 'lisa.w@globaledu.edu', clientName: 'Lisa Wong', subject: 'Monthly Newsletter - February', content: 'Check out our latest updates and offers...', category: 'newsletter', status: 'opened', timestamp: '2026-02-12T10:00:00Z', openedAt: '2026-02-12T11:30:00Z', isEditable: false, version: 1 },
    { id: 'eml_005', sentBy: 'usr_002', sentByName: 'Sarah Chen', sentTo: 'james.w@startup.co', clientName: 'James Wilson', subject: 'Welcome to EAdvocate!', content: 'Thank you for signing up. Here are your next steps...', category: 'query', status: 'clicked', timestamp: '2026-02-13T11:00:00Z', openedAt: '2026-02-13T11:15:00Z', clickedAt: '2026-02-13T11:20:00Z', isEditable: false, version: 1, notes: 'New user onboarding' },
    { id: 'eml_006', sentBy: 'usr_001', sentByName: 'Alex Johnson', sentTo: 'priya.p@healthplus.org', clientName: 'Priya Patel', subject: 'Special Offer for HealthPlus', content: 'Exclusive discount for your organization...', category: 'promotional', status: 'draft', timestamp: '2026-02-13T12:00:00Z', isEditable: true, version: 1, scheduledFor: '2026-02-14T10:00:00Z' },
];

const mockTasks: Task[] = [
    { id: 'tsk_001', assignedTo: 'usr_001', assignedByName: 'Emma Watson', assignedBy: 'usr_004', title: 'Send follow-up to TechCorp', description: 'Client requested more information about pricing', relatedEmail: 'eml_001', relatedClient: 'cli_001', priority: 'high', status: 'completed', dueDate: '2026-02-13T18:00:00Z', createdAt: '2026-02-12T09:00:00Z', completedAt: '2026-02-13T09:30:00Z', isLocked: true },
    { id: 'tsk_002', assignedTo: 'usr_002', assignedByName: 'Emma Watson', assignedBy: 'usr_004', title: 'Resolve HealthPlus support ticket', description: 'Client reported issue with login', relatedEmail: 'eml_002', relatedClient: 'cli_002', priority: 'high', status: 'completed', dueDate: '2026-02-13T12:00:00Z', createdAt: '2026-02-13T08:00:00Z', completedAt: '2026-02-13T08:45:00Z', isLocked: true },
    { id: 'tsk_003', assignedTo: 'usr_003', assignedByName: 'Alex Johnson', assignedBy: 'usr_001', title: 'Prepare demo for Innovate IO', description: 'Create personalized demo video', relatedClient: 'cli_003', priority: 'medium', status: 'in-progress', dueDate: '2026-02-14T15:00:00Z', createdAt: '2026-02-12T14:00:00Z', isLocked: false },
    { id: 'tsk_004', assignedTo: 'usr_001', assignedByName: 'Sarah Chen', assignedBy: 'usr_002', title: 'Update email templates', description: 'Refresh promotional templates for Q2', priority: 'low', status: 'pending', dueDate: '2026-02-15T17:00:00Z', createdAt: '2026-02-13T10:00:00Z', isLocked: false },
    { id: 'tsk_005', assignedTo: 'usr_004', assignedByName: 'David Kim', assignedBy: 'usr_005', title: 'Review email security protocols', description: 'Audit recent email campaigns for compliance', priority: 'high', status: 'pending', dueDate: '2026-02-14T12:00:00Z', createdAt: '2026-02-13T09:30:00Z', isLocked: false },
];

const mockActivityLogs: ActivityLog[] = [
    { id: 'log_001', userId: 'usr_001', userName: 'Alex Johnson', action: 'EMAIL_SENT', details: 'Sent promotional email to john.smith@techcorp.com', timestamp: '2026-02-13T09:30:00Z', ipAddress: '192.168.1.101', userAgent: 'Chrome/120.0' },
    { id: 'log_002', userId: 'usr_002', userName: 'Sarah Chen', action: 'EMAIL_SENT', details: 'Sent support email to priya.p@healthplus.org', timestamp: '2026-02-13T08:45:00Z', ipAddress: '192.168.1.102', userAgent: 'Firefox/110.0' },
    { id: 'log_003', userId: 'usr_003', userName: 'Mike Rodriguez', action: 'TASK_COMPLETED', details: 'Completed follow-up task for Innovate IO', timestamp: '2026-02-13T09:15:00Z', ipAddress: '192.168.1.103', userAgent: 'Safari/17.0' },
    { id: 'log_004', userId: 'usr_001', userName: 'Alex Johnson', action: 'CLIENT_VIEWED', details: 'Viewed client profile: TechCorp Inc.', timestamp: '2026-02-13T10:05:00Z', ipAddress: '192.168.1.101', userAgent: 'Chrome/120.0' },
];

const mockStats: DashboardStats = {
    totalEmailsToday: 28,
    totalEmailsThisWeek: 142,
    openRate: 68.5,
    clickRate: 32.1,
    bounceRate: 2.3,
    pendingTasks: 8,
    completedTasks: 24,
    activeClients: 156,
    responseTime: '2.4h',
};

// ============================================
// MAIN COMPONENT
// ============================================

const EmployeeEmailDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'emails' | 'clients' | 'tasks' | 'analytics' | 'activity'>('dashboard');
    const [emails, setEmails] = useState<EmailRecord[]>(mockEmails);
    const [tasks, setTasks] = useState<Task[]>(mockTasks);
    const [clients, setClients] = useState<Client[]>(mockClients);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
    const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
    const [showEmailComposer, setShowEmailComposer] = useState(false);
    const [newEmail, setNewEmail] = useState<Partial<EmailRecord>>({
        sentTo: '',
        clientName: '',
        subject: '',
        content: '',
        category: 'promotional',
        scheduledFor: '',
        isEditable: true,
        version: 1,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTask, setNewTask] = useState<Partial<Task>>({
        title: '',
        description: '',
        assignedTo: currentUser.id,
        priority: 'medium',
        status: 'pending',
        dueDate: '',
        isLocked: false,
    });
    const [emailFilter, setEmailFilter] = useState<'all' | 'sent' | 'draft' | 'scheduled'>('all');
    const [clientFilter, setClientFilter] = useState<'all' | 'active' | 'lead' | 'customer'>('all');
    const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

    // ============================================
    // SECURITY & AUDIT FUNCTIONS
    // ============================================

    const logActivity = (action: string, details: string) => {
        const newLog: ActivityLog = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: currentUser.id,
            userName: currentUser.name,
            action,
            details,
            timestamp: new Date().toISOString(),
            ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
            userAgent: navigator.userAgent,
        };
        setActivityLogs(prev => [newLog, ...prev]);
        console.log('Activity logged:', newLog);
    };

    // ============================================
    // EMAIL FUNCTIONS
    // ============================================

    const handleSendEmail = () => {
        if (!newEmail.sentTo || !newEmail.subject || !newEmail.content) {
            alert('Please fill all required fields');
            return;
        }

        let clientId = '';
        const existingClient = clients.find(c => c.email === newEmail.sentTo);
        if (existingClient) {
            clientId = existingClient.id;
        } else {
            const newClient: Client = {
                id: `cli_${Date.now()}`,
                name: newEmail.clientName || newEmail.sentTo.split('@')[0],
                email: newEmail.sentTo,
                status: 'lead',
                totalEmails: 1,
                tags: [],
                createdAt: new Date().toISOString(),
            };
            setClients(prev => [...prev, newClient]);
            clientId = newClient.id;
        }

        const emailToSend: EmailRecord = {
            id: `eml_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            sentBy: currentUser.id,
            sentByName: currentUser.name,
            sentTo: newEmail.sentTo!,
            clientName: newEmail.clientName || newEmail.sentTo.split('@')[0],
            subject: newEmail.subject!,
            content: newEmail.content!,
            category: newEmail.category as any || 'promotional',
            status: newEmail.scheduledFor ? 'draft' : 'sent',
            timestamp: new Date().toISOString(),
            scheduledFor: newEmail.scheduledFor,
            isEditable: false,
            version: 1,
        };

        setEmails(prev => [emailToSend, ...prev]);

        setClients(prev => prev.map(c =>
            c.id === clientId ? { ...c, lastContacted: new Date().toISOString(), totalEmails: c.totalEmails + 1 } : c
        ));

        logActivity('EMAIL_SENT', `Sent email to ${newEmail.sentTo} with subject: ${newEmail.subject}`);

        setShowEmailComposer(false);
        setNewEmail({
            sentTo: '',
            clientName: '',
            subject: '',
            content: '',
            category: 'promotional',
            scheduledFor: '',
            isEditable: true,
            version: 1,
        });

        alert('Email sent successfully! (Immutable record created)');
    };

    const handleScheduleEmail = () => {
        if (!newEmail.scheduledFor) {
            alert('Please select a scheduled date/time');
            return;
        }
        handleSendEmail();
    };

    const handleDeleteDraft = (emailId: string) => {
        if (window.confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
            setEmails(prev => prev.filter(e => e.id !== emailId));
            logActivity('DRAFT_DELETED', `Deleted draft email ${emailId}`);
        }
    };

    // ============================================
    // TASK FUNCTIONS
    // ============================================

    const handleCreateTask = () => {
        if (!newTask.title || !newTask.dueDate) {
            alert('Please fill required fields');
            return;
        }

        const taskToCreate: Task = {
            id: `tsk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            assignedTo: newTask.assignedTo || currentUser.id,
            assignedByName: currentUser.name,
            assignedBy: currentUser.id,
            title: newTask.title!,
            description: newTask.description || '',
            relatedEmail: newTask.relatedEmail,
            relatedClient: newTask.relatedClient,
            priority: newTask.priority as any || 'medium',
            status: 'pending',
            dueDate: newTask.dueDate!,
            createdAt: new Date().toISOString(),
            isLocked: false,
        };

        setTasks(prev => [taskToCreate, ...prev]);
        logActivity('TASK_CREATED', `Created task: ${newTask.title}`);
        setShowTaskModal(false);
        setNewTask({
            title: '',
            description: '',
            assignedTo: currentUser.id,
            priority: 'medium',
            status: 'pending',
            dueDate: '',
            isLocked: false,
        });
    };

    const handleCompleteTask = (taskId: string) => {
        setTasks(prev => prev.map(t =>
            t.id === taskId
                ? {
                    ...t,
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    isLocked: true
                }
                : t
        ));
        logActivity('TASK_COMPLETED', `Completed task ${taskId}`);
    };

    const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
        const task = tasks.find(t => t.id === taskId);
        if (task?.isLocked) {
            alert('This task is locked and cannot be modified');
            return;
        }

        setTasks(prev => prev.map(t =>
            t.id === taskId
                ? {
                    ...t,
                    status,
                    ...(status === 'completed' ? { completedAt: new Date().toISOString(), isLocked: true } : {})
                }
                : t
        ));
        logActivity('TASK_UPDATED', `Updated task ${taskId} to status: ${status}`);
    };

    // ============================================
    // FILTER FUNCTIONS
    // ============================================

    const getFilteredEmails = () => {
        let filtered = emails;

        if (searchTerm) {
            filtered = filtered.filter(e =>
                e.sentTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.clientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (emailFilter === 'sent') {
            filtered = filtered.filter(e => e.status === 'sent' || e.status === 'opened' || e.status === 'clicked');
        } else if (emailFilter === 'draft') {
            filtered = filtered.filter(e => e.status === 'draft');
        } else if (emailFilter === 'scheduled') {
            filtered = filtered.filter(e => e.scheduledFor);
        }

        const now = new Date();
        if (dateRange === 'today') {
            filtered = filtered.filter(e => new Date(e.timestamp).toDateString() === now.toDateString());
        } else if (dateRange === 'week') {
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            filtered = filtered.filter(e => new Date(e.timestamp) >= weekAgo);
        }

        return filtered;
    };

    const getFilteredClients = () => {
        let filtered = clients;

        if (searchTerm) {
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.company?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (clientFilter !== 'all') {
            filtered = filtered.filter(c => c.status === clientFilter);
        }

        return filtered;
    };

    const getFilteredTasks = () => {
        let filtered = tasks;

        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (taskFilter !== 'all') {
            filtered = filtered.filter(t => t.status === taskFilter);
        }

        if (currentUser.role === 'employee') {
            filtered = filtered.filter(t => t.assignedTo === currentUser.id);
        }

        return filtered;
    };

    // ============================================
    // RENDER FUNCTIONS
    // ============================================

    const renderDashboard = () => (
        <div className={styles.dashboardContent}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📧</div>
                    <div className={styles.statDetails}>
                        <div className={styles.statLabel}>Emails Today</div>
                        <div className={styles.statValue}>{mockStats.totalEmailsToday}</div>
                        <div className={`${styles.statTrend} ${styles.positive}`}>+12% vs yesterday</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📊</div>
                    <div className={styles.statDetails}>
                        <div className={styles.statLabel}>Open Rate</div>
                        <div className={styles.statValue}>{mockStats.openRate}%</div>
                        <div className={`${styles.statTrend} ${styles.positive}`}>↑ 5.2%</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>✅</div>
                    <div className={styles.statDetails}>
                        <div className={styles.statLabel}>Tasks</div>
                        <div className={styles.statValue}>{mockStats.completedTasks}/{mockStats.pendingTasks + mockStats.completedTasks}</div>
                        <div className={styles.statTrend}>8 pending</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>⏱️</div>
                    <div className={styles.statDetails}>
                        <div className={styles.statLabel}>Avg Response</div>
                        <div className={styles.statValue}>{mockStats.responseTime}</div>
                        <div className={`${styles.statTrend} ${styles.positive}`}>-0.3h</div>
                    </div>
                </div>
            </div>

            <div className={styles.activityFeed}>
                <h3 className={styles.sectionTitle}>
                    <span className={styles.liveIndicator}></span>
                    LIVE SYSTEM ACTIVITY
                </h3>

                <div className={styles.activityItems}>
                    {activityLogs.slice(0, 5).map(log => (
                        <div key={log.id} className={styles.activityItem}>
                            <div className={styles.activityIcon}>
                                {log.action === 'EMAIL_SENT' && '📨'}
                                {log.action === 'TASK_COMPLETED' && '✓'}
                                {log.action === 'CLIENT_VIEWED' && '👤'}
                            </div>
                            <div className={styles.activityContent}>
                                <div className={styles.activityMessage}>
                                    <span className={styles.activityUser}>{log.userName}</span> {log.details}
                                </div>
                                <div className={styles.activityTime}>
                                    {new Date(log.timestamp).toLocaleTimeString()} · {new Date(log.timestamp).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.diagnosticIntelligence}>
                    <div className={styles.diagIcon}>🧠</div>
                    <div className={styles.diagContent}>
                        <strong>Diagnostic Intelligence</strong>
                        <p>Enterprise performance metrics are synchronized. All email activities are immutable and audited.</p>
                    </div>
                </div>
            </div>

            <div className={styles.recentSection}>
                <h3 className={styles.sectionTitle}>Recent Emails Sent</h3>
                <div className={styles.recentEmails}>
                    {emails.slice(0, 3).map(email => (
                        <div key={email.id} className={styles.recentEmailItem}>
                            <div className={styles.emailHeader}>
                                <span className={styles.emailSubject}>{email.subject}</span>
                                <span className={`${styles.emailStatus} ${styles[`status${email.status}`]}`}>{email.status}</span>
                            </div>
                            <div className={styles.emailDetails}>
                                <span className={styles.emailTo}>To: {email.clientName} ({email.sentTo})</span>
                                <span className={styles.emailTime}>{new Date(email.timestamp).toLocaleString()}</span>
                            </div>
                            <div className={styles.emailFooter}>
                                <span className={styles.emailSender}>By: {email.sentByName}</span>
                                {!email.isEditable && (
                                    <span className={styles.immutableBadge} title="This record cannot be modified">🔒 Immutable</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderEmails = () => (
        <div className={styles.emailsContent}>
            <div className={styles.contentHeader}>
                <h2>Email Management</h2>
                <button className={styles.btnPrimary} onClick={() => setShowEmailComposer(true)}>
                    <i className="fas fa-plus"></i> Compose Email
                </button>
            </div>

            <div className={styles.filtersBar}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Search emails..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterTabs}>
                    <button
                        className={`${styles.filterBtn} ${emailFilter === 'all' ? styles.active : ''}`}
                        onClick={() => setEmailFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`${styles.filterBtn} ${emailFilter === 'sent' ? styles.active : ''}`}
                        onClick={() => setEmailFilter('sent')}
                    >
                        Sent
                    </button>
                    <button
                        className={`${styles.filterBtn} ${emailFilter === 'draft' ? styles.active : ''}`}
                        onClick={() => setEmailFilter('draft')}
                    >
                        Drafts
                    </button>
                    <button
                        className={`${styles.filterBtn} ${emailFilter === 'scheduled' ? styles.active : ''}`}
                        onClick={() => setEmailFilter('scheduled')}
                    >
                        Scheduled
                    </button>
                </div>
                <div className={styles.dateRange}>
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value as any)}>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>
            </div>

            <div className={styles.emailList}>
                {getFilteredEmails().map(email => (
                    <div key={email.id} className={`${styles.emailItem} ${selectedEmail?.id === email.id ? styles.selected : ''}`}>
                        <div className={styles.emailItemHeader}>
                            <div className={styles.emailItemSender}>
                                <strong>To: {email.clientName}</strong>
                                <span className={styles.emailItemAddress}>{email.sentTo}</span>
                            </div>
                            <div className={styles.emailItemMeta}>
                                <span className={`${styles.emailBadge} ${styles[`category${email.category}`]}`}>{email.category}</span>
                                <span className={`${styles.emailBadge} ${styles[`status${email.status}`]}`}>{email.status}</span>
                                {!email.isEditable && (
                                    <span className={styles.immutableIcon} title="Immutable Record">🔒</span>
                                )}
                            </div>
                        </div>

                        <div className={styles.emailItemSubject}>
                            <strong>{email.subject}</strong>
                        </div>

                        <div className={styles.emailItemPreview}>
                            {email.content.substring(0, 100)}...
                        </div>

                        <div className={styles.emailItemFooter}>
                            <span className={styles.emailItemTime}>
                                {new Date(email.timestamp).toLocaleString()}
                                {email.scheduledFor && ` · Scheduled: ${new Date(email.scheduledFor).toLocaleString()}`}
                            </span>
                            <span className={styles.emailItemSentby}>Sent by: {email.sentByName}</span>
                        </div>

                        {email.openedAt && (
                            <div className={styles.emailTracking}>
                                <span className={styles.trackingOpened}>👁️ Opened: {new Date(email.openedAt).toLocaleString()}</span>
                                {email.clickedAt && (
                                    <span className={styles.trackingClicked}>🖱️ Clicked: {new Date(email.clickedAt).toLocaleString()}</span>
                                )}
                            </div>
                        )}

                        {email.status === 'draft' && (
                            <div className={styles.emailActions}>
                                <button className={styles.btnSmall} onClick={() => setSelectedEmail(email)}>Edit Draft</button>
                                <button className={`${styles.btnSmall} ${styles.btnDanger}`} onClick={() => handleDeleteDraft(email.id)}>Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderClients = () => (
        <div className={styles.clientsContent}>
            <div className={styles.contentHeader}>
                <h2>Client Management</h2>
                <button className={styles.btnPrimary} onClick={() => alert('Add client form')}>
                    <i className="fas fa-user-plus"></i> Add Client
                </button>
            </div>

            <div className={styles.filtersBar}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Search clients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterTabs}>
                    <button
                        className={`${styles.filterBtn} ${clientFilter === 'all' ? styles.active : ''}`}
                        onClick={() => setClientFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`${styles.filterBtn} ${clientFilter === 'active' ? styles.active : ''}`}
                        onClick={() => setClientFilter('active')}
                    >
                        Active
                    </button>
                    <button
                        className={`${styles.filterBtn} ${clientFilter === 'customer' ? styles.active : ''}`}
                        onClick={() => setClientFilter('customer')}
                    >
                        Customers
                    </button>
                    <button
                        className={`${styles.filterBtn} ${clientFilter === 'lead' ? styles.active : ''}`}
                        onClick={() => setClientFilter('lead')}
                    >
                        Leads
                    </button>
                </div>
            </div>

            <div className={styles.clientGrid}>
                {getFilteredClients().map(client => (
                    <div key={client.id} className={styles.clientCard}>
                        <div className={styles.clientCardHeader}>
                            <div className={styles.clientAvatar}>
                                {client.name.charAt(0)}
                            </div>
                            <div className={styles.clientInfo}>
                                <h4>{client.name}</h4>
                                <span className={styles.clientEmail}>{client.email}</span>
                            </div>
                            <span className={`${styles.clientStatus} ${styles[`status${client.status}`]}`}>{client.status}</span>
                        </div>

                        <div className={styles.clientCardBody}>
                            {client.company && (
                                <div className={styles.clientCompany}>
                                    <i className="fas fa-building"></i> {client.company}
                                </div>
                            )}
                            {client.phone && (
                                <div className={styles.clientPhone}>
                                    <i className="fas fa-phone"></i> {client.phone}
                                </div>
                            )}

                            <div className={styles.clientStats}>
                                <div className={styles.clientStat}>
                                    <span className={styles.statLabel}>Total Emails</span>
                                    <span className={styles.statValue}>{client.totalEmails}</span>
                                </div>
                                <div className={styles.clientStat}>
                                    <span className={styles.statLabel}>Last Contact</span>
                                    <span className={styles.statValue}>
                                        {client.lastContacted ? new Date(client.lastContacted).toLocaleDateString() : 'Never'}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.clientTags}>
                                {client.tags.map((tag, i) => (
                                    <span key={i} className={styles.clientTag}>{tag}</span>
                                ))}
                            </div>
                        </div>

                        <div className={styles.clientCardFooter}>
                            <button className={styles.btnSmall} onClick={() => setSelectedClient(client)}>
                                View Details
                            </button>
                            <button className={`${styles.btnSmall} ${styles.btnOutline}`} onClick={() => {
                                setNewEmail(prev => ({ ...prev, sentTo: client.email, clientName: client.name }));
                                setShowEmailComposer(true);
                            }}>
                                Send Email
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {selectedClient && (
                <div className={styles.modalOverlay} onClick={() => setSelectedClient(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3>Client Details</h3>
                        <div className={styles.clientDetail}>
                            <p><strong>Name:</strong> {selectedClient.name}</p>
                            <p><strong>Email:</strong> {selectedClient.email}</p>
                            <p><strong>Company:</strong> {selectedClient.company || 'N/A'}</p>
                            <p><strong>Phone:</strong> {selectedClient.phone || 'N/A'}</p>
                            <p><strong>Status:</strong> {selectedClient.status}</p>
                            <p><strong>Created:</strong> {new Date(selectedClient.createdAt).toLocaleDateString()}</p>
                            <p><strong>Last Contacted:</strong> {selectedClient.lastContacted ? new Date(selectedClient.lastContacted).toLocaleString() : 'Never'}</p>

                            <h4 style={{ marginTop: '20px' }}>Email History</h4>
                            <div className={styles.emailHistory}>
                                {emails.filter(e => e.sentTo === selectedClient.email).map(email => (
                                    <div key={email.id} className={styles.emailHistoryItem}>
                                        <div><strong>{email.subject}</strong></div>
                                        <div>{new Date(email.timestamp).toLocaleString()} · {email.status}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className={styles.btnPrimary} onClick={() => setSelectedClient(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );

    const renderTasks = () => (
        <div className={styles.tasksContent}>
            <div className={styles.contentHeader}>
                <h2>Task Management</h2>
                <button className={styles.btnPrimary} onClick={() => setShowTaskModal(true)}>
                    <i className="fas fa-tasks"></i> Create Task
                </button>
            </div>

            <div className={styles.filtersBar}>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterTabs}>
                    <button
                        className={`${styles.filterBtn} ${taskFilter === 'all' ? styles.active : ''}`}
                        onClick={() => setTaskFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`${styles.filterBtn} ${taskFilter === 'pending' ? styles.active : ''}`}
                        onClick={() => setTaskFilter('pending')}
                    >
                        Pending
                    </button>
                    <button
                        className={`${styles.filterBtn} ${taskFilter === 'in-progress' ? styles.active : ''}`}
                        onClick={() => setTaskFilter('in-progress')}
                    >
                        In Progress
                    </button>
                    <button
                        className={`${styles.filterBtn} ${taskFilter === 'completed' ? styles.active : ''}`}
                        onClick={() => setTaskFilter('completed')}
                    >
                        Completed
                    </button>
                </div>
            </div>

            <div className={styles.taskList}>
                {getFilteredTasks().map(task => {
                    const assignedUser = mockEmployees.find(e => e.id === task.assignedTo);
                    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';

                    return (
                        <div key={task.id} className={`${styles.taskItem} ${styles[`priority${task.priority}`]} ${task.isLocked ? styles.locked : ''}`}>
                            <div className={styles.taskCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={task.status === 'completed'}
                                    onChange={() => handleCompleteTask(task.id)}
                                    disabled={task.isLocked || task.status === 'completed'}
                                />
                            </div>

                            <div className={styles.taskContent}>
                                <div className={styles.taskHeader}>
                                    <h4>{task.title}</h4>
                                    <div className={styles.taskBadges}>
                                        <span className={`${styles.taskPriority} ${styles[`priority${task.priority}`]}`}>{task.priority}</span>
                                        <span className={`${styles.taskStatus} ${styles[`status${task.status}`]}`}>{task.status}</span>
                                        {task.isLocked && <span className={styles.taskLocked} title="Locked - Cannot Edit">🔒</span>}
                                    </div>
                                </div>

                                <p className={styles.taskDescription}>{task.description}</p>

                                <div className={styles.taskMeta}>
                                    <span className={styles.taskAssignee}>
                                        <i className="fas fa-user"></i> {assignedUser?.name || 'Unknown'}
                                    </span>
                                    <span className={`${styles.taskDue} ${isOverdue ? styles.overdue : ''}`}>
                                        <i className="fas fa-calendar"></i> Due: {new Date(task.dueDate).toLocaleString()}
                                        {isOverdue && ' (Overdue)'}
                                    </span>
                                    <span className={styles.taskCreator}>
                                        <i className="fas fa-pen"></i> Created by: {task.assignedByName}
                                    </span>
                                </div>

                                {task.completedAt && (
                                    <div className={styles.taskCompletedInfo}>
                                        ✅ Completed: {new Date(task.completedAt).toLocaleString()}
                                    </div>
                                )}
                            </div>

                            {!task.isLocked && task.status !== 'completed' && (
                                <div className={styles.taskActions}>
                                    <select
                                        value={task.status}
                                        onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as Task['status'])}
                                        className={styles.taskStatusSelect}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showTaskModal && (
                <div className={styles.modalOverlay} onClick={() => setShowTaskModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3>Create New Task</h3>

                        <div className={styles.formGroup}>
                            <label>Title *</label>
                            <input
                                type="text"
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder="Task title"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <textarea
                                value={newTask.description}
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                placeholder="Task description"
                                rows={3}
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Assign To</label>
                                <select
                                    value={newTask.assignedTo}
                                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                >
                                    {mockEmployees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.department})</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Priority</label>
                                <select
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Due Date *</label>
                            <input
                                type="datetime-local"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                            />
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.btnPrimary} onClick={handleCreateTask}>Create Task</button>
                            <button className={styles.btnSecondary} onClick={() => setShowTaskModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderActivity = () => (
        <div className={styles.activityContent}>
            <div className={styles.contentHeader}>
                <h2>Audit Trail & Activity Logs</h2>
                <div className={styles.activityBadge}>
                    <span className={styles.liveIndicatorSmall}></span> Live Updates
                </div>
            </div>

            <div className={styles.activityTableContainer}>
                <table className={styles.activityTable}>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>IP Address</th>
                            <th>Device</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activityLogs.map(log => (
                            <tr key={log.id}>
                                <td>{new Date(log.timestamp).toLocaleString()}</td>
                                <td>
                                    <div className={styles.activityUserCell}>
                                        <strong>{log.userName}</strong>
                                        <small>{log.userId}</small>
                                    </div>
                                </td>
                                <td>
                                    <span className={`${styles.actionBadge} ${styles[`action${log.action.toLowerCase()}`]}`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td>{log.details}</td>
                                <td><code>{log.ipAddress}</code></td>
                                <td>{log.userAgent?.split('/')[0]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className={styles.securityNote}>
                <i className="fas fa-shield-alt"></i>
                <div>
                    <strong>Immutable Audit Trail</strong>
                    <p>All actions are permanently logged and cannot be modified or deleted. This ensures complete transparency and accountability for all email communications and tasks.</p>
                </div>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className={styles.analyticsContent}>
            <h2>Email Analytics & Performance</h2>

            <div className={styles.analyticsGrid}>
                <div className={styles.analyticsCard}>
                    <h3>Engagement Metrics</h3>
                    <div className={styles.metric}>
                        <div className={styles.metricLabel}>Open Rate</div>
                        <div className={styles.metricValue}>{mockStats.openRate}%</div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${mockStats.openRate}%` }}></div>
                        </div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.metricLabel}>Click Rate</div>
                        <div className={styles.metricValue}>{mockStats.clickRate}%</div>
                        <div className={styles.progressBar}>
                            <div className={styles.progressFill} style={{ width: `${mockStats.clickRate}%` }}></div>
                        </div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.metricLabel}>Bounce Rate</div>
                        <div className={styles.metricValue}>{mockStats.bounceRate}%</div>
                        <div className={styles.progressBar}>
                            <div className={`${styles.progressFill} ${styles.bounce}`} style={{ width: `${mockStats.bounceRate}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className={styles.analyticsCard}>
                    <h3>Volume Metrics</h3>
                    <div className={styles.metric}>
                        <div className={styles.metricLabel}>Emails Today</div>
                        <div className={styles.metricValue}>{mockStats.totalEmailsToday}</div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.metricLabel}>This Week</div>
                        <div className={styles.metricValue}>{mockStats.totalEmailsThisWeek}</div>
                    </div>
                    <div className={styles.metric}>
                        <div className={styles.metricLabel}>Avg Response Time</div>
                        <div className={styles.metricValue}>{mockStats.responseTime}</div>
                    </div>
                </div>

                <div className={styles.analyticsCard}>
                    <h3>Category Distribution</h3>
                    <div className={styles.categoryStats}>
                        {['promotional', 'support', 'follow-up', 'newsletter'].map(cat => {
                            const count = emails.filter(e => e.category === cat).length;
                            const percentage = emails.length ? (count / emails.length * 100).toFixed(1) : 0;
                            return (
                                <div key={cat} className={styles.categoryStat}>
                                    <span className={styles.categoryName}>{cat}</span>
                                    <span className={styles.categoryCount}>{count} ({percentage}%)</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );

    // ============================================
    // MAIN RENDER
    // ============================================

    return (
        <div className={styles.emailDashboard}>
            <div className={styles.dashboardHeader}>
                <div className={styles.logoArea}>
                    <h1>EADVOCATE</h1>
                    <span className={styles.enterpriseBadge}>Enterprise Suite</span>
                </div>

                <div className={styles.userInfo}>
                    <div className={styles.userDetails}>
                        <span className={styles.userName}>{currentUser.name}</span>
                        <span className={styles.userRole}>{currentUser.role}</span>
                        <span className={styles.userDepartment}>{currentUser.department}</span>
                    </div>
                    <div className={styles.userAvatar}>
                        {currentUser.name.charAt(0)}
                    </div>
                </div>
            </div>

            <div className={styles.dashboardNav}>
                <button
                    className={`${styles.navBtn} ${activeTab === 'dashboard' ? styles.active : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    <i className="fas fa-chart-pie"></i> Dashboard
                </button>
                <button
                    className={`${styles.navBtn} ${activeTab === 'emails' ? styles.active : ''}`}
                    onClick={() => setActiveTab('emails')}
                >
                    <i className="fas fa-envelope"></i> Emails
                </button>
                <button
                    className={`${styles.navBtn} ${activeTab === 'clients' ? styles.active : ''}`}
                    onClick={() => setActiveTab('clients')}
                >
                    <i className="fas fa-users"></i> Clients
                </button>
                <button
                    className={`${styles.navBtn} ${activeTab === 'tasks' ? styles.active : ''}`}
                    onClick={() => setActiveTab('tasks')}
                >
                    <i className="fas fa-tasks"></i> Tasks
                </button>
                <button
                    className={`${styles.navBtn} ${activeTab === 'analytics' ? styles.active : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <i className="fas fa-chart-line"></i> Analytics
                </button>
                <button
                    className={`${styles.navBtn} ${activeTab === 'activity' ? styles.active : ''}`}
                    onClick={() => setActiveTab('activity')}
                >
                    <i className="fas fa-history"></i> Activity Log
                </button>
            </div>

            <div className={styles.dashboardMain}>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'emails' && renderEmails()}
                {activeTab === 'clients' && renderClients()}
                {activeTab === 'tasks' && renderTasks()}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'activity' && renderActivity()}
            </div>

            {showEmailComposer && (
                <div className={styles.modalOverlay} onClick={() => setShowEmailComposer(false)}>
                    <div className={`${styles.modalContent} ${styles.large}`} onClick={e => e.stopPropagation()}>
                        <h3>Compose Email</h3>

                        <div className={styles.formGroup}>
                            <label>To (Email) *</label>
                            <input
                                type="email"
                                value={newEmail.sentTo}
                                onChange={(e) => setNewEmail({ ...newEmail, sentTo: e.target.value })}
                                placeholder="client@example.com"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Client Name *</label>
                            <input
                                type="text"
                                value={newEmail.clientName}
                                onChange={(e) => setNewEmail({ ...newEmail, clientName: e.target.value })}
                                placeholder="Client full name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Subject *</label>
                            <input
                                type="text"
                                value={newEmail.subject}
                                onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                                placeholder="Email subject"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Category</label>
                            <select
                                value={newEmail.category}
                                onChange={(e) => setNewEmail({ ...newEmail, category: e.target.value as any })}
                            >
                                <option value="promotional">Promotional</option>
                                <option value="support">Support</option>
                                <option value="query">Query</option>
                                <option value="follow-up">Follow-up</option>
                                <option value="newsletter">Newsletter</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Content *</label>
                            <textarea
                                value={newEmail.content}
                                onChange={(e) => setNewEmail({ ...newEmail, content: e.target.value })}
                                placeholder="Email content..."
                                rows={8}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Schedule (optional)</label>
                            <input
                                type="datetime-local"
                                value={newEmail.scheduledFor}
                                onChange={(e) => setNewEmail({ ...newEmail, scheduledFor: e.target.value })}
                            />
                        </div>

                        <div className={styles.securityWarning}>
                            <i className="fas fa-lock"></i>
                            <span>Emails become immutable after sending. No edits or deletions allowed.</span>
                        </div>

                        <div className={styles.modalActions}>
                            <button className={styles.btnPrimary} onClick={handleSendEmail}>
                                {newEmail.scheduledFor ? 'Schedule Email' : 'Send Email'}
                            </button>
                            <button className={styles.btnSecondary} onClick={() => setShowEmailComposer(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeEmailDashboard;