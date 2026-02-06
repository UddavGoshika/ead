import React, { useState, useEffect } from "react";
import styles from "./HeaderSetup.module.css";
import api from "../../../services/api";
import { Loader2, Plus, Edit, Trash2, X } from "lucide-react";
import { useSettings } from "../../../context/SettingsContext";

/* ================= TYPES ================= */
interface PageItem {
    _id?: string;
    id?: number; // fallback for mock
    title: string;
    route: string;
    status: "Published" | "Draft";
    category: string;
    content: string;
    updatedAt?: string;
}

const FOOTER_DEFAULTS: PageItem[] = [
    // Explore
    { title: "Home Page", route: "/", status: "Published", category: "Explore", content: "" },
    { title: "Browse Profiles", route: "/dashboard?page=all-advocates", status: "Published", category: "Explore", content: "" },
    { title: "File a Case", route: "https://filing.ecourts.gov.in/pdedev/", status: "Published", category: "Explore", content: "" },
    { title: "Case Status", route: "https://services.ecourts.gov.in/ecourtindia_v6/", status: "Published", category: "Explore", content: "" },
    { title: "Create Blog", route: "/blogs", status: "Published", category: "Explore", content: "" },
    // More
    { title: "Premium Services", route: "/premium-services", status: "Published", category: "More", content: "" },
    { title: "Careers", route: "/careers", status: "Published", category: "More", content: "" },
    { title: "How it Works", route: "/how-it-works", status: "Published", category: "More", content: "" },
    { title: "Documentation - How It Works", route: "/documentation-how-it-works", status: "Published", category: "More", content: "" },
    { title: "Credits", route: "#credits", status: "Published", category: "More", content: "" },
    { title: "Site Map", route: "/site-map", status: "Published", category: "More", content: "" },
    { title: "About Us", route: "/about", status: "Published", category: "More", content: "" },
    // For Advocates
    { title: "Find Advocates", route: "#search-advocates", status: "Published", category: "For Advocates", content: "" },
    { title: "Advocate How it Works", route: "/advocate-how-it-works", status: "Published", category: "For Advocates", content: "" },
    // For Clients
    { title: "Find Clients", route: "#search-clients", status: "Published", category: "For Clients", content: "" },
    { title: "Client How it Works", route: "/client-how-it-works", status: "Published", category: "For Clients", content: "" },
    // Help
    { title: "Help", route: "#help", status: "Published", category: "Help", content: "" },
    { title: "E-Advocate Centers", route: "/centers", status: "Published", category: "Help", content: "" },
    // Legal
    { title: "Fraud Alert", route: "/fraud-alert", status: "Published", category: "Legal", content: "" },
    { title: "Terms of Use", route: "/terms", status: "Published", category: "Legal", content: "" },
    { title: "Third Party Terms of Use", route: "/third-party-terms", status: "Published", category: "Legal", content: "" },
    { title: "Privacy Policy", route: "/privacy", status: "Published", category: "Legal", content: "" },
    { title: "Cookie Policy", route: "/cookie-policy", status: "Published", category: "Legal", content: "" },
    // Privacy Features
    { title: "Summons / Notices", route: "/summons-and-notices", status: "Published", category: "Privacy Features", content: "" },
    { title: "Grievances", route: "/grievance-redressal", status: "Published", category: "Privacy Features", content: "" },
    { title: "Refund Policy", route: "/refund", status: "Published", category: "Privacy Features", content: "" },
];

