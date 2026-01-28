import React, { useState } from "react";
import styles from "./ReferralCommission.module.css";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

type CommissionRule = {
    id: string;
    level: string;
    role: string;
    type: string;
    value: string;
    condition: string;
    status: "Active" | "Inactive";
};

const initialRules: CommissionRule[] = [
    {
        id: "1",
        level: "Level 1",
        role: "Our Staff",
        type: "Percentage",
        value: "2.5%",
        condition: "referred person buy a package then only he get money",
        status: "Active",
    },
    {
        id: "2",
        level: "Level 2",
        role: "Teamleads",
        type: "Percentage",
        value: "5%",
        condition: "referred person buy a package then to get money",
        status: "Active",
    },
    {
        id: "3",
        level: "Level 3",
        role: "Managers",
        type: "Percentage",
        value: "7.5%",
        condition: "referred person buy a package then only he get money",
        status: "Active",
    },
    {
        id: "4",
        level: "Level 4",
        role: "Influencers",
        type: "Percentage",
        value: "5-10%",
        condition: "referred person buy a package then only he get money",
        status: "Active",
    },
    {
        id: "5",
        level: "Level 5",
        role: "Marketing Roles",
        type: "Percentage",
        value: "5-10%",
        condition: "referred person buy a package then only he get money",
        status: "Active",
    },
    {
        id: "6",
        level: "Custom",
        role: "Marketing Agencies",
        type: "Percentage",
        value: "5-15%",
        condition: "referred person buy a package then only he get money",
        status: "Active",
    },
];

const ReferralCommissionSettings: React.FC = () => {
    const [rulesList, setRulesList] = useState<CommissionRule[]>(initialRules);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<CommissionRule | null>(null);

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
        } else {
            setEditingRule(null);
            setNewRule({
                id: "",
                level: "Level 1",
                role: "Our Staff",
                type: "Percentage",
                value: "",
                condition: "referred person buy a package then only he get money",
                status: "Active"
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRule) {
            setRulesList(rulesList.map(r => r.id === editingRule.id ? newRule : r));
        } else {
            setRulesList([...rulesList, { ...newRule, id: Date.now().toString() }]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm("Are you sure you want to delete this commission rule?")) {
            setRulesList(rulesList.filter(r => r.id !== id));
        }
    };

    const toggleStatus = (id: string) => {
        setRulesList(rulesList.map(r =>
            r.id === id ? { ...r, status: r.status === "Active" ? "Inactive" : "Active" } : r
        ));
    };

    const handleSaveSettings = () => {
        alert("Referral settings saved successfully!");
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
                                <tr key={rule.id}>
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
                                            onClick={() => toggleStatus(rule.id)}
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
                                        <button className={styles.deleteBtn} onClick={() => handleDelete(rule.id)} title="Delete">
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
                            <input type="number" defaultValue={2000} />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Payout Method</label>
                        <select>
                            <option>Bank Transfer / UPI</option>
                            <option>PayPal</option>
                            <option>Platform Wallet</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label>Referral Link Expiry (Days)</label>
                        <input type="number" defaultValue={30} />
                    </div>

                    <div className={styles.field}>
                        <label>Multiple Commission Tracking</label>
                        <div className={styles.checkboxGroup}>
                            <input type="checkbox" id="multilevel" defaultChecked />
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
                                    <option>Custom</option>
                                </select>
                            </div>
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
