import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Edit2, Trash2, Shield, User } from 'lucide-react';
import styles from './SettingsForms.module.css';

interface SystemUser {
    id: string;
    name: string;
    email: string;
    role: string;
    status: 'Active' | 'Inactive' | 'Pending';
    lastLogin: string;
}

const mockUsers: SystemUser[] = [
    { id: '1', name: 'Alice Admin', email: 'alice@eadvocate.com', role: 'General Manager', status: 'Active', lastLogin: '2h ago' },
    { id: '2', name: 'Bob Finance', email: 'bob@finance.com', role: 'Finance', status: 'Active', lastLogin: '5m ago' },
    { id: '3', name: 'Charlie HR', email: 'charlie@hr.com', role: 'HR', status: 'Inactive', lastLogin: '1d ago' },
    { id: '4', name: 'Diana Support', email: 'diana@support.com', role: 'Support Team Lead', status: 'Active', lastLogin: '10m ago' },
    { id: '5', name: 'Evan Marketer', email: 'evan@marketing.com', role: 'Marketer', status: 'Pending', lastLogin: 'Never' },
];

const UserManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = mockUsers.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return '#10b981';
            case 'Inactive': return '#ef4444';
            case 'Pending': return '#f59e0b';
            default: return '#64748b';
        }
    };

    return (
        <div className={styles.settingsSection}>
            <div className={styles.sectionHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>User Management</h2>
                    <p>Manage staff accounts, invitations, and access states.</p>
                </div>
                <button className={styles.saveBtn} style={{ margin: 0 }}>
                    <Plus size={16} /> Add New User
                </button>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3><User size={18} /> System Users</h3>
                    <div className={styles.searchBox} style={{ margin: 0, padding: '4px 12px', background: 'transparent' }}>
                        <Search size={14} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '150px' }}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>User</th>
                                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Role</th>
                                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Last Login</th>
                                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px', fontWeight: 600 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: '#f8fafc', fontWeight: 500 }}>{user.name}</span>
                                            <span style={{ color: '#64748b', fontSize: '12px' }}>{user.email}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '14px' }}>
                                            <Shield size={14} style={{ color: '#3b82f6' }} />
                                            {user.role}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                            background: `${getStatusColor(user.status)}22`,
                                            color: getStatusColor(user.status),
                                            border: `1px solid ${getStatusColor(user.status)}44`
                                        }}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '13px' }}>
                                        {user.lastLogin}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }} title="Edit">
                                                <Edit2 size={16} />
                                            </button>
                                            <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Revoke Access">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && (
                        <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>No users found matching "{searchTerm}"</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
