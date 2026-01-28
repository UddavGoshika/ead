import React from "react";
import styles from "./HeaderSetup.module.css";

/* ================= TYPES ================= */
interface PageItem {
    id: number;
    title: string;
    route: string;
    status: "Published" | "Draft";
    lastModified: string;
}

/* ================= MOCK DATA ================= */
const pages: PageItem[] = [
    { id: 1, title: "Home Page", route: "/", status: "Published", lastModified: "2025-08-01" },
    { id: 2, title: "About Us", route: "/about", status: "Published", lastModified: "2025-08-02" },
    { id: 3, title: "Contact Us", route: "/contact", status: "Published", lastModified: "2025-08-03" },
    { id: 4, title: "Privacy Policy", route: "/privacy", status: "Published", lastModified: "2025-07-28" },
    { id: 5, title: "Terms of Service", route: "/terms", status: "Published", lastModified: "2025-07-29" },
    { id: 6, title: "FAQ", route: "/faq", status: "Draft", lastModified: "2025-08-04" },
];

/* ================= COMPONENT ================= */
const PagesSetup: React.FC = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.topHeader}>
                <h2>Website Pages Management</h2>
                <button className={styles.saveBtn}>+ Create New Page</button>
            </div>

            <section className={styles.section}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #1e293b', textAlign: 'left' }}>
                            <th style={{ padding: '12px' }}>Page Title</th>
                            <th style={{ padding: '12px' }}>Route</th>
                            <th style={{ padding: '12px' }}>Status</th>
                            <th style={{ padding: '12px' }}>Last Modified</th>
                            <th style={{ padding: '12px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map(page => (
                            <tr key={page.id} style={{ borderBottom: '1px solid #1e293b' }}>
                                <td style={{ padding: '12px' }}>{page.title}</td>
                                <td style={{ padding: '12px', fontFamily: 'monospace', fontSize: '0.8rem' }}>{page.route}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.7rem',
                                        background: page.status === "Published" ? '#065f46' : '#374151',
                                        color: 'white'
                                    }}>
                                        {page.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', fontSize: '0.8rem' }}>{page.lastModified}</td>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}>Edit</button>
                                        <button style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default PagesSetup;
