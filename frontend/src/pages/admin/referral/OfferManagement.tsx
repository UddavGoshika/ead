import React, { useState, useEffect } from 'react';
import styles from './ReferralUsers.module.css'; // Reusing Referral styles
import {
    Tag, Plus, Trash2, Edit2, Calendar,
    CheckCircle, XCircle, Percent, IndianRupee,
    Gift, ArrowRight, Save, X, Info, Shield, Filter, Settings, Layout
} from 'lucide-react';
import { referralService } from '../../../services/api';
import api from '../../../services/api';
import { useToast } from '../../../context/ToastContext';

const OfferManagement: React.FC = () => {
    const { showToast } = useToast();
    const [offers, setOffers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showPromoModal, setShowPromoModal] = useState(false);
    const [siteSettings, setSiteSettings] = useState<any>(null);
    const [promoTexts, setPromoTexts] = useState({
        client: 'UPTO 53% OFF ALL MEMBERSHIP PLANS',
        advocate: 'UPTO 53% OFF ALL MEMBERSHIP PLANS',
        legal_provider: 'UPTO 53% OFF ALL MEMBERSHIP PLANS'
    });

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

    const fetchSiteSettings = async () => {
        try {
            const res = await api.get('/settings/site');
            if (res.data.success) {
                setSiteSettings(res.data.settings);
                if (res.data.settings.dashboard_promos) {
                    setPromoTexts(res.data.settings.dashboard_promos);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchOffers();
        fetchSiteSettings();
    }, []);

    const handleSavePromo = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updatedSettings = {
                ...siteSettings,
                dashboard_promos: promoTexts
            };
            const res = await api.post('/settings/site', updatedSettings);
            if (res.data.success) {
                showToast('Dashboard promo texts updated successfully!', 'success');
                setSiteSettings(res.data.settings);
                setShowPromoModal(false);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to update promo texts', 'error');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await referralService.saveOffer(formData);
            if (res.data.success) {
                showToast('Offer saved successfully!', 'success');
                setShowModal(false);
                resetForm();
                fetchOffers();
            }
        } catch (err) {
            showToast('Failed to save offer', 'error');
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
                showToast('Offer deleted successfully!', 'success');
                fetchOffers();
            }
        } catch (err) {
            showToast('Delete failed', 'error');
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
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button className={styles.filterBtn} onClick={() => setShowPromoModal(true)} style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Settings size={18} /> Dashboard Promos
                        </button>
                        <button className={styles.onboardBtn} onClick={() => { resetForm(); setShowModal(true); }}>
                            <Plus size={18} /> Add New Logic
                        </button>
                    </div>
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
                <div className={styles.modalOverlay} style={{ padding: '40px' }}>
                    <div className={styles.modal} style={{ maxWidth: '1000px', width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7)' }}>
                        <div className={styles.modalHeader} style={{ padding: '30px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ background: '#facc15', color: '#000', padding: '12px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(250, 204, 21, 0.3)' }}>
                                    {formData._id ? <Edit2 size={24} /> : <Plus size={24} />}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{formData._id ? 'Edit Offer Configuration' : 'Create Native Promo Logic'}</h2>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>Define how the coupon algorithm interacts with payments.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className={styles.closeBtn} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><X />X</button>
                        </div>

                        <form onSubmit={handleSave} className={styles.onboardForm} style={{ padding: '0' }}>
                            <div style={{ maxHeight: 'calc(90vh - 180px)', overflowY: 'auto', padding: '30px 40px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px' }}>
                                    {/* Left Side: Basic Info */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '-10px' }}>
                                            BASIC IDENTITY
                                        </div>

                                        <div className={styles.inputGroup}>
                                            <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Offer Internal Title</label>
                                            <input required type="text" placeholder="e.g. Summer Welcome Discount" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff', fontSize: '1rem' }} />
                                            <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '6px' }}>Only visible in admin records.</p>
                                        </div>

                                        <div className={styles.inputGroup}>
                                            <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Public Description</label>
                                            <textarea
                                                placeholder="What does the user see?"
                                                value={formData.description}
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                style={{ minHeight: '120px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', padding: '15px', outline: 'none', width: '100%', fontSize: '1rem' }}
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div className={styles.inputGroup}>
                                                <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Redemption Code</label>
                                                <input required type="text" placeholder="NEWYEAR50" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Offer Category</label>
                                                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff', fontSize: '1rem' }}>
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
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', background: 'rgba(255,255,255,0.02)', padding: '30px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '-10px' }}>
                                            ENGINE LOGIC
                                        </div>

                                        <div className={styles.inputGroup}>
                                            <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Benefit Model</label>
                                            <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value })} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff', fontSize: '1rem' }}>
                                                <option value="Percentage">Percentage Drop (%)</option>
                                                <option value="Fixed">Flat Amount Cut (₹)</option>
                                            </select>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
                                            <div className={styles.inputGroup}>
                                                <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Value</label>
                                                <input required type="number" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: e.target.value })} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff', fontSize: '1rem' }} />
                                            </div>
                                            <div className={styles.inputGroup}>
                                                <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Min. Purchase</label>
                                                <input type="number" value={formData.minPurchase} onChange={e => setFormData({ ...formData, minPurchase: e.target.value })} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff', fontSize: '1rem' }} />
                                            </div>
                                        </div>

                                        <div className={styles.inputGroup}>
                                            <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Verification Expiry</label>
                                            <input type="date" value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().split('T')[0] : ''} onChange={e => setFormData({ ...formData, expiresAt: e.target.value })} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff', fontSize: '1rem' }} />
                                        </div>

                                        <div className={styles.inputGroup}>
                                            <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Algorithm Status</label>
                                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff', fontSize: '1rem' }}>
                                                <option value="Active">Operational (Active)</option>
                                                <option value="Disabled">Parked (Disabled)</option>
                                                <option value="Blocked">Locked (Blocked)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '40px', padding: '30px', background: 'rgba(255,250,230,0.02)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#facc15', fontSize: '1rem', fontWeight: 700 }}><Shield size={20} /> Targeting Rules (Who can use this?)</label>
                                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
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
                                                    padding: '15px 30px',
                                                    borderRadius: '16px',
                                                    border: '1px solid',
                                                    borderColor: formData.targetRoles?.includes(role.key) ? '#facc15' : 'rgba(255,255,255,0.1)',
                                                    background: formData.targetRoles?.includes(role.key) ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255,255,255,0.02)',
                                                    color: formData.targetRoles?.includes(role.key) ? '#facc15' : '#94a3b8',
                                                    cursor: 'pointer',
                                                    fontWeight: 700,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    fontSize: '0.95rem'
                                                }}
                                            >
                                                {formData.targetRoles?.includes(role.key) ? <CheckCircle size={20} /> : <XCircle size={20} opacity={0.3} />}
                                                {role.label}
                                            </button>
                                        ))}
                                    </div>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', marginTop: '20px' }}>
                                        <Info size={14} />
                                        If no targets are selected, the coupon will be <strong>Universal</strong> and applicable to all users.
                                    </p>
                                </div>
                            </div>

                            <div className={styles.modalFooter} style={{ padding: '30px 40px', background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '16px 35px', borderRadius: '16px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>Discard Changes</button>
                                <button type="submit" style={{ background: '#facc15', border: 'none', color: '#000', padding: '16px 45px', borderRadius: '16px', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', boxShadow: '0 10px 30px rgba(250, 204, 21, 0.3)', transition: 'all 0.3s ease' }}>
                                    <Save size={22} /> Deploy Configuration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPromoModal && (
                <div className={styles.modalOverlay} style={{ padding: '40px' }}>
                    <div className={styles.modal} style={{ maxWidth: '800px', width: '100%', background: '#020617', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7)' }}>
                        <div className={styles.modalHeader} style={{ padding: '30px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ background: '#3b82f6', color: '#fff', padding: '12px', borderRadius: '12px', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)' }}>
                                    <Layout size={24} />
                                </div>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Dashboard Promo Settings</h2>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: '#94a3b8' }}>Update the announcement text shown in user sidebars.</p>
                                </div>
                            </div>
                            <button onClick={() => setShowPromoModal(false)} className={styles.closeBtn} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '12px', cursor: 'pointer' }}><X /></button>
                        </div>

                        <form onSubmit={handleSavePromo} style={{ padding: '30px 40px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                <div className={styles.inputGroup}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Client Dashboard Promo Text</label>
                                    <input
                                        type="text"
                                        value={promoTexts.client}
                                        onChange={e => setPromoTexts({ ...promoTexts, client: e.target.value })}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff' }}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Advocate Dashboard Promo Text</label>
                                    <input
                                        type="text"
                                        value={promoTexts.advocate}
                                        onChange={e => setPromoTexts({ ...promoTexts, advocate: e.target.value })}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff' }}
                                    />
                                </div>
                                <div className={styles.inputGroup}>
                                    <label style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Legal Advisor Dashboard Promo Text</label>
                                    <input
                                        type="text"
                                        value={promoTexts.legal_provider}
                                        onChange={e => setPromoTexts({ ...promoTexts, legal_provider: e.target.value })}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '15px', color: '#fff' }}
                                    />
                                </div>
                            </div>

                            <div className={styles.modalFooter} style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                                <button type="button" onClick={() => setShowPromoModal(false)} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '12px 35px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Save size={18} /> Save Banners
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
