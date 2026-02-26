import React, { useState, useEffect } from 'react';
import styles from "./mycases.module.css";
import { X, Phone, FileText, Loader2, MessageSquare, Briefcase, Plus, Clock, ChevronRight, AlertCircle, Inbox, CheckCircle2, Shield, Trash2 } from "lucide-react";
import api, { caseService } from "../../../../services/api";
import { interactionService } from "../../../../services/interactionService";

import { useAuth } from "../../../../context/AuthContext";
import { useCall } from "../../../../context/CallContext";
import PremiumTryonModal from "../../shared/PremiumTryonModal";
import { LOCATION_DATA_RAW } from '../../../../components/layout/statesdis';
import { LEGAL_DOMAINS } from '../../../../data/legalDomainData';
import axios from 'axios';

interface MyCasesProps {
    onSelectForChat: (partner: any) => void;
}

const MyCases: React.FC<MyCasesProps> = ({ onSelectForChat }) => {
    const [cases, setCases] = useState<any[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { initiateCall } = useCall();
    const [showTrialModal, setShowTrialModal] = useState(false);

    const plan = (user?.plan || 'Free').toLowerCase();
    const isPremium = user?.isPremium || (plan !== 'free' && plan !== '');

    const [activeModal, setActiveModal] = useState<'docs' | 'details' | 'initiate' | 'accept' | 'deliver' | null>(null);
    const [selectedCase, setSelectedCase] = useState<any>(null);

    // Form for Deliver Work
    const [deliverForm, setDeliverForm] = useState({
        content: '',
        files: [] as File[]
    });

    // Form for Accept Case
    const [acceptForm, setAcceptForm] = useState({
        serviceFee: '',
        notes: '',
        deadline: '',
        requiredDocs: [''],
    });

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
    const [selectedSubDept, setSelectedSubDept] = useState('All');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    const states = Object.keys(LOCATION_DATA_RAW);
    const districts = selectedState ? Object.keys(LOCATION_DATA_RAW[selectedState] || {}) : [];
    const cities = (selectedState && selectedDistrict) ? LOCATION_DATA_RAW[selectedState][selectedDistrict] : [];
    const subDepartments = selectedDept !== 'All' ? LEGAL_DOMAINS[selectedDept] || [] : [];

    const fetchCases = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (status !== 'All Status') params.status = status;
            if (selectedDept !== 'All') params.department = selectedDept;
            if (selectedSubDept !== 'All') params.subDepartment = selectedSubDept;
            if (selectedState) params.state = selectedState;
            if (selectedDistrict) params.district = selectedDistrict;
            if (selectedCity) params.city = selectedCity;

            const [casesRes, activitiesRes] = await Promise.all([
                caseService.getCases(params),
                interactionService.getAllActivities(String(user?.id))
            ]);

            setCases(casesRes.data.cases);

            // Filter for incoming pending interests/requests
            const pendingIncoming = activitiesRes.filter((act: any) =>
                !act.isSender &&
                act.status === 'pending' &&
                ['interest', 'superInterest', 'meet_request'].includes(act.type)
            );
            setIncomingRequests(pendingIncoming);
        } catch (err) {
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleActivityResponse = async (activityId: string, status: 'accepted' | 'declined') => {
        try {
            await interactionService.respondToActivity(activityId, status);
            alert(`Request ${status} successfully.`);
            fetchCases(); // Refresh both
        } catch (err) {
            console.error("Failed to respond to activity", err);
            alert("Error updating request status.");
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

    const openModal = (type: 'docs' | 'details' | 'initiate' | 'accept' | 'deliver', caseItem?: any) => {
        if (caseItem) {
            setSelectedCase(caseItem);
            if (type === 'accept') {
                setAcceptForm({
                    serviceFee: '',
                    notes: '',
                    deadline: '',
                    requiredDocs: [''],
                });
            }
            if (type === 'deliver') {
                setDeliverForm({ content: '', files: [] });
            }
        }
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
        if (!isPremium) {
            setShowTrialModal(true);
            return;
        }
        const targetId = item.clientId?._id || item.clientId;
        if (!targetId) {
            alert("No client assigned to this case.");
            return;
        }
        initiateCall(String(targetId), 'audio');
    };

    const handleInitiateSubmit = async (e: React.FormEvent) => {
        // ... (existing logic)
    };

    const handleAcceptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            // First accept the case
            await axios.post(`/api/cases/${selectedCase._id}/accept`, {}, {
                headers: { 'x-auth-token': token }
            });
            // Then send the formal quote/setup
            await axios.post(`/api/cases/${selectedCase._id}/quote`, {
                serviceFee: Number(acceptForm.serviceFee),
                advisorNotes: acceptForm.notes,
                estimatedDelivery: acceptForm.deadline,
                requestedDocuments: acceptForm.requiredDocs.filter(d => d.trim()),
                // We'll treat requestedDocs as part of the notes/terms for now or update model if needed
                terms: `Required Docs: ${acceptForm.requiredDocs.filter(d => d.trim()).join(', ')}`
            }, {
                headers: { 'x-auth-token': token }
            });

            alert("Case accepted and project setup submitted!");
            closeModal();
            fetchCases();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to process acceptance");
        }
    };

    const handleRejectCase = async (item: any) => {
        const reason = prompt("Please provide a reason for rejecting this case:");
        if (reason) {
            try {
                await axios.post(`/api/cases/${item._id}/reject`, { reason }, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });
                alert("Case rejected.");
                fetchCases();
            } catch (err: any) {
                alert(err.response?.data?.message || "Failed to reject case");
            }
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

    const handleDeliverSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('deliverableContent', deliverForm.content);
            deliverForm.files.forEach(f => formData.append('documents', f));

            await api.post(`/cases/${selectedCase._id}/deliver`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Work delivered successfully! Client notified.");
            closeModal();
            fetchCases();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to deliver work");
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Case Request Received': return '#38bdf8';
            case 'Client Approved': return '#22c55e';
            case 'In Progress': return '#facc15';
            case 'Funded': return '#22c55e';
            case 'Delivered': return '#a855f7';
            case 'Revision Requested': return '#ef4444';
            case 'Open': return '#94a3b8';
            default: return '#f1f5f9';
        }
    };

    const handleNavigation = (page: string) => {
        window.dispatchEvent(new CustomEvent('change-tab', { detail: page }));
    };

    if (loading && cases.length === 0 && incomingRequests.length === 0) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <Loader2 className="animate-spin" size={48} color="#facc15" />
            </div>
        );
    }

    return (
        <div className={styles.container} style={{ paddingBottom: '150px' }}>
            <div className={styles.searchSection} style={{ flexDirection: 'column', gap: '15px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    width: '100%'
                }}>
                    <input
                        type="text"
                        placeholder="Search Case ID or Client..."
                        className={styles.dashboardSearchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingRight: '20px' }}
                    />

                    <select className={styles.filterSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option>All Status</option>
                        <option>Case Request Received</option>
                        <option>Client Approved</option>
                        <option>In Progress</option>
                        <option>Closed</option>
                    </select>

                    <select className={styles.filterSelect} value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedSubDept('All'); }}>
                        <option value="All">All Departments</option>
                        {Object.keys(LEGAL_DOMAINS).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <select className={styles.filterSelect} value={selectedSubDept} onChange={(e) => setSelectedSubDept(e.target.value)} disabled={selectedDept === 'All'}>
                        <option value="All">All Sub-Depts</option>
                        {subDepartments.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select className={styles.filterSelect} value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedCity(''); }}>
                        <option value="">All States</option>
                        {states.sort().map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select className={styles.filterSelect} value={selectedDistrict} onChange={(e) => { setSelectedDistrict(e.target.value); setSelectedCity(''); }} disabled={!selectedState}>
                        <option value="">All Districts</option>
                        {districts.sort().map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <select className={styles.filterSelect} value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} disabled={!selectedDistrict}>
                        <option value="">All Cities</option>
                        {cities.sort().map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <button className={styles.searchBtnInside} onClick={fetchCases} style={{ height: '100%', minHeight: '45px', position: 'static', borderRadius: '12px' }}>
                        Search
                    </button>
                </div>
            </div>

            {/* INCOMING REQUESTS SECTION */}
            {incomingRequests.length > 0 && (
                <div className={styles.incomingSection}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Inbox size={20} /> Incoming Requests</h2>
                    <div className={styles.incomingList}>
                        {incomingRequests.map((req) => (
                            <div key={req._id} className={styles.incomingItem}>
                                <img src={req.partnerImg} alt={req.partnerName} className={styles.incomingAvatar} />
                                <div className={styles.incomingContent}>
                                    <div className={styles.incomingHeader}>
                                        <span className={styles.incomingName}>{req.partnerName}</span>
                                        <span className={styles.incomingDate}>
                                            {new Date(req.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className={styles.incomingSub}>
                                        <span>{req.partnerUniqueId || 'ID: Pending'}</span>
                                        {req.partnerLocation && req.partnerLocation !== 'N/A' && (
                                            <>
                                                <span>•</span>
                                                <span>{req.partnerLocation}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className={styles.incomingServices}>
                                        {req.metadata?.service || req.service || "Standard Consultancy"}
                                    </div>
                                    <div className={styles.incomingMessage}>
                                        Interest Received (New Enquiry)
                                    </div>
                                </div>
                                <div className={styles.incomingActions}>
                                    <button
                                        className={styles.acceptBtnSmall}
                                        onClick={() => handleActivityResponse(req._id, 'accepted')}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className={styles.declineBtnSmall}
                                        onClick={() => handleActivityResponse(req._id, 'declined')}
                                    >
                                        Decline
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Loader2 className="animate-spin" size={32} color="#facc15" />
                </div>
            ) : (cases.length === 0 && incomingRequests.length === 0) ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '50px' }}>
                    <Briefcase size={64} style={{ opacity: 0.2, marginBottom: '20px', margin: '0 auto' }} />
                    <h3>No Active Cases or Requests</h3>
                    <p>When you initiate or are assigned to a case, it will appear here.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {cases.length > 0 && (
                        <h2 style={{ color: '#f8fafc', marginBottom: '15px', fontSize: '1.2rem', gridColumn: '1 / -1' }}>Active Cases</h2>
                    )}
                    {cases.map((item, idx) => (
                        <div key={item._id || idx} className={styles.premiumCard} onClick={() => openModal('details', item)} style={{ cursor: 'pointer' }}>
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

                            <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
                                {item.status === 'Requested' && (
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); openModal('accept', item); }} className={styles.acceptBtn} style={{ background: '#22c55e20', color: '#4ade80', borderColor: '#22c55e40' }}>
                                            Accept
                                        </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleRejectCase(item); }} className={styles.rejectBtn} style={{ background: '#ef444420', color: '#f87171', borderColor: '#ef444440' }}>
                                            Reject
                                        </button>
                                    </>
                                )}
                                {(item.status === 'Funded' || item.status === 'In Progress' || item.status === 'Revision Requested') && (
                                    <button onClick={(e) => { e.stopPropagation(); openModal('deliver', item); }} className={styles.docsBtn} style={{ background: '#a855f720', color: '#c084fc', borderColor: '#a855f740' }}>
                                        Proceed to Submit Documents
                                    </button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); handleChat(item); }} className={styles.chatBtn}>
                                    <MessageSquare size={16} /> Chat
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleCall(item); }} className={styles.callBtn}>
                                    <Phone size={16} /> Call
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); openModal('docs', item); }} className={styles.docsBtn}>
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

                            <button type="submit" className={styles.submitInitiateBtn}>Submit</button>
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

            {activeModal === 'accept' && selectedCase && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Accept Case & Setup Project</h2>
                            <button onClick={closeModal} className={styles.closeBtn}><X size={24} /></button>
                        </div>
                        <form className={styles.initiateForm} onSubmit={handleAcceptSubmit}>
                            <div className={styles.clientProfileBox} style={{ background: 'rgba(255,255,255,0.05)', marginBottom: '0' }}>
                                <img src={selectedCase.clientId?.image_url || "/default-avatar.png"} alt="" />
                                <div className={styles.clientInfo}>
                                    <span className={styles.clientName}>{selectedCase.clientId?.name}</span>
                                    <span className={styles.clientUID}>Case: {selectedCase.title}</span>
                                </div>
                            </div>

                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Your Professional Fee (₹) *</label>
                                    <input
                                        type="number"
                                        placeholder="Ex: 5000"
                                        required
                                        value={acceptForm.serviceFee}
                                        onChange={(e) => setAcceptForm({ ...acceptForm, serviceFee: e.target.value })}
                                    />
                                    <small>Client pays fee + platform commission.</small>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Est. Deadline/Timeline *</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 5 Working Days"
                                        required
                                        value={acceptForm.deadline}
                                        onChange={(e) => setAcceptForm({ ...acceptForm, deadline: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Brief Action Plan / Notes *</label>
                                <textarea
                                    rows={3}
                                    placeholder="Briefly explain your approach..."
                                    required
                                    value={acceptForm.notes}
                                    onChange={(e) => setAcceptForm({ ...acceptForm, notes: e.target.value })}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label>Documents Required from Client</label>
                                {acceptForm.requiredDocs.map((doc, idx) => (
                                    <div key={idx} className={styles.docInputRow}>
                                        <input
                                            type="text"
                                            placeholder={`Document/ID ${idx + 1}`}
                                            value={doc}
                                            onChange={(e) => {
                                                const d = [...acceptForm.requiredDocs];
                                                d[idx] = e.target.value;
                                                setAcceptForm({ ...acceptForm, requiredDocs: d });
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {acceptForm.requiredDocs.length > 1 && (
                                                <button type="button" onClick={() => {
                                                    const d = [...acceptForm.requiredDocs];
                                                    d.splice(idx, 1);
                                                    setAcceptForm({ ...acceptForm, requiredDocs: d });
                                                }} className={styles.deleteDocBtn} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '8px' }}>
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            {idx === acceptForm.requiredDocs.length - 1 && (
                                                <button type="button" onClick={() => setAcceptForm({ ...acceptForm, requiredDocs: [...acceptForm.requiredDocs, ''] })} className={styles.addDocBtn}><Plus size={16} />+</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className={styles.submitInitiateBtn}>
                                Accept & Send Proposal
                            </button>
                            <p style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '-10px' }}>
                                Client will be notified to fund the escrow immediately.
                            </p>
                        </form>
                    </div>
                </div>
            )}

            {activeModal === 'details' && selectedCase && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className={styles.modalHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Shield size={20} color="#facc15" />
                                <div>
                                    <h3 style={{ margin: 0 }}>Case Lifecycle Details</h3>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>ID: {selectedCase.caseId} • Status: <b>{selectedCase.status}</b></span>
                                </div>
                            </div>
                            <button onClick={closeModal} className={styles.closeBtn}><X size={24} /></button>
                        </div>

                        <div className={styles.caseForm} style={{ maxHeight: '75vh', overflowY: 'auto', padding: '0' }}>
                            {/* Progress Timeline */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                margin: '20px 0 30px',
                                position: 'relative',
                                padding: '0 30px'
                            }}>
                                <div style={{ position: 'absolute', top: '15px', left: '40px', right: '40px', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
                                {[
                                    { label: 'Requested', status: ['Requested'] },
                                    { label: 'Quoted', status: ['Quoted', 'Accepted'] },
                                    { label: 'Funded', status: ['Funded'] },
                                    { label: 'Working', status: ['In Progress', 'Revision Requested'] },
                                    { label: 'Delivered', status: ['Delivered'] },
                                    { label: 'Closed', status: ['Completed'] }
                                ].map((step, i) => {
                                    const statuses = ['Requested', 'Accepted', 'Quoted', 'Funded', 'In Progress', 'Delivered', 'Revision Requested', 'Completed'];
                                    const currentIdx = statuses.indexOf(selectedCase.status);
                                    const stepIdx = statuses.indexOf(step.status[0]);
                                    const isPast = currentIdx > stepIdx;
                                    const isActive = step.status.includes(selectedCase.status);

                                    return (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, flex: 1 }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                background: isActive ? '#facc15' : (isPast ? '#22c55e' : '#1e293b'),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: isActive || isPast ? '#000' : '#64748b',
                                                border: isActive ? '4px solid rgba(250, 204, 21, 0.2)' : 'none',
                                                fontSize: '12px',
                                                fontWeight: '800'
                                            }}>
                                                {isPast ? <CheckCircle2 size={16} /> : <span>{i + 1}</span>}
                                            </div>
                                            <span style={{ fontSize: '10px', fontWeight: isActive ? '800' : '600', color: isActive ? '#facc15' : '#64748b', textAlign: 'center' }}>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ padding: '0 30px 30px' }}>
                                <div className={styles.detailSection} style={{ marginBottom: '20px' }}>
                                    <label className={styles.pLabel}>Project Context</label>
                                    <h4 className={styles.detailValue} style={{ fontSize: '18px' }}>{selectedCase.title}</h4>
                                    <p className={styles.detailValueText} style={{ marginTop: '5px', fontSize: '14px' }}>{selectedCase.description}</p>
                                </div>

                                <div className={styles.formRow} style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                                    <div className={styles.detailSection} style={{ flex: 1 }}>
                                        <label className={styles.pLabel}>Service Category</label>
                                        <span className={styles.typeTag} style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>{selectedCase.category}</span>
                                    </div>
                                    <div className={styles.detailSection} style={{ flex: 1 }}>
                                        <label className={styles.pLabel}>Last Status Update</label>
                                        <span className={styles.detailValue} style={{ fontSize: '14px' }}>{new Date(selectedCase.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {selectedCase.quotingInfo?.estimatedDelivery && (
                                    <div className={styles.financialBox} style={{ background: 'rgba(250,204,21,0.03)', border: '1px solid rgba(250,204,21,0.1)', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                                        <h5 style={{ color: '#facc15', margin: '0 0 15px 0' }}>Professional Engagement Details</h5>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                                            <span style={{ color: '#94a3b8' }}>Est. Delivery:</span>
                                            <span style={{ color: '#fff', fontWeight: 600 }}>{selectedCase.quotingInfo.estimatedDelivery}</span>
                                        </div>

                                        {selectedCase.advocateNotes && (
                                            <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                                                <label className={styles.pLabel}>Your Plan to Client</label>
                                                <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>{selectedCase.advocateNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedCase.requestedDocuments?.length > 0 && (
                                    <div className={styles.detailSection} style={{ marginBottom: '20px' }}>
                                        <label className={styles.pLabel}>Documents Requested from Client</label>
                                        <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#cbd5e1', fontSize: '13px' }}>
                                            {selectedCase.requestedDocuments.map((doc: string, i: number) => (
                                                <li key={i}>{doc}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedCase.documents?.filter((d: any) => !d.url.toLowerCase().endsWith('.pdf')).length > 0 && (
                                    <div className={styles.detailSection} style={{ marginBottom: '20px' }}>
                                        <label className={styles.pLabel}>Client Uploaded Documents (Images)</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px', marginTop: '10px' }}>
                                            {selectedCase.documents.filter((d: any) => !d.url.toLowerCase().endsWith('.pdf')).map((doc: any, i: number) => (
                                                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                    <a href={doc.url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                                                        <img
                                                            src={doc.url}
                                                            alt={doc.name}
                                                            style={{
                                                                width: '100%',
                                                                height: '100px',
                                                                objectFit: 'cover',
                                                                borderRadius: '12px',
                                                                border: '2px solid rgba(255,255,255,0.05)',
                                                                transition: '0.3s'
                                                            }}
                                                        />
                                                    </a>
                                                    <span style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {selectedCase.paymentInfo?.totalPaid > 0 && (
                                    <div className={styles.financialBox} style={{ background: 'rgba(34, 197, 94, 0.03)', border: '1px solid rgba(34, 197, 94, 0.1)', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                                        <h5 style={{ color: '#4ade80', margin: '0 0 15px 0' }}>Escrow / Payment Details</h5>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                            <span style={{ color: '#94a3b8' }}>Your Payout:</span>
                                            <span style={{ color: '#fff', fontWeight: 600 }}>₹{selectedCase.paymentInfo?.serviceFee || 0}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                            <span style={{ color: '#94a3b8' }}>Total Escrow funded:</span>
                                            <span style={{ color: '#facc15', fontWeight: 700 }}>₹{selectedCase.paymentInfo?.totalPaid || 0}</span>
                                        </div>
                                    </div>
                                )}

                                {selectedCase.deliverableContent && (
                                    <div style={{ marginTop: '20px' }}>
                                        <h5 style={{ color: '#a855f7', marginBottom: '10px' }}>Submitted Deliverables</h5>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                            {selectedCase.deliverableContent}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'deliver' && selectedCase && (
                <div className={styles.modalOverlay} onClick={closeModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Deliver Professional Work</h2>
                            <button onClick={closeModal} className={styles.closeBtn}><X size={24} /></button>
                        </div>
                        <form className={styles.initiateForm} onSubmit={handleDeliverSubmit}>
                            <div className={styles.formGroup}>
                                <label>Final Draft / Case Notes</label>
                                <textarea
                                    rows={8}
                                    placeholder="Paste your legal document content or summary here..."
                                    required
                                    value={deliverForm.content}
                                    onChange={(e) => setDeliverForm({ ...deliverForm, content: e.target.value })}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Attached Documents (PDF/DOCX)</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setDeliverForm({ ...deliverForm, files });
                                    }}
                                />
                                <small>Select files to upload as official project deliverables.</small>
                            </div>
                            <button type="submit" className={styles.submitInitiateBtn}>
                                Submit & Verify Delivery
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showTrialModal && (
                <PremiumTryonModal onClose={() => setShowTrialModal(false)} />
            )}
        </div>
    );
};

export default MyCases;
