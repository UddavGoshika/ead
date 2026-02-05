import React, { useState, useEffect } from 'react';
import styles from "./mycases.module.css";
import { X, Phone, FileText, Loader2, MessageSquare, Briefcase, Filter, Plus, Shield, Clock, CheckCircle, ChevronRight, User, AlertCircle } from "lucide-react";
import { caseService } from "../../../../services/api";
import { useCall } from "../../../../context/CallContext";
import { LOCATION_DATA_RAW } from '../../../../components/layout/statesdis';
import { LEGAL_DOMAINS } from '../../../../data/legalDomainData';
import axios from 'axios';

interface MyCasesProps {
    onSelectForChat: (partner: any) => void;
}

const MyCases: React.FC<MyCasesProps> = ({ onSelectForChat }) => {
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { initiateCall } = useCall();

    const [activeModal, setActiveModal] = useState<'docs' | 'details' | 'initiate' | null>(null);
    const [selectedCase, setSelectedCase] = useState<any>(null);

    // Form for Initiate Case
    const [formData, setFormData] = useState({
        clientId: '',
        title: '',
        description: '',
        category: 'Civil',
        location: '',
        court: '',
        department: 'All',
        subDepartment: 'All',
        requestedDocuments: [''],
        advocateNotes: ''
    });

    // Filter States
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All Status');
    const [selectedDept, setSelectedDept] = useState('All');

    const fetchCases = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (status !== 'All Status') params.status = status;
            if (selectedDept !== 'All') params.department = selectedDept;

            const response = await caseService.getCases(params);
            setCases(response.data.cases);
        } catch (err) {
            console.error("Failed to fetch cases", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCases();

        // Listen for 'initiate-case' navigation from dashboard
        const handleInitiate = (e: any) => {
            const data = e.detail;
            if (data) {
                if (typeof data === 'string') {
                    setFormData(prev => ({ ...prev, clientId: data }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        clientId: data.clientId || '',
                        title: data.title || '',
                        category: data.category || 'Civil',
                        description: data.description || ''
                    }));
                }
            }
            setActiveModal('initiate');
        };
        window.addEventListener('open-initiate-case', handleInitiate);
        return () => window.removeEventListener('open-initiate-case', handleInitiate);
    }, []);

    const openModal = (type: 'docs' | 'details' | 'initiate', caseItem?: any) => {
        if (caseItem) setSelectedCase(caseItem);
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedCase(null);
    };

    const handleChat = (item: any) => {
        if (!item.clientId) {
            alert("No client assigned to this case.");
            return;
        }
        const partner = {
            id: item.clientId._id,
            userId: item.clientId._id,
            name: item.clientId.name,
            unique_id: item.clientId.unique_id,
            image_url: item.clientId.image_url,
            role: 'client'
        };
        onSelectForChat(partner);
    };

    const handleCall = (item: any) => {
        if (!item.clientId?._id) {
            alert("No client assigned to this case.");
            return;
        }
        initiateCall(String(item.clientId._id), 'audio');
    };

    const handleInitiateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/cases', {
                ...formData,
                requestedDocuments: formData.requestedDocuments.filter(d => d.trim() !== '')
            }, {
                headers: { 'x-auth-token': token }
            });

            if (res.data.success) {
                alert("Case request submitted to client!");
                closeModal();
                fetchCases();
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to initiate case");
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

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Case Request Received': return '#38bdf8';
            case 'Client Approved': return '#22c55e';
            case 'In Progress': return '#facc15';
            case 'Open': return '#94a3b8';
            default: return '#f1f5f9';
        }
    };

    if (loading && cases.length === 0) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <Loader2 className="animate-spin" size={48} color="#facc15" />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search by Case ID or Client..."
                        className={styles.dashboardSearchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className={styles.searchBtnInside} onClick={fetchCases}>Search</button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <select className={styles.filterSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option>All Status</option>
                        <option>Case Request Received</option>
                        <option>Client Approved</option>
                        <option>In Progress</option>
                        <option>Closed</option>
                    </select>

                    <button className={styles.initiateBtn} onClick={() => setActiveModal('initiate')}>
                        <Plus size={18} /> Initiate New Case
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Loader2 className="animate-spin" size={32} color="#facc15" />
                </div>
            ) : cases.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '50px' }}>
                    <Briefcase size={64} style={{ opacity: 0.2, marginBottom: '20px', margin: '0 auto' }} />
                    <h3>No Active Cases</h3>
                    <p>When you initiate or are assigned to a case, it will appear here.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {cases.map((item, idx) => (
                        <div key={item._id || idx} className={styles.premiumCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.headerTop}>
                                    <div className={styles.titleStack}>
                                        <h3>{item.title}</h3>
                                        <span className={styles.caseId}>{item.caseId}</span>
                                    </div>
                                    <div className={styles.statusBadge} style={{
                                        background: `${getStatusColor(item.status)}15`,
                                        color: getStatusColor(item.status),
                                        borderColor: `${getStatusColor(item.status)}30`
                                    }}>
                                        <div className={styles.pulse} style={{ background: getStatusColor(item.status) }}></div>
                                        {item.status}
                                    </div>
                                </div>
                                <div className={styles.clientProfileBox}>
                                    <img src={item.clientId?.image_url || "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg"} alt="Client" />
                                    <div className={styles.clientInfo}>
                                        <span className={styles.clientName}>{item.clientId?.name || 'Unknown'}</span>
                                        <span className={styles.clientUID}>UID: {item.clientId?.unique_id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardInfo}>
                                <div className={styles.infoItem}>
                                    <Clock size={14} />
                                    <span>Last update: {new Date(item.updatedAt || item.lastUpdate).toLocaleDateString()}</span>
                                </div>
                                <span className={styles.viewDetails} onClick={() => openModal('details', item)}>Details <ChevronRight size={14} /></span>
                            </div>

                            <div className={styles.actions}>
                                <button onClick={() => handleChat(item)} className={styles.chatBtn}>
                                    <MessageSquare size={16} /> Chat
                                </button>
                                <button onClick={() => handleCall(item)} className={styles.callBtn}>
                                    <Phone size={16} /> Call
                                </button>
                                <button onClick={() => openModal('docs', item)} className={styles.docsBtn}>
                                    <FileText size={16} /> Docs
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODALS */}
            {activeModal === 'initiate' && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Initiate New Case</h2>
                            <button onClick={closeModal} className={styles.closeBtn}><X size={24} /></button>
                        </div>
                        <form className={styles.initiateForm} onSubmit={handleInitiateSubmit}>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Client UID *</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ADV123456"
                                        required
                                        value={formData.clientId}
                                        onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    />
                                    <small>The unique ID of the client.</small>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Case Type / Category</label>
                                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                                        <option>Civil</option>
                                        <option>Criminal</option>
                                        <option>Family</option>
                                        <option>Corporate</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Case Title *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Property Dispute in Mumbai"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Detailed Description *</label>
                                <textarea
                                    rows={3}
                                    placeholder="Briefly explain the case background..."
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Required Documents</label>
                                {formData.requestedDocuments.map((doc, idx) => (
                                    <div key={idx} className={styles.docInputRow}>
                                        <input
                                            type="text"
                                            placeholder={`Document ${idx + 1}`}
                                            value={doc}
                                            onChange={(e) => updateDocField(idx, e.target.value)}
                                        />
                                        {idx === formData.requestedDocuments.length - 1 && (
                                            <button type="button" onClick={addDocField} className={styles.addDocBtn}><Plus size={16} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className={styles.formGroup}>
                                <label>Your Notes to Client</label>
                                <textarea
                                    rows={2}
                                    placeholder="Any advice or next steps..."
                                    value={formData.advocateNotes}
                                    onChange={(e) => setFormData({ ...formData, advocateNotes: e.target.value })}
                                />
                            </div>

                            <button type="submit" className={styles.submitInitiateBtn}>Create Case Request</button>
                        </form>
                    </div>
                </div>
            )}

            {activeModal === 'docs' && selectedCase && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Case Documents</h2>
                            <button onClick={closeModal} className={styles.closeBtn}><X size={24} /></button>
                        </div>
                        <div className={styles.docList}>
                            {selectedCase.documents && selectedCase.documents.length > 0 ? (
                                selectedCase.documents.map((doc: any, i: number) => (
                                    <div key={i} className={styles.docRow}>
                                        <div className={styles.docIcon}><FileText size={20} color="#3b82f6" /></div>
                                        <div className={styles.docContent}>
                                            <span>{doc.name}</span>
                                            <small>{new Date(doc.uploadedAt).toLocaleDateString()}</small>
                                        </div>
                                        <a href={doc.url} target="_blank" rel="noreferrer" className={styles.downloadBtn}>View</a>
                                    </div>
                                ))
                            ) : (
                                <div className={styles.emptyDocs}>
                                    <AlertCircle size={40} />
                                    <p>No documents uploaded yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'details' && selectedCase && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Case Details</h2>
                            <button onClick={closeModal} className={styles.closeBtn}><X size={24} /></button>
                        </div>
                        <div className={styles.detailsGrid}>
                            <div className={styles.detailRow}>
                                <label>Title</label>
                                <span>{selectedCase.title}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <label>Category</label>
                                <span>{selectedCase.category}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <label>Status</label>
                                <span style={{ color: getStatusColor(selectedCase.status) }}>{selectedCase.status}</span>
                            </div>
                            <div className={styles.detailRow}>
                                <label>Description</label>
                                <p>{selectedCase.description}</p>
                            </div>
                            <div className={styles.detailRow}>
                                <label>Advocate Notes</label>
                                <p className={styles.notesBox}>{selectedCase.advocateNotes || "N/A"}</p>
                            </div>
                            <div className={styles.detailRow}>
                                <label>Client Notes</label>
                                <p className={styles.notesBox}>{selectedCase.clientNotes || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCases;
