
import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from '../StaffGlobalDashboard.module.css';
import {
    Phone, CheckCircle, Clock,
    Search, Mic, PhoneOff, MicOff, Inbox,
    Activity, Shield, Save,
    Calendar, User, MapPin, Tag,
    Smartphone, X, Info, List, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { staffService } from '../../../services/api';
import { WebRTCService } from '../../../services/WebRTCService';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

interface Lead {
    _id: string;
    clientName: string;
    clientMobile: string;
    clientCity: string;
    category: string;
    problem: string;
    leadStatus: string;
    qualityUrgency: string;
    notes?: string;
    targetUserId?: string | null;
    lastContact?: string;
    nextFollowUp?: string;
    source?: string;
    email?: string;
    unique_id?: string;
}

const TelecallerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activeLead, setActiveLead] = useState<Lead | null>(null);
    const [stats, setStats] = useState({ totalLeads: 0, callsToday: 0, pending: 0, converted: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // --- DATA CONNECTION LOGIC ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leadsRes, membersRes, statsRes] = await Promise.all([
                staffService.getMyLeads(),
                staffService.getAllMembers(),
                staffService.getPerformance()
            ]);

            const realLeads = leadsRes.data.success ? leadsRes.data.leads : [];
            const realMembers = membersRes.data.success ? membersRes.data.members : [];

            // MOCK INJECTION
            const mockLead: Lead = {
                _id: 'MOCK-CRM-ALICE',
                clientName: 'Alice Johnson (Mock Lead)',
                clientMobile: '+91 9988776655',
                clientCity: 'Delhi',
                email: 'alice@test.com',
                unique_id: 'CAD-8821',
                category: 'Cyber Law',
                problem: 'Need consultation regarding online banking fraud investigation.',
                leadStatus: 'Follow Up',
                qualityUrgency: 'High',
                lastContact: 'Yesterday',
                nextFollowUp: '2026-02-15',
                source: 'Inbound Inquiry'
            };

            const memberLeads = realMembers.map((m: any) => ({
                _id: m._id,
                clientName: m.name,
                clientMobile: m.mobile || 'N/A',
                clientCity: m.location || 'N/A',
                email: m.email || 'N/A',
                unique_id: m.unique_id || 'ID-' + m._id.slice(-6),
                category: m.role || 'Member',
                problem: 'Awaiting verification / Onboarding follow-up',
                leadStatus: m.isVerified ? 'Converted' : 'New',
                qualityUrgency: 'Medium',
                source: 'Member Directory',
                lastContact: 'Never',
                nextFollowUp: 'TBD'
            }));

            const finalLeads = [mockLead, ...realLeads, ...memberLeads].map(l => ({
                ...l,
                email: l.email || 'N/A',
                unique_id: l.unique_id || 'ID-' + l._id.slice(-6)
            }));

            setLeads(finalLeads);

            setStats({
                totalLeads: finalLeads.length,
                callsToday: statsRes.data.stats?.callsToday || 0,
                pending: finalLeads.filter(l => l.leadStatus !== 'Converted').length,
                converted: finalLeads.filter(l => l.leadStatus === 'Converted').length
            });
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const [isInCall, setIsInCall] = useState(false);
    const [callDuration, setCallDuration] = useState(0);
    const rtcRef = useRef<WebRTCService | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement>(null);

    const handleStartCall = async (lead: Lead) => {
        if (lead._id === 'MOCK-CRM-ALICE') {
            setIsInCall(true);
            return;
        }
        try {
            rtcRef.current = new WebRTCService();
            await rtcRef.current.startLocalStream(false);
            const callId = await rtcRef.current.createCall(lead.targetUserId || lead._id, user?.name || 'Staff', 'voice');
            onSnapshot(doc(db, 'calls', callId), (s) => { if (!s.exists()) setIsInCall(false); });
            setIsInCall(true);
        } catch (err) { alert("Call Sync Error"); }
    };

    const formatDuration = (s: number) => {
        const m = Math.floor(s / 60);
        const rs = s % 60;
        return `${m}:${rs < 10 ? '0' : ''}${rs}`;
    };

    const filteredLeads = useMemo(() => {
        return leads.filter(l => l.clientName?.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [leads, searchTerm]);

    return (
        <div className={styles.fullDashboardArea}>
            <div className={styles.statsRow}>
                <div className={styles.statCard}><div className={styles.statIcon}><List size={24} /></div><div className={styles.statInfo}><label>Total Portfolio</label><span>{stats.totalLeads}</span></div></div>
                <div className={styles.statCard}><div className={styles.statIcon}><Phone size={24} /></div><div className={styles.statInfo}><label>Agent Activity</label><span>{stats.callsToday} Calls</span></div></div>
                <div className={styles.statCard}><div className={styles.statIcon}><Clock size={24} /></div><div className={styles.statInfo}><label>Pending CRM</label><span>{stats.pending}</span></div></div>
                <div className={styles.statCard}><div className={styles.statIcon}><CheckCircle size={24} /></div><div className={styles.statInfo}><label>Total Conversions</label><span>{stats.converted}</span></div></div>
            </div>

            <div className={styles.leadsContainer}>
                <div className={styles.boxHeader}><div className={styles.searchBarLead}><Search size={18} /><input placeholder="Filter leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>
                <div className={styles.tableWrapper}>
                    <table className={styles.modernTable}>
                        <thead><tr><th>Name / ID</th><th>Phone / Email</th><th>Status</th><th>Source</th><th>Next Follow-up</th><th>Action</th></tr></thead>
                        <tbody>
                            {filteredLeads.map(lead => (
                                <tr key={lead._id}>
                                    <td>
                                        <div className={styles.leadCell}>
                                            <strong style={{ display: 'block' }}>{lead.clientName}</strong>
                                            <span style={{ fontSize: '10px', color: '#64748b' }}>{lead.unique_id}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.leadCell}>
                                            <span style={{ display: 'block' }}>{lead.clientMobile}</span>
                                            <span style={{ fontSize: '10px', color: '#64748b' }}>{lead.email}</span>
                                        </div>
                                    </td>
                                    <td><span className={`${styles.statusBadge} ${styles[lead.leadStatus.toLowerCase().replace(' ', '')] || styles.new}`}>{lead.leadStatus}</span></td>
                                    <td>{lead.source}</td>
                                    <td>{lead.nextFollowUp}</td>
                                    <td>
                                        <div className={styles.actionGroup}>
                                            <button className={styles.miniCallBtn} onClick={() => handleStartCall(lead)}><Phone size={14} /></button>
                                            <button className={styles.miniDetailBtn} onClick={() => { setActiveLead(lead); setIsDetailOpen(true); }}><Info size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {isDetailOpen && activeLead && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.detailBackdrop} onClick={() => setIsDetailOpen(false)} />
                        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className={styles.leadDetailDrawer}>
                            <div className={styles.drawerHeader}><div><h2>INTELLIGENCE FEED</h2><p>{activeLead.unique_id}</p></div><button className={styles.closeDrawer} onClick={() => setIsDetailOpen(false)}><X size={20} /></button></div>
                            <div className={styles.drawerContent}>
                                <div className={styles.profileSectionMini}>
                                    <div className={styles.avatarLarge}>{activeLead.clientName.charAt(0)}</div>
                                    <div className={styles.profileMeta}>
                                        <h3>{activeLead.clientName}</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Smartphone size={12} /> {activeLead.clientMobile}</p>
                                            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={12} /> {activeLead.email}</p>
                                            <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={12} /> {activeLead.clientCity || 'Location N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.drawerGrid}>
                                    <div className={styles.drawerField}><label>Source</label><div className={styles.sourceTag}><Tag size={12} /> {activeLead.source}</div></div>
                                    <div className={styles.drawerFieldFull}><label>Category</label><div className={styles.sourceTag}>{activeLead.category}</div></div>
                                    <div className={styles.drawerFieldFull} style={{ gridColumn: 'span 2' }}><label>Client Narrative</label><div className={styles.sourceTag} style={{ minHeight: '60px' }}>{activeLead.problem}</div></div>
                                    <div className={styles.drawerFieldFull} style={{ gridColumn: 'span 2' }}>
                                        <label>Operational logs</label>
                                        <div className={styles.historyItem}><div className={styles.hLine} /><span>Terminal Session {String(user?.id || '').slice(-4)}</span><p>Real-time telemetry active for {activeLead.clientName}</p></div>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.drawerFooter}><button className={styles.drawerCallBtn} onClick={() => handleStartCall(activeLead)}><Phone size={18} /> INITIATE CALL</button></div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isInCall && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.ultraPremiumOverlay}>
                        <div className={styles.activeCallPanel}>
                            <div className={styles.callIdentity}>
                                <div className={styles.largeAvatar}>{activeLead?.clientName?.charAt(0)}</div>
                                <h2>{activeLead?.clientName}</h2>
                                <p><Smartphone size={14} /> {activeLead?.clientMobile} • <Mail size={14} /> {activeLead?.email}</p>
                            </div>
                            <div className={styles.durationBadge}>{formatDuration(callDuration)}</div>
                            <button className={styles.hangupPremium} onClick={() => setIsInCall(false)}><PhoneOff size={32} /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TelecallerDashboard;
