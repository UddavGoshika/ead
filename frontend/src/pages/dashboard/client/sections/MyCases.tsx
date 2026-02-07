import React, { useEffect, useState } from 'react';
import styles from "./mycases.module.css";
import { caseService } from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";
import { Loader2, MessageSquare, Phone, Briefcase, Filter, FileText, CheckCircle, Clock, Info, X, Upload, Shield } from "lucide-react";
import { useCall } from "../../../../context/CallContext";
import { LOCATION_DATA_RAW } from '../../../../components/layout/statesdis';
import { LEGAL_DOMAINS } from '../../../../data/legalDomainData';
import type { Case } from "../../../../types";
import PremiumTryonModal from "../../shared/PremiumTryonModal";
import axios from 'axios';

interface CasesProps {
    onSelectForChat: (partner: any) => void;
}

const Cases: React.FC<CasesProps> = ({ onSelectForChat }) => {
    const { user } = useAuth();
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const { initiateCall } = useCall();

    const [activeModal, setActiveModal] = useState<'review' | 'docs' | null>(null);
    const [selectedCase, setSelectedCase] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    const [showTrialModal, setShowTrialModal] = useState(false);

    const plan = user?.plan || 'Free';
    const isPremium = user?.isPremium || (plan.toLowerCase() !== 'free' && ['lite', 'pro', 'ultra'].some(p => plan.toLowerCase().includes(p)));

    // Filter States
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('Status');
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [selectedSubDept, setSelectedSubDept] = useState('All');

    const states = Object.keys(LOCATION_DATA_RAW);
    const districts = selectedState ? Object.keys(LOCATION_DATA_RAW[selectedState] || {}) : [];
    const cities = (selectedState && selectedDistrict) ? LOCATION_DATA_RAW[selectedState][selectedDistrict] : [];

    const fetchCases = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (status !== 'Status') params.status = status;
            if (selectedState) params.state = selectedState;
            if (selectedDistrict) params.district = selectedDistrict;
            if (selectedCity) params.city = selectedCity;
            if (selectedDept !== 'All') params.department = selectedDept;
            if (selectedSubDept !== 'All') params.subDepartment = selectedSubDept;

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
    }, []);

    const handleChat = (item: any) => {
        if (!item.advocateId) {
            alert("No advocate assigned to this case yet.");
            return;
        }
        const partner = {
            id: item.advocateId._id,
            userId: item.advocateId._id,
            name: item.advocateId.name,
            unique_id: item.advocateId.unique_id,
            image_url: item.advocateId.image_url,
            role: 'advocate'
        };
        onSelectForChat(partner);
    };

    const handleCall = (item: any) => {
        if (!isPremium) {
            setShowTrialModal(true);
            return;
        }
        const targetId = item.advocateId?._id || item.advocateId;
        if (!targetId) {
            alert("No advocate assigned to this case yet.");
            return;
        }
        initiateCall(String(targetId), 'audio');
    };

    const openReview = (c: any) => {
        setSelectedCase(c);
        setActiveModal('review');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        try {
            const file = e.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            // Upload to backend
            const token = localStorage.getItem('token');
            const res = await axios.post('/api/interactions/upload-document', formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'x-auth-token': token }
            });

            if (res.data.success) {
                const newDoc = { name: docName, url: res.data.fileUrl };
                setSelectedCase((prev: any) => ({
                    ...prev,
                    documents: [...(prev.documents || []), newDoc]
                }));
            }
        } catch (err) {
            alert("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedCase) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch(`/api/cases/${selectedCase._id}/approve`, {
                documents: selectedCase.documents,
                clientNotes: "Documents submitted for review."
            }, {
                headers: { 'x-auth-token': token }
            });

            if (res.data.success) {
                alert("Case request approved and documents submitted!");
                setActiveModal(null);
                fetchCases();
            }
        } catch (err) {
            alert("Approval failed");
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'Case Request Received': return '#38bdf8';
            case 'Client Approved': return '#22c55e';
            case 'In Progress': return '#facc15';
            case 'Open': return '#94a3b8';
            default: return '#f87171';
        }
    };

    if (loading && cases.length === 0) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
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
                        placeholder="Search by Case ID or Title..."
                        className={styles.dashboardSearchInput}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className={styles.searchBtnInside} onClick={fetchCases}>Search</button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', width: '100%' }}>
                    <select className={styles.filterSelect} value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option>Status</option>
                        <option>Case Request Received</option>
                        <option>Client Approved</option>
                        <option>In Progress</option>
                        <option>Closed</option>
                    </select>

                    <select className={styles.filterSelect} value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedDistrict(''); setSelectedCity(''); }}>
                        <option value="">Select State</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select className={styles.filterSelect} value={selectedDept} onChange={(e) => { setSelectedDept(e.target.value); setSelectedSubDept('All'); }}>
                        <option value="All">Department</option>
                        {Object.keys(LEGAL_DOMAINS).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>

                    <button className={styles.submitBtnDashboard} onClick={fetchCases}>
                        <Filter size={16} /> Apply
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
                    <h3>No cases found</h3>
                    <p>Wait for an advocate to initiate a case request.</p>
                </div>
            ) : (
                <div className={styles.gallery}>
                    {cases.map((item: any, idx) => (
                        <div key={item._id || idx} className={styles.premiumCard}>
                            <div className={styles.cardHeader}>
                                <div className={styles.headerInfo}>
                                    <h3>{item.title}</h3>
                                    <span className={styles.caseCode}>{item.caseId}</span>
                                    <div className={styles.statusBadge} style={{ background: `${getStatusColor(item.status)}15`, color: getStatusColor(item.status) }}>
                                        <div className={styles.pulse} style={{ background: getStatusColor(item.status) }}></div>
                                        {item.status}
                                    </div>
                                </div>
                                <div className={styles.advocateSmallProfile}>
                                    <div className={styles.avatarWrapper}>
                                        <img
                                            src={item.advocateId?.image_url || "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg"}
                                            alt="Advocate"
                                        />
                                        <div className={styles.verifiedCheck}><Shield size={10} /></div>
                                    </div>
                                    <div className={styles.nameStack}>
                                        <span className={styles.advName}>{item.advocateId?.name || "Unassigned"}</span>
                                        <span className={styles.advId}>{item.advocateId?.unique_id || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.cardMeta}>
                                <div className={styles.metaItem}>
                                    <Clock size={14} />
                                    <span>Last update: {new Date(item.updatedAt || item.lastUpdate).toLocaleDateString()}</span>
                                </div>
                                <div className={styles.viewDetailsBtn} onClick={() => openReview(item)}>
                                    View Details
                                </div>
                            </div>

                            <div className={styles.cardActions}>
                                <button onClick={() => handleChat(item)} className={styles.premiumChatBtn}>
                                    <MessageSquare size={16} /> Chat
                                </button>
                                <button onClick={() => handleCall(item)} className={styles.premiumCallBtn}>
                                    <Phone size={16} /> Call
                                </button>
                                <button onClick={() => openReview(item)} className={styles.premiumDocsBtn}>
                                    <FileText size={16} /> Docs
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* REVIEW MODAL */}
            {activeModal === 'review' && selectedCase && (
                <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>Case Request Review</h2>
                            <button className={styles.closeBtn} onClick={() => setActiveModal(null)}><X /></button>
                        </div>

                        <div className={styles.reviewBody}>
                            <section className={styles.reviewSection}>
                                <h4>Case Information</h4>
                                <div className={styles.infoRow}>
                                    <span>Title:</span>
                                    <strong>{selectedCase.title}</strong>
                                </div>
                                <div className={styles.infoRow}>
                                    <span>Category:</span>
                                    <strong>{selectedCase.category}</strong>
                                </div>
                                <div className={styles.infoRow}>
                                    <span>Description:</span>
                                    <p>{selectedCase.description}</p>
                                </div>
                            </section>

                            <section className={styles.reviewSection}>
                                <h4>Advocate's Notes</h4>
                                <p className={styles.advNotes}>{selectedCase.advocateNotes || "No notes provided."}</p> section
                            </section>

                            <section className={styles.reviewSection}>
                                <h4>Required Documents</h4>
                                <div className={styles.docGrid}>
                                    {selectedCase.requestedDocuments?.map((doc: string, i: number) => {
                                        const uploaded = selectedCase.documents?.find((d: any) => d.name === doc);
                                        return (
                                            <div key={i} className={styles.docItem}>
                                                <div className={styles.docInfo}>
                                                    <span className={styles.docName}>{doc}</span>
                                                    {uploaded ? (
                                                        <span className={styles.uploadedLabel}><CheckCircle size={14} /> Uploaded</span>
                                                    ) : (
                                                        <span className={styles.pendingLabel}><Clock size={14} /> Pending</span>
                                                    )}
                                                </div>
                                                <div className={styles.docAction}>
                                                    {uploaded ? (
                                                        <a href={uploaded.url} target="_blank" rel="noreferrer" className={styles.viewDocBtn}>View</a>
                                                    ) : (
                                                        <label className={styles.uploadDocBtn}>
                                                            <Upload size={14} /> {uploading ? "..." : "Upload"}
                                                            <input type="file" hidden onChange={(e) => handleFileUpload(e, doc)} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!selectedCase.requestedDocuments || selectedCase.requestedDocuments.length === 0) && (
                                        <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No specifically requested documents.</p>
                                    )}
                                </div>
                            </section>

                            {selectedCase.status === 'Case Request Received' && (
                                <div className={styles.confirmSection}>
                                    <p className={styles.confirmNote}>By clicking confirm, you agree to initiate this case with the assigned advocate and submit the uploaded documents.</p>
                                    <button
                                        className={styles.approveBtn}
                                        onClick={handleApprove}
                                        disabled={selectedCase.requestedDocuments?.length > (selectedCase.documents?.length || 0)}
                                    >
                                        Send / Confirm Case Initiation
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showTrialModal && (
                <PremiumTryonModal onClose={() => setShowTrialModal(false)} />
            )}
        </div>
    );
};

export default Cases;
