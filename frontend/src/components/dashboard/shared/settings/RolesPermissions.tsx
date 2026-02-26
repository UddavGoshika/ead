import React from 'react';
import { Shield, Check, X, Save } from 'lucide-react';
import styles from './SettingsForms.module.css';

const rolesList = ['General Manager', 'HR', 'Finance', 'Verifier', 'Team Lead', 'Marketer', 'Support'];
const permissionsMatrix = [
    { module: 'Finance Reports', actions: ['view', 'export'] },
    { module: 'Invoices', actions: ['view', 'create', 'edit', 'delete', 'approve'] },
    { module: 'User Management', actions: ['view', 'create', 'edit', 'delete'] },
    { module: 'Audit Logs', actions: ['view', 'export'] },
    { module: 'Marketing Campaigns', actions: ['view', 'create', 'edit', 'delete'] },
];

const mockRolePermissions: Record<string, string[]> = {
    'General Manager': ['finance:view', 'finance:export', 'invoices:view', 'user:view', 'audit:view'],
    'Finance': ['finance:view', 'finance:export', 'invoices:view', 'invoices:create', 'invoices:edit', 'invoices:approve'],
    'HR': ['user:view', 'user:create', 'user:edit'],
};

const RolesPermissions: React.FC = () => {
    const [selectedRole, setSelectedRole] = React.useState('Finance');

    const hasPermission = (module: string, action: string) => {
        const key = `${module.split(' ')[0].toLowerCase()}:${action}`;
        return mockRolePermissions[selectedRole]?.includes(key) || false;
    };

    return (
        <div className={styles.settingsSection}>
            <div className={styles.sectionHeader}>
                <h2>Roles & Permissions Matrix</h2>
                <p>Configure granular access control lists for different staff roles.</p>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Shield size={20} style={{ color: '#3b82f6' }} />
                    <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className={styles.selectField}
                        style={{ width: '250px', background: '#0f172a', padding: '8px 12px' }}
                    >
                        {rolesList.map(r => <option key={r} value={r}>{r} Role Settings</option>)}
                    </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <th style={{ padding: '16px', textAlign: 'left', color: '#94a3b8', fontSize: '13px' }}>Module</th>
                                <th style={{ padding: '16px', color: '#94a3b8', fontSize: '13px' }}>View</th>
                                <th style={{ padding: '16px', color: '#94a3b8', fontSize: '13px' }}>Create</th>
                                <th style={{ padding: '16px', color: '#94a3b8', fontSize: '13px' }}>Edit</th>
                                <th style={{ padding: '16px', color: '#94a3b8', fontSize: '13px' }}>Delete</th>
                                <th style={{ padding: '16px', color: '#94a3b8', fontSize: '13px' }}>Approve/Export</th>
                            </tr>
                        </thead>
                        <tbody>
                            {permissionsMatrix.map(pm => (
                                <tr key={pm.module} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '16px', textAlign: 'left', color: '#f8fafc', fontWeight: 500 }}>
                                        {pm.module}
                                    </td>
                                    <td>
                                        {pm.actions.includes('view') ? (
                                            <input type="checkbox" defaultChecked={hasPermission(pm.module, 'view')} />
                                        ) : <span style={{ color: '#334155' }}>-</span>}
                                    </td>
                                    <td>
                                        {pm.actions.includes('create') ? (
                                            <input type="checkbox" defaultChecked={hasPermission(pm.module, 'create')} />
                                        ) : <span style={{ color: '#334155' }}>-</span>}
                                    </td>
                                    <td>
                                        {pm.actions.includes('edit') ? (
                                            <input type="checkbox" defaultChecked={hasPermission(pm.module, 'edit')} />
                                        ) : <span style={{ color: '#334155' }}>-</span>}
                                    </td>
                                    <td>
                                        {pm.actions.includes('delete') ? (
                                            <input type="checkbox" defaultChecked={hasPermission(pm.module, 'delete')} />
                                        ) : <span style={{ color: '#334155' }}>-</span>}
                                    </td>
                                    <td>
                                        {(pm.actions.includes('approve') || pm.actions.includes('export')) ? (
                                            <input type="checkbox" defaultChecked={hasPermission(pm.module, 'approve') || hasPermission(pm.module, 'export')} />
                                        ) : <span style={{ color: '#334155' }}>-</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.actionFooter}>
                <button className={styles.saveBtn}>
                    <Save size={18} /> Update Matrix
                </button>
            </div>
        </div>
    );
};

export default RolesPermissions;
