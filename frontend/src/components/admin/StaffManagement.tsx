import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './StaffManagement.module.css';
import { Shield, Key, Mail, User, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

interface StaffMember {
    id: string;
    email: string;
    role: string;
    status: string;
    profile: {
        staffId?: string;
        department?: string;
        level?: string;
    };
}

const StaffManagement: React.FC = () => {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/admin/staff');
            if (res.data.success) {
                setStaff(res.data.staff);
            }
        } catch (err) {
            console.error("Error fetching staff:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <h2><Shield size={24} /> Staff & Partner Management</h2>
                    <p>Manage internal login IDs and access credentials for outsourcing and core teams.</p>
                </div>
                <button className={styles.addBtn} onClick={() => window.location.href = '/admin/register'}>
                    Onboard New Personnel
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading personnel directory...</div>
            ) : (
                <div className={styles.grid}>
                    {staff.map((member) => (
                        <div key={member.id} className={styles.card}>
                            <div className={member.status === 'Active' ? styles.statusActive : styles.statusInactive}>
                                {member.status}
                            </div>
                            <div className={styles.roleTag}>{member.role}</div>

                            <div className={styles.userInfo}>
                                <div className={styles.avatar}>
                                    {member.email.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3>{member.email}</h3>
                                    <span className={styles.idLabel}>
                                        <Key size={12} /> Login ID: <strong>{member.profile?.staffId || 'Not Assigned'}</strong>
                                    </span>
                                </div>
                            </div>

                            <div className={styles.details}>
                                <div className={styles.detailItem}>
                                    <Mail size={14} /> <span>{member.email}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <User size={14} /> <span>{member.profile?.department || 'Operational Hub'}</span>
                                </div>
                            </div>

                            <div className={styles.actions}>
                                <button title="Edit Credentials"><Edit size={16} /></button>
                                <button title="Reset Passcode"><Key size={16} /></button>
                                <button className={styles.deleteBtn} title="Deactivate Account"><XCircle size={16} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
