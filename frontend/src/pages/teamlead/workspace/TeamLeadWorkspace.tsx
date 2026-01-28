import React, { useState, useMemo, useEffect } from 'react';
import styles from './TeamLeadWorkspace.module.css';
import {
    // Navigation & Layout
    Search, BarChart3, Settings, Bell,
    Maximize2, Minimize2,
    User,

    // Team Management
    UserPlus,

    // Analytics & Monitoring
    Activity, RefreshCw,

    // UI Elements
    PanelLeft as Sidebar, PanelLeftClose as SidebarClose,
    Plus,

    // Team Stats
    Users as UsersIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import PerformanceChart from './components/PerformanceChart';
import TeamMemberCard from './components/TeamMemberCard';
import TaskBoard from './components/TaskBoard';
import LiveMetrics from './components/LiveMetrics';
import RecentActivity from './components/RecentActivity';

// Types
import type { TeamMember, Task, Metric, Activity as ActivityType, Alert } from './types';

// Mock Data
const MOCK_TEAM_MEMBERS: TeamMember[] = [
    {
        id: 'tm-001',
        name: 'Sarah Chen',
        role: 'Senior Developer',
        status: 'online',
        performance: 94,
        tasks: { completed: 42, pending: 8, overdue: 0 },
        availability: { current: 'available', nextAvailable: 'Now' },
        contact: { email: 'sarah.chen@team.com', phone: '+1-555-0123', slack: '@sarahc' },
        skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
        lastActive: '2 minutes ago',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
    },
    {
        id: 'tm-002',
        name: 'Marcus Johnson',
        role: 'UX Designer',
        status: 'in-meeting',
        performance: 87,
        tasks: { completed: 28, pending: 12, overdue: 2 },
        availability: { current: 'busy', nextAvailable: '3:00 PM' },
        contact: { email: 'marcus.j@team.com', phone: '+1-555-0124', slack: '@marcusj' },
        skills: ['Figma', 'UI/UX', 'Prototyping', 'Research'],
        lastActive: '15 minutes ago',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop'
    },
    {
        id: 'tm-003',
        name: 'Alex Rodriguez',
        role: 'DevOps Engineer',
        status: 'online',
        performance: 92,
        tasks: { completed: 35, pending: 5, overdue: 0 },
        availability: { current: 'available', nextAvailable: 'Now' },
        contact: { email: 'alex.r@team.com', phone: '+1-555-0125', slack: '@alexr' },
        skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform'],
        lastActive: '5 minutes ago',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
    },
    {
        id: 'tm-004',
        name: 'Priya Sharma',
        role: 'Product Manager',
        status: 'away',
        performance: 89,
        tasks: { completed: 31, pending: 9, overdue: 1 },
        availability: { current: 'break', nextAvailable: '2:30 PM' },
        contact: { email: 'priya.s@team.com', phone: '+1-555-0126', slack: '@priyas' },
        skills: ['Agile', 'Scrum', 'Roadmapping', 'Analytics'],
        lastActive: '1 hour ago',
        avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop'
    },
    {
        id: 'tm-005',
        name: 'David Kim',
        role: 'QA Engineer',
        status: 'busy',
        performance: 91,
        tasks: { completed: 39, pending: 11, overdue: 0 },
        availability: { current: 'busy', nextAvailable: '4:00 PM' },
        contact: { email: 'david.k@team.com', phone: '+1-555-0127', slack: '@davidk' },
        skills: ['Testing', 'Automation', 'Cypress', 'Jest'],
        lastActive: '30 minutes ago',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop'
    },
    {
        id: 'tm-006',
        name: 'Emma Wilson',
        role: 'Frontend Lead',
        status: 'online',
        performance: 96,
        tasks: { completed: 45, pending: 5, overdue: 0 },
        availability: { current: 'available', nextAvailable: 'Now' },
        contact: { email: 'emma.w@team.com', phone: '+1-555-0128', slack: '@emmaw' },
        skills: ['React', 'Vue', 'Next.js', 'GraphQL'],
        lastActive: 'Just now',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'
    }
];

const MOCK_TASKS: Task[] = [
    {
        id: 'task-001',
        title: 'Implement User Authentication',
        description: 'Add OAuth2 authentication with Google and GitHub providers',
        assignee: 'Sarah Chen',
        priority: 'high',
        status: 'in-progress',
        dueDate: '2024-01-20',
        estimatedHours: 24,
        actualHours: 18,
        tags: ['backend', 'security', 'api'],
        createdAt: '2024-01-10',
        updatedAt: '2024-01-15'
    },
    {
        id: 'task-002',
        title: 'Dashboard Redesign',
        description: 'Redesign analytics dashboard with new data visualizations',
        assignee: 'Marcus Johnson',
        priority: 'medium',
        status: 'review',
        dueDate: '2024-01-18',
        estimatedHours: 40,
        actualHours: 42,
        tags: ['design', 'frontend', 'ui/ux'],
        createdAt: '2024-01-05',
        updatedAt: '2024-01-16'
    },
    {
        id: 'task-003',
        title: 'Deploy Microservices',
        description: 'Deploy new microservices architecture to production',
        assignee: 'Alex Rodriguez',
        priority: 'critical',
        status: 'todo',
        dueDate: '2024-01-22',
        estimatedHours: 16,
        actualHours: 0,
        tags: ['devops', 'deployment', 'aws'],
        createdAt: '2024-01-12',
        updatedAt: '2024-01-12'
    }
];

const MOCK_METRICS: Metric[] = [
    { id: 'm1', name: 'Team Velocity', value: 85, target: 80, trend: 'up', change: 5.2, unit: 'points' },
    { id: 'm2', name: 'Code Quality', value: 92, target: 85, trend: 'stable', change: 0.8, unit: 'score' },
    { id: 'm3', name: 'Deployment Frequency', value: 12, target: 10, trend: 'up', change: 20, unit: 'per week' }
];

const MOCK_ACTIVITIES: ActivityType[] = [
    { id: 'a1', type: 'task', user: 'Sarah Chen', action: 'Completed task: User Authentication', timestamp: '10:30 AM', read: true },
    { id: 'a2', type: 'message', user: 'Marcus Johnson', action: 'Posted in #design channel', timestamp: '10:15 AM', details: 'Dashboard mockups ready for review', read: false }
];

const MOCK_ALERTS: Alert[] = [
    { id: 'alert1', type: 'warning', title: 'High Server Load', message: 'Production servers at 85% capacity', timestamp: '10:45 AM', priority: 'high', read: false }
];

const TeamLeadWorkspace: React.FC = () => {
    // State Management
    const [activeView, setActiveView] = useState<'overview' | 'team' | 'tasks' | 'analytics' | 'messages' | 'settings'>('overview');
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS);
    const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
    const [metrics] = useState<Metric[]>(MOCK_METRICS);
    const [activities] = useState<ActivityType[]>(MOCK_ACTIVITIES);
    const [alerts] = useState<Alert[]>(MOCK_ALERTS);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [onlineCount, setOnlineCount] = useState(0);
    const [activeTasks, setActiveTasks] = useState(0);
    const [overdueTasks, setOverdueTasks] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [newTask, setNewTask] = useState<Partial<Task>>({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        dueDate: new Date().toISOString().split('T')[0],
        estimatedHours: 8
    });
    const [newMember, setNewMember] = useState<Partial<TeamMember>>({
        name: '',
        role: '',
        status: 'online'
    });

    // Effects
    useEffect(() => {
        // Calculate team stats
        const online = teamMembers.filter(m => m.status === 'online' || m.status === 'in-meeting').length;
        const active = tasks.filter(t => t.status === 'in-progress' || t.status === 'review').length;
        const overdue = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'done').length;

        setOnlineCount(online);
        setActiveTasks(active);
        setOverdueTasks(overdue);
    }, [teamMembers, tasks]);

    // Filtered Data
    const filteredTeamMembers = useMemo(() => {
        return teamMembers.filter(member => {
            const matchesSearch = searchQuery === '' ||
                member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                member.role.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSearch;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [teamMembers, searchQuery]);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            return searchQuery === '' ||
                task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                task.assignee.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [tasks, searchQuery]);

    // Handlers
    const handleMemberSelect = (member: TeamMember) => {
        setSelectedMember(member);
        setActiveView('team');
    };

    const handleStatusUpdate = (memberId: string, _newStatus: TeamMember['status']) => {
        setTeamMembers(prev => prev.map(member =>
            member.id === memberId ? { ...member, status: _newStatus } : member
        ));
    };

    const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
        setTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : task
        ));
    };

    const handleTaskDelete = (taskId: string) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
    };

    const handleMemberDelete = (memberId: string) => {
        setTeamMembers(prev => prev.filter(member => member.id !== memberId));
        if (selectedMember?.id === memberId) {
            setSelectedMember(null);
        }
    };

    const handleAddTask = () => {
        if (!newTask.title || !newTask.assignee) return;

        const task: Task = {
            id: `task-${Date.now()}`,
            title: newTask.title!,
            description: newTask.description || '',
            assignee: newTask.assignee!,
            priority: newTask.priority || 'medium',
            status: newTask.status || 'todo',
            dueDate: newTask.dueDate || new Date().toISOString().split('T')[0],
            estimatedHours: newTask.estimatedHours || 8,
            actualHours: 0,
            tags: newTask.tags || [],
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };

        setTasks(prev => [...prev, task]);
        setNewTask({
            title: '',
            description: '',
            priority: 'medium',
            status: 'todo',
            dueDate: new Date().toISOString().split('T')[0],
            estimatedHours: 8
        });
        setShowNewTaskModal(false);
    };

    const handleAddMember = () => {
        if (!newMember.name || !newMember.role) return;

        const member: TeamMember = {
            id: `tm-${Date.now()}`,
            name: newMember.name!,
            role: newMember.role!,
            status: newMember.status || 'online',
            performance: 85,
            tasks: { completed: 0, pending: 0, overdue: 0 },
            availability: { current: 'available', nextAvailable: 'Now' },
            contact: { email: '', phone: '', slack: '' },
            skills: [],
            lastActive: 'Just now'
        };

        setTeamMembers(prev => [...prev, member]);
        setNewMember({
            name: '',
            role: '',
            status: 'online'
        });
        setShowMemberModal(false);
    };

    const quickAction = (action: string) => {
        switch (action) {
            case 'refresh':
                setIsLoading(true);
                setTimeout(() => setIsLoading(false), 1000);
                break;
            case 'report':
                alert('Generating report...');
                break;
        }
    };

    // Render Functions
    const renderOverview = () => (
        <div className={styles.overviewGrid}>
            <div className={styles.quickStats}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><UsersIcon size={24} /></div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>{teamMembers.length}</div>
                        <div className={styles.statLabel}>Team Members</div>
                        <div className={styles.statSubtext}>{onlineCount} online</div>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}><Activity size={24} /></div>
                    <div className={styles.statContent}>
                        <div className={styles.statValue}>89%</div>
                        <div className={styles.statLabel}>Team Performance</div>
                    </div>
                </div>
            </div>

            <div className={styles.chartSection}>
                <h3>Team Performance</h3>
                <PerformanceChart metrics={metrics} />
            </div>

            <div className={styles.activitySection}>
                <h3>Recent Activity</h3>
                <RecentActivity activities={activities} />
            </div>

            <div className={styles.metricsSection}>
                <h3>Live Metrics</h3>
                <LiveMetrics metrics={metrics} />
            </div>

            <div className={styles.quickActionsSection}>
                <h3>Quick Actions</h3>
                <div className={styles.quickActionsGrid}>
                    <button className={styles.addButton} onClick={() => setShowNewTaskModal(true)}>
                        <Plus size={20} />
                        <span>New Task</span>
                    </button>
                    <button className={styles.addButton} onClick={() => setShowMemberModal(true)}>
                        <UserPlus size={20} />
                        <span>Add Member</span>
                    </button>
                    <button className={styles.addButton} onClick={() => quickAction('report')}>
                        <BarChart3 size={20} />
                        <span>Generate Report</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`${styles.dashboard} ${isDarkMode ? styles.darkMode : ''} ${isFullscreen ? styles.fullscreen : ''}`}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <button className={styles.menuButton} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        {isSidebarOpen ? <SidebarClose size={24} /> : <Sidebar size={24} />}
                    </button>
                    <div className={styles.logo}>
                        <TeamIcon size={28} />
                        <span>TeamLead Pro</span>
                    </div>
                    <nav className={styles.nav}>
                        {['overview', 'team', 'tasks', 'analytics'].map(view => (
                            <button
                                key={view}
                                className={`${styles.navButton} ${activeView === view ? styles.active : ''}`}
                                onClick={() => setActiveView(view as any)}
                            >
                                {view.charAt(0).toUpperCase() + view.slice(1)}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className={styles.headerRight}>
                    <button onClick={() => quickAction('refresh')}><RefreshCw size={20} /></button>
                    <button onClick={() => setIsFullscreen(!isFullscreen)}>
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                    <button onClick={() => setIsDarkMode(!isDarkMode)}><Settings size={20} /></button>
                    <div className={styles.notificationBadge}>
                        <Bell size={20} />
                        {alerts.filter(a => !a.read).length > 0 && <span className={styles.badgeCount}>{alerts.filter(a => !a.read).length}</span>}
                    </div>
                    <button className={styles.profileButton}><User size={20} /></button>
                </div>
            </header>

            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.aside
                        className={styles.sidebar}
                        initial={{ x: -250 }}
                        animate={{ x: 0 }}
                        exit={{ x: -250 }}
                    >
                        <div className={styles.sidebarContent}>
                            <div className={styles.teamSummary}>
                                <h3>Team Summary</h3>
                                <div className={styles.summaryStats}>
                                    <div className={styles.summaryStat}><span className={styles.statValue}>{onlineCount}</span><label className={styles.statLabel}>Online</label></div>
                                    <div className={styles.summaryStat}><span className={styles.statValue}>{activeTasks}</span><label className={styles.statLabel}>Active</label></div>
                                    <div className={styles.summaryStat}><span className={styles.statValue}>{overdueTasks}</span><label className={styles.statLabel}>Overdue</label></div>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    {isLoading && <div className={styles.loadingOverlay}>Loading...</div>}

                    {activeView === 'overview' && renderOverview()}
                    {activeView === 'team' && (
                        <div className={styles.teamView}>
                            <div className={styles.viewHeader}>
                                <div className={styles.headerLeft}>
                                    <h2>Team Management</h2>
                                    <span className={styles.countBadge}>{teamMembers.length} Members</span>
                                </div>
                                <div className={styles.headerRight}>
                                    <div className={styles.searchBox}>
                                        <Search size={18} />
                                        <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                    </div>
                                    <button className={styles.addButton} onClick={() => setShowMemberModal(true)}><UserPlus size={16} /> Add Member</button>
                                </div>
                            </div>
                            <div className={styles.teamGrid}>
                                {filteredTeamMembers.map(member => (
                                    <TeamMemberCard
                                        key={member.id}
                                        member={member}
                                        onSelect={() => handleMemberSelect(member)}
                                        onStatusUpdate={(status) => handleStatusUpdate(member.id, status)}
                                        onDelete={() => handleMemberDelete(member.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {activeView === 'tasks' && (
                        <div className={styles.tasksView}>
                            <div className={styles.viewHeader}>
                                <h2>Task Management</h2>
                                <button className={styles.addButton} onClick={() => setShowNewTaskModal(true)}><Plus size={16} /> New Task</button>
                            </div>
                            <TaskBoard
                                tasks={filteredTasks}
                                onTaskSelect={() => { }}
                                onTaskUpdate={handleTaskUpdate}
                                onTaskDelete={handleTaskDelete}
                            />
                        </div>
                    )}
                </div>
            </main>

            {showNewTaskModal && <div className={styles.modalOverlay} onClick={() => setShowNewTaskModal(false)}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h3>New Task</h3>
                        <button className={styles.closeModal} onClick={() => setShowNewTaskModal(false)}><XIcon size={18} /></button>
                    </div>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label>Title</label>
                            <input placeholder="Task Title" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Assignee</label>
                            <select value={newTask.assignee} onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}>
                                <option value="">Select Assignee</option>
                                {teamMembers.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button className={styles.cancelButton} onClick={() => setShowNewTaskModal(false)}>Cancel</button>
                        <button className={styles.createButton} onClick={handleAddTask}>Create Task</button>
                    </div>
                </div>
            </div>}

            {showMemberModal && <div className={styles.modalOverlay} onClick={() => setShowMemberModal(false)}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h3>Add Team Member</h3>
                        <button className={styles.closeModal} onClick={() => setShowMemberModal(false)}><XIcon size={18} /></button>
                    </div>
                    <div className={styles.modalBody}>
                        <div className={styles.formGroup}>
                            <label>Full Name</label>
                            <input placeholder="Name" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Role</label>
                            <input placeholder="Role" value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} />
                        </div>
                    </div>
                    <div className={styles.modalFooter}>
                        <button className={styles.cancelButton} onClick={() => setShowMemberModal(false)}>Cancel</button>
                        <button className={styles.createButton} onClick={handleAddMember}>Add Member</button>
                    </div>
                </div>
            </div>}

            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <span>© 2024 TeamLead Pro</span>
                    <span>{onlineCount} members online</span>
                </div>
            </footer>
        </div>
    );
};

// Helper Components
const TeamIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const XIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" />
    </svg>
);

export default TeamLeadWorkspace;
