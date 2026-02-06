import React, { useState } from "react";
import styles from "./ProfileSections.module.css";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import { Save, CheckCircle2 } from "lucide-react";

import { useAdminConfig } from "../../../hooks/useAdminConfig";

const ProfileSections: React.FC = () => {
    const [activeRole, setActiveRole] = useState('advocate');
    const { sections, saveSections, loading } = useAdminConfig(activeRole);

    const roles = [
        { id: 'advocate', label: 'Advocate' },
        { id: 'client', label: 'Client' },
        { id: 'legal_provider', label: 'Legal Advisor' }
    ];

    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Profile Configuration"
                onSearch={() => { }}
                placeholder="Search settings..."
            />

            <div className={styles.card}>
                <div className={styles.header}>
                    <h2>Member Profile Sections Alignment</h2>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {roles.map(role => (
                            <button
                                key={role.id}
                                onClick={() => setActiveRole(role.id)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    border: 'none',
                                    cursor: 'pointer',
                                    backgroundColor: activeRole === role.id ? '#3b82f6' : '#e5e7eb',
                                    color: activeRole === role.id ? 'white' : '#374151',
                                    fontWeight: '500'
                                }}
                            >
                                {role.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className={styles.body}>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center' }}>Loading configurations...</div>
                    ) : (
                        <div className={styles.sectionList}>
                            {sections.map((section, index) => (
                                <label key={section.name} className={styles.sectionItem}>
                                    <input
                                        type="checkbox"
                                        className={styles.checkbox}
                                        checked={section.enabled}
                                        onChange={() => {
                                            const newSections = [...sections];
                                            newSections[index] = { ...newSections[index], enabled: !newSections[index].enabled };
                                            saveSections(newSections, activeRole);
                                        }}
                                    />
                                    <span className={styles.sectionName}>{section.name}</span>
                                    {section.enabled && <CheckCircle2 size={16} color="#3b82f6" style={{ marginLeft: 'auto' }} />}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                <div className={styles.footer}>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        * Changes are saved automatically
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSections;
