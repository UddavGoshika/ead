import React, { useState, useEffect } from "react";
import styles from "./LanguageSettings.module.css";
import api from "../../../services/api";
import { useToast } from "../../../context/ToastContext";

type Language = {
    id: number;
    name: string;
    code: string;
    rtl: boolean;
    enabled: boolean;
};

const initialLanguages: Language[] = [
    { id: 1, name: "English", code: "en", rtl: false, enabled: true },
    { id: 2, name: "Hindi", code: "hi", rtl: false, enabled: true },
    { id: 3, name: "Bengali", code: "bn", rtl: false, enabled: true },
    { id: 4, name: "Telugu", code: "te", rtl: false, enabled: true },
    { id: 5, name: "Marathi", code: "mr", rtl: false, enabled: true },
    { id: 6, name: "Tamil", code: "ta", rtl: false, enabled: true },
    { id: 7, name: "Urdu", code: "ur", rtl: true, enabled: true },
    { id: 8, name: "Gujarati", code: "gu", rtl: false, enabled: true },
    { id: 9, name: "Kannada", code: "kn", rtl: false, enabled: true },
    { id: 10, name: "Odia", code: "or", rtl: false, enabled: true },
    { id: 11, name: "Punjabi", code: "pa", rtl: false, enabled: true },
    { id: 12, name: "Assamese", code: "as", rtl: false, enabled: true },
    { id: 13, name: "Maithili", code: "mai", rtl: false, enabled: true },
    { id: 14, name: "Santali", code: "sat", rtl: false, enabled: true },
    { id: 15, name: "Kashmiri", code: "ks", rtl: true, enabled: true },
    { id: 16, name: "Nepali", code: "ne", rtl: false, enabled: true },
    { id: 17, name: "Konkani", code: "kok", rtl: false, enabled: true },
    { id: 18, name: "Sindhi", code: "sd", rtl: true, enabled: true },
    { id: 19, name: "Dogri", code: "doi", rtl: false, enabled: true },
    { id: 20, name: "Manipuri (Meitei)", code: "mni", rtl: false, enabled: true },
    { id: 21, name: "Bodo", code: "brx", rtl: false, enabled: true },
    { id: 22, name: "Sanskrit", code: "sa", rtl: false, enabled: true },
];

const LanguageSettings: React.FC = () => {
    const { showToast: centralShowToast } = useToast();
    const [languages, setLanguages] = useState<Language[]>([]);
    const [defaultLang, setDefaultLang] = useState<string>("en");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [newName, setNewName] = useState("");
    const [newCode, setNewCode] = useState("");

    const fetchLanguages = async () => {
        try {
            setLoading(true);
            const res = await api.get('/settings/site');
            if (res.data.success) {
                const fetched = res.data.settings.languages || [];
                if (fetched.length === 0) {
                    setLanguages(initialLanguages);
                } else {
                    setLanguages(fetched);
                }
                setDefaultLang(res.data.settings.default_language || 'en');
            }
        } catch (err) {
            console.error("Error fetching languages:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLanguages();
    }, []);

    const saveAll = async (updatedLangs: Language[], newDefault?: string) => {
        try {
            setSaving(true);
            await api.post('/settings/site', {
                languages: updatedLangs,
                default_language: newDefault || defaultLang
            });
            centralShowToast("Language settings updated");
        } catch (err) {
            console.error("Error saving languages:", err);
            centralShowToast("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    const toggleRTL = (id: number) => {
        const updated = languages.map((l) =>
            l.id === id ? { ...l, rtl: !l.rtl } : l
        );
        setLanguages(updated);
        saveAll(updated);
    };

    const toggleEnabled = (id: number) => {
        const updated = languages.map((l) =>
            l.id === id ? { ...l, enabled: !l.enabled } : l
        );
        setLanguages(updated);
        saveAll(updated);
    };

    const deleteLanguage = (id: number) => {
        const updated = languages.filter((l) => l.id !== id);
        setLanguages(updated);
        saveAll(updated);
    };

    const addLanguage = () => {
        if (!newName || !newCode) return;

        const updated = [
            ...languages,
            {
                id: Date.now(),
                name: newName,
                code: newCode.toLowerCase(),
                rtl: false,
                enabled: true,
            },
        ];
        setLanguages(updated);
        saveAll(updated);

        setNewName("");
        setNewCode("");
    };

    const handleTranslate = (lang: Language) => {
        alert(`Open translate panel for: ${lang.name}`);
    };

    if (loading) return <div className={styles.page}>Loading...</div>;

    return (
        <div className={styles.page}>
            {/* DEFAULT LANGUAGE */}
            <div className={styles.card}>
                <h3>Default Language</h3>
                <div className={styles.inline}>
                    <select
                        value={defaultLang}
                        onChange={(e) => setDefaultLang(e.target.value)}
                    >
                        {languages
                            .filter((l) => l.enabled)
                            .map((l) => (
                                <option key={l.code} value={l.code}>
                                    {l.name}
                                </option>
                            ))}
                    </select>
                    <button className={styles.saveBtn} onClick={() => saveAll(languages, defaultLang)}>Save</button>
                </div>
            </div>

            {/* GRID */}
            <div className={styles.grid}>
                {/* ALL LANGUAGES */}
                <div className={styles.card}>
                    <h3>All Languages</h3>

                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Code</th>
                                <th>RTL</th>
                                <th>Status</th>
                                <th>Options</th>
                            </tr>
                        </thead>

                        <tbody>
                            {languages.map((l) => (
                                <tr key={l.id}>
                                    <td>{l.id}</td>
                                    <td>{l.name}</td>
                                    <td>{l.code}</td>

                                    <td>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={l.rtl}
                                                onChange={() => toggleRTL(l.id)}
                                            />
                                            <span className={styles.slider} />
                                        </label>
                                    </td>

                                    <td>
                                        <label className={styles.switch}>
                                            <input
                                                type="checkbox"
                                                checked={l.enabled}
                                                onChange={() => toggleEnabled(l.id)}
                                            />
                                            <span className={styles.slider} />
                                        </label>
                                    </td>

                                    <td className={styles.options}>
                                        <button className={styles.iconEdit}>✎</button>
                                        <button
                                            className={styles.iconTranslate}
                                            onClick={() => handleTranslate(l)}
                                        >
                                            🌐
                                        </button>

                                        {l.id !== 1 && (
                                            <button
                                                className={styles.iconDelete}
                                                onClick={() => deleteLanguage(l.id)}
                                            >
                                                🗑
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ADD NEW LANGUAGE */}
                <div className={styles.card}>
                    <h3>Add New Language</h3>

                    <div className={styles.field}>
                        <label>Name</label>
                        <input
                            placeholder="Eg. Spanish"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Code</label>
                        <input
                            placeholder="Eg. es"
                            value={newCode}
                            onChange={(e) => setNewCode(e.target.value)}
                        />
                    </div>

                    <div className={styles.right}>
                        <button className={styles.saveBtn} onClick={addLanguage}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LanguageSettings;
