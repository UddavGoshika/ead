import React, { useState } from "react";
import styles from "./ProfileSections.module.css";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import { Save, CheckCircle2 } from "lucide-react";

const LEGAL_PROFILE_SECTIONS = [
    "Personal Information",
    "Practice Areas",
    "Courts & Jurisdictions",
    "Bar Council Details",
    "Education",
    "Professional Experience",
    "Case History",
    "Office Address",
    "Documents",
    "Languages",
    "Verification Status"
];

const ProfileSections: React.FC = () => {
    const [sections, setSections] = useState(
        LEGAL_PROFILE_SECTIONS.map(name => ({ name, enabled: true }))
    );

    const toggleSection = (index: number) => {
        const newSections = [...sections];
        newSections[index].enabled = !newSections[index].enabled;
        setSections(newSections);
    };

    const handleUpdate = async () => {
        try {
            console.log("Saving legal section configurations:", sections);
            // In a real scenario, call settingsService.updateProfileSections(sections);
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