/* ================= COMPONENT ================= */
const PagesSetup: React.FC = () => {
    const { refreshPages } = useSettings();
    const [pages, setPages] = useState<PageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPage, setEditingPage] = useState<PageItem | null>(null);
    const [formData, setFormData] = useState<PageItem>({
        title: "",
        route: "",
        status: "Published",
        category: "General",
        content: ""
    });

    const fetchPages = async () => {
        try {
            setLoading(true);
            const res = await api.get("/pages");
            if (res.data.success && res.data.pages.length > 0) {
                setPages(res.data.pages);
            } else if (res.data.pages.length === 0) {
                // If DB empty, show defaults as mock and offer to seed
                setPages(FOOTER_DEFAULTS);
            }
        } catch (err) {
            console.error("Fetch Pages Error:", err);
            setPages(FOOTER_DEFAULTS); // Fallback to mock if API fails
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleOpenCreate = () => {
        setEditingPage(null);
        setFormData({ title: "", route: "", status: "Published", category: "General", content: "" });
        setShowModal(true);
    };

    const handleOpenEdit = (page: PageItem) => {
        setEditingPage(page);
        setFormData(page);
        setShowModal(true);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete the "${title}" page?`)) return;
        try {
            if (id.startsWith('mock-')) { // Mock handle
                setPages(pages.filter(p => (p._id || p.id?.toString()) !== id));
                return;
            }
            const res = await api.delete(`/pages/${id}`);
            if (res.data.success) {
                fetchPages();
                refreshPages();
                localStorage.setItem('pages_timestamp', Date.now().toString());
            }
        } catch (err) {
            alert("Delete failed.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingPage?._id) {
                await api.put(`/pages/${editingPage._id}`, formData);
            } else {
                await api.post("/pages", formData);
            }
            setShowModal(false);
            fetchPages();
            refreshPages();
            localStorage.setItem('pages_timestamp', Date.now().toString());
        } catch (err: any) {
            alert(err.response?.data?.error || "Operation failed.");
        }
    };

    const seedPages = async () => {
        if (!window.confirm("This will add all default footer pages to the database. Continue?")) return;
        try {
            setLoading(true);
            for (const p of FOOTER_DEFAULTS) {
                try {
                    await api.post("/pages", p);
                } catch (e) { } // Ignore duplicates (if route exists)
            }
            fetchPages();
            refreshPages();
            localStorage.setItem('pages_timestamp', Date.now().toString());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.topHeader}>
                <h2>Website Pages Management</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {pages.length === FOOTER_DEFAULTS.length && !pages[0]._id && (
                        <button className={styles.outlineBtn} onClick={seedPages} style={{ borderColor: '#facc15', color: '#facc15' }}>
                            Save All to Database
                        </button>
                    )}
                    <button className={styles.saveBtn} onClick={handleOpenCreate}>
                        <Plus size={16} /> Create New Page
                    </button>
                </div>
            </div>

            <section className={styles.section}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={30} color="#facc15" />
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #1e293b', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>Page Title</th>
                                    <th style={{ padding: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>Category</th>
                                    <th style={{ padding: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>Route</th>
                                    <th style={{ padding: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>Status</th>
                                    <th style={{ padding: '12px', fontSize: '0.85rem', color: '#94a3b8' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pages.map((page, idx) => (
                                    <tr key={page._id || idx} style={{ borderBottom: '1px solid #0f172a' }}>
                                        <td style={{ padding: '12px', fontWeight: 600 }}>{page.title}</td>
                                        <td style={{ padding: '12px', fontSize: '0.8rem', color: '#64748b' }}>{page.category}</td>
                                        <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#3b82f6' }}>{page.route}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.65rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                background: page.status === "Published" ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                                                color: page.status === "Published" ? '#10b981' : '#64748b',
                                                border: `1px solid ${page.status === "Published" ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)'}`
                                            }}>
                                                {page.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ display: 'flex', gap: '15px' }}>
                                                <button
                                                    onClick={() => handleOpenEdit(page)}
                                                    style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Edit size={14} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete((page._id || `mock-${idx}`), page.title)}
                                                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* CREATE / EDIT MODAL */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div style={{
                        background: '#020617', border: '1px solid #1e293b', borderRadius: '12px',
                        width: '100%', maxWidth: '500px', padding: '24px', position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowModal(false)}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>

                        <h3 style={{ marginBottom: '20px', color: '#facc15' }}>{editingPage ? 'Edit Page' : 'Create New Page'}</h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>Page Title</label>
                                <input
                                    type="text"
                                    required
                                    className={styles.input}
                                    style={{ width: '100%' }}
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>Route / Link</label>
                                <input
                                    type="text"
                                    required
                                    className={styles.input}
                                    style={{ width: '100%' }}
                                    value={formData.route}
                                    onChange={e => setFormData({ ...formData, route: e.target.value })}
                                    placeholder="e.g. /my-page or https://..."
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>Category</label>
                                    <select
                                        className={styles.input}
                                        style={{ width: '100%' }}
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option>Explore</option>
                                        <option>More</option>
                                        <option>For Advocates</option>
                                        <option>For Clients</option>
                                        <option>Help</option>
                                        <option>Legal</option>
                                        <option>Privacy Features</option>
                                        <option>General</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '5px' }}>Status</label>
                                    <select
                                        className={styles.input}
                                        style={{ width: '100%' }}
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="Published">Published</option>
                                        <option value="Draft">Draft</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #1e293b', background: 'transparent', color: '#e5e7eb', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#facc15', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
                                    {editingPage ? 'Update Page' : 'Create Page'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PagesSetup;
