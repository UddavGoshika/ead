import React, { useState } from 'react';
import { ArrowLeft, Send, Plus, X } from 'lucide-react';
import axios from 'axios';

interface Props {
    backToHome: () => void;
    showToast: (msg: string) => void;
}

const FileCase: React.FC<Props> = ({ backToHome, showToast }) => {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        clientId: '',
        title: '',
        description: '',
        category: 'Civil',
        requestedDocuments: [''],
        advocateNotes: ''
    });

    const handleInitiateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/cases', {
                ...formData,
                requestedDocuments: formData.requestedDocuments.filter(d => d.trim() !== '')
            }, {
                headers: { 'x-auth-token': token }
            });

            if (res.data.success) {
                showToast("Case request submitted to client!");
                backToHome();
            }
        } catch (err: any) {
            showToast(err.response?.data?.message || "Failed to initiate case");
        } finally {
            setSubmitting(false);
        }
    };

    const addDocField = () => {
        setFormData(prev => ({ ...prev, requestedDocuments: [...prev.requestedDocuments, ''] }));
    };

    const updateDocField = (idx: number, val: string) => {
        const newDocs = [...formData.requestedDocuments];
        newDocs[idx] = val;
        setFormData(prev => ({ ...prev, requestedDocuments: newDocs }));
    };

    const removeDocField = (idx: number) => {
        if (formData.requestedDocuments.length <= 1) return;
        setFormData(prev => ({
            ...prev,
            requestedDocuments: prev.requestedDocuments.filter((_, i) => i !== idx)
        }));
    };

    return (
        <div style={{ padding: '20px', color: 'white', maxWidth: '1100px', margin: '0 auto' }}>
            <button onClick={backToHome} style={{ background: 'none', border: 'none', color: '#facc15', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                <ArrowLeft size={18} /> Back
            </button>

            <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '30px', backdropFilter: 'blur(10px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '4px', color: '#facc15' }}>Initiate New Case</h1>
                        <p style={{ color: '#94a3b8', fontSize: '14px' }}>Draft a formal request to your client to begin litigation.</p>
                    </div>
                </div>

                <form onSubmit={handleInitiateSubmit} style={{ display: 'grid', gap: '20px' }}>
                    {/* Top Row: Basic Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px' }}>Client UID *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. ADV123456"
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px' }}>Case Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                            >
                                <option>Civil</option>
                                <option>Criminal</option>
                                <option>Family</option>
                                <option>Corporate</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px' }}>Case Title *</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Property Dispute..."
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Middle Row: Details & Notes */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px' }}>Detailed Background *</label>
                            <textarea
                                required
                                placeholder="Explain the case history..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '100px', outline: 'none', resize: 'vertical' }}
                            ></textarea>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px' }}>Notes to Client</label>
                            <textarea
                                placeholder="Advice for the client..."
                                value={formData.advocateNotes}
                                onChange={(e) => setFormData({ ...formData, advocateNotes: e.target.value })}
                                style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', minHeight: '100px', outline: 'none', resize: 'vertical' }}
                            ></textarea>
                        </div>
                    </div>

                    {/* Bottom Row: Documents */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '15px' }}>
                        <label style={{ fontWeight: 600, color: '#facc15', fontSize: '14px', marginBottom: '5px' }}>Requested Documents Checklist</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '10px' }}>
                            {formData.requestedDocuments.map((doc, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder={`Doc ${idx + 1}`}
                                        value={doc}
                                        onChange={(e) => updateDocField(idx, e.target.value)}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                                    />
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {formData.requestedDocuments.length > 1 && (
                                            <button type="button" onClick={() => removeDocField(idx)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', borderRadius: '8px', width: '36px', cursor: 'pointer' }}><X size={14} /></button>
                                        )}
                                        {idx === formData.requestedDocuments.length - 1 && (
                                            <button type="button" onClick={addDocField} style={{ background: 'rgba(250, 204, 21, 0.1)', border: 'none', color: '#facc15', borderRadius: '8px', width: '36px', cursor: 'pointer' }}><Plus size={14} /></button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                padding: '14px 40px',
                                borderRadius: '12px',
                                background: '#facc15',
                                color: '#000',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                opacity: submitting ? 0.7 : 1,
                                boxShadow: '0 4px 15px rgba(250, 204, 21, 0.3)'
                            }}
                        >
                            <Send size={18} /> {submitting ? 'Initiating...' : 'Submit Case Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FileCase;
