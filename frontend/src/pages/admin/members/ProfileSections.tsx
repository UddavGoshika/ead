import React, { useState } from "react";
import styles from "./ProfileSections.module.css";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import { Save, CheckCircle2 } from "lucide-react";

import { useAdminConfig } from "../../../hooks/useAdminConfig";

const ProfileSections: React.FC = () => {
    const { sections, saveSections: setSections } = useAdminConfig();

    const toggleSection = (index: number) => {
        const newSections = [...sections];
        newSections[index].enabled = !newSections[index].enabled;
        setSections(newSections);
    };

    const handleUpdate = async () => {
        try {
            console.log("Saving legal section configurations:", sections);
            // The hook already saved to localStorage on every change, but we can show a success message here
            alert("Legal profile sections updated successfully!");
        } catch (err) {
            alert("Failed to update profile sections.");
        }
    };

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
                </div>
                <div className={styles.body}>
                    <div className={styles.sectionList}>
                        {sections.map((section, index) => (
                            <label key={section.name} className={styles.sectionItem}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={section.enabled}
                                    onChange={() => toggleSection(index)}
                                />
                                <span className={styles.sectionName}>{section.name}</span>
                                {section.enabled && <CheckCircle2 size={16} color="#3b82f6" style={{ marginLeft: 'auto' }} />}
                            </label>
                        ))}
                    </div>
                </div>
                <div className={styles.footer}>
                    <button className={styles.updateBtn} onClick={handleUpdate}>
                        <Save size={18} style={{ marginRight: '8px' }} /> Update Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSections;
