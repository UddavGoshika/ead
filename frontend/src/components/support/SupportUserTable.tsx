import React from 'react';
import styles from './SupportUserTable.module.css';
import { MoreHorizontal, Clock } from 'lucide-react';

interface SupportUser {
    id: string;
    name: string;
    role: string;
    status: string;
    lastActivity: string;
    image?: string;
}

interface SupportUserTableProps {
    users: SupportUser[];
}

const SupportUserTable: React.FC<SupportUserTableProps> = ({ users }) => {
    return (
        <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
                <h3>DIRECTORY: ALL ACTIVE NODES</h3>
                <span className={styles.nodeCount}>{users.length} NODES ONLINE</span>
            </div>
            <div className={styles.scrollWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>IDENTIFIER</th>
                            <th>DESIGNATION</th>
                            <th>TEMPORAL STATUS</th>
                            <th>UPLINK STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className={styles.userCell}>
                                        <div className={styles.miniAvatar}>
                                            {user.image ? <img src={user.image} alt="" /> : user.name.charAt(0)}
                                        </div>
                                        <div className={styles.userInfo}>
                                            <div className={styles.name}>{user.name}</div>
                                            <div className={styles.id}>#{user.id.slice(0, 8)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.roleBadge}>{user.role.toUpperCase()}</span>
                                </td>
                                <td>
                                    <div className={styles.activityInfo}>
                                        <Clock size={12} />
                                        <span>Last seen {user.lastActivity}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={styles.statusBadge}>
                                        <span className={styles.pulseDot} />
                                        ONLINE
                                    </div>
                                </td>
                                <td>
                                    <button className={styles.actionBtn}><MoreHorizontal size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SupportUserTable;
