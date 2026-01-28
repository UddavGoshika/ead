import React, { useState } from 'react';
import styles from '../managerdash.module.css';
import {
    MdSend, MdAttachment,
    MdInfo, MdCheckCircle, MdArrowForward, MdArrowBack
} from 'react-icons/md';

const InformSuperAdmin: React.FC = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        subject: '',
        priority: 'Normal',
        category: 'Operational Report',
        message: '',
        attachments: [] as File[]
    });

    const categories = ['Operational Report', 'Security Alert', 'Staff Incident', 'System Enhancement', 'Urgent Request'];
    const priorities = ['Low', 'Normal', 'High', 'Critical'];

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStep(4); // Success step
    };

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div>
                    <h1>Portal Communication</h1>
                    <p>Secure link to the Super Administrative Panel for strategic escalations and intelligence sharing.</p>
                </div>
            </header>

            <div className={styles.container} style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: step >= s ? '#3b82f6' : '#1e293b',
                            color: step >= s ? 'white' : '#64748b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 1, fontWeight: 700, fontSize: '0.8rem',
                            border: '4px solid #020617', transition: 'all 0.3s'
                        }}>
                            {step > s ? <MdCheckCircle size={20} /> : s}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div style={{ background: '#0f172a', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Intelligence Classification</h2>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '24px' }}>Identify the nature and urgency of your communication.</p>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>Communication Subject</label>
                                <input
                                    className={styles.statusSelect}
                                    style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
                                    placeholder="Enter concise subject line..."
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>Category</label>
                                    <select
                                        className={styles.statusSelect}
                                        style={{ width: '100%', padding: '12px' }}
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '8px' }}>Priority Level</label>
                                    <select
                                        className={styles.statusSelect}
                                        style={{ width: '100%', padding: '12px' }}
                                        value={formData.priority}
                                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                    >
                                        {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <button
                            className={styles.actionButton}
                            style={{ width: '100%', marginTop: '32px', padding: '14px' }}
                            onClick={handleNext}
                            disabled={!formData.subject}
                        >
                            Next: Intelligence Detail <MdArrowForward />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ background: '#0f172a', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Intelligence Detail</h2>
                        <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '24px' }}>Provide a detailed analysis or report for the Super Admin.</p>

                        <textarea
                            style={{
                                width: '100%', minHeight: '200px', background: '#1e293b',
                                border: '1px solid rgba(255,255,255,0.1)', color: 'white',
                                borderRadius: '12px', padding: '16px', fontSize: '0.95rem',
                                outline: 'none', resize: 'vertical'
                            }}
                            placeholder="Write your message here. Be as specific as possible..."
                            value={formData.message}
                            onChange={e => setFormData({ ...formData, message: e.target.value })}
                        />

                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#60a5fa', fontSize: '0.9rem' }}>
                                <MdAttachment /> Attach Data Logs or Reports
                                <input type="file" multiple style={{ display: 'none' }} />
                            </label>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                            <button className={styles.actionButton} style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }} onClick={handleBack}>
                                <MdArrowBack /> Back
                            </button>
                            <button className={styles.actionButton} style={{ flex: 2, padding: '14px' }} onClick={handleNext} disabled={!formData.message}>
                                Next: Final Review <MdArrowForward />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ background: '#0f172a', padding: '32px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', color: '#f59e0b' }}>
                            <MdInfo size={24} />
                            <span style={{ fontSize: '0.85rem' }}>Review your information before transmitting to the Super Admin panel.</span>
                        </div>

                        <div style={{ display: 'grid', gap: '16px', fontSize: '0.9rem' }}>
                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Subject</div>
                                <div style={{ fontWeight: 600 }}>{formData.subject}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Category</div>
                                    <div>{formData.category}</div>
                                </div>
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Priority</div>
                                    <div style={{ color: formData.priority === 'Critical' ? '#ef4444' : '#f8fafc' }}>{formData.priority}</div>
                                </div>
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Transmission Content</div>
                                <div style={{ lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{formData.message}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                            <button className={styles.actionButton} style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }} onClick={handleBack}>
                                <MdArrowBack /> Back
                            </button>
                            <button className={styles.actionButton} style={{ flex: 2, padding: '14px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }} onClick={handleSubmit}>
                                <MdSend /> Transmit to Super Admin
                            </button>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div style={{ background: '#0f172a', padding: '48px', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)',
                            color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <MdCheckCircle size={48} />
                        </div>
                        <h2 style={{ fontSize: '1.6rem', marginBottom: '12px' }}>Transmission Successful</h2>
                        <p style={{ color: '#94a3b8', lineHeight: '1.6', marginBottom: '32px' }}>
                            Your report has been successfully transmitted and logged in the Super Administrative Panel.
                            The relevant team will be notified of your escalation.
                        </p>
                        <button
                            className={styles.actionButton}
                            style={{ padding: '12px 32px' }}
                            onClick={() => { setStep(1); setFormData({ subject: '', priority: 'Normal', category: 'Operational Report', message: '', attachments: [] }); }}
                        >
                            Return to Portal
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InformSuperAdmin;
