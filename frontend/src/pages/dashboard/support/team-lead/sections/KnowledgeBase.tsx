import React, { useState } from 'react';
import { Search, Plus, Edit2, FileText, ChevronRight } from 'lucide-react';
import styles from './SupportSections.module.css';

const KnowledgeBase: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const categories = [
        { id: '1', name: 'Getting Started', articleCount: 12 },
        { id: '2', name: 'Billing & Payments', articleCount: 8 },
        { id: '3', name: 'Troubleshooting Guides', articleCount: 24 },
        { id: '4', name: 'Account Management', articleCount: 15 },
    ];

    const recentDrafts = [
        { id: 'd1', title: 'How to configure SSO', author: 'Alice Smith', lastEdited: '2 hours ago' },
        { id: 'd2', title: 'Updating payment methods (2024)', author: 'Bob Jones', lastEdited: '1 day ago' },
    ];

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Knowledge Base Editor</h2>
                    <p className={styles.sectionSubtitle}>Manage help articles, FAQs, and internal documentation.</p>
                </div>
                <button className={styles.primaryBtn}>
                    <Plus size={16} /> New Article
                </button>
            </div>

            <div className={styles.filtersRow}>
                <div className={styles.searchBox}>
                    <Search size={18} className={styles.icon} />
                    <input
                        type="text"
                        placeholder="Search articles or drafts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '300px' }}
                    />
                </div>
            </div>

            <div className={styles.splitLayout}>
                <div className={styles.card} style={{ flex: 2 }}>
                    <div className={styles.cardHeader}>
                        <h3>Categories</h3>
                    </div>
                    <div className={styles.categoryList}>
                        {categories.map(cat => (
                            <div key={cat.id} className={styles.categoryRow}>
                                <div className={styles.categoryInfo}>
                                    <FileText size={20} className={styles.iconBlue} />
                                    <div className={styles.categoryText}>
                                        <h4>{cat.name}</h4>
                                        <span>{cat.articleCount} articles</span>
                                    </div>
                                </div>
                                <button className={styles.iconBtn}>
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.card} style={{ flex: 1 }}>
                    <div className={styles.cardHeader}>
                        <h3>Recent Drafts</h3>
                    </div>
                    <div className={styles.draftsList}>
                        {recentDrafts.map(draft => (
                            <div key={draft.id} className={styles.draftItem}>
                                <h4>{draft.title}</h4>
                                <div className={styles.draftMeta}>
                                    <span>{draft.author}</span> • <span>{draft.lastEdited}</span>
                                </div>
                                <button className={styles.editDraftBtn}>
                                    <Edit2 size={12} /> Edit
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBase;
