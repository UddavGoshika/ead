import React, { useState } from 'react';
import { Search, Filter, Shield, User, FileText, Settings as SettingsIcon, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './ActivityLogViewer.module.css';


interface LogEntry {
    id: string;
    timestamp: string;
    action: string;
    module: string;
    user: string;
    ipAddress: string;
    status: 'success' | 'failed' | 'warning';
}

const mockLogs: LogEntry[] = [
    { id: '1', timestamp: '2023-10-27 14:32:01', action: 'Login Attempt', module: 'Auth', user: 'admin@eadvocate.com', ipAddress: '192.168.1.105', status: 'success' },
    { id: '2', timestamp: '2023-10-27 14:15:22', action: 'Update Role', module: 'User Management', user: 'hr@eadvocate.com', ipAddress: '10.0.0.4', status: 'success' },
    { id: '3', timestamp: '2023-10-27 13:45:10', action: 'Delete Invoice', module: 'Finance', user: 'finance@eadvocate.com', ipAddress: '192.168.1.200', status: 'warning' },
    { id: '4', timestamp: '2023-10-27 11:20:05', action: 'Failed Login', module: 'Auth', user: 'unknown', ipAddress: '45.22.109.11', status: 'failed' },
    { id: '5', timestamp: '2023-10-27 09:10:44', action: 'Data Export', module: 'Reports', user: 'general.manager@eadvocate.com', ipAddress: '192.168.1.101', status: 'success' },
    // more mock data to show pagination
    { id: '6', timestamp: '2023-10-26 16:55:12', action: 'Password Change', module: 'Security', user: 'marketer@eadvocate.com', ipAddress: '172.16.0.5', status: 'success' },
    { id: '7', timestamp: '2023-10-26 15:30:00', action: 'Create Ticket', module: 'Support', user: 'client123@xyz.com', ipAddress: '99.88.77.66', status: 'success' },
];

const ActivityLogViewer: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterModule, setFilterModule] = useState('All');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'success': return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Success</span>;
            case 'failed': return <span className={`${styles.badge} ${styles.badgeFailed}`}>Failed</span>;
            case 'warning': return <span className={`${styles.badge} ${styles.badgeWarning}`}>Warning</span>;
            default: return null;
        }
    };

    const getModuleIcon = (module: string) => {
        switch (module) {
            case 'Auth': return <LogOut size={16} />;
            case 'Security': return <Shield size={16} />;
            case 'User Management': return <User size={16} />;
            case 'Finance': return <FileText size={16} />;
            default: return <SettingsIcon size={16} />;
        }
    };

    const filteredLogs = mockLogs.filter(log => {
        const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesModule = filterModule === 'All' || log.module === filterModule;
        return matchesSearch && matchesModule;
    });

    return (
        <div className={styles.logViewerContainer}>
            <div className={styles.headerControls}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.icon} />
                    <input
                        type="text"
                        placeholder="Search by action or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className={styles.filterBox}>
                    <Filter size={18} className={styles.icon} />
                    <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)}>
                        <option value="All">All Modules</option>
                        <option value="Auth">Auth</option>
                        <option value="Security">Security</option>
                        <option value="User Management">User Management</option>
                        <option value="Finance">Finance</option>
                        <option value="Support">Support</option>
                        <option value="Reports">Reports</option>
                    </select>
                </div>
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.logTable}>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Action</th>
                            <th>Module</th>
                            <th>User</th>
                            <th>IP Address</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id}>
                                <td className={styles.timestampCell}>{log.timestamp}</td>
                                <td className={styles.actionCell}>
                                    <strong>{log.action}</strong>
                                </td>
                                <td>
                                    <div className={styles.moduleCell}>
                                        <span className={styles.moduleIcon}>{getModuleIcon(log.module)}</span>
                                        {log.module}
                                    </div>
                                </td>
                                <td className={styles.userCell}>{log.user}</td>
                                <td className={styles.ipCell}>{log.ipAddress}</td>
                                <td>{getStatusBadge(log.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <div className={styles.emptyState}>
                        No logs match your search criteria.
                    </div>
                )}
            </div>

            <div className={styles.pagination}>
                <span className={styles.pageInfo}>Showing 1 to {filteredLogs.length} of {mockLogs.length} entries</span>
                <div className={styles.pageControls}>
                    <button disabled><ChevronLeft size={16} /></button>
                    <button className={styles.activePage}>1</button>
                    <button disabled><ChevronRight size={16} /></button>
                </div>
            </div>
        </div>
    );
};

export default ActivityLogViewer;
