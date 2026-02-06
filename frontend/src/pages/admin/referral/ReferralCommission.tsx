import React, { useState } from "react";
import styles from "./ReferralCommission.module.css";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

type CommissionRule = {
    _id?: string;
    id?: string;
    level: string;
    role: string;
    type: string;
    value: string;
    condition: string;
    status: "Active" | "Inactive";
};

const API_BASE_URL = window.location.hostname === 'localhost' ? "http://localhost:5000" : "";

const ReferralCommissionSettings: React.FC = () => {
    const [rulesList, setRulesList] = useState<CommissionRule[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);
    const [loading, setLoading] = useState(true);
    const [customLevel, setCustomLevel] = useState("");
    const [genConfig, setGenConfig] = useState({
        min_payout: 2000,
        payout_method: "Bank Transfer / UPI",
        link_expiry_days: 30,
        enable_multilevel: true
    });

    const fetchRules = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/admin/referral/rules`);
            if (res.data.success) {
                setRulesList(res.data.rules);
            }

            const settingsRes = await axios.get(`${API_BASE_URL}/api/settings/site`);
            if (settingsRes.data.success && settingsRes.data.settings.referral_settings) {
                setGenConfig(settingsRes.data.settings.referral_settings);
            }
        } catch (err) {
            console.error("Failed to fetch referral data", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchRules();
    }, []);

    const [newRule, setNewRule] = useState<CommissionRule>({
        id: "",
        level: "Level 1",
        role: "Our Staff",
        type: "Percentage",
        value: "",
        condition: "referred person buy a package then only he get money",
        status: "Active"
    });

    const handleOpenModal = (rule?: CommissionRule) => {
        if (rule) {
            setEditingRule(rule);
            setNewRule(rule);
            // If the level is NOT one of the standard ones, it's a custom one
            const standardLevels = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"];
            if (!standardLevels.includes(rule.level)) {
                setCustomLevel(rule.level);
                setNewRule({ ...rule, level: "Custom" });
            } else {
                setCustomLevel("");
            }
        } else {
            setEditingRule(null);
            setNewRule({
                level: "Level 1",
                role: "Our Staff",
                type: "Percentage",
                value: "",
                condition: "referred person buy a package then only he get money",
                status: "Active"
            });
            setCustomLevel("");
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const finalRule = { ...newRule };
        if (finalRule.level === "Custom") {
            if (!customLevel.trim()) {
                alert("Please enter a custom level name");
                return;
            }
            finalRule.level = customLevel;
        }

        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/referral/rules`, finalRule);
            if (res.data.success) {
                fetchRules();
                setIsModalOpen(false);
            }
        } catch (err) {
            alert("Failed to save rule");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this commission rule?")) {
            try {
                const res = await axios.delete(`${API_BASE_URL}/api/admin/referral/rules/${id}`);
                if (res.data.success) {
                    fetchRules();
                }
            } catch (err) {
                alert("Failed to delete rule");
            }
        }
    };

    const toggleStatus = async (rule: CommissionRule) => {
        const newStatus = rule.status === "Active" ? "Inactive" : "Active";
        try {
            const res = await axios.post(`${API_BASE_URL}/api/admin/referral/rules`, {
                _id: rule._id,
                status: newStatus
            });
            if (res.data.success) {
                fetchRules();
            }
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleSaveSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/settings/site`,
                { referral_settings: genConfig },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                alert("Referral settings saved successfully!");
            }
        } catch (err) {
            alert("Failed to save referral configuration");
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h1>Referral Commission Settings</h1>
                <p>Manage commission rates and levels for different user roles.</p>
            </div>

            {/* SETTINGS TABLE */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2>Active Commission Rules</h2>
                    <button className={styles.primaryBtn} onClick={() => handleOpenModal()}>
                        <Plus size={18} /> Add New Rule
                    </button>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Serial No</th>
                                <th>Commission Level</th>
                                <th>Roles</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Commission/Condition</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rulesList.map((rule, index) => (
                                <tr key={rule._id || rule.id}>
                                    <td>{index + 1}</td>
                                    <td className={styles.level}>{rule.level}</td>
                                    <td>
                                        <span className={styles.roleBadge}>{rule.role}</span>
                                    </td>
                                    <td>{rule.type}</td>
                                    <td>
                                        <span className={styles.value}>{rule.value}</span>
                                    </td>
                                    <td>{rule.condition}</td>
                                    <td>
                                        <span
                                            className={`${styles.status} ${rule.status === "Active" ? styles.active : styles.inactive}`}
                                            onClick={() => toggleStatus(rule)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {rule.status === "Active" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {rule.status}
                                        </span>
                                    </td>
                                    <td className={styles.actions}>
                                        <button className={styles.editBtn} title="Edit" onClick={() => handleOpenModal(rule)}>
                                            <Edit size={16} />
                                        </button>
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(rule._id!)} title="Delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CONFIGURATION */}
            <div className={styles.card}>
                <div className={styles.cardHeader}>
                    <h2>General Configuration</h2>
                </div>

                <div className={styles.formGrid}>
                    <div className={styles.field}>
                        <label>Minimum Payout Amount</label>
                        <div className={styles.inputWithUnit}>
                            <span>₹</span>
                            <input
                                type="number"
                                value={genConfig.min_payout}
                                onChange={e => setGenConfig({ ...genConfig, min_payout: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Payout Method</label>
                        <select
                            value={genConfig.payout_method}
                            onChange={e => setGenConfig({ ...genConfig, payout_method: e.target.value })}
                        >
                            <option>Bank Transfer / UPI</option>
                            <option>PayPal</option>
                            <option>Platform Wallet</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label>Referral Link Expiry (Days)</label>
                        <input
                            type="number"
                            value={genConfig.link_expiry_days}
                            onChange={e => setGenConfig({ ...genConfig, link_expiry_days: parseInt(e.target.value) })}
                        />
                    </div>

                    <div className={styles.field}>
                        <label>Multiple Commission Tracking</label>
                        <div className={styles.checkboxGroup}>
                            <input
                                type="checkbox"
                                id="multilevel"
                                checked={genConfig.enable_multilevel}
                                onChange={e => setGenConfig({ ...genConfig, enable_multilevel: e.target.checked })}
                            />
                            <label htmlFor="multilevel">Enable Level-based Commission</label>
                        </div>
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.saveBtn} onClick={handleSaveSettings}>Save Configuration</button>
                </div>
            </div>

            {/* ADD/EDIT RULE MODAL */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{editingRule ? "Edit Commission Rule" : "Add Commission Rule"}</h3>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}><XCircle size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.field}>
                                <label>Commission Level</label>
                                <select
                                    value={newRule.level}
                                    onChange={e => setNewRule({ ...newRule, level: e.target.value })}
                                    required
                                >
                                    <option>Level 1</option>
                                    <option>Level 2</option>
                                    <option>Level 3</option>
                                    <option>Level 4</option>
                                    <option>Level 5</option>
                                    <option value="Custom">Custom</option>
                                </select>
                            </div>

                            {newRule.level === "Custom" && (
                                <div className={styles.field}>
                                    <label>Custom Level Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Premium Partner"
                                        value={customLevel}
                                        onChange={e => setCustomLevel(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <div className={styles.field}>
                                <label>Role</label>
                                <select
                                    value={newRule.role}
                                    onChange={e => setNewRule({ ...newRule, role: e.target.value })}
                                    required
                                >
                                    <option>Our Staff</option>
                                    <option>Teamleads</option>
                                    <option>Managers</option>
                                    <option>Influencers</option>
                                    <option>Marketing Roles</option>
                                    <option>Marketing Agencies</option>
                                    <option>Extra Roles</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Type</label>
                                <select
                                    value={newRule.type}
                                    onChange={e => setNewRule({ ...newRule, type: e.target.value })}
                                >
                                    <option>Percentage</option>
                                    <option>Fixed Amount</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Value (e.g. 5% or 500)</label>
                                <input
                                    type="text"
                                    placeholder="Enter percentage or fixed value"
                                    value={newRule.value}
                                    onChange={e => setNewRule({ ...newRule, value: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.fieldFull}>
                                <label>Condition</label>
                                <textarea
                                    value={newRule.condition}
                                    onChange={e => setNewRule({ ...newRule, condition: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.primaryBtn}>{editingRule ? "Update Rule" : "Save Rule"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReferralCommissionSettings;
