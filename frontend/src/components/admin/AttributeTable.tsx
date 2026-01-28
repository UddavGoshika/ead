import React, { useState, useEffect } from "react";
import styles from "./AttributeTable.module.css";
import axios from "axios";
import { Trash2, Loader2, Edit3, Save, X } from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";

interface Attribute {
    _id: string;
    name: string;
    active: boolean;
}

interface Props {
    title: string;
    category: string; // e.g., "religion"
    placeholder?: string;
}

const AttributeTable: React.FC<Props> = ({ title, category, placeholder }) => {
    const [attributes, setAttributes] = useState<Attribute[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Form state (Side Form)
    const [editItem, setEditItem] = useState<Attribute | null>(null);
    const [name, setName] = useState("");

    const fetchAttributes = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`/api/admin/attributes?category=${category}`);
            if (res.data.success) {
                setAttributes(res.data.attributes);
            }
        } catch (err) {
            console.error("Error fetching attributes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttributes();
        setEditItem(null);
        setName("");
        setSelectedIds([]);
    }, [category]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            const res = await axios.post('/api/admin/attributes', {
                id: editItem?._id,
                category,
                name: name,
                active: editItem ? editItem.active : true
            });
            if (res.data.success) {
                fetchAttributes();
                setName("");
                setEditItem(null);
            }
        } catch (err) {
            alert("Error saving attribute. It might already exist.");
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm("Delete this item?")) {
            try {
                const res = await axios.delete(`/api/admin/attributes/${id}`);
                if (res.data.success) {
                    setAttributes(prev => prev.filter(a => a._id !== id));
                    if (editItem?._id === id) {
                        setEditItem(null);
                        setName("");
                    }
                }
            } catch (err) {
                alert("Error deleting item");
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) {
            try {
                // In a real scenario, use a bulk delete endpoint
                await Promise.all(selectedIds.map(id => axios.delete(`/api/admin/attributes/${id}`)));
                fetchAttributes();
                setSelectedIds([]);
            } catch (err) {
                alert("Error performing bulk delete");
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map(a => a._id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const filtered = attributes.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) {
        return (
            <div className={styles.loading}>
                <Loader2 className="animate-spin" color="#3b82f6" size={48} />
                <p>Loading {title}...</p>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <AdminPageHeader
                title={title}
                onSearch={() => { }} // Managed locally in mainGrid
                placeholder={placeholder || `Search ${title.toLowerCase()}...`}
            />

            <div className={styles.mainGrid}>
                {/* LEFT: LIST CARD */}
                <div className={styles.card}>
                    <div className={styles.cardHeader}>
                        <h3>All {title}</h3>
                    </div>
                    <div className={styles.cardBody}>
                        <div className={styles.tableActions}>
                            <select
                                className={styles.bulkSelect}
                                onChange={(e) => e.target.value === 'delete' && handleBulkDelete()}
                                value=""
                            >
                                <option value="" disabled>Bulk Action</option>
                                <option value="delete">Delete Selected</option>
                            </select>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Type name & Enter"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={filtered.length > 0 && selectedIds.length === filtered.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>Name</th>
                                    <th style={{ width: '100px', textAlign: 'right' }}>Options</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className={styles.noData}>No items found</td>
                                    </tr>
                                )}
                                {filtered.map((item) => (
                                    <tr key={item._id}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(item._id)}
                                                onChange={() => toggleSelect(item._id)}
                                            />
                                        </td>
                                        <td className={styles.nameCell}>
                                            <span>{item.name}</span>
                                        </td>
                                        <td>
                                            <div className={styles.rowActions} style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    className={styles.edit}
                                                    onClick={() => {
                                                        setEditItem(item);
                                                        setName(item.name);
                                                    }}
                                                    title="Edit"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    className={styles.delete}
                                                    onClick={() => handleDelete(item._id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT: FORM CARD */}
                <div className={styles.card} style={{ height: 'fit-content' }}>
                    <div className={styles.cardHeader}>
                        <h3>{editItem ? "Edit" : "Add New"} {title.slice(0, -1)}</h3>
                        {editItem && (
                            <button onClick={() => { setEditItem(null); setName(""); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    <div className={styles.cardBody}>
                        <form onSubmit={handleSave}>
                            <div className={styles.formGroup}>
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={`${title.slice(0, -1)} Name`}
                                    required
                                />
                            </div>
                            <button type="submit" className={styles.saveBtn}>
                                {editItem ? <><Save size={18} /> Update</> : "Save"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttributeTable;
