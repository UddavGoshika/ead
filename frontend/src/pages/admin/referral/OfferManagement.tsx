import React, { useState, useEffect } from 'react';
import styles from './ReferralUsers.module.css'; // Reusing Referral styles
import {
    Tag, Plus, Trash2, Edit2, Calendar,
    CheckCircle, XCircle, Percent, IndianRupee,
    Gift, ArrowRight, Save, X, Info, Shield, Filter
} from 'lucide-react';
import { referralService } from '../../../services/api';

const OfferManagement: React.FC = () => {
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<any>({
        title: '',
        description: '',
        code: '',
        discountType: 'Percentage',
        discountValue: '',
        minPurchase: 0,
        category: 'Discount Coupon',
        status: 'Active',
        targetRoles: [],
        expiresAt: ''
    });

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const res = await referralService.adminGetOffers();
            if (res.data.success) setOffers(res.data.offers);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await referralService.saveOffer(formData);
            if (res.data.success) {
                alert('Offer saved successfully!');
                setShowModal(false);
                resetForm();
                fetchOffers();
            }
        } catch (err) {
            alert('Failed to save offer');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            code: '',
            discountType: 'Percentage',
            discountValue: '',
            minPurchase: 0,
            category: 'Discount Coupon',
            status: 'Active',
            targetRoles: [],
            expiresAt: ''
        });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this offer?')) return;
        try {
            const res = await referralService.deleteOffer(id);
            if (res.data.success) {
                alert('Offer deleted');
                fetchOffers();
            }
        } catch (err) {
            alert('Delete failed');
        }
    };

    const toggleRole = (role: string) => {
        const current = formData.targetRoles || [];
        if (current.includes(role)) {
            setFormData({ ...formData, targetRoles: current.filter((r: string) => r !== role) });
        } else {
            setFormData({ ...formData, targetRoles: [...current, role] });
        }
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'Referral': return <Gift size={16} />;
            case 'Cashback': return <IndianRupee size={16} />;
            case 'Plan Upgrade': return <Shield size={16} />;
            case 'Discount Coupon': return <Tag size={16} />;
            default: return <Info size={16} />;
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Gift color="#facc15" /> Promo & Coupon Logic
                        </h1>
                        <p>Configure ecosystem-wide discount codes, referral rewards, and cashback incentives.</p>
                    </div>
                    <button className={styles.onboardBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                        <Plus size={18} /> Add New Logic
                    </button>
                </div>
            </header>

            {loading ? (
                <div className={styles.emptyState}>
                    <div className={styles.spinner}></div>
                    <p>Fetching active protocols...</p>
                </div>
            ) : (
                <div className={styles.tableCard} style={{ marginTop: '30px' }}>
                    <div className={styles.tableToolbar} style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            Showing {offers.length} active coupons and referral offers
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button className={styles.filterBtn}><Filter size={16} /> Filter</button>
                        </div>
                    </div>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th>OFFER TITLE & CATEGORY</th>
                                <th>PROMO CODE</th>
                                <th>VALUE & MIN. BUY</th>
                                <th>TARGET SEGMENT</th>
                                <th>STATUS</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map((offer) => (
                                <tr key={offer._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div className={styles.iconBox} style={{ background: 'rgba(250, 204, 21, 0.1)', color: '#facc15' }}>
                                                {getCategoryIcon(offer.category)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700, color: '#fff' }}>{offer.title}</div>
                                                <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    {offer.category}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <code style={{ background: 'rgba(250, 204, 21, 0.1)', padding: '6px 10px', borderRadius: '6px', color: '#facc15', fontWeight: 800, fontSize: '0.9rem', width: 'fit-content', border: '1px dashed rgba(250, 204, 21, 0.3)' }}>
                                                {offer.code}
                                            </code>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>
                                            {offer.discountValue}{offer.discountType === 'Percentage' ? '%' : ' ₹'}
                                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 400, marginLeft: '4px' }}>OFF</span>
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>Min Order: ₹{offer.minPurchase}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            {offer.targetRoles?.length > 0 ? offer.targetRoles.map((r: string) => (
                                                <span key={r} style={{ fontSize: '10px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '3px 8px', borderRadius: '5px', fontWeight: 600, textTransform: 'uppercase' }}>
                                                    {r.replace('_', ' ')}
                                                </span>
                                            )) : <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '3px 8px', borderRadius: '5px' }}>UNIVERSAL</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${offer.status === 'Active' ? styles.active : styles.blocked}`}>
                                            {offer.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button className={styles.actionIcon} onClick={() => { setFormData(offer); setShowModal(true); }} title="Edit Configuration">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className={styles.actionIcon} style={{ color: '#ef4444' }} onClick={() => handleDelete(offer._id)} title="Delete Coupon">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {offers.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No active coupon protocols found. Click "Add New Logic" to create one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal} style={{ maxWidth: '800px', width: '90%' }}>
                        <div className={styles.modalHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ background: '#facc15', color: '#000', padding: '8px', borderRadius: '8px' }}>
                                    {formData._id ? <Edit2 size={20} /> : <Plus size={20} />}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0 }}>{formData._id ? 'Edit Offer Configuration' : 'Create Native Promo Logic'}</h2>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Define how the coupon algorithm interacts with payments.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className={styles.closeBtn}><X /></button>
                        </div>

                        <form onSubmit={handleSave} className={styles.onboardForm}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', padding: '20px 0' }}>
                                {/* Left Side: Basic Info */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div className={styles.sectionHeader} style={{ fontSize: '0.9rem', fontWeight: 700, color: '#facc15', borderBottom: '1px solid rgba(250, 204, 21, 0.1)', paddingBottom: '8px', marginBottom: '10px' }}>
                                        BASIC IDENTITY
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Offer Internal Title</label>
                                        <input required type="text" placeholder="e.g. Summer Welcome Discount" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                        <small style={{ color: '#64748b', fontSize: '0.7rem' }}>Only visible in admin records.</small>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Public Description</label>
                                        <textarea
                                            placeholder="What does the user see?"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                            style={{ minHeight: '80px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', padding: '12px', outline: 'none' }}
                                        />
                                    </div>

                                    <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                                        <div className={styles.inputGroup}>
                                            <label>Redemption Code</label>
                                            <input required type="text" placeholder="NEWYEAR50" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Offer Category</label>
                                            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                                <option value="Discount Coupon">Discount Coupon</option>
                                                <option value="Plan Upgrade">Plan Upgrade Offer</option>
                                                <option value="Referral">Referral Reward</option>
                                                <option value="Cashback">Cashback Incentive</option>
                                                <option value="Special Event">Special Event</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Logic & Rules */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className={styles.sectionHeader} style={{ fontSize: '0.9rem', fontWeight: 700, color: '#facc15', borderBottom: '1px solid rgba(250, 204, 21, 0.1)', paddingBottom: '8px', marginBottom: '10px' }}>
                                        ENGINE LOGIC
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Benefit Model</label>
                                        <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value })}>
                                            <option value="Percentage">Percentage Drop (%)</option>
                                            <option value="Fixed">Flat Amount Cut (₹)</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGrid}>
                                        <div className={styles.inputGroup}>
                                            <label>Value</label>
                                            <input required type="number" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: e.target.value })} />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Min. Purchase</label>
                                            <input type="number" value={formData.minPurchase} onChange={e => setFormData({ ...formData, minPurchase: e.target.value })} />
                                        </div>
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Verification Expiry</label>
                                        <input type="date" value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().split('T')[0] : ''} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label>Algorithm Status</label>
                                        <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="Active">Operational (Active)</option>
                                            <option value="Disabled">Parked (Disabled)</option>
                                            <option value="Blocked">Locked (Blocked)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.inputGroup} style={{ marginTop: '10px', padding: '20px', background: 'rgba(255,250,230,0.03)', borderRadius: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={14} color="#facc15" /> Targeting Rules (Who can use this?)</label>
                                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '12px' }}>
                                    {[
                                        { key: 'client', label: 'Clients' },
                                        { key: 'advocate', label: 'Advocates' },
                                        { key: 'legal_provider', label: 'Legal Advisors' }
                                    ].map(role => (
                                        <button
                                            key={role.key}
                                            type="button"
                                            onClick={() => toggleRole(role.key)}
                                            style={{
                                                padding: '10px 20px',
                                                borderRadius: '12px',
                                                border: '1px solid',
                                                borderColor: formData.targetRoles?.includes(role.key) ? '#facc15' : 'rgba(255,255,255,0.1)',
                                                background: formData.targetRoles?.includes(role.key) ? 'rgba(250, 204, 21, 0.1)' : 'transparent',
                                                color: formData.targetRoles?.includes(role.key) ? '#facc15' : '#94a3b8',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {formData.targetRoles?.includes(role.key) ? <CheckCircle size={16} /> : <XCircle size={16} opacity={0.5} />}
                                            {role.label}
                                        </button>
                                    ))}
                                    <p style={{ width: '100%', fontSize: '0.75rem', color: '#64748b', marginTop: '10px' }}>
                                        <Info size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                        If no targets are selected, the coupon will be <strong>Universal</strong> and applicable to all users.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.modalFooter} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '20px', paddingTop: '20px' }}>
                                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Discard Changes</button>
                                <button type="submit" className={styles.saveBtn} style={{ padding: '12px 30px', background: '#facc15', color: '#000', fontWeight: 800 }}>
                                    <Save size={18} /> Deploy Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferManagement;
