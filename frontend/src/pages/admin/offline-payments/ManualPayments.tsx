import React, { useState, useEffect } from "react";
import styles from "./ManualPayments.module.css";
import axios from "axios";
import { Plus, Edit2, Info, Trash2, X, Loader2 } from "lucide-react";

type PaymentStatus = "Active" | "Inactive";

interface PaymentMethod {
    _id: string;
    name: string;
    instructions: string;
    details: string;
    isActive: boolean;
}

const ManualPaymentMethods: React.FC = () => {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        instructions: "",
        details: "",
        isActive: true
    });

    const fetchMethods = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/manual-payments');
            if (res.data.success) {
                setMethods(res.data.methods);
            }
        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMethods();
    }, []);

    const handleAdd = () => {
        setIsEditing(false);
        setFormData({ name: "", instructions: "", details: "", isActive: true });
        setIsModalOpen(true);
    };

    const handleEdit = (method: PaymentMethod) => {
        setIsEditing(true);
        setSelectedMethod(method);
        setFormData({
            name: method.name,
            instructions: method.instructions,
            details: method.details || "",
            isActive: method.isActive
        });
        setIsModalOpen(true);
    };

    const handleViewDetails = (method: PaymentMethod) => {
        setSelectedMethod(method);
        setIsDetailsOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this payment method?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/manual-payments/${id}`, {
                headers: { 'x-auth-token': token }
            });
            fetchMethods();
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (isEditing && selectedMethod) {
                await axios.patch(`/api/manual-payments/${selectedMethod._id}`, formData, {
                    headers: { 'x-auth-token': token }
                });
            } else {
                await axios.post('/api/manual-payments', formData, {
                    headers: { 'x-auth-token': token }
                });
            }
            setIsModalOpen(false);
            fetchMethods();
        } catch (err) {
            alert("Operation failed");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                {/* HEADER */}
                <div className={styles.header}>
                    <h1>Manual Payment Methods</h1>
                    <button className={styles.addBtn} onClick={handleAdd}>
                        <Plus size={18} /> Add Method
                    </button>
                </div>

                {/* TABLE */}
                <div className={styles.tableWrapper}>
                    {loading ? (
                        <div className={styles.loader}>
                            <Loader2 className="animate-spin" /> Fetching methods...
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Method Name</th>
                                    <th>Instructions</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {methods.map((method) => (
                                    <tr key={method._id}>
                                        <td className={styles.methodName}>{method.name}</td>
                                        <td className={styles.instructions}>
                                            {method.instructions.substring(0, 60)}...
                                        </td>
                                        <td>
                                            <span
                                                className={`${styles.status} ${method.isActive
                                                    ? styles.active
                                                    : styles.inactive
                                                    }`}
                                            >
                                                {method.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className={styles.actions}>
                                            <button className={styles.editBtn} onClick={() => handleEdit(method)}>
                                                <Edit2 size={16} /> Edit
                                            </button>
                                            <button className={styles.detailsBtn} onClick={() => handleViewDetails(method)}>
                                                <Info size={16} /> Details
                                            </button>
                                            <button className={styles.deleteBtn} onClick={() => handleDelete(method._id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {methods.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                                            No manual payment methods found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ADD/EDIT MODAL */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>{isEditing ? "Edit Payment Method" : "Add Payment Method"}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X /></button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.field}>
                                <label>Method Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Bank Transfer"
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Instructions (Visible to User)</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.instructions}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                    placeholder="Steps for the user to follow..."
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Internal Details (Optional)</label>
                                <textarea
                                    rows={2}
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    placeholder="Account details, internal notes..."
                                />
                            </div>
                            <div className={styles.toggleField}>
                                <span>Status</span>
                                <label className={styles.switch}>
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                    <span className={styles.slider} />
                                </label>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>{isEditing ? "Save Changes" : "Add Method"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DETAILS MODAL */}
            {isDetailsOpen && selectedMethod && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Payment Method Details</h2>
                            <button onClick={() => setIsDetailsOpen(false)}><X /></button>
                        </div>
                        <div className={styles.detailsView}>
                            <div className={styles.detailItem}>
                                <label>Method Name</label>
                                <p>{selectedMethod.name}</p>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Public Instructions</label>
                                <div className={styles.preContent}>{selectedMethod.instructions}</div>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Internal Details</label>
                                <div className={styles.preContent}>{selectedMethod.details || 'No additional details.'}</div>
                            </div>
                            <div className={styles.detailItem}>
                                <label>Status</label>
                                <p>{selectedMethod.isActive ? 'Active' : 'Inactive'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManualPaymentMethods;
