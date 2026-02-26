import React, { useState } from 'react';
import { Search, Plus, Filter, BarChart, Users, CheckCircle, Clock, MoreVertical, PlayCircle } from 'lucide-react';
import styles from './MarketingSections.module.css';

const MyCampaigns: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPlatform, setFilterPlatform] = useState('All');

    const mockCampaigns = [
        { id: '1', name: 'Q4 Holiday Special', platform: 'Facebook Ads', status: 'Active', budget: '$5,000', spent: '$2,150', conversions: 124, cpa: '$17.33' },
        { id: '2', name: 'Retargeting - Cart Abandoners', platform: 'Google Ads', status: 'Active', budget: '$2,000', spent: '$850', conversions: 45, cpa: '$18.88' },
        { id: '3', name: 'Brand Awareness 2023', platform: 'LinkedIn LinkedIn Ads', status: 'Paused', budget: '$10,000', spent: '$10,000', conversions: 89, cpa: '$112.35' },
        { id: '4', name: 'Newsletter Promo - Oct', platform: 'Email (Mailchimp)', status: 'Draft', budget: '$0', spent: '$0', conversions: 0, cpa: '-' },
        { id: '5', name: 'Winter Sale Teaser', platform: 'Instagram Ads', status: 'Active', budget: '$3,500', spent: '$420', conversions: 12, cpa: '$35.00' },
    ];

    const filteredCampaigns = mockCampaigns.filter(camp => {
        const matchesSearch = camp.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlatform = filterPlatform === 'All' || camp.platform.includes(filterPlatform);
        return matchesSearch && matchesPlatform;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Active': return { color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' };
            case 'Paused': return { color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' };
            case 'Draft': return { color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)' };
            default: return {};
        }
    };

    return (
        <div className={styles.sectionContainer}>
            <div className={styles.sectionHeader}>
                <div>
                    <h2 className={styles.sectionTitle}>Campaign Manager</h2>
                    <p className={styles.sectionSubtitle}>Create, track, and optimize your marketing campaigns across platforms.</p>
                </div>
                <button className={styles.primaryBtn}>
                    <Plus size={16} /> Create Campaign
                </button>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
                        <BarChart size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Total Ad Spend (MTD)</h4>
                        <p>$13,420.00</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
                        <Users size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Total Conversions</h4>
                        <p>270</p>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon} style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
                        <CheckCircle size={20} />
                    </div>
                    <div className={styles.statInfo}>
                        <h4>Average CPA</h4>
                        <p>$49.70</p>
                    </div>
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={styles.filtersRow}>
                        <div className={styles.searchBox}>
                            <Search size={16} className={styles.icon} />
                            <input
                                type="text"
                                placeholder="Find a campaign..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className={styles.filterBox}>
                            <Filter size={16} className={styles.icon} />
                            <select value={filterPlatform} onChange={(e) => setFilterPlatform(e.target.value)}>
                                <option value="All">All Platforms</option>
                                <option value="Facebook">Meta (FB/IG)</option>
                                <option value="Google">Google Ads</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Email">Email Marketing</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Campaign Name</th>
                                <th>Platform</th>
                                <th>Status</th>
                                <th>Budget</th>
                                <th>Spent</th>
                                <th>Conversions</th>
                                <th>CPA</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCampaigns.map(camp => (
                                <tr key={camp.id}>
                                    <td className={styles.highlightCell}>{camp.name}</td>
                                    <td>{camp.platform}</td>
                                    <td>
                                        <span className={styles.statusBadge} style={getStatusStyle(camp.status)}>
                                            {camp.status === 'Active' && <PlayCircle size={12} style={{ marginRight: '4px' }} />}
                                            {camp.status === 'Paused' && <Clock size={12} style={{ marginRight: '4px' }} />}
                                            {camp.status}
                                        </span>
                                    </td>
                                    <td>{camp.budget}</td>
                                    <td>{camp.spent}</td>
                                    <td><span style={{ fontWeight: 600, color: '#f8fafc' }}>{camp.conversions}</span></td>
                                    <td className={styles.highlightCell}>{camp.cpa}</td>
                                    <td>
                                        <button className={styles.iconBtn} title="More actions">
                                            <MoreVertical size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCampaigns.length === 0 && (
                        <div className={styles.emptyState}>No campaigns match your filters.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyCampaigns;
