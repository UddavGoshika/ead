import React, { useState } from "react";
import styles from "./BlogCategories.module.css";

type CategoryStatus = "Active" | "Inactive";

type Category = {
    name: string;
    posts: number;
    slug: string;
    status: CategoryStatus;
};

const initialCategories: Category[] = [
    { name: "Legal News & Updates", posts: 24, slug: "legal-news-updates", status: "Active" },
    { name: "Case Studies", posts: 18, slug: "case-studies", status: "Active" },
    { name: "Know Your Rights", posts: 32, slug: "know-your-rights", status: "Active" },
    { name: "Court Procedures", posts: 14, slug: "court-procedures", status: "Active" },
    { name: "Advocate Corner", posts: 21, slug: "advocate-corner", status: "Active" },
    { name: "Client Guidance", posts: 19, slug: "client-guidance", status: "Active" },
    { name: "Legal Drafts & Formats", posts: 9, slug: "legal-drafts-formats", status: "Active" },
    { name: "E-Filing & Technology", posts: 11, slug: "e-filing-technology", status: "Active" },
    { name: "Judgements & Precedents", posts: 27, slug: "judgements-precedents", status: "Active" },
    { name: "Bar Council Notifications", posts: 6, slug: "bar-council-notifications", status: "Inactive" }
];


const BlogCategories: React.FC = () => {
    const [categoriesList, setCategoriesList] = useState<Category[]>(initialCategories);
    const [openMenu, setOpenMenu] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCat, setNewCat] = useState({ name: "", status: "Active" as CategoryStatus });

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        const slug = newCat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
        const newEntry: Category = {
            name: newCat.name,
            posts: 0,
            slug: slug,
            status: newCat.status
        };
        setCategoriesList([newEntry, ...categoriesList]);
        setIsModalOpen(false);
        setNewCat({ name: "", status: "Active" });
    };

    const handleDelete = (slug: string) => {
        if (window.confirm("Are you sure you want to delete this category?")) {
            setCategoriesList(categoriesList.filter(c => c.slug !== slug));
        }
        setOpenMenu(null);
    };

    return (
        <div className={styles.page}>
            {/* HEADER */}
            <div className={styles.header}>
                <h2>Blog Categories</h2>
                <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>＋ Add Category</button>
            </div>

            {/* TABLE */}
            <div className={styles.card}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Category Name</th>
                            <th>Posts Count</th>
                            <th>Slug</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {categoriesList.map((cat, index) => (
                            <tr key={cat.slug}>
                                <td className={styles.nameCell}>
                                    <span className={styles.icon}>📁</span>
                                    {cat.name}
                                </td>
                                <td>{cat.posts} posts</td>
                                <td className={styles.slug}>{cat.slug}</td>
                                <td>
                                    <span
                                        className={`${styles.status} ${cat.status === "Active" ? styles.active : styles.inactive
                                            }`}
                                    >
                                        {cat.status}
                                    </span>
                                </td>
                                <td className={styles.actions}>
                                    <button
                                        className={styles.menuBtn}
                                        onClick={() =>
                                            setOpenMenu(openMenu === index ? null : index)
                                        }
                                    >
                                        ⋮
                                    </button>

                                    {openMenu === index && (
                                        <div className={styles.menu}>
                                            <button onClick={() => setOpenMenu(null)}>Edit</button>
                                            <button className={styles.danger} onClick={() => handleDelete(cat.slug)}>Delete</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ADD CATEGORY MODAL */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Add New Category</h3>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form className={styles.modalForm} onSubmit={handleAddCategory}>
                            <div className={styles.formGroup}>
                                <label>Category Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Technology"
                                    value={newCat.name}
                                    onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Status</label>
                                <select
                                    value={newCat.status}
                                    onChange={e => setNewCat({ ...newCat, status: e.target.value as CategoryStatus })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div className={styles.modalActions}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Create Category</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogCategories;
