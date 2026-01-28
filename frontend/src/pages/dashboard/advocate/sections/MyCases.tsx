import React, { useState } from 'react';
import styles from "./mycases.module.css";
import { X, Phone, FileText } from "lucide-react";

const initialCases = [
    {
        title: "Property Dispute in Mumbai",
        caseId: "CASE-001",
        status: "In Progress",
        lastUpdate: "2 days ago",
        clientName: "Samantha",
        clientCode: "CLI-9901",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400"
    },
    {
        title: "Contract Breach Litigation",
        caseId: "CASE-002",
        status: "Awaiting Documents",
        lastUpdate: "5 days ago",
        clientName: "Ben",
        clientCode: "CLI-9902",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
    },
];

const MyCases: React.FC = () => {
    const [cases] = useState(initialCases);
    const [activeModal, setActiveModal] = useState<'chat' | 'call' | 'docs' | 'details' | null>(null);
    const [selectedCase, setSelectedCase] = useState<any>(null);

    const openModal = (type: 'chat' | 'call' | 'docs' | 'details', caseItem: any) => {
        setSelectedCase(caseItem);
        setActiveModal(type);
    };

    const closeModal = () => {
        setActiveModal(null);
        setSelectedCase(null);
    };

    const renderModal = () => {
        if (!activeModal || !selectedCase) return null;

        return (
            <div className={styles.modalOverlay} onClick={closeModal}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                    <button className={styles.closeBtn} onClick={closeModal}><X size={24} /></button>

                    {activeModal === 'chat' && (
                        <div>
                            <h2>Chat with {selectedCase.clientName}</h2>
                            <div style={{ background: 'rgba(0,0,0,0.2)', height: '200px', borderRadius: '8px', margin: '20px 0', padding: '15px' }}>
                                <p style={{ color: '#94a3b8' }}>Starting chat session for {selectedCase.caseId}...</p>
                            </div>
                            <button className={styles.submitBtnDashboard} style={{ width: '100%' }}>Open Messenger</button>
                        </div>
                    )}

                    {activeModal === 'call' && (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', background: 'rgba(250, 204, 21, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <Phone size={40} color="#facc15" />
                            </div>
                            <h2>Voice Call</h2>
                            <p style={{ color: '#94a3b8', margin: '10px 0 20px' }}>Connecting you to {selectedCase.clientName} regarding {selectedCase.title}</p>
                            <button className={styles.submitBtnDashboard}>Call Now</button>
                        </div>
                    )}

                    {activeModal === 'docs' && (
                        <div>
                            <h2>Case Documents</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <span>Property_Deed.pdf</span>
                                    <FileText size={18} color="#facc15" />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    <span>ID_Identity_Proof.jpg</span>
                                    <FileText size={18} color="#facc15" />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeModal === 'details' && (
                        <div>
                            <h2>{selectedCase.title}</h2>
                            <p style={{ color: '#facc15', margin: '5px 0 20px' }}>{selectedCase.caseId}</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', color: '#64748b', fontSize: '12px' }}>Client</label>
                                    <span>{selectedCase.clientName}</span>
                                </div>
                                <div>
                                    <label style={{ display: 'block', color: '#64748b', fontSize: '12px' }}>Status</label>
                                    <span>{selectedCase.status}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                    <input
                        type="text"
                        placeholder="Search by Case ID or Client......"
                        className={styles.dashboardSearchInput}
                    />
                    <button className={styles.searchBtnInside}>Search</button>
                </div>

                <select className={styles.filterSelect}><option>All Members</option></select>
                <select className={styles.filterSelect}><option>Active Status</option></select>
                <select className={styles.filterSelect}><option>Select City</option></select>
                <button className={styles.submitBtnDashboard}>Filter</button>
            </div>

            {cases.map((item, idx) => (
                <div key={idx} className={styles.card}>
                    <div className={styles.left}>
                        <h2>{item.title}</h2>
                        <p className={styles.caseId}>{item.caseId}</p>
                        <span className={styles.status}>{item.status}</span>
                        <p className={styles.update}>Last update: {item.lastUpdate}</p>
                        <div className={styles.actions}>
                            <button onClick={() => openModal('chat', item)}>Chat</button>
                            <button onClick={() => openModal('call', item)}>Call</button>
                            <button onClick={() => openModal('docs', item)}>Docs</button>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.avatar}>
                            <img src={item.image} alt={item.clientName} />
                        </div>
                        <div className={styles.profile}>
                            <strong>{item.clientName}</strong>
                            <div className={styles.code}>🛡️ {item.clientCode}</div>
                        </div>
                        <span className={styles.view} onClick={() => openModal('details', item)}>View Details</span>
                    </div>
                </div>
            ))}

            {renderModal()}
        </div>
    );
};

export default MyCases;
