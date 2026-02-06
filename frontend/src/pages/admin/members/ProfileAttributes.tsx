import React, { useState } from "react";
import styles from "./ProfileAttributes.module.css";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import { Trash2, Plus } from "lucide-react";
import { useAdminConfig } from "../../../hooks/useAdminConfig";

const ProfileAttributes: React.FC = () => {
    const [activeRole, setActiveRole] = useState('advocate');
    const { attributes: categories, saveAttributes, loading } = useAdminConfig(activeRole);
    const [newOptionTexts, setNewOptionTexts] = useState<Record<string, string>>({});

    const roles = [
        { id: 'advocate', label: 'Advocate' },
        { id: 'client', label: 'Client' },
        { id: 'legal_provider', label: 'Legal Advisor' }
    ];

    const toggleOption = (catId: string, optId: string) => {
        const newCategories = categories.map(cat => {
            if (cat.id !== catId) return cat;
            return {
                ...cat,
                options: cat.options.map(opt => {
                    if (opt.id !== optId) return opt;
                    return { ...opt, enabled: !opt.enabled };
                })
            };
        });
        saveAttributes(newCategories, activeRole);
    };

    const deleteOption = (catId: string, optId: string) => {
        if (!window.confirm("Are you sure you want to delete this option?")) return;
        const newCategories = categories.map(cat => {
            if (cat.id !== catId) return cat;
            return {
                ...cat,
                options: cat.options.filter(opt => opt.id !== optId)
            };
        });
        saveAttributes(newCategories, activeRole);
    };

    const addOption = (catId: string) => {
        const text = newOptionTexts[catId];
        if (!text || !text.trim()) return;

        const newCategories = categories.map(cat => {
            if (cat.id !== catId) return cat;
            return {
                ...cat,
                options: [
                    ...cat.options,
                    { id: Date.now().toString(), label: text.trim(), enabled: true }
                ]
            };
        });
        saveAttributes(newCategories, activeRole);
        setNewOptionTexts(prev => ({ ...prev, [catId]: "" }));
    };

    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Profile Attributes"
                onSearch={() => { }}
                placeholder="Search attributes..."
            />

            <div style={{ padding: '0 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
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

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading attributes...</div>
            ) : (
                <div className={styles.grid}>
                    {categories.map(cat => (
                        <div key={cat.id} className={styles.attributeCard}>
                            <div className={styles.cardHeader}>
                                <h3>{cat.title}</h3>
                            </div>

                            <div className={styles.optionList}>
                                {cat.options.map(opt => (
                                    <div key={opt.id} className={styles.optionItem}>
                                        <span className={styles.optionName}>{opt.label}</span>
                                        <div className={styles.optionActions}>
                                            <label className={styles.toggle}>
                                                <input
                                                    type="checkbox"
                                                    checked={opt.enabled}
                                                    onChange={() => toggleOption(cat.id, opt.id)}
                                                />
                                                <span className={styles.slider}></span>
                                            </label>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => deleteOption(cat.id, opt.id)}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className={styles.addForm}>
                                <input
                                    type="text"
                                    className={styles.addInput}
                                    placeholder={`Add new ${cat.title.toLowerCase()}...`}
                                    value={newOptionTexts[cat.id] || ""}
                                    onChange={(e) => setNewOptionTexts(prev => ({ ...prev, [cat.id]: e.target.value }))}
                                    onKeyPress={(e) => e.key === 'Enter' && addOption(cat.id)}
                                />
                                <button className={styles.addBtnActive} onClick={() => addOption(cat.id)}>
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProfileAttributes;
