import React, { useState } from 'react';
import { X, Save, User, Mail, Phone, MapPin } from 'lucide-react';
import styles from './MemberEditModal.module.css';
import axios from 'axios';

interface Member {
    id: string;
    name: string;
    email?: string;
    phone: string;
    location?: string;
    gender: string;
    role: string;
}

interface Props {
    member: Member | null;
    onClose: () => void;
    onSave: (updated: Member) => void;
}

const MemberEditModal: React.FC<Props> = ({ member, onClose, onSave }) => {
    const [formData, setFormData] = useState<Member>(member || {
        id: '',
        name: '',
        email: '',
        phone: '',
        location: '',
        gender: 'Male',
        role: 'Advocate'
    });
    const [saving, setSaving] = useState(false);

    if (!member) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            const res = await axios.patch(`/api/admin/members/${member.id}/profile`, formData);
            if (res.data.success) {
                onSave(formData); // Use local formData for immediate UI update
                onClose();
            }
        } catch (err) {
            alert("Error updating member");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Edit Member Profile</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.content}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label><User size={16} /> Full Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label><Mail size={16} /> Email Address</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label><Phone size={16} /> Phone Number</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label><MapPin size={16} /> Location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Gender</label>
                                <select
                                    value={formData.gender}
                                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Role</label>
                                <input type="text" value={formData.role} disabled className={styles.disabledInput} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose}>Cancel</button>
                        <button type="submit" className={styles.saveBtn} disabled={saving}>
                            {saving ? "Saving..." : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MemberEditModal;
