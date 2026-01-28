import React, { useState } from "react";
import styles from "./ProfileAttributes.module.css";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import { Trash2, Plus } from "lucide-react";

interface AttributeOption {
    id: string;
    label: string;
    enabled: boolean;
}

interface AttributeCategory {
    id: string;
    title: string;
    options: AttributeOption[];
}

const INITIAL_DATA: AttributeCategory[] = [
    {
        id: "practice_area",
        title: "Practice Area",
        options: [
            { id: "1", label: "Supreme Court", enabled: true },
            { id: "2", label: "High Court", enabled: true },
            { id: "3", label: "District Court", enabled: true },
        ]
    },
    {
        id: "specialization",
        title: "Specialization",
        options: [
            { id: "1", label: "Criminal Law", enabled: true },
            { id: "2", label: "Civil Law", enabled: true },
            { id: "3", label: "Corporate Law", enabled: true },
            { id: "4", label: "Family Law", enabled: true },
        ]
    },
    {
        id: "experience",
        title: "Experience Level",
        options: [
            { id: "1", label: "Junior (0-3 yrs)", enabled: true },
            { id: "2", label: "Senior (5-10 yrs)", enabled: true },
            { id: "3", label: "Expert (15+ yrs)", enabled: true },
        ]
    },
    {
        id: "language",
        title: "Languages Spoken",
        options: [
            { id: "1", label: "English", enabled: true },
            { id: "2", label: "Hindi", enabled: true },
            { id: "3", label: "Regional", enabled: true },
        ]
    }
];

const ProfileAttributes: React.FC = () => {
    const [categories, setCategories] = useState<AttributeCategory[]>(INITIAL_DATA);
    const [newOptionTexts, setNewOptionTexts] = useState<Record<string, string>>({});

    const toggleOption = (catId: string, optId: string) => {
        setCategories(prev => prev.map(cat => {
            if (cat.id !== catId) return cat;
            return {
                ...cat,
                options: cat.options.map(opt => {
                    if (opt.id !== optId) return opt;
                    return { ...opt, enabled: !opt.enabled };
                })
            };
        }));
    };

    const deleteOption = (catId: string, optId: string) => {
        if (!window.confirm("Are you sure you want to delete this option?")) return;
        setCategories(prev => prev.map(cat => {
            if (cat.id !== catId) return cat;
            return {
                ...cat,
                options: cat.options.filter(opt => opt.id !== optId)
            };
        }));
    };

    const addOption = (catId: string) => {
        const text = newOptionTexts[catId];
        if (!text || !text.trim()) return;

        setCategories(prev => prev.map(cat => {
            if (cat.id !== catId) return cat;
            return {
                ...cat,
                options: [
                    ...cat.options,
                    { id: Date.now().toString(), label: text.trim(), enabled: true }
                ]
            };
        }));

        setNewOptionTexts(prev => ({ ...prev, [catId]: "" }));
    };

    return (
        <div className={styles.container}>
            <AdminPageHeader
                title="Profile Attributes"
                onSearch={() => { }}
                placeholder="Search attributes..."
            />

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
        </div>
    );
};

export default ProfileAttributes;
