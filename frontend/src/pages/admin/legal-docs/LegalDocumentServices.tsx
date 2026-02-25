import React, { useState, useMemo } from 'react';
import styles from './LegalDocAdmin.module.css';
import {
    Search,
    Plus,
    Filter,
    FileText,
    MoreVertical,
    Edit,
    Trash2,
    Shield,
    CheckCircle,
    XCircle,
    X,
    Eye,
    Settings,
    CreditCard,
    DollarSign,
    Clock,
    Briefcase,
    User,
    Calendar
} from 'lucide-react';
import { toast } from 'react-toastify';

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
    },
    {
        id: 'SVC-004',
        name: 'Power of Attorney (General)',
        category: 'Legal/Personal',
        price: 3500,
        timeline: '48 Hours',
        status: 'Active',
        description: 'Generic GPA for property and financial management.',
        requirements: ['Donor Details', 'Donee Details', 'Power Scope']
    },
    {
        id: 'SVC-005',
        name: 'Employee Offer Letter',
        category: 'HR/Employment',
        price: 1200,
        timeline: '12 Hours',
        status: 'Active',
        description: 'Standard employment offer letter with basic clauses.',
        requirements: ['Employee Role', 'Salary Breakup', 'Joining Date']
    },
    {
        id: 'SVC-006',
        name: 'Gift Deed',
        category: 'Property',
        price: 4500,
        timeline: '72 Hours',
        status: 'Active',
        description: 'Legal document for gifting property or assets.',
        requirements: ['Property Title Docs', 'Donor/Donee ID']
    }
];

const LegalDocumentServices: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [services, setServices] = useState<LegalDocService[]>(mockServices);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<LegalDocService | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [newService, setNewService] = useState({
        name: "",
        category: "Corporate",
        price: "",
        timeline: "24 Hours",
        description: ""
    });

    const categories = useMemo(() => {
        const cats = new Set(services.map(s => s.category));
        return ['All', ...Array.from(cats)];
    }, [services]);

    const toggleMenu = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleAction = (type: 'view' | 'manage' | 'delete' | 'payment', svc: LegalDocService) => {
        setOpenMenuId(null);
        setSelectedService(svc);
        if (type === 'view') setIsViewModalOpen(true);
        if (type === 'manage') setIsManageModalOpen(true);
        if (type === 'delete') {
            if (window.confirm("Are you sure you want to delete this service?")) {
                toast.success("Service deleted (Mock)");
                setServices(services.filter(s => s.id !== svc.id));
            }
        }
    };

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
                    <button className={styles.primaryBtn} onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={18} /> Add New Service
                    </button>
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
                                            <button
                                                className={styles.actionIcon}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleMenu(service.id);
                                                }}
                                            >
                                                <MoreVertical size={20} />
                                            </button>

                                            {openMenuId === service.id && (
                                                <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
                                                    <div className={styles.menuDivider}>Actions</div>
                                                    <button onClick={() => handleAction('view', service)}>
                                                        <Eye size={14} /> View Details
                                                    </button>
                                                    <button onClick={() => handleAction('manage', service)}>
                                                        <Settings size={14} /> Manage
                                                    </button>
                                                    <div className={styles.menuDivider}>Danger</div>
                                                    <button
                                                        onClick={() => handleAction('delete', service)}
                                                        style={{ color: '#ef4444' }}
                                                    >
                                                        <Trash2 size={14} /> Delete Service
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Add Service Modal */}
            {isAddModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h3>Add New Catalog Service</h3>
                            <button onClick={() => setIsAddModalOpen(false)}><X size={20} /></button>
                        </div>
                        <div className={styles.modalBody} style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Service Name</label>
                                    <input
                                        type="text"
                                        className={styles.modalInput}
                                        placeholder="e.g. Will Drafting"
                                        value={newService.name}
                                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Category</label>
                                        <select
                                            className={styles.modalInput}
                                            value={newService.category}
                                            onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                        >
                                            <option>Corporate</option>
                                            <option>Property</option>
                                            <option>HR/Employment</option>
                                            <option>Legal/Personal</option>
                                            <option>Startup</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Catalog Price (₹)</label>
                                        <input
                                            type="number"
                                            className={styles.modalInput}
                                            placeholder="1500"
                                            value={newService.price}
                                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Standard Timeline</label>
                                    <select
                                        className={styles.modalInput}
                                        value={newService.timeline}
                                        onChange={(e) => setNewService({ ...newService, timeline: e.target.value })}
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc' }}
                                    >
                                        <option>12 Hours</option>
                                        <option>24 Hours</option>
                                        <option>48 Hours</option>
                                        <option>72 Hours</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#94a3b8' }}>Short Description</label>
                                    <textarea
                                        className={styles.modalInput}
                                        placeholder="What does this service include?"
                                        value={newService.description}
                                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#f8fafc', minHeight: '80px', resize: 'vertical' }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter} style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={() => setIsAddModalOpen(false)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: '8px', color: '#94a3b8' }}>Cancel</button>
                            <button
                                onClick={() => {
                                    alert("Service Added to Catalog!");
                                    setIsAddModalOpen(false);
                                }}
                                className={styles.primaryBtn}
                            >
                                Add Service
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* View Modal */}
            {isViewModalOpen && selectedService && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h2>Service Details: {selectedService.id}</h2>
                            <button className={styles.closeBtn} onClick={() => setIsViewModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.detailGrid}>
                                <div className={styles.profileHero}>
                                    <div className={styles.largeAvatar}><FileText size={40} /></div>
                                    <div className={styles.heroInfo}>
                                        <h3>{selectedService.name}</h3>
                                        <p>{selectedService.category}</p>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}>
                                        <span className={`${styles.statusBadge} ${selectedService.status === 'Active' ? styles.active : styles.inactive}`}>
                                            {selectedService.status}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.infoGrid} style={{ marginTop: '20px' }}>
                                    <div className={styles.infoItem}>
                                        <label><DollarSign size={14} /> Base Price</label>
                                        <p>₹{selectedService.price.toLocaleString()}</p>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <label><Clock size={14} /> Target Timeline</label>
                                        <p>{selectedService.timeline}</p>
                                    </div>
                                </div>
                                <div className={styles.infoItem} style={{ marginTop: '20px' }}>
                                    <label>Description</label>
                                    <p>{selectedService.description}</p>
                                </div>
                                <div className={styles.infoItem} style={{ marginTop: '20px' }}>
                                    <label>Required Documents</label>
                                    <ul style={{ color: '#94a3b8', marginTop: '8px' }}>
                                        {selectedService.requirements.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button className={styles.secondaryBtn} onClick={() => setIsViewModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Modal (Edit) */}
            {isManageModalOpen && selectedService && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Edit Service</h2>
                            <button className={styles.closeBtn} onClick={() => setIsManageModalOpen(false)}><X size={24} /></button>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Service Name</label>
                                    <input
                                        type="text"
                                        className={styles.modalInput}
                                        defaultValue={selectedService.name}
                                        style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Price (₹)</label>
                                        <input
                                            type="number"
                                            className={styles.modalInput}
                                            defaultValue={selectedService.price}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Timeline</label>
                                        <input
                                            type="text"
                                            className={styles.modalInput}
                                            defaultValue={selectedService.timeline}
                                            style={{ width: '100%', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', color: '#fff' }}
                                        />
                                    </div>
                                </div>
                                <button className={styles.primaryBtn} onClick={() => { toast.success("Service updated"); setIsManageModalOpen(false) }}>
                                    Update Service
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LegalDocumentServices;
