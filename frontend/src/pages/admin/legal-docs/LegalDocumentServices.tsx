import React, { useState, useMemo } from 'react';
import styles from './LegalDocAdmin.module.css';
import { Search, Plus, Filter, FileText, MoreVertical, Edit, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';

interface LegalDocService {
    id: string;
    name: string;
    category: string;
    price: number;
    timeline: string; // e.g., "24-48 Hours"
    status: 'Active' | 'Inactive';
    description: string;
    requirements: string[];
}

const mockServices: LegalDocService[] = [
    {
        id: 'SVC-001',
        name: 'Non-Disclosure Agreement (NDA)',
        category: 'Corporate',
        price: 1500,
        timeline: '24 Hours',
        status: 'Active',
        description: 'Standard corporate NDA for protecting intellectual property.',
        requirements: ['Company Details', 'Authorized Signatory Info']
    },
    {
        id: 'SVC-002',
        name: 'Startup Founder Agreement',
        category: 'Startup',
        price: 5000,
        timeline: '48 Hours',
        status: 'Active',
        description: 'Agreement outlining roles, equity, and responsibilities of co-founders.',
        requirements: ['Equity Split', 'Roles Description']
    },
    {
        id: 'SVC-003',
        name: 'Residential Rent Agreement',
        category: 'Property',
        price: 999,
        timeline: '24 Hours',
        status: 'Active',
        description: 'Standard 11-month rental agreement for residential properties.',
        requirements: ['Landlord Details', 'Tenant Details', 'Property Address']
    }
];

const LegalDocumentServices: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [services, setServices] = useState<LegalDocService[]>(mockServices);

    const categories = useMemo(() => {
        const cats = new Set(services.map(s => s.category));
        return ['All', ...Array.from(cats)];
    }, [services]);

    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchTerm, selectedCategory, services]);

    return (
        <div className={styles.adminPage}>
            <div className={styles.headerArea}>
                <div>
                    <h2 className={styles.title}>Legal Document Services</h2>
                    <p className={styles.pSub}>Manage the catalog of legal documents available for users to purchase.</p>
                </div>
                <div className={styles.headerActions}>
                    <button className={styles.primaryBtn}><Plus size={18} /> Add New Service</button>
                </div>
            </div>

            <div className={styles.filterCard}>
                <div className={styles.searchRow}>
                    <div className={styles.searchBar}>
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.pillsGrid} style={{ gridTemplateColumns: '1fr' }}>
                    <div className={styles.pillGroup}>
                        <label><Filter size={14} /> Category</label>
                        <div className={styles.pillList}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`${styles.pill} ${selectedCategory === cat ? styles.activePill : ''}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                    <h3>Service Catalog</h3>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th>Service ID</th>
                                <th>Service Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Timeline</th>
                                <th>Status</th>
                                <th>Requirements</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredServices.map((service) => (
                                <tr key={service.id}>
                                    <td><span className={styles.idBadge}>{service.id}</span></td>
                                    <td>
                                        <div className={styles.profileCell}>
                                            <div className={`${styles.avatar} ${styles.docIcon}`}>
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <div className={styles.pName}>{service.name}</div>
                                                <div className={styles.pSub}>{service.description.substring(0, 40)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={styles.categoryBadge}>{service.category}</span>
                                    </td>
                                    <td>
                                        <div className={styles.priceTag}>₹{service.price.toLocaleString()}</div>
                                    </td>
                                    <td>
                                        <div className={styles.timelineTag}>
                                            <CheckCircle size={14} style={{ marginRight: 4 }} />
                                            {service.timeline}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${service.status === 'Active' ? styles.active : styles.inactive}`}>
                                            {service.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.reqCount}>
                                            {service.requirements.length} Requirements
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.rowActions}>
                                            <button className={styles.actionIcon} title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className={styles.actionIcon} title="Delete" style={{ color: '#ef4444' }}>
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
        </div>
    );
};

export default LegalDocumentServices;
